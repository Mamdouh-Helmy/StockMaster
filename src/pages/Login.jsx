import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Loading from "../components/Loading/Loading";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [handelCheck, setHandelCheck] = useState(false);

  // هذا المستخدم والوظائف من AuthContext
  const { login, loading, fetchPublicProfileNoUsername } = useAuth();

  // حالة محلية لحفظ بيانات الاسم + الصورة + اللوجو دون الحاجة للتوكن
  const [publicUser, setPublicUser] = useState(null);

  const navigate = useNavigate();

  // عند تحميل الصفحة لأول مرة، نجلب بيانات المستخدم العام
  useEffect(() => {
    fetchPublicProfileNoUsername()
      .then((data) => setPublicUser(data)) // { name, profileImage, logo }
      .catch((err) => console.error("خطأ في جلب البيانات العامة:", err));
  }, [fetchPublicProfileNoUsername]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await login(username.trim(), password.trim());
      if (success) {
        setHandelCheck(true);
        setErrorMessage("تم تسجيل الدخول بنجاح!");
        toast.success("تم تسجيل الدخول بنجاح!");
        navigate("/dashboard");
      }
    } catch (error) {
      setHandelCheck(false);
      setErrorMessage(error.message);
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-sm md:max-w-md bg-card p-3 md:p-8 rounded-xl shadow-xl">
        <div className="text-center">
          {/* عرض صورة من publicUser إن وجدت، أو الأيقونة الافتراضية */}
          <div className="mx-auto h-16 w-16 bg-primary/20 p-3 rounded-full flex items-center justify-center">
            {publicUser?.profileImage ? (
              <img
                src={publicUser.profileImage}
                alt="User Profile"
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <ShieldCheck className="w-full h-full text-primary" />
            )}
          </div>

          <h2 className="my-4 text-2xl font-bold text-white">تسجيل الدخول</h2>
          <p className="text-gray-300 text-sm">
            مرحبًا بك{" "}
            <span className="font-medium text-primary">
              {publicUser?.name || "عزيزي المستخدم"}
            </span>
            ! الرجاء إدخال بياناتك.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="block my-2">
                اسم المستخدم
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-border placeholder-muted-foreground text-foreground rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-background"
                placeholder="اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="pt-2">
              <label htmlFor="password" className="block my-2">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="text"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-border placeholder-muted-foreground text-foreground rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-background"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {errorMessage && (
            <div
              className={`text-sm text-center ${handelCheck ? "text-primary" : "text-red-400"
                }`}
            >
              {errorMessage}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? <Loading /> : "تسجيل الدخول"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
