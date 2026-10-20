---
name: add-basemap-switcher
description: "Fügt einen Basemap-Switcher/Gallery zu einer ArcGIS React Webapp hinzu. Verwende diesen Skill wenn: Basemap wechseln, Hintergrundkarte ändern, Basemap Gallery, Luftbild/Karte umschalten, basemap switcher."
argument-hint: "Quelle: standard, group oder items (optional)"
---

# Add Basemap Switcher

Fügt ein Basemap-Gallery-Widget hinzu, mit dem zwischen verschiedenen Hintergrundkarten gewechselt werden kann.

## Wann verwenden

- Zwischen Karte und Luftbild wechseln
- Eigene Basemaps aus Portal-Gruppe anbieten
- Spezifische Basemaps per Item-ID

## Varianten

### Variante A: Standard (Esri Default-Basemaps)

Verwendet die Standard-Basemaps von ArcGIS Online. Keine Konfiguration nötig.

### Variante B: Portal-Gruppe

Basemaps aus einer spezifischen Portal-Gruppe laden.

### Variante C: Explizite Items

Bestimmte Basemaps per Item-ID festlegen.

## Implementation

### Variante A: Standard

```tsx
// Direkt in MapComponent:
import '@arcgis/map-components/components/arcgis-basemap-gallery'
import '@arcgis/map-components/components/arcgis-expand'

// In JSX (in der arcgis-map):
<arcgis-expand position="top-left" expandIcon="basemap">
	<arcgis-basemap-gallery referenceElement="map-el" />
</arcgis-expand>
```

### Variante B: Portal-Gruppe

```tsx
// components/BasemapSwitcher/BasemapSwitcher.tsx
import { type FC, useEffect, useRef } from 'react'
import useAppStore from '../../store/AppStore'
import '@arcgis/map-components/components/arcgis-basemap-gallery'

const BasemapSwitcher: FC = () => {
	const galleryRef = useRef<HTMLArcgisBasemapGalleryElement>(null)
	const config = useAppStore(s => s.config)

	useEffect(() => {
		if (!galleryRef.current) return

		galleryRef.current.source = {
			query: { id: config.basemapGroupId },
		}
	}, [config.basemapGroupId])

	return <arcgis-basemap-gallery ref={galleryRef} referenceElement="map-el" />
}

export default BasemapSwitcher
```

Config-Feld:
```ts
basemapGroupId: z.string().trim().min(1),
```

### Variante C: Explizite Items

```tsx
import { type FC, useEffect, useRef } from 'react'
import Basemap from '@arcgis/core/Basemap'
import PortalItem from '@arcgis/core/portal/PortalItem'
import useAppStore from '../../store/AppStore'
import '@arcgis/map-components/components/arcgis-basemap-gallery'

const BasemapSwitcher: FC = () => {
	const galleryRef = useRef<HTMLArcgisBasemapGalleryElement>(null)
	const config = useAppStore(s => s.config)

	useEffect(() => {
		if (!galleryRef.current) return

		const basemaps = config.basemapItemIds.map(
			id => new Basemap({ portalItem: new PortalItem({ id }) }),
		)

		galleryRef.current.source = { basemaps }
	}, [config.basemapItemIds])

	return <arcgis-basemap-gallery ref={galleryRef} referenceElement="map-el" />
}

export default BasemapSwitcher
```

Config-Feld:
```ts
basemapItemIds: z.array(z.string().trim().min(1)),
```

## Platzierung

Typischerweise als Expand-Widget auf der Karte:

```tsx
<arcgis-expand position="top-left" expandIcon="basemap">
	<BasemapSwitcher />
</arcgis-expand>
```

Oder in einer Sidebar/Panel falls vorhanden.

## Hinweise

- Standard-Basemaps (Variante A) ist der einfachste Ansatz und braucht keine Config-Felder
- Portal-Gruppe (Variante B) ist ideal für Organisationen mit eigenen Basemaps
- Explizite Items (Variante C) gibt volle Kontrolle über die Auswahl
- Context7 verwenden um aktuelle API für `arcgis-basemap-gallery` zu prüfen
