import { createRoot } from 'react-dom/client'
import App from './App/App'
import './i18n'
import axios from 'axios'
import * as z from 'zod'
import { AppStoreProvider } from './App/Store/AppStore'
import { ConfigSchema } from './config/config'

import { getCredential, signIn } from './PortalAuth'

const root = createRoot(document.getElementById('root') as HTMLElement)

axios.get('config/config.json').then(async (response) => {
    const config = response.data
    const parsedConfig = ConfigSchema.safeParse(config)

    if (parsedConfig.success) {
        try {
            await signIn(parsedConfig.data.clientId, parsedConfig.data.portalUrl)
        } catch (_err) {
            await getCredential(parsedConfig.data.portalUrl)
        }
        root.render(
            <AppStoreProvider config={parsedConfig.data}>
                <App />
            </AppStoreProvider>)
    } else {
        root.render(<div style={{ padding: 20, fontSize: 15, color: 'red' }}>
            Invalid config!
            <div style={{ color: 'black', marginTop: 10, whiteSpace: 'pre-line' }}>
                {z.prettifyError(parsedConfig.error)}
            </div>
        </div>)
    }

})

