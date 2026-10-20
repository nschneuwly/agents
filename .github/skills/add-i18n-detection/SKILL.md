---
name: add-i18n-detection
description: "Richtet Spracherkennung, Schweizer Locale-Handling und Zahlen-/Datumsformatierung für eine ArcGIS React Webapp ein. Verwende diesen Skill wenn: Sprache erkennen, Language Detector, Schweizer Sprachen, de-CH, fr-CH, Intl Formatierung, Zahlen formatieren, Datum formatieren, ß durch ss ersetzen, ArcGIS Locale, Calcite Locale, Language Switcher."
argument-hint: "Ansatz: detector, switcher oder both (optional)"
---

# Add i18n Detection — Spracherkennung & Locale-Handling

Richtet automatische Spracherkennung, Schweizer Locale-Codes und locale-aware Formatierung ein.

## Wann verwenden

- Automatische Spracherkennung (Browser/URL)
- Language Switcher UI
- Schweizer Locale-Varianten (`de-CH`, `fr-CH`, `it-CH`)
- Zahlen, Daten, Währungen locale-aware formatieren
- ArcGIS SDK / Calcite Locale synchronisieren
- ß → ss Overrides für Schweizer Deutsch

## Voraussetzung

Die App hat bereits i18next eingerichtet (`i18n.ts`, `translations.json`, `useTranslation()`). Siehe `copilot-instructions.md` → Internationalization (i18n).

## Language Detection & Language Switcher

Es gibt zwei Ansätze, um die App-Sprache zu setzen:

1. **Language Switcher** — eine UI-Komponente (z.B. `ToggleLang`), die die Sprache via `i18next.changeLanguage()` wechselt
2. **Automatische Erkennung** — via `i18next-browser-languagedetector` (`npm install i18next-browser-languagedetector`), erkennt Sprache aus Browser, URL oder localStorage

Beide Ansätze können kombiniert werden.

### `i18next-browser-languagedetector` Caching-Falle

Der Detector cached die erkannte/gewählte Sprache standardmässig in **localStorage** (Key `i18nextLng`). Die Default Detection Order ist `['querystring', 'cookie', 'localStorage', 'navigator', ...]` — da `localStorage` **vor** `navigator` geprüft wird, überschreibt ein gecachter Wert immer die Browser-Sprache:

- Wenn ein Benutzer die Sprache in der App wechselt (oder mit `?lng=de` besucht), wird die Wahl in localStorage gecacht
- Wenn der Benutzer danach die Browser-Sprache ändert, verwendet die App **weiterhin den gecachten localStorage-Wert** — die Änderung der Browser-Sprache hat keinen Effekt
- Das kann **unerwünscht** sein, wenn die App immer der Browser-Sprache folgen soll

Um das zu verhindern, Caching deaktivieren oder nur `navigator` verwenden:

```ts
i18n.use(LanguageDetector).init({
  detection: {
    // Nur Browser-Sprache erkennen, nicht cachen
    order: ['navigator'],
    caches: [],
  },
})
```

Oder URL-Parameter unterstützen ohne localStorage-Caching:

```ts
i18n.use(LanguageDetector).init({
  detection: {
    order: ['querystring', 'navigator'],
    lookupQuerystring: 'lang',
    caches: [],
  },
})
```

## Swiss Language Codes

In unserer Organisation verwenden wir Schweizer Locale-Varianten: `de-CH`, `fr-CH`, `it-CH`. Wenn ein kurzer Sprachcode verwendet wird (z.B. URL-Parameter `?lang=de`), ist damit immer die Schweizer Variante (`de-CH`) gemeint. Mit `convertDetectedLanguage` kurze Codes auf Schweizer Locales mappen:

```ts
const swissLanguageMap: Record<string, string> = {
  de: 'de-CH',
  fr: 'fr-CH',
  it: 'it-CH',
}

i18n.use(LanguageDetector).init({
  supportedLngs: ['de-CH', 'fr-CH', 'it-CH', 'en'],
  fallbackLng: 'de-CH',
  detection: {
    order: ['querystring', 'navigator'],
    lookupQuerystring: 'lang',
    caches: [],
    convertDetectedLanguage: (lng) => swissLanguageMap[lng] ?? lng,
  },
})
```

