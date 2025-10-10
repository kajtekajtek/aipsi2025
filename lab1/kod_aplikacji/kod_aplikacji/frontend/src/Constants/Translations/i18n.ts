import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import pl from './pl.json';
import us from './us.json';
import ua from './ua.json';
i18n.use(initReactI18next).init({
    lng: localStorage.getItem("language") || 'pl',
    fallbackLng: "pl",
    interpolation: {
        escapeValue: false,
    },
    resources:{
        pl: {
            translation: pl
        },
        us: {
            translation: us
        },
        ua: {
            translation: ua
        }
    },
});

export default i18n;