# SmartDocs Portal - Infrastructure Architecture

## Overview

The SmartDocs Portal is a cloud-native document management system built on Azure, designed to demonstrate modern DevOps practices and enterprise-grade infrastructure patterns. This architecture showcases skills in Azure cloud services, Infrastructure as Code, CI/CD pipelines, and security best practices.

## High-Level Architecture

```
Internet Users
      │
      ▼
┌─────────────────┐
│ Azure Front Door│ ◄── CDN/WAF (Akamai Simulation)
│ + WAF Policy    │
└─────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Azure Virtual Network                    │
│                      (10.0.0.0/16)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │App Service  │  │  Database   │  │    Frontend         │  │
│  │Subnet       │  │  Subnet     │  │    Subnet           │  │
│  │10.0.1.0/24  │  │10.0.2.0/24  │  │   10.0.3.0/24       │  │
│  │             │  │             │  │                     │  │
│  │┌───────────┐│  │┌───────────┐│  │ ┌─────────────────┐ │  │
│  ││.NET API   ││  ││SQL Server ││  │ │ Angular SPA     │ │  │
│  ││App Service││  ││+ Database ││  │ │ App Service     │ │  │
│  │└───────────┘│  │└───────────┘│  │ └─────────────────┘ │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
      │                    │                    │
      ▼                    ▼                    ▼
┌─────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Azure       │  │ Azure SQL       │  │ Storage Account │
│ Key Vault   │  │ Database        │  │ - Documents     │
│ - Secrets   │  │ - Private       │  │ - Static Files  │
│ - Certs     │  │   Endpoint      │  │ - Logs          │
└─────────────┘  └─────────────────┘  └─────────────────┘
```

## Core Components

### 1. **Networking Layer**

- **Virtual Network (VNet)**: Isolated network environment with segmented subnets
- **Network Security Groups (NSGs)**: Firewall rules for each subnet
- **Private Endpoints**: Secure connectivity to PaaS services
- **Service Endpoints**: Direct connectivity to Azure services

### 2. **Application Layer**

- **Azure Front Door**: Global CDN with WAF protection (Akamai simulation)
- **App Services**:
  - .NET 8 API backend (Linux containers)
  - Angular frontend (Node.js)
- **Application Gateway**: Load balancing and SSL termination

### 3. **Data Layer**

- **Azure SQL Database**: Managed database with private endpoint
- **Storage Account**: Blob storage for documents and static content
- **Azure Key Vault**: Secure secrets and certificate management

### 4. **Security Layer**

- **Managed Identities**: Passwordless authentication
- **Private Endpoints**: Network isolation for data services
- **WAF Policies**: Protection against common web attacks
- **Network Security Groups**: Subnet-level firewall rules

### 5. **Monitoring & Logging**

- **Azure Monitor**: Infrastructure and application monitoring
- **Application Insights**: Application performance monitoring
- **Log Analytics**: Centralized logging and analytics

## Technology Stack Alignment

This architecture directly addresses the job requirements:

| Job Requirement          | Implementation                      | Demonstration                       |
| ------------------------ | ----------------------------------- | ----------------------------------- |
| **.NET**                 | ASP.NET Core Web API on App Service | Modern .NET 8 containerized API     |
| **Angular**              | Angular SPA on App Service          | Frontend application with CI/CD     |
| **Azure**                | Complete Azure cloud infrastructure | Multi-service cloud architecture    |
| **AEM**                  | Mocked content API service          | Headless CMS simulation             |
| **Akamai**               | Azure Front Door with WAF           | CDN with edge caching and security  |
| **CI/CD**                | GitHub Actions + Azure DevOps       | Automated infrastructure deployment |
| **Networking**           | VNet, NSGs, Private Endpoints       | Enterprise networking patterns      |
| **Operating Systems**    | Linux containers and VMs            | Container orchestration             |
| **Cloud Infrastructure** | Infrastructure as Code              | Terraform modules and automation    |

## Security Architecture

### Network Security

```
Internet → Front Door WAF → App Gateway → App Services
                                      ↓
                              Private Endpoints
                                      ↓
                            SQL Database + Key Vault
```

### Identity & Access Management

- **System-Assigned Managed Identities** for all App Services
- **Azure AD Authentication** for SQL Database
- **Key Vault Access Policies** for secret management
- **RBAC** for resource access control

### Data Protection

- **TLS 1.2+** for all communications
- **Private Endpoints** for database connectivity
- **Transparent Data Encryption** for SQL Database
- **Storage Account encryption** at rest
- **Key Vault** for secrets management

