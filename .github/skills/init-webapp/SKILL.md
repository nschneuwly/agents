---
name: init-webapp
description: "Erstellt eine neue React + ArcGIS JS Webapp mit TypeScript, Vite, Biome, Zustand, Zod, i18next und Calcite Design System. Verwende diesen Skill wenn: neues Projekt erstellen, Webapp scaffolden, Karten-App initialisieren, ArcGIS React App aufsetzen, Projekt-Setup, init project."
argument-hint: "Name der neuen App (optional)"
---

# Init Webapp — Guided Scaffolding

Erstellt eine neue React + ArcGIS JS Karten-Webapp basierend auf dem Esri Schweiz Template.

## Context7 verwenden

Beim Erstellen von Code, der ArcGIS Maps SDK oder Calcite Design System verwendet, **immer** Context7 nutzen um aktuelle API-Docs abzurufen:

- `@arcgis/map-components` — Web Components für Map, Widgets
- `@esri/calcite-components` — UI-Komponenten
- `@arcgis/core` — Core SDK (bei Bedarf)

Damit wird sichergestellt, dass generierte Patterns mit der aktuellen API übereinstimmen.

## Wann verwenden

- Neues Projekt / neue Webapp aufsetzen
- Karten-App mit ArcGIS Maps SDK initialisieren
- React + TypeScript Projekt-Scaffolding

## Tech Stack

| Technologie | Zweck |
|-------------|-------|
| React 19 | UI-Framework (funktionale Komponenten, Hooks) |
| TypeScript (strict) | Typsicherheit |
| Vite | Bundler & Dev-Server |
| Biome | Linting & Formatting (Tabs, Single Quotes, keine Semicolons) |
| Zustand | State Management (Context-basiert) |
| Zod | Runtime Schema-Validierung |
| i18next | Internationalisierung (optional) |
| ArcGIS Maps SDK | Karten & Geodaten (@arcgis/core, @arcgis/map-components) |
| Calcite Design System | UI-Komponenten (@esri/calcite-components) |
| Plain CSS | Styling |

## Vorgehen

### Schritt 1: Setup-Fragen stellen

Verwende das `vscode_askQuestions`-Tool um folgende Informationen abzufragen:

1. **App-Name**: Name der App (wird für `package.json` `name`, HTML `<title>` und Ordnername verwendet)
2. **Auth**: Wird OAuth-Authentifizierung (gegen ArcGIS Portal/Online) benötigt? Falls ja: `clientId` und `portalUrl` konfigurieren
3. **Config-Pattern**: Runtime-Config (`config.json` per HTTP geladen) oder Build-time Config (`.env`-Variablen) oder beides
4. **Übersetzungen (i18n)**: Werden Übersetzungen benötigt? (Ja/Nein)
   - Falls **Ja**: Welche Sprachen? Mehrfachauswahl, Default: `de`, `fr`, `it`, `en`. Fallback-Sprache ist `de`
   - Falls **Nein**: Kein i18next, keine `lang/`-Dateien, keine i18n-Dependencies
5. **AI Tooling (MCP-Server)**: Welche MCP-Server sollen vorkonfiguriert werden? Mehrfachauswahl mit sinnvollem Default:
   - **Playwright** (`@playwright/mcp`) — Browser-Automatisierung, UI-Testing, Screenshots *(Default: an)*
   - **Context7** (`@upstash/context7-mcp`) — Library-Dokumentation abrufen *(Default: an)*
   - **Keine** — Kein MCP-Setup

### Schritt 2: Projektstruktur erstellen

Erstelle folgende Ordnerstruktur im Zielverzeichnis:

```
<app-name>/
├── .gitignore
├── .vscode/
│   └── mcp.json                 # (MCP-Server, falls gewählt)
├── package.json
├── tsconfig.json
├── vite.config.js
├── biome.json
├── src/
│   ├── index.html
│   ├── index.tsx
│   ├── i18n.ts               # (nur bei i18n)
│   ├── vite.env.d.ts
│   ├── app.d.ts
│   ├── components/
│   │   └── MapComponent/
│   │       ├── MapComponent.tsx
│   │       └── MapComponent.css
│   ├── store/
│   │   └── AppStore.tsx
│   ├── hooks/
│   ├── config/
│   │   ├── config.ts
│   │   └── config.json          # (nur bei Runtime-Config)
│   └── lang/                    # (nur bei i18n)
│       ├── translations.json
│       ├── model.ts
│       └── util.ts
└── public/
    ├── CHANGELOG.md
    └── config/
        └── config.json          # (nur bei Runtime-Config)
```

### Schritt 3: Dateien erstellen

Erstelle die Dateien gemäss den folgenden Vorlagen. Passe Platzhalter an die Setup-Antworten an.

---

#### `.gitignore`

```
node_modules
dist
```

#### `package.json`

