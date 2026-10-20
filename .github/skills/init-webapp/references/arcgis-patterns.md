# ArcGIS Maps SDK Patterns

## Map Components (Web Components)

Die App verwendet `@arcgis/map-components` Web Components direkt in JSX.

### Map-Komponente: `src/components/MapComponent/MapComponent.tsx`

```tsx
import { type FC, useEffect, useRef, useState } from 'react'
import './MapComponent.css'
import '@arcgis/core/assets/esri/themes/dark/main.css'
import SpatialReference from '@arcgis/core/geometry/SpatialReference'
import useAppStore from '../../store/AppStore'
import '@arcgis/map-components/components/arcgis-map'

const LV95 = new SpatialReference({ wkid: 2056 })

const MapComponent: FC = () => {
	const mapRef = useRef<HTMLArcgisMapElement>(null)
	const setView = useAppStore(state => state.setView)
	const [viewReady, setViewReady] = useState(false)

	useEffect(() => {
		if (!viewReady || !mapRef.current) return
		mapRef.current.view.spatialReference = LV95
		setView(mapRef.current.view)

		// Remove focus outline from the map view (suppress blue border on click)
		const view = mapRef.current.view
		if (view?.container) {
			view.container.style.setProperty('--esri-view-outline', 'none')
		}
		const shadow = mapRef.current.shadowRoot
		if (shadow) {
			const style = document.createElement('style')
			style.textContent = '.esri-view .esri-view-surface:focus::after { outline: none !important; }'
			shadow.appendChild(style)
		}
	}, [viewReady, setView])

	return (
		<arcgis-map
			ref={mapRef}
			itemId="{{WEBMAP_ITEM_ID}}"
			onarcgisViewReadyChange={() => {
				if (!mapRef.current) return
				setViewReady(true)
			}}
		/>
	)
}

export default MapComponent
```

### `src/components/MapComponent/MapComponent.css`

```css
arcgis-map {
	width: 100%;
	height: 100%;
	display: block;
	outline: none;
}
```

## Wichtige Patterns

### Imports

- Map Components einzeln importieren: `import '@arcgis/map-components/components/arcgis-map'`
- ArcGIS Core als ES Modules: `import SpatialReference from '@arcgis/core/geometry/SpatialReference'`
- Kein AMD Loader

### MapView in Store speichern

Die `MapView`-Referenz wird im Zustand Store gespeichert, damit andere Komponenten darauf zugreifen können:

```tsx
const setView = useAppStore(state => state.setView)
// nach View-Ready:
setView(mapRef.current.view)
```

### reactiveUtils für Property-Watching

```tsx
import { watch } from '@arcgis/core/core/reactiveUtils'

useEffect(() => {
	if (!view) return
	const handle = watch(
		() => view.extent,
		extent => {
			// Auf Extent-Änderung reagieren
		},
	)
	return () => handle.remove()
}, [view])
```

### Calcite Design System

Calcite Web Components direkt in JSX verwenden — **keine React-Wrapper**:

```tsx
// ❌ Falsch
import { CalciteButton } from '@esri/calcite-components-react'

// ✅ Richtig
import '@esri/calcite-components/dist/components/calcite-button'

<calcite-button appearance="solid" kind="brand" onClick={handleClick}>
	{t('submit')}
</calcite-button>
```

### Type Declarations

Die Triple-Slash References in `src/vite.env.d.ts` stellen die React-Typen für die Web Components bereit:

```ts
/// <reference types="@arcgis/map-components/types/react" />
/// <reference types="@esri/calcite-components/types/react" />
```

### Vendor Chunk für ArcGIS

In `vite.config.js` werden alle ArcGIS/Esri-Module in einen separaten Chunk gebündelt, um Probleme mit zirkulären Abhängigkeiten zu vermeiden:

```js
manualChunks(id) {
	if (id.includes('node_modules/@arcgis/') || id.includes('node_modules/@esri/')) {
		return 'vendor-arcgis'
	}
}
```

### Portal-Operationen

Für Portal-Abfragen `@esri/arcgis-rest-portal` verwenden:

```tsx
import { searchItems } from '@esri/arcgis-rest-portal'
import { ArcGISIdentityManager } from '@esri/arcgis-rest-request'
```
