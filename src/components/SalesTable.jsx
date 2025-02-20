// components/SalesTable.jsx
import React from "react";
import { Pencil, Trash } from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export default function SalesTable({ data, onEdit, onDelete, textName, textTitle  }) {
  const { fetchInventory } = useInventory();
  return (
    <>
      <div className="mt-8 overflow-x-scroll scrollbar-hide">
        <h2 className="text-2xl font-bold text-foreground mb-4">عمليات {textTitle} المضافة</h2>
        <table className="w-full min-w-[1000px] bg-card text-foreground rounded-lg shadow-lg">
          <thead>
            <tr className="border bg-primary border-border text-white">
              <td className="p-3">{textName}</td>
              <td className="p-3">السنه</td>
              <td className="p-3">اسم المنتج</td>
              <td className="p-3">الكمية</td>
              <td className="p-3">السعر</td>
              <td className="p-3">المبلغ الإجمالي</td>
              <td className="p-3 text-center">الإجراءات</td>
            </tr>
          </thead>
          <tbody>
            {data.map((sale) => (
              <React.Fragment key={sale._id}> 
                {sale.products.map((product, index) => (
                  <tr key={product._id} className="border border-border">
                    {index === 0 && (
                      <td rowSpan={sale.products.length} className="p-3">
                        {sale.customerName || sale.supplierName}
                      </td>
                    )}
                    {index === 0 && (
                      <td rowSpan={sale.products.length} className="p-3">
                        {sale.year}
                      </td>
                    )}
                    <td className="p-3">{product.productName}</td>
                    <td className="p-3">{product.quantity}</td>
                    <td className="p-3">{product.price} ج.م</td>
                    <td className="p-3">{product.totalAmount} ج.م</td>
                    {index === 0 && (
                      <td rowSpan={sale.products.length} className="p-3">
                        <button
                          onClick={() => onEdit(sale)}
                          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={async () => {
                            await onDelete(sale._id);
                            fetchInventory();
                          }}
                          className="bg-red-500 mr-2 text-white p-2 rounded-lg hover:bg-red-600 transition"
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>

        </table>
        {/* نص توجيهي للتمرير */}

      </div>
      <div className="sm:hidden text-sm text-gray-500 text-center mt-2">
        اسحب لرؤية المزيد ←
      </div>
    </>
  );
}