import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SalesProvider } from "./context/SalesContext";
import { PurchasesProvider } from "./context/PurchasesContext";
import { InventoryProvider } from "./context/InventoryContext";
import { ClientSupplierProvider } from "./context/ClientSupplierContext";
import { ReportProvider } from "./context/ReportContext";
import Login from "./pages/Login";
import ProtectedLayout from "./layout/ProtectedLayout";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import { Toaster } from "sonner";
import ClientSupplier from "./pages/ClientSupplier";

// تعريف الراوتر باستخدام الطريقة الجديدة
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      element: <ProtectedLayout />, // غلاف الحماية
      children: [
        { path: "/dashboard", element: <Dashboard /> },
        { path: "/sales", element: <Sales /> },
        { path: "/purchases", element: <Purchases /> },
        { path: "/inventory", element: <Inventory /> },
        { path: "/ClientSupplier", element: <ClientSupplier /> },
        { path: "/reports", element: <Reports /> },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/dashboard" replace />,
    },
  ],
  {
    future: {
      v7_startTransition: true, 
    },
  }
);


function App() {
  return (
    <AuthProvider>
      <SalesProvider>
        <PurchasesProvider>
          <InventoryProvider>
            <ClientSupplierProvider>
              <ReportProvider>
                <div dir="rtl" className="min-h-screen bg-background text-foreground">
                  <RouterProvider router={router} />
                  <Toaster
                    position="top-center"
                    theme="dark"
                    richColors
                    toastOptions={{
                      style: { fontSize: "20px", padding: "15px" },
                    }}
                  />
                </div>
              </ReportProvider>
            </ClientSupplierProvider>
          </InventoryProvider>
        </PurchasesProvider>
      </SalesProvider>
    </AuthProvider>
  );
}

export default App;
