# Terraform Backend Configuration for Remote State Management
# This configuration stores Terraform state in Azure Storage Account
# Provides state locking and team collaboration capabilities

terraform {
  required_version = ">= 1.6"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Backend configuration for Azure Storage
  # Note: These values should be provided via backend config file or CLI
  # Example: terraform init -backend-config="backend-config.hcl"
  backend "azurerm" {
    # resource_group_name  = "rg-smartdocs-tfstate"
    # storage_account_name = "sastmartdocstfstate"
    # container_name       = "tfstate"
    # key                  = "smartdocs.terraform.tfstate"
  }
}

# Configure the Azure Provider with latest features
provider "azurerm" {
  features {
    # Enable enhanced security features
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }

    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}
