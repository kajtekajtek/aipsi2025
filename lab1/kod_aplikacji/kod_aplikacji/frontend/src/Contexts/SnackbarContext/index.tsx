import React, {createContext, ReactNode, useState} from 'react';
import Snackbar from '@mui/material/Snackbar';
import {Alert, AlertProps} from "@mui/material";

export interface SnackbarContextType {
    openSnackbar: (message: string, severity: AlertProps['severity']) => void;
}

export const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

interface SnackbarProviderProps {
    children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<AlertProps['severity']>('success');


    const openSnackbar = (newMessage: string, newSeverity: AlertProps['severity']) => {
        setMessage(newMessage);
        setSeverity(newSeverity);
        setOpen(true);
    };

    const closeSnackbar = () => {
        setOpen(false);
        setMessage("");
    };

    return (
        <SnackbarContext.Provider value={{ openSnackbar }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={5000}
                onClose={closeSnackbar}
            >
                <Alert
                    onClose={closeSnackbar}
                    severity={severity}
                    variant="filled"
                    sx={{width: '100%'}}
                >
                    {message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
};