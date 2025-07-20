# Key Vault Module - Secure secrets and certificate management
# This module creates an Azure Key Vault with network restrictions and access policies

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

# Data source for current client configuration
data "azurerm_client_config" "current" {}

# Key Vault for secure secrets management
resource "azurerm_key_vault" "main" {
  name                = var.name
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = var.tenant_id
  sku_name            = "standard"

  # Enable advanced security features
  enabled_for_disk_encryption     = true
  enabled_for_deployment          = true
  enabled_for_template_deployment = true
  purge_protection_enabled        = false # Set to true in production
  soft_delete_retention_days      = 7

  # Network access restrictions
  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"

    # Allow access from specified IP ranges
    ip_rules = var.allowed_ip_ranges

    # Allow access from specified subnets
    virtual_network_subnet_ids = var.subnet_id != null ? [var.subnet_id] : []
  }

  tags = var.tags
}

# Access policy for the current user/service principal
resource "azurerm_key_vault_access_policy" "current_user" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = var.tenant_id
  object_id    = data.azurerm_client_config.current.object_id

  key_permissions = [
    "Get", "List", "Update", "Create", "Import", "Delete", "Recover", "Backup", "Restore"
  ]

  secret_permissions = [
    "Get", "List", "Set", "Delete", "Recover", "Backup", "Restore"
  ]

  certificate_permissions = [
    "Get", "List", "Update", "Create", "Import", "Delete", "Recover", "Backup", "Restore",
    "ManageContacts", "ManageIssuers", "GetIssuers", "ListIssuers", "SetIssuers", "DeleteIssuers"
  ]
}

# Store SQL admin password as a secret
resource "azurerm_key_vault_secret" "sql_admin_password" {
  name         = "sql-admin-password"
  value        = random_password.sql_admin.result
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.current_user]

  tags = var.tags
}

# Generate random password for SQL admin
resource "random_password" "sql_admin" {
  length  = 16
  special = true
  upper   = true
  lower   = true
  numeric = true
}

# Store storage account connection string
resource "azurerm_key_vault_secret" "storage_connection_string" {
  count = var.storage_connection_string != null ? 1 : 0

  name         = "storage-connection-string"
  value        = var.storage_connection_string
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.current_user]

  tags = var.tags
}

# Store application insights instrumentation key
resource "azurerm_key_vault_secret" "app_insights_key" {
  count = var.application_insights_key != null && var.application_insights_key != "" ? 1 : 0

  name         = "application-insights-key"
  value        = var.application_insights_key
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.current_user]

  tags = var.tags
}
