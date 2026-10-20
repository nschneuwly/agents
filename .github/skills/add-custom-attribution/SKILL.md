---
name: add-custom-attribution
description: "Ersetzt die Standard-Attribution-Leiste einer ArcGIS React Webapp durch eine kompakte 'Powered by Esri'-Pille mit Calcite-Tooltip, daneben die App-Versionsnummer. Verwende diesen Skill wenn: Custom Attribution, Attribution-Tooltip, kompakte Attributionen, Powered by Esri, Versionsnummer unten rechts, Attribution-Pille, custom attribution widget."
---

# Add Custom Attribution

Ersetzt die Standard-Attribution-Leiste am unteren Kartenrand durch eine kompakte „Powered by Esri"-Pille mit einem Calcite-Tooltip, der die vollen Attributionen on-hover anzeigt. Daneben wird die App-Versionsnummer in derselben optischen Form dargestellt.

## Wann verwenden

- Default-Attributionsleiste stört das Layout (lang, undurchsichtig)
- Kompaktes, einheitliches Footer-Design unten rechts gewünscht
- Versionsnummer und Attributionen sollen visuell zusammen erscheinen
- Inhalt der Attributionen soll trotzdem vollständig zugänglich bleiben

## Was der Skill macht

1. Erstellt eine `MapAttribution`-Komponente mit:
   - Kompakter Pille „Powered by Esri" + Info-Icon
   - `<calcite-tooltip>` öffnet sich on-hover und zeigt die offiziellen Attributionen
   - Versionsnummer-Pille rechts daneben (gleiche Höhe/Padding)
2. Setzt `view.attributionVisible = false` — blendet die Default-Attribution nativ aus
3. Liest die Attributionen über `view.attributionItems` (öffentliche API, neu seit `@arcgis/core` v5.0)
4. Entfernt eine eventuell vorhandene separate Versionsnummer-Anzeige (z. B. aus `App.tsx`)

## Wichtige technische Details

- **Quelle der Attributionen**: `view.attributionItems` (eine `ReadonlyArray<AttributionItem>`); jedes Item hat eine `text`-Property (kann HTML mit Links enthalten)
- **Reaktivität**: `reactiveUtils.watch` auf den verketteten Item-Text — feuert bei Layer-Wechseln
- **Default-Attribution ausblenden**: `view.attributionVisible = false` (nativ, kein Shadow-DOM-Hack nötig)
- **HTML-Rendering**: `dangerouslySetInnerHTML` wird verwendet, weil die SDK-Texte HTML mit Links zu Datenquellen liefern — das ist die offizielle Form der ArcGIS-Attribution
- **Tooltip-Bindung**: `calcite-tooltip` referenziert die Trigger-ID via `referenceElement`; ID kommt aus `useId()`
- **Höhen-Matching**: Beide Pillen verwenden `padding: 2px 8px` und `line-height: 16px` (= Höhe des `calcite-icon scale="s"`)

> **Hinweis**: Das alte `@arcgis/core/widgets/Attribution`-Modul ist seit v5.0 deprecated. Dieser Skill verwendet ausschließlich die neue View-API.

## Implementation

### 1. Komponente erstellen

`src/App/Components/MapAttribution/MapAttribution.tsx`:

