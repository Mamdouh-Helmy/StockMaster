import { useState, useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { Menu } from "lucide-react"; // أيقونة القائمة
import { FaUserAlt } from "react-icons/fa"; // أيقونة بديلة للصورة الشخصية

const ProtectedLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuButtonRef = useRef(null);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen) {
        if (
          event.target.closest(".sidebar") ||
          menuButtonRef.current?.contains(event.target)
        ) {
          return;
        }
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isSidebarOpen]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={handleSidebarToggle} />
      <div className="w-full overflow-hidden p-2 bg-background text-foreground">
        <div className="flex items-center justify-between border-b border-border">
          {/* زر القائمة */}
          <button
            ref={menuButtonRef}
            className="p-2 duration-500 hover:bg-[#273d54] hover:rounded-full"
            onClick={handleSidebarToggle}
          >
            <Menu />
          </button>

          {/* قسم معلومات المستخدم */}
          <div className="flex items-center gap-3 p-3">
            {/* صورة المستخدم أو أيقونة بديلة */}
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="User Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center mb-2 bg-gray-700 rounded-full">
                <FaUserAlt className="text-md text-gray-400" />
              </div>
            )}
            {/* اسم المستخدم */}
            <h3 className="font-semibold text-white">
              {user?.name || "اسم المستخدم"}
            </h3>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedLayout;
