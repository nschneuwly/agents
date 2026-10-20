---
name: add-editing
description: "Fügt Feature-Editing (Erstellen/Bearbeiten) zu einer ArcGIS React Webapp hinzu. Verwende diesen Skill wenn: Features erstellen, Daten bearbeiten, Editor Widget, FeatureForm, sketching, Geometrie bearbeiten, Meldung erfassen."
argument-hint: "Modus: create, edit oder both (optional)"
---

# Add Editing — Feature-Erstellung & -Bearbeitung

Fügt das ArcGIS Editor-Widget hinzu, mit dem Features erstellt und bearbeitet werden können.

## Wann verwenden

- Datenerfassung (z.B. Meldungen, Inspektionen)
- Feature-Geometrie oder -Attribute bearbeiten
- Formulare zur Dateneingabe

## Was dieser Skill tut

1. Erstellt Editor-Komponente (oder nutzt `arcgis-editor` direkt)
2. Konfiguriert Editing-Modus (erstellen/bearbeiten/beides)
3. Optional: Custom-Formular oder WebMap-definiertes Formular

## Varianten

### Variante A: WebMap-definiert (empfohlen)

Formulare, Pflichtfelder und Validierung sind in der WebMap konfiguriert. Kein zusätzlicher Code nötig.

### Variante B: Custom-Konfiguration

Eigene Formular-Definition im Code (Felder, Gruppen, Validierung).

## Implementation

### Variante A: Editor mit WebMap-Formularen

```tsx
// components/Editor/Editor.tsx
import type { FC } from 'react'
import './Editor.css'
import '@arcgis/map-components/components/arcgis-editor'

interface EditorProps {
	mode?: 'create' | 'edit' | 'both'
}

const Editor: FC<EditorProps> = ({ mode = 'both' }) => {
	return (
		<arcgis-editor
			referenceElement="map-el"
			allowedWorkflows={mode === 'both' ? undefined : mode}
		/>
	)
}

export default Editor
```

### Variante B: Editor mit eingeschränkten Layern

```tsx
import { type FC, useEffect, useRef } from 'react'
import './Editor.css'
import useAppStore from '../../store/AppStore'
import '@arcgis/map-components/components/arcgis-editor'

const Editor: FC = () => {
	const editorRef = useRef<HTMLArcgisEditorElement>(null)
	const view = useAppStore(s => s.view)

	useEffect(() => {
		if (!editorRef.current || !view) return

		// Nur bestimmte Layer für Editing erlauben
		editorRef.current.layerInfos = view.map.allLayers
			.filter(l => l.type === 'feature')
			.map(l => ({
				layer: l as __esri.FeatureLayer,
				enabled: true,
			}))
			.toArray()
	}, [view])

	return <arcgis-editor ref={editorRef} referenceElement="map-el" />
}

export default Editor
```

### CSS

```css
/* components/Editor/Editor.css */
arcgis-editor {
	height: 100%;
}
```

### Placement

Der Editor wird typischerweise in einem Sidebar-Panel oder Sheet platziert:

```tsx
// In App.tsx oder als Expand-Widget:
<calcite-shell-panel slot="panel-end">
	<calcite-panel heading={t('editor-title')}>
		<Editor />
	</calcite-panel>
</calcite-shell-panel>
```

## Snapping aktivieren

```tsx
// In der MapComponent, nach View-Ready:
useEffect(() => {
	if (!view) return
	view.map.allLayers.forEach(layer => {
		if (layer.type === 'feature') {
			(layer as __esri.FeatureLayer).editingEnabled = true
		}
	})
}, [view])
```

## Hinweise

- "Wie in WebMap definiert" ist der wartungsfreundlichste Ansatz — Formulare werden im Map Viewer konfiguriert
- Das Editor-Widget unterstützt Snapping, Sketching-Hilfen, Undo/Redo out-of-the-box
- Attachments (Fotos, Dokumente) werden automatisch unterstützt wenn der Layer es erlaubt
- Context7 verwenden um aktuelle API für `arcgis-editor` zu prüfen
