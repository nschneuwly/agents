// Only keep this, when localisation (multi-language support) is needed
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
		fallbackLng: 'de',
		interpolation: {
			escapeValue: false,
		},
	})

export default i18n
