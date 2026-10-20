---
name: add-pipeline
description: "Erstellt oder erweitert eine Azure DevOps Pipeline für eine React/Vite Webapp. Verwende diesen Skill wenn: Pipeline erstellen, Azure Pipelines einrichten, CI/CD aufsetzen, Static Web App publizieren, SWA deploy, Build Artifact bereitstellen, Artefakt publishen, azure-pipelines.yml anlegen, Deployment konfigurieren, Multi-App Pipeline."
argument-hint: "Modus: artifact, swa, both (optional)"
---

# Add Pipeline — Azure DevOps Build, SWA Deploy & Artifacts

Erstellt oder erweitert `azure-pipelines.yml` für eine React/Vite Webapp. Unterstützt drei Modi:

| Modus    | Zweck                                                    |
|----------|----------------------------------------------------------|
| `artifact` | Nur Build + ZIP-Artifact (z.B. für On-Prem Deploy)     |
| `swa`      | Nur Deploy auf Azure Static Web Apps                   |
| `both`     | Build + SWA Deploy + Artifact in einer Pipeline        |

## Wann verwenden

- Neue Pipeline für eine Webapp anlegen
- Bestehende Pipeline um Artifact oder SWA Deploy erweitern
- Mehrere Apps aus einem Monorepo deployen (siehe [Multi-App Variante](#variante-multi-app-monorepo))

## Hintergrund: Die zwei YAML-Dateien

Es gibt **zwei unterschiedliche** Pipeline-Dateien — sie sind **unabhängig**, lassen sich aber kombinieren:

### 1. `azure-static-web-apps-<token>.yml` (auto-generiert)

Wird von Azure **automatisch** angelegt, wenn man im Azure Portal eine Static Web App Ressource erstellt und die Quelle auf "Azure DevOps" setzt. Enthält:

- Eigenen `trigger:` / `pr:` Block
- Variable Group mit dem API Token (z.B. `Azure-Static-Web-Apps-delightful-sea-00c905803-variable-group`)
- Einen einzelnen `AzureStaticWebApp@0` Task mit `app_location`, `output_location`

**Wichtig**: Diese Datei deployed bei jedem Push/PR auf den Branch. Wenn ein eigenes `azure-pipelines.yml` ebenfalls deployed → **Doppel-Deploys**. Lösung: `trigger:` in dieser Datei auskommentieren und nur die **Variable Group** im eigenen Pipeline-File verwenden.

### 2. `azure-pipelines.yml` (manuell, Hauptpipeline)

Eigene Azure DevOps Pipeline mit voller Kontrolle: Node-Version, Build-Steps, Tests, Artifacts, Multi-App, eigener Trigger. Konsumiert das SWA Token aus der Variable Group, die von der auto-generierten Datei mitgeliefert wurde.

### Zusammenhang

- **Nur SWA** → auto-generiertes File reicht, kein eigenes `azure-pipelines.yml` nötig
- **Nur Artifact** → eigenes `azure-pipelines.yml` ohne SWA Task, keine SWA Ressource in Azure nötig
- **Both** → eigenes `azure-pipelines.yml` deployt + zippt, auto-generierte SWA Datei lassen aber Trigger auskommentieren (Variable Group bleibt erhalten und wird referenziert)

## Voraussetzungen

- Repo ist in Azure DevOps
- Für SWA: Static Web App Ressource in Azure existiert (sonst zuerst im Portal anlegen — dabei wird `azure-static-web-apps-*.yml` automatisch ins Repo committed und die Variable Group erstellt)
- Node 22+ wird vom Template verwendet (`package.json` "engines" oder `.nvmrc` prüfen)

## Vorgehen

### Schritt 1: Modus klären

Frage den User (oder leite aus dem Kontext ab):

1. **Welcher Modus?** `artifact`, `swa` oder `both`
2. **Single oder Multi-App?** (Monorepo mit mehreren `dist/<app>/`?)
3. **Trigger-Branch?** Default: `master` (Template) bzw. `develop` (Schindler-Konvention)
4. **Für SWA**: Existiert die Static Web App Ressource bereits? Wenn nein → User muss diese zuerst im Azure Portal erstellen.

### Schritt 2: Bestehende Dateien prüfen

```
ls azure-*.yml
```

- Wenn `azure-static-web-apps-*.yml` existiert → SWA Ressource ist da, Variable Group Name + Token-Variable daraus extrahieren
- Wenn `azure-pipelines.yml` existiert → erweitern statt überschreiben

### Schritt 3: Pipeline schreiben

Nutze die passende Vorlage unten. Werte ersetzen:

- `<TRIGGER_BRANCH>` — z.B. `master` oder `develop`
- `<NODE_VERSION>` — z.B. `22.x`
- `<VARIABLE_GROUP>` — exakt der Name aus der auto-generierten SWA-Datei
- `<TOKEN_VAR>` — die Variable aus der Variable Group, z.B. `AZURE_STATIC_WEB_APPS_API_TOKEN_DELIGHTFUL_SEA_00C905803`
- `<APP_NAME>` — kurzer Name für Artifact-Filename

### Schritt 4: Auto-generiertes SWA YAML anpassen (nur bei `both`)

In `azure-static-web-apps-<token>.yml` den `trigger:` Block auskommentieren, damit nicht doppelt deployed wird. `pr:` kann bleiben für PR-Validierung (optional).

```yaml
# trigger:
#   branches:
#     include:
#       - master
```

### Schritt 5: Commit & im Azure DevOps Portal Pipeline anlegen

- Datei committen + pushen
- In Azure DevOps: **Pipelines → New Pipeline → Azure Repos Git → bestehende `azure-pipelines.yml` wählen**
- Für SWA: sicherstellen, dass die Pipeline Zugriff auf die Variable Group hat (`Pipeline → Edit → Variables → Variable groups`)

## Vorlagen

### Variante: `artifact` (Build + ZIP, kein Deploy)

```yaml
trigger:
- <TRIGGER_BRANCH>

pool:
  vmImage: ubuntu-latest

variables:
  - name: timestamp
    value: $[format('{0:yyyyMMddHHmmss}', pipeline.startTime)]

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '<NODE_VERSION>'
  displayName: 'install Node.js <NODE_VERSION>'

- script: npm ci
  displayName: 'npm ci'

- script: npm run build
  displayName: 'npm run build'

- task: ArchiveFiles@2
  inputs:
    rootFolderOrFile: 'dist'
    includeRootFolder: false
    archiveType: 'zip'
    archiveFile: '$(Build.ArtifactStagingDirectory)/<APP_NAME>-$(Build.SourceBranchName)-$(timestamp).zip'
    replaceExistingArchive: true

- task: PublishBuildArtifacts@1
  displayName: 'Publish Artifacts'
  inputs:
    PathtoPublish: '$(Build.ArtifactStagingDirectory)/<APP_NAME>-$(Build.SourceBranchName)-$(timestamp).zip'
    ArtifactName: 'drop'
    publishLocation: 'Container'
```

### Variante: `swa` (nur Static Web App Deploy via eigene Pipeline)

> Hinweis: Wenn keine speziellen Build-Anpassungen nötig sind, reicht die auto-generierte `azure-static-web-apps-*.yml`. Diese Variante nur wählen, wenn z.B. spezifische Node-Version, Tests vor Deploy o.ä. nötig sind.

```yaml
trigger:
- <TRIGGER_BRANCH>

pool:
  vmImage: ubuntu-latest

variables:
  - group: <VARIABLE_GROUP>

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '<NODE_VERSION>'
  displayName: 'install Node.js <NODE_VERSION>'

- script: npm ci
  displayName: 'npm ci'

- script: npx @biomejs/biome check .
  displayName: 'biome check'

# Oryx baut die App selbst (npm install + npm run build) und deployed /dist.
# Kein vorgeschalteter `npm run build` + `skip_app_build: true` -> sonst
# Fehler: "Oryx built the app folder but was unable to determine the
# location of the app artifacts".
- task: AzureStaticWebApp@0
  condition: eq(variables['Build.SourceBranchName'], '<TRIGGER_BRANCH>')
  inputs:
    azure_static_web_apps_api_token: $(<TOKEN_VAR>)
    app_location: '/'
    api_location: ''
    output_location: 'dist'
  displayName: 'deploy <APP_NAME>'
```

### Variante: `both` (SWA Deploy + Artifact)

```yaml
trigger:
- <TRIGGER_BRANCH>

pool:
  vmImage: ubuntu-latest

variables:
  - group: <VARIABLE_GROUP>
  - name: timestamp
    value: $[format('{0:yyyyMMddHHmmss}', pipeline.startTime)]

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '<NODE_VERSION>'
  displayName: 'install Node.js <NODE_VERSION>'

- script: npm ci
  displayName: 'npm ci'

- script: npm run build
  displayName: 'npm run build'

- task: AzureStaticWebApp@0
  condition: eq(variables['Build.SourceBranchName'], '<TRIGGER_BRANCH>')
  inputs:
    azure_static_web_apps_api_token: $(<TOKEN_VAR>)
    app_location: '/'
    api_location: ''
    output_location: 'dist'
  displayName: 'deploy <APP_NAME>'

- task: ArchiveFiles@2
  inputs:
    rootFolderOrFile: 'dist'
    includeRootFolder: false
    archiveType: 'zip'
    archiveFile: '$(Build.ArtifactStagingDirectory)/<APP_NAME>-$(Build.SourceBranchName)-$(timestamp).zip'
    replaceExistingArchive: true

- task: PublishBuildArtifacts@1
  inputs:
    PathtoPublish: '$(Build.ArtifactStagingDirectory)/<APP_NAME>-$(Build.SourceBranchName)-$(timestamp).zip'
    ArtifactName: 'drop'
    publishLocation: 'Container'
```

### Variante: Multi-App Monorepo

Mehrere Apps aus einem Repo bauen + jede auf eine separate SWA deployen. Voraussetzung: Build produziert `dist/<app-name>/` pro App.

```yaml
trigger:
- <TRIGGER_BRANCH>

pool:
  vmImage: ubuntu-latest

variables:
  - group: Azure-Static-Web-Apps-<token-1>-variable-group
  - group: Azure-Static-Web-Apps-<token-2>-variable-group
  - name: timestamp
    value: $[format('{0:yyyyMMddHHmmss}', pipeline.startTime)]

parameters:
- name: apps
  type: object
  default: [
    { name: 'app-one', token: $(AZURE_STATIC_WEB_APPS_API_TOKEN_<TOKEN_1>) },
    { name: 'app-two', token: $(AZURE_STATIC_WEB_APPS_API_TOKEN_<TOKEN_2>) }
  ]

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '<NODE_VERSION>'
  displayName: 'install Node.js'

- script: npm ci
  displayName: 'npm ci'

- script: npm run build
  displayName: 'npm run build'

- script: mkdir web
  displayName: 'mkdir web'

- ${{ each app in parameters.apps }}:
  - script: |
      mkdir web/${{ app.name }}
      cp -r dist/${{ app.name }}/** web/${{ app.name }}
    displayName: 'stage ${{ app.name }}'

  - task: AzureStaticWebApp@0
    condition: eq(variables['Build.SourceBranchName'], '<TRIGGER_BRANCH>')
    inputs:
      azure_static_web_apps_api_token: ${{ app.token }}
      app_location: 'web/${{ app.name }}'
      output_location: 'public'
      skip_app_build: true
    displayName: 'deploy ${{ app.name }}'

- task: ArchiveFiles@2
  inputs:
    rootFolderOrFile: 'dist'
    includeRootFolder: true
    archiveType: 'zip'
    archiveFile: '$(Build.ArtifactStagingDirectory)/<APP_NAME>-$(Build.SourceBranchName)-$(timestamp).zip'
    replaceExistingArchive: true

- task: PublishBuildArtifacts@1
  inputs:
    PathtoPublish: '$(Build.ArtifactStagingDirectory)/<APP_NAME>-$(Build.SourceBranchName)-$(timestamp).zip'
    ArtifactName: 'build'
    publishLocation: 'Container'
```

## Pitfalls

- **Doppel-Deploy**: Wenn sowohl `azure-pipelines.yml` als auch `azure-static-web-apps-*.yml` triggern → SWA wird zweimal deployed. → Trigger in auto-generierter Datei auskommentieren.
- **`skip_app_build: true` + eigener `npm run build` davor → Oryx-Fehler** „Oryx built the app folder but was unable to determine the location of the app artifacts". Lösung: KEINEN eigenen Build-Step und KEIN `skip_app_build` setzen; Oryx baut selbst (`npm install` + `npm run build`) und nimmt `output_location: 'dist'`. Vor-Steps wie `npm ci` + Biome-Check sind ok (Oryx installiert zwar nochmal, schadet aber nicht).
- **`output_location` mit führendem Slash** (`/dist`): Wird als absoluter Pfad interpretiert — Oryx sucht außerhalb des App-Verzeichnisses und findet nichts. Immer relativ angeben: `output_location: 'dist'`. (Das auto-generierte SWA-YAML nutzt zwar `/dist`, das ist aber GitHub-Actions-Syntax und im Azure-DevOps-Task instabil.)
- **Variable Group nicht autorisiert**: Beim ersten Pipeline-Run muss die Variable Group **manuell** für die Pipeline freigegeben werden (Azure DevOps zeigt einen "Permit"-Button).
- **Node-Version-Drift**: Lokal andere Node-Version als in Pipeline → Build-Differenzen. `versionSpec` mit `package.json` "engines" abgleichen.
- **`npm ci` vs `npm install`**: `npm ci` ist deterministisch (braucht `package-lock.json`) und in CI immer vorzuziehen.
