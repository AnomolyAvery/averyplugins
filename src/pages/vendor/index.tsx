import VendorLayout from "../../components/vendor/VendorLayout";

const Vendor = () => {
    return (
        <VendorLayout>
            <div>
                <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="px-4 py-5 bg-neutral-900/50 shadow rounded-lg overflow-hidden sm:p-6">
                        <dt className="text-sm font-medium text-neutral-300 truncate">Products</dt>
                        <dd className="mt-1 text-3xl font-semibold text-neutral-100">{0}</dd>
                    </div>
                    <div className="px-4 py-5 bg-neutral-900/50 shadow rounded-lg overflow-hidden sm:p-6">
                        <dt className="text-sm font-medium text-neutral-300 truncate">Customers</dt>
                        <dd className="mt-1 text-3xl font-semibold text-neutral-100">{0}</dd>
                    </div>
                    <div className="px-4 py-5 bg-neutral-900/50 shadow rounded-lg overflow-hidden sm:p-6">
                        <dt className="text-sm font-medium text-neutral-300 truncate">Open Tickets</dt>
                        <dd className="mt-1 text-3xl font-semibold text-neutral-100">{0}</dd>
                    </div>
                </dl>
            </div>
        </VendorLayout>
    )
};

export default Vendor;