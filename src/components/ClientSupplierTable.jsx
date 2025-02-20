import { Pencil, DollarSign, Trash } from "lucide-react";
import Swal from "sweetalert2";

export default function ClientSupplierTable({ data, onEdit, onDelete, onPay }) {

    const handlePayment = (id) => {
        Swal.fire({
            title: "أدخل مبلغ الدفع",
            input: "number",
            inputPlaceholder: "أدخل المبلغ هنا...",
            showCancelButton: true,
            confirmButtonText: "دفع",
            cancelButtonText: "إلغاء",
            background: "hsl(210, 20%, 10%)", // خلفية داكنة
            color: "#ffffff", // لون النص أبيض
            confirmButtonColor: "#1e90ff", // زر التأكيد أزرق فاتح
            cancelButtonColor: "#ff4757", // زر الإلغاء أحمر
            customClass: {
                popup: "custom-popup",
                input: "custom-input",
                confirmButton: "custom-confirm",
                cancelButton: "custom-cancel",
            },
            inputValidator: (value) => {
                if (!value || isNaN(value) || value <= 0) {
                    return "يرجى إدخال مبلغ صالح!";
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                onPay(id, parseFloat(result.value));
            }
        });
    };


    return (
        <>
            <div className="mt-8 overflow-x-scroll scrollbar-hide">
                <h2 className="text-2xl font-bold text-foreground mb-4">قائمة العملاء والموردين</h2>
                <table className="w-full min-w-[1100px] bg-card text-foreground rounded-lg shadow-lg">
                    <thead>
                        <tr className="border bg-primary border-border text-white">
                            <th className="p-3 text-[16px] md:text-base text-center">الاسم</th>
                            <th className="p-3 text-[16px] md:text-base text-center">النوع</th>
                            <th className="p-3 text-[16px] md:text-base text-center">نوع المعامله</th>
                            <th className="p-3 text-[16px] md:text-base text-center">المبلغ</th>
                            <th className="p-3 text-[16px] md:text-base text-center">السنة</th>
                            <th className="p-3 text-[16px] md:text-base text-center">الهاتف</th>
                            <th className="p-3 text-[16px] md:text-base text-center">العنوان</th>
                            <th className="p-3 text-[16px] md:text-base text-center">🟢 لِيَّا / عَلَيَّا 🔴</th>
                            <th className="p-3 text-[16px] md:text-base text-center">الإجراءات</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data
                            .filter((clientSupplier) => clientSupplier._id) // تأكد من أن العنصر يحتوي على _id
                            .map((clientSupplier) => {
                                const transaction = clientSupplier.transactions?.slice(-1)[0];
                                const year = transaction ? new Date(transaction.date).getFullYear() : "لا يوجد";

                                return (
                                    <tr key={clientSupplier._id} className="border border-border">
                                        <td className="p-3 text-[16px] md:text-base text-center">{clientSupplier.name}</td>
                                        <td className="p-3 text-[16px] md:text-base text-center">
                                            {clientSupplier.type === "client" ? "عميل" : "مورد"}
                                        </td>
                                        <td className="p-3 text-[16px] md:text-base text-center">
                                            {transaction ? (transaction.type === "sale" ? "بيع" : "شراء") : "لا يوجد معاملات"}
                                        </td>
                                        <td className="p-3 text-[16px] md:text-base text-center">{transaction ? transaction.amount : "0"}</td>
                                        <td className="p-3 text-[16px] md:text-base text-center">{year}</td>
                                        <td className="p-3 text-[16px] md:text-base text-center">{clientSupplier.phone}</td>
                                        <td className="p-3 text-[16px] md:text-base text-center">{clientSupplier.address}</td>

                                        {/* ✅ عرض الرصيد بلون واضح */}
                                        <td className={`p-3 text-center text-[16px] md:text-base font-bold ${clientSupplier.balance > 0
                                            ? "text-green-500"
                                            : clientSupplier.balance < 0
                                                ? "text-red-500"
                                                : "text-white"
                                            }`}>
                                            {clientSupplier.balance > 0
                                                ? `لِيَّا ${clientSupplier.balance} ج`
                                                : clientSupplier.balance < 0
                                                    ? `عَلَيَّا ${Math.abs(clientSupplier.balance)} ج`
                                                    : "صفر"}
                                        </td>


                                        <td className="p-3">
                                            <div className="flex">
                                                <button
                                                    onClick={() => onEdit(clientSupplier)}
                                                    className="bg-blue-500 ml-3 text-white p-2 rounded-lg hover:bg-blue-600 transition"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(clientSupplier._id)}
                                                    className="bg-red-500 ml-2 text-white p-2 rounded-lg hover:bg-red-600 transition"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handlePayment(clientSupplier._id)}
                                                    className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
                                                >
                                                    <DollarSign size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
            <div className="sm:hidden text-sm text-gray-500 text-center mt-2">
                اسحب لرؤية المزيد ←
            </div>
        </>
    );
}
