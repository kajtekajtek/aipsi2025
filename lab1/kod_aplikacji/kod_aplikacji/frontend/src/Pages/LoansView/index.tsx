// import {BookCard} from "../../Components/BookCard";
import * as React from "react";
import {useEffect, useState} from "react";
import Grid from "@mui/material/Grid";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {BookCard} from "../../Components/BookCard";
import {useAxiosPrivate} from "../../Hooks/useAxiosPrivate";
import {useLocation, useNavigate} from "react-router-dom";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import Button from "@mui/material/Button";
import {ArrowDropDownIcon} from "@mui/x-date-pickers";
import {UserLoan} from "../../Models/UserLoan";
import {User} from "../../Models/User";
import {GridWithCards} from "../BookList";
import {Pagination} from "../../Components/Pagination";
import {useTranslation} from "react-i18next";

interface FormFields {
  user: User | null;
  isReturned: boolean;
}

export function LoansView() {
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const {t} = useTranslation();
  const searchParams = new URLSearchParams(location.search);
  const [loansList, setLoansList] = useState<UserLoan[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [pagesState, setPagesState] = useState({
    currentPage: searchParams.get("page")
      ? Number(searchParams.get("page")) - 1
      : 0,
    pageSize: searchParams.get("pageSize")
      ? Number(searchParams.get("pageSize"))
      : 12,
    pageCount: 0,
    allItems: 0,
  });
  const isPendingLoansView = location.pathname.includes("admin/loans/pending");
  const [filters, setFilters] = useState({
    userId: searchParams.get("userId") || "",
    showReturned: Boolean(searchParams.get("returned")) || false,
  });
  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormFields>({
    mode: "all",
  });

  const navigate = useNavigate();
  const resetFilters = () => {
    setFilters({
      userId: "",
      showReturned: false,
    });
    reset();
    searchParams.delete("userId");
    navigate({ search: searchParams.toString() });
  };
  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    const userId = data.user?.id.toString();
    setFilters({
      userId: userId!,
      showReturned: data.isReturned,
    });
    const queryPage = 1;
    setPagesState({
      ...pagesState,
      currentPage: 0,
    });
    searchParams.set("page", queryPage.toString());
  };

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    value: number
  ) => {
    setPagesState({
      ...pagesState,
      currentPage: value,
    });
    const queryPage = value + 1;
    searchParams.set("page", queryPage.toString());
    navigate({ search: searchParams.toString() });
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPagesState({
      ...pagesState,
      pageSize: Number(event.target.value),
      currentPage: 0,
    });
    searchParams.set("pageSize", event.target.value);
    navigate({ search: searchParams.toString() });
  };

  React.useEffect(() => {
    if (filters.userId && !isPendingLoansView) {
      setValue(
        "user",
        usersList.find((user) => user.id.toString() === filters.userId) || null
      );
    }
    if (filters.showReturned && !isPendingLoansView) {
      setValue("isReturned", filters.showReturned);
    }
  }, [setValue, filters.userId, usersList, filters.showReturned]);

  useEffect(() => {
    let isMounted = true;

    async function fetchLoans() {
      try {
        const urlParams =
          `?` +
          [
            filters.userId ? `userId=${filters.userId}` : null,
            filters.showReturned ? `returned=true` : `returned=false`,
            isPendingLoansView ? `accepted=false` : `accepted=true`,
          ]
            .filter((param) => param)
            .join("&");
        const response = await axiosPrivate.get(
          `/book-loans/${pagesState.currentPage}/${pagesState.pageSize}${urlParams}`
        );
        isMounted && setLoansList(response.data.content);
        isMounted &&
          setPagesState({
            currentPage: response.data.pageable.pageNumber,
            pageSize: response.data.pageable.pageSize,
            pageCount: response.data.totalPages,
            allItems: response.data.totalElements,
          });
        searchParams.set(
          "page",
          (response.data.pageable.pageNumber + 1).toString()
        );
        searchParams.set(
          "pageSize",
          response.data.pageable.pageSize.toString()
        );
        filters.userId
          ? searchParams.set("userId", filters.userId)
          : searchParams.delete("userId");
        filters.showReturned
          ? searchParams.set("returned", "true")
          : searchParams.delete("returned");

        navigate({ search: searchParams.toString() });
      } catch (error) {
        console.error(error);
        // navigate("/login", {state: {from: location}, replace: true});
      }
    }

    fetchLoans();
    return () => {
      isMounted = false;
    };
  }, [
    pagesState.currentPage,
    pagesState.pageSize,
    pagesState.pageCount,
    pagesState.allItems,
    filters.userId,
    filters.showReturned,
    axiosPrivate,
    navigate,
  ]);
  useEffect(() => {
    let isMounted = true;

    async function fetchUsers() {
      try {
        if (!isPendingLoansView) {
          const response = await axiosPrivate.get(`/users`);
          isMounted && setUsersList(response.data);
        }
      } catch (error) {
        console.error(error);
        // navigate("/login", {state: {from: location}, replace: true});
      }
    }

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [axiosPrivate]);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const filterBox = (
    <Stack
      gap={3}
      direction={"column"}
      height={{ xs: "100%", md: "80vh" }}
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        name="user"
        control={control}
        defaultValue={null}
        render={({ field }) => (
          <Autocomplete
            renderInput={(params) => (
              <TextField
                {...params}
                type="text"
                margin="normal"
                label={t("loansView.user")}
                fullWidth
                id="user"
                InputLabelProps={{ shrink: true }}
              />
            )}
            isOptionEqualToValue={(option: User, value: User) =>
              option.id === value.id
            }
            options={usersList}
            getOptionLabel={(option) =>
              option.firstName + " " + option.lastName
            }
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                {option.firstName} {option.lastName}
              </Box>
            )}
            value={field.value}
            onChange={(event, selectedOption) => {
              setValue("user", selectedOption);
            }}
          />
        )}
      />
      <FormControlLabel
        control={
          <Controller
            name={"isReturned"}
            control={control}
            defaultValue={false}
            render={({ field: props }) => (
              <Checkbox {...props} checked={props.value} />
            )}
          />
        }
        label={t("loansView.showReturned")}
      />
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? t("loansView.filtering") : t("loansView.filter")}
      </Button>
      <Button fullWidth onClick={resetFilters} disabled={isSubmitting}>
        {isSubmitting ? t("loansView.resetting") : t("loansView.reset")}
      </Button>
    </Stack>
  );

  return (
    <Grid
      container
      height={"100%"}
      id={"main_grid"}
      spacing={{ xs: 3, md: 1 }}
      sx={{ marginLeft: "0 !important", width: "100% !important" }}
    >
      {!isPendingLoansView && (
        <Grid
          item
          xs={isPendingLoansView ? 0 : 12}
          md={isPendingLoansView ? 0 : 2}
          container
          justifyContent={"center"}
          id="filter_grid"
        >
          {!isPendingLoansView &&
            (isSmallScreen ? (
              <>
                <Accordion id={"filter_accordion"} sx={{height:"fit-content"}}>
                  <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                    {t("loansView.filters")}
                  </AccordionSummary>
                  <AccordionDetails>{filterBox}</AccordionDetails>
                </Accordion>
              </>
            ) : (
              filterBox
            ))}
        </Grid>
      )}
      <GridWithCards
        item
        xs={12}
        sm={12}
        md={isPendingLoansView ? 12 : 10}
        container
        gap={2}
      >
        {loansList.length > 0 ? (
          loansList.map((loan) => {
            return <BookCard key={loan.id} book={loan.book} loan={loan} />;
          })
        ) : (
          <Typography>
            {isPendingLoansView
              ? t("loansView.noPendingLoansFound")
              : t("loansView.noLoansFound")}
          </Typography>
        )}
      </GridWithCards>

      {loansList.length > 1 && (
        <Grid
          container
          item
          xs={12}
          justifyContent={"center"}
          alignItems={"flex-end"}
        >
         <Pagination allItems={pagesState.allItems} currentPage={pagesState.currentPage} pageSize={pagesState.pageSize} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange}/>
        </Grid>
      )}
    </Grid>
  );
}