```json
{
	"name": "{{APP_NAME}}",
	"version": "1.0.0",
	"description": "{{APP_NAME}} — React + ArcGIS Webapp",
	"type": "module",
	"scripts": {
		"build": "vite build",
		"dev": "vite serve",
		"preview": "vite preview",
		"patch": "npm version patch -m \"VERSION %s\""
	},
	"dependencies": {
		"@arcgis/core": "^5.0.19",
		"@arcgis/map-components": "^5.0.19",
		"@esri/arcgis-rest-portal": "^4.10.2",
		"@esri/arcgis-rest-request": "^4.10.2",
		"@esri/calcite-components": "^5.0.2",
		"react": "^19.2.5",
		"react-dom": "^19.2.5",
		"zod": "^4.4.3",
		"zustand": "^5.0.13"
	},
	"devDependencies": {
		"@biomejs/biome": "^2.4.14",
		"@types/react": "^19.2.14",
		"@types/react-dom": "^19.2.3",
		"@vitejs/plugin-basic-ssl": "^2.3.0",
		"@vitejs/plugin-react": "^6.0.1",
		"tslib": "^2.8.1",
		"typescript": "^6.0.2",
		"vite": "^8.0.8",
		"vite-plugin-static-copy": "^4.0.1"
	}
}
```

Falls **i18n aktiviert**, zusätzlich diese Dependencies aufnehmen:

```json
		"i18next": "^26.0.8",
		"i18next-browser-languagedetector": "^8.2.1",
		"react-i18next": "^17.0.6",
```

#### `tsconfig.json`

```json
{
	"compilerOptions": {
		"target": "ES2023",
		"lib": ["DOM", "DOM.Iterable", "ES2023"],
		"jsx": "react-jsx",
		"module": "ESNext",
		"moduleResolution": "bundler",
		"resolveJsonModule": true,
		"verbatimModuleSyntax": true,
		"noEmit": true,
		"strict": true,
		"noUncheckedIndexedAccess": true,
		"noFallthroughCasesInSwitch": true,
		"forceConsistentCasingInFileNames": true,
		"skipLibCheck": true
	},
	"include": ["./src/**/*"]
}
```

#### `biome.json`

```json
{
	"$schema": "https://biomejs.dev/schemas/2.4.12/schema.json",
	"vcs": {
		"enabled": false,
		"clientKind": "git",
		"useIgnoreFile": false
	},
	"files": {
		"ignoreUnknown": false
	},
	"formatter": {
		"enabled": true,
		"indentStyle": "tab"
	},
	"linter": {
		"enabled": true,
		"rules": {
			"recommended": true,
			"a11y": {
				"useKeyWithClickEvents": "off"
			},
			"complexity": {
				"noForEach": "off"
			}
		}
	},
	"javascript": {
		"formatter": {
			"quoteStyle": "single",
			"semicolons": "asNeeded",
			"arrowParentheses": "asNeeded"
		}
	}
}
```

#### `vite.config.js`

```js
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	server: {
		host: true,
		open: true,
	},
	root: 'src',
	envDir: '../',
	build: {
		outDir: '../dist',
		chunkSizeWarningLimit: 1500,
		rolldownOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules/@arcgis/') || id.includes('node_modules/@esri/')) {
						return 'vendor-arcgis'
					}
				},
			},
		},
	},
	base: './',
	plugins: [
		basicSsl(),
		react({
			include: '**/*.{jsx,tsx}',
		}),
	],
})
```

#### `src/index.html`

```html
<!DOCTYPE html>
<html lang="{{FALLBACK_LANG}}-CH">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
	<meta name="mobile-web-app-capable" content="yes" />
	<title>{{APP_NAME}}</title>
</head>
<body>
	<script type="module" src="./index.tsx"></script>
	<div id="root"></div>
</body>
</html>
```

#### `src/index.tsx` (mit Runtime-Config)

```tsx
import { createRoot } from 'react-dom/client'
import App from './components/App'
// I18N_IMPORT_PLACEHOLDER
import * as z from 'zod'
import { AppStoreProvider } from './store/AppStore'
import { ConfigSchema } from './config/config'
// AUTH_IMPORT_PLACEHOLDER

const root = createRoot(document.getElementById('root') as HTMLElement)

fetch('config/config.json').then(res => res.json()).then(async config => {
	const parsedConfig = ConfigSchema.safeParse(config)

	if (parsedConfig.success) {
		// AUTH_INIT_PLACEHOLDER
		root.render(
			<AppStoreProvider config={parsedConfig.data}>
				<App />
			</AppStoreProvider>,
		)
	} else {
		root.render(
			<div style={{ padding: 20, fontSize: 15, color: 'red' }}>
				Invalid config!
				<div style={{ color: 'black', marginTop: 10, whiteSpace: 'pre-line' }}>
					{z.prettifyError(parsedConfig.error)}
				</div>
			</div>,
		)
	}
})
```

Falls **Auth aktiviert** ist, ersetze die Platzhalter:

```tsx
// AUTH_IMPORT_PLACEHOLDER →
import { getCredential, signIn } from './PortalAuth'

// AUTH_INIT_PLACEHOLDER →
try {
	await signIn(parsedConfig.data.clientId, parsedConfig.data.portalUrl)
} catch (_err) {
	getCredential(parsedConfig.data.portalUrl)
}
```

Falls **i18n aktiviert**, ersetze den Platzhalter:

