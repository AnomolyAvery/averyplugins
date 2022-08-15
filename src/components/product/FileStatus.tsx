import React from 'react';
import type { ProductFileStatus } from "@prisma/client"

const FileStatus: React.FC<{
    status: ProductFileStatus
}> = ({ status }) => {
    if (status === "Draft") {
        return (
            <span className="inline-flex rounded-full bg-orange-100 px-2 text-xs font-semibold leading-5 text-orange-800">
                Draft
            </span>
        )
    }

    if (status === "Released") {

        return (
            <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                Released
            </span>
        )
    }

    return (
        <span className="inline-flex rounded-full bg-neutral-100 px-2 text-xs font-semibold leading-5 text-neutral-800">
            Unknown
        </span>
    )
};


export default FileStatus;