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



    const [orderId, updateOrderId] = useState<string | null>(null);

    const { mutateAsync: createOrderAsync } = trpc.useMutation(['checkout.paypal.createOrder']);

    const { mutateAsync: captureOrderAsync } = trpc.useMutation(['checkout.paypal.captureOrder']);

    const { mutateAsync: cancelOrderAsync } = trpc.useMutation(['checkout.paypal.cancelOrder']);


    const { data: checkout, status, error, refetch } = trpc.useQuery(['checkout.getCheckout', {
        id,
    }], {
        retry: false
    });

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

                                <dl className="text-sm font-medium text-neutral-400 mt-6 space-y-6">
                                    <div className="flex justify-between">
                                        <dt>Subtotal</dt>
                                        <dd className="text-neutral-100">${(checkout?.product.price || 0) / 100}</dd>
                                    </div>
                                </dl>
                            </Disclosure.Panel>

                            <p className="flex items-center justify-between text-sm font-medium text-neutral-100 border-t border-neutral-600 pt-6 mt-6">
                                <span className="text-base">Total</span>
                                <span className="text-base">${(checkout?.total || 0) / 100}</span>
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
                    <dl className="text-sm font-medium text-neutral-300 space-y-6">
                        <div className="flex justify-between">
                            <dt>Subtotal</dt>
                            <dd className="text-neutral-100">${(checkout?.product.price || 0) / 100}</dd>
                        </div>
                        <div className="flex items-center justify-between border-t border-neutral-600 text-neutral-100 pt-6">
                            <dt>Total</dt>
                            <dd className="text-base">${(checkout?.total || 0) / 100}</dd>
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