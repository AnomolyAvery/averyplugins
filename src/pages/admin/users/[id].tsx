import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { FaBan, FaDiscord, FaIdBadge, FaIdCard, FaMailBulk, FaPhone, FaTrash, FaTrashAlt } from "react-icons/fa";
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
            </div>
        </ManageLayout>
    )
};

export default UserView;