Die `translations.json` verwendet weiterhin kurze Sprachcodes (`de`, `fr`, `en`) als Keys — die Texte unter `de` sind einfach in Schweizer Standarddeutsch geschrieben, kein spezieller Locale-Key nötig. i18next's eingebauter Fallback löst `de-CH` → `de` für Translation-Lookup automatisch auf. Der Zweck von `convertDetectedLanguage` ist einzig, sicherzustellen dass `i18n.language` den Schweizer Locale (`de-CH`) enthält, der dann an `Intl` für korrekte Schweizer Zahlen-/Datumsformatierung übergeben werden kann (siehe unten).

## Number, Date & Currency Formatting

Strings übersetzen allein reicht nicht — Zahlen, Daten und Währungen müssen ebenfalls locale-aware sein. Dafür die eingebaute Browser `Intl` API verwenden (keine zusätzlichen Dependencies):

```ts
// Zahlen
new Intl.NumberFormat('de-CH').format(1234567.89)  // "1'234'567.89"
new Intl.NumberFormat('fr-CH').format(1234567.89)  // "1 234 567,89"
new Intl.NumberFormat('en').format(1234567.89)     // "1,234,567.89"

// Datum
new Intl.DateTimeFormat('de-CH').format(new Date()) // "24.06.2026"
new Intl.DateTimeFormat('en').format(new Date())    // "6/24/2026"

// Währung
new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(42) // "CHF 42.00"
```

Die aktuelle i18next-Sprache als Locale verwenden, damit Formatierung und UI-Sprache synchron bleiben:

```ts
import { useTranslation } from 'react-i18next'

const { i18n } = useTranslation()
const formatted = new Intl.NumberFormat(i18n.language).format(value)
```

## ArcGIS SDK & Calcite Locale

Das ArcGIS Maps SDK und Calcite-Komponenten haben eigene eingebaute Übersetzungen für Widget-Labels (Zoom-Buttons, Popups, Massstabsleiste, etc.). Der SDK-Locale kann auf zwei Arten gesetzt werden:

1. **HTML `lang` Attribut** (bevorzugt) — `<html lang="de-CH">` setzen, das SDK liest es automatisch
2. **Programmatisch** — `intl.setLocale('de-CH')` von `@arcgis/core/intl`

`<html lang="de-CH">` als statischen Default in `index.html` setzen (passend zur Fallback-Sprache). Der `languageChanged` Callback unten feuert beim Init und bei jedem Sprachwechsel, überschreibt also sofort mit dem erkannten Locale. Beide Methoden verwenden — `document.documentElement.lang` (für Calcite, Accessibility, CSS `:lang()`) und `intl.setLocale()` (SDK-Widgets beobachten `lang`-Attribut-Änderungen nicht reaktiv):

```ts
import * as intl from '@arcgis/core/intl'

i18n.on('languageChanged', (lng) => {
  intl.setLocale(lng)
  document.documentElement.lang = lng
})
```

### Swiss German: ß → ss Override

Die deutschen Übersetzungen des SDK verwenden Standarddeutsch mit ß (Eszett), z.B. "Maßstab", "schließen". In der Schweiz wird ß nicht verwendet — es ist immer "ss". Da das SDK keine separate `de-CH`-Übersetzung hat (Fallback auf `de`), müssen betroffene Strings pro Komponente via `messageOverrides` überschrieben werden:

```tsx
<arcgis-search messageOverrides={{ noResults: 'Keine Ergebnisse' }} />
```

Die vollständige Liste der überschreibbaren Strings pro Komponente findet sich in der API-Referenz der Komponente (z.B. `arcgis-home.messageOverrides`, `arcgis-print.messageOverrides`). Calcite-Komponenten unterstützen `messageOverrides` auf die gleiche Weise.
