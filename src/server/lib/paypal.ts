import checkoutNodeSdk from '@paypal/checkout-server-sdk';
import { env as clientEnv } from '../../env/client.mjs';
import { env as serverEnv } from '../../env/server.mjs';

const configureEnvironment = () => {
    const clientId = clientEnv.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = serverEnv.PAYPAL_CLIENT_SECRET;

    return serverEnv.NODE_ENV === "production" ? new checkoutNodeSdk.core.LiveEnvironment(clientId,
        clientSecret) : new checkoutNodeSdk.core.SandboxEnvironment(clientId, clientSecret);
};

const client = function () {
    return new checkoutNodeSdk.core.PayPalHttpClient(configureEnvironment());
}

export default client;