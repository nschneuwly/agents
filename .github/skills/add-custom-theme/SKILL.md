---
name: add-custom-theme
description: "Erstellt ein Custom Styling für Calcite-Komponenten und ArcGIS-Map-Komponenten in einer ArcGIS React Webapp. Verwende diesen Skill wenn: Farben anpassen, Brand-Farbe setzen, Schriftart ändern, Border-Radius ändern, Dark Mode, Calcite theming, CSS-Variablen, custom colors, custom font, eigenes Design, Firmen-CI, App stylen."
argument-hint: "Farbe (Hex), Schriftart, border-radius, dark/light (optional)"
---

# Add Custom Theme — Calcite & ArcGIS Styling

Passt das visuelle Erscheinungsbild der App an — Markenfarbe, Schrift, Border-Radius, Hell-/Dunkel-Modus — über das offizielle **CSS Custom Properties**-System von Calcite.

## Wann verwenden

- Firmen-CI / Brand-Farbe auf alle Calcite-Komponenten anwenden
- Eigene Schriftart einbinden
- Eckenradius (rund vs. eckig) app-weit festlegen
- Dark-Mode aktivieren oder umschalten
- Einzelne Komponenten abweichend stylen (z.B. nur eine Button-Gruppe anders)

## Architektur-Prinzipien (MUSS beachtet werden)

### ✅ Korrekt: CSS Custom Properties

Calcite-Komponenten sind Web Components mit Shadow DOM. Der **einzig stabile, offizielle Weg** sie zu stylen ist über **CSS Custom Properties** (CSS-Variablen), die durch den Shadow DOM propagieren:

```css
:root {
  --calcite-color-brand: #007ac2;
  --calcite-corner-radius: 2px;
}
```

### ❌ Falsch: Shadow DOM direkt manipulieren

```css
/* NICHT so — bricht bei Updates und funktioniert nicht zuverlässig */
calcite-button::shadow button { background: red; }
calcite-button .button { ... }
```

### ❌ Falsch: `::part()` für globale Styles

`::part()` ist für sehr spezifische, lokale Einzel-Overrides reserviert, nicht für app-weites Theming.

---

## Theming-Ebenen

Es gibt **zwei Ebenen**, die sich ergänzen:

| Ebene | Scope | Beispiel |
|---|---|---|
| **Global Tokens** | Alle Calcite-Komponenten | `--calcite-color-brand`, `--calcite-corner-radius`, `--calcite-font-family` |
| **Komponenten-Tokens** | Eine Komponente | `--calcite-button-corner-radius`, `--calcite-input-background-color` |

Komponenten-Tokens überschreiben Global Tokens für die jeweilige Komponente.

---

## Farbsystem verstehen

Calcite kennt **drei Oberflächen-Ebenen** (Surface-Hierarchie), die direkt auf die Calcite-Farbtokens abbilden:

| Ebene | Calcite-Token (Hintergrund) | Calcite-Token (Text) | Bedeutung |
|---|---|---|---|
| **App-Hintergrund** | `--calcite-color-foreground-3` | `--calcite-color-text-1` | Ganz äussere Seite / Page-Bg |
| **Panel / Card** | `--calcite-color-background` | `--calcite-color-text-1` | Panels, Karten, Seitenleisten |
| **Overlay / Popup** | `--calcite-color-foreground-1` | `--calcite-color-text-1` | Dropdowns, Tooltips, Dialoge |
| **Sekundärer Overlay** | `--calcite-color-foreground-2` | `--calcite-color-text-2` | List-Items, Table-Rows |

Interaktive Elemente (Buttons, List-Items, Hover-States) werden über **Komponenten-Tokens** gesteuert (siehe unten) — es gibt keinen einzigen globalen «Interaktions-Farb»-Token.

---

## Verfügbare Global Tokens

### Marken- & Brand-Farben

