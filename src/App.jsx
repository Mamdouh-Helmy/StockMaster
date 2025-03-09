import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext"; // <-- استدعينا useAuth
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
import Profile from "./pages/Profile";
import { useEffect } from "react";
import { setFavicon } from "./assets/setFavicon"; // <-- لاستدعاء الدالة

// تعريف الراوتر
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
      element: <ProtectedLayout />,
      children: [
        { path: "/dashboard", element: <Dashboard /> },
        { path: "/sales", element: <Sales /> },
        { path: "/purchases", element: <Purchases /> },
        { path: "/inventory", element: <Inventory /> },
        { path: "/ClientSupplier", element: <ClientSupplier /> },
        { path: "/reports", element: <Reports /> },
        { path: "/profile", element: <Profile /> },
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

function AppContent() {
  const { user, fetchPublicProfileNoUsername } = useAuth();


  useEffect(() => {
    // إذا لدينا user ولديه لوجو
    if (user?.logo) {
      setFavicon(user.logo);
    } else {
      // لا يوجد user أو لا يوجد logo
      // نجلب اللوجو العام (لأول مستخدم مثلاً)
      fetchPublicProfileNoUsername()
        .then((data) => {
          if (data.logo) {
            setFavicon(data.logo);
          } else {
            setFavicon(); // أيقونة افتراضية
          }
        })
        .catch((err) => {
          console.error("خطأ في جلب اللوجو العام:", err);
          setFavicon(); // fallback
        });
    }
  }, [user, fetchPublicProfileNoUsername]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        theme="dark"
        richColors
        toastOptions={{
          style: { fontSize: "20px", padding: "15px" },
        }}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SalesProvider>
        <PurchasesProvider>
          <InventoryProvider>
            <ClientSupplierProvider>
              <ReportProvider>
                <div dir="rtl" className="min-h-screen bg-background text-foreground">
                  <AppContent />
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
