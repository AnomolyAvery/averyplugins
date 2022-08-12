import React from 'react'
import type { ProductStatus } from '@prisma/client';

export const StatusBadge: React.FC<{
    status: ProductStatus;
}> = ({ status }) => {

    if (status === "Draft") {
        return (
            <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                Draft
            </span>
        )
    }

    if (status === "Published") {
        return (
            <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                Published
            </span>
        )
    }

    if (status === "UnderReview") {
        return (
            <span className="inline-flex rounded-full bg-orange-100 px-2 text-xs font-semibold leading-5 text-orange-800">
                Under Review
            </span>
        )
    }

    return (
        <span className="inline-flex rounded-full bg-neutral-100 px-2 text-xs font-semibold leading-5 text-neutral-800">
            Unknown
        </span>
    )
}
