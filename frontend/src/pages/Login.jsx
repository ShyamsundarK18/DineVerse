import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext"; // 🛠️ ADDED: Context hook import layer

export default function Login() {
  const { isAuthenticated, user, checkAppState } = useAuth(); // 🛠️ ADDED: Destructure context states
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = [
    {
      value: "customer",
      label: "🛒 Customer",
      desc: "Order food & book tables",
    },
    {
      value: "restaurant",
      label: "🍽️ Restaurant Owner",
      desc: "Manage your restaurant",
    },
    { value: "courier", label: "🚴 Courier", desc: "Deliver orders" },
  ];

  // 🛠️ ADDED: ROUTE REDIRECT SECURITY GUARD HOOK
  // Agar user already logged in hai, toh login form skip karke use dashboard bhejein
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/AdminDashboard");
      } else if (user.role === "restaurant") {
        navigate("/RestaurantDashboard");
      } else {
        navigate("/"); // Standard home path for customers
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!isLogin) {
        if (!form.name.trim()) {
          setError("Full name is required");
          setLoading(false);
          return;
        }
        if (form.password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
      }

      let response;
      if (isLogin) {
        response = await api.auth.login({
          email: form.email.trim(),
          password: form.password,
        });
      } else {
        response = await api.auth.register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });
      }

      console.log("Auth success:", response);

      // 🛠️ FIXED: Force state hydration securely right inside the auth provider container
      await checkAppState();

      // Isse reload bypass ho jayega aur upar wala useEffect instantly trigger hoga!
    } catch (err) {
      console.error("Auth error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Authentication failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-emerald-100">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-green-500 to-lime-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white font-black text-2xl">DV</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            Dine<span className="text-emerald-500">Verse</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isLogin
              ? "Welcome back! Login to continue"
              : "Create your account"}
          </p>
        </div>

        {/* Toggle Controls */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              isLogin ? " bg-white text-emerald-600 shadow-sm" : "text-gray-500"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              !isLogin ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500"
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Min 6 characters"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Register As
              </label>
              <div className="grid grid-cols-1 gap-2">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: role.value })}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      form.role === role.value
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-200"
                    }`}
                  >
                    <span className="text-xl">{role.label.split(" ")[0]}</span>
                    <div>
                      <p
                        className={`text-sm font-bold ${form.role === role.value ? "text-emerald-600" : "text-gray-700"}`}
                      >
                        {role.label.split(" ").slice(1).join(" ")}
                      </p>
                      <p className="text-xs text-gray-400">{role.desc}</p>
                    </div>
                    {form.role === role.value && (
                      <span className="ml-auto text-emerald-600 font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400 text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:from-emerald-600 hover:via-green-600 hover:to-lime-500 shadow-lg shadow-emerald-200"
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Login"
                : `Register as ${roles
                    .find((r) => r.value === form.role)
                    ?.label.split(" ")
                    .slice(1)
                    .join(" ")}`}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="text-emerald-500 font-bold hover:underline"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Register here" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
