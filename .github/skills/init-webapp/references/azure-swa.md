# Azure Static Web Apps — Deployment

## Pipeline-Datei

Erstelle eine `azure-static-web-apps.yml` im Projekt-Root:

```yaml
name: Azure Static Web Apps CI/CD

pr:
  branches:
    include:
      - master
trigger:
  branches:
    include:
      - master

jobs:
- job: build_and_deploy_job
  displayName: Build and Deploy Job
  condition: or(eq(variables['Build.Reason'], 'Manual'),or(eq(variables['Build.Reason'], 'PullRequest'),eq(variables['Build.Reason'], 'IndividualCI')))
  pool:
    vmImage: ubuntu-latest
  variables:
  - group: {{VARIABLE_GROUP_NAME}}
  steps:
  - checkout: self
    submodules: true
  - task: AzureStaticWebApp@0
    inputs:
      azure_static_web_apps_api_token: $(AZURE_STATIC_WEB_APPS_API_TOKEN)
      app_location: "/"
      api_location: ""
      output_location: "/dist"
```

## Hinweise

- `app_location`: Root des Projekts
- `output_location`: Build-Output (`/dist`)
- Variable Group muss in Azure DevOps existieren und das API-Token enthalten
- Die App verwendet relative Base Paths (`base: './'`) und kann in jedem Unterverzeichnis deployed werden
- `config.json` wird separat deployed (nicht gebundelt) — ermöglicht Konfigurationsänderungen ohne Rebuild
