import Basemap from '@arcgis/core/Basemap'
import Portal from '@arcgis/core/portal/Portal'
import LocalBasemapsSource from '@arcgis/core/widgets/BasemapGallery/support/LocalBasemapsSource'
import { useEffect, useState } from 'react'

const useBasemaps = (groupId: string, portalUrl: string) => {
	const [basemapsSource, setBasemapsSource] =
		useState<LocalBasemapsSource | null>(null)

	useEffect(() => {
		const portal = new Portal({
			url: portalUrl,
		})

		portal
			.load()
			.then(async () => {
				// Suche explizit nach Web Maps in der Gruppe
				const searchResult = await portal.queryItems({
					query: `group:${groupId} AND (type:"Web Map" OR type:"Vector Tile Service")`,
					num: 20,
				})

				// Erstelle manuelle Basemap-Objekte aus den Funden
				const basemaps = searchResult.results.map(item => {
					return new Basemap({
						portalItem: {
							id: item.id,
							portal: portal,
						},
					})
				})

				// Die Gallery erwartet eine Source. LocalBasemapsSource nimmt ein Array von Basemaps entgegen.
				const localSource = new LocalBasemapsSource({
					basemaps: basemaps,
				})
				setBasemapsSource(localSource)
			})
			.catch(err => {
				console.error('Error loading portal:', err)
			})
	}, [portalUrl, groupId])

	return basemapsSource
}

export default useBasemaps
