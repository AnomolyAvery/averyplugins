import { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import LoadingPreview from "../../components/shared/LoadingPreview";
import RoleBadge from "../../components/shared/RoleBadge";

const Account: NextPage = () => {

    const { status, data: session } = useSession();

    const [timeOfDay, updateTimeOfDay] = useState<
        "morning" | "afternoon" | "evening" | "night"
    >('morning');

    useEffect(() => {
        const now = new Date();
        const hour = now.getHours();

        const morning = hour >= 6 && hour < 12;
        const afternoon = hour >= 12 && hour < 18;
        const evening = hour >= 18 && hour < 24;

        if (morning) {
            updateTimeOfDay('morning');
            return;
        }

        if (afternoon) {
            updateTimeOfDay('afternoon');
            return;
        }

        if (evening) {
            updateTimeOfDay('evening');
            return;
        }

    }, []);


    if (status === "loading") {
        return <LoadingPreview />;
    }



    if (status === "unauthenticated") {
        signIn('discord');
        return <LoadingPreview />
    }


    return (
        <>
            <div className="rounded-lg overflow-hidden shadow">
                <h2 className="sr-only" id="profile-overview-title">
                    Profile Overview
                </h2>
                <div className="bg-neutral-900/50 p-6">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="sm:flex sm:space-x-5">
                            <div className="flex-shrink-0">
                                <img className="mx-auto h-20 w-20 rounded-full" src={session?.user?.image ?? '/default_user.png'} alt="" />
                            </div>
                            <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                                <p className="text-sm font-medium text-neutral-300">Good {timeOfDay},</p>
                                <p className="text-xl font-bold text-neutral-100 sm:text-2xl">{session?.user?.name}</p>
                                <p className="text-sm font-medium text-neutral-300">
                                    <RoleBadge role={session?.user?.role ?? 'User'} />
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 flex justify-center sm:mt-0">
                            <button
                                onClick={() => signOut()}
                                className="flex justify-center items-center px-4 py-2 border border-neutral-600 shadow-sm text-sm font-medium rounded-md text-neutral-300 bg-neutral-900 hover:bg-neutral-800"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default Account;