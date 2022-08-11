import { Disclosure } from "@headlessui/react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FaLock, FaStripe } from "react-icons/fa";
import LoadingPreview from "../../components/shared/LoadingPreview";
import { env } from "../../env/client.mjs";
import { trpc } from "../../utils/trpc";


const Checkout = () => {

    const { data: session, status: authStatus } = useSession();
    const router = useRouter();

    const id = router.query.id as string;

    const { data: checkout, status, error, } = trpc.useQuery(['checkout.getCheckout', {
        id
    }], {
        retry: false,
    });

    const { mutateAsync: createOrderAsync } = trpc.useMutation(['checkout.paypal.createOrder']);

    const { mutateAsync: captureOrderAsync } = trpc.useMutation(['checkout.paypal.captureOrder']);

    const subtotal = '$108.00'
    const discount = { code: 'CHEAPSKATE', amount: '$16.00' }
    const total = '$141.92'
    const products = [
        {
            id: 1,
            name: 'Mountain Mist Artwork Tee',
            href: '#',
            price: '$36.00',
            color: 'Birch',
            size: 'L',
            imageSrc: 'https://tailwindui.com/img/ecommerce-images/checkout-form-04-product-01.jpg',
            imageAlt: 'Off-white t-shirt with circular dot illustration on the front of mountain ridges that fade.',
        },
        // More products...
    ]





    if (authStatus === "loading" || status === "loading") {
        return <LoadingPreview />;
    }

    if (authStatus === "unauthenticated") {
        signIn('discord');
        return <LoadingPreview />;
    }

    if (status === "error") {
        return (
            <div>
                <h2>
                    Error
                </h2>
                <p>
                    {error.message}
                </p>
            </div>
        )
    }

    return (


        <div className="lg:overflow-hidden lg:flex lg:flex-row-reverse">
            <section aria-labelledby="order-heading" className="bg-neutral-900/50 px-4 py-6 sm:px-6 lg:hidden">
                <Disclosure as="div" className="max-w-lg mx-auto">
                    {({ open }) => (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 id="order-heading" className="text-lg font-medium text-neutral-100">
                                    Your Order
                                </h2>
                                <Disclosure.Button className="font-medium text-blue-600 hover:text-blue-500">
                                    {open ? <span>Hide full summary</span> : <span>Show full summary</span>}
                                </Disclosure.Button>
                            </div>

                            <Disclosure.Panel>
                                <ul role="list" className="divide-y divide-neutral-600 border-b border-neutral-600">
                                    <li className="flex py-6 space-x-6">
                                        <img
                                            src={checkout?.product.icon ?? ''}
                                            alt={checkout?.product.name ?? ''}
                                            className="flex-none w-20 h-20 object-center object-cover bg-neutral-900 rounded-md"
                                        />
                                        <div className="flex flex-col justify-between space-y-4">
                                            <div className="text-sm font-medium space-y-1">
                                                <h3 className="text-neutral-100">{checkout?.product.name}</h3>
                                                <p className="text-neutral-100">${(checkout?.product.price || 0) / 100}</p>
                                            </div>
                                        </div>
                                    </li>
                                </ul>

                                <form className="mt-10">
                                    <label htmlFor="discount-code-mobile" className="block text-sm font-medium text-neutral-300">
                                        Discount code
                                    </label>
                                    <div className="flex space-x-4 mt-1">
                                        <input
                                            type="text"
                                            id="discount-code-mobile"
                                            name="discount-code-mobile"
                                            className="bg-neutral-900 block w-full border-neutral-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-neutral-600 text-sm font-medium text-neutral-300 rounded-md px-4 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </form>

                                <dl className="text-sm font-medium text-neutral-400 mt-10 space-y-6">
                                    <div className="flex justify-between">
                                        <dt>Subtotal</dt>
                                        <dd className="text-neutral-100">{subtotal}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="flex">
                                            Discount
                                            <span className="ml-2 rounded-full bg-gray-200 text-xs text-gray-600 py-0.5 px-2 tracking-wide">
                                                {discount.code}
                                            </span>
                                        </dt>
                                        <dd className="text-neutral-100">-{discount.amount}</dd>
                                    </div>
                                </dl>
                            </Disclosure.Panel>

                            <p className="flex items-center justify-between text-sm font-medium text-neutral-100 border-t border-neutral-600 pt-6 mt-6">
                                <span className="text-base">Total</span>
                                <span className="text-base">{total}</span>
                            </p>
                        </>
                    )}
                </Disclosure>
            </section>
            {/* Order summary */}
            <section aria-labelledby="summary-heading" className="hidden bg-neutral-900/50 w-full max-w-md flex-col lg:flex">
                <h2 id="summary-heading" className="sr-only">
                    Order summary
                </h2>

                <ul role="list" className="flex-auto overflow-y-auto divide-y divide-neutral-600 px-6">
                    <li className="flex py-6 space-x-6">
                        <img
                            src={checkout?.product.icon ?? ''}
                            alt={checkout?.product.name ?? ''}
                            className="flex-none w-20 h-20 object-center object-cover bg-neutral-900 rounded-md"
                        />
                        <div className="flex flex-col justify-between space-y-4">
                            <div className="text-sm font-medium space-y-1">
                                <h3 className="text-neutral-200">{checkout?.product?.name}</h3>
                                <p className="text-neutral-400">${(checkout?.product?.price || 0) / 100}</p>
                            </div>
                        </div>
                    </li>
                </ul>

                <div className="sticky bottom-0 flex-none bg-neutral-900 border-t border-neutral-600 p-6">
                    <form>
                        <label htmlFor="discount-code" className="block text-sm font-medium text-neutral-300">
                            Discount code
                        </label>
                        <div className="flex space-x-4 mt-1">
                            <input
                                type="text"
                                id="discount-code"
                                name="discount-code"
                                className="bg-neutral-900 block w-full border-neutral-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <button
                                type="submit"
                                className="bg-neutral-600 text-sm font-medium text-neutral-100 rounded-md px-4 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Apply
                            </button>
                        </div>
                    </form>

                    <dl className="text-sm font-medium text-neutral-300 mt-10 space-y-6">
                        <div className="flex justify-between">
                            <dt>Subtotal</dt>
                            <dd className="text-neutral-100">{subtotal}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="flex">
                                Discount
                                <span className="ml-2 rounded-full bg-gray-200 text-xs text-gray-600 py-0.5 px-2 tracking-wide">
                                    {discount.code}
                                </span>
                            </dt>
                            <dd className="text-neutral-100">-{discount.amount}</dd>
                        </div>
                        <div className="flex items-center justify-between border-t border-neutral-600 text-neutral-100 pt-6">
                            <dt>Total</dt>
                            <dd className="text-base">{total}</dd>
                        </div>
                    </dl>
                </div>
            </section>

            {/* Checkout form */}
            <section
                aria-labelledby="payment-heading"
                className="flex-auto overflow-y-auto px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:px-8 lg:pt-0 lg:pb-24"
            >
                <h2 id="payment-heading" className="sr-only">
                    Payment and shipping details
                </h2>

                <div className="max-w-lg mx-auto lg:pt-16">
                    <button
                        type="button"
                        className="w-full flex items-center justify-center bg-black border border-transparent text-white rounded-md py-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                    >
                        <span className="sr-only">Pay with Apple Pay</span>
                        <svg className="h-5 w-auto" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 20">
                            <path d="M9.536 2.579c-.571.675-1.485 1.208-2.4 1.132-.113-.914.334-1.884.858-2.484C8.565.533 9.564.038 10.374 0c.095.951-.276 1.884-.838 2.579zm.829 1.313c-1.324-.077-2.457.751-3.085.751-.638 0-1.6-.713-2.647-.694-1.362.019-2.628.79-3.323 2.017-1.429 2.455-.372 6.09 1.009 8.087.676.99 1.485 2.075 2.552 2.036 1.009-.038 1.409-.656 2.628-.656 1.228 0 1.58.656 2.647.637 1.104-.019 1.8-.99 2.475-1.979.771-1.122 1.086-2.217 1.105-2.274-.02-.019-2.133-.828-2.152-3.263-.02-2.036 1.666-3.007 1.742-3.064-.952-1.408-2.437-1.56-2.951-1.598zm7.645-2.76v14.834h2.305v-5.072h3.19c2.913 0 4.96-1.998 4.96-4.89 0-2.893-2.01-4.872-4.885-4.872h-5.57zm2.305 1.941h2.656c2 0 3.142 1.066 3.142 2.94 0 1.875-1.142 2.95-3.151 2.95h-2.647v-5.89zM32.673 16.08c1.448 0 2.79-.733 3.4-1.893h.047v1.779h2.133V8.582c0-2.14-1.714-3.52-4.351-3.52-2.447 0-4.256 1.399-4.323 3.32h2.076c.171-.913 1.018-1.512 2.18-1.512 1.41 0 2.2.656 2.2 1.865v.818l-2.876.171c-2.675.162-4.123 1.256-4.123 3.159 0 1.922 1.495 3.197 3.637 3.197zm.62-1.76c-1.229 0-2.01-.59-2.01-1.494 0-.933.752-1.475 2.19-1.56l2.562-.162v.837c0 1.39-1.181 2.379-2.743 2.379zM41.1 20c2.247 0 3.304-.856 4.227-3.454l4.047-11.341h-2.342l-2.714 8.763h-.047l-2.714-8.763h-2.409l3.904 10.799-.21.656c-.352 1.114-.923 1.542-1.942 1.542-.18 0-.533-.02-.676-.038v1.779c.133.038.705.057.876.057z" />
                        </svg>
                    </button>

                    <PayPalScriptProvider options={{
                        "client-id": env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                    }}>

                        <PayPalButtons
                            style={{
                                color: 'gold',
                                shape: 'rect',
                                label: 'pay',
                                height: 50,
                            }}
                            fundingSource={"paypal"}
                            createOrder={async (data, actions) => {
                                const order = await createOrderAsync({
                                    productId: id,
                                });

                                return order.orderID;
                            }}
                            onApprove={async (data, actions) => {
                                await captureOrderAsync({
                                    orderID: data.orderID
                                });

                                router.push('/products/[id]', `/products/${id}`);
                            }}

                        />
                    </PayPalScriptProvider>
                </div>
            </section>
        </div>
    )
};

export default Checkout;