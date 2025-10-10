import {useAuth} from './useAuth';
import {JwtUtils} from "../Utils/JwtUtils";
import {Auth} from "../Contexts/AuthContext";
import axios from "axios";
import {useLocation, useNavigate} from "react-router-dom";
import {useSnackbar} from "./useSnackbar";
import {useTranslation} from "react-i18next";

export const useRefreshToken = () => {
    const {setAuth} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {openSnackbar} = useSnackbar();
    const {t} = useTranslation();
    return async (): Promise<any> => {
        try{
            const response = await axios.get('auth/refresh-token', {
                withCredentials: true,
            })
            const decodedToken = JwtUtils.decodeToken(response?.data?.accessToken);
            const rolesArray:string[] = [];
            for (let i = 0; i < decodedToken.roles.length; i++) {
                rolesArray.push(decodedToken.roles[i].authority);
            }
            setAuth((prev: Auth) => {
                return {
                    ...prev,
                    roles: rolesArray,
                    accessToken: response.data.accessToken,
                    username: decodedToken.sub,
                    id: decodedToken.id
                };
            });
            return response.data.accessToken;
        } catch(error) {
            if(axios.isAxiosError(error)) {
                if(error?.response?.status === 401 || error?.response?.status === 403) {
                    navigate("/login", { state: { from: location }, replace: true });
                    openSnackbar(t("logout.sessionExpired"), "error");
                }
            }
        }

    };
}



