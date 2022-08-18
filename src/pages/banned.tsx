import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import LoadingPreview from "../components/shared/LoadingPreview";

const Banned = () => {

    const router = useRouter();

    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/');
        },
    });

    if (status === "loading") {
        return <LoadingPreview />;
    }

    if (session.user?.role !== "banned") {
        router.push('/');
        return <LoadingPreview />;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-neutral-900 shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-neutral-200">Account Banned</h3>
                    <div className="mt-2 max-w-xl text-sm text-neutral-400">
                        <p>You account has been banned by an Administrator.</p>
                    </div>
                    <div className="mt-5">
                        <button
                            onClick={() => signOut()}
                            type="button"
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Banned;