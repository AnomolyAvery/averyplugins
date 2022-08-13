import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import ProductForm from "../../../../components/product/ProductForm";
import VendorLayout from "../../../../components/vendor/VendorLayout";
import { trpc } from "../../../../utils/trpc";

const VendorProduct = () => {

    const router = useRouter();

    const id = router.query.id as string;

    const [icon, updateIcon] = useState<File | null>(null);
    const [isUploading, updateIsUploading] = useState(false);

    const { data: product, status } = trpc.useQuery(['vendor.getProduct', {
        id,
    }]);

    const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (!e.target.files) return;

        const file = e.target.files[0];

        if (file) updateIcon(file);
    };

    const { mutateAsync: getSignedUrlAsync } = trpc.useMutation(['vendor.getIconPresignedUrl']);
    const { mutateAsync: setIconAsync } = trpc.useMutation(['vendor.setIcon']);

    const onUploadClick = async () => {
        try {
            if (!icon) {
                return;
            }

            const { url } = await getSignedUrlAsync({
                id
            });

            updateIsUploading(true);
            const response = await fetch(url, {
                method: "PUT",
                body: icon,
            });
            updateIsUploading(false);
            await setIconAsync({
                id,
            });

            if (response.ok) {
                toast.success('Icon uploaded successfully');
            }
            else {
                toast.error('Error uploading icon');
            }
        }
        catch (err) {
            toast.error('Error uploading icon');
        }
    };

    return (
        <VendorLayout>
            {product && (
                <div className="flex flex-col justify-between">
                    <div className="mb-4">
                        <label htmlFor="photo" className="block text-sm font-medium text-neutral-300">
                            Icon
                        </label>
                        <div className="mt-1 flex items-center">
                            {icon ? (<img
                                className="h-12 w-12 rounded-full overflow-hidden bg-neutral-900"
                                src={URL.createObjectURL(icon)}
                            />) : product.icon ? (
                                <img
                                    className="h-12 w-12 rounded-full overflow-hidden bg-neutral-900"
                                    src={product.icon}
                                />
                            ) : (
                                <span className="h-12 w-12 rounded-full overflow-hidden bg-neutral-900">
                                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </span>
                            )
                            }
                            <input onChange={onImageChange} className="ml-2" type="file" />
                            <button
                                onClick={onUploadClick}
                                type="button"
                                disabled={isUploading}
                                className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                    <div>
                        <ProductForm
                            name={product.name}
                            price={(product.price / 100)}
                            overview={product.overview}
                            description={product.description}
                            newProduct={false}
                            id={product.id}
                        />
                    </div>
                </div>
            )}

        </VendorLayout>
    )
};

export default VendorProduct;