```tsx
import { type FC, useEffect, useId, useState } from 'react'
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils.js'
import '@esri/calcite-components/components/calcite-icon'
import '@esri/calcite-components/components/calcite-tooltip'
import useMapStore from '../../Store/MapStore'
import { version } from '../../../../package.json'
import './MapAttribution.scss'

const MapAttribution: FC = () => {
	const mapView = useMapStore(s => s.mapView)
	const [attributionText, setAttributionText] = useState('')
	const triggerId = useId()

	useEffect(() => {
		if (!mapView) return

		// Hide the default in-view attribution — we render our own
		mapView.attributionVisible = false

		const readItems = () => {
			const text = mapView.attributionItems
				.map(item => item.text)
				.filter(Boolean)
				.join(' | ')
			setAttributionText(text)
		}

		readItems()
		const handle = reactiveUtils.watch(
			() => mapView.attributionItems.map(i => i.text).join('|'),
			readItems,
		)

		return () => {
			handle.remove()
		}
	}, [mapView])

	return (
		<div className="map-footer">
			<div id={triggerId} className="map-attribution">
				<span className="map-attribution__label">Powered by Esri</span>
				<calcite-icon className="map-attribution__hint" icon="information" scale="s" />
			</div>
			<calcite-tooltip referenceElement={triggerId} placement="top-end" className="map-attribution__tooltip">
				<div
					className="map-attribution__widget"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: attribution items contain SDK-provided HTML (links)
					dangerouslySetInnerHTML={{ __html: attributionText }}
				/>
			</calcite-tooltip>
			<span className="map-version">v{version}</span>
		</div>
	)
}

export default MapAttribution
```

### 2. Styles

`src/App/Components/MapAttribution/MapAttribution.scss`:

```scss
.map-footer {
    position: absolute;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    z-index: 100;
}

.map-attribution {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255, 255, 255, 0.75);
    border-radius: 3px;
    padding: 2px 8px;
    font-size: 11px;
    line-height: 16px;
    color: rgba(50, 50, 50, 0.85);
    pointer-events: auto;
    cursor: help;
    white-space: nowrap;

    &__label {
        font-weight: 500;
    }

    &__hint {
        color: rgba(50, 50, 50, 0.6);
    }

    &__tooltip {
        --calcite-tooltip-max-width: min(900px, calc(100vw - 40px));
    }

    &__widget {
        font-size: 12px;
        line-height: 1.5;

        a {
            color: inherit;
            text-decoration: underline;
        }
    }
}

.map-version {
    font-size: 11px;
    line-height: 16px;
    color: rgba(50, 50, 50, 0.85);
    background: rgba(255, 255, 255, 0.75);
    padding: 2px 8px;
    border-radius: 3px;
    font-weight: 500;
    user-select: none;
    pointer-events: none;
    flex-shrink: 0;
}
```

### 3. Komponente einbinden

In `MapComponent.tsx`:

```tsx
const MapAttribution = lazy(() => import('../MapAttribution/MapAttribution'))

// im JSX innerhalb des map-wrapper Containers (nach <arcgis-map>):
<Suspense>
    <MapAttribution />
</Suspense>
```

### 4. Alte Versionsnummer-Anzeige entfernen

Falls in `App.tsx` bereits eine `<span className="app-version">v{version}</span>` vorhanden ist:
- Entferne den `<span>` und den `version`-Import aus `App.tsx`
- Entferne die `.app-version` SCSS-Regel aus `App.scss`

## Voraussetzungen

- `useMapStore` muss den `MapView` bereitstellen (Standard im Template)
- `@esri/calcite-components` Paket vorhanden
- `@arcgis/core` v5.0 oder neuer (für `attributionItems` / `attributionVisible`)
- Im Map-Store muss der `view` gesetzt sein, sobald die Karte ready ist

## Hinweise

- Die `referenceElement` von `calcite-tooltip` referenziert eine **String-ID** (nicht das DOM-Element direkt) — `useId()` liefert eine stabile, eindeutige ID pro Komponenten-Instanz
- `placement="top-end"` öffnet den Tooltip oberhalb der Pille, rechtsbündig ausgerichtet
- Das alte `@arcgis/core/widgets/Attribution`-Modul ist seit v5.0 deprecated — **nicht** mehr verwenden
- `view.attributionItems` ist erst nach dem ersten `view.updating === false` befüllt; der initiale `readItems()`-Aufruf liefert ggf. ein leeres Array, der `watch` aktualisiert dann nach
- Context7 für aktuelle Calcite-Tooltip-API und View-Attribution-API verwenden, falls Verhalten/Properties geprüft werden müssen
