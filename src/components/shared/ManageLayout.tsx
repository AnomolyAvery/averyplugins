import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react'
import classNames from '../../utils/classNames';
import LoadingPreview from './LoadingPreview';

type Props = {
    children: React.ReactNode;
    role: 'admin' | 'vendor';
}

const ManageLayout: React.FC<Props> = ({ children, role }) => {

    const adminTabs = [
        { name: 'Users', href: `/admin/users`, current: false },
        { name: 'Products', href: `/admin/products`, current: false },
        { name: 'Purchases', href: `/admin/purchases`, current: false },
        { name: 'Settings', href: `/admin/settings`, current: false },
    ];

    const vendorTabs = [
        { name: 'Dashboard', href: `/vendor`, current: true },
        { name: 'Products', href: `/vendor/products`, current: false },
        { name: 'Purchases', href: `/vendor/purchases`, current: false },
        { name: 'Settings', href: `/vendor/settings`, current: false },
    ];

    const router = useRouter();

    const isRouteActive = (route: string) => {
        return router.pathname === route;
    }

    const { data: session, status: authStatus } = useSession();


    if (authStatus === "loading") {
        return <LoadingPreview />;
    }

    if (authStatus === "unauthenticated") {
        signIn('discord');
        return <LoadingPreview />
    }

    if (session?.user?.role !== role) {
        router.push('/account');
        return <LoadingPreview />;
    }


    return (
        <div>
            <div>
                <div className="sm:hidden">
                    <label htmlFor="tabs" className="sr-only">
                        Select a tab
                    </label>
                    {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
                    <select
                        id="tabs"
                        name="tabs"
                        className="bg-neutral-900 block w-full focus:ring-blue-600 focus:border-blue-600 border-neutral-600 rounded-md"
                        defaultValue={role === "admin" ? adminTabs.find((tab) => isRouteActive(tab.href))?.href : vendorTabs.find((tab) => isRouteActive(tab.href))?.href}
                        onChange={(e) => router.push(e.target.value)}
                    >
                        {role === "admin" ? adminTabs.map((tab) => (
                            <option key={tab.name} value={tab.href}>{tab.name}</option>
                        )) : vendorTabs.map((tab) => (
                            <option key={tab.name} value={tab.href}>{tab.name}</option>
                        ))}
                    </select>
                </div>
                <div className="hidden sm:block">
                    <nav className="relative z-0 rounded-lg shadow flex divide-x divide-neutral-600" aria-label="Tabs">
                        {role === "admin" ? adminTabs.map((tab, tabIdx) => (
                            <Link
                                key={tab.name}
                                href={tab.href}
                            >
                                <a
                                    className={classNames(
                                        isRouteActive(tab.href) ? 'text-neutral-200' : 'text-neutral-400 hover:text-neutral-200',
                                        tabIdx === 0 ? 'rounded-l-lg' : '',
                                        tabIdx === adminTabs.length - 1 ? 'rounded-r-lg' : '',
                                        'group relative min-w-0 flex-1 overflow-hidden bg-neutral-900/50 py-4 px-4 text-sm font-medium text-center hover:bg-neutral-900 focus:z-10'
                                    )}
                                    aria-current={isRouteActive(tab.href) ? 'page' : undefined}
                                >
                                    <span>{tab.name}</span>
                                    <span
                                        aria-hidden="true"
                                        className={classNames(
                                            isRouteActive(tab.href) ? 'bg-blue-600' : 'bg-transparent',
                                            'absolute inset-x-0 bottom-0 h-0.5'
                                        )}
                                    />
                                </a>
                            </Link>
                        )) : vendorTabs.map((tab, tabIdx) => (
                            <Link
                                key={tab.name}
                                href={tab.href}
                            >
                                <a
                                    className={classNames(
                                        isRouteActive(tab.href) ? 'text-neutral-200' : 'text-neutral-400 hover:text-neutral-200',
                                        tabIdx === 0 ? 'rounded-l-lg' : '',
                                        tabIdx === vendorTabs.length - 1 ? 'rounded-r-lg' : '',
                                        'group relative min-w-0 flex-1 overflow-hidden bg-neutral-900/50 py-4 px-4 text-sm font-medium text-center hover:bg-neutral-900 focus:z-10'
                                    )}
                                    aria-current={isRouteActive(tab.href) ? 'page' : undefined}
                                >
                                    <span>{tab.name}</span>
                                    <span
                                        aria-hidden="true"
                                        className={classNames(
                                            isRouteActive(tab.href) ? 'bg-blue-600' : 'bg-transparent',
                                            'absolute inset-x-0 bottom-0 h-0.5'
                                        )}
                                    />
                                </a>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            <div className='py-4'>
                {children}
            </div>
        </div>
    )
}

export default ManageLayout;