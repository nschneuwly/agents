# Implementation Guide

Patterns und Code-Vorlagen für Features, die in der Spec definiert werden können. Der Agent verwendet diese Referenz beim Bauen der App (Schritt 4).

## Feature-Skills

Für komplexere Features existieren separate `add-*` Skills mit vollständiger Implementierungsanleitung:

| Feature | Skill | Beschreibung |
|---------|-------|-------------|
| Authentifizierung | [add-auth](../../add-auth/SKILL.md) | OAuth (ArcGIS Portal), PortalAuth.ts, Config |
| Basemap Switcher | [add-basemap-switcher](../../add-basemap-switcher/SKILL.md) | Standard, Gruppe, explizite Items |
| Suche | [add-search](../../add-search/SKILL.md) | Geocoding, Feature Layer Suche |
| Höhenprofil | [add-elevation-profile](../../add-elevation-profile/SKILL.md) | ElevationProfile Widget |
| Editing | [add-editing](../../add-editing/SKILL.md) | Editor, Forms, Sketching |
| Spracherkennung & Locale | [add-i18n-detection](../../add-i18n-detection/SKILL.md) | Language Detection, Swiss Locales, Intl Formatierung |

Für alle anderen Features (einfache Widgets, Layout, Branding) sind die Patterns unten dokumentiert.

## Basis

Die Basis-Dateien (package.json, tsconfig, biome, vite.config, Store, Config, i18n, Auth) werden exakt wie im `init-webapp` Skill erstellt. Siehe:
- [../../init-webapp/SKILL.md](../../init-webapp/SKILL.md)
- [../../init-webapp/references/architecture.md](../../init-webapp/references/architecture.md)
- [../../init-webapp/references/arcgis-patterns.md](../../init-webapp/references/arcgis-patterns.md)

---

## Layout-Patterns

### Vollbild-Karte

```tsx
const App: FC = () => (
	<div className="app">
		<MapComponent />
	</div>
)
```

```css
html, body, #root, .app {
	padding: 0;
	margin: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
}
```

### Karte mit Sidebar

```tsx
const App: FC = () => {
	const [panelOpen, setPanelOpen] = useState(true)

	return (
		<div className="app">
			<calcite-shell>
				<calcite-shell-panel slot="panel-start" collapsed={!panelOpen}>
					<calcite-panel heading="...">
						{/* Sidebar-Inhalt */}
					</calcite-panel>
				</calcite-shell-panel>
				<MapComponent />
			</calcite-shell>
		</div>
	)
}
```

### Karte mit Header

```tsx
const App: FC = () => (
	<div className="app">
		<calcite-shell>
			<header slot="header">
				<Header />
			</header>
			<MapComponent />
		</calcite-shell>
	</div>
)
```

### Dashboard (Karte + Panels)

```tsx
const App: FC = () => (
	<div className="app">
		<calcite-shell>
			<header slot="header">
				<Header />
			</header>
			<calcite-shell-panel slot="panel-start">
				<calcite-panel>
					{/* Linke Panels */}
				</calcite-panel>
			</calcite-shell-panel>
			<MapComponent />
			<calcite-shell-panel slot="panel-end">
				<calcite-panel>
					{/* Rechte Panels: Charts, Tabelle, etc. */}
				</calcite-panel>
			</calcite-shell-panel>
		</calcite-shell>
	</div>
)
```

---

## Widget-Patterns

### Basemap Switcher (Standard)

```tsx
import '@arcgis/map-components/components/arcgis-basemap-gallery'

<arcgis-basemap-gallery referenceElement="map-el" />
```

### Basemap Switcher (Portal-Gruppe)

```tsx
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery'
import PortalBasemapsSource from '@arcgis/core/widgets/BasemapGallery/support/PortalBasemapsSource'
import Portal from '@arcgis/core/portal/Portal'

const source = new PortalBasemapsSource({
	portal: new Portal({ url: portalUrl }),
	query: { id: groupId },
})
```

### Basemap Switcher (Explizite Items)

```tsx
import Basemap from '@arcgis/core/Basemap'
import PortalItem from '@arcgis/core/portal/PortalItem'

const basemaps = itemIds.map(id =>
	new Basemap({ portalItem: new PortalItem({ id }) })
)
```

### Legend

```tsx
import '@arcgis/map-components/components/arcgis-legend'

<arcgis-legend referenceElement="map-el" />
```

