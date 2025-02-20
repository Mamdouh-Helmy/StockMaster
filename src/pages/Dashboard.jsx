import React from "react";
import { FaShoppingCart, FaStore, FaBox, FaUsers, FaTruck, FaMoneyBillWave, FaHandHoldingUsd } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useSales } from "../context/SalesContext";
import { usePurchases } from "../context/PurchasesContext";
import { useInventory } from "../context/InventoryContext";
import { useClientSupplier } from "../context/ClientSupplierContext";
import moment from "moment";

export default function Dashboard() {
  const { sales = [] } = useSales();
  const { purchases = [] } = usePurchases();
  const { inventory = [] } = useInventory();
  const { clientsSuppliers = [], loading, error } = useClientSupplier();

  // حساب إجمالي المبيعات
  const totalSales = sales.reduce((sum, sale) => {
    const saleTotal =
      sale.totalAmount ?? (sale.products || []).reduce((s, p) => s + (p.totalAmount || 0), 0);
    return sum + (saleTotal || 0);
  }, 0);

  // حساب إجمالي المشتريات
  const totalPurchases = purchases.reduce((sum, purchase) => {
    const purchaseTotal =
      purchase.totalAmount ?? (purchase.products || []).reduce((s, p) => s + (p.totalAmount || 0), 0);
    return sum + (purchaseTotal || 0);
  }, 0);

  // حساب عدد المنتجات في المخزون
  const totalProductsInInventory = inventory.length;

  // حساب عدد العملاء والموردين
  const totalClients = (clientsSuppliers || []).filter((cs) => cs.type === "client").length;
  const totalSuppliers = (clientsSuppliers || []).filter((cs) => cs.type === "supplier").length;

  // حساب رصيد العملاء المستحق
  const totalClientsBalance = (clientsSuppliers || [])
    .filter((cs) => cs.type === "client")
    .reduce((sum, cs) => sum + (cs.balance || 0), 0);

  // حساب رصيد الموردين المستحق
  const totalSuppliersBalance = (clientsSuppliers || [])
    .filter((cs) => cs.type === "supplier")
    .reduce((sum, cs) => sum + (cs.balance || 0), 0);

  // دمج بيانات المبيعات والمشتريات والمخزون معًا بناءً على التواريخ
  const mergedDataMap = {};

  // إضافة بيانات المبيعات
  sales.forEach((sale) => {
    const date = moment(sale.saleDate).format("YYYY-MM-DD");
    const total =
      sale.totalAmount ?? (sale.products || []).reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    if (!mergedDataMap[date]) {
      mergedDataMap[date] = { date, salesTotal: 0, purchasesTotal: 0, inventoryTotal: 0, clientsBalance: 0, suppliersBalance: 0 };
    }
    mergedDataMap[date].salesTotal += total || 0;
  });

  // إضافة بيانات المشتريات
  purchases.forEach((purchase) => {
    const date = moment(purchase.purchaseDate).format("YYYY-MM-DD");
    const total =
      purchase.totalAmount ?? (purchase.products || []).reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    if (!mergedDataMap[date]) {
      mergedDataMap[date] = { date, salesTotal: 0, purchasesTotal: 0, inventoryTotal: 0, clientsBalance: 0, suppliersBalance: 0 };
    }
    mergedDataMap[date].purchasesTotal += total || 0;
  });

  // إضافة بيانات المخزون
  inventory.forEach((item) => {
    const date = moment(item.updatedAt).format("YYYY-MM-DD");
    const total = (item.quantity || 0) * (item.price || 0);

    if (!mergedDataMap[date]) {
      mergedDataMap[date] = { date, salesTotal: 0, purchasesTotal: 0, inventoryTotal: 0, clientsBalance: 0, suppliersBalance: 0 };
    }
    mergedDataMap[date].inventoryTotal += total || 0;
  });

  // إضافة بيانات أرصدة العملاء والموردين
  clientsSuppliers.forEach((cs) => {
    const date = moment(cs.updatedAt).format("YYYY-MM-DD");
    if (!mergedDataMap[date]) {
      mergedDataMap[date] = { date, salesTotal: 0, purchasesTotal: 0, inventoryTotal: 0, clientsBalance: 0, suppliersBalance: 0 };
    }
    if (cs.type === "client") {
      mergedDataMap[date].clientsBalance += cs.balance || 0;
    } else if (cs.type === "supplier") {
      mergedDataMap[date].suppliersBalance += cs.balance || 0;
    }
  });

  // تحويل الكائن إلى مصفوفة مرتبة بالتاريخ
  const chartData = Object.values(mergedDataMap).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // دالة لعرض التولتيب باللغة العربية مع إضافة "ليا" أو "عليا"
  const tooltipFormatter = (value, name) => {
    if (name === "رصيد العملاء" || name === "رصيد الموردين") {
      return value > 0 ? `لِيَّا ${value} ج.م` : `عَلَيَّا ${Math.abs(value)} ج.م`;
    }
    return `${value.toLocaleString()} ج.م`;
  };

  const labelFormatter = (label) => `التاريخ: ${label}`;

 

  if (error) {
    return <div className="p-4 text-center text-red-500">حدث خطأ: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-background text-foreground min-h-screen flex flex-col items-center">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
        لوحة التحكم
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-5xl">
        {[
          {
            title: "إجمالي المبيعات",
            value: totalSales,
            color: "bg-blue-500",
            icon: <FaShoppingCart />,
          },
          {
            title: "إجمالي المشتريات",
            value: totalPurchases,
            color: "bg-green-500",
            icon: <FaStore />,
          },
          {
            title: "عدد المنتجات في المخزون",
            value: totalProductsInInventory,
            color: "bg-purple-500",
            icon: <FaBox />,
          },
          {
            title: "عدد العملاء",
            value: totalClients,
            color: "bg-orange-500",
            icon: <FaUsers />,
          },
          {
            title: "عدد الموردين",
            value: totalSuppliers,
            color: "bg-red-500",
            icon: <FaTruck />,
          },
          {
            title: "رصيد العملاء المستحق",
            value: totalClientsBalance,
            color: "bg-teal-500",
            iteamColor: totalClientsBalance < 0 ? "text-red-500" : totalClientsBalance > 0 ? "text-green-500" : "text-gray-500",
            icon: <FaMoneyBillWave />,
          },
          {
            title: "رصيد الموردين المستحق",
            value: totalSuppliersBalance,
            color: "bg-indigo-500",
            iteamColor: totalSuppliersBalance < 0 ? "text-red-500" : totalSuppliersBalance > 0 ? "text-green-500" : "text-gray-500",
            icon: <FaHandHoldingUsd />,
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-card p-3 rounded-xl shadow flex items-center gap-3 border border-border hover:scale-105 transition-transform"
          >
            <div className={`${item.color} w-9 h-9 rounded-full flex items-center justify-center text-white text-xl`}>
              {item.icon}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold mb-2">{item.title}</h2>
              <p className={`text-lg sm:text-xl font-bold ${item.iteamColor}`}>
                {(idx === 5 || idx === 6) ? (item.value > 0 ? "لِيَّا" : "عَلَيَّا") : ""} {Math.abs(item.value).toLocaleString()} {idx === 2 ? "منتج" : idx === 3 || idx === 4 ? "" : "ج.م"}
              </p>
            </div>
          </div>
        ))}
      </div>


      {/* الرسم البياني للمبيعات والمشتريات والمخزون وأرصدة العملاء والموردين */}
      <div className="mt-6 sm:mt-8 w-full max-w-5xl bg-card p-4 sm:p-6 rounded-2xl shadow-lg border border-border">
        <div className="flex flex-col sm:flex-row items-center mb-4">
          <h2 className="text-lg font-semibold mb-2 sm:mb-0">
            تحليل المبيعات والمشتريات والمخزون وأرصدة العملاء والموردين
          </h2>
          <div className="m-auto mt-3 md:mt-0 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <h3>المبيعات</h3>
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            </div>
            <div className="flex items-center gap-2">
              <h3>المشتريات</h3>
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center gap-2">
              <h3>المخزون</h3>
              <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            </div>
            <div className="flex items-center gap-2">
              <h3>رصيد العملاء</h3>
              <div className="w-4 h-4 rounded-full bg-teal-500"></div>
            </div>
            <div className="flex items-center gap-2">
              <h3>رصيد الموردين</h3>
              <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
            </div>
          </div>
        </div>

        {/* حاوية الرسم البياني مع إمكانية التمرير */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: "#fff" }} />
                <YAxis tick={{ fill: "#fff" }} />
                <Tooltip
                  formatter={tooltipFormatter}
                  labelFormatter={labelFormatter}
                  wrapperClassName="text-white"
                  cursor={{ stroke: "#ccc", strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB',
                    padding: '10px'
                  }}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <Legend />

                {/* خط المبيعات */}
                <Line
                  type="monotone"
                  dataKey="salesTotal"
                  stroke="#2196F3"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="المبيعات"
                />

                {/* خط المشتريات */}
                <Line
                  type="monotone"
                  dataKey="purchasesTotal"
                  stroke="#4CAF50"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="المشتريات"
                />

                {/* خط المخزون */}
                <Line
                  type="monotone"
                  dataKey="inventoryTotal"
                  stroke="#9C27B0"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="المخزون"
                />

                {/* خط رصيد العملاء */}
                <Line
                  type="monotone"
                  dataKey="clientsBalance"
                  stroke="#00BFA5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="رصيد العملاء"
                />

                {/* خط رصيد الموردين */}
                <Line
                  type="monotone"
                  dataKey="suppliersBalance"
                  stroke="#3F51B5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="رصيد الموردين"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* نص توجيهي للتمرير */}
        <div className="sm:hidden text-sm text-gray-500 text-center mt-2">
          اسحب لرؤية المزيد ←
        </div>
      </div>
    </div>
  );
}