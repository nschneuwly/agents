# Architektur-Referenz

## Zustand Store (Context-basiert)

Der Store wird über React Context bereitgestellt, nicht als globaler Modul-Export. Das ermöglicht Isolation in Tests und mehrere Store-Instanzen.

### Store-Datei: `src/store/AppStore.tsx`

```tsx
import type MapView from '@arcgis/core/views/MapView'
import { createContext, useContext, useRef } from 'react'
import { createStore, useStore } from 'zustand'
import type { Config } from '../config/config'
import i18n from '../i18n'

interface AppStoreInitProps {
	config: Config
}

interface AppStoreState extends AppStoreInitProps {
	activeLanguage: string
	toggleLang: () => void
	view: MapView | null
	setView: (view: MapView) => void
}

type AppStore = ReturnType<typeof createAppStore>

const createAppStore = (initProps: AppStoreInitProps) => {
	return createStore<AppStoreState>()((set, get) => ({
		...initProps,
		activeLanguage: '{{FALLBACK_LANG}}',
		toggleLang: () => {
			// Sprachen durchrotieren basierend auf konfigurierten Sprachen
			const langs = ['{{LANG_LIST}}'] // z.B. ['de', 'en']
			const current = get().activeLanguage
			const idx = langs.indexOf(current)
			const next = langs[(idx + 1) % langs.length] ?? langs[0]
			set({ activeLanguage: next })
			i18n.changeLanguage(next)
		},
		view: null,
		setView: view => set({ view }),
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
```

### Konventionen

- `AppStoreState` Interface definiert die gesamte State-Shape
- Actions verwenden `set()` zum Schreiben und `get()` zum Lesen im Setter
- Config kommt als Init-Prop rein und ist als `state.config` verfügbar
- Selektoren immer fine-grained: `useAppStore(s => s.someValue)`
- Bei wachsendem Store: Slices verwenden (separate Funktionen, die Partial-State beitragen)

## i18n Setup

### `src/i18n.ts`

```ts
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import translations from './lang/translations.json'
import getByLangKey from './lang/util'

i18n
	.use(initReactI18next)
	.use(LanguageDetector)
	.init({
		resources: getByLangKey(translations),
		fallbackLng: '{{FALLBACK_LANG}}',
		interpolation: {
			escapeValue: false,
		},
	})

export default i18n
```

### `src/lang/model.ts`

```ts
export type Translations = typeof import('./translations.json')
```

### `src/lang/util.ts`

```ts
import type { Translations } from './model'

type I18nResources = Record<string, { translation: Record<string, string> }>

function getByLangKey(json: Translations): I18nResources {
	const resources: I18nResources = { '{{FALLBACK_LANG}}': { translation: {} } }

	for (const [key, langs] of Object.entries(json)) {
		for (const [lang, value] of Object.entries(langs)) {
			resources[lang] ??= { translation: {} }
			resources[lang].translation[key] = value
		}
	}

	return resources
}

export default getByLangKey
```

### `src/lang/translations.json`

Key-basiertes Format — einfacher zu pflegen bei vielen Keys:

```json
{
	"app-title": {
		"de": "{{APP_NAME}}",
		"en": "{{APP_NAME}}"
	}
}
```

Für jede konfigurierte Sprache einen Eintrag pro Key hinzufügen.

## Komponenten-Konventionen

- Funktionale Komponenten mit `FC`-Type
- Default Exports
- Eigener Ordner pro Feature-Komponente: `components/FeatureName/FeatureName.tsx` + `FeatureName.css`
- Einfache/geteilte Komponenten direkt als Datei in `components/`
- Logik in Custom Hooks auslagern

## Root-Komponente: `src/components/App.tsx`

```tsx
import type { FC } from 'react'
import './App.css'
import MapComponent from './MapComponent/MapComponent'

const App: FC = () => {
	return (
		<div className="app">
			<MapComponent />
		</div>
	)
}

export default App
```

### `src/components/App.css`

```css
html,
body,
#root,
.app {
	padding: 0;
	margin: 0;
	width: 100%;
	height: 100%;
	font-family: Roboto, sans-serif;
	overflow: hidden;
	font-size: 11pt;
}
```