| Token | Bedeutung | Beispiel |
|---|---|---|
| `--calcite-color-brand` | Primärfarbe (Buttons, aktive Elemente) | `#007ac2` |
| `--calcite-color-brand-hover` | Primärfarbe hover | `#00619b` |
| `--calcite-color-brand-press` | Primärfarbe pressed | `#2890ce` |
| `--calcite-color-brand-underline` | Link-Unterstreichung (Brand-Farbe, halbtransparent) | `color-mix(in srgb, #007ac2 60%, transparent)` |

> Es gibt **keine Secondary-Brand-Farbe** als globalen Calcite-Token. Sekundärfarben werden pro Komponente gesetzt (z.B. Buttons mit `appearance="outline-fill"`).

### Oberflächen- & Hintergrundfarben

| Token | Bedeutung | Light | Dark |
|---|---|---|---|
| `--calcite-color-foreground-3` | App-/Seiten-Hintergrund | `#f3f3f3` | `#151515` |
| `--calcite-color-background` | Panel-/Card-Hintergrund | `#ffffff` | `#2b2b2b` |
| `--calcite-color-foreground-1` | Overlay-/Popup-Hintergrund | `#ffffff` | `#2b2b2b` |
| `--calcite-color-foreground-2` | Sekundärer Listenhintergrund | `#f3f3f3` | `#353535` |

### Textfarben

| Token | Bedeutung | Light | Dark |
|---|---|---|---|
| `--calcite-color-text-1` | Primäre Textfarbe | `#151515` | `#ffffff` |
| `--calcite-color-text-2` | Sekundäre / Beschriftungs-Text | `#4a4a4a` | `#c8c8c8` |
| `--calcite-color-text-3` | Hint- / Placeholder-Text | `#757575` | `#9a9a9a` |
| `--calcite-color-text-inverse` | Text auf Brand-farbigem Hintergrund | `#ffffff` | `#151515` |
| `--calcite-color-text-link` | Link-Farbe | `#007ac2` | `#59b3e2` |

### Rahmenfarben

| Token | Bedeutung | Light | Dark |
|---|---|---|---|
| `--calcite-color-border-1` | Primäre Trennlinie (kräftig) | `#cacaca` | `#555` |
| `--calcite-color-border-2` | Sekundäre Trennlinie | `#dfdfdf` | `#444` |
| `--calcite-color-border-3` | Tertiäre Trennlinie (subtil) | `#eaeaea` | `#333` |
| `--calcite-color-border-input` | Input-Feld-Rahmen | `#949494` | `#666` |

### Status- & Fokus-Farben

| Token | Bedeutung |
|---|---|
| `--calcite-color-focus` | Fokus-Ring (Tastatur-Navigation) |
| `--calcite-color-status-info` | Info |
| `--calcite-color-status-info-hover` | Info hover |
| `--calcite-color-status-info-press` | Info pressed |
| `--calcite-color-status-success` | Erfolg |
| `--calcite-color-status-success-hover` | Erfolg hover |
| `--calcite-color-status-success-press` | Erfolg pressed |
| `--calcite-color-status-warning` | Warnung |
| `--calcite-color-status-warning-hover` | Warnung hover |
| `--calcite-color-status-warning-press` | Warnung pressed |
| `--calcite-color-status-danger` | Fehler |
| `--calcite-color-status-danger-hover` | Fehler hover |
| `--calcite-color-status-danger-press` | Fehler pressed |

### Eckenradius & Schatten

| Token | Angewendet auf | Standard |
|---|---|---|
| `--calcite-corner-radius` | Buttons, Chips, kleine Elemente | `4px` |
| `--calcite-corner-radius-sharp` | Alias für `--calcite-corner-radius` | `4px` |
| `--calcite-corner-radius-round` | Panels, Dropdowns, grössere Elemente | `8px` |
| `--calcite-shadow-sm` | Kleiner Schatten | `0 1px 2px rgba(0,0,0,.15)` |
| `--calcite-shadow-md` | Mittlerer Schatten | `0 4px 8px rgba(0,0,0,.15)` |