### Layer List

```tsx
import '@arcgis/map-components/components/arcgis-layer-list'

<arcgis-layer-list referenceElement="map-el" />
```

### Suche (Geocoding)

```tsx
import '@arcgis/map-components/components/arcgis-search'

<arcgis-search referenceElement="map-el" />
```

### Locate (GPS)

```tsx
import '@arcgis/map-components/components/arcgis-locate'

<arcgis-locate referenceElement="map-el" />
```

### Messwerkzeuge

```tsx
import '@arcgis/map-components/components/arcgis-distance-measurement-2d'
import '@arcgis/map-components/components/arcgis-area-measurement-2d'
```

### Print

```tsx
import '@arcgis/map-components/components/arcgis-print'

<arcgis-print referenceElement="map-el" />
```

### Scale Bar

```tsx
import '@arcgis/map-components/components/arcgis-scale-bar'

<arcgis-scale-bar referenceElement="map-el" unit="metric" />
```

### Koordinatenanzeige

```tsx
import '@arcgis/map-components/components/arcgis-coordinate-conversion'

<arcgis-coordinate-conversion referenceElement="map-el" />
```

### Bookmarks

```tsx
import '@arcgis/map-components/components/arcgis-bookmarks'

<arcgis-bookmarks referenceElement="map-el" />
```

### Compass

```tsx
import '@arcgis/map-components/components/arcgis-compass'

<arcgis-compass referenceElement="map-el" />
```

### Swipe

```tsx
import '@arcgis/map-components/components/arcgis-swipe'

<arcgis-swipe referenceElement="map-el" mode="horizontal" />
```

---

## Feature-Patterns

### Attribut-Filter

Eigene Komponente `FilterPanel/FilterPanel.tsx`:

```tsx
import '@esri/calcite-components/dist/components/calcite-select'
import '@esri/calcite-components/dist/components/calcite-option'
import type { FC } from 'react'
import useAppStore from '../../store/AppStore'

const FilterPanel: FC = () => {
	const view = useAppStore(s => s.view)

	const applyFilter = (value: string) => {
		if (!view) return
		const layer = view.map.findLayerById('target-layer') as __esri.FeatureLayer
		layer.definitionExpression = value ? `field = '${value}'` : '1=1'
	}

	return (
		<calcite-label>
			Filter
			<calcite-select onCalciteSelectChange={e => applyFilter(e.target.value)}>
				<calcite-option value="">Alle</calcite-option>
				<calcite-option value="A">Option A</calcite-option>
				<calcite-option value="B">Option B</calcite-option>
			</calcite-select>
		</calcite-label>
	)
}

export default FilterPanel
```

### Feature Table

```tsx
import '@arcgis/map-components/components/arcgis-feature-table'

<arcgis-feature-table referenceElement="map-el" layerId="target-layer" />
```

### Editing (Feature Form)

```tsx
import '@arcgis/map-components/components/arcgis-editor'

<arcgis-editor referenceElement="map-el" />
```

### Custom Popup (React)

Hook-basierter Ansatz mit `reactiveUtils`:

```tsx
// hooks/usePopupFeature.ts
import { watch } from '@arcgis/core/core/reactiveUtils'
import { useEffect, useState } from 'react'
import useAppStore from '../store/AppStore'

export function usePopupFeature() {
	const view = useAppStore(s => s.view)
	const [feature, setFeature] = useState<__esri.Graphic | null>(null)

	useEffect(() => {
		if (!view) return
		view.popupEnabled = false
		const handle = watch(
			() => view.popup.selectedFeature,
			feat => setFeature(feat),
		)
		return () => handle.remove()
	}, [view])

	return feature
}
```

### Routing

```tsx
import '@arcgis/map-components/components/arcgis-directions'

<arcgis-directions referenceElement="map-el" />
```

### Höhenprofil

```tsx
import '@arcgis/map-components/components/arcgis-elevation-profile'

<arcgis-elevation-profile referenceElement="map-el" />
```

### Screenshot

```tsx
const takeScreenshot = async () => {
	if (!view) return
	const screenshot = await view.takeScreenshot({ format: 'png' })
	const link = document.createElement('a')
	link.download = 'map-screenshot.png'
	link.href = screenshot.dataUrl
	link.click()
}
```

### Export (CSV)

