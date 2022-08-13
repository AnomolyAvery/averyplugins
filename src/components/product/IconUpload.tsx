import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { trpc } from '../../utils/trpc';

type Props = {
    productId: string;
    currentIcon?: string;
}

const IconUpload: React.FC<Props> = ({ productId, currentIcon }) => {


    const [icon, updateIcon] = useState<File | null>(null);
    const [isUploading, updateIsUploading] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (!e.target.files) return;

        const file = e.target.files[0];

        if (file) {
            // Log the file size in MB
            const bytes = file.size;

            const mb = (bytes / 1024 / 1024);

            if (mb > 1) {
                toast.error(`Image size is ${mb.toFixed()}MB. Max size is 1MB.`);

                // Reset the files input
                if (inputRef.current) {
                    inputRef.current.value = "";
                }

                return;
            }

            updateIcon(file);
        }
    };


    const onUploadClick = async () => {
        try {
            if (!icon) {
                return;
            }

            const iconUploadUrl = `/api/products/icon-upload?productId=${productId}`;
            const formData = new FormData();
            formData.append("productId", productId);
            formData.append("icon", icon);

            updateIsUploading(true);

            const response = await fetch(iconUploadUrl, {
                method: "POST",
                body: formData,
            });
            updateIsUploading(false);

            if (response.ok) {
                toast.success("Icon uploaded successfully");
            }
        }
        catch (err) {
            toast.error('Error uploading icon');
        }
    };

    return (
        <div className="mb-4">
            <label htmlFor="photo" className="block text-sm font-medium text-neutral-300">
                Icon
            </label>
            <div className="mt-1 flex items-center">
                {icon ? (<img
                    className="h-12 w-12 rounded-full overflow-hidden bg-neutral-900"
                    src={URL.createObjectURL(icon)}
                />) : currentIcon ? (
                    <img
                        className="h-12 w-12 rounded-full overflow-hidden bg-neutral-900"
                        src={currentIcon}
                    />
                ) : (
                    <span className="h-12 w-12 rounded-full overflow-hidden bg-neutral-900">
                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </span>
                )
                }
                <input ref={inputRef} onChange={onImageChange} className="ml-2" type="file" accept='image/*' />
                <button
                    onClick={onUploadClick}
                    type="button"
                    disabled={isUploading || !icon}
                    className="ml-5 bg-neutral-900 py-2 px-3 border border-neutral-600 rounded-md shadow-sm text-sm leading-4 font-medium text-neutral-300 hover:bg-neutral-900/50 focus:outline-none disabled:opacity-75 disabled:hover:bg-neutral-900"
                >
                    {isUploading ? 'Uploading...' : 'Upload'}
                </button>
            </div>
        </div>
    )
}

export default IconUpload