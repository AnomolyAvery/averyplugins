import { useEffect, useState } from 'react';

import ReactMde from "react-mde";
import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import toast from 'react-hot-toast';
import IconUpload from './IconUpload';
import ProductGallery from './ProductGallery';


const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
});

type Props = {
    id?: string;
    icon?: string;
    name?: string;
    price?: number;
    overview?: string;
    description?: string;
    newProduct?: boolean;
    onSaveSuccess: () => void;
}

const ProductForm: React.FC<Props> = ({
    id,
    icon,
    name = "",
    price = 0,
    overview = "",
    description = "",
    newProduct = false,
    onSaveSuccess
}) => {



    const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");

    const router = useRouter();


    const { mutateAsync: createProductAsync } = trpc.useMutation(['vendor.products.create']);
    const { mutateAsync: updateProductAsync } = trpc.useMutation(['vendor.products.update']);

    const [n, updateName] = useState(name);
    const [p, updatePrice] = useState(price);
    const [o, updateOverview] = useState(overview);

    const [desc, updateDesc] = useState(
        converter.makeMarkdown(description)
    );


    const [errors, updateErrors] = useState<{
        name: string | null;
        price: string | null;
        overview: string | null;
    }>({
        name: null,
        price: null,
        overview: null,
    });


    const validateForm = () => {
        let checks = {
            name: n.length > 0,
            price: p >= 0,
            overview: o.length > 0,
        };

        let _errors: typeof errors = {
            name: null,
            price: null,
            overview: null,

        };

        if (!checks.name) {
            errors.name = "Name is required";
        }
        if (!checks.price) {
            errors.price = "Price is required";
        }
        if (!checks.overview) {
            errors.overview = "Overview is required";
        }

        updateErrors(_errors);

        return Object.values(checks).every(v => v);
    };


    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();


        if (!validateForm()) {
            return;
        }

        const product = {
            name: n,
            price: p,
            overview: o,
            description: converter.makeHtml(desc),
        };

        if (newProduct) {
            const { id } = await createProductAsync(product);
            toast.success('Product created');

            router.push(`/vendor/products/${id}`);
        }
        else {
            await updateProductAsync({
                ...product,
                id: router.query.id as string,
            });
            toast.success('Product updated');
            onSaveSuccess();
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-8 divide-y divide-neutral-600">
            <div className="space-y-8 divide-y divide-neutral-600">
                <div>
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-neutral-200">
                            {newProduct ? "Create Product" : "Edit Product"}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-400">
                            This information will be displayed publicly so be careful what you share.
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                        <div className="sm:col-span-3">
                            <label htmlFor="product-name" className="block text-sm font-medium text-neutral-300">
                                Name
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    id="product-name"
                                    className="bg-neutral-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-neutral-600 rounded-md"
                                    value={n}
                                    onChange={(e) => updateName(e.target.value)}
                                />
                            </div>
                            <div className='mt-1'>
                                {errors && errors.name && <p className='text-red-600 text-sm'>{errors.name}</p>}
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="product-price" className="block text-sm font-medium text-neutral-300">
                                Price
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    id="product-price"
                                    className="bg-neutral-900 focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-neutral-600 rounded-md"
                                    placeholder="0.00"
                                    aria-describedby="price-currency"
                                    value={p}
                                    onChange={(e) => updatePrice(parseFloat(e.target.value))}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm" id="price-currency">
                                        USD
                                    </span>
                                </div>
                            </div>
                            <div className='mt-1'>
                                {errors && errors.price && <p className='text-red-600 text-sm'>{errors.price}</p>}
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="product-overview" className="block text-sm font-medium text-neutral-300">
                                Overview
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="product-overview"
                                    rows={3}
                                    className="bg-neutral-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-neutral-600 rounded-md"
                                    value={o}
                                    onChange={(e) => updateOverview(e.target.value)}
                                />
                            </div>
                            <div className='mt-1'>
                                {errors && errors.overview && <p className='text-red-600 text-sm'>{errors.overview}</p>}
                            </div>
                            <p className="mt-2 text-sm text-neutral-400">Write a few sentences about.</p>
                        </div>
                        {!newProduct && id && (
                            <div className="sm:col-span-3">
                                <IconUpload productId={id} currentIcon={icon} />
                            </div>
                        )}

                        {!newProduct && id && (
                            <div className='sm:col-span-6'>
                                <ProductGallery productId={id} />
                            </div>
                        )}

                        <div className='sm:col-span-6'>
                            <ReactMde
                                classes={{
                                    reactMde: "!border-neutral-600",
                                    toolbar: "!bg-neutral-900/50 !text-neutral-100 !border-neutral-600",
                                    textArea: "bg-neutral-900",
                                    preview: "bg-neutral-900",
                                }}
                                value={desc}
                                onChange={updateDesc}
                                selectedTab={selectedTab}
                                onTabChange={setSelectedTab}
                                generateMarkdownPreview={markdown =>
                                    Promise.resolve(converter.makeHtml(markdown))
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <button
                        onClick={() => router.back()}
                        type="button"
                        className="bg-neutral-900 py-2 px-4 border border-neutral-600 rounded-md shadow-sm text-sm font-medium text-neutral-300 hover:bg-neutral-800 focus:outline-none"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700 focus:outline-none"
                    >
                        Save
                    </button>
                </div>
            </div>
        </form>
    )
}

export default ProductForm