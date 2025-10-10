/* eslint-disable no-lone-blocks */
import {
    Autocomplete,
    Avatar,
    Box,
    Button,
    Checkbox,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    InputAdornment,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import {MuiFileInput} from "mui-file-input";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {Author, Book, Category, Publisher} from "../../Models/Book";
import Tooltip from "@mui/material/Tooltip";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useAxiosPrivate} from "../../Hooks/useAxiosPrivate";
import {useAuth} from "../../Hooks/useAuth";
import axios from "axios";
import {useSnackbar} from "../../Hooks/useSnackbar";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {DatePicker} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import EditIcon from '@mui/icons-material/Edit';

interface FormFields {
    bookTitle: string;
    authors: Array<Author>;
    pageCount: string;
    coverFile: File | null;
    publisher: Publisher | null;
    category: string;
    isbn: string;
    description?: string;
    isEbook?: boolean;
    pdfFile?: File | null;
    releaseYear: dayjs.Dayjs | null;
}

interface AuthorFields {
    firstName: string;
    lastName: string;
}

interface PublisherFields {
    name: string;
}

interface Props {
    isEditMode: boolean;
}

export function AddEditBookPage(props: Props) {
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const {openSnackbar} = useSnackbar();
    const location = useLocation();
    const {t} = useTranslation();
    const {id} = useParams();
    const {auth} = useAuth();
    const {
        watch,
        setError,
        reset,
        control,
        register,
        setValue,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<FormFields>({
        mode: "all",
    });
    const {
        reset: resetDialog,
        register: registerDialog,
        setError: setErrorDialog,
        handleSubmit: handleSubmitDialog,
        formState: {errors: errorsDialog},
    } = useForm<AuthorFields>();
    const {
        reset: resetDialog1,
        register: registerDialog1,
        setError: setErrorDialog1,
        handleSubmit: handleSubmitDialog1,
        formState: {errors: errorsDialog1},
    } = useForm<PublisherFields>();

    const [categories, setCategories] = React.useState<Category[]>([]);
    const [publishers, setPublishers] = React.useState<Publisher[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [authorDialogOpen, setAuthorDialogOpen] = React.useState(false);
    const [publisherDialogOpen, setPublisherDialogOpen] = React.useState(false);
    const [isSubmittingDialog, setIsSubmittingDialog] = React.useState(false);
    const currentYear = dayjs().year();

    const handleAuthorDialogOpen = () => {
        setAuthorDialogOpen(true);
        resetDialog();
    };

    const handleAuthorDialogClose = () => {
        setAuthorDialogOpen(false);
    };
    const handlePublisherDialogOpen = () => {
        setPublisherDialogOpen(true);
        resetDialog1();
    };

    const handlePublisherDialogClose = () => {
        setPublisherDialogOpen(false);
    };
    useEffect(() => {
        let isMounted = true;

        async function fetchCategories() {
            try {
                const response = await axiosPrivate.get(`/categories`);
                isMounted && setCategories(response.data);
            } catch (error) {
                console.error(error);
                navigate("/login", {state: {from: location}, replace: true});
            }
        }

        fetchCategories();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function fetchPublishers() {
            try {
                const response = await axiosPrivate.get(`/publishers`);
                isMounted && setPublishers(response.data);
            } catch (error) {
                console.error(error);
                navigate("/login", {state: {from: location}, replace: true});
            }
        }

        fetchPublishers();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function fetchAuthors() {
            try {
                const response = await axiosPrivate.get(`/authors`);
                isMounted && setAuthors(response.data);
            } catch (error) {
                console.error(error);
                navigate("/login", {state: {from: location}, replace: true});
            }
        }

        fetchAuthors();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        const fetchExistingBook = async () => {
            if (id) {
                try {
                    const response = await axiosPrivate.get(`/books/${id}`);
                    if (isMounted) {
                        const book = response.data;
                        reset({
                            bookTitle: book.title,
                            authors: book.authors,
                            pageCount: book.pageCount,
                            coverFile: null,
                            publisher: book.publisher,
                            category: JSON.stringify(book.category),
                            isbn: book.isbn,
                            description: book.description,
                            isEbook: book.isEbook,
                            releaseYear: book.releaseYear ? dayjs().year(book.releaseYear) : null,
                        });
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        };
        fetchExistingBook();

        return () => {
            isMounted = false;
        };
    }, []);
    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        const formData = new FormData();
        data.coverFile &&
        formData.append("file", data.coverFile as File, data.coverFile?.name);
        data.pdfFile &&
        formData.append("pdfFile", data.pdfFile as File, data.pdfFile?.name);
        
        const newBook: Book = {
            id: id ? parseInt(id) : undefined,
            title: data.bookTitle,
            pageCount: parseInt(data.pageCount) || null,
            publisher: data.publisher!,
            isEbook: Boolean(data.isEbook),
            category: JSON.parse(data.category),
            isbn: data.isbn,
            authors: data.authors,
            available: true,
            isPublished: !!(auth && auth.roles?.includes("ADMIN")),
            releaseYear: data.releaseYear ? data.releaseYear.year() : null,
            description: data.description ? data.description : null,
            user: null,
            isDeleted: false,
        };
        formData.append(
            "book",
            new Blob([JSON.stringify(newBook)], {type: "application/json"})
        );

        try {
          const response =
            props.isEditMode && id
              ? await axiosPrivate.put(`/books/${id}`, formData, {
                    headers: {
                        "Content-Type": "undefined",
                    },
                })
              : await axiosPrivate.post(`/books`, formData, {
                  headers: {
                    "Content-Type": "undefined",
                  },
              params: {
                    userId: auth?.id,
              }
                });
            if (response.status === 201 || response.status === 200) {
                openSnackbar(props.isEditMode ? t("addBookPage.bookEdited") : t("addBookPage.bookAdded"), "success");
                navigate(props.isEditMode ? `/books/${id}` : "/books");
            }
        } catch (error) {
          if(axios.isAxiosError(error)){
            if (error?.response?.status === 409) {
              setError("root", {
                type: "manual",
                message: t("addBookPage.bookExistsIBN"),
              });
            }
            else {
              setError("root", {
                type: "manual",
                message: props.isEditMode && id
                    ? t("addBookPage.bookEditError")
                    : t("addBookPage.bookAddError"),
              });
            }
          }
        }
    };
    const onDialogSubmit: SubmitHandler<AuthorFields | PublisherFields> = async (
        data: AuthorFields | PublisherFields,
        event
    ) => {
        setIsSubmittingDialog(true);
        const url =
            event?.target.id === "authorSubmitButton"
                ? "http://localhost:8080/api/v1/authors"
                : "http://localhost:8080/api/v1/publishers";
        try {
            const response = await axiosPrivate.post(url, JSON.stringify(data));
            if (response.status === 201) {
                const data = await response.data;
                if (event?.target.id === "authorSubmitButton") {
                    const newAuthor = {
                        id: data.id,
                        firstName: data.firstName,
                        lastName: data.lastName,
                    };
                    setAuthors([...authors, newAuthor]);
                    handleAuthorDialogClose();
                    resetDialog();
                    openSnackbar(t("addBookPage.authorAdded"), "success");
                } else {
                    const newPublisher = {
                        id: data.id,
                        name: data.name,
                    };
                    setPublishers([...publishers, newPublisher]);
                    handlePublisherDialogClose();
                    resetDialog1();
                    openSnackbar(t("addBookPage.publisherAdded"), "success");
                }
                setIsSubmittingDialog(false);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error?.response?.status === 409) {
                    {
                        event?.target.id === "authorSubmitButton"
                            ? setErrorDialog("root", {
                                type: "manual",
                                message: t("addBookPage.authorExists"),
                            })
                            : setErrorDialog1("root", {
                                type: "manual",
                                message: t("addBookPage.publisherExists"),
                            });
                    }
                    setIsSubmittingDialog(false);
                } else {
                    event?.target.id === "authorSubmitButton"
                        ? setErrorDialog("root", {
                            type: "manual",
                            message: t("addBookPage.authorAddError"),
                        })
                        : setErrorDialog1("root", {
                            type: "manual",
                            message: t("addBookPage.publisherAddError"),
                        });
                    setIsSubmittingDialog(false);
                }
            }
        }
    };

    return (
        <>
            <Container component="main" maxWidth="xs">
                <Box
                    sx={{
                        marginTop: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Avatar
                        sx={{
                            m: 1,
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                        }}
                    >
                        {props.isEditMode ? <EditIcon/> : <AddIcon/>}
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        {id ? t("addBookPage.titleEdit") : t("addBookPage.titleAdd")}
                    </Typography>
                    <Box
                        component="form"
                        noValidate
                        sx={{mt: 1}}
                        onSubmit={handleSubmit(onSubmit)}
                        width={"100%"}
                    >
                        <TextField
                            {...register("bookTitle", {
                                required: t("addBookPage.bookTitleRequired"),
                                minLength: {
                                    value: 5,
                                    message: t("addBookPage.bookTitleMinLength"),
                                },
                            })}
                            placeholder={t("addBookPage.bookTitlePlaceholder")}
                            type="text"
                            margin="normal"
                            required
                            fullWidth
                            id="bookTitle"
                            label={t("addBookPage.bookTitle")}
                            error={Boolean(errors.bookTitle)}
                            helperText={errors?.bookTitle?.message}
                        />
                        <Controller
                            name="authors"
                            control={control}
                            defaultValue={[]}
                            rules={{
                                required: t("addBookPage.authorsRequired"),

                            }}
                            render={({ field }) => (
                                <Autocomplete
                                    disableCloseOnSelect
                                    clearIcon={null}
                                    renderInput={(params) => (
                                        <TextField
                                            placeholder={t("addBookPage.authorsPlaceholder")}
                                            required
                                            {...params}
                                            type="text"
                                            margin="normal"
                                            label={t("addBookPage.authors")}
                                            fullWidth
                                            id="authors"
                                            helperText={errors?.authors?.message}
                                            error={Boolean(errors.authors)}
                                            InputLabelProps={{ shrink: true }}
                                            sx={{
                                                "&&& .MuiInputBase-root": {
                                                    paddingRight:"32px"
                                                }
                                            }}
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        <Tooltip
                                                            title={
                                                                <Typography>
                                                                    {t("addBookPage.addAuthorTooltip")}
                                                                </Typography>
                                                            }
                                                        >
                                                            <InputAdornment onClick={handleAuthorDialogOpen} position={"start"} sx={{cursor:"pointer", position:"absolute", right:"40px"}}>
                                                                <AddIcon/>
                                                            </InputAdornment>
                                                        </Tooltip>
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}

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
                        <Dialog
                            maxWidth={"sm"}
                            open={authorDialogOpen}
                            onClose={handleAuthorDialogClose}
                            PaperProps={{
                                component: "form",
                                noValidate: true,
                            }}
                        >
                            <DialogTitle>{t("addBookPage.authorDialog.title")}</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    {t("addBookPage.authorDialog.text")}
                                </DialogContentText>
                                <TextField
                                    {...registerDialog("firstName", {
                                        required: t("addBookPage.authorDialog.firstNameRequired"),
                                    })}
                                    margin="dense"
                                    id="firstName"
                                    name="firstName"
                                    label={t("addBookPage.authorDialog.firstName")}
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    error={Boolean(errorsDialog.firstName)}
                                    helperText={errorsDialog?.firstName?.message}
                                />
                                <TextField
                                    {...registerDialog("lastName", {
                                        required: t("addBookPage.authorDialog.lastNameRequired")
                                    })}
                                    margin="dense"
                                    id="lastName"
                                    name="lastName"
                                    label={t("addBookPage.authorDialog.lastName")}
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    error={Boolean(errorsDialog.lastName)}
                                    helperText={errorsDialog?.lastName?.message}
                                />
                                {errorsDialog.root && (
                                    <Typography color="error">
                                        {errorsDialog.root.message}
                                    </Typography>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleAuthorDialogClose}>{t("addBookPage.authorDialog.cancel")}</Button>
                                <Button
                                    id={"authorSubmitButton"}
                                    disabled={isSubmittingDialog}
                                    onClick={handleSubmitDialog(onDialogSubmit)}
                                >
                                    {isSubmittingDialog ? t("addBookPage.authorDialog.adding") : t("addBookPage.authorDialog.add")}
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <TextField
                            {...register("pageCount", {
                                min: {
                                    value: 1,
                                    message: t("addBookPage.pageCountMin"),
                                },
                            })}
                            type="number"
                            margin="normal"
                            fullWidth
                            id="pageCount"
                            label={t("addBookPage.pageCount")}
                            name="pageCount"
                            InputProps={{inputProps: {min: 1}}}
                            placeholder={t("addBookPage.pageCountPlaceholder")}
                            error={Boolean(errors.pageCount)}
                            helperText={errors?.pageCount?.message}
                        />
                        <Controller
                            rules={{
                                validate: (value) => {
                                    if (!value) {
                                        return true;
                                    }
                                    if (!(value instanceof File)) {
                                        return t("addBookPage.invalidFile");
                                    }
                                    const allowedExtensions = [".png", ".jpg", ".jpeg"];
                                    const extension = value.name.split(".").pop();
                                    if (
                                        !extension ||
                                        !allowedExtensions.includes("." + extension.toLowerCase())
                                    ) {
                                        return t("addBookPage.invalidFileExtension");
                                    }
                                    const maxSizeInBytes = 2 * 1024 * 1024;
                                    if (value.size > maxSizeInBytes) {
                                        return t("addBookPage.fileTooLarge");
                                    }
                                    return true;
                                },
                            }}
                            control={control}
                            render={({field}) => (
                                <MuiFileInput
                                    {...field}
                                    margin="normal"
                                    fullWidth
                                    id="coverFile"
                                    name="coverFile"
                                    label={t("addBookPage.cover")}
                                    InputProps={{
                                        startAdornment: <UploadFileIcon/>,
                                    }}
                                    inputProps={{accept: ".png, .jpeg, .jpg"}}
                                    clearIconButtonProps={{
                                        title: t("addBookPage.remove"),
                                        children: <CloseIcon fontSize="small"/>,
                                    }}
                                    helperText={errors.coverFile ? errors.coverFile.message : ""}
                                    error={Boolean(errors.coverFile)}
                                />
                            )}
                            name={"coverFile"}
                        />
                        <Controller rules={{
                            required: t("addBookPage.publisherRequired"),
                        }} defaultValue={null} control={control} render={({field}) => (
                            <Autocomplete clearIcon={null} renderInput={(params) =>
                                <TextField
                                    label={t("addBookPage.publisher")}
                                    sx={{
                                        "&&& .MuiInputBase-root": {
                                            paddingRight:"32px"
                                        }
                                    }}
                                    margin="normal"
                                    {...params}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    helperText={errors?.publisher?.message}
                                    error={Boolean(errors.publisher)}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                            <Tooltip
                                                title={
                                                    <Typography>
                                                        {t("addBookPage.addPublisherTooltip")}
                                                    </Typography>
                                                }
                                            >
                                                <InputAdornment onClick={handlePublisherDialogOpen} position={"start"} sx={{cursor:"pointer", marginRight:2}}>
                                                    <AddIcon/>
                                                </InputAdornment>
                                            </Tooltip>
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />}
                                          options={publishers}
                                          getOptionLabel={option => option.name}
                                          value={field.value}
                                          isOptionEqualToValue={(option, value) => option.id === value.id}
                                          onChange={(event, data) => {
                                              field.onChange(data);
                                              return data;
                                          }}
                            />
                        )} name={"publisher"}/>

                        <Dialog
                            maxWidth={"sm"}
                            open={publisherDialogOpen}
                            onClose={handlePublisherDialogClose}
                            PaperProps={{
                                component: "form",
                                noValidate: true,
                            }}
                        >
                            <DialogTitle>{t("addBookPage.publisherDialog.title")}</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    {t("addBookPage.publisherDialog.text")}
                                </DialogContentText>
                                <TextField
                                    {...registerDialog1("name", {
                                        required: t("addBookPage.publisherDialog.nameRequired"),
                                    })}
                                    margin="dense"
                                    id="publisherName"
                                    label={t("addBookPage.publisherDialog.name")}
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    error={Boolean(errorsDialog1.name)}
                                    helperText={errorsDialog1?.name?.message}
                                />
                                {errorsDialog1.root && (
                                    <Typography color="error">
                                        {errorsDialog1.root.message}
                                    </Typography>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handlePublisherDialogClose}>{t("addBookPage.publisherDialog.cancel")}</Button>
                                <Button
                                    id={"publisherSubmitButton"}
                                    disabled={isSubmittingDialog}
                                    onClick={handleSubmitDialog1(onDialogSubmit)}
                                >
                                    {isSubmittingDialog ? t("addBookPage.publisherDialog.adding") : t("addBookPage.publisherDialog.add")}
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <Controller
                            defaultValue={""}
                            control={control}
                            render={({field}) => (
                                <TextField
                                    {...field}
                                    select
                                    margin="normal"
                                    fullWidth
                                    required
                                    id="category"
                                    SelectProps={{
                                        displayEmpty: true,
                                    }}
                                    label={t("addBookPage.category")}
                                    helperText={errors?.category?.message}
                                    error={Boolean(errors.category)}

                                    name="category"
                                    placeholder={t("addBookPage.categoryPlaceholder")}
                                >
                                    {categories &&
                                        categories.map((category) => (
                                            <MenuItem
                                                key={category.id}
                                                value={JSON.stringify(category)}
                                            >
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                </TextField>
                            )}
                            name={"category"}
                            rules={{
                                required: t("addBookPage.categoryRequired"),
                            }}
                        />
                        <Controller name={"releaseYear"} control={control} defaultValue={null}
                                    render={({field}) => (
                                        <DatePicker
                                            label={t("addBookPage.releaseYear")}
                                            value={field.value ? dayjs(field.value) : null}
                                            inputRef={field.ref}
                                            onChange={(date) => {
                                                field.onChange(date);
                                            }}
                                            views={["year"]}
                                            maxDate={dayjs().set('year', currentYear)}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: Boolean(errors.releaseYear),
                                                    helperText: errors?.releaseYear?.message,
                                                    required: true,
                                                    margin: "normal",
                                                    placeholder: t("addBookPage.releaseYearPlaceholder"),
                                                }
                                            }}
                                        />
                                    )
                                    }
                                    rules={{
                                        required: t("addBookPage.releaseYearRequired"),
                                    }}/>
                        <TextField
                            {...register("isbn", {
                                required: t("addBookPage.isbnRequired"),
                                minLength: {
                                    value: 13,
                                    message: t("addBookPage.isbnMinLength"),
                                },
                                maxLength: {
                                    value: 13,
                                    message: t("addBookPage.isbnMinLength"),
                                },
                                pattern: {
                                    value: /^[0-9]{13}$/,
                                    message: t("addBookPage.isbnMinLength"),
                                },
                            })}
                            inputProps={{maxLength: 13}}
                            type="text"
                            margin="normal"
                            fullWidth
                            required
                            id="isbn"
                            label={t("addBookPage.isbn")}
                            name="isbn"
                            placeholder={t("addBookPage.isbnPlaceholder")}

                            error={Boolean(errors.isbn)}
                            helperText={errors?.isbn?.message}
                        />
                        <TextField
                            {...register("description")}
                            margin="normal"
                            fullWidth
                            id="description"
                            label={t("addBookPage.description")}
                            name="description"
                            placeholder={t("addBookPage.descriptionPlaceholder")}

                            multiline
                            rows={4}
                        />
                        {!props.isEditMode && <FormControlLabel
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
                            label={t("addBookPage.isEbook")}
                        />}
                        {watch("isEbook") && (
                            <Controller
                                rules={{
                                    required: t("addBookPage.pdfRequired"),
                                    validate: (value) => {
                                        if (!value) {
                                            return true;
                                        }
                                        if (!(value instanceof File)) {
                                            return t("addBookPage.invalidFile");
                                        }
                                        const allowedExtensions = [".pdf"];
                                        const extension = value.name.split(".").pop();
                                        if (
                                            !extension ||
                                            !allowedExtensions.includes("." + extension.toLowerCase())
                                        ) {
                                            return t("addBookPage.invalidPdfFileExtension");
                                        }
                                        return true;
                                    },
                                }}
                                control={control}
                                render={({field}) => (
                                    <MuiFileInput
                                        {...field}
                                        margin="normal"
                                        fullWidth
                                        id="pdfFile"
                                        name="pdfFile"
                                        required
                                        label={t("addBookPage.pdf")}
                                        InputProps={{
                                            startAdornment: <PictureAsPdfIcon/>,
                                        }}
                                        inputProps={{accept: ".pdf"}}
                                        clearIconButtonProps={{
                                            title: t("addBookPage.remove"),
                                            children: <CloseIcon fontSize="small"/>,
                                        }}
                                        helperText={errors.pdfFile ? errors.pdfFile.message : ""}
                                        error={Boolean(errors.pdfFile)}
                                    />
                                )}
                                name={"pdfFile"}
                            />
                        )}

                        {errors.root && (
                            <Typography color="error">{errors.root.message}</Typography>
                        )}
                        <Button
                            disabled={isSubmitting}
                            type="submit"
                            fullWidth
                            sx={{mt: 3, mb: 2}}
                        >
                            {isSubmitting
                                ? props.isEditMode
                                    ? t("addBookPage.editing")
                                    : t("addBookPage.adding")
                                : props.isEditMode
                                    ? t("addBookPage.saveBookChanges")
                                    : t("addBookPage.addBook")}
                        </Button>
                    </Box>
                </Box>
            </Container>
        </>
    );
}
