import * as React from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {Book} from "../../Models/Book";
import {useLocation, useNavigate} from "react-router-dom";
import {CardActionArea} from "@mui/material";
import {UserLoan} from "../../Models/UserLoan";
import {BoldBox} from "../Notification";
import {useTranslation} from "react-i18next";

interface Props {
  book: Book;
  loan?: UserLoan;
}

export function BookCard({ book, loan }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const {t} = useTranslation();

  const isAdminView = location.pathname.includes("admin/loanHistory");
  const isBookListView = location.pathname === "/books";
  const isPendingView = location.pathname.includes("admin/books/pending");
  const isPendingLoansView = location.pathname.includes("admin/loans/pending");
  const isUserLoansView = location.pathname.includes("my_loans");

  const goToBookDetails = () => {
    navigate(`/books/${book.id}`, { state: { from: location.search } });
  };
  const goToLoanDetails = () => {
    navigate(`/loanDetails/${loan?.id}`, {
      state: { from: location.search },
    });
  };

  const goToPendingBookDetails = () => {
    navigate(`/admin/books/pending/${book.id}`, {
      state: { from: location.search },
    });
  };

  const goToPendingLoanDetails = () => {
    navigate(`/admin/loans/pending/${loan?.id}`, {
      state: { from: location.search },
    });
  };

  return (
    <Card
      sx={{
        opacity: isBookListView ? (book.available ? 1 : 0.5) : isUserLoansView && loan?.rejected ? 0.5 : 1,
        width: 345,
        height: 345,
      }}
      onClick={
        isBookListView
          ? goToBookDetails
          : isPendingView
          ? goToPendingBookDetails
          : isPendingLoansView
          ? goToPendingLoanDetails
          : goToLoanDetails
      }
    >
      <CardActionArea sx={{ height: "100%" }}>
        {(isBookListView || isPendingView) && <CardMedia
            component="img"
            height="200"
            image={book.imageData?.imageData}
            alt={book.title}
            sx={{objectFit: "contain"}}
        />}
        <CardContent>
          {(isBookListView || isPendingView) && <Typography gutterBottom variant="h5" component="div" noWrap>
            {book.title} {isBookListView && !book.available && t("bookCard.loaned")}
          </Typography>}
          {(isAdminView || isPendingLoansView || isUserLoansView) && (
            <Typography gutterBottom variant="body2" component="div">
              {t("bookCard.loaned_book")} <BoldBox>{loan?.book.title}</BoldBox>
            </Typography>
          )}
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            component={"div"}
          >
            {!isAdminView && !isUserLoansView && !isPendingLoansView ? (
              book.description || t("bookCard.description_not_available")
            ) : (
                <>
                  <p>
                    {loan?.requestDate && !loan?.loanDate && t("bookCard.requestDate") +
                        (new Date(loan?.requestDate).toLocaleDateString() ||
                            t("bookCard.noData"))}
                  </p>
                  <p>
                    {loan?.loanDate && t("bookCard.loanDate") +
                        (loan?.loanDate?.split("-").reverse().join(".") + "r." ||
                            t("bookCard.noData"))}
                  </p>
                  <p>
                    {loan?.returnDate && t("bookCard.returnDate") +
                        (loan?.returnDate
                            ? loan?.returnDate?.split("-").reverse().join(".") + "r."
                            : t("bookCard.noData"))}
                  </p>
                  <p>
                    Status: {loan?.accepted && !loan.returned && !loan.rejected
                      ? t("bookCard.loaned_status")
                      : loan?.accepted && loan.returned
                          ? t("bookCard.returned_status")
                          : loan?.rejected
                              ? t("bookCard.rejected_status")
                              : t("bookCard.pending_status")}
                  </p>
                  <p>
                    {t("bookCard.loaned_by") +
                        (loan?.user
                            ? loan.user.firstName + " " + loan.user.lastName
                            : t("bookCard.noData"))}
                  </p>
                </>
            )}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
