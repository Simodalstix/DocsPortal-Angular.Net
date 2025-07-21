# SmartDocs Portal - Azure Infrastructure Demo

A comprehensive cloud-native document management portal showcasing modern DevOps practices, Azure infrastructure, and full-stack development skills. This project demonstrates expertise in the complete technology stack mentioned in the job requirements.

## Project Overview

**SmartDocs Portal** is a role-based document management system designed to showcase:

- **Azure Cloud Infrastructure** with enterprise-grade security and scalability
- **Modern DevOps Practices** with Infrastructure as Code and CI/CD pipelines
- **Full-Stack Development** using Angular and .NET technologies
- **Content Delivery** simulating Akamai CDN functionality
- **Enterprise Integration** patterns with AEM-like content management

## Architecture Highlights

```
Internet → Azure Front Door (CDN/WAF) → App Gateway → App Services
                                                    ↓
                                            Private Network
                                                    ↓
                                    SQL Database + Key Vault + Storage
```

### Key Components:

- **Frontend**: Angular SPA hosted on Azure App Service
- **Backend**: .NET 8 Web API with containerized deployment
- **Database**: Azure SQL Database with private endpoints
- **CDN**: Azure Front Door simulating Akamai functionality
- **Security**: Azure Key Vault, WAF, and managed identities
- **Storage**: Azure Blob Storage for document management
- **Monitoring**: Application Insights and Azure Monitor

## Technology Stack Alignment

| **Job Requirement**      | **Implementation**            | **Location**                                                                       |
| ------------------------ | ----------------------------- | ---------------------------------------------------------------------------------- |
| **.NET**                 | ASP.NET Core 8 Web API        | [`backend/dotnet-api/`](backend/dotnet-api/)                                       |
| **Angular**              | Angular 17+ SPA               | [`frontend/angular-app/`](frontend/angular-app/)                                   |
| **Azure**                | Complete cloud infrastructure | [`infra/terraform/`](infra/terraform/)                                             |
| **AEM**                  | Mocked content management API | [`aem-mock/`](aem-mock/)                                                           |
| **Akamai**               | Azure Front Door with CDN/WAF | [`infra/terraform/modules/cdn_frontdoor/`](infra/terraform/modules/cdn_frontdoor/) |
| **CI/CD**                | GitHub Actions + Azure DevOps | [`ci-cd/`](ci-cd/)                                                                 |
| **Networking**           | VNet, NSGs, Private Endpoints | [`infra/terraform/main.tf`](infra/terraform/main.tf)                               |
| **Cloud Infrastructure** | Terraform IaC with modules    | [`infra/terraform/modules/`](infra/terraform/modules/)                             |

## Project Structure

```
DocsPortal-Angular.Net/
├── 📁 frontend/angular-app/          # Angular frontend application
├── 📁 backend/dotnet-api/            # .NET Web API backend
├── 📁 aem-mock/                      # AEM content management simulation
├── 📁 infra/                         # Infrastructure as Code
│   ├── 📁 terraform/                 # Terraform configurations
│   │   ├── 📁 modules/               # Reusable Terraform modules
│   │   ├── 📁 dev/                   # Development environment config
│   │   └── 📁 prod/                  # Production environment config
│   ├── 📁 scripts/                   # Deployment automation scripts
│   └── 📁 docs/                      # Architecture documentation
├── 📁 ci-cd/                         # CI/CD pipeline configurations
│   ├── 📁 github-actions/            # GitHub Actions workflows
│   └── 📁 azure-pipelines/           # Azure DevOps pipelines
└── 📄 README.md                      # This file
```

## Infrastructure Modules

### Core Infrastructure Components:

1. **[App Service Module](infra/terraform/modules/app_service/)** - Hosts .NET API and Angular frontend
2. **[SQL Database Module](infra/terraform/modules/sql_database/)** - Managed database with security
3. **[Storage Account Module](infra/terraform/modules/storage_account/)** - Document and static file storage
4. **[Key Vault Module](infra/terraform/modules/key_vault/)** - Secrets and certificate management
5. **[CDN Front Door Module](infra/terraform/modules/cdn_frontdoor/)** - Global CDN with WAF protection

### Environment Configurations:

- **[Development](infra/terraform/dev/terraform.tfvars)** - Cost-optimized for development
- **[Production](infra/terraform/prod/terraform.tfvars)** - Performance and reliability optimized

## Quick Start

### Prerequisites

- Azure CLI installed and authenticated
- Terraform >= 1.6.0
- Node.js >= 18 (for Angular)
- .NET 8 SDK
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd DocsPortal-Angular.Net
```

### 2. Deploy Infrastructure

#### Option A: Using Deployment Script (Recommended)

```bash
# Initialize backend storage
./infra/scripts/deploy.sh --init-backend --environment dev

# Deploy to development
./infra/scripts/deploy.sh --environment dev --action apply --auto-approve
```

#### Option B: Using CI/CD Pipeline

```bash
# Push to develop branch triggers dev deployment
git checkout develop
git push origin develop

# Push to main branch triggers prod deployment (with approval)
git checkout main
git push origin main
```

#### Option C: Manual Terraform

```bash
cd infra/terraform

# Initialize
terraform init \
  -backend-config="resource_group_name=rg-smartdocs-tfstate-dev" \
  -backend-config="storage_account_name=sastmartdocstfstatedev" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=smartdocs-dev.terraform.tfstate"

# Deploy
terraform apply -var-file="dev/terraform.tfvars"
```

### 3. Deploy Applications

```bash
# Build and deploy .NET API
cd backend/dotnet-api
dotnet publish -c Release

