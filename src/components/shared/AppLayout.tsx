import React, { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { FaBars, FaBell, FaDiscord, FaTimes } from 'react-icons/fa';
import classNames from '../../utils/classNames';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';

type Props = {
    children: React.ReactNode;
}

const AppLayout: React.FC<Props> = ({
    children
}) => {
    return (
        <>
            <AppNav />
            <main className='mx-auto container max-w-7xl py-6 px-4 sm:px-6 lg:px-8'>
                {children}
            </main>
        </>
    )
}

type NextLinkProps = {
    href: string;
    children: React.ReactNode;

    [key: string]: any;
}

const NextLink: React.FC<NextLinkProps> = (props) => {
    const { href, children, ...rest } = props;

    return (
        <Link href={href}>
            <a {...rest}>{children}</a>
        </Link>
    )
};


const AppNav: React.FC = () => {

    const { data: session, status } = useSession();

    return (
        <Disclosure as="nav" className="bg-neutral-900/50 border-b border-neutral-700 shadow">
            {({ open }) => (
                <>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <NextLink href="/" className="flex-shrink-0 flex items-center">
                                    <img
                                        className="block lg:hidden h-8 w-auto"
                                        src={'https://azuriom.com/assets/svg/logo-white.svg'}
                                        alt="Workflow"
                                    />
                                    <img
                                        className="hidden lg:block h-8 w-auto"
                                        src={'https://azuriom.com/assets/svg/logo-white.svg'}
                                        alt="Workflow"
                                    />
                                </NextLink>
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                                    <NextLink href='/products' className="text-neutral-300 hover:text-neutral-100 inline-flex items-center px-1 pt-1 text-sm font-medium"
                                    >

                                        Products
                                    </NextLink>
                                    <NextLink href='/pricing' className="text-neutral-300 hover:text-neutral-100 inline-flex items-center px-1 pt-1 text-sm font-medium">
                                        Join Us
                                    </NextLink>

                                </div>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:items-center">

                                {/* Profile dropdown */}
                                {session && session.user && (
                                    <Menu as="div" className="ml-3 relative">
                                        <div>
                                            <Menu.Button className="bg-neutral-900/50 rounded-full flex text-sm">
                                                <span className="sr-only">Open user menu</span>
                                                <img
                                                    className="h-8 w-8 rounded-full"
                                                    src={session.user.image ?? '/default_user.png'}
                                                    alt=""
                                                />
                                            </Menu.Button>
                                        </div>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-200"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="z-50 origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-neutral-900 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <NextLink href="/account" className={classNames(active ? 'bg-neutral-800' : '', 'block px-4 py-2 text-sm text-neutral-300')}>
                                                            Account
                                                        </NextLink>

                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <NextLink href='/account/purchases' className={classNames(active ? 'bg-neutral-800' : '', 'block px-4 py-2 text-sm text-neutral-300')}>
                                                            Purchases
                                                        </NextLink>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <NextLink href='/signout' className={classNames(active ? 'bg-neutral-800' : '', 'block px-4 py-2 text-sm text-neutral-300')}>
                                                            Sign out
                                                        </NextLink>
                                                    )}
                                                </Menu.Item>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                )}

                                {status === "unauthenticated" && (
                                    <button onClick={() => signIn('discord')} className='inline-flex items-center gap-2 px-4 py-1 rounded-lg bg-blue-600 hover:bg-blue-800'>
                                        <FaDiscord className='h-5 w-5' /> <span className='text-base font-medium'>Login</span>
                                    </button>
                                )}
                            </div>
                            <div className="-mr-2 flex items-center sm:hidden">
                                {/* Mobile menu button */}
                                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-neutral-300 hover:text-white hover:bg-gray-neutral-800">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <FaTimes className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <FaBars className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="pt-2 pb-3 space-y-1">
                            {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
                            <Disclosure.Button
                                as={NextLink}
                                href="/"
                                className="border-transparent text-neutral-300 hover:bg-neutral-800 hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                            >
                                Home
                            </Disclosure.Button>
                            <Disclosure.Button
                                as={NextLink}
                                href="/products"
                                className="border-transparent text-neutral-300 hover:bg-neutral-800 hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                            >
                                Products
                            </Disclosure.Button>
                        </div>
                        <div className="pt-4 pb-3 border-t border-gray-200">
                            {status === "unauthenticated" && (
                                <button onClick={() => signIn('discord')} className='inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-800 rounded-lg py-2'>
                                    <FaDiscord className='w-8 h-8' />  <span className='text-lg font-medium'>Login</span>
                                </button>
                            )}
                            {session && session.user && (
                                <>
                                    <div className="flex items-center px-4">
                                        <div className="flex-shrink-0">
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={session.user.image ?? '/default_user.png'}
                                                alt=""
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-base font-medium text-white">{session.user.name}</div>
                                            <div className="text-sm font-medium text-neutral-300">{session.user.email}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-1">
                                        <Disclosure.Button
                                            as={NextLink}
                                            href="/account"
                                            className="block px-4 py-2 text-base font-medium text-neutral-300 hover:text-white hover:bg-neutral-800"
                                        >
                                            Account
                                        </Disclosure.Button>
                                        <Disclosure.Button
                                            as={NextLink}
                                            href="/account/purchases"
                                            className="block px-4 py-2 text-base font-medium text-neutral-300 hover:text-white hover:bg-neutral-800"
                                        >
                                            Purchases
                                        </Disclosure.Button>
                                        <Disclosure.Button
                                            as={NextLink}
                                            href="/signout"
                                            className="block px-4 py-2 text-base font-medium text-neutral-300 hover:text-white hover:bg-neutral-800"
                                        >
                                            Sign out
                                        </Disclosure.Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
};

export default AppLayout