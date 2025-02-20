import { useState, useEffect } from "react";
import { useSales } from "../context/SalesContext";
import { useInventory } from "../context/InventoryContext";
import { useClientSupplier } from "../context/ClientSupplierContext"; 
import { toast } from "sonner";
import ProductForm from "../components/ProductForm";
import SalesTable from "../components/SalesTable";

export default function Sales() {
  const { sales, addSale, deleteSale, updateSale, loading } = useSales();
  const { inventory, fetchInventory } = useInventory();
  const { clientsSuppliers, fetchClientsSuppliers } = useClientSupplier(); 
  const [editSale, setEditSale] = useState(null);
  const [products, setProducts] = useState([{ productId: "", quantity: "", price: "" }]);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    fetchClientsSuppliers(); 
  }, []);

  const handleAddProduct = () => {
    setProducts((prevProducts) => [
      ...prevProducts,
      { productId: "", quantity: "", price: "" },
    ]);
  };

  const handleProductChange = (index, field, value) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index][field] = value;

      if (field === "productId") {
        const selectedProduct = inventory.find((item) => item._id === value);
        if (selectedProduct) {
          updatedProducts[index].price = selectedProduct.price;
          updatedProducts[index].productName = selectedProduct.productName;
        }
      }

      return updatedProducts;
    });
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const saleData = {
      products: products.map((product) => ({
        productId: product.productId,
        productName: product.productName || inventory.find((item) => item._id === product.productId)?.productName || "",
        quantity: product.quantity,
        price: product.price,
      })),
      customerName,
    };
  
    try {
      if (editSale) {
        await updateSale(editSale._id, saleData);
        toast.success("✅ تم تعديل عملية البيع بنجاح");
        setEditSale(null);
      } else {
        await addSale(saleData);
        toast.success("✅ تمت إضافة عملية البيع بنجاح");
      }
  
      setProducts([{ productId: "", quantity: "", price: "" }]);
      setCustomerName("");
  
      fetchInventory();
    } catch (error) {
      console.error("حدث خطأ:", error);
    }
  };

  return (
    <div className="bg-background p-4">
      <>
        <div className="flex items-center flex-wrap gap-2 md:justify-between">
          <button
            type="button"
            onClick={handleAddProduct}
            className="p-2 block bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            أضافه صنف اخر +
          </button>
          <h1 className="flex-1 md:text-2xl text-center">المبيعات</h1>
        </div>
        {
          inventory.length === 0 && !editSale ? (
            <>
              <div className="flex items-center justify-center h-64">
                <p className="text-xl text-red-500">⚠️ المخزون فارغ، يرجى إضافة منتجات أولاً</p>
              </div>
            </>
          ) : (
            <ProductForm
              products={products}
              inventory={inventory}
              handleProductChange={handleProductChange}
              handleAddProduct={handleAddProduct}
              handleRemoveProduct={handleRemoveProduct}
              customerName={customerName}
              setCustomerName={setCustomerName}
              loading={loading}
              onSubmit={handleSubmit}
              editMode={!!editSale}
              onCancelEdit={() => {
                setEditSale(null);
                setProducts([{ productId: "", quantity: "", price: "" }]);
              }}
              editModeText1="تعديل عملية بيع"
              editModeText2="إضافة عملية بيع"
              textLebalInput="اسم العميل"
              textSelcectbox2='أختر العميل'
              textButton="إضافة عملية بيع"
              isSalesPage={true}
              clientsSuppliers={clientsSuppliers}
              TextclientsSuppliers="client" 
            />
          )
        }
        {sales && sales.length > 0 && (
          <SalesTable
            data={sales}
            onEdit={(sale) => {
              setEditSale(sale);
              setProducts(
                sale.products.map(product => ({
                  productId: product.productId,
                  productName: product.productName,
                  quantity: product.quantity,
                  price: product.price,
                }))
              );
              setCustomerName(sale.customerName);
            }}
            onDelete={deleteSale}
            textName="أسم العميل"
            textTitle="البيع"
          />
        )}
      </>
    </div>
  );
}