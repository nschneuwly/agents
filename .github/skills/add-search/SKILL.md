---
name: add-search
description: "Fügt eine Adress-/Ortssuche (Geocoding) zu einer ArcGIS React Webapp hinzu. Verwende diesen Skill wenn: Suche hinzufügen, Geocoding, Adresssuche, Ortssuche, Locator, Feature-Suche, search widget."
argument-hint: "Suchquelle: geocoder, feature-layer oder both (optional)"
---

# Add Search — Geocoding & Feature-Suche

Fügt das ArcGIS Search-Widget hinzu für Adress-, Orts- oder Feature-Layer-Suche.

## Wann verwenden

- Adress-/Ortssuche (Geocoding)
- Features nach Attributen suchen
- Kombinierte Suche (Adressen + eigene Daten)

## Was dieser Skill tut

1. Fügt `arcgis-search` Widget zur Karte hinzu
2. Optional: Konfiguriert Suchquellen (Geocoder, Feature Layer)

## Varianten

### Variante A: Standard (ArcGIS World Geocoder)

Keine zusätzliche Konfiguration nötig — funktioniert out-of-the-box.

### Variante B: Feature Layer Suche

Suche in einem spezifischen Layer (z.B. nach Routenname, Gemeindenamen).

### Variante C: Kombiniert

Geocoder + Feature Layer Suche gleichzeitig.

## Implementation

### Variante A: Standard-Geocoder

```tsx
// Direkt in MapComponent oder als separate Komponente:
import '@arcgis/map-components/components/arcgis-search'

// In JSX:
<arcgis-search referenceElement="map-el" />
```

Platzierung: Typischerweise oben auf der Karte.

### Variante B: Feature Layer Suche

```tsx
// components/Search/Search.tsx
import { type FC, useEffect, useRef } from 'react'
import useAppStore from '../../store/AppStore'
import '@arcgis/map-components/components/arcgis-search'

const Search: FC = () => {
	const searchRef = useRef<HTMLArcgisSearchElement>(null)
	const view = useAppStore(s => s.view)

	useEffect(() => {
		if (!searchRef.current || !view) return

		const layer = view.map.findLayerById('target-layer') as __esri.FeatureLayer

		searchRef.current.sources = [
			{
				layer,
				searchFields: ['name', 'description'],
				displayField: 'name',
				outFields: ['*'],
				placeholder: 'Route suchen...',
			},
		]
	}, [view])

	return <arcgis-search ref={searchRef} referenceElement="map-el" />
}

export default Search
```

### Variante C: Kombiniert

```tsx
useEffect(() => {
	if (!searchRef.current || !view) return

	const layer = view.map.findLayerById('target-layer') as __esri.FeatureLayer

	searchRef.current.sources = [
		{
			url: 'https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer',
			placeholder: 'Adresse suchen...',
		},
		{
			layer,
			searchFields: ['name'],
			displayField: 'name',
			outFields: ['*'],
			placeholder: 'Route suchen...',
		},
	]
}, [view])
```

## Config-Felder (optional)

Falls die Suchquellen konfigurierbar sein sollen:

```ts
// In ConfigSchema:
searchLayerId: z.string().optional(),
```

## Hinweise

- Der Standard-Geocoder benötigt keine API-Key-Konfiguration wenn ein Portal/Online-Account verfügbar ist
- Feature Layer Suche funktioniert mit jedem publizierten Feature Service
- Das Widget unterstützt Suggest (Autocomplete) automatisch
- Platzierung: `position="top-right"` oder als Custom-Element im Header/Sidebar
- Context7 verwenden um aktuelle API für `arcgis-search` zu prüfen
