# Output values for SmartDocs Portal Infrastructure

# Resource Group
output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Location of the resource group"
  value       = azurerm_resource_group.main.location
}

# Networking
output "vnet_id" {
  description = "ID of the virtual network"
  value       = azurerm_virtual_network.main.id
}

output "vnet_name" {
  description = "Name of the virtual network"
  value       = azurerm_virtual_network.main.name
}

output "subnet_ids" {
  description = "Map of subnet names to their IDs"
  value = {
    for k, v in azurerm_subnet.main : k => v.id
  }
}

# App Services
output "app_service_plan_id" {
  description = "ID of the App Service Plan"
  value       = module.app_service.app_service_plan_id
}

output "backend_app_service_url" {
  description = "URL of the backend App Service"
  value       = module.app_service.backend_app_service_url
}

output "frontend_app_service_url" {
  description = "URL of the frontend App Service"
  value       = module.app_service.frontend_app_service_url
}

# Database
output "sql_server_fqdn" {
  description = "Fully qualified domain name of the SQL Server"
  value       = module.sql_database.sql_server_fqdn
}

output "sql_database_name" {
  description = "Name of the SQL Database"
  value       = module.sql_database.database_name
}

# Storage
output "storage_account_name" {
  description = "Name of the storage account"
  value       = module.storage_account.storage_account_name
}

output "storage_account_primary_endpoint" {
  description = "Primary blob endpoint of the storage account"
  value       = module.storage_account.primary_blob_endpoint
}

output "documents_container_name" {
  description = "Name of the documents container"
  value       = module.storage_account.documents_container_name
}

# Key Vault
output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = module.key_vault.key_vault_uri
}

output "key_vault_name" {
  description = "Name of the Key Vault"
  value       = module.key_vault.key_vault_name
}

# CDN (if enabled)
output "cdn_endpoint_url" {
  description = "URL of the CDN endpoint"
  value       = var.enable_cdn ? module.cdn_frontdoor[0].endpoint_url : null
}

output "cdn_profile_name" {
  description = "Name of the CDN profile"
  value       = var.enable_cdn ? module.cdn_frontdoor[0].profile_name : null
}

# Monitoring (if enabled)
output "application_insights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = var.enable_monitoring ? azurerm_application_insights.main[0].instrumentation_key : null
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Application Insights connection string"
  value       = var.enable_monitoring ? azurerm_application_insights.main[0].connection_string : null
  sensitive   = true
}

output "log_analytics_workspace_id" {
  description = "Log Analytics workspace ID"
  value       = var.enable_monitoring ? azurerm_log_analytics_workspace.main[0].id : null
}

# Connection Strings (for application configuration)
output "database_connection_string" {
  description = "Database connection string template"
  value       = "Server=${module.sql_database.sql_server_fqdn};Database=${module.sql_database.database_name};Authentication=Active Directory Default;"
  sensitive   = true
}

output "storage_connection_string" {
  description = "Storage account connection string"
  value       = module.storage_account.connection_string
  sensitive   = true
}

# Environment Information
output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "project_name" {
  description = "Project name"
  value       = var.project_name
}

# Resource naming convention examples
output "resource_naming_examples" {
  description = "Examples of resource naming convention used"
  value = {
    resource_group = azurerm_resource_group.main.name
    app_service    = "app-${var.project_name}-${var.environment}"
    storage        = "sa${var.project_name}${var.environment}"
    key_vault      = "kv-${var.project_name}-${var.environment}"
    sql_server     = "sql-${var.project_name}-${var.environment}"
  }
}
