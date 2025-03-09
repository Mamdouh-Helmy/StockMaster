import { useEffect, useState } from "react";
import Swal from "sweetalert2"; // تأكد من تثبيت SweetAlert2
import { useReport } from "../context/ReportContext";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Package,
  User,
  Calendar,
} from "lucide-react";
import { FaChartBar } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Select from "react-select";
import { useSales } from "../context/SalesContext";
import { useInventory } from "../context/InventoryContext";

function Reports() {
  const { sales } = useSales();
  const { inventory } = useInventory();
  const {
    topSelling,
    bottomSelling,
    availableStock,
    salesByYear,
    totalRevenueByProduct,
    monthlySales,
    lowStockItems,
    revenuePercentageByProduct,
    fetchSalesByYear,
    fetchBottomSelling,
    fetchAvailableStock,
    fetchTopSelling,
    fetchTotalRevenueByProduct,
    fetchMonthlySales,
    fetchLowStockItems,
    fetchRevenuePercentageByProduct,
    fetchSalesByProduct, // دالة من سياق التقارير
    year,
    setYear,
  } = useReport();
  const [yearOptions, setYearOptions] = useState([]);

  // حساب إجمالي مبيعات السنة (مبيعات 2025) من بيانات salesByYear
  const totalYearSales = salesByYear.reduce((acc, sale) => {
    const saleTotal = sale.products.reduce(
      (sum, prod) => sum + prod.totalAmount,
      0
    );
    return acc + saleTotal;
  }, 0);

  useEffect(() => {
    fetchSalesByYear();
    fetchBottomSelling();
    fetchAvailableStock();
    fetchTopSelling();
    fetchTotalRevenueByProduct();
    fetchMonthlySales();
    fetchLowStockItems(); // جلب بيانات العناصر منخفضة المخزون
    fetchRevenuePercentageByProduct();
  }, [year]);

  useEffect(() => {
    if (inventory.length === 0 && sales.length === 0) return;

    const allYears = [
      ...new Set([
        ...inventory.map((item) => item.year),
        ...sales.map((sale) => sale.year),
      ]),
    ];

    const sortedYears = allYears.sort((a, b) => a - b);

    const yearsArray = sortedYears.map((year) => ({
      value: year,
      label: year.toString(),
    }));

    setYearOptions(yearsArray);
  }, [inventory, sales]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
    }).format(value);
  };

  const renderLineChart = (
    data,
    dataKey,
    nameKey = "_id",
    color = "#4f46e5",
    text1 = "",
    text2 = ""
  ) => {
    return (
      <div className="h-64 w-full min-w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            width="100%"
            height="100%"
            margin={{ top: 5, right: 20, bottom: 5, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey={nameKey}
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF" }}
            />
            <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
            <Tooltip
              formatter={(value) => [
                `${value.toFixed(2).toLocaleString("ar-EG")} ${text1}`,
                text2,
              ]}
              cursor={{ stroke: "#ccc", strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "0.5rem",
                color: "#F9FAFB",
                padding: "10px",
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const handleYearChange = (selectedOption) => {
    setYear(selectedOption.value);
  };

  // دالة عرض تفاصيل مبيعات المنتج في مودال بجدول وإجمالي السعر بتنسيق جذاب
  const handleProductClick = async (productName) => {
    const salesData = await fetchSalesByProduct(year, productName);
    if (salesData && salesData.length > 0) {
      let totalRevenue = 0;
      let htmlContent = `
        <style>
          @media (min-width: 1024px) { .swal-content * { font-size: 20px !important; } }
          @media (max-width: 1023px) { 
            .swal-content * { font-size: 14px !important; } 
            .swal-table-container { max-height: 300px; } 
            table { font-size: 12px !important; } 
            th, td { padding: 6px !important; }
          }
          .swal-table-container {
            width: 90%; max-height: 90vh; overflow-x: auto; overflow-y: auto;
            -ms-overflow-style: none; scrollbar-width: none; margin: auto;
          }
          .swal-table-container::-webkit-scrollbar { display: none; }
          table {
            width: 100%; border-collapse: collapse; margin-top: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3); border-radius: 8px;
            overflow: hidden; min-width: 500px;
          }
          th, td { border: 1px solid #444; padding: 10px; text-align: center; }
          th { background-color: #333; color: #fff; font-weight: bold; }
          td { color: #fff; }
          tr:nth-child(even) { background-color: #2c2c2c; }
          tr:nth-child(odd) { background-color: #1e1e1e; }
        </style>
        <div class="swal-table-container" style="text-align:right; padding:20px; font-family:'Arial', sans-serif;">
      `;
      salesData.forEach((sale) => {
        const saleDate = new Date(sale.saleDate).toLocaleDateString("ar-EG");
        const saleTime = new Date(sale.saleDate).toLocaleTimeString("ar-EG");
        const saleTotal = sale.products.reduce(
          (sum, prod) => sum + prod.totalAmount,
          0
        );
        totalRevenue += saleTotal;
        htmlContent += `
          <div style="border-bottom:1px solid #555; padding-bottom:15px; margin-bottom:20px;">
            <p style="margin:5px 0; font-size:18px;"><strong>👤 العميل:</strong> ${
              sale.customerName
            }</p>
            <p style="margin:5px 0; font-size:18px;"><strong>📅 التاريخ:</strong> ${saleDate}</p>
            <p style="margin:5px 0; font-size:18px;"><strong>⏰ الساعة:</strong> ${saleTime}</p>
            <table>
              <thead>
                <tr>
                  <th>اسم المنتج <span style="font-size:14px;">📦</span></th>
                  <th>الكمية <span style="font-size:14px;">🔢</span></th>
                  <th>السعر <span style="font-size:14px;">💰</span></th>
                  <th>المجموع <span style="font-size:14px;">🧾</span></th>
                </tr>
              </thead>
              <tbody>
                ${sale.products
                  .map(
                    (prod) => `
                    <tr>
                      <td>${prod.productName}</td>
                      <td>${prod.quantity} قطعة</td>
                      <td>${formatCurrency(prod.price)}</td>
                      <td>${formatCurrency(prod.totalAmount)}</td>
                    </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `;
      });
      // عرض إجمالي السعر بتنسيق جذاب
      htmlContent += `
        <div style="text-align:center; margin-top:20px; padding:10px; background-color:#333; border-radius:8px; font-size:20px; color:#fff;">
          <strong>الإجمالي: ${formatCurrency(totalRevenue)}</strong>
        </div>
      `;
      htmlContent += `</div>`;
      Swal.fire({
        title: `تفاصيل مبيعات المنتج: ${productName}`,
        customClass: { title: "small-title" },
        html: htmlContent,
        width: "90%",
        background: "#1e1e1e",
        color: "#fff",
        confirmButtonText: "إغلاق",
        confirmButtonColor: "#3085d6",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "لا توجد بيانات لمبيعات هذا المنتج",
        background: "#1e1e1e",
        color: "#fff",
        confirmButtonText: "إغلاق",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  // دالة عرض تفاصيل المخزون المتاح في مودال مع جدول وإجمالي السعر
  const handleInventoryClick = (item) => {
    let htmlContent = `
      <style>
        @media (min-width: 1024px) { .swal-content * { font-size: 20px !important; } }
        @media (max-width: 1023px) { 
          .swal-content * { font-size: 14px !important; } 
          .swal-table-container { max-height: 300px; }
          table { font-size: 12px !important; }
          th, td { padding: 6px !important; }
        }
        .swal-table-container {
          width: 90%; max-height: 90vh; overflow-x: auto; overflow-y: auto;
          -ms-overflow-style: none; scrollbar-width: none; margin: auto;
        }
        .swal-table-container::-webkit-scrollbar { display: none; }
        table {
          width: 100%; border-collapse: collapse; margin-top: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3); border-radius: 8px;
          overflow: hidden; min-width: 500px;
        }
        th, td { border: 1px solid #444; padding: 10px; text-align: center; }
        th { background-color: #333; color: #fff; font-weight: bold; }
        td { color: #fff; }
        tr:nth-child(even) { background-color: #2c2c2c; }
        tr:nth-child(odd) { background-color: #1e1e1e; }
      </style>
      <div class="swal-table-container" style="text-align:right; padding:20px; font-family:'Arial', sans-serif;">
        <table>
          <thead>
            <tr>
              <th>المعلومات</th>
              <th>القيمة</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>📦 المنتج</td>
              <td>${item.productName}</td>
            </tr>
            <tr>
              <td>🔢 الكمية</td>
              <td>${item.quantity} قطعة</td>
            </tr>
            <tr>
              <td>💰 السعر</td>
              <td>${formatCurrency(item.price)}</td>
            </tr>
            <tr>
              <td>🧾 القيمة</td>
              <td>${formatCurrency(item.totalValue)}</td>
            </tr>
            <tr>
              <td>📅 السنة</td>
              <td>${item.year}</td>
            </tr>
          </tbody>
        </table>
        <div style="text-align:center; margin-top:20px; padding:10px; background-color:#333; border-radius:8px; font-size:20px; color:#fff;">
          <strong>الإجمالي: ${formatCurrency(item.totalValue)}</strong>
        </div>
      </div>
    `;
    Swal.fire({
      title: `تفاصيل المخزون: ${item.productName}`,
      customClass: { title: "small-title" },
      html: htmlContent,
      width: "90%",
      background: "#1e1e1e",
      color: "#fff",
      confirmButtonText: "إغلاق",
      confirmButtonColor: "#3085d6",
    });
  };

  // دالة عرض تفاصيل المبيعات الشهرية لمورد معيّن مع جدول وإجمالي المبيعات لهذا الشهر
  const handleMonthlySalesClick = (month) => {
    const filteredSales = salesByYear.filter((sale) => {
      const saleMonth = new Date(sale.saleDate).getMonth() + 1;
      return saleMonth === Number(month);
    });
    if (filteredSales.length > 0) {
      let totalMonthSales = 0;
      let htmlContent = `
        <style>
          @media (min-width: 1024px) { .swal-content * { font-size: 20px !important; } }
          @media (max-width: 1023px) { 
            .swal-content * { font-size: 14px !important; }
            .swal-table-container { max-height: 300px; }
            table { font-size: 12px !important; }
            th, td { padding: 6px !important; }
          }
          .swal-table-container {
            width: 90%; max-height: 90vh; overflow-x: auto; overflow-y: auto;
            -ms-overflow-style: none; scrollbar-width: none; margin: auto;
          }
          .swal-table-container::-webkit-scrollbar { display: none; }
          table {
            width: 100%; border-collapse: collapse; margin-top: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3); border-radius: 8px;
            overflow: hidden; min-width: 500px;
          }
          th, td { border: 1px solid #444; padding: 10px; text-align: center; }
          th { background-color: #333; color: #fff; font-weight: bold; }
          td { color: #fff; }
          tr:nth-child(even) { background-color: #2c2c2c; }
          tr:nth-child(odd) { background-color: #1e1e1e; }
        </style>
        <div class="swal-table-container" style="text-align:right; padding:20px; font-family:'Arial', sans-serif;">
      `;
      filteredSales.forEach((sale) => {
        const saleDate = new Date(sale.saleDate).toLocaleDateString("ar-EG");
        const saleTime = new Date(sale.saleDate).toLocaleTimeString("ar-EG");
        const saleTotal = sale.products.reduce(
          (sum, prod) => sum + prod.totalAmount,
          0
        );
        totalMonthSales += saleTotal;
        htmlContent += `
          <div style="border-bottom:1px solid #555; padding-bottom:15px; margin-bottom:20px;">
            <p style="margin:5px 0; font-size:18px;"><strong>👤 العميل:</strong> ${
              sale.customerName
            }</p>
            <p style="margin:5px 0; font-size:18px;"><strong>📅 التاريخ:</strong> ${saleDate}</p>
            <p style="margin:5px 0; font-size:18px;"><strong>⏰ الساعة:</strong> ${saleTime}</p>
            <table>
              <thead>
                <tr>
                  <th>اسم المنتج <span style="font-size:14px;">📦</span></th>
                  <th>الكمية <span style="font-size:14px;">🔢</span></th>
                  <th>السعر <span style="font-size:14px;">💰</span></th>
                  <th>المجموع <span style="font-size:14px;">🧾</span></th>
                </tr>
              </thead>
              <tbody>
                ${sale.products
                  .map(
                    (prod) => `
                    <tr>
                      <td>${prod.productName}</td>
                      <td>${prod.quantity} قطعة</td>
                      <td>${formatCurrency(prod.price)}</td>
                      <td>${formatCurrency(prod.totalAmount)}</td>
                    </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `;
      });
      htmlContent += `
        <div style="text-align:center; margin-top:20px; padding:10px; background-color:#333; border-radius:8px; font-size:20px; color:#fff;">
          <strong>الإجمالي لهذا الشهر: ${formatCurrency(
            totalMonthSales
          )}</strong>
        </div>
      `;
      htmlContent += `</div>`;
      Swal.fire({
        title: `تفاصيل مبيعات شهر ${month}`,
        customClass: { title: "small-title" },
        html: htmlContent,
        width: "90%",
        background: "#1e1e1e",
        color: "#fff",
        confirmButtonText: "إغلاق",
        confirmButtonColor: "#3085d6",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "لا توجد بيانات لمبيعات هذا الشهر",
        background: "#1e1e1e",
        color: "#fff",
        confirmButtonText: "إغلاق",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  // دالة عرض تفاصيل المنتجات ذات المخزون المنخفض مع تنبيه وإجمالي السعر
  const handleLowStockClick = (item) => {
    let htmlContent = `
      <style>
        @media (min-width: 1024px) { .swal-content * { font-size: 20px !important; } }
        @media (max-width: 1023px) { 
          .swal-content * { font-size: 14px !important; } 
          .swal-table-container { max-height: 300px; }
          table { font-size: 12px !important; }
          th, td { padding: 6px !important; }
        }
        .swal-table-container {
          width: 90%; max-height: 90vh; overflow-x: auto; overflow-y: auto;
          -ms-overflow-style: none; scrollbar-width: none; margin: auto;
        }
        .swal-table-container::-webkit-scrollbar { display: none; }
        table {
          width: 100%; border-collapse: collapse; margin-top: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3); border-radius: 8px;
          overflow: hidden; min-width: 500px;
        }
        th, td { border: 1px solid #444; padding: 10px; text-align: center; }
        th { background-color: #333; color: #fff; font-weight: bold; }
        td { color: #fff; }
        tr:nth-child(even) { background-color: #2c2c2c; }
        tr:nth-child(odd) { background-color: #1e1e1e; }
      </style>
      <div class="swal-table-container" style="text-align:right; padding:20px; font-family:'Arial', sans-serif;">
        <table>
          <thead>
            <tr>
              <th>المعلومات</th>
              <th>القيمة</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>📦 المنتج</td>
              <td>${item.productName}</td>
            </tr>
            <tr>
              <td>🔢 الكمية</td>
              <td>${item.quantity} قطعة</td>
            </tr>
            <tr>
              <td>💰 السعر</td>
              <td>${formatCurrency(item.price)}</td>
            </tr>
            <tr>
              <td>🧾 القيمة</td>
              <td>${formatCurrency(item.totalValue)}</td>
            </tr>
            <tr>
              <td>📅 السنة</td>
              <td>${item.year}</td>
            </tr>
          </tbody>
        </table>
        <div style="text-align:center; margin-top:20px; padding:10px; background-color:#333;  border-radius:8px; font-size:20px; color:#fff;">
          <strong>الإجمالي: ${formatCurrency(item.totalValue)}</strong>
        </div>
        <div style="text-align:center; margin-top:10px; padding:5px; background-color:#8B0000; border-radius:8px; font-size:18px; color:#fff;">
          <strong>⚠️ تنبيه: المخزون منخفض!</strong>
        </div>
      </div>
    `;
    Swal.fire({
      title: `تفاصيل المنتج منخفض المخزون: ${item.productName}`,
      customClass: { title: "small-title" },
      html: htmlContent,
      width: "90%",
      background: "#1e1e1e",
      color: "#fff",
      confirmButtonText: "إغلاق",
      confirmButtonColor: "#3085d6",
    });
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-6 lg:p-8">
      <div className="mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground flex items-center gap-3 justify-start">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FaChartBar className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            التقارير
          </h1>
          <p className="text-foreground/60 mt-2">
            نظرة عامة على أداء المبيعات والمخزون
          </p>
        </header>

        <div className="mb-8">
          <label
            htmlFor="year-select"
            className="text-foreground/80 mr-2 mb-2 block"
          >
            اختر السنة:
          </label>
          <Select
            id="year-select"
            options={yearOptions}
            value={yearOptions.find((option) => option.value === year)}
            onChange={handleYearChange}
            placeholder="اختر السنة..."
            className="w-full"
            isSearchable
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "#1F2937",
                borderColor: "#374151",
                color: "#F9FAFB",
              }),
              singleValue: (base) => ({ ...base, color: "#F9FAFB" }),
              menu: (base) => ({ ...base, backgroundColor: "#1F2937" }),
              option: (base, { isFocused }) => ({
                ...base,
                backgroundColor: isFocused ? "#374151" : "#1F2937",
                color: "#F9FAFB",
              }),
              input: (base) => ({ ...base, color: "#F9FAFB", padding: "6px" }),
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* الأكثر مبيعاً */}
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                الأكثر مبيعاً
              </h2>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="space-y-4">
              {topSelling?.map((item, index) => (
                <div
                  key={item._id || index}
                  onClick={() => handleProductClick(item._id)}
                  className="cursor-pointer flex items-center flex-col gap-2 md:gap-0 md:flex-row justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-200"
                >
                  <span className="text-foreground">{item._id}</span>
                  <span className="text-primary font-medium">
                    {item.totalQuantity} قطعة
                  </span>
                </div>
              ))}
            </div>
            {renderLineChart(
              topSelling,
              "totalQuantity",
              "_id",
              "#10B981",
              "قطع",
              "القيمة الإجمالية"
            )}
          </div>

          {/* الأقل مبيعاً */}
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                الأقل مبيعاً
              </h2>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingDown className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="space-y-4">
              {bottomSelling?.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleProductClick(item._id)}
                  className="cursor-pointer flex items-center flex-col gap-2 md:gap-0 md:flex-row justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-200"
                >
                  <span className="text-foreground">{item._id}</span>
                  <span className="text-primary font-medium">
                    {item.totalQuantity} قطعة
                  </span>
                </div>
              ))}
            </div>
            {renderLineChart(
              bottomSelling,
              "totalQuantity",
              "_id",
              "#EF4444",
              "قطع",
              "القيمة الإجمالية"
            )}
          </div>

          {/* المخزون المتاح */}
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                المخزون المتاح
              </h2>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="space-y-4">
              {availableStock?.map((item, index) => (
                <div
                  key={item._id || index}
                  onClick={() => handleInventoryClick(item)}
                  className="cursor-pointer flex items-center flex-col gap-2 md:gap-0 md:flex-row justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-200"
                >
                  <span className="text-foreground">{item.productName}</span>
                  <span className="text-primary font-medium">
                    {formatCurrency(item.totalValue)}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 p-2 bg-gray-800 rounded-lg text-white text-[16px] md:text-xl font-bold">
              الإجمالي:{" "}
              {formatCurrency(
                availableStock.reduce((acc, item) => acc + item.totalValue, 0)
              )}
            </div>
            {renderLineChart(
              availableStock,
              "totalValue",
              "productName",
              "#F59E0B",
              "ج.م",
              "القيمة الإجمالية"
            )}
          </div>

          {/* مبيعات السنة (2025) */}
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                مبيعات {year}
              </h2>
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="space-y-4">
              {salesByYear?.map((sale, index) => (
                <div
                  key={sale._id || index}
                  className="bg-background/50 rounded-lg p-4 hover:bg-background/70 transition-colors duration-200"
                >
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <User className="text-primary h-4 w-4" />
                        <span className="text-foreground/80">العميل:</span>
                      </div>
                      <span className="text-foreground font-medium">
                        {sale.customerName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-primary h-4 w-4" />
                        <span className="text-foreground/80">التاريخ:</span>
                      </div>
                      <span className="text-foreground">
                        {new Date(sale.saleDate).toLocaleDateString("ar-EG")}
                      </span>
                    </div>

                    <div className="border-t border-border/50 pt-3 mt-2">
                      {sale.products.map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center md:items-stretch flex-col gap-1 mb-3 last:mb-0"
                        >
                          <div className="flex flex-col gap-2 md:gap-0 md:flex-row justify-between md:items-center">
                            <span className="text-foreground font-medium">
                              {product.productName}
                            </span>
                            <span className="text-primary text-sm">
                              {product.quantity} ×{" "}
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                          <div className="flex md:justify-end">
                            <span className="text-green-400 text-sm font-medium">
                              {formatCurrency(product.totalAmount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* عرض إجمالي مبيعات السنة */}
            <div className="text-center mt-4 p-2 bg-gray-800 rounded-lg text-white text-[16px] md:text-xl font-bold">
              الإجمالي: {formatCurrency(totalYearSales)}
            </div>
            {renderLineChart(
              salesByYear?.flatMap((sale) =>
                sale.products.map((product) => ({
                  productName: product.productName,
                  totalAmount: product.totalAmount,
                }))
              ),
              "totalAmount",
              "productName",
              "#6366F1",
              "ج.م",
              "القيمة الإجمالية"
            )}
          </div>

          {/* إجمالي الإيرادات حسب المنتج */}
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg sm:text-xl font-semibold text-foreground cursor-pointer"
                onClick={() =>
                  handleProductClick(totalRevenueByProduct[0]?._id)
                }
              >
                إجمالي الإيرادات حسب المنتج
              </h2>
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="space-y-4">
              {totalRevenueByProduct?.map((product, index) => (
                <div
                  key={product._id || index}
                  className="flex items-center flex-col gap-2 md:gap-0 md:flex-row justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleProductClick(product._id)}
                >
                  <span className="text-foreground">{product._id}</span>
                  <span className="text-primary font-medium">
                    {formatCurrency(product.totalRevenue)}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 p-2 bg-gray-800 rounded-lg text-white text-[16px] md:text-xl font-bold">
              الإجمالي:{" "}
              {formatCurrency(
                totalRevenueByProduct.reduce(
                  (acc, product) => acc + product.totalRevenue,
                  0
                )
              )}
            </div>
            {renderLineChart(
              totalRevenueByProduct,
              "totalRevenue",
              "_id",
              "#8B5CF6",
              "ج.م",
              "القيمة الإجمالية"
            )}
          </div>

          {/* المبيعات الشهرية لعام {year} */}
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                المبيعات الشهرية لعام {year}
              </h2>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="space-y-4">
              {monthlySales?.map((sale, index) => (
                <div
                  key={sale._id || index}
                  onClick={() => handleMonthlySalesClick(sale._id)}
                  className="cursor-pointer flex items-center flex-col gap-2 md:gap-0 md:flex-row justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-200"
                >
                  <span className="text-foreground">الشهر {sale._id}</span>
                  <span className="text-primary font-medium">
                    {formatCurrency(sale.totalSales)}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 p-2 bg-gray-800 rounded-lg text-white text-[16px] md:text-xl font-bold">
              الإجمالي:{" "}
              {formatCurrency(
                monthlySales.reduce((acc, sale) => acc + sale.totalSales, 0)
              )}
            </div>
            {renderLineChart(
              monthlySales,
              "totalSales",
              "_id",
              "#EC4899",
              "ج.م",
              "القيمة الإجمالية"
            )}
          </div>

          {/* المنتجات ذات المخزون المنخفض */}
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                المنتجات ذات المخزون المنخفض
              </h2>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="space-y-4">
              {lowStockItems?.map((item, index) => (
                <div
                  key={item._id || index}
                  className="cursor-pointer flex items-center flex-col gap-2 md:gap-0 md:flex-row justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-200"
                  onClick={() => handleLowStockClick(item)}
                >
                  <span className="text-foreground">{item.productName}</span>
                  <span className="text-primary font-medium">
                    {item.quantity} قطعة
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 p-2 bg-gray-800 rounded-lg text-white text-[16px] md:text-xl font-bold">
              الإجمالي:{" "}
              {formatCurrency(
                lowStockItems.reduce((acc, item) => acc + item.totalValue, 0)
              )}
            </div>
            {renderLineChart(
              lowStockItems,
              "quantity",
              "productName",
              "#F43F5E",
              "قطع",
              "القيمة الإجمالية"
            )}
          </div>

          {/* نسبة الإيرادات لكل منتج */}
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                نسبة الإيرادات لكل منتج
              </h2>
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="space-y-4">
              {revenuePercentageByProduct?.map((product, index) => (
                <div
                  key={product._id || index}
                  className="flex items-center flex-col gap-2 md:gap-0 md:flex-row justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-200"
                >
                  <span className="text-foreground">{product.productName}</span>
                  <span className="text-primary font-medium">
                    {product.percentage.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
            {renderLineChart(
              revenuePercentageByProduct,
              "percentage",
              "productName",
              "#0EA5E9",
              "%",
              "النسبه"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
