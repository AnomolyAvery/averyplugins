import Link from "next/link";
import { Fragment } from "react";
import LoadingPreview from "../../../components/shared/LoadingPreview";
import ManageLayout from "../../../components/shared/ManageLayout";
import RoleBadge from "../../../components/shared/RoleBadge";
import { trpc } from "../../../utils/trpc";

const AdminDashboard = () => {

    const { data: users, status, isFetching, isFetchingNextPage, hasNextPage } = trpc.useInfiniteQuery(['admin.users.getAll', {
        limit: 20,
    }], {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    if (status === "loading") {
        return <LoadingPreview />;
    }

    return (
        <ManageLayout role="admin">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {users?.pages?.map((group, i) => (
                    <Fragment key={`users-page-${i}`}>
                        {group.users.map((user) => (
                            <a
                                key={user.id}
                                className="relative rounded-lg border hover:border-neutral-600 bg-neutral-900/50 px-6 py-5 shadow-sm flex items-center space-x-3 border-neutral-800"
                            >
                                <div className="flex-shrink-0">
                                    <img className="h-10 w-10 rounded-full" src={user.image ?? ''} alt="" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/admin/users/${user.id}`}>
                                        <a className="focus:outline-none">
                                            <span className="absolute inset-0" aria-hidden="true" />
                                            <p className="text-sm font-medium text-neutral-200">{user.name}</p>
                                            <p className="text-sm text-neutral-400 truncate">
                                                <RoleBadge role={user.role} />
                                            </p>
                                            <p className="mt-2 text-sm text-neutral-400 truncate">
                                                Joined At: <span>
                                                    {new Date(user.joinedAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                    })}
                                                </span>
                                            </p>
                                        </a>
                                    </Link>
                                </div>
                            </a>
                        ))}
                    </Fragment>
                ))}
            </div>
        </ManageLayout>
    )
};

export default AdminDashboard;