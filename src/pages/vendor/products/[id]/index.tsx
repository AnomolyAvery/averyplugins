import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import ProductForm from "../../../../components/product/ProductForm";
import ProductGallery from "../../../../components/product/ProductGallery";
import ManageLayout from "../../../../components/shared/ManageLayout";
import { trpc } from "../../../../utils/trpc";

const VendorProduct = () => {

    const router = useRouter();
    const { status: authStatus, data } = useSession();

    const id = router.query.id as string;

    const { data: product, status, refetch } = trpc.useQuery(['vendor.products.get', {
        id,
    }], {
        enabled: authStatus === "authenticated" && data.user?.role === "vendor"
    });



    return (
        <ManageLayout role="vendor">
            {product && (
                <>
                    <ProductForm
                        name={product.name}
                        price={(product.price / 100)}
                        overview={product.overview}
                        description={product.description}
                        newProduct={false}
                        id={product.id}
                        icon={product.icon ?? undefined}
                        status={product.status ?? undefined}
                        onSaveSuccess={() => refetch()}
                    />
                </>
            )}


        </ManageLayout>
    )
};

export default VendorProduct;