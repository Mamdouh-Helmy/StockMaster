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
      toast.error(
        `❌ ${err.response?.data?.message || "حدث خطأ أثناء إضافة العميل/المورد"}`
      );
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
      const response = await axios.post(
        `${API_URL}/${id}/pay`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        toast.success("✅ تم تسجيل الدفع بنجاح!");
        fetchClientsSuppliers();
      } else {
        toast.error(`❌ خطأ: ${response.data.message}`);
      }
    } catch (error) {
      console.error("حدث خطأ:", error);
    }
  };

  // إضافة ملاحظة جديدة للعميل/المورد
  const addNoteToClientSupplier = async (supplierId, noteText) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await axios.post(
        `${API_URL}/addNote`,
        { supplierId, noteText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // نفترض أن الـ API يُعيد الملاحظات المحدثة
      setClientsSuppliers((prev) =>
        prev.map((item) =>
          item._id === supplierId ? { ...item, notes: response.data.notes } : item
        )
      );
      toast.success("✅ تمت إضافة الملاحظة بنجاح");
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء إضافة الملاحظة");
      toast.error(
        `❌ ${err.response?.data?.message || "حدث خطأ أثناء إضافة الملاحظة"}`
      );
    } finally {
      setLoading(false);
    }
  };

  // تعديل ملاحظة موجودة للعميل/المورد
  const editNoteToClientSupplier = async (supplierId, noteId, noteText) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await axios.put(
        `${API_URL}/${supplierId}/notes/${noteId}`,
        { noteText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClientsSuppliers((prev) =>
        prev.map((item) =>
          item._id === supplierId
            ? {
              ...item,
              notes: item.notes.map((note) =>
                note._id === noteId ? response.data.note : note
              ),
            }
            : item
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تعديل الملاحظة");
      toast.error(
        `❌ ${err.response?.data?.message || "حدث خطأ أثناء تعديل الملاحظة"}`
      );
    } finally {
      setLoading(false);
    }
  };

  // حذف ملاحظة موجودة للعميل/المورد
  const deleteNoteFromClientSupplier = async (supplierId, noteId) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.delete(`${API_URL}/${supplierId}/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientsSuppliers((prev) =>
        prev.map((item) =>
          item._id === supplierId
            ? { ...item, notes: item.notes.filter((note) => note._id !== noteId) }
            : item
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء حذف الملاحظة");
      toast.error(
        `❌ ${err.response?.data?.message || "حدث خطأ أثناء حذف الملاحظة"}`
      );
    } finally {
      setLoading(false);
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
        addNoteToClientSupplier,
        editNoteToClientSupplier,
        deleteNoteFromClientSupplier,
      }}
    >
      {children}
    </ClientSupplierContext.Provider>
  );
};
