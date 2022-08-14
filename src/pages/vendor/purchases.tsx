import PurchaseStatus from "../../components/vendor/PurchaseStatus";
import Link from "next/link";
import { Fragment } from "react";
import VendorLayout from "../../components/vendor/VendorLayout";
import { trpc } from "../../utils/trpc";

const VendorPurchases = () => {

    const { data: purchases, status } = trpc.useInfiniteQuery(['vendor.getPurchases', {
        limit: 5,
    }], {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

    return (
        <VendorLayout>
            <div>
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-xl font-semibold text-neutral-200">Purchases</h1>
                        <p className="mt-2 text-sm text-neutral-400">
                            All purchases associated with your products will appear here.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none sm:w-auto"
                        >
                            Export
                        </button>
                    </div>
                </div>
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-neutral-600">
                                    <thead className="bg-neutral-900">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-neutral-200 sm:pl-6"
                                            >
                                                Purchase ID
                                            </th>
                                            <th
                                                scope="col"
                                                className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-neutral-200"
                                            >
                                                Product
                                            </th>
                                            <th
                                                scope="col"
                                                className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-neutral-200"
                                            >
                                                User
                                            </th>
                                            <th
                                                scope="col"
                                                className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-neutral-200"
                                            >
                                                Status
                                            </th>
                                            <th
                                                scope="col"
                                                className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-neutral-200"
                                            >
                                                PayPal Order ID
                                            </th>
                                            <th scope="col" className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Edit</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-600 bg-neutral-900/50">
                                        {purchases?.pages.map((page, index) => (
                                            <Fragment key={`purchase-page-${index}`}>
                                                {page.purchases.map(purchase => (
                                                    <tr key={purchase.id}>
                                                        <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-neutral-300 sm:pl-6">
                                                            {purchase.id}
                                                        </td>
                                                        <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-neutral-200">
                                                            <Link href={`/vendor/products/${purchase.product.id}`}>
                                                                <a className="flex items-center">
                                                                    <div className="h-10 w-10 flex-shrink-0">
                                                                        <img className="h-10 w-10 rounded-full" src={purchase.product.icon ?? ''} alt="" />
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="font-medium text-neutral-200">{purchase.product.name}</div>
                                                                        <div className="text-neutral-400">${(purchase.product.price / 100).toFixed(2)}</div>
                                                                    </div>
                                                                </a>
                                                            </Link>
                                                        </td>
                                                        <td className="whitespace-nowrap px-2 py-2 text-sm text-neutral-200">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 flex-shrink-0">
                                                                    <img className="h-10 w-10 rounded-full" src={purchase.user.image ?? ''} alt="" />
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="font-medium text-neutral-200">{purchase.user.name}</div>
                                                                    <div className="text-neutral-400">ID: {purchase.user.id}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-2 py-2 text-sm text-neutral-300">
                                                            <PurchaseStatus status={purchase.status} />
                                                        </td>
                                                        <td className="whitespace-nowrap px-2 py-2 text-sm text-neutral-300">{purchase.paypalOrderId}</td>
                                                        <td className="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                            <a href="#" className="text-blue-600 hover:text-blue-700">
                                                                View<span className="sr-only">, {purchase.id}</span>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </VendorLayout>
    )
};

export default VendorPurchases;