import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import ProductForm from "../../../../components/product/ProductForm";
import VendorLayout from "../../../../components/vendor/VendorLayout";
import { trpc } from "../../../../utils/trpc";

const VendorProduct = () => {

    const router = useRouter();

    const id = router.query.id as string;

    const { data: product, status } = trpc.useQuery(['vendor.getProduct', {
        id,
    }]);
    return (
        <VendorLayout>
            {product && (
                <ProductForm
                    name={product.name}
                    price={(product.price / 100)}
                    overview={product.overview}
                    description={product.description}
                    newProduct={false}
                    id={product.id}
                    icon={product.icon ?? undefined}
                />
            )}

        </VendorLayout>
    )
};

export default VendorProduct;