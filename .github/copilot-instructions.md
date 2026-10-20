# Project Guidelines

## Overview

This is a React web application template for building geospatial apps using the ArcGIS Maps SDK for JavaScript. All apps derived from this template follow the same architecture and conventions described below.

## Tech Stack

- **React 19** with functional components and hooks (no class components)
- **TypeScript** with strict mode enabled (`tsconfig.json`)
- **Zustand** for state management (context-based store pattern)
- **Vite** for bundling and dev server
- **Biome** for linting and formatting
- **Vitest** + **React Testing Library** for testing
- **SCSS** for component-scoped styles
- **Zod** for runtime schema validation (config, API responses)
- **i18next** + **react-i18next** for internationalization
- **ArcGIS Maps SDK for JavaScript** (`@arcgis/core` v5+) with Map Components (`@arcgis/map-components`)
- **Calcite Design System** (`@esri/calcite-components`) for UI components
- **ArcGIS REST JS** (`@esri/arcgis-rest-portal`, `@esri/arcgis-rest-request`) for portal operations

## Project Structure

```
src/
  index.html          # HTML entry point
  index.tsx           # App bootstrap, config loading, auth
  i18n.ts             # i18next initialization
  PortalAuth.ts       # OAuth authentication helpers (ArcGIS Portal/Online)
  config/
    config.json       # Runtime configuration (deployed separately)
    config.ts         # Zod schema + Config type
  lang/
    translations.json # Key-based translation strings
    model.ts          # Translation type
    util.ts           # Transforms translations into i18next format
  App/
    App.tsx            # Root component
    App.scss           # Global styles
    Store/
      AppStore.tsx     # Zustand store (context-based)
    Components/        # Feature components (each in its own folder)
      MapComponent/    # Map component with SCSS + hooks
    hooks/             # Reusable custom hooks
  tests/
    setup.ts           # Vitest setup (jest-dom matchers)
    main.test.ts       # General tests
    components/        # Component tests
```

## Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Preview production build | `npm run preview` |
| Lint & format check | `npx @biomejs/biome check .` |
| Lint & format fix | `npx @biomejs/biome check --write .` |
| Run tests | `npx vitest` |
| Run tests once | `npx vitest run` |

## Code Style and Formatting

Biome enforces the code style. Key rules:

- **Tabs** for indentation (not spaces)
- **Single quotes** for strings
- **No semicolons** (ASI)
- Follow the `recommended` Biome ruleset
- Do not add lint-suppression comments without a clear justification

## Architecture Conventions

### Components

- Use **functional components** with `FC` type from React
- **Single components are plain files** in `Components/` — do NOT wrap every component in its own folder (e.g. `Components/Header.tsx`, `Components/Header.css`)
- **Only create a subfolder** when a feature is a larger functional block composed of multiple files (multiple components, hooks, helpers). Example: `Components/Search/Search.tsx` + `SearchSuggestions.tsx` + `useSearch.ts` + `Search.css`
- Co-locate component-specific CSS (`.css` / `.scss`) next to the component file
- Export components as **default exports**
- Keep components focused — extract logic into custom hooks

### State Management (Zustand)

- The app uses a **context-based Zustand store** pattern (not vanilla module-level stores)
- The store is created via `createStore` and provided through React context (`AppStoreContext`)
- Access state with the `useAppStore` selector hook: `useAppStore((state) => state.someValue)`
- Select only what you need — use fine-grained selectors to avoid unnecessary re-renders
- Define the state shape in the `AppStoreState` interface before implementing it
- Add new state, computed values, and actions directly to the store interface and implementation in `AppStore.tsx`
- Actions that modify state use `set()`. Actions that read current state inside a setter use `get()`
- The `Config` object is passed as an init prop and available as `state.config`
- When the store grows, split into **slices** (separate functions that contribute partial state) composed in `createAppStore`

### Custom Hooks

- Place reusable hooks in `src/App/hooks/`
- Name hooks with the `use` prefix: `useFeatureName.ts`
- Hook files that are specific to a component can live in that component's folder (e.g., `MapComponent/useBasemaps.ts`)

### Configuration

- Runtime config is loaded from `config/config.json` at startup via HTTP (not bundled)
- The config schema is defined as a **Zod schema** in `src/config/config.ts` — always validate with `ConfigSchema.safeParse()`
- The `Config` type is inferred from the Zod schema: `type Config = z.infer<typeof ConfigSchema>`
- When adding a new config property:
  1. Add the field to `ConfigSchema` in `config.ts` with appropriate Zod validators
  2. Add a default/example value to `config.json`
  3. Access it in components via `useAppStore((state) => state.config.newProperty)`

### Authentication

- OAuth authentication is handled in `PortalAuth.ts` using ArcGIS Identity Manager. If the Portal is federated to an enterprise IdP via SAML, the app code is unchanged — SAML is handled inside the Portal.
- Auth runs during bootstrap in `index.tsx` before rendering the app

### Internationalization (i18n)

