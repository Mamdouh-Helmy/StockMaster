import { useState, useEffect } from "react";
import { usePurchases } from "../context/PurchasesContext";
import { useClientSupplier } from "../context/ClientSupplierContext";
import { toast } from "sonner";
import ProductForm from "../components/ProductForm";
import SalesTable from "../components/SalesTable";
import { useInventory } from "../context/InventoryContext";

export default function Purchases() {
  const { purchases, addPurchase, deletePurchase, updatePurchase, loading } =
    usePurchases();
  const { clientsSuppliers, fetchClientsSuppliers } = useClientSupplier();
  const { inventory, fetchInventory } = useInventory(); // جلب inventory
  const [editPurchase, setEditPurchase] = useState(null);
  const [products, setProducts] = useState([
    { productName: "", quantity: "", price: "" },
  ]);
  const [supplierName, setSupplierName] = useState("");

  useEffect(() => {
    fetchClientsSuppliers();
    fetchInventory(); // جلب المخزون عند تحميل الصفحة
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

    const purchaseData = {
      products: products.map((product) => ({
        productName: product.productName,
        quantity: product.quantity,
        price: product.price,
      })),
      supplierName,
    };

    try {
      if (editPurchase) {
        await updatePurchase(editPurchase._id, purchaseData);
        toast.success("✅ تم تعديل عملية الشراء بنجاح");
        setEditPurchase(null);
      } else {
        await addPurchase(purchaseData);
        toast.success("✅ تمت إضافة عملية الشراء بنجاح");
      }
      fetchInventory();
      setProducts([{ productName: "", quantity: "", price: "" }]);
      setSupplierName("");
    } catch (error) {
      console.error("حدث خطأ:", error);
      toast.error("❌ حدث خطأ أثناء إضافة أو تعديل عملية الشراء");
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
        <h1 className="flex-1 md:text-2xl text-center">المشتريات</h1>
      </div>

      <ProductForm
        products={products}
        inventory={inventory} // تمرير inventory إلى ProductForm
        handleProductChange={handleProductChange}
        handleAddProduct={handleAddProduct}
        handleRemoveProduct={handleRemoveProduct}
        customerName={supplierName}
        setCustomerName={setSupplierName}
        loading={loading}
        onSubmit={handleSubmit}
        editMode={!!editPurchase}
        onCancelEdit={() => {
          setEditPurchase(null);
          setProducts([{ productName: "", quantity: "", price: "" }]);
        }}
        editModeText1="تعديل عملية الشراء"
        editModeText2="إضافة عملية الشراء"
        textLebalInput="اسم المورد"
        textSelcectbox2="أختر المورد"
        textButton="إضافة عملية الشراء"
        isSalesPage={false}
        clientsSuppliers={clientsSuppliers}
        TextclientsSuppliers="supplier"
        previousProducts={inventory}
      />

      {purchases && purchases.length > 0 && (
        <SalesTable
          data={purchases}
          onEdit={(purchase) => {
            setEditPurchase(purchase);
            setProducts(purchase.products);
            setSupplierName(purchase.supplierName);
          }}
          onDelete={deletePurchase}
          textName="أسم المورد"
          textTitle="الشراء"
        />
      )}
    </div>
  );
}