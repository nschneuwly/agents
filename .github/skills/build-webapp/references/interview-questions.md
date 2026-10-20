# Interview-Fragen (kompakt)

Das Interview besteht aus **6 Schritten**. Jeder Schritt ist ein `vscode_askQuestions`-Aufruf. Nur Kernentscheidungen werden abgefragt — Details ergeben sich oder werden von Feature-Skills behandelt.

## Schritt 1: Zweck & Zielgruppe

| Frage | Typ | Optionen |
|-------|-----|----------|
| Was soll die App tun? (1-2 Sätze) | Freitext | — |
| Wer ist die Zielgruppe? | Single-Select | Öffentlichkeit, Interne Mitarbeiter, Spezifische Fachrolle |

## Schritt 2: Karte & Portal

| Frage | Typ | Default |
|-------|-----|---------|
| WebMap Item-ID | Freitext | *(kann später in config.json gesetzt werden)* |
| Portal-URL | Freitext | `https://www.arcgis.com` |

Hinweis: Die WebMap definiert CRS, Basemap, Layer, initiale Ausdehnung, Popups und Symbologie. Diese werden nicht separat konfiguriert.

## Schritt 3: Geräte & Layout

| Frage | Typ | Optionen | Default |
|-------|-----|----------|---------|
| Für welche Geräte? | Single-Select | Nur Desktop, Nur Mobile, Beides (Responsive) | Beides |
| Layout-Typ | Single-Select | *(abhängig von Geräte-Wahl, siehe unten)* | — |

### Layout-Optionen je Geräte-Wahl:

**Nur Mobile:** Vollbild-Karte, Karte mit Bottom-Sheet, Karte mit Header
**Nur Desktop:** Vollbild-Karte, Karte mit Sidebar, Karte mit Header, Dashboard, Split-View
**Beides:** Vollbild-Karte, Karte mit Sidebar (kollabiert auf Mobile), Karte mit Header, Dashboard (stacked auf Mobile)

## Schritt 4: Sprachen

| Frage | Typ | Optionen | Default |
|-------|-----|----------|---------|
| Mehrsprachigkeit? | Single-Select | Ja, Nein | Ja |

Falls Ja:
| Frage | Typ | Optionen | Default |
|-------|-----|----------|---------|
| Welche Sprachen? | Multi-Select | Deutsch (de), Französisch (fr), Italienisch (it), Englisch (en) | de, fr |
| Fallback-Sprache? | Single-Select | *(aus gewählten)* | de |

## Schritt 5: Features (intelligenter Vorschlag)

Der Agent erstellt einen **Vorschlag** basierend auf:
- Zweck der App (Schritt 1)
- Zielgruppe (Schritt 1)
- Zielgeräte & Layout (Schritt 3)

### Vorschlags-Logik:

**Immer dabei (nicht aufgelistet, automatisch):**
- Zoom, Home

**Automatisch bei öffentlicher App:**
- Scale Bar

**Automatisch bei Mobile:**
- Locate (GPS)

**Der Vorschlag enthält nur die optionalen Features.** Der Agent wählt aus:

| Feature | Typischer Einsatz |
|---------|------------------|
| Authentifizierung (OAuth gegen ArcGIS Portal) | Interne Apps, geschützte Daten |
| Basemap Switcher | Fast immer sinnvoll |
| Legend | Layer mit Symbologie |
| Layer List | Viele Layer |
| Suche (Geocoding) | Adresssuche, Ortssuche |
| Messwerkzeuge | Fach-Apps (Planer, Ingenieure) |
| Print | Desktop-Fach-Apps |
| Bookmarks | Vordefinierte Kartenausschnitte |
| Höhenprofil | Routen, Wandern, Velo |
| Editing | Datenerfassung, Meldungen |
| Attribut-Filter | Daten nach Kategorie filtern |
| Tabellenansicht | Daten-Viewer, Dashboard |
| Routing | Navigation, Wegbeschreibung |
| Custom Popup | Eigene Feature-Info-Darstellung |

### Vorgehen:

1. Zeige den Vorschlag als `message` mit Begründung
2. Frage: "Passt dieser Vorschlag? Du kannst Features hinzufügen oder entfernen."
3. User bestätigt oder passt an (Freitext)

## Schritt 6: Branding & App-Name

| Frage | Typ | Optionen | Default |
|-------|-----|----------|---------|
| Farbschema | Single-Select | Light, Dark, Auto | Light |
| Eigene Primärfarbe? | Single-Select | Nein (Calcite Default), Hex-Code angeben, Von URL ableiten | Nein |
| App-Name | Freitext | *(automatischer Vorschlag basierend auf Zweck)* | — |

Falls "Von URL ableiten": Agent öffnet die URL, identifiziert die Primärfarbe und schlägt sie vor.
Falls "Hex-Code angeben": Zusätzliche Freitext-Frage für den Hex-Wert.

Zeige den App-Namen-Vorschlag als `message` an:
> "Basierend auf deiner Beschreibung schlage ich vor: **`{vorschlag}`**"

---

## Ableitungsregeln

Nach dem Interview leitet der Agent folgendes automatisch ab:

| Gewähltes Feature | Erzeugt automatisch |
|---|---|
| Authentifizierung | `PortalAuth.ts`, `clientId` + `portalUrl` in Config, Auth-Init in `index.tsx` |
| Basemap Switcher | Basemap-Gallery Widget (Standard-Quelle: Esri Default) |
| Suche | Search Widget (Standard-Quelle: ArcGIS World Geocoder) |
| Editing | Editor Widget (Formular: wie in WebMap definiert) |
| Höhenprofil | ElevationProfile Widget |
| Custom Popup | `popupEnabled = false` auf View, eigene React-Komponente |
| Mehrsprachigkeit | i18n-Dateien, Dependencies, Sprachwechsler |
| Tabellenansicht | Feature Table Widget |
| Mobile | Locate (GPS) Widget |
| Öffentlich | Scale Bar |

Diese Defaults werden in der Spec dokumentiert. Falls der User andere Konfiguration braucht (z.B. Portal-Gruppe für Basemaps statt Standard), kann er das im Spec-Review anpassen — dann wird der entsprechende `add-*` Skill mit Details aufgerufen.
