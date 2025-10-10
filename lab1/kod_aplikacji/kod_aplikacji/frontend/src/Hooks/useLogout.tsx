import { useAxiosPrivate } from "./useAxiosPrivate";
import { useAuth } from "./useAuth";
import { useSnackbar } from "./useSnackbar";
import {useTranslation} from "react-i18next";

export const useLogout = () => {
  const axios = useAxiosPrivate();
  const { setAuth, setPersist } = useAuth();
  const { openSnackbar } = useSnackbar();
  const {t} = useTranslation();

  const logout = async () => {
    try {
      const response = await axios.post("/auth/logout", {
        withCredentials: true,
      });
      if(response.status == 200) {
        setAuth({});
        setPersist(false);
        openSnackbar(t("logout.logoutSuccess"), "success");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return { logout };
};
