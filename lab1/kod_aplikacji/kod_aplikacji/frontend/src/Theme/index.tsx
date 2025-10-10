import {deepOrange, grey} from "@mui/material/colors";
import {PaletteMode} from "@mui/material";


export const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode,
        ...(mode === "light"
            ? {
                primary: {
                    main: "#77AAAD",
                    contrastText: "#040303"
                },
                secondary: {
                    main: "#A593E0"
                },
                text: {
                    primary: "#040303",
                    secondary: grey[800],
                },
                background: {
                    default: "#F8FAFF"
                }
            }
            : {
                primary: {
                    main: "#885552"
                },
                divider: deepOrange[700],
                // background: {
                //     default: "#040D12",
                // },
                text: {
                    primary: "#fff",
                    secondary: grey[500]
                }
            }),
    },
});