> **Input-Feld-Radius**: Es gibt keinen globalen Input-Radius-Token. Input-Felder übernehmen `--calcite-corner-radius`, können aber pro Komponente überschrieben werden: `--calcite-input-corner-radius`, `--calcite-input-text-corner-radius`, `--calcite-input-number-corner-radius`, `--calcite-select-corner-radius`, `--calcite-input-date-picker-corner-radius`.

### Schrift

| Token | Bedeutung | Standard |
|---|---|---|
| `--calcite-font-family` | Schriftfamilie für alle Calcite-Komponenten | `"Avenir Next", …` |
| `--calcite-font-weight-light` | Light | `300` |
| `--calcite-font-weight-normal` | Regular (Alias) | `400` |
| `--calcite-font-weight-regular` | Regular | `400` |
| `--calcite-font-weight-medium` | Medium | `500` |
| `--calcite-font-weight-semibold` | Semi-Bold | `600` |
| `--calcite-font-weight-bold` | Bold | `700` |

> **Schriftgrössen**: `--calcite-font-size-xs` … `--calcite-font-size-xxl` sind in Calcite **fest codierte Konstanten** (0.625 rem bis 1.5 rem) und nicht für app-weites Theming vorgesehen. Die Basisgrösse der App wird über `html { font-size: ... }` gesteuert — da Calcite `rem` verwendet, skalieren alle Komponenten proportional mit.

---

## Dark Mode

Calcite unterstützt Dark Mode über eine CSS-Klasse auf dem Wurzelelement:

```html
<div class="calcite-mode-dark">
  <!-- Alle Calcite-Komponenten hier sind dunkel -->
</div>
```

Wichtig: Die Klasse kann auf `<body>`, dem App-Root oder einem beliebigen Container gesetzt werden.

---

## Implementation

### Variante A: Einfaches Brand-Theming (nur App.scss)

Für einfache Anpassungen reicht es, CSS-Variablen in `App.scss` zu setzen:

```scss
// App.scss
:root {
  // Brand-Farbe (generiert hover/press automatisch wenn nicht gesetzt)
  --calcite-color-brand: #007ac2;
  --calcite-color-brand-hover: #00619b;
  --calcite-color-brand-press: #2890ce;

  // Schriftart
  --calcite-font-family: 'Inter', 'Avenir Next', sans-serif;
  --calcite-font-weight-semibold: 600;

  // Eckenradius — 0px für eckig, 4px Standard, 999px für komplett rund
  --calcite-corner-radius: 4px;
  --calcite-corner-radius-round: 8px;
}
```

### Variante B: Vollständiges Light/Dark-Theming mit ThemeProvider

Für komplettes Theming mit Dark-Mode-Unterstützung:

#### 1. ThemeProvider-Komponente erstellen

`src/App/Components/ThemeProvider.tsx`:

```tsx
import type { FC, ReactNode } from 'react'
import useAppStore from '../Store/AppStore'

interface ThemeProviderProps {
	children: ReactNode
}

const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
	const darkMode = useAppStore(s => s.darkMode)

	return (
		<div className={darkMode ? 'calcite-mode-dark app-theme' : 'app-theme'}>
			{children}
		</div>
	)
}

export default ThemeProvider
```

#### 2. Theme-Variablen in App.scss definieren

