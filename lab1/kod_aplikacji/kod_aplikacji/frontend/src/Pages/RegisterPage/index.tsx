import {Avatar, Box, Button, Container, Grid, TextField, Typography,} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import React from "react";
import axios from "axios";
import {JwtUtils} from "../../Utils/JwtUtils";
import {useAuth} from "../../Hooks/useAuth";
import {Link, useNavigate} from "react-router-dom";
import {SubmitHandler, useForm} from "react-hook-form";
import {useSnackbar} from "../../Hooks/useSnackbar";
import CheckIcon from '@mui/icons-material/Check';
import DangerousIcon from '@mui/icons-material/Dangerous';
import {useTranslation} from "react-i18next";

interface FormFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const {t} = useTranslation();
  const { openSnackbar } = useSnackbar();
  const {
    watch,
    register,
    setError,
    handleSubmit,
    formState: {errors,},
  } = useForm<FormFields>({
    mode: "all",
  });
  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {

    try {
      const response = await axios.post(
        "auth/register",
        JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        }),
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
          setAuth({accessToken, roles, username, id: userId});
          navigate("/", {replace: true});
          openSnackbar(t("registerPage.registerSucces"), "success");
        }
    } catch (error) {
      if(axios.isAxiosError(error)) {
        const response = error.response;
        if(response?.status == 409) {
          setError("root", {
            type: "manual",
            message: t("registerPage.emailExists")
          });
        }
        else if (response?.status == 400) {
          setError("root", {
            type: "manual",
            message: t("registerPage.passwordNotSafe"),
          });
        }
        else {
          setError("root", {
            type: "manual",
            message: t("registerPage.registerError"),
          })
        }
      }
    }
  };

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
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {t("registerPage.title")}
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                  {...register("firstName", { required: t("registerPage.firstNameRequired") })}
                  error={Boolean(errors.firstName)}
                    helperText={errors.firstName?.message}
                name="firstName"
                required
                fullWidth
                id="firstName"
                label={t("registerPage.firstName")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                    {...register("lastName", { required: t("registerPage.lastNameRequired") })}
                    error={Boolean(errors.lastName)}
                    helperText={errors.lastName?.message}
                required
                fullWidth
                id="lastName"
                label={t("registerPage.lastName")}
                name="lastName"
                autoComplete="family-name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                    {...register("email", { required: t("registerPage.emailRequired"), pattern: {
                            value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                            message: t("registerPage.emailError")
                        }})}
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                  type={"email"}
                required
                fullWidth
                id="email"
                label={t("registerPage.email")}
                name="email"
                autoComplete="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                    {...register("password", { required: t("registerPage.passwordRequired"), validate: {
                            length: (value) => value.length >= 6,
                            uppercase: (value) => /[A-Z]/.test(value),
                            lowercase: (value) => /[a-z]/.test(value),
                            number: (value) => /[0-9]/.test(value),
                            special: (value) => /\W+/.test(value)
                      }})}
                    error={Boolean(errors.password)}
                    FormHelperTextProps={{component: "div"}}
                    helperText={errors.password && <>
                      <TypographyWithIcon condition={watch("password").length >=6}>{t("registerPage.passwordErrorLength")}</TypographyWithIcon>
                      <TypographyWithIcon condition={/[A-Z]/.test(watch("password"))}>{t("registerPage.passwordErrorBigLetters")}</TypographyWithIcon>
                        <TypographyWithIcon condition={/[a-z]/.test(watch("password"))}>{t("registerPage.passwordErrorSmallLetters")}</TypographyWithIcon>
                        <TypographyWithIcon condition={/[0-9]/.test(watch("password"))}>{t("registerPage.passwordErrorNumbers")}</TypographyWithIcon>
                        <TypographyWithIcon condition={/\W+/.test(watch("password"))}>{t("registerPage.passwordErrorSpecialCharacters")}</TypographyWithIcon>
                    </>}
                required
                fullWidth
                name="password"
                label={t("registerPage.password")}
                type="password"
                id="password"
                autoComplete="new-password"
              />
            </Grid>
            <Grid item xs={12}>
            </Grid>
          </Grid>
          {errors.root && (
              <Typography color="error">{errors.root.message}</Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {t("registerPage.register")}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link to={"/login"}>
                {t("registerPage.alreadyHaveAccount")}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}

const TypographyWithIcon = ({condition, children} : HelperTextTypographyProps) => {
    return (
        <Typography gutterBottom sx={{display:"flex"}} color={condition ? "success.main" : "error.main"} variant={"body2"}>{condition ? <CheckIcon sx={{marginRight:1}} fontSize={"small"} color={"inherit"}/> : <DangerousIcon sx={{marginRight:1}} fontSize={"small"} color={"inherit"}/>} {children}</Typography>
    )
}
interface HelperTextTypographyProps {
    condition: boolean;
    children?: string;
}
