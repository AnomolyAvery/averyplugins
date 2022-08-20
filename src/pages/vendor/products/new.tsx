import ProductForm from "../../../components/product/ProductForm";
import ManageLayout from "../../../components/shared/ManageLayout";


const NewProduct = () => {
    return (
        <ManageLayout role="vendor">
            <div className="p-6 bg-neutral-900/50 rounded-lg">
                <ProductForm description="" name="" overview="" price={0} newProduct={true} onSaveSuccess={() => { }} />
            </div>
        </ManageLayout>
    )
};

export default NewProduct;