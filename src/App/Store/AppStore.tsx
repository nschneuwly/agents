import type MapView from '@arcgis/core/views/MapView'
import { createContext, useContext, useRef } from 'react'
import { createStore, useStore } from 'zustand'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import type { Config } from '../../config/config'
import i18n from '../../i18n'

export interface AppError {
	id: string
	messages: string[]
}

interface AppStoreInitProps {
	config: Config
}

interface AppStoreState extends AppStoreInitProps {
	activeLanguage: string
	toggleLang: () => void
	basemap: string
	setBasemap: (value: string) => void
	errors: AppError[]
	setErrors: (value: AppError[]) => void
	addError: (messages: string[]) => void
	removeError: (value: AppError) => void
	view: MapView | null
	setView: (view: MapView) => void

	golfcourts: FeatureLayer | null
	setGolfcourts: (layer: FeatureLayer) => void
	geotope: FeatureLayer | null
	setGeotope: (layer: FeatureLayer) => void
	amphibian: FeatureLayer | null
	setAmphibian: (layer: FeatureLayer) => void
	animal: FeatureLayer | null
	setAnimal: (layer: FeatureLayer) => void
	water: FeatureLayer | null
	setWater: (layer: FeatureLayer) => void
	worldHeritage: FeatureLayer | null
	setWorldHeritage: (layer: FeatureLayer) => void
	protectedAreas: FeatureLayer | null
	setProtectedAreas: (layer: FeatureLayer) => void
	protectedLandscape: FeatureLayer | null
	setProtectedLandscape: (layer: FeatureLayer) => void
	habitat: FeatureLayer | null
	setHabitat: (layer: FeatureLayer) => void
	rhine: FeatureLayer | null
	setRhine: (layer: FeatureLayer) => void
}

type AppStore = ReturnType<typeof createAppStore>

const createAppStore = (initProps: AppStoreInitProps) => {
	return createStore<AppStoreState>()((set, get) => ({
		...initProps,
		golfcourts: null,
		setGolfcourts: (layer) => set(() => ({ golfcourts: layer })),
		rhine: null,
		setRhine: (layer) => set(() => ({ rhine: layer })),
		protectedAreas: null,
		setProtectedAreas: (layer) => set(() => ({ protectedAreas: layer })),
		protectedLandscape: null,
		setProtectedLandscape: (layer) => set(() => ({ protectedLandscape: layer })),
		habitat: null,
		setHabitat: (layer) => set(() => ({ habitat: layer })),
		geotope: null,
		setGeotope: (layer) => set(() => ({ geotope: layer })),
		amphibian: null,
		setAmphibian: (layer) => set(() => ({ amphibian: layer })),
		animal: null,
		setAnimal: (layer) => set(() => ({ animal: layer })),
		water: null,
		setWater: (layer) => set(() => ({ water: layer })),
		worldHeritage: null,
		setWorldHeritage: (layer) => set(() => ({ worldHeritage: layer })),
		activeLanguage: 'de',
		toggleLang: () => {
			set((state) => ({
				activeLanguage: state.activeLanguage === 'de' ? 'en' : 'de',
			}))
			i18n.changeLanguage(get().activeLanguage)
		},
		basemap: 'topo-vector',
		setBasemap: () =>
			set((state) => ({
				basemap:
					state.basemap === 'topo-vector'
						? 'streets-navigation-vector'
						: 'topo-vector',
			})),
		errors: [],
		setErrors: (value) => set(() => ({ errors: value })),
		addError: (value) =>
			set(() => ({
				errors: [...get().errors, { id: crypto.randomUUID(), messages: value }],
			})),
		removeError: (value) =>
			set(() => ({ errors: get().errors.filter((e) => e !== value) })),
		view: null,
		setView: (view) => set(() => ({ view: view })),
	}))
}

export const AppStoreContext = createContext<AppStore | null>(null)

type AppStoreProviderProps = React.PropsWithChildren<AppStoreInitProps>

export const AppStoreProvider = ({
	children,
	...props
}: AppStoreProviderProps) => {
	const storeRef = useRef<AppStore>(null)
	if (!storeRef.current) {
		storeRef.current = createAppStore(props)
	}
	return (
		<AppStoreContext.Provider value={storeRef.current}>
			{children}
		</AppStoreContext.Provider>
	)
}

export default function useAppStore<T>(
	selector: (state: AppStoreState) => T,
): T {
	const store = useContext(AppStoreContext)
	if (!store) throw new Error('Missing AppStoreContext.Provider in the tree')
	return useStore(store, selector)
}
