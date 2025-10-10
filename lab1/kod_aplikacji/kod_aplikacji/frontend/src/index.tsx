import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import {ThemeContextProvider} from "./Contexts/ThemeContext";
import {I18nextProvider} from "react-i18next";
import i18n from "./Constants/Translations/i18n";
import {AuthProvider} from "./Contexts/AuthContext";
import {SnackbarProvider} from "./Contexts/SnackbarContext";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    // <React.StrictMode>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SnackbarProvider>
            <AuthProvider>
                <ThemeContextProvider>
                    <I18nextProvider i18n={i18n}>
                        <App/>
                    </I18nextProvider>
                </ThemeContextProvider>
            </AuthProvider>
        </SnackbarProvider>
        </LocalizationProvider>
    // </React.StrictMode>
);