```scss
// App.scss

// ─── Shared (Light + Dark) ─────────────────────────────────────────────────
.app-theme {
  // Schrift
  --calcite-font-family: 'Inter', 'Avenir Next', Arial, sans-serif;

  // Eckenradius
  --calcite-corner-radius: 2px;
  --calcite-corner-radius-round: 4px;

  // Brand-Farbe
  --calcite-color-brand: #007ac2;
  --calcite-color-brand-hover: #00619b;
  --calcite-color-brand-press: #2890ce;

  // Status-Farben
  --calcite-color-status-danger: #d83020;
  --calcite-color-status-success: #35ac46;
  --calcite-color-status-warning: #edd317;
  --calcite-color-status-info: #007ac2;

  // Fokus-Ring in Brand-Farbe
  --calcite-color-focus: var(--calcite-color-brand);
}

// ─── Light Mode ────────────────────────────────────────────────────────────
.app-theme:not(.calcite-mode-dark) {
  // Oberflächen (App-Bg → Panel → Overlay)
  --calcite-color-foreground-3: #f3f3f3;   // App-/Seiten-Hintergrund
  --calcite-color-background: #ffffff;      // Panel / Card
  --calcite-color-foreground-1: #ffffff;    // Dropdown / Dialog
  --calcite-color-foreground-2: #f3f3f3;   // List-Item Bg

  // Text
  --calcite-color-text-1: #151515;
  --calcite-color-text-2: #4a4a4a;
  --calcite-color-text-3: #757575;
  --calcite-color-text-inverse: #ffffff;
  --calcite-color-text-link: #007ac2;

  // Rahmen
  --calcite-color-border-1: #cacaca;
  --calcite-color-border-2: #dfdfdf;
  --calcite-color-border-3: #eaeaea;
  --calcite-color-border-input: #949494;
}

// ─── Dark Mode ─────────────────────────────────────────────────────────────
.app-theme.calcite-mode-dark {
  // Oberflächen
  --calcite-color-foreground-3: #151515;
  --calcite-color-background: #2b2b2b;
  --calcite-color-foreground-1: #2b2b2b;
  --calcite-color-foreground-2: #353535;

  // Text
  --calcite-color-text-1: #ffffff;
  --calcite-color-text-2: #c8c8c8;
  --calcite-color-text-3: #9a9a9a;
  --calcite-color-text-inverse: #151515;
  --calcite-color-text-link: #59b3e2;

  // Rahmen
  --calcite-color-border-1: #555;
  --calcite-color-border-2: #444;
  --calcite-color-border-3: #333;
  --calcite-color-border-input: #666;
}
```

#### 3. Store um darkMode erweitern

```ts
// In AppStoreState:
darkMode: boolean
toggleDarkMode: () => void
```

```ts
// In createAppStore:
darkMode: false,
toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
```

#### 4. ThemeProvider in App.tsx einbinden

```tsx
// App.tsx
import ThemeProvider from './Components/ThemeProvider'

const App: FC = () => (
  <ThemeProvider>
    {/* ... restlicher App-Inhalt ... */}
  </ThemeProvider>
)
```

---

### Variante C: Komponenten-spezifische Overrides

Einzelne Komponenten können abweichend gestylt werden. Tokens auf dem Element selbst gesetzt überschreiben globale Tokens:

```tsx
// Eine spezifische Button-Gruppe mit anderem Radius
<div style={{ '--calcite-button-corner-radius': '999px' } as React.CSSProperties}>
  <calcite-button>Pill Button</calcite-button>
</div>

// Oder via CSS-Klasse:
// .pill-buttons { --calcite-button-corner-radius: 999px; }
```

Wichtige Komponenten-Tokens:

#### Button
| Token | Bedeutung |
|---|---|
| `--calcite-button-corner-radius` | Eckenradius (überschreibt `--calcite-corner-radius`) |

#### Input-Felder
| Token | Bedeutung |
|---|---|
| `--calcite-input-background-color` | Hintergrundfarbe |
| `--calcite-input-corner-radius` | Eckenradius (`calcite-input`) |
| `--calcite-input-text-color` | Eingabe-Textfarbe |
| `--calcite-input-placeholder-text-color` | Placeholder-Farbe |
| `--calcite-input-text-corner-radius` | Eckenradius (`calcite-input-text`) |
| `--calcite-input-number-corner-radius` | Eckenradius (`calcite-input-number`) |
| `--calcite-select-background-color` | Hintergrund (`calcite-select`) |
| `--calcite-select-corner-radius` | Eckenradius (`calcite-select`) |
| `--calcite-select-text-color` | Text (`calcite-select`) |
| `--calcite-combobox-input-background-color` | Hintergrund (`calcite-combobox`) |
| `--calcite-combobox-background-color` | Dropdown-Hintergrund |
| `--calcite-text-area-background-color` | Hintergrund (`calcite-text-area`) |
| `--calcite-text-area-corner-radius` | Eckenradius |
| `--calcite-input-date-picker-corner-radius` | Eckenradius Datepicker |