- Translations live in `src/lang/translations.json` in a **key-based format**:
  ```json
  {
    "my-key": {
      "de": "German text",
      "en": "English text"
    }
  }
  ```
- The `util.ts` transformer converts this key-based format into i18next-compatible structure at runtime
- The fallback language is German (`de`)
- Use `useTranslation()` hook or `t('key')` from i18next in components
- When adding new user-facing strings, add entries to `translations.json` with both `de` and `en` values

## ArcGIS Maps SDK Patterns

### Map Components (Web Components)

- Use `@arcgis/map-components` web components in JSX: `<arcgis-map>`, `<arcgis-basemap-gallery>`, etc.
- Import map components individually: `import '@arcgis/map-components/components/arcgis-map'`
- Type declarations for React are provided via `src/vite.env.d.ts` triple-slash references
- Access the `MapView` from the map component ref: `mapRef.current.view`
- Listen for lifecycle events like `onarcgisViewReadyChange`
- **Always suppress the map focus ring** after view-ready (blue border on click). Use both methods:
  ```tsx
  // In the viewReady useEffect:
  view.container.style.setProperty('--esri-view-outline', 'none')
  const shadow = mapRef.current.shadowRoot
  if (shadow) {
      const style = document.createElement('style')
      style.textContent = '.esri-view .esri-view-surface:focus::after { outline: none !important; }'
      shadow.appendChild(style)
  }
  ```
  Also add `outline: none;` to the `arcgis-map` CSS rule.

### Working with the ArcGIS API

- Import ArcGIS modules from `@arcgis/core/...` (ES modules, no AMD)
- Use `reactiveUtils` from `@arcgis/core/core/reactiveUtils` for watching property changes on ArcGIS objects
- Store the `MapView` reference in the Zustand store so other components can access it
- Use `Portal` and `PortalQueryParams` from `@arcgis/core/portal/` for portal operations
- Wrap ArcGIS async operations in custom hooks, cleaning up `reactiveUtils` handles in `useEffect` return functions: `return () => handle.remove()`

### Calcite Design System

- Use Calcite web components (`<calcite-button>`, `<calcite-panel>`, etc.) for UI instead of custom HTML elements
- Import only the Calcite components you need in each file: `import '@esri/calcite-components/dist/components/calcite-button'`
- Use HTML element names directly in JSX — do NOT use Calcite React wrapper imports
- Refer to the [Calcite documentation](https://developers.arcgis.com/calcite-design-system/components/) for available components and their APIs

```tsx
// ❌ Wrong — do not use React wrapper imports
import { CalciteButton } from '@esri/calcite-components-react';

// ✅ Correct — import the component, then use the web component element in JSX
import '@esri/calcite-components/dist/components/calcite-button'

<calcite-button appearance="solid" kind="brand" onClick={handleClick}>
  {t('submit')}
</calcite-button>
```

#### Calcite v5 deprecated properties

The `open` property has been renamed to `expanded` on several components. Always use the new name:

| Component | ❌ Deprecated | ✅ Use instead |
|-----------|--------------|----------------|
| `calcite-block` | `open` | `expanded` |
| `calcite-list-item` | `open` | `expanded` |
| `calcite-tree-item` | `expanded` is correct (unchanged) | — |

```tsx
// ❌ Wrong — deprecated in Calcite v5
<calcite-block heading="Filters" open collapsible>

// ✅ Correct
<calcite-block heading="Filters" expanded collapsible>
```

#### Calcite icon names

Calcite icons use **kebab-case** in HTML attributes (the underlying asset files use camelCase). Do NOT guess icon names — many intuitive names do not exist. Common mistakes:

| ❌ Wrong (does not exist) | ✅ Correct |
|--------------------------|-----------|
| `drop` | `water-drop` |
| `water` | `water-drop` |
| `tree` | `tree-stand` |
| `globe` | `globe-navigation` |

When unsure, verify against the [Calcite Icons reference](https://developers.arcgis.com/calcite-design-system/icons/) or check the installed icon assets at `node_modules/@esri/calcite-components/dist/calcite/assets/icon/`.

## Security

- Never commit secrets, API keys, or `clientId` values — use environment variables or the runtime `config.json`
- Validate all external data (API responses, config) with Zod schemas before use
- Authentication tokens are managed by the ArcGIS Identity Manager — do not store tokens manually

## Deployment

- Production builds go to `dist/` via `npm run build`
- `config.json` and `CHANGELOG.md` are copied to the build output by `vite-plugin-static-copy`
- The app uses relative base paths (`base: './'`) so it can be deployed to any subdirectory
- Always update `CHANGELOG.md` before delivering to customers

## Versioning

- The app version is read directly from `package.json` — no separate version constant:
  ```tsx
  import { version } from '../../package.json'
  ```
- The version is displayed **unobtrusively in the bottom-right** corner of the app (small, low-contrast text that doesn't distract from the main UI)
- Use a simple `<span>` or Calcite element with reduced opacity / small font size — no prominent badge or banner
- The version display should always be present (not hidden behind a menu)
