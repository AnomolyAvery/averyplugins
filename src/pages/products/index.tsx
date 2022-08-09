import { NextPage } from "next";
import ProductCard from "../../components/product/ProductCard";

const Products: NextPage = () => {

    const products = [];

    return (
        <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <ProductCard
                    id="1"
                    icon="https://unturnedstore.com/api/images/1291"
                    name="Rust Server"
                    price={100}
                    overview="Rust is a multi-platform, open-source, compiled, stack-based, systems programming language. It is a member of the Rust programming language family, and is the current stable release of the Rust programming language."
                    owner={{
                        name: "Rust",
                        image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
                    }}

                />
            </div>
        </>
    )
};

export default Products;