import type { FC } from 'react'
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import './App.scss'
import AppErrorComponent from './Components/AppErrorComponent'
import HookDemo from './Components/HookDemo'
import MapComponent from './Components/MapComponent/MapComponent'
import ToggleLang from './Components/ToggleLang'
import useAppStore from './Store/AppStore'
import esriLogoUrl from '../../static/gnav-dist-esri-suisse-no-tm.svg'
import stUrl from '../../static/Coat_of_arms_of_canton_of_St._Gallen.svg'

import '@arcgis/map-components/components/arcgis-layer-list'
import '@esri/calcite-components/components/calcite-shell'
import '@esri/calcite-components/components/calcite-shell-panel'
import '@esri/calcite-components/components/calcite-navigation'
import '@esri/calcite-components/components/calcite-navigation-logo'
import '@esri/calcite-components/components/calcite-label'
import '@esri/calcite-components/components/calcite-notice'
import '@esri/calcite-components/components/calcite-button'

import "@arcgis/ai-components/components/arcgis-assistant";
import "@arcgis/ai-components/components/arcgis-assistant-agent";
import "@arcgis/ai-components/components/arcgis-assistant-data-exploration-agent";
import "@arcgis/ai-components/components/arcgis-assistant-navigation-agent";
import { LangGraphAgent } from './LangGraphAssistant'

const App: FC = () => {
	const view = useAppStore(state => state.view)

	return (
		<div className="app">
			<calcite-shell>
				<MapComponent />
				<calcite-navigation slot="header">
					<calcite-navigation-logo
						slot="logo"
						heading="KI gestützte Web Map"
					/>
					<div slot="content-end" className="app-navigation-logo">
						<img src={esriLogoUrl} alt="Esri Suisse" />
					</div>
					
					
				</calcite-navigation>
				
				<calcite-shell-panel slot="panel-end" resizable width="l" id="assistant-panel">
					<calcite-panel>
						{view && (
							<arcgis-assistant
								reference-element="#main-map"
								onarcgisSubmit={() => {
									for (const layer of view.map?.allLayers ?? []) {
										if (layer.type === 'feature') (layer as FeatureLayer).featureEffect = null
									}
								}}
								heading="Web Map Assistent"
								description="Nutze diesen Assistenten, um Informationen über externe Textdokumente zu erhalten."
								entryMessage="Nutze die Karte zusammen mit diesem Assistenten um Informationen zu erhalten."
								suggestedPrompts={[
									"Markiere alle Wildtierübergänge auf der Karte",
									"Markiere das grösste Naturschutzgebiet",
								]}
								keep-suggested-prompts
								log-enabled
							>
								
								<arcgis-assistant-data-exploration-agent></arcgis-assistant-data-exploration-agent>
								<arcgis-assistant-navigation-agent></arcgis-assistant-navigation-agent>

							</arcgis-assistant>
						)}
					</calcite-panel>
				</calcite-shell-panel>
			</calcite-shell>
			
			
		</div>
	)
}

export default App
