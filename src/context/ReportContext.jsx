import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const ReportContext = createContext();
export const useReport = () => useContext(ReportContext);

export const ReportProvider = ({ children }) => {
  const [data, setData] = useState({
    topSelling: [],
    bottomSelling: [],
    availableStock: [],
    salesByYear: [],
    totalRevenueByProduct: [],
    monthlySales: [],
    lowStockItems: [],
    revenuePercentageByProduct: [],
  });
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear()); 
  const API_URL = "https://smartstock-production.up.railway.app/api/reports";

  const fetchData = async (endpoint, key, includeYear = false) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const url = includeYear ? `${API_URL}/${endpoint}/${year}` : `${API_URL}/${endpoint}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData((prev) => ({ ...prev, [key]: response.data || [] }));
    } catch (err) {
      toast.error(`⚠️ خطأ أثناء جلب ${key}`);
    } finally {
      setLoading(false);
    }
  };

  // دالة لجلب عمليات البيع الخاصة بمنتج معيّن في سنة معيّنة
  const fetchSalesByProduct = async (year, productName) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/salesByProduct/${year}/${productName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // يمكنك تخزين البيانات في حالة منفصلة أو عرضها مباشرةً
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "حدث خطأ أثناء جلب بيانات عمليات البيع");
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryByProduct = async (year, productName) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/inventory/${year}/${productName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // يمكنك تخزين البيانات في الحالة أو استخدامها مباشرة
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "حدث خطأ أثناء جلب بيانات المخزون");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (localStorage.getItem("token")) {
      Promise.all([
        fetchData("topSellingByQuantity", "topSelling", true),
        fetchData("bottomSellingByQuantity", "bottomSelling", true),
        fetchData("availableStock", "availableStock", true), 
        fetchData("salesByYear", "salesByYear", true),
        fetchData("totalRevenueByProduct", "totalRevenueByProduct", true),
        fetchData("monthlySales", "monthlySales", true),
        fetchData("lowStockItems", "lowStockItems", true), 
        fetchData("revenuePercentageByProduct", "revenuePercentageByProduct", true),
      ]);
    }
  }, [year, isAuthenticated]); 

  return (
    <ReportContext.Provider
      value={{
        ...data,
        setYear, 
        fetchTopSelling: () => fetchData("topSellingByQuantity", "topSelling", true),
        fetchBottomSelling: () => fetchData("bottomSellingByQuantity", "bottomSelling", true),
        fetchAvailableStock: () => fetchData("availableStock", "availableStock", true),
        fetchSalesByYear: () => fetchData("salesByYear", "salesByYear", true),
        fetchTotalRevenueByProduct: () => fetchData("totalRevenueByProduct", "totalRevenueByProduct", true),
        fetchMonthlySales: () => fetchData("monthlySales", "monthlySales", true),
        fetchLowStockItems: () => fetchData("lowStockItems", "lowStockItems", true),
        fetchRevenuePercentageByProduct: () => fetchData("revenuePercentageByProduct", "revenuePercentageByProduct", true),
        fetchSalesByProduct, 
        fetchInventoryByProduct,
        loading,
        year, 
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};