## Scalability & Performance

### Horizontal Scaling

- **App Service Plans** with auto-scaling rules
- **SQL Database** with elastic pools (production)
- **Front Door** global distribution
- **Storage Account** geo-replication

### Performance Optimization

- **CDN caching** for static content
- **Application Insights** for performance monitoring
- **Database indexing** and query optimization
- **Blob storage tiers** for cost optimization

## Disaster Recovery & Backup

### Backup Strategy

- **SQL Database**: Automated backups with point-in-time restore
- **Storage Account**: Geo-redundant storage (GRS) in production
- **Key Vault**: Soft delete and purge protection
- **Infrastructure**: Version-controlled Terraform state

### High Availability

- **App Services**: Multi-instance deployment
- **SQL Database**: Built-in high availability
- **Front Door**: Global load balancing
- **Storage**: Zone-redundant storage options

## Cost Optimization

### Development Environment

- **Free/Basic tiers** for App Services
- **Basic SQL Database** tier
- **LRS storage** replication
- **Estimated cost**: ~$10-20/month

### Production Environment

- **Standard App Service** tiers
- **Standard SQL Database** with reserved capacity
- **GRS storage** replication
- **Estimated cost**: ~$50-100/month

## Deployment Environments

### Development (dev)

- **Purpose**: Feature development and testing
- **Resources**: Cost-optimized tiers
- **Access**: Open for development team
- **Deployment**: Automatic on develop branch

### Production (prod)

- **Purpose**: Live application serving users
- **Resources**: Performance and reliability optimized
- **Access**: Restricted with approval gates
- **Deployment**: Manual approval required

## Infrastructure as Code

### Terraform Structure

```
infra/terraform/
├── main.tf                 # Root configuration
├── variables.tf            # Input variables
├── outputs.tf              # Output values
├── backend.tf              # Remote state config
├── dev/terraform.tfvars    # Dev environment values
├── prod/terraform.tfvars   # Prod environment values
└── modules/
    ├── app_service/        # App Service module
    ├── sql_database/       # SQL Database module
    ├── storage_account/    # Storage module
    ├── key_vault/          # Key Vault module
    └── cdn_frontdoor/      # CDN module
```

### Module Benefits

- **Reusability**: Modules can be used across environments
- **Consistency**: Standardized resource configurations
- **Maintainability**: Centralized updates and improvements
- **Testing**: Individual module validation

## CI/CD Pipeline Architecture

### GitHub Actions Workflow

```
Code Push → Validation → Security Scan → Plan → Approval → Deploy → Monitor
```

### Pipeline Stages

1. **Validation**: Terraform format, validate, and lint
2. **Security**: Checkov security scanning
3. **Planning**: Generate and review Terraform plans
4. **Cost Analysis**: Infracost estimation
5. **Deployment**: Apply infrastructure changes
6. **Monitoring**: Health checks and notifications

## Monitoring & Observability

### Key Metrics

- **Application Performance**: Response times, error rates
- **Infrastructure Health**: CPU, memory, disk usage
- **Security Events**: Failed authentications, suspicious activity
- **Cost Tracking**: Resource consumption and billing

### Alerting Strategy

- **Critical**: Infrastructure failures, security breaches
- **Warning**: Performance degradation, capacity thresholds
- **Info**: Deployment completions, scheduled maintenance

## Future Enhancements

### Potential Improvements

1. **Container Orchestration**: Migrate to Azure Container Apps
2. **Microservices**: Break down monolithic API
3. **Event-Driven Architecture**: Azure Service Bus integration
4. **Advanced Monitoring**: Custom dashboards and alerts
5. **Multi-Region**: Global deployment for disaster recovery

### Technology Evolution

- **Serverless Functions**: Azure Functions for specific workloads
- **API Management**: Azure API Management for API governance
- **DevOps**: Advanced deployment strategies (blue-green, canary)
- **AI/ML**: Azure Cognitive Services integration

## Conclusion

This architecture demonstrates enterprise-grade cloud infrastructure design with modern DevOps practices. It showcases the ability to:

- Design scalable, secure cloud architectures
- Implement Infrastructure as Code best practices
- Create robust CI/CD pipelines
- Apply security and compliance standards
- Optimize for cost and performance
- Plan for disaster recovery and business continuity

The implementation serves as a comprehensive portfolio piece demonstrating readiness for senior cloud infrastructure and DevOps roles.
