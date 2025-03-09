import { Pencil, DollarSign, Trash, Eye } from "lucide-react";
import Swal from "sweetalert2";
import { useClientSupplier } from "../context/ClientSupplierContext";
import { toast } from "sonner";

export default function ClientSupplierTable({ data, onEdit, onDelete, onPay }) {
  const {
    addNoteToClientSupplier,
    fetchClientsSuppliers,
    editNoteToClientSupplier,
    deleteNoteFromClientSupplier,
  } = useClientSupplier();

  // دوال تنسيق الأرقام والتاريخ والوقت
  const formatNumber = (number) =>
    new Intl.NumberFormat("ar-EG").format(number);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG");
  };
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // دالة الدفع
  const handlePayment = (id) => {
    Swal.fire({
      title: "أدخل مبلغ الدفع",
      input: "number",
      inputPlaceholder: "أدخل المبلغ هنا...",
      showCancelButton: true,
      confirmButtonText: "دفع",
      cancelButtonText: "إلغاء",
      background: "hsl(210, 20%, 10%)",
      color: "#fff",
      confirmButtonColor: "#1e90ff",
      cancelButtonColor: "#ff4757",
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

  // دالة عرض الملاحظات
  // دالة عرض الملاحظات مع أزرار التعديل والحذف
  const handleViewNotes = (clientSupplier) => {
    if (!clientSupplier.notes || clientSupplier.notes.length === 0) {
      Swal.fire({
        title: `الملاحظات لـ ${clientSupplier.name}`,
        customClass: {
          title: "small-title", // تطبيق فئة CSS مخصصة على العنوان
        },
        text: "⚠️ لا توجد ملاحظات مسجلة",
        confirmButtonText: "إغلاق",
        background: "#121212",
        color: "#fff",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    let notesContent = `
            <style>
                table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: center;
                    min-width: 400px;
                    background-color: #1e1e1e;
                }
                th, td {
                    padding: 10px;
                    font-size: 18px;
                    color: #fff;
                }
                th, td:not(.text-note) {
                    white-space: nowrap;
                }
                th {
                    background-color: #333;
                }
                tr {
                    border-bottom: 1px solid #444;
                }
                button {
                    margin: 0 4px;
                    padding: 6px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                .edit-btn {
                    background-color: #1e90ff;
                    color: #fff;
                }
                .delete-btn {
                    background-color: #ff4757;
                    color: #fff;
                }
                .icon {
                    font-size: 18px;
                }
                @media (max-width: 768px) {
                    th, td { font-size: 16px; padding: 8px; }
                    button { font-size: 14px; padding: 5px 8px; }
                    .icon { font-size: 16px; }
                }
                @media (max-width: 480px) {
                    th, td { font-size: 14px; padding: 6px; }
                    button { font-size: 12px; padding: 4px 6px; }
                    .icon { font-size: 14px; }
                }
            </style>
            <div style="max-width: 100%; overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>🗓️ التاريخ</th>
                            <th>⏰ الوقت</th>
                            <th>💬 الملاحظة</th>
                            <th>⚙️ الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>`;

    clientSupplier.notes.forEach((note) => {
      notesContent += `
                <tr>
                    <td>${formatDate(note.date)}</td>
                    <td>${formatTime(note.date)}</td>
                    <td class="text-note">${note.text}</td>
                    <td>
                        <button class="edit-btn" data-note-id="${note._id}">
                            <span class="icon">📝</span> تعديل
                        </button>
                        <button class="delete-btn" data-note-id="${note._id}">
                            <span class="icon">🗑️</span> حذف
                        </button>
                    </td>
                </tr>`;
    });

    notesContent += `</tbody></table></div>`;

    Swal.fire({
      title: `الملاحظات لـ ${clientSupplier.name}`,
      customClass: {
        title: "small-title", // تطبيق فئة CSS مخصصة على العنوان
      },
      html: notesContent,
      width: "90%",
      background: "#121212",
      color: "#fff",
      confirmButtonText: "إغلاق",
      confirmButtonColor: "#00bcd4",
      didOpen: () => {
        // إضافة مستمعي أحداث لأزرار التعديل
        const editButtons = document.querySelectorAll(".edit-btn");
        editButtons.forEach((button) => {
          button.addEventListener("click", async () => {
            const noteId = button.getAttribute("data-note-id");
            const note = clientSupplier.notes.find((n) => n._id === noteId);
            if (note) {
              const { value: newText } = await Swal.fire({
                title: "تعديل الملاحظة",
                customClass: {
                  title: "small-title", // تطبيق فئة CSS مخصصة على العنوان
                },
                input: "textarea",
                inputPlaceholder: "اكتب الملاحظة الجديدة هنا...",
                inputValue: note.text,
                showCancelButton: true,
                confirmButtonText: "تحديث",
                cancelButtonText: "إلغاء",
                background: "#1e1e1e",
                color: "#fff",
                confirmButtonColor: "#1e90ff",
                cancelButtonColor: "#ff4757",
                inputValidator: (value) => {
                  if (!value || value.trim() === "") {
                    return "يرجى إدخال نص الملاحظة!";
                  }
                },
              });
              if (newText) {
                await editNoteToClientSupplier(
                  clientSupplier._id,
                  noteId,
                  newText
                );
                fetchClientsSuppliers();
                Swal.fire({
                  icon: "success",
                  title: "✅",
                  text: "تم تحديث الملاحظة بنجاح",
                  customClass: {
                    popup: "custom-swal",
                    confirmButton: "success-btn",
                  },
                });
              }
            }
          });
        });

        // إضافة مستمعي أحداث لأزرار الحذف
        const deleteButtons = document.querySelectorAll(".delete-btn");
        deleteButtons.forEach((button) => {
          button.addEventListener("click", () => {
            const noteId = button.getAttribute("data-note-id");
            Swal.fire({
              title: "هل أنت متأكد من حذف الملاحظة؟",
              customClass: {
                title: "small-title", // تطبيق فئة CSS مخصصة على العنوان
              },
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "نعم، احذف",
              cancelButtonText: "إلغاء",
              background: "#1e1e1e",
              color: "#fff",
              confirmButtonColor: "#1e90ff",
              cancelButtonColor: "#ff4757",
            }).then(async (result) => {
              if (result.isConfirmed) {
                await deleteNoteFromClientSupplier(clientSupplier._id, noteId);
                fetchClientsSuppliers();
                Swal.fire({
                  icon: "error",
                  title: "❌",
                  text: "تم حذف الملاحظة بنجاح",
                  customClass: {
                    popup: "custom-swal",
                    confirmButton: "delete-btn",
                    icon: "delete-icon",
                  },
                });
              }
            });
          });
        });
      },
    });
  };

  // دالة إضافة ملاحظة جديدة
  const handleAddNote = (id) => {
    Swal.fire({
      title: "أدخل نص الملاحظة",

      input: "textarea",
      inputPlaceholder: "اكتب الملاحظة هنا...",
      showCancelButton: true,
      confirmButtonText: "حفظ",
      cancelButtonText: "إلغاء",
      background: "hsl(210, 20%, 10%)",
      color: "#fff",
      confirmButtonColor: "#1e90ff",
      cancelButtonColor: "#ff4757",
      customClass: {
        popup: "custom-popup",
        input: "custom-input",
        confirmButton: "custom-confirm",
        cancelButton: "custom-cancel",
        title: "small-title",
      },
      inputValidator: (value) => {
        if (!value || value.trim() === "") {
          return "يرجى إدخال نص الملاحظة!";
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await addNoteToClientSupplier(id, result.value);
          await fetchClientsSuppliers();
        } catch (error) {
          toast.error("❌ حدث خطأ أثناء إضافة الملاحظة");
        }
      }
    });
  };

  // دالة عرض المعاملات مع فصل التاريخ والوقت وعرض التفاصيل
  const handleViewTransactions = (clientSupplier) => {
    const transactions =
      clientSupplier.type === "supplier"
        ? clientSupplier.transactions.filter((tx) => tx.type === "purchase")
        : clientSupplier.transactions.filter((tx) => tx.type === "sale");

    if (!transactions.length) {
      Swal.fire({
        title: `📜 المعاملات لـ ${clientSupplier.name}`,
        text: "⚠️ لا توجد معاملات سابقة",
        confirmButtonText: "إغلاق",
        background: "#121212",
        color: "#fff",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    let htmlContent = `
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: center;
          min-width: 500px;
        }
        th, td {
          padding: 12px;
          font-size: 22px;
          white-space: nowrap;
        }
        th {
          background-color: #1e1e1e;
          color: #00bcd4;
        }
        tbody {
          color: #ddd;
        }
        tr {
          border-bottom: 1px solid #444;
        }
        ul {
          padding-left: 0;
          list-style-type: none;
          font-size: 20px;
        }
        li {
          display: block;
          font-size: 22px;
        }
        @media (max-width: 768px) {
          th, td { font-size: 18px; padding: 8px; }
          ul, li { font-size: 18px; }
          h2 { font-size: 20px !important; }
          .toatel { font-size: 18px !important; }
        }
        @media (max-width: 480px) {
          th, td { font-size: 16px; padding: 6px; }
          ul, li { font-size: 16px; }
        }
      </style>
      <div style="max-width: 100%; overflow-x: auto; text-align: right;">`;

    // قسم المدفوعات
    if (clientSupplier.payments && clientSupplier.payments.length > 0) {
      htmlContent += `
        <h2 style="color: #00bcd4; font-size: 24px; margin-bottom: 10px;">💳 المدفوعات السابقة</h2>
        <table>
          <thead>
            <tr>
              <th>📅 التاريخ</th>
              <th>⏰ الوقت</th>
              <th>💰 المبلغ المدفوع</th>
            </tr>
          </thead>
          <tbody>`;
      clientSupplier.payments.forEach((pay) => {
        const payDate = formatDate(pay.date);
        const payTime = formatTime(pay.date);
        const payAmount = formatNumber(pay.paymentAmount);
        htmlContent += `
            <tr>
              <td>${payDate}</td>
              <td>${payTime}</td>
              <td><b>${payAmount} جنيه</b></td>
            </tr>`;
      });
      htmlContent += `</tbody></table><br/>`;
    } else {
      htmlContent += `<p style="font-size: 22px; color: #ddd;">🔹 لا توجد مدفوعات سابقة</p><br/>`;
    }

    // قسم المعاملات
    if (transactions.length > 0) {
      htmlContent += `
        <h2 style="color: #00bcd4; font-size: 24px; margin-bottom: 10px;">📜 تفاصيل المعاملات</h2>
        <table>
          <thead>
            <tr>
              <th>📅 التاريخ</th>
              <th>⏰ الوقت</th>
              <th>💰 ليا / عليا</th>
              <th>📄 التفاصيل</th>
            </tr>
          </thead>
          <tbody>`;
      transactions.forEach((tx) => {
        const date = formatDate(tx.date);
        const time = formatTime(tx.date);
        const amount = formatNumber(tx.amount);
        const isSupplier = clientSupplier.type === "supplier";
        const amountType = isSupplier ? "🔴 عليا" : "🟢 ليا";
        let detailsHtml =
          tx.details && tx.details.length > 0 ? `<ul>` : "🔹 لا توجد تفاصيل";
        if (tx.details && tx.details.length > 0) {
          tx.details.forEach((detail) => {
            detailsHtml += `
              <li>
                <i class="fas fa-box"></i> ${detail.productName} - 
                <b>${formatNumber(detail.quantity)}</b> × 
                <b>${formatNumber(detail.price)}</b> = 
                <b style="color: #00bcd4;">${formatNumber(
                  detail.totalAmount
                )}</b>
              </li>`;
          });
          detailsHtml += `</ul>`;
        }
        htmlContent += `
          <tr>
            <td>${date}</td>
            <td>${time}</td>
            <td>${amountType}: <b>${amount} جنيه</b></td>
            <td>${detailsHtml}</td>
          </tr>`;
      });
      htmlContent += `</tbody></table>`;
    } else {
      htmlContent += `<p style="font-size: 22px; color: #ddd;">🔹 لا توجد معاملات</p>`;
    }

    // ملخص الرصيد النهائي
    const balance = clientSupplier.balance;
    let balanceText = "";
    if (balance > 0) {
      balanceText = `🟢 ليا ${formatNumber(balance)} جنيه`;
    } else if (balance < 0) {
      balanceText = `🔴 عليا ${formatNumber(Math.abs(balance))} جنيه`;
    } else {
      balanceText = "رصيد صفر";
    }
    htmlContent += `<br/><div class="toatel" style="font-size: 22px; font-weight: bold; text-align: right; color: ${
      balance >= 0 ? "#00bcd4" : "#ff1744"
    };">الإجمالي: ${balanceText}</div>`;

    htmlContent += `</div>`;

    Swal.fire({
      title: `📜 المعاملات لـ ${clientSupplier.name}`,
      html: htmlContent,
      width: "90%",
      background: "#121212",
      color: "#fff",
      confirmButtonText: "إغلاق",
      confirmButtonColor: "#00bcd4",
    });
  };

  // تقسيم البيانات إلى عملاء وموردين
  const clients = data.filter((item) => item.type === "client");
  const suppliers = data.filter((item) => item.type === "supplier");

  // دالة لرسم صفوف الجدول لقائمة معينة مع عمود الملاحظات
  const renderRows = (list) => {
    return list
      .filter((item) => item._id)
      .map((clientSupplier) => {
        const transaction = clientSupplier.transactions?.slice(-1)[0];
        const year = transaction
          ? new Date(transaction.date).getFullYear()
          : "لا يوجد";
        return (
          <tr key={clientSupplier._id} className="border border-border">
            <td className="p-3 text-[16px] md:text-base whitespace-nowrap text-center flex items-center justify-center gap-1">
              <button
                onClick={() => handleViewTransactions(clientSupplier)}
                className="text-blue-500 py-2 flex items-center gap-2 hover:text-blue-700"
              >
                <Eye size={18} />
                <span className="text-white">{clientSupplier.name}</span>
              </button>
            </td>
            <td className="p-3 text-[16px] md:text-base whitespace-nowrap text-center">
              {clientSupplier.type === "client" ? "عميل" : "مورد"}
            </td>
            <td className="p-3 text-[16px] md:text-base whitespace-nowrap text-center">
              {transaction
                ? transaction.type === "sale"
                  ? "بيع"
                  : "شراء"
                : "لا يوجد معاملات"}
            </td>
            <td className="p-3 text-[16px] md:text-base whitespace-nowrap text-center">
              {transaction ? formatNumber(transaction.amount) : "0"}
            </td>
            <td className="p-3 text-[16px] md:text-base whitespace-nowrap text-center">
              {year}
            </td>
            <td className="p-3 text-[16px] md:text-base whitespace-nowrap text-center">
              {clientSupplier.phone}
            </td>
            <td className="p-3 text-[16px] md:text-base whitespace-nowrap text-center">
              {clientSupplier.address}
            </td>
            {/* عمود الملاحظات مع خط فاصل بين الزرين */}
            <td className="p-3 flex items-center gap-3 text-[16px] whitespace-nowrap md:text-base text-center">
              <button
                onClick={() => handleViewNotes(clientSupplier)}
                className="text-yellow-500 hover:text-yellow-700"
              >
                عرض الملاحظات
              </button>
              <span
                style={{
                  borderLeft: "1px solid #ccc",
                  height: "24px",
                  margin: "0 8px",
                }}
              ></span>
              <button
                onClick={() => handleAddNote(clientSupplier._id)}
                className="text-green-500 hover:text-green-700"
              >
                إضافة ملاحظة
              </button>
            </td>
            <td
              className={`p-3 text-center text-[16px] whitespace-nowrap md:text-base font-bold ${
                clientSupplier.balance > 0
                  ? "text-green-500"
                  : clientSupplier.balance < 0
                  ? "text-red-500"
                  : "text-white"
              }`}
            >
              {clientSupplier.balance > 0
                ? `لِيَّا ${clientSupplier.balance} ج`
                : clientSupplier.balance < 0
                ? `عَلَيَّا ${Math.abs(clientSupplier.balance)} ج`
                : "صفر"}
            </td>
            <td className="p-3 whitespace-nowrap">
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
                  className="bg-green-500 ml-2 text-white p-2 rounded-lg hover:bg-green-600 transition"
                >
                  <DollarSign size={18} />
                </button>
              </div>
            </td>
          </tr>
        );
      });
  };

  return (
    <>
      {/* جدول العملاء */}
      <div className="mt-8 overflow-x-scroll scrollbar-hide">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          قائمة العملاء
        </h2>
        <table className="w-full min-w-[1100px] bg-card text-foreground rounded-lg shadow-lg">
          <thead>
            <tr className="border bg-primary border-border text-white">
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                الاسم
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                النوع
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                نوع المعاملة
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                المبلغ
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                السنة
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                الهاتف
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                العنوان
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                الملاحظات
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                لِيَّا / عَلَيَّا
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>{renderRows(clients)}</tbody>
        </table>
      </div>

      {/* جدول الموردين */}
      <div className="mt-8 overflow-x-scroll scrollbar-hide">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          قائمة الموردين
        </h2>
        <table className="w-full min-w-[1100px] bg-card text-foreground rounded-lg shadow-lg">
          <thead>
            <tr className="border bg-primary border-border text-white">
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                الاسم
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                النوع
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                نوع المعاملة
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                المبلغ
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                السنة
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                الهاتف
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                العنوان
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                الملاحظات
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                لِيَّا / عَلَيَّا
              </th>
              <th className="p-3 text-[16px] md:text-base text-center whitespace-nowrap">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>{renderRows(suppliers)}</tbody>
        </table>
      </div>

      <div className="sm:hidden text-sm text-gray-500 text-center mt-2">
        اسحب لرؤية المزيد ←
      </div>
    </>
  );
}
