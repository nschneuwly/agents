import { useEffect, useState } from 'react'
import View from '../View'
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils'
import type { Extent } from '@arcgis/core/geometry'

export const useViewProperties = () => {

    const [viewReady, setViewReady] = useState<boolean>(false)
    const [extent, setExtent] = useState<Extent>()

    useEffect(() => {
        reactiveUtils.whenOnce(() => View.ready)
            .then(ready => ready && setViewReady(true))
        const extentHandle = reactiveUtils.watch(
            () => View.extent,
            value => setExtent(value)
        )
       
        return () => extentHandle.remove()
    }, [])

    return { viewReady: viewReady, extent: extent }
}