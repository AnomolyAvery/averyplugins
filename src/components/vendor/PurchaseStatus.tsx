import React from 'react'
import type { PurchaseStatus as PStatus } from '@prisma/client';

type Props = {
    status: PStatus;
}

const PurchaseStatus: React.FC<Props> = ({ status }) => {

    if (status === "Paid") {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                Paid
            </span>
        )
    }

    if (status === "Pending") {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-orange-100 text-orange-800">
                Pending
            </span>
        )
    }

    if (status === "Cancelled") {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                Cancelled
            </span>
        )
    }

    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-neutral-100 text-neutral-800">
            Unknown
        </span>
    )
}

export default PurchaseStatus