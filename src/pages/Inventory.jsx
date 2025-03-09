import React, { useState, useEffect } from "react";
import { useInventory } from "../context/InventoryContext";
import { toast } from "sonner";
import ProductFormInventory from "../components/ProductFormInventory";
import InventoryTable from "../components/InventoryTable";

export default function Inventory() {
  const { inventory, addProduct, deleteProduct, updateProduct, loading, fetchInventory } = useInventory();
  const [editProduct, setEditProduct] = useState(null);
  const [products, setProducts] = useState([
    { productName: "", quantity: "", price: "" },
  ]);

  useEffect(() => {
    fetchInventory(); 
  }, []); 

  const handleAddProduct = () => {
    setProducts((prevProducts) => [
      ...prevProducts,
      { productName: "", quantity: "", price: "" },
    ]);
  };

  const handleProductChange = (index, field, value) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index][field] = value;
      return updatedProducts;
    });
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editProduct) {
        await updateProduct(editProduct._id, products[0]); 
        setEditProduct(null);
      } else {
        await Promise.all(products.map((product) => addProduct(product))); 
      }
      setProducts([{ productName: "", quantity: "", price: "" }]);
    } catch (error) {
      console.error("حدث خطأ:", error);
      toast.error("❌ حدث خطأ أثناء إضافة أو تحديث المنتج");
    }
  };

  return (
    <div className="bg-background p-4">
      <div className="flex items-center flex-wrap gap-2 md:justify-between">
        <button
          type="button"
          onClick={handleAddProduct}
          className="p-2 block bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          أضافه صنف اخر +
        </button>
        <h1 className="flex-1 md:text-2xl text-center">المخزون</h1>
      </div>

      <ProductFormInventory
        products={products}
        handleProductChange={handleProductChange}
        handleAddProduct={handleAddProduct}
        handleRemoveProduct={handleRemoveProduct}
        loading={loading}
        onSubmit={handleSubmit}
        editMode={!!editProduct}
        onCancelEdit={() => {
          setEditProduct(null);
          setProducts([{ productName: "", quantity: "", price: "" }]);
        }}
        editModeText1="تعديل المنتج"
        editModeText2="إضافة منتج جديد للمخزون"
        textButton="إضافة منتج"
        productNameOptions={inventory}
      />

      {inventory && inventory.length > 0 && (
        <InventoryTable
          data={inventory}
          onEdit={(product) => {
            setEditProduct(product);
            setProducts([{
              productName: product.productName,
              quantity: product.quantity,
              price: product.price,
            }]);
          }}
          onDelete={deleteProduct}
        />
      )}
    </div>
  );
}