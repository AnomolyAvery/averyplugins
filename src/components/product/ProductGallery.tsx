import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { FaCamera, FaExclamation, FaPlus } from 'react-icons/fa'
import { trpc } from '../../utils/trpc';

type Props = {
    productId: string;
}

const ProductGallery: React.FC<Props> = ({ productId }) => {

    const { data: images, refetch } = trpc.useQuery(['products.getProductGallery', {
        id: productId
    }]);

    const [addToggle, updateAddToggle] = useState(false);

    const [selectedImage, updateSelectedImage] = useState<{
        id: string;
        url: string;
    } | null>(null);

    const onDeleteClosed = (deleted: boolean) => {
        if (deleted) {
            refetch();
        }

        updateSelectedImage(null);
    };



    return (
        <div>

            <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
                {images?.map((file) => (
                    <li key={file.id} className="relative">
                        <div onClick={() => updateSelectedImage(file)} className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-neutral-900 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-neutral-600 overflow-hidden">
                            <img src={file.url} alt="" className="object-cover pointer-events-none group-hover:opacity-75" />
                            <button type="button" className="absolute inset-0 focus:outline-none">
                                <span className="sr-only">View details for {file.id}</span>
                            </button>
                        </div>
                        <p className="mt-2 block text-sm font-medium text-neutral-200 truncate pointer-events-none">{file.id}</p>
                        <p className="block text-sm font-medium text-neutral-400 pointer-events-none">1 MB</p>
                    </li>
                ))}
                <li className='relative'>
                    <div onClick={() => updateAddToggle(true)} className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-neutral-900 hover:bg-neutral-900/50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-neutral-600 overflow-hidden">
                        <FaPlus className='m-auto w-20 h-20 text-neutral-400 group-hover:text-neutral-200' />
                    </div>
                </li>
            </ul>

            <AddModal productId={productId} open={addToggle} onClose={() => updateAddToggle(false)} onImageAdded={() => refetch()} />
            <DeleteModal imageId={selectedImage?.id ?? ''} imageUrl={selectedImage?.url ?? ''} isOpen={selectedImage !== null} onClose={onDeleteClosed} />
        </div>
    )
};

type AddModalProps = {
    productId: string;
    open: boolean;
    onClose: () => void;
    onImageAdded: () => void;
}

const AddModal: React.FC<AddModalProps> = ({ productId, open, onClose, onImageAdded }) => {

    const cancelButtonRef = useRef(null);

    const [file, updateFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, updateIsUploading] = useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];

        if (file && inputRef.current) {

            const bytes = file.size;

            const mb = bytes / 1024 / 1024;

            if (mb > 2) {
                toast.error('File size must be less than 2MB');
                inputRef.current.value = "";
                return;
            }

            updateFile(file);
        }
    }

    const onUpload = async () => {
        try {
            if (!file) return;

            const iconUploadUrl = `/api/products/gallery-upload?productId=${productId}`;
            const formData = new FormData();
            formData.append('gallery_image', file);

            updateIsUploading(true);

            const response = await fetch(iconUploadUrl, {
                method: "POST",
                body: formData
            });

            const json = await response.json();

            console.log(json);

            updateIsUploading(false);
            if (response.ok) {
                toast.success('Image uploaded successfully');
                onImageAdded();
                onClose();
            }
            else {
                toast.error('Image upload failed');
            }
        }
        catch (err) {
            toast.error('Image upload failed');
        }
    };


    const closeModal = () => {
        updateFile(null);
        updateIsUploading(false);
        onClose();
    }

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={closeModal}>
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
                            <Dialog.Panel className="relative bg-neutral-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                                <div className="bg-neutral-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <FaCamera className="h-6 w-6 text-green-600" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-neutral-200">
                                                Image Upload
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <div>
                                                    {file && (
                                                        <img className='h-32 w-auto' src={URL.createObjectURL(file)} />
                                                    )}
                                                </div>
                                                <input ref={inputRef} onChange={onChange} className="ml-2" type="file" accept='image/*' />


                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-neutral-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-800 text-base font-medium text-white hover:bg-green-700 disabled:opacity-75 disabled:hover:bg-green-800 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={onUpload}
                                        disabled={!file || isUploading}
                                    >
                                        Upload
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-600 shadow-sm px-4 py-2 bg-neutral-900 text-base font-medium text-neutral-200 hover:bg-neutral-900/50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={closeModal}
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
};

type DeleteModalProps = {
    imageId?: string;
    imageUrl?: string;
    isOpen: boolean;
    onClose: (deleted: boolean) => void;
}
const DeleteModal: React.FC<DeleteModalProps> = ({
    imageId,
    imageUrl,
    isOpen = false,
    onClose
}) => {

    const cancelButtonRef = useRef(null);


    const { mutateAsync: deleteImageAsync } = trpc.useMutation(['vendor.deleteProductImage']);

    const onDelete = async () => {
        try {
            if (imageId) {
                console.log(imageId);
                const { id } = await deleteImageAsync({ id: imageId });
                if (id) {
                    toast.success(`Image ${id} deleted successfully`);
                }
            }
            onClose(true);
        }
        catch (err) {
            toast.error(`Image ${imageId} delete failed`);
            onClose(false);
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => onClose(false)}>
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
                            <Dialog.Panel className="relative bg-neutral-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <FaExclamation className="h-6 w-6 text-red-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-neutral-200">
                                            Delete Image {imageId}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-neutral-400">
                                                Are you sure you want to delete this image? This cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-800 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={onDelete}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-600 shadow-sm px-4 py-2 bg-neutral-900 text-base font-medium text-neutral-200 hover:bg-neutral-800 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                                        onClick={() => onClose(false)}
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

export default ProductGallery