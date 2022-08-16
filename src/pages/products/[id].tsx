import { Tab } from "@headlessui/react";
import { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { IoShieldCheckmark } from "react-icons/io5";
import classNames from "../../utils/classNames";
import { trpc } from "../../utils/trpc";

const Product: NextPage = () => {

    const router = useRouter();

    const id = router.query.id as string;

    const { status: authStatus, } = useSession();

    const { data: product, status } = trpc.useQuery(['products.getProduct', {
        id,
    }]);


    const { mutateAsync: getDownloadUrlAsync } = trpc.useMutation(['products.getDownloadUrl']);

    const [isDownloading, updateIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!id) return;

        updateIsDownloading(true);
        const { url } = await getDownloadUrlAsync({
            id: id,
        });
        updateIsDownloading(false);

        // Open the download url in a new tab
        window.open(url, '_blank');
    }


    const buyNowOrDownload = product && product.purchases.length > 0 && product.purchases[0]?.status === "Paid" ? (
        <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="max-w-xs flex-1 bg-blue-800 disabled:hover:bg-blue-800 disabled:opacity-75 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700  sm:w-full"
        >
            {isDownloading ? 'Downloading...' : 'Download'}
        </button>
    ) : (
        <Link href={`/checkout/${id}`}>
            <a
                className="max-w-xs flex-1 bg-blue-800 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700  sm:w-full"
            >
                Buy Now
            </a>
        </Link>
    );


    return (
        <>
            {/* Product */}
            <div className=" max-w-2xl mx-auto lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                {/* Image gallery */}
                <Tab.Group as="div" className="flex flex-col-reverse">
                    {/* Image selector */}
                    <div className="hidden mt-6 w-full max-w-4xl mx-auto sm:block lg:max-w-none">
                        <Tab.List className="grid grid-cols-3 gap-6">
                            {product?.images.map((image) => (
                                <Tab
                                    key={image.id}
                                    className="relative h-24 rounded-md flex items-center justify-center cursor-pointer"
                                >
                                    {({ selected }) => (
                                        <>
                                            <span className="sr-only">{image.id}</span>
                                            <span className="absolute inset-0 rounded-md overflow-hidden">
                                                <img src={image.url} alt="" className="w-full h-full object-center object-cover" />
                                            </span>
                                            <span
                                                className={classNames(
                                                    selected ? 'ring-blue-500' : 'ring-transparent',
                                                    'absolute inset-0 rounded-md ring-2 pointer-events-none'
                                                )}
                                                aria-hidden="true"
                                            />
                                        </>
                                    )}
                                </Tab>
                            ))}
                        </Tab.List>
                    </div>

                    <Tab.Panels className="w-full">
                        {product?.images.map((image) => (
                            <Tab.Panel key={image.id}>
                                <img
                                    src={image.url}
                                    alt={image.id}
                                    className="w-full h-full object-center object-cover sm:rounded-lg"
                                />
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>

                {/* Product info */}
                <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                    <div className="inline-flex gap-2">
                        <img className="w-10 h-10 rounded-full bg-neutral-900 p-1" src={product?.icon ?? ''} />
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-100">{product?.name}</h1>
                    </div>

                    <div className="mt-3">
                        <h2 className="sr-only">Product information</h2>
                        <p className="text-2xl text-neutral-100">${(product?.price ?? 0) / 100}</p>
                    </div>

                    {/* Reviews */}
                    <div className="mt-3">
                        <h3 className="sr-only">Reviews</h3>
                        <div className="flex items-center">
                            <div className="flex items-center">
                                {[0, 1, 2, 3, 4].map((rating) => (
                                    <FaStar
                                        key={rating}
                                        className={classNames(
                                            4 > rating ? 'text-blue-500' : 'text-neutral-700',
                                            'h-5 w-5 flex-shrink-0'
                                        )}
                                        aria-hidden="true"
                                    />
                                ))}
                            </div>
                            <p className="sr-only">{4} out of 5 stars</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex gap-3 items-center">
                            <img src={product?.owner.image ?? ''} className="w-12 h-12 rounded-full" />
                            <h2 className="text-xl">
                                <IoShieldCheckmark className="inline-block text-sky-500" /> <span className="ml-1">{product?.owner.name}</span>
                            </h2>
                        </div>
                    </div>


                    <div className="mt-6">
                        <div className="mt-10 flex sm:flex-col1">
                            {authStatus === "unauthenticated" ? (
                                <button
                                    onClick={() => signIn('discord')}
                                    className="max-w-xs flex-1 bg-blue-800 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700  sm:w-full"
                                >
                                    Login to buy
                                </button>
                            ) : buyNowOrDownload}
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="sr-only">Description</h3>

                        <div
                            className="prose prose-invert prose-sm text-base text-neutral-300 space-y-6"
                            dangerouslySetInnerHTML={{ __html: product?.description ?? '' }}
                        />
                    </div>

                </div>
            </div>
        </>
    )
};

export default Product;