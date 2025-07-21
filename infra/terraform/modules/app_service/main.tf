# App Service Module - Web application hosting for .NET API and Angular frontend
# This module creates Azure App Services with modern configurations and security

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "asp-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "${var.sku_tier}_${var.sku_size}"

  tags = var.tags
}

# App Service for .NET Backend API
resource "azurerm_linux_web_app" "backend" {
  name                = "app-${var.name_prefix}-api"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.main.id

  # Modern security configurations
  https_only                    = true
  public_network_access_enabled = true

  # Identity for managed authentication
  identity {
    type = "SystemAssigned"
  }

  site_config {
    minimum_tls_version = "1.2"
    ftps_state          = "Disabled"

    # .NET 8 runtime
    application_stack {
      dotnet_version = "8.0"
    }

    # Health check configuration
    health_check_path                 = "/health"
    health_check_eviction_time_in_min = 2

    # CORS configuration for frontend
    cors {
      allowed_origins     = ["https://app-${var.name_prefix}-web.azurewebsites.net"]
      support_credentials = true
    }
  }

  # Application settings
  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE"     = "false"
    "DOCKER_REGISTRY_SERVER_URL"              = "https://index.docker.io"
    "ASPNETCORE_ENVIRONMENT"                  = var.environment
    "ApplicationInsights__InstrumentationKey" = var.application_insights_key
    "KeyVault__VaultUri"                      = var.key_vault_uri
  }

  # Connection strings
  connection_string {
    name  = "DefaultConnection"
    type  = "SQLAzure"
    value = var.database_connection_string
  }

  connection_string {
    name  = "StorageConnection"
    type  = "Custom"
    value = var.storage_connection_string
  }

  # Logging configuration
  logs {
    detailed_error_messages = true
    failed_request_tracing  = true

    application_logs {
      file_system_level = "Information"
    }

    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 35
      }
    }
  }

  tags = var.tags
}

# App Service for Angular Frontend
resource "azurerm_linux_web_app" "frontend" {
  name                = "app-${var.name_prefix}-web"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.main.id

  # Modern security configurations
  https_only                    = true
  public_network_access_enabled = true

  # Identity for managed authentication
  identity {
    type = "SystemAssigned"
  }

  site_config {
    minimum_tls_version = "1.2"
    ftps_state          = "Disabled"

    # Node.js runtime for Angular
    application_stack {
      node_version = "18-lts"
    }

    # Default documents
    default_documents = ["index.html"]
  }

  # Application settings for Angular
  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "WEBSITE_NODE_DEFAULT_VERSION"        = "18.17.0"
    "API_BASE_URL"                        = "https://app-${var.name_prefix}-api.azurewebsites.net"
    "APPLICATION_INSIGHTS_KEY"            = var.application_insights_key
  }

  # Logging configuration
  logs {
    detailed_error_messages = true
    failed_request_tracing  = true

    application_logs {
      file_system_level = "Information"
    }

    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 35
      }
    }
  }

  tags = var.tags
}

# Virtual Network Integration for backend
resource "azurerm_app_service_virtual_network_swift_connection" "backend" {
  app_service_id = azurerm_linux_web_app.backend.id
  subnet_id      = var.subnet_id
}

# Virtual Network Integration for frontend
resource "azurerm_app_service_virtual_network_swift_connection" "frontend" {
  app_service_id = azurerm_linux_web_app.frontend.id
  subnet_id      = var.subnet_id
}

# Custom domain and SSL (optional)
resource "azurerm_app_service_custom_hostname_binding" "backend" {
  count = var.custom_domain_backend != null ? 1 : 0

  hostname            = var.custom_domain_backend
  app_service_name    = azurerm_linux_web_app.backend.name
  resource_group_name = var.resource_group_name
}

resource "azurerm_app_service_custom_hostname_binding" "frontend" {
  count = var.custom_domain_frontend != null ? 1 : 0

  hostname            = var.custom_domain_frontend
  app_service_name    = azurerm_linux_web_app.frontend.name
  resource_group_name = var.resource_group_name
}

# Deployment slots for staging (production feature)
resource "azurerm_linux_web_app_slot" "backend_staging" {
  count = var.enable_staging_slots ? 1 : 0

  name           = "staging"
  app_service_id = azurerm_linux_web_app.backend.id

  site_config {
    minimum_tls_version = "1.2"
    ftps_state          = "Disabled"

    application_stack {
      dotnet_version = "8.0"
    }
  }

  app_settings = azurerm_linux_web_app.backend.app_settings

  tags = var.tags
}

resource "azurerm_linux_web_app_slot" "frontend_staging" {
  count = var.enable_staging_slots ? 1 : 0

  name           = "staging"
  app_service_id = azurerm_linux_web_app.frontend.id

  site_config {
    minimum_tls_version = "1.2"
    ftps_state          = "Disabled"

    application_stack {
      node_version = "18-lts"
    }
  }

  app_settings = azurerm_linux_web_app.frontend.app_settings

  tags = var.tags
}
