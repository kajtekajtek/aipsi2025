// import {BookCard} from "../../Components/BookCard";
import * as React from "react";
import {useState} from "react";
import {styled} from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Box,
    Checkbox,
    Fab,
    FormControlLabel,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import {Author, Book, Category, Publisher} from "../../Models/Book";
import {BookCard} from "../../Components/BookCard";
import {useAxiosPrivate} from "../../Hooks/useAxiosPrivate";
import {useLocation, useNavigate} from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import Button from "@mui/material/Button";
import {ArrowDropDownIcon} from "@mui/x-date-pickers";
import {Pagination} from "../../Components/Pagination";
import {useTranslation} from "react-i18next";

interface FormFields {
    title: string;
    categoryId: string;
    authors: Author[];
    publisherId: string;
    isEbook: boolean;
    showNotAvailable: boolean;
}

export function BookList() {
    const location = useLocation();
    const axiosPrivate = useAxiosPrivate();
    const {t} = useTranslation();
    const searchParams = new URLSearchParams(location.search);
    const [booksList, setBooksList] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const isAdminView = location.pathname.includes("admin/books/pending");

    const [pagesState, setPagesState] = useState({
        currentPage: searchParams.get("page")
            ? Number(searchParams.get("page")) - 1
            : 0,
        pageSize: searchParams.get("pageSize")
            ? Number(searchParams.get("pageSize"))
            : 12,
        pageCount: 0,
        allItems: 0,
    });
    const authorsIdParam = searchParams.get("authorsId");
    const [filters, setFilters] = useState({
        title: searchParams.get("title") || "",
        categoryId: searchParams.get("categoryId") || "",
        authorsId: authorsIdParam ? authorsIdParam.split(",") : [],
        publisherId: searchParams.get("publisherId") || "",
        isEbook: Boolean(searchParams.get("isEbook")) || false,
        showNotAvailable: Boolean(searchParams.get("showNotAvailable")) || false,
    });
    const {reset, control,formState: { errors}, register, handleSubmit, setValue} =
        useForm<FormFields>({
            mode: "all",
        });

    const navigate = useNavigate();
    const resetFilters = () => {
        setFilters({
            title: "",
            categoryId: "",
            authorsId: [],
            publisherId: "",
            isEbook: false,
            showNotAvailable: false,
        });
        reset();
        searchParams.delete("title");
        searchParams.delete("categoryId");
        searchParams.delete("authorsId");
        searchParams.delete("publisherId");
        searchParams.delete("isEbook");
        searchParams.delete("showNotAvailable");
        navigate({search: searchParams.toString()});
    };
    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        const authorsIds = data.authors.map((author) => author.id!.toString());
        setFilters({
            title: data.title,
            categoryId: data.categoryId,
            authorsId: authorsIds,
            publisherId: data.publisherId,
            isEbook: data.isEbook,
            showNotAvailable: data.showNotAvailable,
        });

        const queryPage = 1;
        setPagesState({
            ...pagesState,
            currentPage: 0,
        });
        searchParams.set("page", queryPage.toString());
    };

    const handlePageChange = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        value: number
    ) => {
        setPagesState({
            ...pagesState,
            currentPage: value,
        });
        const queryPage = value + 1;
        searchParams.set("page", queryPage.toString());
        navigate({search: searchParams.toString()});
    };

    const handlePageSizeChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setPagesState({
            ...pagesState,
            pageSize: Number(event.target.value),
            currentPage: 0,
        });
        searchParams.set("pageSize", event.target.value);
        navigate({search: searchParams.toString()});
    };
    React.useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                const requests = [
                    {url: "/categories", setter: setCategories},
                    {url: "/publishers", setter: setPublishers},
                    {url: "/authors", setter: setAuthors},
                ];

                await Promise.all(requests.map(async ({url, setter}) => {
                    try {
                        const response = await axiosPrivate.get(url);
                        isMounted && setter(response.data);
                    } catch (error) {
                        console.error(error);
                    }
                }));
            } catch (error) {
                console.error(error);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    React.useEffect(() => {
        if (authors.length > 0)
            setValue(
                "authors",
                authors.filter((author) =>
                    filters.authorsId.includes(author.id!.toString())
                )
            );
        if (categories.length > 0) setValue("categoryId", filters.categoryId);
        if (filters.title) setValue("title", filters.title);
        if (publishers.length > 0) setValue("publisherId", filters.publisherId);
        setValue("isEbook", filters.isEbook);
        setValue("showNotAvailable", filters.showNotAvailable);
    }, [
        setValue,
        authors,
        categories,
        publishers,
    ]);

    React.useEffect(() => {
        let isMounted = true;

        async function fetchBooks() {
            try {
                const urlParams =
                    `?` +
                    [
                        filters.title && `title=${filters.title}`,
                        filters.categoryId && `categoryId=${filters.categoryId}`,
                        filters.authorsId &&
                        filters.authorsId.length &&
                        `authorsId=${filters.authorsId.join(",")}`,
                        filters.publisherId && `publisherId=${filters.publisherId}`,
                        filters.isEbook ? `isEbook=${filters.isEbook}` : null,
                        filters.showNotAvailable ? `isAvailable=false` : `isAvailable=true`,
                        isAdminView ? "isPublished=false" : "isPublished=true",
                    ]
                        .filter((param) => param)
                        .join("&");

                const response = await axiosPrivate.get(
                    `/books/pagination/${pagesState.currentPage}/${pagesState.pageSize}${urlParams}`
                );
                isMounted && setBooksList(response.data.content);
                isMounted &&
                setPagesState({
                    currentPage: response.data.pageable.pageNumber,
                    pageSize: response.data.pageable.pageSize,
                    pageCount: response.data.totalPages,
                    allItems: response.data.totalElements,
                });
                searchParams.set(
                    "page",
                    (response.data.pageable.pageNumber + 1).toString()
                );
                searchParams.set(
                    "pageSize",
                    response.data.pageable.pageSize.toString()
                );

                filters.categoryId
                    ? searchParams.set("categoryId", filters.categoryId.toString())
                    : searchParams.delete("categoryId");
                filters.publisherId
                    ? searchParams.set("publisherId", filters.publisherId.toString())
                    : searchParams.delete("publisherId");
                filters.title
                    ? searchParams.set("title", filters.title.toString())
                    : searchParams.delete("title");
                filters.authorsId.length !== 0
                    ? searchParams.set(
                        "authorsId",
                        filters.authorsId.join(",").toString()
                    )
                    : searchParams.delete("authorsId");
                filters.isEbook
                    ? searchParams.set("isEbook", filters.isEbook.toString())
                    : searchParams.delete("isEbook");
                filters.showNotAvailable
                    ? searchParams.set(
                        "showNotAvailable",
                        filters.showNotAvailable.toString()
                    )
                    : searchParams.delete("showNotAvailable");

                navigate({search: searchParams.toString()});
            } catch (error) {
                console.error(error);
                // navigate("/login", {state: {from: location}, replace: true});
            }
        }

        fetchBooks();

        return () => {
            isMounted = false;
        };
    }, [
        pagesState.currentPage,
        pagesState.pageSize,
        pagesState.pageCount,
        pagesState.allItems,
        filters.categoryId,
        filters.title,
        filters.authorsId,
        filters.publisherId,
        filters.isEbook,
        filters.showNotAvailable,
    ]);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
    const filterBox = (
        <Stack
            gap={3}
            direction={"column"}
            height={{xs: "100%", md: "80vh"}}
            component="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
        >
            <Controller
                defaultValue={""}
                control={control}
                render={({field}) => (
                    <TextField
                        {...field}
                        select
                        SelectProps={{displayEmpty: true}}
                        margin="normal"
                        fullWidth
                        id="category"
                        name="categoryId"
                        label={t("bookList.category")}
                    >
                        <MenuItem value={""}>{t("bookList.none")}</MenuItem>
                        {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id?.toString()}>
                                {category.name}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
                name={"categoryId"}
            />
            <Controller
                defaultValue={""}
                control={control}
                render={({field}) => (
                    <TextField
                        {...field}
                        select
                        SelectProps={{displayEmpty: true}}
                        margin="normal"
                        fullWidth
                        id="publisher"
                        name="publisherId"
                        // InputLabelProps={{ shrink: !!field.value || field.value === "" }}
                        label={t("bookList.publisher")}
                    >
                        <MenuItem value={""}>{t("bookList.none")}</MenuItem>
                        {publishers.map((publisher) => (
                            <MenuItem key={publisher.id} value={publisher.id?.toString()}>
                                {publisher.name}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
                name={"publisherId"}
            />
            <TextField
                {...register("title", {
                })}
                type="text"
                margin="normal"
                fullWidth
                id="title"
                defaultValue={searchParams.get("title") || ""}
                label={t("bookList.title")}
                error={Boolean(errors.title)}
                helperText={errors.title?.message}
            />
            <Controller
                name="authors"
                control={control}
                defaultValue={[]}
                render={({field}) => (
                    <Autocomplete
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                type="text"
                                margin="normal"
                                label={t("bookList.authors")}
                                fullWidth
                                id="authors"
                                InputLabelProps={{shrink: true}}
                            />
                        )}
                        isOptionEqualToValue={(option: Author, value: Author) =>
                            option.id === value.id
                        }
                        options={authors}
                        getOptionLabel={(option) =>
                            option.firstName + " " + option.lastName
                        }
                        renderOption={(props, option) => (
                            <Box component="li" {...props} key={option.id}>
                                {option.firstName} {option.lastName}
                            </Box>
                        )}
                        multiple
                        value={field.value}
                        onChange={(event, selectedOptions) => {
                            setValue("authors", selectedOptions);
                        }}
                    />
                )}
            />
            <FormControlLabel
                control={
                    <Controller
                        name={"isEbook"}
                        control={control}
                        defaultValue={false}
                        render={({field: props}) => (
                            <Checkbox {...props} checked={props.value}/>
                        )}
                    />
                }
                label={t("bookList.ebook")}
            />
            <FormControlLabel
                control={
                    <Controller
                        name={"showNotAvailable"}
                        control={control}
                        defaultValue={false}
                        render={({field: props}) => (
                            <Checkbox {...props} checked={props.value}/>
                        )}
                    />
                }
                label={t("bookList.showNotAvailable")}
            />
            <Button type="submit" fullWidth>
                {t("bookList.applyFilters")}
            </Button>
            <Button fullWidth onClick={resetFilters}>
                {t("bookList.resetFilters")}
            </Button>
        </Stack>
    );

    return (
        <Grid container height={"100%"} id={"main_grid"} spacing={{xs: 3, md: 3}}>
            {!isAdminView && <Tooltip title={t("bookList.addBook")}>
                <FloatingButton
                    onClick={() => {
                        navigate("/books/add");
                    }}
                    color="primary"
                    aria-label="add"
                >
                    <AddIcon/>
                </FloatingButton>
            </Tooltip>}
            <Grid
                item
                xs={12}
                sm={12}
                md={2}
                lg={2}
                container
                justifyContent={"center"}
            >
                {!isAdminView &&
                    (isSmallScreen ? (
                        <>
                            <Accordion sx={{height: "fit-content"}}>
                                <AccordionSummary expandIcon={<ArrowDropDownIcon/>}>
                                    {t("bookList.filters")}
                                </AccordionSummary>
                                <AccordionDetails>{filterBox}</AccordionDetails>
                            </Accordion>
                        </>
                    ) : (
                        filterBox
                    ))}
            </Grid>
            <GridWithCards
                id={"grid_cards"}
                item
                xs={12}
                sm={12}
                md={isAdminView ? 12 : 10}
                lg={isAdminView ? 12 : 10}
                container
                gap={2}
            >
                {booksList.length > 0 ? (
                    booksList.map((book) => {
                        return <BookCard key={book.id} book={book}/>;
                    })
                ) : (
                    <Typography>
                        {t("bookList.noBooks")}
                    </Typography>
                )}
            </GridWithCards>

            <Grid
                container
                item
                xs={12}
                justifyContent={"center"}
                alignItems={"center"}
            >
                <Pagination allItems={pagesState.allItems} currentPage={pagesState.currentPage}
                            pageSize={pagesState.pageSize} onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}/>
            </Grid>
        </Grid>
    );
}

export const GridWithCards = styled(Grid)(({theme}) => ({
    justifyContent: "center",
    [theme.breakpoints.down("md")]: {
        justifyContent: "center",
    },
    margin: "0 auto",
}));

const FloatingButton = styled(Fab)(({theme}) => ({
    margin: 0,
    top: "auto",
    right: 30,
    bottom: 20,
    left: "auto",
    position: "fixed",
    [theme.breakpoints.down("md")]: {
        right: 30,
        bottom: 60,
    },
}));