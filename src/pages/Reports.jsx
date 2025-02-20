import { useEffect, useState } from "react";
import { useReport } from "../context/ReportContext";
import { BarChart3, TrendingDown, TrendingUp, Package, User, Calendar } from 'lucide-react';
import { FaChartBar } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Select from 'react-select'
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
    year,
    setYear,
  } = useReport();
  const [yearOptions, setYearOptions] = useState([]);

  useEffect(() => {
    fetchSalesByYear();
    fetchBottomSelling();
    fetchAvailableStock();
    fetchTopSelling();
    fetchTotalRevenueByProduct();
    fetchMonthlySales();
    fetchLowStockItems(); // جلب بيانات العناصر منخفضة المخزون
    fetchRevenuePercentageByProduct();
  }, [year]); // إعادة جلب البيانات عند تغيير السنة

  useEffect(() => {
    if (inventory.length === 0 && sales.length === 0) return;

    const allYears = [
      ...new Set([...inventory.map((item) => item.year), ...sales.map((sale) => sale.year)])
    ];

    const sortedYears = allYears.sort((a, b) => a - b);

    const yearsArray = sortedYears.map((year) => ({
      value: year,
      label: year.toString(),
    }));

    setYearOptions(yearsArray);
  }, [inventory, sales]);



  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(value);
  };

  const renderLineChart = (data, dataKey, nameKey = "_id", color = "#4f46e5", text1 = "", text2 = "") => {
    return (
      <div className="h-64 w-full min-w-full mt-4"> 
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} width="100%" height="100%" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={nameKey} stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
            <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
            <Tooltip
              formatter={(value) => [`${value.toFixed(2).toLocaleString('ar-EG')} ${text1}`, text2]}
              cursor={{ stroke: "#ccc", strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#F9FAFB',
                padding: '10px'
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

  return (
    <div className="min-h-screen bg-background p-2 sm:p-6 lg:p-8" >
      <div className=" mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground flex items-center gap-3 justify-start">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FaChartBar className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            التقارير
          </h1>
          <p className="text-foreground/60 mt-2">نظرة عامة على أداء المبيعات والمخزون</p>
        </header>

        <div className="mb-8">
          <label htmlFor="year-select" className="text-foreground/80 mr-2 mb-2 block">اختر السنة:</label>
          <Select
            id="year-select"
            options={yearOptions}
            value={yearOptions.find(option => option.value === year)} 
            onChange={handleYearChange} 
            placeholder="اختر السنة..."
            className="w-full" 
            isSearchable 
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: '#1F2937', 
                borderColor: '#374151', 
                color: '#F9FAFB', 
              }),
              singleValue: (base) => ({
                ...base,
                color: '#F9FAFB', 
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: '#1F2937',
              }),
              option: (base, { isFocused }) => ({
                ...base,
                backgroundColor: isFocused ? '#374151' : '#1F2937',
                color: '#F9FAFB', 
              }),
              input: (base) => ({
                ...base,
                color: '#F9FAFB', 
                padding: '6px',
              }),
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* الأكثر مبيعاً */}
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">الأكثر مبيعاً</h2>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="space-y-4">
              {topSelling?.map((item, index) => (
                <div
                  key={item._id || index} 
                  className="flex items-center flex-col gap-2 md:gap-0 md:flex-row justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-200"
                >
                  <span className="text-foreground">{item._id}</span>
                  <span className="text-primary font-medium">{item.totalQuantity} قطعة</span>
                </div>
              ))}
            </div>
            {renderLineChart(topSelling, "totalQuantity", "_id", "#10B981", "قطع", "القيمة الإجمالية")}
          </div>

          {/* الأقل مبيعاً */}
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">الأقل مبيعاً</h2>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingDown className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="space-y-4">
              {bottomSelling?.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center flex-col gap-2 md:gap-0 md:flex-row justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-200"
                >
                  <span className="text-foreground">{item._id}</span>
                  <span className="text-primary font-medium">{item.totalQuantity} قطعة</span>
                </div>
              ))}
            </div>
            {renderLineChart(bottomSelling, "totalQuantity", "_id", "#EF4444", "قطع", "القيمة الإجمالية")}
          </div>

          {/* المخزون المتاح */}
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">المخزون المتاح</h2>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="space-y-4">
              {availableStock?.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex items-center flex-col gap-2 md:gap-0 md:flex-row justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-200"
                >
                  <span className="text-foreground">{item.productName}</span>
                  <span className="text-primary font-medium">{formatCurrency(item.totalValue)}</span>
                </div>
              ))}
            </div>
            {renderLineChart(availableStock, "totalValue", "productName", "#F59E0B", "ج.م", "القيمة الإجمالية")}
          </div>

          {/* مبيعات 2025 */}
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">مبيعات {year}</h2>
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
                      <span className="text-foreground font-medium">{sale.customerName}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-primary h-4 w-4" />
                        <span className="text-foreground/80">التاريخ:</span>
                      </div>
                      <span className="text-foreground">{new Date(sale.saleDate).toLocaleDateString('ar-EG')}</span>
                    </div>

                    <div className="border-t border-border/50 pt-3 mt-2">
                      {sale.products.map((product, index) => (
                        <div key={index} className="flex items-center md:items-stretch flex-col gap-1 mb-3 last:mb-0">
                          <div className="flex flex-col gap-2 md:gap-0 md:flex-row justify-between md:items-center">
                            <span className="text-foreground font-medium">{product.productName}</span>
                            <span className="text-primary text-sm">{product.quantity} × {formatCurrency(product.price)}</span>
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
            {renderLineChart(
              salesByYear?.flatMap(sale =>
                sale.products.map(product => ({
                  productName: product.productName, 
                  totalAmount: product.totalAmount 
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
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">إجمالي الإيرادات حسب المنتج</h2>
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="space-y-4">
              {totalRevenueByProduct?.map((product, index) => (
                <div
                  key={product._id || index} 
                  className="flex items-center flex-col gap-2 md:gap-0 md:flex-row justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-200"
                >
                  <span className="text-foreground">{product._id}</span>
                  <span className="text-primary font-medium">{formatCurrency(product.totalRevenue)}</span>
                </div>
              ))}
            </div>
            {renderLineChart(totalRevenueByProduct, "totalRevenue", "_id", "#8B5CF6", "ج.م", "القيمة الإجمالية")}
          </div>

          {/* المبيعات الشهرية لعام 2025 */}
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">المبيعات الشهرية لعام {year}</h2>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="space-y-4">
              {monthlySales?.map((sale, index) => (
                <div
                  key={sale._id || index} // استخدام _id أو index كـ key
                  className="flex items-center flex-col gap-2 md:gap-0 md:flex-row justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-200"
                >
                  <span className="text-foreground">الشهر {sale._id}</span>
                  <span className="text-primary font-medium">{formatCurrency(sale.totalSales)}</span>
                </div>
              ))}
            </div>
            {renderLineChart(monthlySales, "totalSales", "_id", "#EC4899", "ج.م", "القيمة الإجمالية")}
          </div>

          {/* المنتجات ذات المخزون المنخفض */}
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">المنتجات ذات المخزون المنخفض</h2>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="space-y-4">
              {lowStockItems?.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex items-center flex-col gap-2 md:gap-0 md:flex-row justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-200"
                >
                  <span className="text-foreground">{item.productName}</span>
                  <span className="text-primary font-medium">{item.quantity} قطعة</span>
                </div>
              ))}
            </div>
            {renderLineChart(lowStockItems, "quantity", "productName", "#F43F5E", "قطع", "القيمة الإجمالية")}
          </div>

          {/* نسبة الإيرادات لكل منتج */}
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">نسبة الإيرادات لكل منتج</h2>
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
                  <span className="text-primary font-medium">{product.percentage.toFixed(2)}%</span>
                </div>
              ))}
            </div>
            {renderLineChart(revenuePercentageByProduct, "percentage", "productName", "#0EA5E9", "%", "النسبه")}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;