import { NextPage } from "next";
import Link from "next/link";
import React from "react";
import { StatusBadge } from "../../../components/product/StatusBadge";
import VendorLayout from "../../../components/vendor/VendorLayout";
import { trpc } from "../../../utils/trpc";

const ProductsManage: NextPage = () => {

    const {
        data: products,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,

        status,
    } = trpc.useInfiniteQuery(['vendor.getProducts', {
        limit: 5,
    }], {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });


    return (
        <VendorLayout>
            <div>
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-xl font-semibold text-neutral-200">Products</h1>
                        <p className="mt-2 text-sm text-neutral-400">
                            All products associated with your account will appear here.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <Link href={'/vendor/products/new'}>
                            <a
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none  sm:w-auto"
                            >
                                New Product
                            </a>
                        </Link>
                    </div>
                </div>
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-neutral-600">
                                    <thead className="bg-neutral-900">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-neutral-200 sm:pl-6">
                                                Name
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-200">
                                                Price
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-200">
                                                Status
                                            </th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Edit</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-600 bg-neutral-900/50">
                                        {products?.pages.map((group, i) => (
                                            <React.Fragment key={i}>
                                                {group.products.map((product) => (
                                                    <tr key={`${i}-${product.id}`}>
                                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 flex-shrink-0">
                                                                    <img className="h-10 w-10 rounded-full" src={product.icon ?? ''} alt="" />
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="font-medium text-neutral-200">{product.name}</div>
                                                                    <div className="text-neutral-400">{product.overview}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-400">
                                                            <div className="text-neutral-200">${(product.price / 100).toFixed(2)}</div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-400">
                                                            <StatusBadge status={product.status} />
                                                        </td>
                                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                            <Link href={`/vendor/products/${product.id}`}>
                                                                <a className="text-blue-600 hover:text-blue-900">
                                                                    Edit<span className="sr-only">, {product.name}</span>
                                                                </a>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}

                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                                <nav
                                    className="bg-neutral-900 px-4 py-3 flex items-center justify-between border-t border-neutral-600 sm:px-6"
                                    aria-label="Pagination"
                                >
                                    <div className="flex-1 flex justify-between sm:justify-end">

                                        {hasNextPage && (
                                            <button
                                                onClick={() => fetchNextPage()}
                                                disabled={!hasNextPage || isFetchingNextPage}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-600 text-sm font-medium rounded-md text-neutral-400 bg-neutral-900 hover:bg-neutral-800"
                                            >
                                                {isFetchingNextPage
                                                    ? 'Loading...'
                                                    : 'Load More'}
                                            </button>
                                        )}
                                        {!hasNextPage && (
                                            <div className="ml-3 text-base text-neutral-400">
                                                You’ve reached the end of the list.
                                            </div>)}
                                    </div>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </VendorLayout>
    )
};

export default ProductsManage;