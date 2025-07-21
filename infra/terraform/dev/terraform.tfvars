# Development Environment Configuration
# This file contains environment-specific values for the dev environment

# Environment settings
environment = "dev"
location    = "Australia East"

# Project configuration
project_name = "smartdocs"

# Networking configuration
vnet_address_space = ["10.0.0.0/16"]

subnet_configs = {
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

# App Service configuration (Free tier for dev)
app_service_sku = {
  tier = "Free"
  size = "F1"
}

# Database configuration (Basic tier for dev)
sql_database_sku = "Basic"
sql_admin_username = "sqladmin"

# Storage configuration (LRS for dev)
storage_account_tier = "Standard"
storage_replication_type = "LRS"

# Security configuration (more permissive for dev)
allowed_ip_ranges = ["0.0.0.0/0"] # Should be restricted in production

# Feature flags
enable_monitoring = true
enable_backup = false # Disabled for cost savings in dev
enable_cdn = true

# Tags
common_tags = {
  Project     = "SmartDocs Portal"
  Environment = "dev"
  ManagedBy   = "Terraform"
  Owner       = "DevOps Team"
  CostCenter  = "Development"
  Purpose     = "Job Application Demo"
}