# SmartDocs Portal - Main Terraform Configuration
# This file orchestrates all infrastructure components for the document management portal

# Generate random suffix for globally unique resource names
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# Local values for consistent naming and tagging
locals {
  # Resource naming convention: {type}-{project}-{environment}-{suffix}
  resource_group_name = var.resource_group_name != "" ? var.resource_group_name : "rg-${var.project_name}-${var.environment}"

  # Common tags merged with environment-specific tags
  common_tags = merge(var.common_tags, {
    Environment = var.environment
    DeployedBy  = "Terraform"
    Timestamp   = timestamp()
  })

  # Naming convention helpers
  name_prefix = "${var.project_name}-${var.environment}"
  name_suffix = random_string.suffix.result
}

# Resource Group - Central container for all resources
resource "azurerm_resource_group" "main" {
  name     = local.resource_group_name
  location = var.location
  tags     = local.common_tags
}

# Virtual Network - Network foundation for secure communication
resource "azurerm_virtual_network" "main" {
  name                = "vnet-${local.name_prefix}"
  address_space       = var.vnet_address_space
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags
}

# Subnets - Segmented network spaces for different tiers
resource "azurerm_subnet" "main" {
  for_each = var.subnet_configs

  name                 = "subnet-${each.key}-${var.environment}"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = each.value.address_prefixes
  service_endpoints    = each.value.service_endpoints
}

# Network Security Groups - Firewall rules for subnet protection
resource "azurerm_network_security_group" "main" {
  for_each = var.subnet_configs

  name                = "nsg-${each.key}-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags

  # Default security rules
  security_rule {
    name                       = "AllowHTTPS"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowHTTP"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

# Associate NSGs with Subnets
resource "azurerm_subnet_network_security_group_association" "main" {
  for_each = var.subnet_configs

  subnet_id                 = azurerm_subnet.main[each.key].id
  network_security_group_id = azurerm_network_security_group.main[each.key].id
}

# Log Analytics Workspace - Central logging for monitoring
resource "azurerm_log_analytics_workspace" "main" {
  count = var.enable_monitoring ? 1 : 0

  name                = "log-${local.name_prefix}-${local.name_suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.common_tags
}

# Application Insights - Application performance monitoring
resource "azurerm_application_insights" "main" {
  count = var.enable_monitoring ? 1 : 0

  name                = "appi-${local.name_prefix}-${local.name_suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  workspace_id        = azurerm_log_analytics_workspace.main[0].id
  application_type    = "web"
  tags                = local.common_tags
}

# Key Vault Module - Secure secrets management
module "key_vault" {
  source = "./modules/key_vault"

  name                = "kv-${local.name_prefix}-${local.name_suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id

  # Network access configuration
  subnet_id         = azurerm_subnet.main["app_service"].id
  allowed_ip_ranges = var.allowed_ip_ranges

  tags = local.common_tags
}

# Storage Account Module - Document and static file storage
module "storage_account" {
  source = "./modules/storage_account"

  name                     = "sa${var.project_name}${var.environment}${local.name_suffix}"
  location                 = azurerm_resource_group.main.location
  resource_group_name      = azurerm_resource_group.main.name
  account_tier             = var.storage_account_tier
  account_replication_type = var.storage_replication_type

  # Network access configuration
  subnet_ids        = [azurerm_subnet.main["app_service"].id, azurerm_subnet.main["frontend"].id]
  allowed_ip_ranges = var.allowed_ip_ranges

  # Enable backup if specified
  enable_backup = var.enable_backup

  tags = local.common_tags
}

# SQL Database Module - Application database
module "sql_database" {
  source = "./modules/sql_database"

  server_name         = "sql-${local.name_prefix}-${local.name_suffix}"
  database_name       = "${var.project_name}_${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  # Authentication configuration
  admin_username = var.sql_admin_username

  # Network access configuration
  subnet_id         = azurerm_subnet.main["database"].id
  allowed_ip_ranges = var.allowed_ip_ranges

  # Database configuration
  sku_name      = var.sql_database_sku
  enable_backup = var.enable_backup

  # Integration with Key Vault for secrets
  key_vault_id = module.key_vault.key_vault_id

  tags = local.common_tags
}

# App Service Module - Web application hosting
module "app_service" {
  source = "./modules/app_service"

  name_prefix         = local.name_prefix
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  # App Service Plan configuration
  sku_tier = var.app_service_sku.tier
  sku_size = var.app_service_sku.size

  # Network integration
  subnet_id = azurerm_subnet.main["app_service"].id

  # Application configuration
  key_vault_uri              = module.key_vault.key_vault_uri
  storage_connection_string  = module.storage_account.connection_string
  database_connection_string = "Server=${module.sql_database.sql_server_fqdn};Database=${module.sql_database.database_name};Authentication=Active Directory Default;"
  application_insights_key   = var.enable_monitoring ? azurerm_application_insights.main[0].instrumentation_key : ""

  tags = local.common_tags
}

# CDN Front Door Module - Content delivery network (Akamai simulation)
module "cdn_frontdoor" {
  count  = var.enable_cdn ? 1 : 0
  source = "./modules/cdn_frontdoor"

  name_prefix         = local.name_prefix
  resource_group_name = azurerm_resource_group.main.name

  # Origin configuration
  backend_hostname  = module.app_service.backend_app_service_hostname
  frontend_hostname = module.app_service.frontend_app_service_hostname
  storage_hostname  = module.storage_account.primary_blob_hostname

  tags = local.common_tags
}

# Data source for current Azure client configuration
data "azurerm_client_config" "current" {}
