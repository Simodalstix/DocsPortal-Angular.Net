# App Service Module Variables

variable "name_prefix" {
  description = "Prefix for naming App Service resources"
  type        = string
}

variable "location" {
  description = "Azure region for the App Service resources"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "sku_tier" {
  description = "App Service Plan SKU tier"
  type        = string
  default     = "Free"

  validation {
    condition     = contains(["Free", "Shared", "Basic", "Standard", "Premium", "PremiumV2", "PremiumV3"], var.sku_tier)
    error_message = "SKU tier must be one of: Free, Shared, Basic, Standard, Premium, PremiumV2, PremiumV3."
  }
}

variable "sku_size" {
  description = "App Service Plan SKU size"
  type        = string
  default     = "F1"

  validation {
    condition = contains([
      "F1", "D1", "B1", "B2", "B3", "S1", "S2", "S3",
      "P1", "P2", "P3", "P1V2", "P2V2", "P3V2", "P1V3", "P2V3", "P3V3"
    ], var.sku_size)
    error_message = "SKU size must be a valid App Service Plan size."
  }
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "subnet_id" {
  description = "Subnet ID for VNet integration"
  type        = string
}

variable "key_vault_uri" {
  description = "URI of the Key Vault for application configuration"
  type        = string
}

variable "database_connection_string" {
  description = "Database connection string"
  type        = string
  sensitive   = true
}

variable "storage_connection_string" {
  description = "Storage account connection string"
  type        = string
  sensitive   = true
}

variable "application_insights_key" {
  description = "Application Insights instrumentation key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "custom_domain_backend" {
  description = "Custom domain for backend API (optional)"
  type        = string
  default     = null
}

variable "custom_domain_frontend" {
  description = "Custom domain for frontend web app (optional)"
  type        = string
  default     = null
}

variable "enable_staging_slots" {
  description = "Enable staging deployment slots"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to the App Service resources"
  type        = map(string)
  default     = {}
}
