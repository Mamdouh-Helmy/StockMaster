import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const PurchasesContext = createContext();
export const usePurchases = () => useContext(PurchasesContext);

export const PurchasesProvider = ({ children }) => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const API_URL = "https://smartstock-production.up.railway.app/api/purchases";

  // جلب عمليات الشراء من الخادم
  const fetchPurchases = async () => {
    const token = localStorage.getItem("token");
    if (!token) return; // منع تنفيذ الطلب إذا لم يكن هناك توكن

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchases(response.data);
    } catch (err) {
      setError("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  // إضافة عملية شراء جديدة
  const addPurchase = async (purchaseData) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("المستخدم غير مصرح له بإضافة عمليات الشراء.");

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/addPurchase`, purchaseData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchases((prevPurchases) => [...prevPurchases, response.data.purchase]);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error("حدث خطأ أثناء إضافة عملية الشراء", err.response || err.message);
      setError("حدث خطأ أثناء إضافة عملية الشراء");
      setLoading(false);
      toast.error("❌ حدث خطأ أثناء إضافة عملية الشراء");
      throw err;
    }
  };

  // حذف عملية شراء
  const deletePurchase = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("المستخدم غير مصرح له بحذف عمليات الشراء.");

    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchases((prevPurchases) => prevPurchases.filter((purchase) => purchase._id !== id));
      toast.success("🗑️ تم حذف عملية الشراء بنجاح");
    } catch (err) {
      toast.error("❌ حدث خطأ أثناء حذف عملية الشراء");
      setError("حدث خطأ أثناء حذف عملية الشراء");
      throw err;
    }
  };

  // تعديل عملية شراء
  const updatePurchase = async (id, updatedData) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("المستخدم غير مصرح له بتعديل عمليات الشراء.");

    setError(null);
    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchases((prevPurchases) =>
        prevPurchases.map((purchase) => (purchase._id === id ? response.data.purchase : purchase))
      );
      setLoading(false);
      return response.data;
    } catch (err) {
      toast.error("❌ حدث خطأ أثناء تعديل عملية الشراء");
      setError("حدث خطأ أثناء تعديل عملية الشراء");
      setLoading(false);
      throw err;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchPurchases();
    }
  }, [isAuthenticated]);

  return (
    <PurchasesContext.Provider
      value={{
        purchases,
        fetchPurchases,
        addPurchase,
        deletePurchase,
        updatePurchase,
        loading,
        error,
      }}
    >
      {children}
    </PurchasesContext.Provider>
  );
};
