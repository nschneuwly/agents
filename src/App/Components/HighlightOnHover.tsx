import type Graphic from '@arcgis/core/Graphic'
import type MapView from '@arcgis/core/views/MapView'
import type { GraphicHit } from '@arcgis/core/views/types'
import type { FC } from 'react'
import { useEffect } from 'react'

interface HighlightOnHoverProps {
	view: MapView | null
}

const HighlightOnHover: FC<HighlightOnHoverProps> = ({ view }) => {
	useEffect(() => {
		if (!view) return

		let highlights: { remove(): void }[] = []
		let pending = false
		let latest: { x: number; y: number } | null = null

		const clear = () => {
			for (const h of highlights) h.remove()
			highlights = []
		}

		const update = async () => {
			if (pending) return
			pending = true
			try {
				while (latest) {
					const point = latest
					latest = null
					const response = await view.hitTest(point)
					const byLayer = new Map<Graphic['layer'], Graphic[]>()
					for (const result of response.results) {
						if (result.type !== 'graphic') continue
						const { graphic } = result as GraphicHit
						if (graphic.geometry?.type !== 'polygon' || !graphic.layer) continue
						byLayer.set(graphic.layer, [...(byLayer.get(graphic.layer) ?? []), graphic])
					}
					const next: { remove(): void }[] = []
					for (const [layer, graphics] of byLayer) {
						const lv = await view.whenLayerView(layer as never)
						if ('highlight' in lv) {
							next.push(
								(lv as { highlight: (g: Graphic[], o: { name: string }) => { remove(): void } }).highlight(
									graphics,
									{ name: 'hover' },
								),
							)
						}
					}
					clear()
					highlights = next
				}
			} finally {
				pending = false
			}
		}

		const moveHandle = view.on('pointer-move', event => {
			latest = { x: event.x, y: event.y }
			void update()
		})
		const leaveHandle = view.on('pointer-leave', () => {
			latest = null
			clear()
		})

		return () => {
			moveHandle.remove()
			leaveHandle.remove()
			clear()
		}
	}, [view])

	return null
}

export default HighlightOnHover
