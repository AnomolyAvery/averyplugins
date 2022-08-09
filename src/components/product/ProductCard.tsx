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
    }
}

const ProductCard: React.FC<Props> = ({ id, icon, name, price, overview, owner }) => {
    return (
        <Link href={`/products/${id}`}>
            <a className='group inline-flex justify-start gap-4 bg-neutral-900 hover:bg-neutral-900/50 p-4 rounded-lg'>
                <img className='w-20 h-20 group-hover:opacity-75' src={icon} alt={name} />
                <div>
                    <div className='flex flex-wrap justify-between items-center mb-4 lg:mb-0'>
                        <h2 className='text-lg font-semibold'>
                            {name}
                        </h2>
                        <div className='inline-flex items-center gap-2'>
                            <img className='w-8 h-8 rounded-full' src={owner.image} />
                            <h2 className='text-base'>
                                {owner.name} <IoShieldCheckmarkSharp className='inline-block text-sky-500' />
                            </h2>
                        </div>
                    </div>
                    <p
                        className='text-base font-medium text-neutral-300 mb-1'
                    >
                        $<span>{(price / 100)}</span>
                    </p>
                    <p className='text-sm text-neutral-300 '>
                        {overview.length > 100 ? overview.substring(0, 100) + '...' : overview}
                    </p>

                </div>
            </a>
        </Link>
    )
}

export default ProductCard