import {User} from "./User";

export type Book = {
  id?: number;
  authors: Author[];
  title: string;
  pageCount: number | null;
  description: string | null;
  coverFile?: File | null | string;
  publisher: Publisher;
  category: Category;
  isbn: string;
  available: boolean;
  isPublished: boolean;
  releaseYear: number | null;
  imageData?: {
    id: number;
    imageData: string;
    name: string;
    type: string;
  };
  isEbook: boolean;
  user: User | null;
  isDeleted: boolean;
};

export type Author = {
  id?: number | null;
  firstName: string;
  lastName: string;
};
export type Category = {
  id?: number | null;
  name: string;
};
export type Publisher = {
  id?: number | null;
  name: string;
};
