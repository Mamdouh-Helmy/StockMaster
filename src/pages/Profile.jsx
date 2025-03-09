import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner"; // أو أي مكتبة إشعارات تُفضلها
import Loading from "../components/Loading/Loading"; // مكون لعرض التحميل (إن وجد)
import {
  FaUserAlt,
  FaExclamationTriangle,
  FaCamera,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaBirthdayCake,
  FaImage,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function Profile() {
  const { user, updateProfile, loading } = useAuth();
  const [profileData, setProfileData] = useState({
    name: "",
    address: "",
    phone: "",
    age: "",
    profileImage: "",
    logo: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  // تحديث بيانات النموذج عند توفر بيانات المستخدم
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        address: user.address || "",
        phone: user.phone || "",
        age: user.age || "",
        profileImage: user.profileImage || "",
        logo: user.logo || "",
      });
    }
  }, [user]);

  // دالة لمعالجة الحقول النصية
  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // دالة لتحميل الصور وتحويلها إلى Base64 للعرض
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, [e.target.name]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // عند حفظ التعديلات
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
      setMessage("✅ تم تحديث الملف الشخصي بنجاح!");
      toast.success("✅ تم تحديث الملف الشخصي بنجاح!");
      setMessage("");
      setIsEditing(false);
    } catch (error) {
      setMessage("❌ " + error.message);
      toast.error("❌ " + error.message);
    }
  };

  // دالة مساعدة لعرض قيمة الحقل أو رسالة بديلة مع أيقونة
  const renderField = (label, value, icon) => {
    return (
      <div className="flex items-center gap-2">
        {/* الأيقونة الخاصة بالحقل */}
        <span className="text-primary">{icon}</span>
        <strong>{label}:</strong>
        {value ? (
          <span>{value}</span>
        ) : (
          <span className="text-red-400 flex items-center gap-1">
            <FaExclamationTriangle /> لا يوجد {label.toLowerCase()} مسجل
          </span>
        )}
      </div>
    );
  };

  // وضع العرض (غير قابل للتحرير)
  const renderDisplay = () => {
    return (
      <div className="space-y-6">
        {/* الصورة والاسم */}
        <div className="flex flex-col items-center">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center mb-4 bg-gray-700 rounded-full">
              <FaUserAlt className="text-3xl text-gray-400" />
            </div>
          )}
          <h3 className="text-xl font-bold text-white">
            {user?.name ? (
              user.name
            ) : (
              <span className="flex items-center gap-1 text-red-400">
                <FaExclamationTriangle /> لا يوجد اسم مسجل
              </span>
            )}
          </h3>
        </div>

        {/* الحقول مع أيقونات */}
        <div className="text-gray-300 space-y-4">
          {/* العنوان */}
          {renderField("العنوان", user?.address, <FaMapMarkerAlt />)}

          {/* رقم التلفون */}
          {renderField("رقم التلفون", user?.phone, <FaPhoneAlt />)}

          {/* العمر */}
          {renderField("العمر", user?.age, <FaBirthdayCake />)}

          {/* اللوجو */}
          <div className="flex items-center gap-2">
            <FaImage className="text-primary" />
            <strong>اللوجو:</strong>
            {user?.logo ? (
              <img
                src={user.logo}
                alt="Logo"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-red-400 flex items-center gap-1">
                <FaExclamationTriangle /> لا يوجد لوجو مسجل
              </span>
            )}
          </div>
        </div>

        {/* زر تعديل */}
        <div className="flex justify-center mt-6">
          <motion.button
            onClick={() => setIsEditing(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-primary rounded-md text-white hover:bg-primary/70 transition-all"
          >
            تعديل الملف الشخصي
          </motion.button>
        </div>
      </div>
    );
  };

  // وضع التحرير (form)
  const renderForm = () => {
    return (
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm space-y-4">
          {/* الاسم */}
          <div>
            <label htmlFor="name" className="block text-white mb-1">
              الاسم
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="الاسم"
              value={profileData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-background"
            />
          </div>
          {/* العنوان */}
          <div>
            <label htmlFor="address" className="block text-white mb-1">
              العنوان
            </label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="العنوان"
              value={profileData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-background"
            />
          </div>
          {/* رقم التلفون */}
          <div>
            <label htmlFor="phone" className="block text-white mb-1">
              رقم التلفون
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              placeholder="رقم التلفون"
              value={profileData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-background"
            />
          </div>
          {/* العمر */}
          <div>
            <label htmlFor="age" className="block text-white mb-1">
              العمر
            </label>
            <input
              id="age"
              name="age"
              type="number"
              placeholder="العمر"
              value={profileData.age}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-background"
            />
          </div>
          {/* الصورة الشخصية */}
          <div>
            <label htmlFor="profileImage" className="block text-white mb-1">
              الصورة الشخصية
            </label>
            <div className="relative">
              <label
                htmlFor="profileImage"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
              >
                <FaCamera />
                اختر صورة شخصية
              </label>
              <input
                id="profileImage"
                name="profileImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {profileData.profileImage && (
              <div className="mt-2">
                <img
                  src={profileData.profileImage}
                  alt="Preview Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
            )}
          </div>
          {/* اللوجو */}
          <div>
            <label htmlFor="logo" className="block text-white mb-1">
              اللوجو
            </label>
            <div className="relative">
              <label
                htmlFor="logo"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
              >
                <FaCamera />
                اختر اللوجو
              </label>
              <input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {profileData.logo && (
              <div className="mt-2">
                <img
                  src={profileData.logo}
                  alt="Preview Logo"
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className="text-center text-sm text-white">{message}</div>
        )}

        <div className="flex items-center gap-3 justify-between">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {loading ? <Loading /> : "حفظ التعديلات"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="ml-4 text-sm text-gray-300 hover:text-white"
          >
            إلغاء
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen mt-6 flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-2xl">
        <div className="mb-6">
          {isEditing ? (
            <h2 className="text-center text-2xl font-bold text-white mb-2">
              تعديل الملف الشخصي
            </h2>
          ) : (
            <h2 className="text-center text-2xl font-bold text-white mb-2">
              الملف الشخصي
            </h2>
          )}
        </div>
        {isEditing ? renderForm() : renderDisplay()}
      </div>
    </div>
  );
}
