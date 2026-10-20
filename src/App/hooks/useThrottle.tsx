import { useCallback, useEffect, useRef, type DependencyList, type EffectCallback } from 'react'
import { throttle } from 'lodash'

// Custom Hook for calling a throttled useEffect
// Usage: useThrottled(() => console.log('do something'), 1000, [value])
// Usage: useThrottled(function, timeout, changedValue)
const useThrottle = (cb: EffectCallback, delay: number, additionalDeps: DependencyList) => {
    const options = { leading: true, trailing: true } // pass custom lodash options
    const cbRef = useRef(cb)
    const throttledCb = useCallback(
        throttle((...args) => cbRef.current(...args), delay, options),
        [delay]
    )
    useEffect(() => {
        cbRef.current = cb
    })
    // set additionalDeps to execute effect, when other values change (not only on delay change)
    useEffect(throttledCb, [throttledCb, ...additionalDeps])
}

export default useThrottle