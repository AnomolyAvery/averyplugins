import { useRouter } from "next/router";
import VendorLayout from "../../components/vendor/VendorLayout";

const VendorSettings = () => {

    const router = useRouter();

    return (
        <VendorLayout>
            <div className="flex-1 xl:overflow-y-auto">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <form className="mt-6 space-y-8 divide-y divide-y-blue-gray-200">
                        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
                            <div className="sm:col-span-6">
                                <h2 className="text-xl font-medium text-blue-gray-900">Vendor Settings</h2>
                                <p className="mt-1 text-sm text-blue-gray-500">
                                    This information will be displayed publicly so be careful what you share.
                                </p>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="first-name" className="block text-sm font-medium text-blue-gray-900">
                                    PayPal Client Id
                                </label>
                                <input
                                    type="text"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="given-name"
                                    className="bg-neutral-900 mt-1 block w-full border-neutral-600 rounded-md shadow-sm text-white sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="last-name" className="block text-sm font-medium text-blue-gray-900">
                                    PayPal Secret
                                </label>
                                <input
                                    type="text"
                                    name="last-name"
                                    id="last-name"
                                    autoComplete="family-name"
                                    className="bg-neutral-900 mt-1 block w-full border-neutral-600 rounded-md shadow-sm text-white sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="pt-8 grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
                            <div className="sm:col-span-6">
                                <h2 className="text-xl font-medium text-blue-gray-900">Personal Information</h2>
                                <p className="mt-1 text-sm text-blue-gray-500">
                                    This information will be displayed publicly so be careful what you share.
                                </p>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="email-address" className="block text-sm font-medium text-blue-gray-900">
                                    Email address
                                </label>
                                <input
                                    type="text"
                                    name="email-address"
                                    id="email-address"
                                    autoComplete="email"
                                    className="mt-1 block w-full border-blue-gray-300 rounded-md shadow-sm text-blue-gray-900 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="phone-number" className="block text-sm font-medium text-blue-gray-900">
                                    Phone number
                                </label>
                                <input
                                    type="text"
                                    name="phone-number"
                                    id="phone-number"
                                    autoComplete="tel"
                                    className="mt-1 block w-full border-blue-gray-300 rounded-md shadow-sm text-blue-gray-900 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="country" className="block text-sm font-medium text-blue-gray-900">
                                    Country
                                </label>
                                <select
                                    id="country"
                                    name="country"
                                    autoComplete="country-name"
                                    className="mt-1 block w-full border-blue-gray-300 rounded-md shadow-sm text-blue-gray-900 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option />
                                    <option>United States</option>
                                    <option>Canada</option>
                                    <option>Mexico</option>
                                </select>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="language" className="block text-sm font-medium text-blue-gray-900">
                                    Language
                                </label>
                                <input
                                    type="text"
                                    name="language"
                                    id="language"
                                    className="mt-1 block w-full border-blue-gray-300 rounded-md shadow-sm text-blue-gray-900 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <p className="text-sm text-blue-gray-500 sm:col-span-6">
                                This account was created on{' '}
                                <time dateTime="2017-01-05T20:35:40">January 5, 2017, 8:35:40 PM</time>.
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
                </div>
            </div>
        </VendorLayout>
    )
};

export default VendorSettings;