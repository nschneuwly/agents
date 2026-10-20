---
name: add-elevation-profile
description: "Fügt ein Höhenprofil-Widget zu einer ArcGIS React Webapp hinzu. Verwende diesen Skill wenn: Elevation Profile, Höhenprofil anzeigen, Steigung visualisieren, Routen-Profil, terrain profile, elevation widget."
argument-hint: "Interaktionsmodus: click oder select (optional)"
---

# Add Elevation Profile

Fügt das ArcGIS ElevationProfile-Widget hinzu, das Höhenprofile entlang von Linien-Features oder gezeichneten Pfaden anzeigt.

## Wann verwenden

- Routen mit Steigung visualisieren (Wandern, Velo, Strassen)
- Geländeprofil entlang einer Linie anzeigen
- Höheninformationen interaktiv darstellen

## Was dieser Skill tut

1. Erstellt `ElevationProfile`-Komponente
2. Optional: Hook für Interaktion mit selektierten Features
3. Ergänzt Store um Profil-State (visible, selected feature)

## Varianten

### Variante A: Standalone (User zeichnet Linie)

Das Widget ist eigenständig — der User zeichnet eine Linie auf der Karte und sieht das Profil.

### Variante B: Feature-basiert (Klick auf Route)

Das Profil wird für ein selektiertes Linien-Feature (z.B. Veloroute) angezeigt.

## Implementation

### Variante A: Standalone

```tsx
// components/ElevationProfile/ElevationProfile.tsx
import type { FC } from 'react'
import './ElevationProfile.css'
import '@arcgis/map-components/components/arcgis-elevation-profile'

const ElevationProfile: FC = () => {
	return (
		<div className="elevation-profile-container">
			<arcgis-elevation-profile referenceElement="map-el" />
		</div>
	)
}

export default ElevationProfile
```

### Variante B: Feature-basiert (mit Interaktion)

#### Store erweitern

```ts
// In AppStoreState:
selectedRoute: __esri.Graphic | null
setSelectedRoute: (route: __esri.Graphic | null) => void
elevationProfileVisible: boolean
setElevationProfileVisible: (visible: boolean) => void
```

#### Hook für Routen-Selektion

```ts
// hooks/useRouteSelection.ts
import { watch } from '@arcgis/core/core/reactiveUtils'
import { useEffect } from 'react'
import useAppStore from '../store/AppStore'

export function useRouteSelection() {
	const view = useAppStore(s => s.view)
	const setSelectedRoute = useAppStore(s => s.setSelectedRoute)
	const setElevationProfileVisible = useAppStore(s => s.setElevationProfileVisible)

	useEffect(() => {
		if (!view) return

		const handle = view.on('click', async event => {
			const response = await view.hitTest(event)
			const result = response.results.find(
				r => r.type === 'graphic' && r.graphic.geometry?.type === 'polyline',
			)
			if (result && result.type === 'graphic') {
				setSelectedRoute(result.graphic)
				setElevationProfileVisible(true)
			} else {
				setSelectedRoute(null)
				setElevationProfileVisible(false)
			}
		})

		return () => handle.remove()
	}, [view, setSelectedRoute, setElevationProfileVisible])
}
```

#### Komponente mit Input-Geometry

```tsx
// components/ElevationProfile/ElevationProfile.tsx
import { type FC, useEffect, useRef } from 'react'
import './ElevationProfile.css'
import useAppStore from '../../store/AppStore'
import '@arcgis/map-components/components/arcgis-elevation-profile'

const ElevationProfile: FC = () => {
	const profileRef = useRef<HTMLArcgisElevationProfileElement>(null)
	const selectedRoute = useAppStore(s => s.selectedRoute)
	const visible = useAppStore(s => s.elevationProfileVisible)

	useEffect(() => {
		if (!profileRef.current || !selectedRoute) return
		profileRef.current.input = selectedRoute.geometry as __esri.Polyline
	}, [selectedRoute])

	if (!visible) return null

	return (
		<div className="elevation-profile-container">
			<arcgis-elevation-profile
				ref={profileRef}
				referenceElement="map-el"
			/>
		</div>
	)
}

export default ElevationProfile
```

#### CSS

```css
/* components/ElevationProfile/ElevationProfile.css */
.elevation-profile-container {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 200px;
	z-index: 1;
	background: var(--calcite-color-foreground-1);
	border-top: 1px solid var(--calcite-color-border-3);
}
```

## Hinweise

- Das Widget benötigt einen Elevation-Service (standardmässig Esri World Elevation — funktioniert ohne Konfiguration)
- Bei Variante B: `view.popupEnabled = false` setzen wenn Custom-Interaktion verwendet wird
- Das Widget unterstützt auch `ground` und `view` Profile-Typen (Gelände vs. sichtbare Oberfläche)
- Context7 verwenden um aktuelle API für `arcgis-elevation-profile` zu prüfen
