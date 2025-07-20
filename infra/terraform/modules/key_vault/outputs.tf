# Key Vault Module Outputs

output "key_vault_id" {
  description = "ID of the Key Vault"
  value       = azurerm_key_vault.main.id
}

output "key_vault_name" {
  description = "Name of the Key Vault"
  value       = azurerm_key_vault.main.name
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}

output "sql_admin_password_secret_id" {
  description = "ID of the SQL admin password secret"
  value       = azurerm_key_vault_secret.sql_admin_password.id
}

output "sql_admin_password" {
  description = "Generated SQL admin password"
  value       = random_password.sql_admin.result
  sensitive   = true
}
