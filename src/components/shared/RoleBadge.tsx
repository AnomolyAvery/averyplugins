import React from 'react'

type Prop = {
    role: string;
}

const RoleBadge: React.FC<Prop> = ({ role }) => {

    if (role === "admin") {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                Admin
            </span>
        )
    }

    if (role === "vendor") {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                Vendor
            </span>
        )
    }

    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
            Member
        </span>
    )
}

export default RoleBadge