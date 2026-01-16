import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        supportedLngs: ['th', 'en'],
        fallbackLng: 'th',
        debug: import.meta.env.DEV,

        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        },

        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },

        interpolation: {
            escapeValue: false,
        },

        react: {
            useSuspense: true,
        },
    });

export default i18n;
