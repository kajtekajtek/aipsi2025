import {Outlet} from "react-router-dom";
import {useState, useEffect} from "react";
import {useRefreshToken} from "../../Hooks/useRefreshToken";
import {useAuth} from "../../Hooks/useAuth";
import {CircularProgress, Stack} from "@mui/material";

export const PersistentLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const {auth, persist} = useAuth();

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                await refresh();
            }
            catch (err) {
                console.error(err);
            }
            finally {
                isMounted && setIsLoading(false);
            }
        }
        !auth?.accessToken && persist ? verifyRefreshToken() : setIsLoading(false);

        return () => {
            isMounted = false;
        }
    }, [])

    useEffect(() => {
    }, [isLoading]);

    return (
        <>
            {!persist
                ? <Outlet/>
                : isLoading
                    ? <Stack height={"100%"} alignItems="center" justifyContent={"center"}>
                        <CircularProgress disableShrink />
                    </Stack>
                    : <Outlet/>
            }
        </>
    )
}