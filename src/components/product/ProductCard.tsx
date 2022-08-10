import Link from 'next/link'
import React from 'react'
import { IoShieldCheckmarkSharp } from 'react-icons/io5';

type Props = {
    id: string;
    icon: string;
    name: string;
    price: number;
    overview: string;
    owner: {
        name: string;
        image: string;
        verified: boolean;
    }
}

const ProductCard: React.FC<Props> = ({ id, icon, name, price, overview, owner }) => {
    return (
        <Link href={`/products/${id}`}>
            <a className='bg-neutral-900 overflow-hidden hover:bg-neutral-900/50 p-4 rounded-lg flex flex-col gap-4'>
                <div className='flex gap-4'>
                    <img src={icon} className="w-12 h-12" />
                    <div className='flex-grow flex flex-wrap justify-between gap-4'>
                        <div
                        >
                            <h1 className='text-lg font-extrabold tracking-tight text-neutral-200'>{name}</h1>
                            <p className='text-sm text-neutral-300'>${price / 100}</p>
                        </div>
                        <div className='hidden md:flex flex-wrap items-center'>
                            <span className='inline-block relative'>
                                <img
                                    src={owner.image}
                                    className="w-12 h-12 rounded-full"
                                />
                                <span className="">
                                    {owner.verified && <IoShieldCheckmarkSharp className='absolute bottom-0 right-0 block h-3 w-3 rounded-full text-sky-500' />}
                                </span>

                            </span>

                        </div>
                    </div>
                </div>
                <div>
                    <p className='text-sm text-neutral-300'>
                        {overview}
                    </p>
                </div>
            </a>
        </Link>

    )
}

export default ProductCard