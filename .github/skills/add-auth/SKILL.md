---
name: add-auth
description: "Fügt Authentifizierung zu einer bestehenden ArcGIS React Webapp hinzu. Default: OAuth (ArcGIS Portal/Online). Alternative: API Key (ArcGIS Location Platform). Verwende diesen Skill wenn: Login hinzufügen, Authentifizierung einrichten, OAuth konfigurieren, API Key einbinden, App absichern, protected app. OAuth funktioniert auch wenn das Portal intern SAML/SSO zum Firmen-IdP nutzt — App-seitig ist es immer OAuth."
argument-hint: "Auth-Typ: oauth (default) oder apikey"
---

# Add Auth — Authentifizierung hinzufügen

Fügt einen Auth-Mechanismus zu einem bestehenden Projekt hinzu. **Default ist OAuth gegen ArcGIS Portal**, alternativ kann ein **API Key** für die ArcGIS Location Platform konfiguriert werden.

## Entscheidung: OAuth oder API Key?

Frag den User wenn nicht aus dem Kontext klar:

| Frage | OAuth | API Key |
|-------|-------|---------|
| Greift die App auf **Portal-Items** (Webmap, FeatureLayer, geschützte Daten) zu? | ✅ Nötig | ❌ Reicht nicht |
| Nur **öffentliche** Basemaps + Geocoding/Routing? | Übertrieben | ✅ Passt |
| Sollen sich **User mit eigenem Account** einloggen? | ✅ Nötig | ❌ Geht nicht |
| Soll die App **anonym** für jeden funktionieren? | ❌ Nein | ✅ Ja |
| Enterprise mit SSO/SAML? | ✅ OAuth (Portal kümmert sich um SSO) | ❌ Geht nicht |

**Im Zweifel: OAuth.** API Key nur wenn explizit nur Location-Platform-Services genutzt werden.

Beide Varianten können auch **kombiniert** werden (OAuth für Portal-Inhalte + API Key nur für eine spezifische Premium-Service-URL).

---

## Variante A: OAuth (Default)

### Wann

- ArcGIS Portal/Online als Identity Provider
- App nutzt Portal-Items (Webmaps, FeatureLayer, etc.)
- Auch wenn das Portal intern via SAML/SSO an einen Enterprise-IdP föderiert ist — der App-Code bleibt reines OAuth

### Was der Skill tut

1. Erstellt `src/PortalAuth.ts`
2. Erweitert Config-Schema um `clientId`
3. Ergänzt `index.tsx` mit Auth-Init vor dem Rendern
4. Aktualisiert `config.json` mit Platzhalter-`clientId`

### Voraussetzungen

- Bestehendes Projekt mit `init-webapp`-Struktur
- `portalUrl` bereits in Config-Schema vorhanden

### Implementation

#### 1. `src/PortalAuth.ts` erstellen

```ts
import esriId from '@arcgis/core/identity/IdentityManager'
import OAuthInfo from '@arcgis/core/identity/OAuthInfo'

export const signIn = async (appId: string, portalUrl: string) => {
	const info = new OAuthInfo({
		appId: appId,
		portalUrl: portalUrl,
		popup: false,
	})
	esriId.registerOAuthInfos([info])
	return esriId.checkSignInStatus(`${info.portalUrl}/sharing`)
}

export const getCredential = async (portalUrl: string) => {
	return esriId.getCredential(`${portalUrl}/sharing`)
}
```

#### 2. Config-Schema erweitern

In `src/config/config.ts`, `clientId` hinzufügen:

```ts
export const ConfigSchema = z.object({
	portalUrl: z.string().url(),
	webmapId: z.string().trim().min(1),
	clientId: z.string().trim().min(1),
})
```

#### 3. `src/index.tsx` anpassen

Auth-Init **vor** dem Rendern einfügen:

```tsx
import { getCredential, signIn } from './PortalAuth'

// Nach erfolgreichem Config-Parse:
try {
	await signIn(parsedConfig.data.clientId, parsedConfig.data.portalUrl)
} catch (_err) {
	getCredential(parsedConfig.data.portalUrl)
}

// Dann erst rendern:
root.render(...)
```

#### 4. `config.json` aktualisieren

```json
{
	"portalUrl": "https://www.arcgis.com",
	"webmapId": "...",
	"clientId": "YOUR_CLIENT_ID"
}
```

### Hinweise

- Die `clientId` wird im ArcGIS Portal als "Entwickler-Anmeldeinfos" (Developer Credentials) oder als "Anwendung" mit anschließendem "Register" erstellt
- `popup: false` bedeutet Redirect-basierte Authentifizierung (kein Popup-Fenster)
- Die `portalUrl` muss identisch sein mit der URL des Portals, in dem die App registriert ist
- **ArcGIS Online: immer `https://www.arcgis.com` — niemals `https://arcgis.com` (ohne `www`).** Der IdentityManager speichert das OAuth-Token unter der exakten Redirect-URL (`www.arcgis.com`). Fehlt das `www`, findet `checkSignInStatus` das Token nicht → Login-Redirect bei jedem Seitenaufruf.
- Die Redirect URIs im App-Item müssen alle Origins enthalten, auf denen die App läuft (Dev: `http://localhost:5173`, Prod: deine Domain)
- Die `clientId` ist nicht geheim und darf im Browser-Bundle landen — sie ist nur eine Kennung

