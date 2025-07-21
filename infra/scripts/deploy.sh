#!/bin/bash

# SmartDocs Infrastructure Deployment Script
# This script provides a convenient way to deploy the infrastructure locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
ACTION="plan"
AUTO_APPROVE=false
DESTROY=false
INIT_BACKEND=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy SmartDocs infrastructure using Terraform

OPTIONS:
    -e, --environment ENV    Target environment (dev|prod) [default: dev]
    -a, --action ACTION      Terraform action (plan|apply|destroy) [default: plan]
    -y, --auto-approve       Auto approve terraform apply
    -d, --destroy            Destroy infrastructure
    -i, --init-backend       Initialize Terraform backend
    -h, --help               Show this help message

EXAMPLES:
    $0 --environment dev --action plan
    $0 --environment prod --action apply --auto-approve
    $0 --environment dev --destroy
    $0 --init-backend --environment dev

PREREQUISITES:
    - Azure CLI installed and logged in
    - Terraform >= 1.6.0 installed
    - Appropriate Azure permissions
    - Environment variables set (if not using Azure CLI auth)

EOF
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Azure CLI is installed
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Terraform is installed
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install it first."
        exit 1
    fi
    
    # Check Terraform version
    TF_VERSION=$(terraform version -json | jq -r '.terraform_version')
    print_status "Terraform version: $TF_VERSION"
    
    # Check if logged into Azure
    if ! az account show &> /dev/null; then
        print_error "Not logged into Azure. Please run 'az login' first."
        exit 1
    fi
    
    SUBSCRIPTION=$(az account show --query name -o tsv)
    print_status "Azure subscription: $SUBSCRIPTION"
    
    print_success "Prerequisites check passed"
}

# Function to initialize Terraform backend
init_backend() {
    print_status "Initializing Terraform backend for environment: $ENVIRONMENT"
    
    # Create resource group for Terraform state
    RG_NAME="rg-smartdocs-tfstate-$ENVIRONMENT"
    STORAGE_NAME="sastmartdocstfstate$ENVIRONMENT"
    
    print_status "Creating resource group: $RG_NAME"
    az group create --name "$RG_NAME" --location "Australia East" --tags \
        Project="SmartDocs" \
        Environment="$ENVIRONMENT" \
        Purpose="Terraform State" \
        ManagedBy="Script"
    
    print_status "Creating storage account: $STORAGE_NAME"
    az storage account create \
        --name "$STORAGE_NAME" \
        --resource-group "$RG_NAME" \
        --location "Australia East" \
        --sku Standard_LRS \
        --kind StorageV2 \
        --access-tier Hot \
        --https-only true \
        --min-tls-version TLS1_2
    
    print_status "Creating storage container: tfstate"
    az storage container create \
        --name tfstate \
        --account-name "$STORAGE_NAME" \
        --auth-mode login
    
    print_success "Backend initialized successfully"
}

# Function to run Terraform
run_terraform() {
    print_status "Running Terraform $ACTION for environment: $ENVIRONMENT"
    
    cd "$(dirname "$0")/../terraform"
    
    # Initialize Terraform
    print_status "Initializing Terraform..."
    terraform init \
        -backend-config="resource_group_name=rg-smartdocs-tfstate-$ENVIRONMENT" \
        -backend-config="storage_account_name=sastmartdocstfstate$ENVIRONMENT" \
        -backend-config="container_name=tfstate" \
        -backend-config="key=smartdocs-$ENVIRONMENT.terraform.tfstate"
    
    # Validate configuration
    print_status "Validating Terraform configuration..."
    terraform validate
    
    # Format check
    print_status "Checking Terraform formatting..."
    terraform fmt -check -recursive || {
        print_warning "Terraform files are not properly formatted. Running terraform fmt..."
        terraform fmt -recursive
    }
    
    case $ACTION in
        "plan")
            print_status "Running Terraform plan..."
            terraform plan -var-file="$ENVIRONMENT/terraform.tfvars" -out=tfplan
            ;;
        "apply")
            print_status "Running Terraform apply..."
            if [ "$AUTO_APPROVE" = true ]; then
                terraform apply -var-file="$ENVIRONMENT/terraform.tfvars" -auto-approve
            else
                terraform plan -var-file="$ENVIRONMENT/terraform.tfvars" -out=tfplan
                echo
                print_warning "Review the plan above. Do you want to apply these changes?"
                read -p "Enter 'yes' to continue: " -r
                if [[ $REPLY == "yes" ]]; then
                    terraform apply tfplan
                else
                    print_status "Apply cancelled by user"
                    exit 0
                fi
            fi
            ;;
        "destroy")
            print_warning "This will destroy all infrastructure in the $ENVIRONMENT environment!"
            if [ "$AUTO_APPROVE" = true ]; then
                terraform destroy -var-file="$ENVIRONMENT/terraform.tfvars" -auto-approve
            else
                terraform plan -destroy -var-file="$ENVIRONMENT/terraform.tfvars"
                echo
                print_warning "Review the destroy plan above. This action cannot be undone!"
                read -p "Enter 'yes' to destroy: " -r
                if [[ $REPLY == "yes" ]]; then
                    terraform destroy -var-file="$ENVIRONMENT/terraform.tfvars" -auto-approve
                else
                    print_status "Destroy cancelled by user"
                    exit 0
                fi
            fi
            ;;
    esac
    
    print_success "Terraform $ACTION completed successfully"
}

# Function to show outputs
show_outputs() {
    if [ "$ACTION" = "apply" ] && [ "$DESTROY" = false ]; then
        print_status "Infrastructure outputs:"
        cd "$(dirname "$0")/../terraform"
        terraform output
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -a|--action)
            ACTION="$2"
            shift 2
            ;;
        -y|--auto-approve)
            AUTO_APPROVE=true
            shift
            ;;
        -d|--destroy)
            ACTION="destroy"
            DESTROY=true
            shift
            ;;
        -i|--init-backend)
            INIT_BACKEND=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|prod)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be 'dev' or 'prod'"
    exit 1
fi

# Validate action
if [[ ! "$ACTION" =~ ^(plan|apply|destroy)$ ]]; then
    print_error "Invalid action: $ACTION. Must be 'plan', 'apply', or 'destroy'"
    exit 1
fi

# Main execution
print_status "SmartDocs Infrastructure Deployment"
print_status "Environment: $ENVIRONMENT"
print_status "Action: $ACTION"
echo

# Check prerequisites
check_prerequisites

# Initialize backend if requested
if [ "$INIT_BACKEND" = true ]; then
    init_backend
    echo
fi

# Run Terraform
run_terraform

# Show outputs
show_outputs

print_success "Deployment script completed successfully!"