```tsx
const exportCsv = (features: __esri.Graphic[]) => {
	if (features.length === 0) return
	const fields = Object.keys(features[0].attributes)
	const header = fields.join(',')
	const rows = features.map(f => fields.map(k => f.attributes[k]).join(','))
	const csv = [header, ...rows].join('\n')
	const blob = new Blob([csv], { type: 'text/csv' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.download = 'export.csv'
	link.href = url
	link.click()
	URL.revokeObjectURL(url)
}
```

---

## URL-Parameter Pattern

```tsx
// hooks/useUrlParams.ts
import { useEffect } from 'react'
import useAppStore from '../store/AppStore'

export function useUrlParams() {
	const view = useAppStore(s => s.view)

	useEffect(() => {
		if (!view) return
		const params = new URLSearchParams(window.location.search)

		const center = params.get('center')
		const zoom = params.get('zoom')
		const featureId = params.get('feature')

		if (center && zoom) {
			const [lon, lat] = center.split(',').map(Number)
			view.goTo({ center: [lon, lat], zoom: Number(zoom) })
		}

		if (featureId) {
			// Feature highlighten/zoomen
		}
	}, [view])
}
```

---

## Notifications Pattern

```tsx
import '@esri/calcite-components/dist/components/calcite-alert'

// Im Store:
interface Notification {
	id: string
	message: string
	kind: 'brand' | 'info' | 'success' | 'warning' | 'danger'
}

// In der App:
{notifications.map(n => (
	<calcite-alert
		key={n.id}
		open
		kind={n.kind}
		autoClose
		autoCloseDuration="medium"
	>
		<div slot="message">{n.message}</div>
	</calcite-alert>
))}
```

---

## Responsive Patterns

### CSS Container Queries

```css
.sidebar {
	container-type: inline-size;
}

@container (max-width: 400px) {
	.sidebar-content {
		/* Mobile-Ansicht */
	}
}
```

### Calcite Shell responsive

Calcite Shell Panels kollabieren automatisch bei kleinen Viewports wenn `displayMode="overlay"` gesetzt ist.

```tsx
<calcite-shell-panel slot="panel-start" displayMode="overlay">
```

### Mobile Drawer Pattern

```tsx
<calcite-sheet open={drawerOpen} displayMode="overlay" position="bottom">
	<calcite-panel>
		{/* Mobile Panel-Inhalt */}
	</calcite-panel>
</calcite-sheet>
```

---

## Branding / Theme

### Custom Primärfarbe

In `App.css`:

```css
:root {
	--calcite-color-brand: {{PRIMAERFARBE}};
	--calcite-color-brand-hover: {{PRIMAERFARBE_HOVER}};
	--calcite-color-brand-press: {{PRIMAERFARBE_PRESS}};
}
```

### Dark Theme

```css
html {
	--calcite-color-scheme: dark;
}
```

Import in MapComponent:
```tsx
import '@arcgis/core/assets/esri/themes/dark/main.css'
```

### Auto Theme

```css
html {
	--calcite-color-scheme: auto;
}
```

---

## Splash Screen Pattern

```tsx
import '@esri/calcite-components/dist/components/calcite-dialog'

const SplashScreen: FC = () => {
	const [open, setOpen] = useState(true)

	return (
		<calcite-dialog
			open={open || undefined}
			heading="Willkommen"
			onCalciteDialogClose={() => setOpen(false)}
		>
			<p>Beschreibung der App...</p>
		</calcite-dialog>
	)
}
```

---

## Echtzeit-Daten (Polling)

```tsx
// hooks/usePolling.ts
import { useEffect } from 'react'
import useAppStore from '../store/AppStore'

export function usePolling(intervalMs: number) {
	const view = useAppStore(s => s.view)

	useEffect(() => {
		if (!view) return
		const interval = setInterval(() => {
			const layer = view.map.findLayerById('live-layer') as __esri.FeatureLayer
			layer.refresh()
		}, intervalMs)
		return () => clearInterval(interval)
	}, [view, intervalMs])
}
```

---

## Portal-Integration

```tsx
import Portal from '@arcgis/core/portal/Portal'
import PortalQueryParams from '@arcgis/core/portal/PortalQueryParams'

const searchPortalItems = async (portalUrl: string, query: string) => {
	const portal = new Portal({ url: portalUrl })
	await portal.load()
	const result = await portal.queryItems(
		new PortalQueryParams({ query, num: 20 })
	)
	return result.results
}
```
