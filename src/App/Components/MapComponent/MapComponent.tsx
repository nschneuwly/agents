import { type FC, useEffect, useRef, useState } from 'react'
import './MapComponent.scss'
import '@arcgis/core/assets/esri/themes/dark/main.css'
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import type Map from '@arcgis/core/Map'
import PortalItem from '@arcgis/core/portal/PortalItem'
import useAppStore from '../../Store/AppStore'
import '@arcgis/map-components/components/arcgis-map'
import HighlightOnHover from '../HighlightOnHover'
import '@arcgis/map-components/components/arcgis-zoom'
import '@arcgis/map-components/components/arcgis-scale-bar'
import '@arcgis/map-components/components/arcgis-legend'
import SettingsComponent from '../SettingsComponent'

const EXTRA_LAYER_ITEM_ID = 'da8d7e7fbf82438c9e701ee66da2a455'
const AGENT_INCLUDED_EFFECT = 'drop-shadow(0, 0, 8px, yellow)'

const findFeatureLayer = (map: Map | null | undefined, title: string) => {
	const layer = map?.allLayers.find(l => l.title === title) as FeatureLayer | undefined
	if (layer) layer.outFields = ['*']
	return layer
}

const MapComponent: FC = () => {
	const mapRef = useRef<HTMLArcgisMapElement>(null)
	const setView = useAppStore(state => state.setView)
	const view = useAppStore(state => state.view)
	const setGolfcourts = useAppStore(state => state.setGolfcourts)
	const setGeotope = useAppStore(state => state.setGeotope)
	const setAmphibian = useAppStore(state => state.setAmphibian)
	const setAnimal = useAppStore(state => state.setAnimal)
	const setWater = useAppStore(state => state.setWater)
	const setWorldHeritage = useAppStore(state => state.setWorldHeritage)
	const setProtectedAreas = useAppStore(state => state.setProtectedAreas)
	const setProtectedLandscape = useAppStore(state => state.setProtectedLandscape)
	const setHabitat = useAppStore(state => state.setHabitat)
	const setRhine = useAppStore(state => state.setRhine)
	const [viewReady, setViewReady] = useState(false)
	const [plzLayer, setPlzLayer] = useState<FeatureLayer | null>(null)

	useEffect(() => {
		if (!viewReady || !mapRef.current) return
		mapRef.current.view.highlights = [
			{ name: 'click', color: 'orange' },
			{ name: 'hover', color: '#c8702a' },
		]
		setView(mapRef.current.view)

		const map = mapRef.current.view.map

		const entries = [
			['Golfplätze', setGolfcourts],
			['Geotope', setGeotope],
			['Amphibienlaichgebiete', setAmphibian],
			['Tierkorridore', setAnimal],
			['Hochwasserschutz', setWater],
			['Welterbegebiet', setWorldHeritage],
			['Naturschutzgebiet', setProtectedAreas],
			['Landschaftsschutz', setProtectedLandscape],
			['Lebensräume', setHabitat],
			['Hochwasserschutz Alpenrhein', setRhine],
		] as const
		for (const [title, setLayer] of entries) {
			const layer = findFeatureLayer(map, title)
			if (layer) setLayer(layer)
		}

		// The data exploration agent sets a grey drop-shadow; replace it with a yellow glow
		const handles = (map?.allLayers.toArray() ?? [])
			.filter(layer => layer.type === 'feature')
			.map(layer =>
				reactiveUtils.watch(
					() => (layer as FeatureLayer).featureEffect,
					effect => {
						if (!effect || effect.includedEffect === AGENT_INCLUDED_EFFECT) return
						const next = effect.clone()
						next.includedEffect = AGENT_INCLUDED_EFFECT
						;(layer as FeatureLayer).featureEffect = next
					},
				),
			)
		return () => {
			for (const handle of handles) handle.remove()
		}
	}, [
		viewReady,
		setView,
		setGolfcourts,
		setGeotope,
		setAmphibian,
		setAnimal,
		setWater,
		setWorldHeritage,
		setProtectedAreas,
		setProtectedLandscape,
		setHabitat,
		setRhine,
	])

	return (
		<arcgis-map
			ref={mapRef}
			itemId={'d026b09c72304cd8a1872ccf7be095e0'}
			onarcgisViewReadyChange={() => {
				if (!mapRef.current) return
				setViewReady(true)
			}}
			id="main-map"
			

		>
			<div slot="top-left" style={{ background: 'white', borderRadius: '4px', padding: '8px' }}>
					<SettingsComponent />
			</div>
			
			<HighlightOnHover view={view} />
			<arcgis-zoom slot="bottom-right"></arcgis-zoom>
			<arcgis-scale-bar slot="bottom-left"></arcgis-scale-bar>
			
		</arcgis-map>
	)
}

export default MapComponent
