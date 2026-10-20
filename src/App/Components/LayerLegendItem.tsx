import { type FC, useEffect, useRef, useState } from 'react'
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter'
import * as symbolUtils from '@arcgis/core/symbols/support/symbolUtils'
import type { SymbolUnion } from '@arcgis/core/symbols/types'
import type MapView from '@arcgis/core/views/MapView'
import type FeatureLayerView from '@arcgis/core/views/layers/FeatureLayerView'
import '@esri/calcite-components/dist/components/calcite-label'
import '@esri/calcite-components/dist/components/calcite-switch'

type ClassValue = string | number

interface LegendClass {
    value: ClassValue
    label: string
    symbol: SymbolUnion
}

interface LayerLegend {
    symbol?: SymbolUnion
    field?: string
    classes: LegendClass[]
}

const getLegend = (layer: FeatureLayer): LayerLegend => {
    const renderer = layer.renderer
    if (renderer?.type === 'simple') {
        return { symbol: renderer.symbol ?? undefined, classes: [] }
    }
    if (renderer?.type === 'unique-value') {
        const infos = renderer.uniqueValueInfos ?? []
        if (infos.length > 1 && renderer.field && !renderer.field2 && !renderer.valueExpression) {
            return {
                field: renderer.field,
                classes: infos.flatMap((info) =>
                    info.symbol
                        ? [{ value: info.value as ClassValue, label: info.label ?? String(info.value), symbol: info.symbol }]
                        : [],
                ),
            }
        }
        return { symbol: infos[0]?.symbol ?? renderer.defaultSymbol ?? undefined, classes: [] }
    }
    return { classes: [] }
}

const toSql = (value: ClassValue) =>
    typeof value === 'number' ? String(value) : `'${value.replace(/'/g, "''")}'`

const SymbolPreview: FC<{ symbol: SymbolUnion }> = ({ symbol }) => {
    const ref = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        let cancelled = false
        symbolUtils.renderPreviewHTML(symbol, { size: 16, symbolConfig: { isSquareFill: true } }).then((element) => {
            if (!cancelled && element) ref.current?.replaceChildren(element)
        })
        return () => {
            cancelled = true
        }
    }, [symbol])

    return <span ref={ref} style={{ display: 'inline-flex', width: 20, justifyContent: 'center' }} />
}

const rowStyle = { display: 'inline-flex', alignItems: 'center', gap: 6 } as const

interface LayerLegendItemProps {
    label: string
    layer: FeatureLayer | null
    view: MapView | null
}

const LayerLegendItem: FC<LayerLegendItemProps> = ({ label, layer, view }) => {
    const [legend, setLegend] = useState<LayerLegend>({ classes: [] })
    const [hidden, setHidden] = useState<ClassValue[]>([])

    useEffect(() => {
        if (!layer) return
        let cancelled = false
        layer.when().then(() => {
            if (!cancelled) setLegend(getLegend(layer))
        })
        return () => {
            cancelled = true
        }
    }, [layer])

    // Hides classes via a view-only filter so layer queries stay unaffected
    useEffect(() => {
        if (!layer || !view || !legend.field) return
        let cancelled = false
        view.whenLayerView(layer).then((layerView) => {
            if (cancelled) return
            ;(layerView as FeatureLayerView).filter = hidden.length
                ? new FeatureFilter({
                      where: `${legend.field} IS NULL OR ${legend.field} NOT IN (${hidden.map(toSql).join(', ')})`,
                  })
                : null
        })
        return () => {
            cancelled = true
        }
    }, [layer, view, legend.field, hidden])

    return (
        <div>
            <calcite-label layout="inline">
                <calcite-switch
                    checked={layer?.visible ?? true}
                    oncalciteSwitchChange={(event) => {
                        if (layer) {
                            layer.visible = event.target.checked
                        }
                    }}
                ></calcite-switch>
                <span style={rowStyle}>
                    {legend.symbol && <SymbolPreview symbol={legend.symbol} />}
                    {label}
                </span>
            </calcite-label>
            {legend.classes.map((item) => (
                <calcite-label key={String(item.value)} layout="inline" style={{ marginLeft: 24 }}>
                    <calcite-switch
                        scale="s"
                        checked={!hidden.includes(item.value)}
                        oncalciteSwitchChange={(event) => {
                            const visible = event.target.checked
                            setHidden((current) =>
                                visible ? current.filter((v) => v !== item.value) : [...current, item.value],
                            )
                        }}
                    ></calcite-switch>
                    <span style={rowStyle}>
                        <SymbolPreview symbol={item.symbol} />
                        {item.label}
                    </span>
                </calcite-label>
            ))}
        </div>
    )
}

export default LayerLegendItem
