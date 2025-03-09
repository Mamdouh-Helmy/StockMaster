import { createContext, useContext, useState, useEffect } from "react";
import { setFavicon } from "../assets/setFavicon"; // <-- استيراد الدالة

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token") || false
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // التحقق من التوكن عند تحميل التطبيق ومحاولة جلب الملف الشخصي
  useEffect(() => {
    const token = localStorage.getItem("token");
    const expiresAt = localStorage.getItem("tokenExpiresAt");

    if (token && expiresAt) {
      // التوكن موجود وتاريخ انتهائه لم يحن بعد
      if (Date.now() > Number(expiresAt)) {
        // انتهت صلاحية التوكن
        logout();
      } else {
        setIsAuthenticated(true);
        // جلب بيانات الملف الشخصي لتحديث حالة المستخدم
        fetchProfile().catch((err) =>
          console.error("Fetch profile error:", err.message)
        );
      }
    }
  }, []);

  // دالة تسجيل الدخول
  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await fetch("https://smartstock-production.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "اسم المستخدم أو كلمة المرور غير صحيحة"
        );
      }

      const data = await response.json();
      // حفظ التوكن ووقت الانتهاء في localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("tokenExpiresAt", data.expiresAt);

      setIsAuthenticated(true);

      // جلب بيانات المستخدم بعد تسجيل الدخول
      const userData = await fetchProfile();
      setUser(userData);

      return true;
    } catch (error) {
      if (error.message === "Failed to fetch") {
        throw new Error("الخادم متوقف حاليًا، يرجى المحاولة لاحقًا");
      }
      console.error("Login error:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // دالة تسجيل الخروج
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiresAt");
    setIsAuthenticated(false);
    setUser(null);
    // يمكنك إعادة تعيين favicon إلى الافتراضي إذا أردت
    setFavicon();
    fetchPublicProfileNoUsername()
  };

  // دالة لجلب بيانات الملف الشخصي (محمي بالتوكن)
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://smartstock-production.up.railway.app/api/auth/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "حدث خطأ أثناء جلب الملف الشخصي"
        );
      }
      const data = await response.json();

      // إذا كان لدى المستخدم شعار، نعيّن favicon
      if (data.logo) {
        setFavicon(data.logo);
      } else {
        setFavicon();
      }

      setUser(data);
      return data;
    } catch (error) {
      console.error("Fetch profile error:", error.message);
      throw error;
    }
  };

  // دالة لتحديث بيانات الملف الشخصي (الحقول اختيارية)
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://smartstock-production.up.railway.app/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "حدث خطأ أثناء تحديث الملف الشخصي"
        );
      }
      const data = await response.json();
      // إذا عدّل المستخدم اللوجو، نعيّنه كـ favicon
      if (data.user.logo) {
        setFavicon(data.user.logo);
      } else {
        setFavicon();
      }
      setUser(data.user);
      return data;
    } catch (error) {
      console.error("Update profile error:", error.message);
      throw error;
    }finally{
      setLoading(false);
    }
  };

  // دالة لجلب بيانات الاسم + الصورة + اللوجو دون الحاجة إلى توكن
  const fetchPublicProfileNoUsername = async () => {
    try {
      const response = await fetch(
        "https://smartstock-production.up.railway.app/api/auth/public-profile-no-username"
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "حدث خطأ أثناء جلب الملف الشخصي العام"
        );
      }
      const data = await response.json(); 
      
      if (data.logo) {
        setFavicon(data.logo);
      } else {
        setFavicon();
      }

      return data;
    } catch (error) {
      console.error("Fetch public profile error:", error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        loading,
        fetchProfile,
        updateProfile,
        fetchPublicProfileNoUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