# Build and deploy Angular app
cd frontend/angular-app
npm install
npm run build --prod
```

## CI/CD Pipeline Features

### GitHub Actions Pipeline

- **Automated Triggers**: Push to main/develop branches
- **Security Scanning**: Checkov security analysis
- **Cost Estimation**: Infracost integration
- **Environment Protection**: Manual approval for production
- **Artifact Management**: Terraform plans and logs

### Azure DevOps Pipeline

- **Multi-Stage Deployment**: Validation → Security → Plan → Deploy
- **Approval Gates**: Environment-specific approvals
- **Integration Testing**: Automated health checks
- **Notifications**: Teams integration for deployment status

## Security Features

### Network Security

- **Virtual Network**: Isolated network with segmented subnets
- **Network Security Groups**: Firewall rules for each tier
- **Private Endpoints**: Secure connectivity to PaaS services
- **WAF Protection**: Azure Front Door with security rules

### Identity & Access

- **Managed Identities**: Passwordless authentication
- **Azure AD Integration**: Enterprise authentication
- **Key Vault**: Centralized secrets management
- **RBAC**: Role-based access control

### Data Protection

- **TLS 1.2+**: Encrypted communications
- **Transparent Data Encryption**: Database encryption at rest
- **Storage Encryption**: Blob storage encryption
- **Backup & Recovery**: Automated backup strategies

## Monitoring & Observability

### Application Monitoring

- **Application Insights**: Performance and error tracking
- **Custom Dashboards**: Business and technical metrics
- **Alerting**: Proactive issue detection
- **Log Analytics**: Centralized logging

### Infrastructure Monitoring

- **Azure Monitor**: Resource health and performance
- **Cost Management**: Budget alerts and optimization
- **Security Center**: Security posture monitoring
- **Compliance**: Policy and governance tracking

## Cost Optimization

### Development Environment

- **Estimated Monthly Cost**: $10-20
- **Free Tier Usage**: App Service F1, Basic SQL
- **Storage**: LRS replication
- **Monitoring**: Basic metrics

### Production Environment

- **Estimated Monthly Cost**: $50-100
- **Performance Tiers**: Standard App Service, SQL
- **High Availability**: GRS storage, zone redundancy
- **Advanced Monitoring**: Full Application Insights

## Documentation

### Architecture & Design

- **[Architecture Overview](infra/docs/ARCHITECTURE.md)** - Detailed system architecture
- **[Deployment Guide](infra/docs/DEPLOYMENT_GUIDE.md)** - Comprehensive deployment instructions
- **[Security Guidelines](infra/docs/SECURITY.md)** - Security best practices
- **[Cost Optimization](infra/docs/COST_OPTIMIZATION.md)** - Cost management strategies

### API Documentation

- **[Backend API](backend/dotnet-api/README.md)** - .NET Web API documentation
- **[Frontend App](frontend/angular-app/README.md)** - Angular application guide
- **[AEM Mock](aem-mock/README.md)** - Content management API simulation

## Skills Demonstrated

### Cloud & Infrastructure

- ✅ **Azure Services**: App Service, SQL Database, Storage, Key Vault, Front Door
- ✅ **Infrastructure as Code**: Terraform with modular design
- ✅ **Networking**: VNet, NSGs, Private Endpoints, Load Balancing
- ✅ **Security**: WAF, Managed Identities, Encryption, Access Control
- ✅ **Monitoring**: Application Insights, Azure Monitor, Log Analytics

### DevOps & Automation

- ✅ **CI/CD Pipelines**: GitHub Actions and Azure DevOps
- ✅ **Deployment Automation**: Multi-environment deployments
- ✅ **Security Scanning**: Automated security and compliance checks
- ✅ **Cost Management**: Infrastructure cost estimation and optimization
- ✅ **Documentation**: Comprehensive technical documentation

### Development & Integration

- ✅ **Full-Stack Development**: Angular frontend with .NET backend
- ✅ **API Design**: RESTful APIs with proper authentication
- ✅ **Database Design**: Relational database with security best practices
- ✅ **Content Management**: AEM-like headless CMS integration
- ✅ **CDN Integration**: Global content delivery with caching strategies

## Next Steps

### Immediate Deployment

1. **Fork this repository** to your GitHub account
2. **Set up Azure subscription** and service principal
3. **Configure GitHub secrets** for automated deployment
4. **Deploy to development** environment for testing
5. **Review and customize** for your specific requirements

### Enhancement Opportunities

- **Container Orchestration**: Migrate to Azure Container Apps
- **Microservices Architecture**: Break down monolithic components
- **Advanced Monitoring**: Custom dashboards and alerting
- **Multi-Region Deployment**: Global disaster recovery setup
- **API Management**: Azure API Management integration

## Contact & Support

This project serves as a comprehensive demonstration of modern cloud infrastructure and DevOps practices. It showcases the ability to design, implement, and maintain enterprise-grade solutions using Azure cloud services.

**Key Highlights:**

- 🏗️ **Production-Ready Architecture** with security and scalability
- 🔄 **Modern DevOps Practices** with automated CI/CD
- 🛡️ **Enterprise Security** with defense-in-depth approach
- 📊 **Comprehensive Monitoring** and observability
- 💰 **Cost-Optimized** design with clear pricing models
- 📚 **Thorough Documentation** for maintenance and knowledge transfer

---

_This project demonstrates readiness for senior cloud infrastructure and DevOps roles, with practical experience in Azure, .NET, Angular, and modern development practices._
