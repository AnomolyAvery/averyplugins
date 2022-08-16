import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import { trpc } from "../../utils/trpc";

const VendorSettings = () => {

    const router = useRouter();

    const { data: settings } = trpc.useQuery(['vendor.getSettings']);

    const { mutateAsync: updateSettingsAsync } = trpc.useMutation(['vendor.updateSettings']);

    useEffect(() => {
        if (settings) {
            updatePaypalEmail(settings.paypalEmail);
            updateDiscordWebhook(settings.discordWebhook ? settings.discordWebhook : "");
        }

        return () => {
            updatePaypalEmail('');
        }

    }, [settings]);

    const [errors, updateErrors] = useState<{
        [key: string]: string | null;
    }>({
        paypalEmail: null,
        discordWebhook: null,
    });

    const [paypalEmail, updatePaypalEmail] = useState<string>(settings?.paypalEmail ?? '');
    const [discordWebhook, updateDiscordWebhook] = useState<string>(settings?.discordWebhook ?? '');


    const isValid = (paypalEmail: string, discordWebhook: string) => {
        const checks = {
            paypalEmail: paypalEmail.length > 0,
        };

        const errors = {
            paypalEmail: checks.paypalEmail ? null : 'Paypal email is required',
        }

        updateErrors(e => ({ ...e, ...errors }));

        return Object.values(checks).every(v => v);
    };

    const onSettingsSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isValid(paypalEmail, discordWebhook)) {
            toast.error('Please fill out all fields');
            return;
        }

        const { id } = await updateSettingsAsync({
            paypalEmail: paypalEmail,
            discordWebhook: discordWebhook,
        });

        if (id) {
            toast.success('Settings saved');
        }
        else {
            toast.error('Something went wrong');
        }
    };

    return (
        <VendorLayout>
            <div className="flex-1 xl:overflow-y-auto">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    {settings && (
                        <form onSubmit={onSettingsSave} className="mt-6 space-y-8 divide-y divide-neutral-600">
                            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
                                <div className="sm:col-span-6">
                                    <h2 className="text-xl font-medium text-blue-gray-900">Vendor Settings</h2>
                                    <p className="mt-1 text-sm text-blue-gray-500">
                                        This information will be displayed publicly so be careful what you share.
                                    </p>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="first-name" className="block text-sm font-medium text-blue-gray-900">
                                        PayPal Email
                                    </label>
                                    <input
                                        type="text"
                                        name="first-name"
                                        id="first-name"
                                        autoComplete="given-name"
                                        className="bg-neutral-900 mt-1 block w-full border-neutral-600 rounded-md shadow-sm text-white sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                                        value={paypalEmail}
                                        onChange={(e) => updatePaypalEmail(e.target.value)}
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="last-name" className="block text-sm font-medium text-blue-gray-900">
                                        Discord Webhook Url
                                    </label>
                                    <input
                                        type="text"
                                        name="last-name"
                                        id="last-name"
                                        autoComplete="family-name"
                                        className="bg-neutral-900 mt-1 block w-full border-neutral-600 rounded-md shadow-sm text-white sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                                        value={discordWebhook}
                                        onChange={(e) => updateDiscordWebhook(e.target.value)}
                                    />
                                </div>
                                <p className="text-sm text-blue-gray-500 sm:col-span-6">
                                    This account was created on{' '}
                                    <time dateTime={settings.user.joinedAt.toString()}>{
                                        settings.user.joinedAt.toLocaleString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "numeric",
                                            second: "numeric"

                                        })
                                    }</time>.
                                </p>
                            </div>

                            <div className="pt-8 flex justify-end">
                                <button
                                    onClick={() => router.back()}
                                    type="button"
                                    className="bg-neutral-900 py-2 px-4 border border-neutral-600 rounded-md shadow-sm text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700 focus:outline-none"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </VendorLayout>
    )
};

export default VendorSettings;