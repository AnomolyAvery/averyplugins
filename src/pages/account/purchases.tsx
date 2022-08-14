import { useState } from "react";
import { FaKey } from "react-icons/fa";
import PurchaseStatus from "../../components/vendor/PurchaseStatus";
import { trpc } from "../../utils/trpc";

const Purchases = () => {

    const { data: purchases } = trpc.useQuery(['account.getPurchases']);

    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-xl font-semibold text-neutral-200">Purchases</h1>
                        <p className="mt-2 text-sm text-neutral-300">
                            A list of all your purchases in your account will appear here.
                        </p>
                    </div>
                </div>
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-neutral-900">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-neutral-200 sm:pl-6">
                                                Product
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-200">
                                                Developer
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-200">
                                                Status
                                            </th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">License Key</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-neutral-900/50">
                                        {purchases?.map((purchase) => (
                                            <tr key={purchase.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <img className="h-10 w-10 rounded-full" src={purchase.product.icon ?? ''} alt="" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="font-medium text-neutral-200">{purchase.product.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <div className="text-neutral-200">{purchase.product.owner.name}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <PurchaseStatus status={purchase.status} />
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <LicenseKey licenseKey={purchase.id} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

type LicenseKeyProps = {
    licenseKey: string;
}

const LicenseKey: React.FC<LicenseKeyProps> = ({ licenseKey }) => {
    const [show, updateShow] = useState(false);

    return (
        <>
            {show ? (
                <input
                    className="bg-neutral-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-neutral-600 rounded-md"


                    type="text" value={licenseKey} readOnly />

            ) : (
                <button onClick={() => updateShow(true)}>
                    <span className="sr-only">Show license key</span>
                    <FaKey />
                </button>
            )}
        </>
    )
}

export default Purchases;