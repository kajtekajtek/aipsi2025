import {Navigate, Outlet, useLocation} from "react-router-dom";
import {useAuth} from "../../Hooks/useAuth";

interface Props {
    allowedRoles?: string[];
}

export function RequireAuth({allowedRoles}: Props) {
    const {auth} = useAuth();
    const location = useLocation();
    return (
        <>
            {auth.roles && auth.roles.find(role => {
                return allowedRoles?.includes(role)
            })
                ? <Outlet/>
                : auth?.accessToken
                    ? <Navigate to={"/unauthorized"} state={{from: location}} replace/>
                    :
                    <Navigate to={"/login"} state={{from: location}} replace/>}
        </>
    )
}