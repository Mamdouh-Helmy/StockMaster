import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const InventoryContext = createContext();
export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const API_URL = "https://smartstock-production.up.railway.app/api/inventory";

    // جلب جميع المنتجات في المخزون
    const fetchInventory = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventory(response.data);
      } catch (err) {
        setError("حدث خطأ أثناء جلب بيانات المخزون");
      } finally {
        setLoading(false);
      }
    };
  
    // إضافة منتج جديد إلى المخزون
    const addProduct = async (productData) => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${API_URL}/addProduct`, productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        setInventory((prevInventory) => {
          const existingIndex = prevInventory.findIndex(
            (item) => item.productName === response.data.product.productName
          );
  
          if (existingIndex !== -1) {
            const updatedInventory = [...prevInventory];
            updatedInventory[existingIndex] = response.data.product;
            return updatedInventory;
          } else {
            return [...prevInventory, response.data.product];
          }
        });
    
        toast.success("✅ تم إضافة أو تحديث المنتج بنجاح");
      } catch (err) {
        toast.error("❌ حدث خطأ أثناء إضافة المنتج");
        setError("حدث خطأ أثناء إضافة المنتج");
      } finally {
        setLoading(false);
      }
    };
    
    // تحديث كمية المنتج
    const updateProduct = async (id, prodects) => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await axios.put(`${API_URL}/updateProduct/${id}`, prodects, {
          headers: { Authorization: `Bearer ${token}` },
        });      
        setInventory((prevInventory) =>
          prevInventory.map((item) => (item._id === id ? response.data.product : item))
        );
        toast.success("✅ تم تحديث المنتج بنجاح");
      } catch (err) {
        toast.error("❌ حدث خطأ أثناء تحديث المنتج");
        setError("حدث خطأ أثناء تحديث المنتج");
      } finally {
        setLoading(false);
      }
    };
  
    // حذف منتج من المخزون
    const deleteProduct = async (id) => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      setError(null);
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventory((prevInventory) => prevInventory.filter((item) => item._id !== id));
        toast.success("🗑️ تم حذف المنتج بنجاح");
      } catch (err) {
        toast.error("❌ حدث خطأ أثناء حذف المنتج");
        setError("حدث خطأ أثناء حذف المنتج");
      }
    };
  
    // جلب تقرير الجرد لسنة معينة
    const fetchInventoryByYear = async (year) => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/inventoryByYear/${year}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventory(response.data);
      } catch (err) {
        setError("حدث خطأ أثناء جلب تقرير الجرد");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
    fetchInventory();
  }
  }, [isAuthenticated]);

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        fetchInventory,
        addProduct,
        updateProduct,
        deleteProduct,
        fetchInventoryByYear,
        loading,
        error,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};