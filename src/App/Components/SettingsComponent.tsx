import type FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import useAppStore from '../Store/AppStore'
import LayerLegendItem from './LayerLegendItem'
import '@esri/calcite-components/dist/components/calcite-block'

const SettingsComponent = () => {
    const view = useAppStore(state => state.view)
    const golfcourts = useAppStore(state => state.golfcourts)
    const geotope = useAppStore(state => state.geotope)
    const amphibian = useAppStore(state => state.amphibian)
    const animal = useAppStore(state => state.animal)
    const water = useAppStore(state => state.water)
    const worldHeritage = useAppStore(state => state.worldHeritage)
    const protectedAreas = useAppStore(state => state.protectedAreas)
    const protectedLandscape = useAppStore(state => state.protectedLandscape)
    const habitat = useAppStore(state => state.habitat)
    const rhine = useAppStore(state => state.rhine)

    const layers: { label: string; layer: FeatureLayer | null }[] = [
        { label: 'Golfplätze', layer: golfcourts },
        { label: 'Geotope', layer: geotope },
        { label: 'Amphibienlaichgebiete', layer: amphibian },
        { label: 'Tierkorridore', layer: animal },
        { label: 'Hochwasserschutz', layer: water },
        { label: 'Welterbegebiet', layer: worldHeritage },
        { label: 'Naturschutzgebiet', layer: protectedAreas },
        { label: 'Landschaftsschutz', layer: protectedLandscape },
        { label: 'Lebensräume', layer: habitat },
        { label: 'Hochwasserschutz Alpenrhein', layer: rhine },
    ]

    return (
        <calcite-block heading="Legende" collapsible>
            {layers.map(({ label, layer }) => (
                <LayerLegendItem key={label} label={label} layer={layer} view={view} />
            ))}
        </calcite-block>
    )
}

export default SettingsComponent