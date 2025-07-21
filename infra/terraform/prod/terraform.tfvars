# Production Environment Configuration
# This file contains environment-specific values for the prod environment

# Environment settings
environment = "prod"
location    = "Australia East"

# Project configuration
project_name = "smartdocs"

# Networking configuration
vnet_address_space = ["10.1.0.0/16"]

subnet_configs = {
  app_service = {
    address_prefixes  = ["10.1.1.0/24"]
    service_endpoints = ["Microsoft.Sql", "Microsoft.Storage", "Microsoft.KeyVault"]
  }
  database = {
    address_prefixes  = ["10.1.2.0/24"]
    service_endpoints = ["Microsoft.Sql"]
  }
  frontend = {
    address_prefixes  = ["10.1.3.0/24"]
    service_endpoints = ["Microsoft.Storage"]
  }
}

# App Service configuration (Standard tier for prod)
app_service_sku = {
  tier = "Standard"
  size = "S1"
}

# Database configuration (Standard tier for prod)
sql_database_sku = "S1"
sql_admin_username = "sqladmin"

# Storage configuration (GRS for prod)
storage_account_tier = "Standard"
storage_replication_type = "GRS"

# Security configuration (restricted for prod)
allowed_ip_ranges = [
  "203.0.113.0/24",  # Example office IP range
  "198.51.100.0/24"  # Example VPN IP range
]

# Feature flags
enable_monitoring = true
enable_backup = true
enable_cdn = true

# Tags
common_tags = {
  Project     = "SmartDocs Portal"
  Environment = "prod"
  ManagedBy   = "Terraform"
  Owner       = "DevOps Team"
  CostCenter  = "Production"
  Purpose     = "Job Application Demo"
  Criticality = "High"
  Backup      = "Required"
}