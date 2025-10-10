import {useEffect, useMemo, useState} from "react";
import {createTheme, PaletteMode, responsiveFontSizes} from "@mui/material";
import {getDesignTokens} from "./index";

export const useColorTheme = () => {
    const [mode, setMode] = useState<PaletteMode>(window.localStorage.getItem('theme') as PaletteMode || "light");

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedMode = window.localStorage.getItem('theme') as PaletteMode;
            if (storedMode) {
                setMode(storedMode);
            }
        }
    }, []);

    const toggleColorMode = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        window.localStorage.setItem('theme', newMode);
        setMode(newMode);
    }

    const modifiedTheme = useMemo(() => responsiveFontSizes(createTheme(getDesignTokens(mode))), [mode])

    modifiedTheme.components = {
        MuiButton: {
            defaultProps: {
                variant: "contained",
                disableElevation: true,
                disableRipple: true,
            },
        },
        MuiTextField: {
            defaultProps : {
                InputLabelProps: {
                    shrink: true,
                }
            }
        },
        // MuiGrid: {
        //     styleOverrides: {
        //         root: {
        //             paddingLeft: "0 !important",
        //             '@media (min-width: 600px)': {
        //                 paddingLeft: "24px"
        //             }
        //         }
        //     }
        // }
    };

    return {
        theme: modifiedTheme,
        mode,
        toggleColorMode,
    };
};