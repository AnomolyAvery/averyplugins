import { Dialog, Transition } from "@headlessui/react";
import type { ProductFileStatus } from "@prisma/client";
import { useRouter } from "next/router";
import { Fragment, useRef, useState } from 'react'
import toast from "react-hot-toast";
import { FaCalendar, FaCloudDownloadAlt, FaExclamation, FaFile, FaFileDownload, FaLocationArrow, FaUsers } from "react-icons/fa";
import FileStatus from "../../../../components/product/FileStatus";
import ManageLayout from "../../../../components/shared/ManageLayout";
import { trpc } from "../../../../utils/trpc";

const ProductFiles = () => {

    const router = useRouter();

    const id = router.query.id as string;

    const { data: files, refetch } = trpc.useQuery(['vendor.products.files.getAll', {
        id,
    }]);

    const [displayCreateDialog, setDisplayCreateDialog] = useState(false);
    const [displayUpdateDialog, setDisplayUpdateDialog] = useState(false);

    const onFileModalClose = (updatedId?: string) => {
        setDisplayCreateDialog(false);
        setDisplayUpdateDialog(false);
        updatedSelectedFile(null);
        refetch();
    };

    type File = {
        id: string;
        status: ProductFileStatus;
        name: string;
        createdAt: Date;
        version: string;
        message: string;
        downloads: number;
    }

    const [selectedFile, updatedSelectedFile] = useState<File | null>(null);


    return (
        <ManageLayout role="vendor">
            <div className="mb-4 pb-5 border-b border-neutral-600 sm:flex sm:items-center sm:justify-between">
                <h3 className="text-lg leading-6 font-medium text-neutral-200">Product Versions</h3>
                <div className="mt-3 sm:mt-0 sm:ml-4">
                    <button
                        onClick={() => {
                            setDisplayCreateDialog(true);
                        }}
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-700 focus:outline-none"
                    >
                        Add New Version
                    </button>
                </div>
            </div>
            <div className="bg-neutral-900/50 shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-neutral-600">
                    {files?.map((file) => (
                        <li key={file.id}>
                            <div onClick={() => {
                                updatedSelectedFile(f => f === file ? null : file);
                                setDisplayUpdateDialog(true);
                            }} className="block hover:bg-neutral-900">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-blue-600 truncate">{file.name}</p>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <FileStatus status={file.status} />
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                <FaCloudDownloadAlt className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                                {file.version}
                                            </p>
                                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                <FaFileDownload className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                                {file.downloads}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <FaCalendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                            <p>
                                                Created on <time dateTime={file.createdAt.toString()}>{file.createdAt.toDateString()}</time>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <FileModal isOpen={displayCreateDialog} onClose={onFileModalClose} productId={id} />

            {selectedFile && (
                <FileModal isOpen={displayUpdateDialog} onClose={onFileModalClose} productId={id} savedFile={selectedFile ? selectedFile : undefined} />
            )}

        </ManageLayout>
    )
};

type FileModalProps = {
    isOpen: boolean;
    onClose: (updatedId?: string) => void;
    productId: string;
    savedFile?: {
        id: string;
        name: string;
        version: string;
        message: string;
    }
}

const FileModal: React.FC<FileModalProps> = ({
    isOpen,
    onClose,
    productId,
    savedFile
}) => {

    const cancelButtonRef = useRef(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [file, updateFile] = useState<File | null>(null);
    const [fileName, updateFileName] = useState(savedFile ? savedFile.name : '');
    const [fileVersion, updateFileVersion] = useState(savedFile ? savedFile.version : '');
    const [fileMessage, updateFileMessage] = useState(savedFile ? savedFile.message : '');

    const [isUploading, updateIsUploading] = useState(false);

    const { mutateAsync: updateVersionAsync } = trpc.useMutation(['vendor.products.files.update']);

    const handleClose = (
        updatedId?: string
    ) => {
        updateFile(null);
        updateFileName('');
        updateFileVersion('');
        updateFileMessage('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        if (updatedId) {
            onClose(updatedId);
        }
        else {
            onClose();
        }

    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }


        const file = e.target.files[0];

        if (!file) {
            return;
        }



        const bytes = file.size;

        const mb = bytes / 1024 / 1024;

        if (mb > 5) {
            toast.error('File size should be less than 5MB');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        updateFile(file);
    };


    const onUpload = async () => {
        if (!file || !fileName || !fileVersion || !fileMessage) {
            toast.error('Please fill all fields');
            return;
        }

        const formData = new FormData();
        formData.append('product_file', file);

        if (savedFile) {
            updateIsUploading(true);
            const resp = await fetch(`/api/products/file-upload?productId=${productId}&fileId=${savedFile.id}`, {
                method: "PUT",
                body: formData,
            });

            const json = await resp.json();

            const fileId = json.fileId as string;

            if (!fileId) {
                toast.error('Error uploading file');
                return;
            }

            if (resp.status === 200) {
                const updatedFile = await updateVersionAsync({
                    id: fileId,
                    name: fileName,
                    version: fileVersion,
                    message: fileMessage,
                });
                updateIsUploading(false);

                if (updatedFile.id) {
                    toast.success('File updated successfully');
                    handleClose(updatedFile.id);
                }
                else {
                    toast.error('Error updating file');
                }
            }
            else {
                toast.error('Something went wrong');
            }
        }
        else {
            updateIsUploading(true);
            const resp = await fetch(`/api/products/file-upload?productId=${productId}`, {
                method: "POST",
                body: formData,
            });

            const json = await resp.json();

            const fileId = json.fileId as string;

            if (!fileId) {
                toast.error('Error uploading file');
                return;
            }

            if (resp.status === 201) {
                const updatedFile = await updateVersionAsync({
                    name: fileName,
                    version: fileVersion,
                    message: fileMessage,
                    id: fileId,
                });
                updateIsUploading(false);

                if (updatedFile.id) {
                    toast.success('File updated successfully');
                    handleClose();
                }
                else {
                    toast.error('Error updating file');
                }
            }
            else {
                toast.error('Something went wrong');
            }
        }

    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => handleClose()}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-neutral-900 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative bg-neutral-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full sm:p-6">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <FaFile className="h-6 w-6 text-green-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-neutral-200">
                                            {savedFile ? 'Update File' : 'Create File'}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <form className="space-y-8 divide-y divide-gray-200">
                                                <div className="space-y-8 divide-y divide-gray-200">
                                                    <div>
                                                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                                                            <div className="sm:col-span-4">
                                                                <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
                                                                    Name
                                                                </label>
                                                                <div className="mt-1">
                                                                    <input
                                                                        type="email"
                                                                        name="email"
                                                                        id="email"
                                                                        className="bg-neutral-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-neutral-600 rounded-md"
                                                                        placeholder="Enter version name"
                                                                        value={fileName}
                                                                        onChange={(e) => updateFileName(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="sm:col-span-4">
                                                                <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
                                                                    Version
                                                                </label>
                                                                <div className="mt-1">
                                                                    <input
                                                                        type="email"
                                                                        name="email"
                                                                        id="email"
                                                                        className="bg-neutral-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-neutral-600 rounded-md"
                                                                        placeholder="Ex. 1.0.0"
                                                                        value={fileVersion}
                                                                        onChange={(e) => updateFileVersion(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="sm:col-span-4">
                                                                <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
                                                                    File
                                                                </label>
                                                                <div className="mt-1">
                                                                    <input
                                                                        type="file"
                                                                        name="email"
                                                                        id="email"
                                                                        className="bg-neutral-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-neutral-600 rounded-md"
                                                                        placeholder="Ex. 1.0.0"
                                                                        accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed"
                                                                        onChange={onFileChange}
                                                                        ref={fileInputRef}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="sm:col-span-6">
                                                                <label htmlFor="about" className="block text-sm font-medium text-neutral-300">
                                                                    Message
                                                                </label>
                                                                <div className="mt-1">
                                                                    <textarea
                                                                        id="about"
                                                                        name="about"
                                                                        rows={3}
                                                                        className="bg-neutral-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-neutral-600 rounded-md"
                                                                        value={fileMessage}
                                                                        onChange={(e) => updateFileMessage(e.target.value)}
                                                                    />
                                                                </div>
                                                                <p className="mt-2 text-sm text-neutral-400">Write a few sentences about yourself.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-800 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-75 disabled:hover:bg-green-800"
                                        onClick={onUpload}
                                        disabled={!file || isUploading}
                                    >
                                        {
                                            isUploading ? 'Uploading' :
                                                savedFile ? 'Update' : 'Create'
                                        }
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-600 shadow-sm px-4 py-2 bg-neutral-900 text-base font-medium text-neutral-300 hover:bg-neutral-800 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                                        onClick={() => handleClose()}
                                        ref={cancelButtonRef}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

export default ProductFiles;