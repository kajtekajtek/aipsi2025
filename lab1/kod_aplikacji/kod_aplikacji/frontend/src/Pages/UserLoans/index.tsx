import * as React from "react";
import {useEffect, useState} from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {useAuth} from "../../Hooks/useAuth";
import {BookCard} from "../../Components/BookCard";
import {useAxiosPrivate} from "../../Hooks/useAxiosPrivate";
import {UserLoan} from "../../Models/UserLoan";
import {GridWithCards} from "../BookList";
import {Pagination} from "../../Components/Pagination";
import {useTranslation} from "react-i18next";

export function UserLoans() {
  const [loansList, setLoansList] = useState<UserLoan[]>([]);
  const [pagesState, setPagesState] = useState({
    currentPage: 0,
    pageSize: 12,
    pageCount: 0,
    allItems: 0,
  });
  const {t} = useTranslation();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    value: number
  ) => {
    setPagesState({
      ...pagesState,
      currentPage: value + 1,
    });
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPagesState({
      ...pagesState,
      pageSize: Number(event.target.value),
    });
  };
  useEffect(() => {
    let isMounted = true;
    async function fetchLoans() {
      try {
        const response = await axiosPrivate.get(
          `/books/loan/user/${auth.id}/pagination/${pagesState.currentPage}/${pagesState.pageSize}`
        );
        isMounted && setLoansList(response.data.content);
        isMounted &&
          setPagesState({
            currentPage: response.data.pageable.pageNumber,
            pageSize: response.data.pageable.pageSize,
            pageCount: response.data.totalPages,
            allItems: response.data.totalElements,
          });
      } catch (error) {
        console.error(error);
        // navigate("/login", { state: { from: location }, replace: true });
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
  ]);

  return (
    <Grid container height={"100%"} spacing={3}>
      <GridWithCards item xs={12} sm={12}  container gap={2}>
        {loansList.length > 0 ? (
            loansList.map((loan) => {
              return <BookCard key={loan.id} book={loan.book} loan={loan} />;
            })
        ) : (
            <Typography>
              {t("userLoans.noLoans")}
            </Typography>
        )}
      </GridWithCards>
      {loansList.length >0 && <Grid
          container
          item
          xs={12}
          justifyContent={"center"}
          alignItems={"flex-end"}
      >
        <Pagination allItems={pagesState.allItems} currentPage={pagesState.currentPage} pageSize={pagesState.pageSize}
                    onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange}></Pagination>
      </Grid>}
    </Grid>
  );
}
