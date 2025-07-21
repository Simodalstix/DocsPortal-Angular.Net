# SQL Database Module Variables

variable "server_name" {
  description = "Name of the SQL Server"
  type        = string
}

variable "database_name" {
  description = "Name of the SQL Database"
  type        = string
}

variable "location" {
  description = "Azure region for the SQL Server and Database"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "admin_username" {
  description = "SQL Server administrator username"
  type        = string
  default     = "sqladmin"
}

variable "admin_password" {
  description = "SQL Server administrator password"
  type        = string
  sensitive   = true
}

variable "sku_name" {
  description = "SQL Database SKU name"
  type        = string
  default     = "Basic"

  validation {
    condition = contains([
      "Basic", "S0", "S1", "S2", "S3", "S4", "S6", "S7", "S9", "S12",
      "P1", "P2", "P4", "P6", "P11", "P15",
      "GP_Gen5_2", "GP_Gen5_4", "GP_Gen5_8", "GP_Gen5_16", "GP_Gen5_32",
      "BC_Gen5_2", "BC_Gen5_4", "BC_Gen5_8", "BC_Gen5_16", "BC_Gen5_32"
    ], var.sku_name)
    error_message = "SKU name must be a valid Azure SQL Database SKU."
  }
}

variable "subnet_id" {
  description = "Subnet ID for private endpoint"
  type        = string
}

variable "allowed_ip_ranges" {
  description = "List of IP ranges allowed to access the SQL Server"
  type        = list(string)
  default     = []
}

variable "audit_storage_endpoint" {
  description = "Storage endpoint for SQL auditing"
  type        = string
  default     = null
}

variable "audit_storage_access_key" {
  description = "Storage access key for SQL auditing"
  type        = string
  default     = null
  sensitive   = true
}

variable "security_alert_emails" {
  description = "List of email addresses for security alerts"
  type        = list(string)
  default     = []
}

variable "enable_vulnerability_assessment" {
  description = "Enable SQL vulnerability assessment"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to the SQL Server and Database"
  type        = map(string)
  default     = {}
}
