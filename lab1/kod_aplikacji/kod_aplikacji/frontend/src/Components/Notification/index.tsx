import {Done} from "@mui/icons-material";
import {Box, Icon, MenuItem, styled, Tooltip, Typography,} from "@mui/material";
import {Notification as NotificationModel, NotificationType,} from "../../Models/Notification";
import {Book} from "../../Models/Book";
import {UserLoan} from "../../Models/UserLoan";
import {useTranslation} from "react-i18next";

interface Props {
    notification: NotificationModel;
    onIconClick: (notification: NotificationModel) => void;
}

export function Notification(props: Props) {
    const time = new Date(props.notification.timeStamp);
    const date = time.toLocaleDateString();
    const hours = time.getHours();
    let minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes();
    const {t} = useTranslation();
    return (
        <MenuItem
            divider
            key={props.notification.id}
            disableRipple
            disableTouchRipple
        >
            <Box sx={{
                textWrap: "wrap",
                display: "flex",
                alignItems: "end",
                flexDirection: "column",
            }}>
                <Box justifyContent={"flex-end"}><Typography
                    variant={"body2"}>{date} | {hours}:{minutes}</Typography></Box>
                <Box sx={{
                    textWrap: "wrap",
                    display: "flex",
                    alignItems: "center",
                }}>
                    <div>
                        {getMessage(
                            props.notification.notificationType,
                            props.notification.book,
                            props.notification.bookLoan
                        )}
                    </div>

                    <Tooltip title={t("notification.markAsRead")}>
                        <Icon
                            onClick={() => {
                                props.onIconClick(props.notification);
                            }}
                        >
                            <Done/>
                        </Icon>
                    </Tooltip></Box> </Box>
        </MenuItem>
    );

    function getMessage(
        notificationType: NotificationType,
        book: Book | null,
        userLoan: UserLoan | null
    ) {
        if (userLoan && !book) {
            const loanDate = new Date(userLoan.loanDate);
            const daysPassed = Math.floor(
                (new Date().getTime() - loanDate.getTime()) / (1000 * 3600 * 24)
            );
            const daysLeft = 30 - daysPassed;

            switch (notificationType) {
                case NotificationType.BOOK_LOAN_REQUEST_ACCEPTED:
                    return (
                        <Typography component={"div"}>
                            {t("notification.type.loanAccepted", {bookTitle: userLoan.book.title})}
                        </Typography>
                    );
                case NotificationType.BOOK_LOAN_REQUEST_REJECTED:
                    return (
                        <Typography component={"div"}>
                            {t("notification.type.loanRejected", {bookTitle: userLoan.book.title})}
                        </Typography>
                    );
                case NotificationType.BOOK_LOAN_REMINDER:
                    return (
                        <Typography component={"div"}>
                            {t("notification.type.loanReminder", {
                                bookTitle: userLoan.book.title,
                                daysLeft: daysLeft,
                                daysPassed: daysPassed
                            })}
                        </Typography>
                    )
                case NotificationType.BOOK_LOAN_EXPIRED:
                    return (
                        <Typography component={"div"}>
                            {t("notification.type.loanExpired", {bookTitle: userLoan.book.title})}
                        </Typography>
                    );
            }
        } else if (book && !userLoan) {
            switch (notificationType) {
                case NotificationType.BOOK_ACCEPTED:
                    return (
                        <Typography component={"div"}>
                            {t("notification.type.bookAccepted", {bookTitle: book.title})}
                        </Typography>
                    );
                case NotificationType.BOOK_REJECTED:
                    return (
                        <Typography component={"div"}>
                            {t("notification.type.bookRejected", {bookTitle: book.title})}
                        </Typography>
                    );
                case NotificationType.BOOK_RETURN:
                    return (
                        <Typography component={"div"}>
                            {t("notification.type.bookReturned", {bookTitle: book.title})}
                        </Typography>
                    );
            }
        }
    }
}

export const BoldBox = styled(Box)`
    font-weight: 600;
    display: inline;
`;