#### Links
| Token | Bedeutung |
|---|---|
| `--calcite-color-text-link` | Link-Farbe (global) |
| `--calcite-color-brand-underline` | Link-Unterstreichungs-Farbe (global) |

> Link-Hover- und Visited-Farben sind **nicht als globale Tokens** vorhanden — sie leiten sich automatisch von `--calcite-color-brand-hover` ab. Für individuelle Anpassungen muss der `<a>`-Tag in eigenem CSS gestylt werden.

#### Sonstige
| Token | Komponente |
|---|---|
| `--calcite-panel-background-color` | `calcite-panel` |
| `--calcite-tooltip-max-width` | `calcite-tooltip` |
| `--calcite-list-background-color` | `calcite-list` (Ruhefarbe) |
| `--calcite-list-background-color-hover` | `calcite-list` (hover) |
| `--calcite-dropdown-item-background-color-hover` | `calcite-dropdown` (Item hover) |

---

## ArcGIS Map-Komponenten Styling

### Fokus-Ring vollständig unterdrücken

Calcite zeigt auf allen interaktiven Elementen einen Fokus-Ring (standardmässig in der Brand-Farbe). Die Karte (`arcgis-map`) erhält ausserdem einen eigenen Fokus-Ring aus der ArcGIS Maps SDK.

**Warum tritt der Fokus-Ring auf?** Jeder Mausklick übergibt den Fokus — ohne Gegenmassnahme erscheint sofort ein Rahmen. Das Ziel ist: Fokus-Ring nur bei **Tastatur-Navigation** anzeigen, nicht bei Mausklicks.

#### 1. Maus-Fokus global unterdrücken (App.scss)

CSS Custom Property `--esri-view-outline` propagiert in den Shadow DOM der Karte — das ist der sauberste Weg:

```scss
// App.scss

// Fokus-Ringe nur bei Tastatur-Navigation (nicht bei Mausklick)
// :focus-visible wird von allen modernen Browsern unterstützt
*:focus:not(:focus-visible) {
  outline: none !important;
}

// Karten-Fokus-Ring: --esri-view-outline propagiert in den arcgis-map Shadow DOM
:root {
  --esri-view-outline: none;
}

arcgis-map {
  outline: none;
}
```

#### 2. Karten-Fokus zusätzlich imperativ entfernen (belt-and-suspenders)

Für ältere SDK-Versionen oder falls die CSS-Variable nicht ausreicht:

```tsx
// In useEffect nach viewReady:
view.container.style.setProperty('--esri-view-outline', 'none')

const shadow = mapRef.current?.shadowRoot
if (shadow) {
  const style = document.createElement('style')
  style.textContent =
    '.esri-view .esri-view-surface:focus::after { outline: none !important; }'
  shadow.appendChild(style)
}
```

> **Hintergrund (aus EXB-Quellcode)**: Experience Builder setzt global `*:focus { outline: 0 }` und `*:focus-visible { outline: 0 }` und fügt Fokus-Stile dann nur für Tastatur-Navigation wieder hinzu (via `body.jimu-keyboard-nav`-Klasse). Das entspricht exakt dem `:focus:not(:focus-visible)`-Muster des modernen Web-Standards.

### ArcGIS Map-Komponenten (Web Components) stylen

Die `@arcgis/map-components`-Web-Components (`arcgis-map`, `arcgis-expand`, `arcgis-search` etc.) sind **deprecated-Widget-frei** — ausschliesslich Web Components verwenden. Sie haben kein eigenes Shadow DOM für UI-Inhalte; ihr Styling erfolgt per CSS auf dem Host-Element oder über `--calcite-*`-Tokens, da die internen UI-Elemente selbst Calcite-Komponenten sind:

