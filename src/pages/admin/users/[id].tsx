import type { ProductStatus } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { FaBan, FaCheckCircle, FaChevronRight, FaDiscord, FaIdBadge, FaIdCard, FaMailBulk, FaPhone, FaTrash, FaTrashAlt } from "react-icons/fa";
import { StatusBadge } from "../../../components/product/StatusBadge";
import LoadingPreview from "../../../components/shared/LoadingPreview";
import ManageLayout from "../../../components/shared/ManageLayout";
import { trpc } from "../../../utils/trpc";

const UserView = () => {

    const router = useRouter();

    const id = router.query.id as string;

    const { data: user, status } = trpc.useQuery(['admin.users.get', {
        id,
    }]);


    if (status === "loading") {
        return <LoadingPreview />;
    }

    const copyIdToCopyboard = () => {
        navigator.clipboard.writeText(id);
        toast.success("ID copied to clipboard", {
            className: "bg-neutral-900"
        });
    };

    return (
        <ManageLayout role="admin">
            <div>
                <div>
                    <div className="h-32 w-full object-cover lg:h-48 bg-neutral-900 rounded-lg" />
                </div>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                        <div className="flex">
                            <img className="h-24 w-24 rounded-full ring-4 ring-neutral-600 sm:h-32 sm:w-32" src={user?.image ?? ''} alt="" />
                        </div>
                        <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                            <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
                                <h1 className="text-2xl font-bold text-neutral-200 truncate">{user?.name}</h1>
                            </div>
                            <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                                <button
                                    type="button"
                                    className="inline-flex justify-center px-4 py-2 border border-neutral-600 shadow-sm text-sm font-medium rounded-md text-neutral-300 bg-neutral-900 hover:bg-neutral-900/50 focus:outline-none"
                                    onClick={copyIdToCopyboard}
                                >
                                    <FaDiscord className="-ml-1 mr-2 h-5 w-5 text-neutral-400" aria-hidden="true" />
                                    <span>Copy ID</span>
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex justify-center px-4 py-2 border border-red-600 shadow-sm text-sm font-medium rounded-md text-neutral-300 bg-red-900 hover:bg-red-900/50 focus:outline-none"
                                >
                                    <FaBan className="-ml-1 mr-2 h-5 w-5 text-neutral-400" aria-hidden="true" />
                                    <span>Ban</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="hidden sm:block md:hidden mt-6 min-w-0 flex-1">
                        <h1 className="text-2xl font-bold text-neutral-200 truncate">{user?.name}</h1>
                    </div>
                </div>
                <div className="max-w-5xl mx-auto mt-6">
                    {/* Content */}
                    {user?.products && (
                        <ProductList products={user.products} user={{ name: user.name ?? 'User' }} />
                    )}

                </div>
            </div>
        </ManageLayout>
    )
};

type ProductListProps = {
    user: {
        name: string;
    },
    products: {
        id: string;
        status: ProductStatus;
        name: string;
        overview: string;
        price: number;
        icon: string | null;
    }[];
}

const ProductList: React.FC<ProductListProps> = ({
    products,
    user,
}) => {

    return (
        <div>
            <div className="pb-5 border-b border-neutral-600">
                <h3 className="text-lg leading-6 font-medium text-neutral-200">
                    {user.name}&apos;s products
                </h3>
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
                                    {products.map((product) => (
                                        <tr key={product.id}>
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
                                                <button
                                                    type="button"
                                                    className="inline-flex justify-center px-3 py-1 border border-red-600 shadow-sm text-sm font-medium rounded-md text-neutral-300 bg-red-900 hover:bg-red-900/50 focus:outline-none"
                                                >
                                                    <FaTrashAlt className="-ml-1 mr-2 h-5 w-5 text-neutral-400" aria-hidden="true" />
                                                    <span>Delete</span>
                                                </button>
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
    )
};

export default UserView;