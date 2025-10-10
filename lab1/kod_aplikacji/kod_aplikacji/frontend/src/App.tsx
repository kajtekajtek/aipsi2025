import React from "react";
import "./App.css";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {useThemeContext} from "./Contexts/ThemeContext";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {LoginPage} from "./Pages/LoginPage";
import {RegisterPage} from "./Pages/RegisterPage";
import {BookList} from "./Pages/BookList";
import {AddEditBookPage} from "./Pages/AddBookPage";
import {RequireAuth} from "./Components/RequireAuth";
import {PersistentLogin} from "./Components/PersistentLogin";
import {Layout} from "./Components/Layout";
import {BookDetails} from "./Pages/BookDetails";
import {UserLoans} from "./Pages/UserLoans";
import {LoansView} from "./Pages/LoansView";
import {Anonymous} from "./Components/Anonymous";
import {LabsPage} from "./Pages/LabsPage";

function App() {
    const {theme} = useThemeContext();
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <BrowserRouter>
                <Routes>
                    <Route element={<PersistentLogin/>}>
                        <Route path={"/"} element={<Layout/>}>
                            <Route element={<Anonymous/>}>
                                <Route path={"/login"} element={<LoginPage/>}/>
                                <Route path={"/register"} element={<RegisterPage/>}/>
                            </Route>
                            <Route element={<RequireAuth allowedRoles={["USER", "ADMIN"]}/>}>
                                <Route
                                    path={"/labs"}
                                    element={<LabsPage/>}
                                    />
                                <Route
                                    path={"/loanDetails/:id"}
                                    element={<BookDetails/>}
                                />
                                <Route path={"/books"} element={<BookList/>}/>
                                <Route
                                    path={"/books/add"}
                                    element={<AddEditBookPage isEditMode={false}/>}
                                />
                                <Route path={"/books/:id"} element={<BookDetails/>}/>
                                <Route
                                    path={"/books/:id/edit"}
                                    element={<AddEditBookPage isEditMode={true}/>}
                                />
                                <Route path={"/my_loans"} element={<UserLoans/>}/>
                                <Route element={<RequireAuth allowedRoles={["ADMIN"]}/>}>
                                    <Route path={"/admin/loanHistory"} element={<LoansView/>}/>
                                    <Route
                                        path={"/admin/loans/pending"}
                                        element={<LoansView/>}
                                    />
                                    <Route
                                        path={"/admin/loans/pending/:id"}
                                        element={<BookDetails/>}
                                    />
                                    <Route path={"/admin/books/pending"} element={<BookList/>}/>
                                    <Route
                                        path={"/admin/books/pending/:id"}
                                        element={<BookDetails/>}
                                    />
                                </Route>
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