### User-Navigation mit Logout (Standard bei OAuth)

Bei OAuth-Authentifizierung **immer** einen User-Button im Header einbauen, der den eingeloggten Benutzer zeigt und ein Dropdown mit „My Account" + „Sign out" bietet:

```tsx
import { type FC, useEffect, useRef, useState } from 'react'
import '@esri/calcite-components/dist/components/calcite-navigation-user'
import '@esri/calcite-components/dist/components/calcite-dropdown'
import '@esri/calcite-components/dist/components/calcite-dropdown-group'
import '@esri/calcite-components/dist/components/calcite-dropdown-item'
import Portal from '@arcgis/core/portal/Portal'
import esriId from '@arcgis/core/identity/IdentityManager'

// Im Header-Component:
const [user, setUser] = useState<{ fullName: string; thumbnailUrl?: string } | null>(null)

useEffect(() => {
	const portal = Portal.getDefault()
	portal.load().then(() => {
		setUser({
			fullName: portal.user.fullName,
			thumbnailUrl: portal.user.thumbnailUrl,
		})
	})
}, [])

const handleSignOut = () => {
	esriId.destroyCredentials()
	window.location.reload()
}

// Im JSX (innerhalb von <calcite-navigation>):
<calcite-dropdown slot="user" placement="bottom-end">
	<calcite-navigation-user
		slot="trigger"
		fullName={user.fullName}
		thumbnail={user.thumbnailUrl}
	/>
	<calcite-dropdown-group>
		<calcite-dropdown-item iconStart="user" href="{{PORTAL_URL}}/home/user.html" target="_blank">
			My Account
		</calcite-dropdown-item>
		<calcite-dropdown-item iconStart="sign-out" onCalciteDropdownItemSelect={handleSignOut}>
			Sign out
		</calcite-dropdown-item>
	</calcite-dropdown-group>
</calcite-dropdown>
```

Ersetze `{{PORTAL_URL}}` mit dem konfigurierten Portal (z.B. `https://www.arcgis.com` oder Enterprise-URL). Kann auch dynamisch aus `useAppStore(s => s.config.portalUrl)` gelesen werden.

---

## Variante B: API Key (Location Platform)

### Wann

- App nutzt nur **öffentliche** Esri-Services (Basemaps, Geocoding, Routing, etc.)
- Kein Login von End-Usern gewünscht
- Kein Zugriff auf private Portal-Items nötig

### Was der Skill tut

1. Erweitert Config-Schema um `apiKey`
2. Setzt `esriConfig.apiKey` beim Bootstrap
3. Aktualisiert `config.json` mit Platzhalter-`apiKey`

### Implementation

#### 1. Config-Schema erweitern

In `src/config/config.ts`, `apiKey` hinzufügen:

```ts
export const ConfigSchema = z.object({
	portalUrl: z.string().url(),
	webmapId: z.string().trim().min(1),
	apiKey: z.string().trim().min(1),
})
```

#### 2. `src/index.tsx` anpassen

API Key **vor** dem Rendern global setzen:

```tsx
import esriConfig from '@arcgis/core/config'

// Nach erfolgreichem Config-Parse:
esriConfig.apiKey = parsedConfig.data.apiKey

// Dann erst rendern:
root.render(...)
```

#### 3. `config.json` aktualisieren

```json
{
	"portalUrl": "https://www.arcgis.com",
	"webmapId": "...",
	"apiKey": "AAPK..."
}
```

### Hinweise

- API Key wird im [ArcGIS Developer Dashboard](https://developers.arcgis.com) als "API Key Credentials" erstellt
- API Key gilt **nur für ArcGIS Location Platform Services** (Basemap-Styles, Geocoding, Routing, Places, Demographics)
- API Key kann **keine** privaten Portal-Items entsperren — dafür braucht es OAuth
- API Key sollte über **Referrer-Whitelist** und/oder **Service-Scope** im Dashboard eingeschränkt werden (Standard-Schutz gegen Missbrauch)
- Erscheint im Browser-Bundle — daher Scope/Referrer-Einschränkung wichtig
- Alternative pro Layer: `new VectorTileLayer({ url, apiKey })` statt global

---

## Kombination beider Varianten

Wenn beides benötigt wird (z.B. OAuth für Portal-Items + API Key für einen Premium-Routing-Service):

1. OAuth wie in Variante A einrichten
2. Zusätzlich `apiKey` in Config aufnehmen
3. `esriConfig.apiKey` global setzen ODER nur pro Service-URL

Die OAuth-Tokens werden vom `IdentityManager` automatisch an Portal-Requests gehängt, der API Key landet via `esriConfig.apiKey` an Location-Platform-Requests — beide Mechanismen koexistieren ohne Konflikt.
