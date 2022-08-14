import { Disclosure } from "@headlessui/react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
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

    const [orderId, updateOrderId] = useState<string | null>(null);

    const { mutateAsync: createOrderAsync } = trpc.useMutation(['checkout.paypal.createOrder']);

    const { mutateAsync: captureOrderAsync } = trpc.useMutation(['checkout.paypal.captureOrder']);

    const { mutateAsync: cancelOrderAsync } = trpc.useMutation(['checkout.paypal.cancelOrder']);

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

                    {checkout?.product && (
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

                                    updateOrderId(order.orderID);
                                    return order.orderID;
                                }}
                                onApprove={async (data, actions) => {
                                    await captureOrderAsync({
                                        orderID: data.orderID
                                    });

                                    router.push('/products/[id]', `/products/${id}`);
                                }}
                                onCancel={async (data, actions) => {
                                    if (orderId) {
                                        await cancelOrderAsync({
                                            orderID: orderId
                                        });
                                    }
                                }}
                                onError={async (err) => {
                                    if (orderId) {
                                        await cancelOrderAsync({
                                            orderID: orderId
                                        });
                                    }
                                }}

                            />
                        </PayPalScriptProvider>
                    )}
                </div>
            </section>
        </div>
    )
};

export default Checkout;