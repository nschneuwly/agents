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
