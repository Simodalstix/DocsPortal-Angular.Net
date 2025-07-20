# Key Vault Module Variables

variable "name" {
  description = "Name of the Key Vault"
  type        = string
}

variable "location" {
  description = "Azure region for the Key Vault"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "tenant_id" {
  description = "Azure AD tenant ID"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID for network access restrictions"
  type        = string
  default     = null
}

variable "allowed_ip_ranges" {
  description = "List of IP ranges allowed to access the Key Vault"
  type        = list(string)
  default     = []
}

variable "storage_connection_string" {
  description = "Storage account connection string to store as secret"
  type        = string
  default     = null
  sensitive   = true
}

variable "application_insights_key" {
  description = "Application Insights instrumentation key to store as secret"
  type        = string
  default     = null
  sensitive   = true
}

variable "tags" {
  description = "Tags to apply to the Key Vault"
  type        = map(string)
  default     = {}
}
