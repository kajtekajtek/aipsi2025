import { Book } from "./Book";
import { User } from "./User";

export type UserLoan = {
  id?: number;
  loanDate: string;
  requestDate: string;
  returnDate: string | null;
  dueDate: string | null;
  returned: boolean;
  rejected: boolean;
  user: User;
  book: Book;
  accepted: boolean;
};
