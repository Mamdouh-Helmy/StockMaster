import { Pencil, Trash } from "lucide-react";

export default function InventoryTable({ data, onEdit, onDelete }) {
  return (
    <>
      <div className="mt-8 overflow-x-scroll scrollbar-hide">
        <h2 className="text-2xl font-bold text-foreground mb-4">المنتجات في المخزون</h2>
        <table className="w-full min-w-[1000px] bg-card text-foreground rounded-lg shadow-lg">
          <thead>
            <tr className="border bg-primary border-border text-white">
              <td className="p-3">اسم المنتج</td>
              <td className="p-3">السنة</td>
              <td className="p-3">الكمية</td>
              <td className="p-3">السعر</td>
              <td className="p-3">القيمة الإجمالية</td>
              <td className="p-3 text-center">الإجراءات</td>
            </tr>
          </thead>
          <tbody>
            {data.map((product) => (
              <tr key={product._id} className="border border-border">
                <td className="p-3">{product.productName}</td>
                <td className="p-3">{product.year}</td>
                <td className="p-3">{product.quantity}</td>
                <td className="p-3">{product.price} ج.م</td>
                <td className="p-3">{product.totalValue} ج.م</td>
                <td className="p-3">
                  <button
                    onClick={() => onEdit(product)}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(product._id)}
                    className="bg-red-500 mr-2 text-white p-2 rounded-lg hover:bg-red-600 transition"
                  >
                    <Trash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sm:hidden text-sm text-gray-500 text-center mt-2">
        اسحب لرؤية المزيد ←
      </div>
    </>
  );
}