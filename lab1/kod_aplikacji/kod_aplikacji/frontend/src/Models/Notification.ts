import { Book } from "./Book";
import { UserLoan } from "./UserLoan";

export type Notification = {
  id: number;
  timeStamp: Date;
  notificationType: NotificationType;
  isRead: boolean;
  book: Book | null;
  bookLoan: UserLoan | null;
};

export enum NotificationType {
  BOOK_RETURN = "BOOK_RETURN",
  BOOK_LOAN_EXPIRED = "BOOK_LOAN_EXPIRED",
  BOOK_LOAN_REMINDER = "BOOK_LOAN_REMINDER",
  BOOK_ACCEPTED = "BOOK_ACCEPTED",
  BOOK_REJECTED = "BOOK_REJECTED",
  BOOK_LOAN_REQUEST_ACCEPTED = "BOOK_LOAN_REQUEST_ACCEPTED",
  BOOK_LOAN_REQUEST_REJECTED = "BOOK_LOAN_REQUEST_REJECTED",
}
