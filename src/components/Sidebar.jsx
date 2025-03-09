import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaHome,
  FaShoppingCart,
  FaStore,
  FaWarehouse,
  FaTruck,
  FaChartBar,
  FaSignOutAlt,
  FaUser,
  FaUserAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const { logout, user } = useAuth(); // نفترض أن ملف المستخدم موجود في سياق المصادقة
  const [sidebarWidth, setSidebarWidth] = useState("16rem");

  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth < 640) {
        setSidebarWidth("10rem");
      } else if (window.innerWidth < 1024) {
        setSidebarWidth("12rem");
      } else {
        setSidebarWidth("16rem");
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const menuItems = [
    { path: "/dashboard", icon: FaHome, text: "الرئيسية" },
    { path: "/sales", icon: FaShoppingCart, text: "المبيعات" },
    { path: "/purchases", icon: FaStore, text: "المشتريات" },
    { path: "/inventory", icon: FaWarehouse, text: "المخزون" },
    { path: "/ClientSupplier", icon: FaTruck, text: "العملاء و الموردين" },
    { path: "/reports", icon: FaChartBar, text: "التقارير" },
    { path: "/profile", icon: FaUser, text: "الملف الشخصي" },
  ];

  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: isOpen ? sidebarWidth : "0" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="sidebar fixed inset-y-0 left-0 z-10 bg-card text-card-foreground shadow-lg overflow-hidden min-h-screen md:relative"
    >
      <div className="p-4 border-b border-gray-700 text-center">
        <h1 className="text-[12px] md:text-base font-bold">نظام إدارة المخزون</h1>
      </div>

      {/* قسم الملف الشخصي */}
      <div className="p-4 border-b border-gray-700 flex flex-col items-center">
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center mb-2 bg-gray-700 rounded-full">
            <FaUserAlt className="text-xl text-gray-400" />
          </div>
        )}
        <h2 className="mt-2 text-base font-semibold text-white">
          {user?.name || "اسم المستخدم"}
        </h2>
        {user?.phone && <p className="text-sm mt-2 text-gray-400">{user.phone}</p>}
      </div>

      <nav className="mt-4">
        {menuItems.map(({ path, icon: Icon, text }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-6 py-3 transition-colors duration-200 hover:bg-gray-700 rounded-lg mb-1 ${
              location.pathname === path ? "bg-gray-700" : "text-gray-300"
            }`}
          >
            <Icon className="w-3 h-3 md:w-5 md:h-5" />
            <span className="text-[14px] md:text-[16px]">{text}</span>
          </Link>
        ))}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-6 py-3 text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors duration-200 rounded-lg my-4"
        >
          <FaSignOutAlt className="w-3 h-3 md:w-5 md:h-5" />
          <span className="text-[14px] md:text-[16px]">تسجيل الخروج</span>
        </button>
      </nav>

      <button
        onClick={toggleSidebar}
        className="absolute top-4 right-4 text-white md:hidden"
      >
        X
      </button>
    </motion.div>
  );
}

export default Sidebar;
