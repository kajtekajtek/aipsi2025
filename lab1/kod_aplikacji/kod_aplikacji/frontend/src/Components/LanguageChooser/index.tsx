import React, {useContext} from "react";
import {I18nContext, useTranslation} from "react-i18next";
import {LANGUAGES} from "../../Constants/Translations";
import {Box, MenuItem, Select, SelectChangeEvent} from "@mui/material";

export function LanguageChooser() {
    const {i18n} = useContext(I18nContext);
    const {t} = useTranslation();
    const toggleLanguage = (e: SelectChangeEvent) => {
        const value = e.target.value;
        if (value) {
            i18n.changeLanguage(value);
            window.localStorage.setItem("language", value);
        }
    };


    return (
        <Select sx={{ '.MuiOutlinedInput-notchedOutline': { borderStyle: 'none' } }} value={i18n.language} onChange={toggleLanguage} size={"small"}>
            {LANGUAGES.map(({code, label}) => (
                <MenuItem key={code} value={code}>
                    <Box sx={{'& > img': {mr: 2, flexShrink: 0}}}>
                        <img
                            loading="lazy"
                            width="20"
                            srcSet={`https://flagcdn.com/w40/${code.toLowerCase()}.png 2x`}
                            src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`}
                            alt=""
                        />
                        {t(label)}
                    </Box>
                </MenuItem>
            ))}
        </Select>
    )
}