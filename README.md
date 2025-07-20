Project Title: SmartDocs Portal
A role-based document management portal for internal teams (e.g. HR, Legal, Finance) with public-facing content delivery via CDN

🔧 Tech Stack Overview
Layer Tech Used Why It Matches
Frontend Angular Matches job ad
Backend API .NET (ASP.NET Core Web API) Matches job ad
CMS Integration AEM (mocked via JSON APIs or AEM as a headless CMS) Matches job ad
CDN Akamai (simulate with Azure Front Door or Cloudflare if Akamai isn’t available) Matches job ad
Cloud Infrastructure Azure App Service, Azure SQL, Key Vault, Blob Storage Matches job ad
CI/CD GitHub Actions or Azure DevOps Pipelines Matches job ad
AuthN/AuthZ Azure AD B2C (or IdentityServer) Real-world enterprise auth
Networking/Infra Azure VNets, NSGs, App Gateway Shows cloud infra + networking skills
OS Layer Linux VMs for self-hosted agents or nginx reverse proxy Highlights OS understanding

🎯 Features
Secure login and RBAC (Admin, Editor, Viewer roles)

Upload, tag, and manage internal documents (stored in Azure Blob Storage or SQL)

Public-facing content pages delivered via AEM (real or mocked)

Static resources cached and served via CDN (simulate Akamai behavior)

CI/CD for both frontend and backend deployments

Custom error pages, routing, and fallback mechanisms

Monitoring & logging via Azure Monitor + App Insights

💡 Bonus: Project Themes You Can Highlight
“CDN Edge Routing”: Simulate Akamai by showing how public content is routed from a CDN (add an Origin failover to Blob Storage).

“AEM Integration”: Mock AEM API responses or use a headless CMS like Contentful or Sanity to stand in.

“CI/CD Pipelines”: Set up a two-stage deploy with approvals for prod, include automated Angular builds and .NET tests.

“Networking Troubleshooting”: Document how you'd debug a 502 error from App Gateway -> App Service, or a DNS issue from CDN -> Origin.

✅ What You’ll Be Able to Demonstrate
Angular + .NET real-world integration

Cloud infra setup and config in Azure

CDN and CMS delivery pipelines

CI/CD best practices and automation

Troubleshooting skills across layers

Evidence of self-driven full-stack delivery
