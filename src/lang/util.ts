// Transforms the translations.json into a i18next-compatible format

import type { Translations } from './model'

type I18nResources = Record<string, { translation: Record<string, string> }>

/**
 *
 * translations.json:
 * {
 *      "language": {
 *          "de": "deutsch",
 *          "en": "german",
 *      },
 *      "welcome": {
 *          "de": "Willkommen"
 *      }
 * }
 *
 * this gets transformed into
 *
 * {
 *      "de": {
 *          "language": "deutsch",
 *          "welcome": "Willkommen"
 *      },
 *      "en": {
 *          "language": "german"
 *      }
 * }
 *
 * The structure of translations.json is key-based, which is easier to maintain if you have hundreds of keys.
 *
 */
function getByLangKey(json: Translations): I18nResources {
	const resources: I18nResources = { de: { translation: {} } }

	for (const [key, langs] of Object.entries(json)) {
		for (const [lang, value] of Object.entries(langs)) {
			resources[lang] ??= { translation: {} }
			resources[lang].translation[key] = value
		}
	}

	return resources
}

export default getByLangKey
