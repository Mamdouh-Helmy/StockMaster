import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { Menu } from "lucide-react"; // أيقونة القائمة

const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // إغلاق الشريط الجانبي عند النقر على أي رابط
  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex overflow-hidden">
      {/* زر القائمة */}

      {/* الشريط الجانبي */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={handleSidebarToggle} />

      {/* المحتوى الرئيسي */}
      <div className="w-full overflow-hidden p-2 bg-background text-foreground">
        <div className="flex items-center justify-between border-b border-border">
          <button
            className="p-2 duration-500 hover:bg-[#273d54] hover:rounded-full"
            onClick={handleSidebarToggle}
          >
            <Menu />
          </button>
          <h3 className="p-3">أستاذ محمود</h3>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedLayout;
