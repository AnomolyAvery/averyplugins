import { NextPage } from "next";
import { NextSeo } from "next-seo";
import ProductCard from "../../components/product/ProductCard";
import LoadingPreview from "../../components/shared/LoadingPreview";
import { trpc } from "../../utils/trpc";

const Products: NextPage = () => {

    const { status, data: products, fetchNextPage, hasNextPage, isFetchingNextPage } = trpc.useInfiniteQuery(['products.getProducts', {
        limit: 12,
    }], {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    if (status === "loading") {
        return <LoadingPreview />;
    }

    return (
        <>
            <NextSeo
                title='Products | Plugins'
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products?.pages?.map(page => (
                    <>
                        {page.products.map(product => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={product.price}
                                icon={product.icon ?? ''}
                                overview={product.overview}
                                owner={{
                                    name: product.owner.name ?? '',
                                    image: product.owner.image ?? '',
                                    verified: product.owner.verified,
                                }}
                            />
                        ))}
                    </>
                ))}
            </div>
            <div className="mt-4">
                <button
                    className="disabled:text-sm"
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}
                >
                    {isFetchingNextPage
                        ? 'Loading more...'
                        : hasNextPage
                            ? 'Load More'
                            : 'Nothing more to load'}
                </button>
            </div>
        </>
    )
};

export default Products;