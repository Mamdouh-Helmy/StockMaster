import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const SalesContext = createContext();
export const useSales = () => useContext(SalesContext);

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const API_URL = "https://smartstock-production.up.railway.app/api/sales";

  // جلب عمليات البيع من الخادم
  const fetchSales = async () => {
    const token = localStorage.getItem("token");
    if (!token) return; // منع الاستدعاء إذا لم يكن هناك توكن

    setLoading(true);
    setError(null); // مسح أي خطأ سابق
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales(response.data);
    } catch (err) {
      setError("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  // إضافة عملية بيع جديدة
  const addSale = async (saleData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("المستخدم غير مصرح له بإضافة عمليات البيع.");
  
      const response = await axios.post(`${API_URL}/addSale`, saleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const newSale = response.data.sale;
      setSales((prevSales) => [...prevSales, newSale]);
  
      await downloadInvoice(newSale._id);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error("حدث خطأ أثناء إرسال الطلب:", err.response || err.message);
      
      // التحقق من نوع الخطأ وعرض رسالة مناسبة
      const errorMessage = err.response?.data?.message || "❌ حدث خطأ أثناء إضافة عملية البيع";
      setError(errorMessage);
      toast.error(errorMessage);
  
      setLoading(false);
      throw err;
    }
  };
  

  // تحميل الفاتورة
  const downloadInvoice = async (saleId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("المستخدم غير مصرح له بتحميل الفاتورة.");

      const response = await axios.get(
        `https://smartstock-production.up.railway.app/api/invoices/generateInvoice/${saleId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${saleId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("خطأ أثناء تحميل الفاتورة", err);
      toast.error("❌ حدث خطأ أثناء تحميل الفاتورة");
    }
  };

  // حذف عملية بيع
  const deleteSale = async (id) => {
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("المستخدم غير مصرح له بحذف عمليات البيع.");

      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales((prevSales) => prevSales.filter((sale) => sale._id !== id));
      toast.success("🗑️ تم حذف عملية البيع بنجاح");
    } catch (err) {
      toast.error("❌ حدث خطأ أثناء حذف عملية البيع");
      setError("حدث خطأ أثناء حذف عملية البيع");
      throw err;
    }
  };

  // تعديل عملية بيع
  const updateSale = async (id, updatedData) => {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("المستخدم غير مصرح له بتعديل عمليات البيع.");

      const response = await axios.put(`${API_URL}/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales((prevSales) =>
        prevSales.map((sale) => (sale._id === id ? response.data.sale : sale))
      );
      await downloadInvoice(id);
      setLoading(false);
      return response.data;
    } catch (err) {
      toast.error("❌ حدث خطأ أثناء تعديل عملية البيع");
      setError("حدث خطأ أثناء تعديل عملية البيع");
      setLoading(false);
      throw err;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchSales();
    }
  }, [isAuthenticated]);

  return (
    <SalesContext.Provider
      value={{
        sales,
        fetchSales,
        addSale,
        deleteSale,
        updateSale,
        loading,
        error,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};
