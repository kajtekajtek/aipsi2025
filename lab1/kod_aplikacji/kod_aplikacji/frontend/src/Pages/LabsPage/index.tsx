import React, {useEffect, useState} from "react";
import {useAxiosPrivate} from "../../Hooks/useAxiosPrivate";
import FileExplorer, {ExtendedTreeItemProps} from "../../Components/FileExplorer";
import {TreeViewBaseItem} from "@mui/x-tree-view/models";

export function LabsPage() {
    const [treeItems, setTreeItems] = useState<TreeViewBaseItem<ExtendedTreeItemProps>[]>([])
    const axiosPrivate = useAxiosPrivate();
    useEffect(() => {
        axiosPrivate.get('/storage/labs')
            .then((response) => {
                setTreeItems(response.data);
            })
            .catch((error) => {
                console.error(error);
            });

    }, []);

    const downloadFile = async (itemName: string, path: string) => {
        try {
            const encodedItemName = encodeURI(itemName);
            const url = `/storage/labs/download/${encodedItemName}`;
            const response = await axiosPrivate.get(url, { responseType: 'arraybuffer', params: {
                filePath: path
                } });
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const href = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = href;
            link.setAttribute("download", itemName);
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(href);
        } catch (error) {
            console.error(error);
        }
    }
    const getFolders = (items: TreeViewBaseItem<ExtendedTreeItemProps>[]) : TreeViewBaseItem<ExtendedTreeItemProps>[] => {
        const folders = [];
        for (const item of items) {

            if (!item.fileType) {
                folders.push(item);
            }

            if (item.children) {
                folders.push(...getFolders(item.children));
            }
        }
        return folders;
    }

    return (
        <>
        <FileExplorer onFileClick={downloadFile} items={treeItems}/>
            </>
    );
}