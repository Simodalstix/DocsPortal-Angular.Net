# SQL Database Module - Application database with security best practices
# This module creates an Azure SQL Server and Database with modern security configurations

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

# Data source for current client configuration
data "azurerm_client_config" "current" {}

# SQL Server with Azure AD authentication
resource "azurerm_mssql_server" "main" {
  name                         = var.server_name
  resource_group_name          = var.resource_group_name
  location                     = var.location
  version                      = "12.0"
  administrator_login          = var.admin_username
  administrator_login_password = var.admin_password

  # Modern security configurations
  minimum_tls_version                  = "1.2"
  public_network_access_enabled        = false
  outbound_network_restriction_enabled = false

  # Azure AD authentication
  azuread_administrator {
    login_username = data.azurerm_client_config.current.object_id
    object_id      = data.azurerm_client_config.current.object_id
    tenant_id      = data.azurerm_client_config.current.tenant_id
  }

  # Identity for managed authentication
  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
}

# SQL Database
resource "azurerm_mssql_database" "main" {
  name           = var.database_name
  server_id      = azurerm_mssql_server.main.id
  collation      = "SQL_Latin1_General_CP1_CI_AS"
  license_type   = "LicenseIncluded"
  sku_name       = var.sku_name
  zone_redundant = false

  # Backup configuration
  short_term_retention_policy {
    retention_days = 7
  }

  long_term_retention_policy {
    weekly_retention  = "P1W"
    monthly_retention = "P1M"
    yearly_retention  = "P1Y"
    week_of_year      = 1
  }

  tags = var.tags
}

# Private endpoint for secure database access
resource "azurerm_private_endpoint" "sql" {
  name                = "pe-${var.server_name}"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.subnet_id

  private_service_connection {
    name                           = "psc-${var.server_name}"
    private_connection_resource_id = azurerm_mssql_server.main.id
    subresource_names              = ["sqlServer"]
    is_manual_connection           = false
  }

  tags = var.tags
}

# Firewall rules for allowed IP ranges
resource "azurerm_mssql_firewall_rule" "allowed_ips" {
  count = length(var.allowed_ip_ranges)

  name             = "AllowedIP-${count.index}"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = split("/", var.allowed_ip_ranges[count.index])[0]
  end_ip_address   = split("/", var.allowed_ip_ranges[count.index])[0]
}

# Allow Azure services access
resource "azurerm_mssql_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Transparent Data Encryption
resource "azurerm_mssql_database_transparent_data_encryption" "main" {
  database_id = azurerm_mssql_database.main.id
}

# SQL Server auditing
resource "azurerm_mssql_server_extended_auditing_policy" "main" {
  server_id                  = azurerm_mssql_server.main.id
  storage_endpoint           = var.audit_storage_endpoint
  storage_account_access_key = var.audit_storage_access_key
  retention_in_days          = 90

  depends_on = [azurerm_mssql_server.main]
}

# Database threat detection
resource "azurerm_mssql_server_security_alert_policy" "main" {
  resource_group_name = var.resource_group_name
  server_name         = azurerm_mssql_server.main.name
  state               = "Enabled"

  email_account_admins = true
  email_addresses      = var.security_alert_emails

  retention_days = 30
}

# Vulnerability assessment
resource "azurerm_mssql_server_vulnerability_assessment" "main" {
  count = var.enable_vulnerability_assessment ? 1 : 0

  server_security_alert_policy_id = azurerm_mssql_server_security_alert_policy.main.id
  storage_container_path          = "${var.audit_storage_endpoint}vulnerability-assessment/"
  storage_account_access_key      = var.audit_storage_access_key

  recurring_scans {
    enabled                   = true
    email_subscription_admins = true
    emails                    = var.security_alert_emails
  }
}
