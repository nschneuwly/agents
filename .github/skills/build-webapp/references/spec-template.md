# Spezifikations-Template

Verwende dieses Template, um nach dem Interview die Spezifikation als `SPEC.md` im Zielverzeichnis zu erstellen. Ersetze alle Platzhalter mit den Interview-Antworten. Entferne Abschnitte die nicht relevant sind.

---

```markdown
# App-Spezifikation: {{APP_NAME}}

## Zusammenfassung

| Eigenschaft | Wert |
|-------------|------|
| Name | `{{APP_NAME}}` |
| Beschreibung | {{BESCHREIBUNG}} |
| Zielgruppe | {{ZIELGRUPPE}} |
| Zielgeräte | {{GERAETE}} |
| Theme | {{THEME}} |
| Sprachen | {{SPRACHEN}} (Fallback: {{FALLBACK_LANG}}) |
| WebMap | `{{WEBMAP_ITEM_ID}}` |
| Portal | {{PORTAL_URL}} |

## Layout

**Typ**: {{LAYOUT_TYP}}

### Wireframe (ASCII)

{{ASCII_WIREFRAME}}

Beispiel für "Karte mit Sidebar links":
```
┌──────────────────────────────────────────┐
│ Header (Titel, Logo)                     │
├────────────┬─────────────────────────────┤
│  Sidebar   │                             │
│  (280px)   │         Map                 │
│            │                             │
│  - Widget  │                             │
│  - Filter  │                             │
│            │                             │
├────────────┴─────────────────────────────┤
│ Footer (Koordinaten, Massstab)           │
└──────────────────────────────────────────┘
```

## Features

### Automatisch enthalten

Diese Features sind immer dabei und brauchen keine Konfiguration:

- Zoom (top-right)
- Home (top-right)
{{#IF_PUBLIC}}- Scale Bar (bottom-left){{/IF_PUBLIC}}
{{#IF_MOBILE}}- Locate / GPS (top-right){{/IF_MOBILE}}

### Gewählte Features

| Feature | Skill | Konfiguration |
|---------|-------|---------------|
{{FEATURE_TABELLE}}

Beispiel:
| Basemap Switcher | `add-basemap-switcher` | Quelle: Standard (Esri Default) |
| Höhenprofil | `add-elevation-profile` | Interaktiv bei Route-Selektion |
| Custom Popup | — | React-Komponente für Feature-Info |
| Legend | — | Expand-Widget (top-left) |

### Nicht enthalten

{{NICHT_ENTHALTENE_FEATURES}}

## Branding

| Aspekt | Wert |
|--------|------|
| Theme | {{THEME}} |
| Primärfarbe | {{PRIMAERFARBE}} |

## Technische Architektur

### Projektstruktur

```
{{APP_NAME}}/
├── .vscode/
│   └── mcp.json
├── package.json
├── tsconfig.json
├── vite.config.js
├── biome.json
├── src/
│   ├── index.html
│   ├── index.tsx
│   ├── vite.env.d.ts
│   ├── app.d.ts
{{#IF_I18N}}
│   ├── i18n.ts
{{/IF_I18N}}
{{#IF_AUTH}}
│   ├── PortalAuth.ts
{{/IF_AUTH}}
│   ├── components/
│   │   ├── App.tsx
│   │   ├── App.css
{{KOMPONENTEN_LISTE}}
│   ├── store/
│   │   └── AppStore.tsx
│   ├── hooks/
{{HOOKS_LISTE}}
│   ├── config/
│   │   ├── config.ts
│   │   └── config.json
{{#IF_I18N}}
│   └── lang/
│       ├── translations.json
│       ├── model.ts
│       └── util.ts
{{/IF_I18N}}
└── public/
    ├── CHANGELOG.md
    └── config/
        └── config.json
```

### Zustand Store Shape

```typescript
interface AppStoreState {
  // Config
  config: Config

  // Map
  view: MapView | null
  setView: (view: MapView) => void

{{STORE_FELDER}}
}
```

### Config Schema (Zod)

```typescript
const ConfigSchema = z.object({
  portalUrl: z.url(),
  webmapId: z.string().trim().min(1),
{{#IF_AUTH}}
  clientId: z.string().trim().min(1),
{{/IF_AUTH}}
{{CONFIG_FELDER}}
})
```

### Komponenten-Übersicht

| Komponente | Beschreibung | Eigener Ordner |
|------------|--------------|----------------|
{{KOMPONENTEN_TABELLE}}

### Benötigte ArcGIS Module

```
{{ARCGIS_MODULE_LISTE}}
```

### Benötigte Calcite Komponenten

```
{{CALCITE_KOMPONENTEN_LISTE}}
```

## Offene Punkte / Annahmen

{{OFFENE_PUNKTE}}
```

---

## Hinweise zur Erstellung

- Entferne Abschnitte die nicht relevant sind (z.B. Editing-Tabelle wenn kein Editing)
- Ersetze `{{#IF_...}}` Blöcke durch tatsächlichen Inhalt oder entferne sie
- Das ASCII-Wireframe soll das tatsächliche Layout widerspiegeln
- Store-Felder sollen alle gewählten Features abbilden
- Unter "Offene Punkte" Annahmen dokumentieren, die der Agent getroffen hat
