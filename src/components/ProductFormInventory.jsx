import React from "react";
import Loading from "./Loading/Loading";

export default function ProductFormInventory({
  products,
  handleProductChange,
  handleAddProduct,
  handleRemoveProduct,
  loading,
  onSubmit,
  editMode,
  onCancelEdit,
  editModeText1,
  editModeText2,
  textButton,
}) {
  const validateInput = (value) => {
    if (/[+-]/.test(value)) {
      return "";
    }
    value = value.replace(/^0+/, "");

    return value > 0 ? value : "";
  };
  return (
    <form
      onSubmit={onSubmit}
      className="bg-card p-3 m-auto md:p-6 rounded-lg shadow-lg w-full my-6 max-w-3xl"
    >
      <h2 className="text-xl font-bold text-foreground mb-6 text-center">
        {editMode ? editModeText1 : editModeText2}
      </h2>

      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={index} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-3 text-[16px] text-foreground">اسم المنتج</label>
                <input
                  type="text"
                  value={product.productName}
                  onChange={(e) => handleProductChange(index, "productName", e.target.value)}
                  placeholder="اسم المنتج"
                  className="w-full p-2 bg-input text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block mb-3 text-[16px] text-foreground">الكمية</label>
                <input
                  type="text"
                  value={product.quantity}
                  onChange={(e) => { const value = validateInput(e.target.value); handleProductChange(index, "quantity", value) }}
                  placeholder="الكمية"
                  className="w-full p-2 bg-input text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  min="1" // لا يمكن إدخال قيم أقل من 1
                  pattern="[1-9][0-9]*" // لا يمكن بدء القيمة بصفر
                />
              </div>

              <div>
                <label className="block mb-3 text-[16px] text-foreground">السعر</label>
                <input
                  type="text"
                  value={product.price}
                  onChange={(e) => { const value = validateInput(e.target.value); handleProductChange(index, "price", value) }}
                  placeholder="السعر"
                  className="w-full p-2 bg-input text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  min="1" // لا يمكن إدخال قيم أقل من 1
                  pattern="[1-9][0-9]*" // لا يمكن بدء القيمة بصفر
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleRemoveProduct(index)}
              className="text-red-500 hover:text-red-700 mt-2 block m-auto text-center"
            >
              حذف المنتج
            </button>

            {index < products.length - 1 && <hr className="my-4" />}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center text-[18px] mt-6 bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
      >
        {loading ? <Loading /> : <div>{editMode ? "تحديث المنتج" : textButton}</div>}
      </button>
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