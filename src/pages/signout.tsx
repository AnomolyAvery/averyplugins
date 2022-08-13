import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React from 'react'
import LoadingPreview from '../components/shared/LoadingPreview';

const Signout = () => {

    const { status } = useSession();

    const router = useRouter();

    if (status === "loading") {
        return <LoadingPreview />;
    }

    if (status === "unauthenticated") {
        router.push('/');
        return <LoadingPreview />;
    }

    return (
        <div className='mx-auto container max-w-lg'>
            <div className='p-6 bg-neutral-900/50'>
                <h1 className='text-2xl font-bold text-center leading-6 mb-4'>
                    Signout
                </h1>
                <p className='font-medium text-center mb-6'>
                    Are you sure you want to sign out?
                </p>
                <button className='w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-600 font-medium px-4 py-2 rounded-md' onClick={() => signOut()}>
                    Sign out
                </button>
            </div>
        </div>
    )
}

export default Signout;