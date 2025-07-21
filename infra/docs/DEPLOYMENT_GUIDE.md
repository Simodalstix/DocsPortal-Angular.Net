# SmartDocs Infrastructure Deployment Guide

## Deployment Methods & Triggers

This project supports multiple deployment methods to accommodate different workflows and preferences:

### 1. **Automated CI/CD Pipeline Triggers (Recommended)**

#### GitHub Actions Triggers:

- **Push to `main` branch** → Automatically deploys to **PROD** environment
- **Push to `develop` branch** → Automatically deploys to **DEV** environment
- **Pull Request to `main`** → Runs plan and validation only (no deployment)
- **Manual Workflow Dispatch** → Allows manual deployment to any environment

#### Azure DevOps Pipeline Triggers:

- **Push to `main` branch** → Automatically deploys to **PROD** environment
- **Push to `develop` branch** → Automatically deploys to **DEV** environment
- **Pull Request to `main`** → Runs plan and validation only
- **Manual Pipeline Run** → Allows manual deployment with parameters

### 2. **Local Development Deployment**

#### Using the Deployment Script:

```bash
# Plan changes for dev environment
./infra/scripts/deploy.sh --environment dev --action plan

# Apply changes to dev environment
./infra/scripts/deploy.sh --environment dev --action apply

# Apply changes with auto-approval
./infra/scripts/deploy.sh --environment dev --action apply --auto-approve

# Destroy dev environment
./infra/scripts/deploy.sh --environment dev --destroy
```

#### Direct Terraform Commands:

```bash
cd infra/terraform

# Initialize backend
terraform init \
  -backend-config="resource_group_name=rg-smartdocs-tfstate-dev" \
  -backend-config="storage_account_name=sastmartdocstfstatedev" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=smartdocs-dev.terraform.tfstate"

# Plan deployment
terraform plan -var-file="dev/terraform.tfvars"

# Apply deployment
terraform apply -var-file="dev/terraform.tfvars"
```

## Deployment Workflow

### Typical Development Workflow:

1. **Feature Development**

   ```bash
   git checkout -b feature/new-infrastructure
   # Make infrastructure changes
   git add .
   git commit -m "Add new infrastructure component"
   git push origin feature/new-infrastructure
   ```

2. **Testing in Dev**

   ```bash
   # Create PR to develop branch
   # This triggers validation and planning
   # Merge to develop triggers deployment to DEV
   ```

3. **Production Release**
   ```bash
   # Create PR from develop to main
   # This triggers validation and shows production plan
   # Merge to main triggers deployment to PROD
   ```

### Emergency/Hotfix Workflow:

1. **Direct Production Fix**
   ```bash
   git checkout main
   git checkout -b hotfix/critical-fix
   # Make urgent changes
   git commit -m "Critical infrastructure fix"
   git push origin hotfix/critical-fix
   # Create PR directly to main
   # Merge triggers immediate PROD deployment
   ```

## Deployment Triggers Summary

| Trigger           | Environment | Action       | Approval Required |
| ----------------- | ----------- | ------------ | ----------------- |
| Push to `main`    | PROD        | Auto Deploy  | No\*              |
| Push to `develop` | DEV         | Auto Deploy  | No                |
| PR to `main`      | PROD        | Plan Only    | Manual Review     |
| PR to `develop`   | DEV         | Plan Only    | Manual Review     |
| Manual Dispatch   | Any         | Configurable | Optional          |
| Local Script      | Any         | Manual       | Yes               |

\*Production deployments can be configured to require manual approval in GitHub/Azure DevOps environments.

## Safety Mechanisms

### 1. **Environment Protection Rules**

- Production environment requires manual approval
- Only specific users/teams can approve production deployments
- Deployment windows can be configured

### 2. **Validation Gates**

- Terraform format checking
- Configuration validation
- Security scanning with Checkov
- Cost estimation with Infracost
- Plan review before apply

### 3. **Rollback Capabilities**

```bash
# Rollback using previous state
terraform apply -var-file="prod/terraform.tfvars" -target=module.specific_module

# Complete environment rebuild
./infra/scripts/deploy.sh --environment prod --destroy
./infra/scripts/deploy.sh --environment prod --action apply
```

## Setup Instructions

### 1. **GitHub Actions Setup**

1. **Create Azure Service Principal:**

   ```bash
   az ad sp create-for-rbac --name "smartdocs-github-actions" \
     --role contributor \
     --scopes /subscriptions/{subscription-id} \
     --sdk-auth
   ```

2. **Add GitHub Secrets:**

   - `AZURE_CLIENT_ID`
   - `AZURE_CLIENT_SECRET`
   - `AZURE_SUBSCRIPTION_ID`
   - `AZURE_TENANT_ID`
   - `INFRACOST_API_KEY` (optional)

3. **Configure Environment Protection:**
   - Go to Settings → Environments
   - Create `prod` environment
   - Add required reviewers
   - Set deployment branches to `main` only

### 2. **Azure DevOps Setup**

1. **Create Service Connection:**

   - Project Settings → Service Connections
   - New service connection → Azure Resource Manager
   - Service principal (automatic)

2. **Create Environments:**

   - Pipelines → Environments
   - Create `dev` and `prod` environments
   - Add approval gates for production

3. **Set Pipeline Variables:**
   - `INFRACOST_API_KEY`
   - `TEAMS_WEBHOOK_URL` (optional)

### 3. **Local Development Setup**

1. **Install Prerequisites:**

   ```bash
   # Install Azure CLI
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

   # Install Terraform
   wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
   unzip terraform_1.6.0_linux_amd64.zip
   sudo mv terraform /usr/local/bin/

   # Login to Azure
   az login
   ```

2. **Initialize Backend:**
   ```bash
   ./infra/scripts/deploy.sh --init-backend --environment dev
   ```

## Monitoring Deployments

### 1. **GitHub Actions**

- View workflow runs in Actions tab
- Download artifacts (Terraform plans, logs)
- Review security scan results

### 2. **Azure DevOps**

- Monitor pipeline runs in Pipelines section
- View test results and security scans
- Check environment deployment history

### 3. **Azure Portal**

- Monitor resource health
- View deployment history
- Check cost analysis

## Troubleshooting

### Common Issues:

1. **Backend State Lock**

   ```bash
   # Force unlock (use carefully)
   terraform force-unlock <lock-id>
   ```

2. **Permission Issues**

   ```bash
   # Check current Azure context
   az account show

   # List available subscriptions
   az account list

   # Set correct subscription
   az account set --subscription <subscription-id>
   ```

3. **Resource Conflicts**
   ```bash
   # Import existing resources
   terraform import azurerm_resource_group.main /subscriptions/{id}/resourceGroups/{name}
   ```

## Best Practices

1. **Always use feature branches** for infrastructure changes
2. **Test in dev environment** before promoting to production
3. **Review Terraform plans** carefully before applying
4. **Use semantic versioning** for infrastructure releases
5. **Monitor costs** regularly using Infracost reports
6. **Keep state files secure** and backed up
7. **Document all changes** in commit messages and PRs

## 🔗 Related Documentation

- [Infrastructure Architecture](./ARCHITECTURE.md)
- [Security Guidelines](./SECURITY.md)
- [Cost Optimization](./COST_OPTIMIZATION.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
