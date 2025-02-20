import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const ClientSupplierContext = createContext();
export const useClientSupplier = () => useContext(ClientSupplierContext);

export const ClientSupplierProvider = ({ children }) => {
  const [clientsSuppliers, setClientsSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const API_URL = "https://smartstock-production.up.railway.app/api/clients-suppliers";

  // جلب جميع العملاء والموردين
  const fetchClientsSuppliers = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientsSuppliers(response.data);
    } catch (err) {
      setError("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  // إضافة عميل أو مورد جديد
  const addClientSupplier = async (data) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.post(`${API_URL}/addClientSupplier`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientsSuppliers((prev) => [...prev, response.data.clientSupplier]);
      toast.success("✅ تم إضافة العميل/المورد بنجاح");
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء الإضافة");
      toast.error(`❌ ${err.response?.data?.message || "حدث خطأ أثناء إضافة العميل/المورد"}`);
    } finally {
      setLoading(false);
    }
  };

  // تعديل بيانات العميل أو المورد
  const updateClientSupplier = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.put(`${API_URL}/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientsSuppliers((prev) =>
        prev.map((item) => (item._id === id ? response.data : item))
      );
      toast.success("✅ تم تحديث البيانات بنجاح");
    } catch (err) {
      setError("حدث خطأ أثناء التحديث");
      toast.error("❌ حدث خطأ أثناء تعديل البيانات");
    } finally {
      setLoading(false);
    }
  };

  // حذف عميل أو مورد
  const deleteClientSupplier = async (id) => {
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientsSuppliers((prev) => prev.filter((item) => item._id !== id));
      toast.success("🗑️ تم حذف العميل/المورد بنجاح");
    } catch (err) {
      setError("حدث خطأ أثناء الحذف");
      toast.error("❌ حدث خطأ أثناء حذف العميل/المورد");
    }
  };

  // تسجيل دفعة مالية
  const payClientSupplier = async (id, amount) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/${id}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("✅ تم تسجيل الدفع بنجاح!");
        fetchClientsSuppliers();
      } else {
        toast.error(`❌ خطأ: ${data.message}`);
      }
    } catch (error) {
      console.error("حدث خطأ:", error);
    }
  };

  useEffect(() => {
    fetchClientsSuppliers();
  }, [isAuthenticated]);

  return (
    <ClientSupplierContext.Provider
      value={{
        clientsSuppliers,
        fetchClientsSuppliers,
        addClientSupplier,
        updateClientSupplier,
        deleteClientSupplier,
        loading,
        error,
        payClientSupplier,
      }}
    >
      {children}
    </ClientSupplierContext.Provider>
  );
};
