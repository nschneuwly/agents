---
name: build-webapp
description: "Erstellt eine massgeschneiderte Karten-Webapp durch geführtes Interview, Spezifikation und Umsetzung. Verwende diesen Skill wenn: App planen, App designen, Webapp mit Anforderungen bauen, Karten-App nach Bedürfnissen erstellen, guided app creation, spec-based app."
argument-hint: "Kurze Beschreibung was die App tun soll (optional)"
---

# Build Webapp — Guided Spec & Implementation

Erstellt eine massgeschneiderte React + ArcGIS Karten-Webapp durch ein kurzes Interview, generiert eine Spezifikation zur Prüfung und baut die App nach Freigabe.

## Context7 verwenden

Beim Erstellen von Code, der ArcGIS Maps SDK oder Calcite Design System verwendet, **immer** Context7 nutzen um aktuelle API-Docs abzurufen:

- `@arcgis/map-components` — Web Components für Map, Widgets
- `@esri/calcite-components` — UI-Komponenten
- `@arcgis/core` — Core SDK (bei Bedarf)

## Wann verwenden

- User möchte eine Karten-App mit spezifischen Anforderungen bauen
- Anforderungen sind unklar und müssen erarbeitet werden
- Komplexere App mit mehreren Features (Widgets, Editing, Analyse, etc.)

## Workflow-Überblick

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│  Interview  │ ──▶ │ Spec erzeugen│ ──▶ │ User prüft   │ ──▶ │  App bauen  │
│ (6 Schritte)│     │ (Schritt 2)  │     │ (Schritt 3)  │     │ (Schritt 4) │
└─────────────┘     └──────────────┘     └──────────────┘     └─────────────┘
                                               │
                                               ▼ Anpassungen?
                                          Zurück zu Spec
```

## Schritt 1: Interview (kurz)

Führe ein **kompaktes** Interview mit `vscode_askQuestions`. Nur Kernentscheidungen abfragen — Details ergeben sich aus der Wahl oder werden von Feature-Skills behandelt.

Die Fragenliste ist in [references/interview-questions.md](./references/interview-questions.md) definiert.

### Interview-Reihenfolge (6 Schritte):

1. **Zweck & Zielgruppe** — Was tut die App? Für wen?
2. **Karte & Portal** — WebMap-ID, Portal-URL
3. **Geräte & Layout** — Mobile/Desktop/Beides, Layout-Typ
4. **Sprachen** — Mehrsprachig? Welche?
5. **Features (Vorschlag)** — Agent schlägt passende Features vor basierend auf Zweck, Zielgruppe und Layout. User bestätigt oder passt an.
6. **Branding & App-Name** — Theme, Farben, Name

### Prinzipien:

- **Weniger fragen, mehr ableiten** — Was sich aus einer Entscheidung ergibt, wird nicht extra gefragt
- **Intelligenter Vorschlag** statt Einzelabfrage für Features/Widgets
- **Feature-Details delegieren** — Spezifische Konfiguration wird von den `add-*` Skills behandelt
- Biete sinnvolle Defaults an (als `recommended` markiert)

### Was sich automatisch ergibt (NICHT fragen):

| Entscheidung | Ergibt sich aus |
|---|---|
| Auth-Dateien (PortalAuth.ts, clientId in Config) | Feature "Auth" gewählt |
| Zoom, Home Widgets | Immer dabei |
| Scale Bar | Öffentliche App → immer |
| Locate (GPS) | Mobile → immer |
| CRS, Extent, Basemap | Immer aus WebMap |
| i18n-Setup (Dateien, Dependencies) | Sprachen > 0 gewählt |

## Schritt 2: Spezifikation generieren

Nach dem Interview, erstelle eine **Markdown-Spezifikation** als `SPEC.md`. Verwende das Template aus [references/spec-template.md](./references/spec-template.md).

Die Spec enthält:
- Zusammenfassung aller Entscheidungen
- Komponentenstruktur
- Store-Shape
- Config-Schema
- Welche Feature-Skills angewendet werden
- Layout-Wireframe

## Schritt 3: Review durch User

Zeige dem User die Spec und frage explizit:

> "Hier ist die Spezifikation. Bitte prüfe sie und sag mir:
> - Ist alles korrekt?
> - Soll etwas geändert/ergänzt/entfernt werden?
> - Oder soll ich mit der Umsetzung beginnen?"

Falls Änderungen: Spec anpassen, erneut fragen. Wiederhole bis Freigabe.

## Schritt 4: App bauen

Nach Freigabe der Spec, baue die App.

### 1. Basis-Dateien (aus `init-webapp`)

Erstelle die Basis exakt wie im `init-webapp` Skill:

- **[../init-webapp/SKILL.md](../init-webapp/SKILL.md)** — package.json, tsconfig.json, biome.json, vite.config.js, index.html, index.tsx, vite.env.d.ts, app.d.ts
- **[../init-webapp/references/architecture.md](../init-webapp/references/architecture.md)** — AppStore.tsx, i18n.ts, lang/*
- **[../init-webapp/references/arcgis-patterns.md](../init-webapp/references/arcgis-patterns.md)** — MapComponent, Calcite-Usage

### 2. Features implementieren (Feature-Skills)

Für jedes gewählte Feature, wende den entsprechenden `add-*` Skill an:

| Feature | Skill | Was es tut |
|---------|-------|-----------|
| Authentifizierung | [add-auth](../add-auth/SKILL.md) | PortalAuth.ts, Config-Felder, Auth-Init |
| Basemap Switcher | [add-basemap-switcher](../add-basemap-switcher/SKILL.md) | Basemap-Gallery Widget |
| Suche (Geocoding) | [add-search](../add-search/SKILL.md) | Search Widget, Quellen |
| Höhenprofil | [add-elevation-profile](../add-elevation-profile/SKILL.md) | ElevationProfile Widget |
| Editing | [add-editing](../add-editing/SKILL.md) | Editor Widget, Forms |
| Spracherkennung & Locale | [add-i18n-detection](../add-i18n-detection/SKILL.md) | Language Detection, Swiss Locales, Intl, ß→ss |

Für Widgets ohne eigenen Skill (Legend, Locate, etc.), verwende die Patterns aus [references/implementation-guide.md](./references/implementation-guide.md).

### 3. Layout & Styling

- Layout umsetzen gemäss Spec (Patterns in [references/implementation-guide.md](./references/implementation-guide.md))
- CSS-Variablen für Theme/Branding
- Responsive-Verhalten

### 4. Abschluss

1. Dependencies installieren — `npm install`
2. Biome formatieren — `npx @biomejs/biome check --write .`
3. Zusammenfassung zeigen

## Wichtige Konventionen

Alle Konventionen aus `init-webapp` gelten. Zusätzlich:
- WebMap als Datenquelle (CRS, Basemap, Layer sind dort definiert)
- Plain CSS (kein SCSS)
- Feature-Implementation via `add-*` Skills wo vorhanden
