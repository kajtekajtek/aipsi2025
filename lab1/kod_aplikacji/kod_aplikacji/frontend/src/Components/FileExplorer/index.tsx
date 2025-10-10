import * as React from 'react';
import clsx from 'clsx';
import {animated, useSpring} from '@react-spring/web';
import {alpha, styled} from '@mui/material/styles';
import {TransitionProps} from '@mui/material/transitions';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ArticleIcon from '@mui/icons-material/Article';
import FolderRounded from '@mui/icons-material/FolderRounded';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import {RichTreeView} from '@mui/x-tree-view/RichTreeView';
import {treeItemClasses} from '@mui/x-tree-view/TreeItem';
import {v4 as uuidv4} from 'uuid';
import {unstable_useTreeItem2 as useTreeItem2, UseTreeItem2Parameters,} from '@mui/x-tree-view/useTreeItem2';
import {TreeItem2Content, TreeItem2IconContainer, TreeItem2Label, TreeItem2Root,} from '@mui/x-tree-view/TreeItem2';
import {TreeItem2Icon} from '@mui/x-tree-view/TreeItem2Icon';
import {TreeItem2Provider} from '@mui/x-tree-view/TreeItem2Provider';
import {TreeViewBaseItem} from '@mui/x-tree-view/models';
import {Add, FolderOpenRounded, FolderZipRounded} from "@mui/icons-material";

type FileType = 'image' | 'pdf' | 'doc' | 'docx' | 'video' | 'folder' | 'zip' | 'rar';

export type ExtendedTreeItemProps = {
    fileType?: FileType;
    id: string;
    label: string;
    fullPath: string;
};

function DotIcon() {
    return (
        <Box
            sx={{
                width: 6,
                height: 6,
                borderRadius: '70%',
                bgcolor: 'warning.main',
                display: 'inline-block',
                verticalAlign: 'middle',
                zIndex: 1,
                mx: 1,
            }}
        />
    );
}

declare module 'react' {

}

const StyledTreeItemRoot = styled(TreeItem2Root)(({theme}) => ({
    color:
        theme.palette.mode === 'light'
            ? theme.palette.grey[800]
            : theme.palette.grey[400],
    position: 'relative',
    [`& .${treeItemClasses.groupTransition}`]: {
        marginLeft: theme.spacing(3.5),
    },
})) as unknown as typeof TreeItem2Root;

const CustomTreeItemContent = styled(TreeItem2Content)(({theme}) => ({
    flexDirection: 'row-reverse',
    borderRadius: theme.spacing(0.7),
    marginBottom: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
    padding: theme.spacing(0.5),
    paddingRight: theme.spacing(1),
    fontWeight: 500,
    [`& .${treeItemClasses.iconContainer}`]: {
        marginRight: theme.spacing(2),
    },
    [`&.Mui-expanded `]: {
        '&:not(.Mui-focused, .Mui-selected, .Mui-selected.Mui-focused) .labelIcon': {
            color:
                theme.palette.mode === 'light'
                    ? theme.palette.primary.main
                    : theme.palette.primary.dark,
        },
        '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            left: '16px',
            top: '44px',
            height: 'calc(100% - 48px)',
            width: '1.5px',
            backgroundColor:
                theme.palette.mode === 'light'
                    ? theme.palette.grey[300]
                    : theme.palette.grey[700],
        },
    },
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.mode === 'light' ? theme.palette.primary.main : 'white',
    },
    [`&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused`]: {
        backgroundColor:
            theme.palette.mode === 'light'
                ? theme.palette.primary.main
                : theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
    },
}));

const AnimatedCollapse = animated(Collapse);

function TransitionComponent(props: TransitionProps) {
    const style = useSpring({
        to: {
            opacity: props.in ? 1 : 0,
            transform: `translate3d(0,${props.in ? 0 : 20}px,0)`,
        },
    });

    return <AnimatedCollapse style={style} {...props} />;
}

const StyledTreeItemLabelText = styled(Typography)({
    color: 'inherit',
    fontWeight: 500,
    // fontSize:30,
}) as unknown as typeof Typography;

interface CustomLabelProps {
    children?: React.ReactNode;
    icon?: React.ElementType;
    expandable?: boolean;
    item: TreeViewBaseItem<ExtendedTreeItemProps>
    onAddIconClick?: () => void;
}

