# Storage Account Module Outputs

output "storage_account_id" {
  description = "ID of the storage account"
  value       = azurerm_storage_account.main.id
}

output "storage_account_name" {
  description = "Name of the storage account"
  value       = azurerm_storage_account.main.name
}

output "primary_blob_endpoint" {
  description = "Primary blob endpoint of the storage account"
  value       = azurerm_storage_account.main.primary_blob_endpoint
}

output "primary_blob_hostname" {
  description = "Primary blob hostname of the storage account"
  value       = replace(azurerm_storage_account.main.primary_blob_endpoint, "https://", "")
}

output "static_website_url" {
  description = "Static website URL"
  value       = azurerm_storage_account_static_website.main.primary_web_endpoint
}

output "connection_string" {
  description = "Storage account connection string"
  value       = azurerm_storage_account.main.primary_connection_string
  sensitive   = true
}

output "primary_access_key" {
  description = "Primary access key for the storage account"
  value       = azurerm_storage_account.main.primary_access_key
  sensitive   = true
}

output "documents_container_name" {
  description = "Name of the documents container"
  value       = azurerm_storage_container.documents.name
}

output "static_content_container_name" {
  description = "Name of the static content container"
  value       = azurerm_storage_container.static_content.name
}

output "logs_container_name" {
  description = "Name of the logs container"
  value       = azurerm_storage_container.logs.name
}
