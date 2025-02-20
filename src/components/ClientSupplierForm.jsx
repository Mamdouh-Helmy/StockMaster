import React, { useEffect } from "react";
import Loading from "./Loading/Loading";
import Select from "react-select";

export default function ClientSupplierForm({
  forms,
  handleInputChange,
  handleRemoveForm,
  loading,
  onSubmit,
  editMode,
  onCancelEdit,
}) {
  // تعريف الخيارات للنوع (عميل/مورد)
  const typeOptions = [
    { value: "client", label: "عميل" },
    { value: "supplier", label: "مورد" },
  ];

  // تعريف الخيارات لنوع المعاملة
  const transactionTypeOptions = [
    { value: "sale", label: "بيع" },
    { value: "purchase", label: "شراء" },
  ];

  // مراقبة تغييرات النوع (type) وتحديث نوع المعاملة (transactionType) تلقائيًا
  useEffect(() => {
    forms.forEach((form, index) => {
      if (form.type === "client" && form.transactionType !== "sale") {
        handleInputChange(index, "transactionType", "sale");
      } else if (form.type === "supplier" && form.transactionType !== "purchase") {
        handleInputChange(index, "transactionType", "purchase");
      }
    });
  }, [forms, handleInputChange]);
  

  return (
    <form
      onSubmit={onSubmit}
      className="bg-card p-3 m-auto md:p-6 rounded-lg shadow-lg w-full my-6 max-w-3xl"
    >
      <h2 className="text-xl font-bold text-foreground mb-6 text-center">
        {editMode ? "تعديل بيانات العميل/المورد" : "إضافة عميل/مورد جديد"}
      </h2>

      <div className="space-y-4">
        {forms.map((form, index) => (
          <div key={index} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* الاسم */}
              <div>
                <label className="block mb-3 text-[16px] text-foreground">الاسم</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={(e) => handleInputChange(index, "name", e.target.value)}
                  placeholder="الاسم"
                  className="w-full p-2 bg-input text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* النوع (عميل / مورد) */}
              <div>
                <label className="block mb-3 text-[16px] text-foreground">النوع</label>
                <Select
                  options={typeOptions}
                  value={typeOptions.find((option) => option.value === form.type)}
                  onChange={(selectedOption) =>
                    handleInputChange(index, "type", selectedOption.value)
                  }
                  placeholder="اختر النوع"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable={false}
                  isSearchable={false}
                />
              </div>

              {/* الهاتف */}
              <div>
                <label className="block mb-3 text-[16px] text-foreground">الهاتف</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={(e) => handleInputChange(index, "phone", e.target.value)}
                  placeholder="الهاتف"
                  className="w-full p-2 bg-input text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* العنوان */}
              <div>
                <label className="block mb-3 text-[16px] text-foreground">العنوان</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={(e) => handleInputChange(index, "address", e.target.value)}
                  placeholder="العنوان"
                  className="w-full p-2 bg-input text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* نوع المعاملة */}
              <div>
                <label className="block mb-3 text-[16px] text-foreground">نوع المعاملة</label>
                <Select
                  options={transactionTypeOptions}
                  value={transactionTypeOptions.find((option) => option.value === form.transactionType)}
                  onChange={(selectedOption) =>
                    handleInputChange(index, "transactionType", selectedOption.value)
                  }
                  placeholder="اختر نوع المعاملة"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable={false}
                  isSearchable={false}
                />
              </div>

              {/* المبلغ */}
              <div>
                <label className="block mb-3 text-[16px] text-foreground">المبلغ</label>
                <input
                  type="number"
                  name="transactionAmount"
                  value={form.transactionAmount}
                  onChange={(e) => handleInputChange(index, "transactionAmount", e.target.value)}
                  placeholder="المبلغ"
                  className="w-full p-2 bg-input text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* زر حذف النموذج */}
            <button
              type="button"
              onClick={() => handleRemoveForm(index)}
              className="text-red-500 hover:text-red-700 mt-2 block m-auto text-center"
            >
              حذف النموذج
            </button>

            {/* فاصل بين النماذج */}
            {index < forms.length - 1 && <hr className="my-4" />}
          </div>
        ))}
      </div>

      {/* زر الحفظ */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center text-[18px] mt-6 bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
      >
        {loading ? <Loading /> : <div>{editMode ? "تحديث البيانات" : "إضافة عميل/مورد"}</div>}
      </button>

      {/* زر إلغاء التعديل */}
      {editMode && (
        <button
          type="button"
          onClick={onCancelEdit}
          className="w-full text-[18px] mt-2 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
        >
          إلغاء التعديل
        </button>
      )}
    </form>
  );
}