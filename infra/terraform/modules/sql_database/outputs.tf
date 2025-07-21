# SQL Database Module Outputs

output "sql_server_id" {
  description = "ID of the SQL Server"
  value       = azurerm_mssql_server.main.id
}

output "sql_server_name" {
  description = "Name of the SQL Server"
  value       = azurerm_mssql_server.main.name
}

output "sql_server_fqdn" {
  description = "Fully qualified domain name of the SQL Server"
  value       = azurerm_mssql_server.main.fully_qualified_domain_name
}

output "database_id" {
  description = "ID of the SQL Database"
  value       = azurerm_mssql_database.main.id
}

output "database_name" {
  description = "Name of the SQL Database"
  value       = azurerm_mssql_database.main.name
}

output "private_endpoint_id" {
  description = "ID of the private endpoint"
  value       = azurerm_private_endpoint.sql.id
}

output "private_endpoint_ip" {
  description = "Private IP address of the SQL Server"
  value       = azurerm_private_endpoint.sql.private_service_connection[0].private_ip_address
}

output "connection_string_template" {
  description = "Connection string template for applications"
  value       = "Server=${azurerm_mssql_server.main.fully_qualified_domain_name};Database=${azurerm_mssql_database.main.name};Authentication=Active Directory Default;"
}

output "server_identity_principal_id" {
  description = "Principal ID of the SQL Server managed identity"
  value       = azurerm_mssql_server.main.identity[0].principal_id
}

output "server_identity_tenant_id" {
  description = "Tenant ID of the SQL Server managed identity"
  value       = azurerm_mssql_server.main.identity[0].tenant_id
}
