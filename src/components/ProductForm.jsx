import React from "react";
import Loading from "./Loading/Loading";
import Select from "react-select";

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
  clientsSuppliers, // إضافة قائمة العملاء والموردين
  textSelcectbox2,
  TextclientsSuppliers
}) {
  const inventoryOptions = inventory.map((item) => ({
    value: item._id,
    label: item.productName,
  }));

  const clientOptions = clientsSuppliers
    .filter((client) => client.type === TextclientsSuppliers) // تصفية العملاء فقط
    .map((client) => ({
      value: client.name,
      label: client.name,
    }));

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
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="w-full space-y-4">
            {products.map((product, index) => (
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
                          disabled={true}
                        />
                      ) : (
                        <Select
                          options={inventoryOptions}
                          value={inventoryOptions.find(option => option.value === product.productId) || null}
                          onChange={(selectedOption) =>
                            handleProductChange(
                              index,
                              "productId",
                              selectedOption ? selectedOption.value : ""
                            )
                          }
                          placeholder="اختر منتج"
                          className="react-select-container"
                          classNamePrefix="react-select"
                          isClearable
                          isSearchable
                          noOptionsMessage={() => "لا توجد منتجات متاحة"}
                        />
                      )
                    ) : (
                      <input
                        type="text"
                        value={product.productName}
                        onChange={(e) =>
                          handleProductChange(index, "productName", e.target.value)
                        }
                        placeholder="اسم المنتج"
                        className="w-full p-2 bg-input text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block mb-3 text-[16px] text-foreground">
                      الكمية
                    </label>
                    <input
                      type="text"
                      value={product.quantity}
                      onChange={(e) => {
                        const value = validateInput(e.target.value);
                        handleProductChange(index, "quantity", value);
                      }}
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
                      onChange={(e) => {
                        const value = validateInput(e.target.value);
                        handleProductChange(index, "price", value);
                      }}
                      placeholder="السعر"
                      className="w-full p-2 bg-input text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      min="1"
                      pattern="[1-9][0-9]*"
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
        </div>
        <hr />
        <label className="block text-[16px] text-foreground">{textLebalInput}</label>
        <Select
          options={clientOptions}
          value={clientOptions.find(option => option.value === customerName) || null}
          onChange={(selectedOption) =>
            setCustomerName(selectedOption ? selectedOption.value : "")
          }
          placeholder={textSelcectbox2 || "اختر عميل"}
          className="react-select-container"
          classNamePrefix="react-select"
          isClearable
          isSearchable
          noOptionsMessage={() => "لا توجد عملاء متاحة"}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center text-[18px] mt-6 bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
      >
        {loading ? (
          <Loading />
        ) : (
          <div>{editMode ? "تحديث العملية" : textButton}</div>
        )}
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