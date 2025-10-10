import {Box, TablePagination} from "@mui/material";
import * as React from "react";
import {useTranslation} from "react-i18next";
import {LabelDisplayedRowsArgs} from "@mui/material";


interface Props {
    allItems: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
    onPageSizeChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function Pagination(props: Props) {
    const {t} = useTranslation();
    function defaultLabelDisplayedRows(paginationInfo: LabelDisplayedRowsArgs): React.ReactNode {
        const { from, to, count } = paginationInfo;
        return count !== -1 ?
            t("mui.components.tablePagination.displayedRows", { from, to, count }) :
            t("mui.components.tablePagination.displayedRowsMoreThan", { from, to, count });
    }    return (
        <Box
            style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "2rem",
                flexWrap: "wrap",
            }}
        >
            <TablePagination
                sx={{
                    "&&& .MuiTablePagination-actions": {
                        marginLeft: 0,
                    },
                    "&&& .MuiTablePagination-toolbar": {
                        paddingLeft: 0,
                    }
                }}
                 showFirstButton={props.allItems > props.pageSize}
                 showLastButton = {props.allItems > props.pageSize}
                labelDisplayedRows={defaultLabelDisplayedRows}
                labelRowsPerPage={t("mui.components.tablePagination.rowsPerPage")}
                rowsPerPageOptions={[12,24,48]}
                component="div"
                count={props.allItems}
                page={
                    !props.allItems || props.allItems <= 0
                        ? 0
                        : props.currentPage
                }
                onPageChange={props.onPageChange}
                rowsPerPage={props.pageSize}
                onRowsPerPageChange={props.onPageSizeChange}
            />
        </Box>
    )

}