# Core Variables for SmartDocs Portal Infrastructure

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "Australia East"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "smartdocs"
}

variable "resource_group_name" {
  description = "Resource group name (will be generated if not provided)"
  type        = string
  default     = ""
}

# Networking Variables
variable "vnet_address_space" {
  description = "Address space for the virtual network"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "subnet_configs" {
  description = "Subnet configurations"
  type = map(object({
    address_prefixes  = list(string)
    service_endpoints = list(string)
  }))
  default = {
    app_service = {
      address_prefixes  = ["10.0.1.0/24"]
      service_endpoints = ["Microsoft.Sql", "Microsoft.Storage", "Microsoft.KeyVault"]
    }
    database = {
      address_prefixes  = ["10.0.2.0/24"]
      service_endpoints = ["Microsoft.Sql"]
    }
    frontend = {
      address_prefixes  = ["10.0.3.0/24"]
      service_endpoints = ["Microsoft.Storage"]
    }
  }
}

# App Service Variables
variable "app_service_sku" {
  description = "App Service Plan SKU"
  type = object({
    tier = string
    size = string
  })
  default = {
    tier = "Free"
    size = "F1"
  }
}

# Database Variables
variable "sql_admin_username" {
  description = "SQL Server administrator username"
  type        = string
  default     = "sqladmin"
}

variable "sql_database_sku" {
  description = "SQL Database SKU"
  type        = string
  default     = "Basic"
}

# Storage Variables
variable "storage_account_tier" {
  description = "Storage account tier"
  type        = string
  default     = "Standard"
}

variable "storage_replication_type" {
  description = "Storage account replication type"
  type        = string
  default     = "LRS"
}

# Security Variables
variable "allowed_ip_ranges" {
  description = "IP ranges allowed to access resources"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Should be restricted in production
}

# Tags
variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "SmartDocs Portal"
    Environment = "dev"
    ManagedBy   = "Terraform"
    Owner       = "DevOps Team"
  }
}

# Feature Flags
variable "enable_monitoring" {
  description = "Enable Azure Monitor and Application Insights"
  type        = bool
  default     = true
}

variable "enable_backup" {
  description = "Enable backup for databases and storage"
  type        = bool
  default     = true
}

variable "enable_cdn" {
  description = "Enable Azure Front Door CDN"
  type        = bool
  default     = true
}