```scss
// Host-Elemente direkt stylen
arcgis-expand,
arcgis-search,
arcgis-basemap-gallery {
  // Grösse, Position etc. am Host
}

// arcgis-expand übernimmt --calcite-corner-radius automatisch,
// weil es intern calcite-action und calcite-panel verwendet.
// Kein zusätzliches Styling nötig, wenn --calcite-corner-radius global gesetzt ist.
```

> **Regel**: Niemals `esri-widget`, `esri-ui-corner` oder andere `esri-*`-CSS-Klassen als Styling-Ziel verwenden — diese gehören zu den deprecated Widgets und existieren in neuen Projekten nicht.

### Attribution ausblenden

```tsx
// Nach view ready:
view.attributionVisible = false
```

---

## Eigene Schriftart einbinden

### Google Font (via SCSS)

```scss
// App.scss
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --calcite-font-family: 'Inter', sans-serif;
}
```

### Lokale Schriftart (via CSS @font-face)

```scss
// App.scss
@font-face {
  font-family: 'FirmenSchrift';
  src: url('/fonts/FirmenSchrift-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

:root {
  --calcite-font-family: 'FirmenSchrift', 'Avenir Next', sans-serif;
}
```

---

## Vollständiges Minimal-Beispiel

Für die häufigste Anforderung — **eine Brand-Farbe setzen und Eckenradius anpassen**:

```scss
// App.scss (am Anfang oder in einem :root-Block)
:root {
  // Firma XY CI-Blau
  --calcite-color-brand: #0054a6;
  --calcite-color-brand-hover: #003d7a;
  --calcite-color-brand-press: #1a6ec0;
  --calcite-color-brand-underline: color-mix(in srgb, #0054a6 60%, transparent);
  --calcite-color-text-link: #0054a6;
  --calcite-color-focus: #0054a6;

  // Schrift (Grösse via html font-size, nicht per Token — alle rem skalieren mit)
  --calcite-font-family: 'Inter', 'Avenir Next', sans-serif;

  // Eckenradius: 0px = eckig | 2–4px = leicht gerundet | 999px = komplett rund
  --calcite-corner-radius: 2px;
  --calcite-corner-radius-round: 4px;
}

// Basis-Schriftgrösse: skaliert alle rem-basierten Calcite-Grössen proportional
html {
  font-size: 14px; // Standard: 16px — 14px = kompakter, 18px = grosszügiger
}
```

Das ist alles — alle `calcite-button`, `calcite-input`, `calcite-panel`, `calcite-tooltip` etc. verwenden jetzt automatisch diese Werte.

---

## Hinweise & häufige Fehler

- **Brand-Farbe als einzige Pflicht-Angabe**: Hover/Press können weggelassen werden — Calcite generiert Fallback-Werte, die aber nicht ideal sind. Besser explizit 3–5 % heller/dunkler angeben.
- **Calcite CSS-Reset importieren**: `@esri/calcite-components/dist/calcite/calcite.css` muss importiert sein (normalerweise über das Template bereits erledigt), damit die Default-Tokens gesetzt sind.
- **Spezifität**: Tokens auf `.app-theme` haben höhere Spezifität als `:root` — das ist erwünscht, damit Calcite-interne Defaults nicht interferieren.
- **ArcGIS-Map-Komponenten** (`arcgis-map`, `arcgis-search` etc.) verwenden ihre eigenen CSS-Custom-Properties (`--esri-*`), nicht `--calcite-*`. Diese werden separat gestylt (siehe Abschnitt oben).
- **Calcite v5**: Die Properties `open` auf `calcite-block` und `calcite-list-item` wurden zu `expanded` umbenannt — beim Implementieren immer `expanded` verwenden.
- **Icon-Namen** in Calcite sind kebab-case (`water-drop`, `tree-stand`, `globe-navigation`) — nicht raten, sondern in der [Calcite Icons Referenz](https://developers.arcgis.com/calcite-design-system/icons/) nachschlagen.
