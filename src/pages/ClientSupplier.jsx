import { useState, useEffect } from "react";
import { useClientSupplier } from "../context/ClientSupplierContext";
import { toast } from "sonner";
import ClientSupplierForm from "../components/ClientSupplierForm";
import ClientSupplierTable from "../components/ClientSupplierTable";

export default function ClientSupplier() {
  const {
    clientsSuppliers,
    addClientSupplier,
    deleteClientSupplier,
    updateClientSupplier,
    loading,
    fetchClientsSuppliers,
    payClientSupplier
  } = useClientSupplier();

  const [editClientSupplier, setEditClientSupplier] = useState(null);
  const [forms, setForms] = useState([
    {
      name: "",
      type: "client",
      phone: "",
      address: "",
      transactionType: "sale",
      transactionAmount: "",
    },
  ]);

  useEffect(() => {
    fetchClientsSuppliers(); 
  }, []);

  const handleAddForm = () => {
    setForms((prevForms) => [
      ...prevForms,
      {
        name: "",
        type: "client",
        phone: "",
        address: "",
        transactionType: "sale",
        transactionAmount: "",
      },
    ]);
  };

  const handleInputChange = (index, field, value) => {
    setForms((prevForms) => {
      const updatedForms = [...prevForms];
      updatedForms[index][field] = value;
      return updatedForms;
    });
  };

  const handleRemoveForm = (index) => {
    const updatedForms = forms.filter((_, i) => i !== index);
    setForms(updatedForms);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      if (editClientSupplier) {
        // تحديث العميل/المورد المحدد
        await updateClientSupplier(editClientSupplier._id, {
          name: forms[0].name,
          type: forms[0].type,
          phone: forms[0].phone,
          address: forms[0].address,
          transactions: [
            {
              type: forms[0].transactionType,
              amount: Number(forms[0].transactionAmount),
            },
          ],
        });
        setEditClientSupplier(null);
      } else {
        // إضافة جميع النماذج كعملاء/موردين جدد بالتنسيق الصحيح
        const formattedForms = forms.map((form) => ({
          name: form.name,
          type: form.type,
          phone: form.phone,
          address: form.address,
          transactions: [
            {
              type: form.transactionType,
              amount: Number(form.transactionAmount),
            },
          ],
        }));
  
        for (const form of formattedForms) {
          try {
            await addClientSupplier(form);
          } catch (error) {
            console.error("حدث خطأ في إضافة العميل/المورد:", error);
          }
        }
      }
  
      // إعادة تعيين النماذج بعد الإضافة أو التحديث
      setForms([
        {
          name: "",
          type: "client",
          phone: "",
          address: "",
          transactionType: "sale",
          transactionAmount: "",
        },
      ]);
  
      // إعادة جلب البيانات لتحديث الجدول
      await fetchClientsSuppliers();
    } catch (error) {
      console.error("حدث خطأ:", error);
      toast.error("❌ حدث خطأ أثناء إضافة أو تحديث العميل/المورد");
    }
  };

  

  return (
    <div className="bg-background p-4">
      <div className="flex items-center flex-wrap gap-2 md:justify-between">
        <button
          type="button"
          onClick={handleAddForm}
          className="p-2 block bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          أضافه صنف اخر +
        </button>
        <h1 className="flex-1 md:text-2xl text-center">العملاء والموردين</h1>
      </div>

      <ClientSupplierForm
        forms={forms}
        handleInputChange={handleInputChange}
        handleRemoveForm={handleRemoveForm}
        loading={loading}
        onSubmit={handleSubmit}
        editMode={!!editClientSupplier}
        onCancelEdit={() => {
          setEditClientSupplier(null);
          setForms([
            {
              name: "",
              type: "client",
              phone: "",
              address: "",
              transactionType: "sale",
              transactionAmount: "",
            },
          ]);
        }}
      />

      {clientsSuppliers && clientsSuppliers.length > 0 && (
        <ClientSupplierTable
          data={clientsSuppliers}
          onEdit={(clientSupplier) => {
            setEditClientSupplier(clientSupplier);
            setForms([
              {
                name: clientSupplier.name,
                type: clientSupplier.type,
                phone: clientSupplier.phone,
                address: clientSupplier.address,
                transactionType: clientSupplier.transactions?.[0]?.type || "sale",
                transactionAmount: clientSupplier.transactions?.[0]?.amount || "",
              },
            ]);
          }}
          onDelete={deleteClientSupplier}
          onPay={payClientSupplier}
        />
      )}
    </div>
  );
}