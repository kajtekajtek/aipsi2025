import React from "react";
import {Header} from "../Header";
import {styled} from "@mui/material";
import {Outlet} from "react-router-dom";


export function Layout() {

    return (
        <div style={{height: '100%'}}>
            <Header/>
            <PageContentWraper>
                <PageContent>
                    <Outlet/>
                </PageContent>
            </PageContentWraper>
        </div>
    );
}

const PageContentWraper = styled("div")`
    padding: 64px 0 0 0;
    height: 100%;
    overflow: hidden;
`;
const PageContent = styled("div")(({theme}) => ({
    overflowY: "auto",
    height: "100%",
    padding: "2rem",
    [theme.breakpoints.down('md')]: {
        padding: "2rem 1rem",
    },
}));