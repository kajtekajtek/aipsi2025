import {Avatar, Box, Button, Checkbox, Container, FormControlLabel, Grid, TextField, Typography,} from "@mui/material";
import React, {useEffect} from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {useTranslation} from "react-i18next";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../../Hooks/useAuth";
import {JwtUtils} from "../../Utils/JwtUtils";
import axios from "axios";
import {SubmitHandler, useForm} from "react-hook-form";
import {useSnackbar} from "../../Hooks/useSnackbar";

const LOGIN_URL = "auth/authenticate";

interface FormFields {
  login: string;
  password: string;
}

export function LoginPage() {
  const { t } = useTranslation();
  const { setAuth, persist, setPersist } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();


  const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    mode: "all",
  });
  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    const login = data.login;
    const password = data.password;

    try {
      const response = await axios.post(
        LOGIN_URL,
        JSON.stringify({ email: login, password: password }),
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status == 200 || response.status == 201) {
        const decodedToken = JwtUtils.decodeToken(response?.data?.accessToken);
        const accessToken = response?.data?.accessToken;
        const userId = decodedToken.id;
        const roles: string[] = [];
        for (let i = 0; i < decodedToken.roles.length; i++) {
          roles.push(decodedToken.roles[i].authority);
        }
        const username = decodedToken.sub;
        setAuth({ accessToken, roles, username, id: userId });
        openSnackbar(t("loginPage.loginSuccess"), "success");
        navigate(from, { replace: true });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error?.response?.status === 401) {
          setError("root", {
            type: "manual",
            message: t("loginPage.badCredentials"),
          });
        } else if (
          error?.response?.status === 204 ||
          error?.response?.status === 404
        ) {
          setError("root", {
            type: "manual",
            message: t("loginPage.accountNotFound"),
          });
        } else {
          setError("root", {
            type: "manual",
            message: t("loginPage.unknownError"),
          });
        }
      }
    }
  };

  const togglePersist = () => {
    setPersist((prevPersist: boolean) => !prevPersist);
  };

  useEffect(() => {
    localStorage.setItem("persist", persist.toString());
  }, [persist]);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar
          sx={{
            m: 1,
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {t("loginPage.title")}
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField
            {...register("login", {
              required: t("loginPage.emailRequired"),
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                message: t("loginPage.emailInvalid"),
              },
            })}
            error={Boolean(errors.login)}
            helperText={errors.login?.message}
            type="email"
            margin="normal"
            required
            fullWidth
            id="login"
            label={t("loginPage.email")}
            name="login"
          />
          <TextField
            {...register("password", {
              required: t("loginPage.passwordRequired"),
            })}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            margin="normal"
            required
            fullWidth
            name="password"
            label={t("loginPage.password")}
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <FormControlLabel
            control={<Checkbox checked={persist} onChange={togglePersist} />}
            label={t("loginPage.rememberMe")}
          />
          {errors.root && (
            <Typography color="error">{errors.root.message}</Typography>
          )}
          <Button type="submit" fullWidth sx={{ mt: 3, mb: 2 }}>
            {isSubmitting ? t("loginPage.loggingIn") : t("loginPage.login")}
          </Button>
          <Grid container>
            <Grid item>
              <Link to="/register">{t("loginPage.noAccount")}</Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
