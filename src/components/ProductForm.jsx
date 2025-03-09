import Loading from "./Loading/Loading";
import CreatableSelect from "react-select/creatable";

export default function ProductForm({
  products,
  inventory = [],
  handleProductChange,
  handleRemoveProduct,
  customerName,
  setCustomerName,
  loading,
  onSubmit,
  editMode,
  onCancelEdit,
  editModeText1,
  editModeText2,
  textLebalInput,
  textButton,
  isSalesPage,
  clientsSuppliers,
  textSelcectbox2,
  TextclientsSuppliers,
  previousProducts = [],
}) {
  // تحويل الخيارات إلى الشكل المطلوب
  const inventoryOptions = inventory.map((item) => ({
    value: item._id,
    label: item.productName,
  }));

  const clientOptions = clientsSuppliers
    .filter((client) => client.type === TextclientsSuppliers)
    .map((client) => ({
      value: client.name,
      label: client.name,
    }));

  const previousProductOptions = previousProducts.map((product) => ({
    value: product.productName,
    label: product.productName,
  }));

  // Utility to validate numeric inputs
  const validateNumberInput = (value) =>
    /[+-]/.test(value) ? "" : value.replace(/^0+/, "") > 0 ? value : "";

  // دالة لإنشاء select بامكانية إنشاء خيار جديد أو fallback إلى input إذا لم تتوفر الخيارات
  const renderSelectOrInput = (options, value, onChange, placeholder, noOptionsMessage) => {
    if (options && options.length > 0) {
      return (
        <CreatableSelect
          isClearable
          isSearchable
          options={options}
          // إذا القيمة غير موجودة ضمن الخيارات، يبني كائن من القيمة مباشرةً
          value={options.find((option) => option.value === value) || (value ? { value, label: value } : null)}
          onChange={(selectedOption) => onChange(selectedOption ? selectedOption.value : "")}
          onCreateOption={(inputValue) => {
            // هنا يمكنك التعامل مع إضافة الخيار الجديد (مثلاً تحديث حالة الخيارات)
            onChange(inputValue);
          }}
          placeholder={placeholder}
          className="react-select-container"
          classNamePrefix="react-select"
          noOptionsMessage={() => noOptionsMessage}
        />
      );
    } else {
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-2 bg-input text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      );
    }
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
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="w-full space-y-4">
            {products.map((product, index) => {
              const quantity = parseFloat(product.quantity) || 0;
              const price = parseFloat(product.price) || 0;
              const total = quantity * price;

              return (
                <div key={index} className="space-y-4 md:space-y-9">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-3 text-[16px] text-foreground">
                        اسم المنتج
                      </label>
                      {isSalesPage ? (
                        editMode ? (
                          <input
                            type="text"
                            value={product.productName}
                            onChange={(e) =>
                              handleProductChange(index, "productName", e.target.value)
                            }
                            placeholder="اسم المنتج"
                            className="w-full p-2 bg-input text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                            disabled
                          />
                        ) : (
                          renderSelectOrInput(
                            inventoryOptions,
                            product.productId,
                            (value) => handleProductChange(index, "productId", value),
                            "اختر منتج",
                            "لا توجد منتجات متاحة"
                          )
                        )
                      ) : (
                        renderSelectOrInput(
                          previousProductOptions,
                          product.productName,
                          (value) => handleProductChange(index, "productName", value),
                          "اختر منتج",
                          "لا توجد منتجات متاحة"
                        )
                      )}
                    </div>

                    <div>
                      <label className="block mb-3 text-[16px] text-foreground">
                        الكمية
                      </label>
                      <input
                        type="text"
                        value={product.quantity}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "quantity",
                            validateNumberInput(e.target.value)
                          )
                        }
                        placeholder="الكمية"
                        className="w-full p-2 bg-input text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        min="1"
                        pattern="[1-9][0-9]*"
                      />
                    </div>

                    <div>
                      <label className="block mb-3 text-[16px] text-foreground">
                        السعر
                      </label>
                      <input
                        type="text"
                        value={product.price}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "price",
                            validateNumberInput(e.target.value)
                          )
                        }
                        placeholder="السعر"
                        className="w-full p-2 bg-input text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        min="1"
                        pattern="[1-9][0-9]*"
                      />
                    </div>
                  </div>

                  <div className="bg-[#2c3e50] p-3 rounded-lg shadow-md border border-gray-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mt-4 text-xs sm:text-sm">
                    {/* الكمية */}
                    <div className="flex items-center gap-1 sm:gap-2 text-gray-300 font-medium">
                      <span className="font-bold text-blue-400">الكمية:</span>
                      <span className="bg-blue-500/20 px-2 py-1 rounded text-blue-300">{quantity || 0}</span>
                    </div>

                    {/* السعر */}
                    <div className="flex items-center gap-1 sm:gap-2 text-gray-300 font-medium">
                      <span className="font-bold text-yellow-400">السعر:</span>
                      <span className="bg-yellow-500/20 px-2 py-1 rounded text-yellow-300">{price || 0} ج.م</span>
                    </div>

                    {/* الإجمالي */}
                    <div className="flex items-center gap-1 sm:gap-2 text-green-400 font-semibold">
                      <span className="font-bold text-green-300">الإجمالي:</span>
                      <span className="bg-green-500/20 px-2 py-1 rounded text-green-300">{total.toFixed(2) || 0} ج.م</span>
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
              );
            })}
          </div>
        </div>

        <hr />
        <label className="block text-[16px] text-foreground">{textLebalInput}</label>
        {renderSelectOrInput(
          clientOptions,
          customerName,
          setCustomerName,
          textSelcectbox2 || "اختر عميل",
          "لا توجد عملاء متاحة"
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center text-[18px] mt-6 bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
      >
        {loading ? <Loading /> : <div>{editMode ? "تحديث العملية" : textButton}</div>}
      </button>
      {editMode && (
        <button
          type="button"
          onClick={onCancelEdit}
          className="w-full text-[16px] mt-2 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
        >
          إلغاء التعديل
        </button>
      )}
    </form>
  );
}
