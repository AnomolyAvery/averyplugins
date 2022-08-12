import ProductForm from "../../../components/product/ProductForm";
import VendorLayout from "../../../components/vendor/VendorLayout";


const NewProduct = () => {
    return (
        <VendorLayout>
            <div className="p-6 bg-neutral-900/50 rounded-lg">
                <ProductForm newProduct={true} />
            </div>
        </VendorLayout>
    )
};

export default NewProduct;