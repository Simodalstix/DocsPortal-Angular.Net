# Storage Account Module - Document and static file storage
# This module creates an Azure Storage Account with containers and security configurations

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

# Storage Account for documents and static files
resource "azurerm_storage_account" "main" {
  name                     = var.name
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = var.account_tier
  account_replication_type = var.account_replication_type
  account_kind             = "StorageV2"

  # Security configurations
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
  shared_access_key_enabled       = true

  # Enable advanced threat protection
  https_traffic_only_enabled = true

  # Blob properties for better performance and security
  blob_properties {
    versioning_enabled            = true
    change_feed_enabled           = true
    change_feed_retention_in_days = 7

    delete_retention_policy {
      days = 7
    }

    container_delete_retention_policy {
      days = 7
    }
  }

  # Network access restrictions
  network_rules {
    default_action             = "Deny"
    bypass                     = ["AzureServices"]
    ip_rules                   = var.allowed_ip_ranges
    virtual_network_subnet_ids = var.subnet_ids
  }

  tags = var.tags
}

# Container for document storage
resource "azurerm_storage_container" "documents" {
  name                  = "documents"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Container for static web content
resource "azurerm_storage_container" "static_content" {
  name                  = "static-content"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "blob"
}

# Container for application logs
resource "azurerm_storage_container" "logs" {
  name                  = "logs"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Backup configuration (if enabled)
resource "azurerm_backup_policy_file_share" "main" {
  count = var.enable_backup ? 1 : 0

  name                = "backup-policy-${var.name}"
  resource_group_name = var.resource_group_name
  recovery_vault_name = var.recovery_vault_name

  backup {
    frequency = "Daily"
    time      = "23:00"
  }

  retention_daily {
    count = 30
  }

  retention_weekly {
    count    = 12
    weekdays = ["Sunday"]
  }

  retention_monthly {
    count    = 12
    weekdays = ["Sunday"]
    weeks    = ["First"]
  }
}

# Storage Account static website configuration (for frontend hosting)
resource "azurerm_storage_account_static_website" "main" {
  storage_account_id = azurerm_storage_account.main.id
  index_document     = "index.html"
  error_404_document = "404.html"
}