```tsx
// I18N_IMPORT_PLACEHOLDER →
import './i18n'
```

Falls **kein i18n**, entferne die Zeile `// I18N_IMPORT_PLACEHOLDER`.

#### `src/index.tsx` (mit Build-time Config / .env)

Falls nur `.env`-Config gewählt wurde, lade die Config aus `import.meta.env` statt per HTTP:

```tsx
import { createRoot } from 'react-dom/client'
import App from './components/App'
import './i18n'
import { AppStoreProvider } from './store/AppStore'
import { ConfigSchema } from './config/config'

const root = createRoot(document.getElementById('root') as HTMLElement)

const config = {
	portalUrl: import.meta.env.VITE_PORTAL_URL,
	clientId: import.meta.env.VITE_CLIENT_ID,
	// weitere Felder aus .env hier mappen
}

const parsedConfig = ConfigSchema.safeParse(config)

if (parsedConfig.success) {
	root.render(
		<AppStoreProvider config={parsedConfig.data}>
			<App />
		</AppStoreProvider>,
	)
} else {
	root.render(
		<div style={{ padding: 20, fontSize: 15, color: 'red' }}>
			Invalid config!
		</div>,
	)
}
```

#### `src/vite.env.d.ts`

```ts
/// <reference types="vite/client" />
/// <reference types="@arcgis/map-components/types/react" />
/// <reference types="@esri/calcite-components/types/react" />
```

#### `src/app.d.ts`

```ts
declare module '*.png'
```

#### `src/i18n.ts` (nur bei i18n)

Siehe [Architektur-Referenz](./references/architecture.md) für das i18n-Setup. Erstelle die Datei mit den gewählten Sprachen und Fallback-Sprache `de`.

#### `src/store/AppStore.tsx`

Siehe [Architektur-Referenz](./references/architecture.md) für das Zustand-Store-Pattern (Context-basiert).

#### `src/components/MapComponent/MapComponent.tsx`

Siehe [ArcGIS-Patterns-Referenz](./references/arcgis-patterns.md) für die Map-Komponente.

#### `src/config/config.ts` (Zod-Schema)

Erstelle das Schema passend zu den gewählten Config-Feldern:

```ts
import * as z from 'zod'

export const ConfigSchema = z.object({
	portalUrl: z.url(),
	clientId: z.string().trim().min(1),
	// Weitere Felder je nach App-Bedarf
})

export type Config = z.infer<typeof ConfigSchema>
```

#### `src/PortalAuth.ts` (nur bei Auth)

```ts
import esriId from '@arcgis/core/identity/IdentityManager'
import OAuthInfo from '@arcgis/core/identity/OAuthInfo'

export const signIn = async (appId: string, portalUrl: string) => {
	const info = new OAuthInfo({
		appId: appId,
		portalUrl: portalUrl,
		popup: false,
	})
	esriId.registerOAuthInfos([info])
	return esriId.checkSignInStatus(`${info.portalUrl}/sharing`)
}

export const getCredential = async (portalUrl: string) => {
	return esriId.getCredential(`${portalUrl}/sharing`)
}
```

### Schritt 4: AI Tooling / MCP-Server konfigurieren

Falls MCP-Server gewählt wurden, erstelle `.vscode/mcp.json` im Projektverzeichnis.

**Default-Setup** (Playwright + Context7):

```json
{
	"servers": {
		"playwright": {
			"command": "npx",
			"args": ["@playwright/mcp@latest"]
		},
		"context7": {
			"command": "npx",
			"args": ["-y", "@upstash/context7-mcp@latest"]
		}
	}
}
```

Falls nur einzelne Server gewählt wurden, nur die entsprechenden Einträge aufnehmen.

### Schritt 5: Azure SWA Pipeline (optional)

Frage ob eine Azure Static Web Apps Pipeline erstellt werden soll. Falls ja, siehe [Azure SWA Referenz](./references/azure-swa.md).

### Schritt 6: Dependencies installieren

Führe `npm install` im Projektverzeichnis aus.

### Schritt 7: Biome formatieren

Führe `npx @biomejs/biome check --write .` aus um alle Dateien zu formatieren.

### Schritt 8: Zusammenfassung

Zeige dem User eine Zusammenfassung:
- Erstellte Projektstruktur
- Gewählte Optionen (Auth, Config-Pattern, Sprachen, MCP-Server)
- Nächste Schritte: `npm run dev` zum Starten

## Wichtige Konventionen

- **Funktionale Komponenten** mit `FC`-Type, default exports
- **Zustand Store**: Context-basiert, nicht vanilla module-level
- **Selektoren**: Immer fine-grained (`useAppStore(s => s.value)`)
- **Calcite**: Web-Component-Elemente direkt in JSX, keine React-Wrapper
- **ArcGIS**: Map Components als Web Components, `reactiveUtils` für Property-Watching
- **Biome**: Tabs, Single Quotes, keine Semicolons, `recommended` Ruleset
- **Kein `any`**: Verwende `unknown` mit Narrowing
- **Kein `as`-Cast**: Verwende Type Guards
- **Kein Non-Null-Assertion `!`**: Verwende Narrowing oder Early Returns
