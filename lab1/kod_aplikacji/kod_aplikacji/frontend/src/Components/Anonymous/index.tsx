import React from "react";
import {Navigate, Outlet, useLocation} from "react-router-dom";
import {useAuth} from "../../Hooks/useAuth";

export const Anonymous = () => {
    const {auth} = useAuth();
    const location = useLocation();
    const token = auth.accessToken;

    return token ? <Navigate to={location.state?.from?.pathname || "/"} replace /> : <Outlet />;
}