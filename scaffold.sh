#!/bin/bash

mkdir -p \
  infra/terraform/dev \
  infra/terraform/prod \
  infra/terraform/modules/app_service \
  infra/terraform/modules/sql_database \
  infra/terraform/modules/storage_account \
  infra/terraform/modules/key_vault \
  infra/terraform/modules/cdn_frontdoor \
  frontend/angular-app/src \
  backend/dotnet-api/Controllers \
  backend/dotnet-api/Models \
  aem-mock/content-api/routes \
  ci-cd/azure-pipelines \
  ci-cd/github-actions

# Terraform root files
touch infra/terraform/{main.tf,variables.tf,outputs.tf,backend.tf}

# Frontend and backend Dockerfiles
touch frontend/angular-app/Dockerfile
touch backend/dotnet-api/Dockerfile

# .NET app placeholders
touch backend/dotnet-api/{Program.cs,Startup.cs}

# AEM mock API entry
touch aem-mock/content-api/index.js

# CI/CD placeholder files
touch ci-cd/azure-pipelines/{frontend.yml,backend.yml}
touch ci-cd/github-actions/{build-frontend.yml,deploy-backend.yml}

# Project-level files
touch README.md .env.example

echo "✅ Project scaffold created!"