function CustomLabel({
                         icon: Icon,
                         expandable,
                         children,
                         item,
                            onAddIconClick,
                         ...other
                     }: CustomLabelProps) {
    return (
        <TreeItem2Label
            {...other}
            sx={{
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {Icon && (
                <Box
                    component={Icon}
                    className="labelIcon"
                    color="inherit"
                    sx={{mr: 1, fontSize: '1.2rem'}}
                    onClick={onAddIconClick}
                />
            )}

            <StyledTreeItemLabelText variant="body2">{children}</StyledTreeItemLabelText>
            {expandable && <DotIcon/>}
            {!item.fileType && (
                <Box
                    component={Add}
                    className="labelIcon"
                    color="inherit"
                    sx={{mr: 1, fontSize: '1.2rem'}}
                />
            )}
        </TreeItem2Label>
    );
}

const isExpandable = (reactChildren: React.ReactNode) => {
    if (Array.isArray(reactChildren)) {
        return reactChildren.length > 0 && reactChildren.some(isExpandable);
    }
    return Boolean(reactChildren);
};

const getIconFromFileType = (fileType: FileType) => {
    switch (fileType) {
        case 'image':
            return ImageIcon;
        case 'pdf':
            return PictureAsPdfIcon;
        case 'doc':
        case 'docx':
            return ArticleIcon;
        case 'video':
            return VideoCameraBackIcon;
        case 'folder':
            return FolderRounded;
        case "rar":
        case "zip":
            return FolderZipRounded
        default:
            return ArticleIcon;
    }
};

interface CustomTreeItemProps
    extends Omit<UseTreeItem2Parameters, 'rootRef'>,
        Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {
    onAddIconClick?: () => void;
}

const CustomTreeItem = React.forwardRef(function CustomTreeItem(
    props: CustomTreeItemProps,
    ref: React.Ref<HTMLLIElement>,
) {
    const {id, itemId, label, disabled, children, ...other} = props;

    const {
        getRootProps,
        getContentProps,
        getIconContainerProps,
        getLabelProps,
        getGroupTransitionProps,
        status,
        publicAPI,
    } = useTreeItem2({id, itemId, children, label, disabled, rootRef: ref});

    const item = publicAPI.getItem(itemId);
    const expandable = isExpandable(children);
    let icon;
    if (expandable) {
        icon = FolderRounded;
    } else if (item.fileType) {
        icon = getIconFromFileType(item.fileType);
    } else if (!expandable) {
        icon = FolderOpenRounded;
    }

    return (
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
        <TreeItem2Provider itemId={itemId}>
            <StyledTreeItemRoot {...getRootProps(other)}>
                <CustomTreeItemContent
                    {...getContentProps({
                        className: clsx('content', {
                            'Mui-expanded': status.expanded,
                            'Mui-selected': status.selected,
                            'Mui-focused': status.focused,
                            'Mui-disabled': status.disabled,
                        }),
                    })}
                >
                    <TreeItem2IconContainer {...getIconContainerProps()}>
                        <TreeItem2Icon status={status}/>
                    </TreeItem2IconContainer>

                    <CustomLabel
                        {...getLabelProps({icon, expandable: expandable && status.expanded})}
                        item={item}
                        onAddIconClick={props.onAddIconClick}
                    />
                </CustomTreeItemContent>
                {children && <TransitionComponent {...getGroupTransitionProps()} />}
            </StyledTreeItemRoot>
        </TreeItem2Provider>
    );
});

interface Props {
    items: TreeViewBaseItem<ExtendedTreeItemProps>[],
    onFileClick: (itemName: string, path: string) => void;
    customLabelOnClick?: () => void;
}

const findItemById = (items: TreeViewBaseItem<ExtendedTreeItemProps>[], itemId: string): TreeViewBaseItem<ExtendedTreeItemProps> | null => {
    for (const item of items) {
        if (item.id === itemId) {
            return item;
        }
        if (item.children) {
            const foundInChildren = findItemById(item.children, itemId);
            if (foundInChildren) {
                return foundInChildren;
            }
        }
    }
    return null;
};

const findParentById = (items: TreeViewBaseItem<ExtendedTreeItemProps>[], itemId: string): TreeViewBaseItem<ExtendedTreeItemProps> | null => {
    for (const item of items) {
        if (item.children) {
            for (const child of item.children) {
                if (child.id === itemId) {
                    return item;
                }
                const parent = findParentById([child], itemId);
                if (parent) {
                    return parent;
                }
            }
        }
    }
    return null;
};

export default function FileExplorer(props: Props) {
    return (
        <RichTreeView
            getItemId={(item) => item.id || item.id + uuidv4()}
            items={props.items}
            aria-label="file explorer"
            sx={{height: 'fit-content', flexGrow: 1}}
            slots={{item: CustomTreeItem}}

            onItemFocus={(event, itemId) => {
                const item = findItemById(props.items, itemId)
                if (item?.fileType) {
                    const parent = findParentById(props.items, itemId);
                    if (parent) {
                        props.onFileClick(item.label, parent.fullPath)
                    }
                }
            }}
        />
    );
}
