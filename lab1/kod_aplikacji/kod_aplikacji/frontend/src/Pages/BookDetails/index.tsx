import React, {useEffect, useState} from "react";
import {useAxiosPrivate} from "../../Hooks/useAxiosPrivate";
import {Book} from "../../Models/Book";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    Divider,
    Grid,
    Paper,
    Stack,
    styled, useMediaQuery, useTheme,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import {useAuth} from "../../Hooks/useAuth";
import {useSnackbar} from "../../Hooks/useSnackbar";
import axios from "axios";
import {UserLoan} from "../../Models/UserLoan";
import {useTranslation} from "react-i18next";

const Img = styled("img")(({theme}) => ({
    margin: "auto",
    display: "block",
    width: "70%",
    height: "100%",
    [theme.breakpoints.up("md")]: {
        width: "100%",
    },
    [theme.breakpoints.between("sm", "md")]: {
        width: "50%",
        height: "80%",
    },
}));

export function BookDetails() {
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();
    const isLoanDetails = location.pathname.includes("loanDetails");
    const isPendingBookDetails = location.pathname.includes(
        "admin/books/pending"
    );
    const isPendingLoanDetails = location.pathname.includes(
        "admin/loans/pending"
    );

    const {auth} = useAuth();
    const [book, setBook] = useState<Book>();
    const [loan, setLoan] = useState<UserLoan>();
    const {id} = useParams();
    const {openSnackbar} = useSnackbar();
    const [open, setOpen] = React.useState(false);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
    const {t} = useTranslation();

    const deleteBook = async (id: number) => {
        try {
            await axiosPrivate.delete(`/books/${id}`, {
                params: {
                    pending: isPendingBookDetails ? true : null,
                }
            });
            openSnackbar(t("bookDetails.bookDeletedSuccess"), "success");
            navigate("/books");
        } catch (error) {
            console.error(error);
        }
    };
    const acceptPendingBook = async () => {
        try {
            const response = await axiosPrivate.put(`/books/${id}/accept`);
            if (response.status === 200) {
                openSnackbar(t("bookDetails.bookAcceptedSuccess"), "success");
                navigate(-1);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const sendReminder = async () => {
        try {
            const response = await axiosPrivate.post(
                `/notifications/reminder/${loan?.id}`
            );
            if (response.status === 200)
                openSnackbar(t("bookDetails.reminderSentSuccess"), "success");
        } catch (error) {
            console.error(error);
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const goBack = () => {
        navigate(-1);
    };

    const loanBook = async () => {
        try {
            if (book?.available)
                await axiosPrivate.post(`/books/${id}/loan/${auth.id}`);
            openSnackbar(t("bookDetails.loanWaitsForAcceptance"), "success");
            goBack();
        } catch (error) {
            console.error(error);
        }
    };
    const returnBook = async () => {
        try {
            const response = await axiosPrivate.put(`/book-loans/${loan?.id}`);
            if (response.status === 200) {
                openSnackbar(t("bookDetails.bookReturnedSuccess"), "success");
                goBack();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const acceptLoan = async () => {
        try {
            const response = await axiosPrivate.put(`/book-loans/${id}/accept`);
            if (response.status === 200) {
                openSnackbar(t("bookDetails.loanAccepted"), "success");
                navigate(-1);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const rejectLoan = async () => {
        try {
            const response = await axiosPrivate.put(`/book-loans/${id}/reject`);
            if (response.status === 200) {
                openSnackbar(t("bookDetails.loanRejected"), "success");
                navigate(-1);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const prolongLoan = async () => {
        try {
            const response = await axiosPrivate.put(`/book-loans/${id}/prolong`);
            if (response.status === 200) {
                openSnackbar(t("bookDetails.loanProlonged"), "success");
                navigate(-1);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const downloadEbook = async () => {
        try {
            if (book?.isEbook) {
                const response = await axiosPrivate.get(
                    `/storage/books/${id}/download`,
                    {
                        responseType: "arraybuffer",
                    }
                );
                const blob = new Blob([response.data], {type: "application/pdf"});
                const href = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = href;
                link.setAttribute("download", "file.pdf");
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                URL.revokeObjectURL(href);
            }
            openSnackbar(t("bookDetails.bookDownloaded"), "success");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                openSnackbar(t("bookDetails.bookDownloadError"), "error");
            }
        }
    };

    useEffect(() => {
        let isMounted = true;

        async function fetchBookOrLoan() {
            if (!isLoanDetails && !isPendingLoanDetails) {
                try {
                    const response = await axiosPrivate.get(`/books/${id}`);
                    isMounted && setBook(response?.data);
                } catch (error) {
                    console.error(error);
                }
            } else {
                try {
                    const response = await axiosPrivate.get(`/book-loans/${id}`);
                    isMounted && setLoan(response?.data);
                } catch (error) {
                    console.error(error);
                }
            }
        }

        fetchBookOrLoan();

        return () => {
            isMounted = false;
        };
    }, [axiosPrivate, id]);

    return (
        <Paper
            sx={{
                p: 2,
                margin: "auto",
                maxWidth: isSmallScreen ? "100%" : "90%",
                width: "fit-content",
                flexGrow: 1,
                height: isSmallScreen ? "auto" : "80vh",
                backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "#1A2027" : "#fff",
            }}
        >
            <Grid container spacing={2} height={"100%"}>
                {(!isLoanDetails && !isPendingLoanDetails && book?.imageData?.imageData) && (
                    <Grid item xs={12} sm={12} md={6} lg={4} height={"100%"}>
                        <Img
                            alt={book.title}
                            src={book.imageData.imageData || loan?.book?.imageData?.imageData}
                        />
                    </Grid>
                )}
                <Grid item xs={12} md={(!isLoanDetails && !isPendingLoanDetails && book?.imageData?.imageData) ? 6 : 12}
                      lg={(!isLoanDetails && !isPendingLoanDetails && book?.imageData?.imageData) ? 8 : 12} sm container height={"100%"} sx={{
                    overflowY:"auto"}}>
                    <Grid item xs container direction="column" spacing={2}>
                        <Grid item xs>
                            <Typography variant="h2" component="div">
                                {book?.title || loan?.book.title}
                            </Typography>
                            <Divider/>
                            {book && <><Typography component={"div"} variant="body1" gutterBottom>
                                {t("bookDetails.description")}{book?.description || t("bookDetails.noDescription")}
                            </Typography>
                                <Divider/>
                            </>}
                            {!isLoanDetails && !isPendingLoanDetails && (
                                <>
                                    <Typography
                                        gutterBottom
                                        variant="h6"
                                        component="div"
                                        marginTop={2}
                                    >
                                        {book?.authors.length! > 1 ? t("bookDetails.authors") : t("bookDetails.author")}
                                        {book?.authors
                                            .map((author) => author.firstName + " " + author.lastName)
                                            .join(", ")}
                                    </Typography>
                                    <Typography variant="h6" gutterBottom>
                                        {t("bookDetails.pageCount")}{book?.pageCount}
                                    </Typography>
                                    <Typography variant="h6" gutterBottom>
                                        {t("bookDetails.publisher")}{book?.publisher.name}
                                    </Typography>
                                    <Typography variant="h6" gutterBottom>
                                        {t("bookDetails.category")}{book?.category.name}
                                    </Typography>
                                    <Typography variant="h6" gutterBottom>
                                        {t("bookDetails.releaseYear")}{book?.releaseYear}
                                    </Typography>
                                    <Typography variant="h6" gutterBottom>
                                        {t("bookDetails.isbn")}{book?.isbn}
                                    </Typography>
                                    {auth.roles?.includes("ADMIN") && (
                                        <Typography variant="h6" gutterBottom>
                                            {t("bookDetails.addedBy")}
                                            {book?.user?.firstName + " " + book?.user?.lastName}
                                        </Typography>
                                    )}
                                </>
                            )}
                            {(isLoanDetails ||
                                isPendingLoanDetails) && (
                                <>
                                    {!loan?.accepted && <Typography variant="h6" gutterBottom>
                                        {t("bookDetails.requestDate")}
                                        {new Date(loan?.requestDate!).toLocaleDateString() ||
                                            t("bookDetails.noData")}
                                    </Typography>}
                                    {loan?.loanDate && <Typography variant="h6" gutterBottom>
                                        {t("bookDetails.loanDate")}
                                        {loan?.loanDate?.split("-").reverse().join(".") + "r." ||
                                            t("bookDetails.noData")}
                                    </Typography>}
                                    {loan?.dueDate && !loan.returned && <Typography variant="h6" gutterBottom>
                                        {t("bookDetails.dueDate")}
                                        {loan?.dueDate?.split("-").reverse().join(".") + "r." ||
                                            t("bookDetails.noData")}
                                    </Typography>}
                                    {loan?.returnDate && loan.returned && <Typography variant="h6" gutterBottom>
                                        {t("bookDetails.returnDate")}
                                        {loan?.returnDate
                                            ? loan?.returnDate?.split("-").reverse().join(".") +
                                            "r."
                                            : t("bookDetails.noData")}
                                    </Typography>}
                                    {!loan?.returned && !loan?.returnDate && loan?.loanDate &&
                                        <Typography variant="h6" gutterBottom>
                                            {t("bookDetails.daysPassedFromLoan")}
                                            {Math.floor(
                                                (+new Date() - +new Date(loan?.loanDate!)) /
                                                (1000 * 60 * 60 * 24)
                                            )}
                                        </Typography>}
                                    <Typography variant="h6" gutterBottom>
                                        Status: {loan?.accepted && !loan.returned
                                        ? t("bookDetails.loaned")
                                        : loan?.accepted && loan.returned
                                            ? t("bookDetails.returned")
                                            : loan?.rejected
                                                ? t("bookDetails.rejected")
                                                : t("bookDetails.pending")}
                                    </Typography>
                                    <Typography variant="h6" gutterBottom>
                                        {t("bookDetails.loanedBy")}
                                        {loan?.user.firstName + " " + loan?.user.lastName ||
                                            t("bookDetails.noData")}
                                    </Typography>
                                </>
                            )}
                        </Grid>
                        <Grid item>
                            <Stack direction={"row"} spacing={2}>
                                {auth.roles?.includes("ADMIN") && (
                                    <>
                                        {isLoanDetails && !isPendingBookDetails && (
                                            <>
                                                <Button onClick={sendReminder}>
                                                    {t("bookDetails.sendReminder")}
                                                </Button>
                                                <Button onClick={returnBook}>
                                                    {t("bookDetails.returnBook")}
                                                </Button>
                                            </>
                                        )}
                                        {isPendingBookDetails && !isLoanDetails && (
                                            <>
                                                <Button color={"success"} onClick={acceptPendingBook}>
                                                    {t("bookDetails.acceptBook")}
                                                </Button>
                                                <Button
                                                    color={"error"}
                                                    onClick={() => deleteBook(Number(id!))}
                                                >
                                                    {t("bookDetails.deleteBook")}
                                                </Button>
                                            </>
                                        )}
                                        {!isLoanDetails &&
                                            !isPendingBookDetails &&
                                            !isPendingLoanDetails && (
                                                <>
                                                    <Button
                                                        onClick={() => navigate(`/books/${book?.id}/edit`)}
                                                    >
                                                        {t("bookDetails.editBook")}
                                                    </Button>
                                                    <Button color={"error"} onClick={handleClickOpen}>
                                                        {t("bookDetails.deleteBook")}
                                                    </Button>
                                                </>
                                            )}
                                        {isPendingLoanDetails && (
                                            <>
                                                <Button onClick={acceptLoan}>
                                                    {t("bookDetails.confirmLoan")}
                                                </Button>
                                                <Button onClick={rejectLoan} color={"error"}>
                                                    {t("bookDetails.rejectLoan")}
                                                </Button>
                                            </>
                                        )}
                                    </>
                                )}
                                <Dialog
                                    open={open}
                                    onClose={handleClose}
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"
                                >
                                    <DialogTitle id="alert-dialog-title">
                                        {t("bookDetails.deleteBookQuestion")}
                                    </DialogTitle>
                                    <DialogActions>
                                        <Button onClick={handleClose}>Nie</Button>
                                        <Button onClick={() => deleteBook(Number(id!))}>Tak</Button>
                                    </DialogActions>
                                </Dialog>
                                {auth.roles?.includes("USER") && !isLoanDetails && !isPendingLoanDetails && (
                                    <Button onClick={book?.isEbook ? downloadEbook : loanBook} disabled={!book?.available}>
                                        {book?.isEbook ? t("bookDetails.downloadPdf") : t("bookDetails.loanBook")}
                                    </Button>
                                )}
                                {auth.roles?.includes("ADMIN") && book?.isEbook && isPendingBookDetails && (
                                    <Button onClick={downloadEbook} disabled={!book?.available}>
                                        {t("bookDetails.downloadPdf")}
                                    </Button>
                                )}
                                {auth.roles?.includes("USER") && isLoanDetails && loan?.accepted && loan?.loanDate &&  (
                                    <Button onClick={prolongLoan} disabled={loan?.rejected}>
                                        {t("bookDetails.prolongLoan")}
                                    </Button>
                                )
                                }
                            </Stack>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Paper>
    );
}
