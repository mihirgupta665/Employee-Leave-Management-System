import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import authBg from "../assets/auth-workflow-bg.svg";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "manager") {
        navigate("/manager");
      } else {
        navigate("/employee");
      }
      toast.success("Login successful");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg-page" style={{ backgroundImage: `url(${authBg})` }}>
      <div className="auth-overlay-card">
        <div className="auth-copy">
          <h2>Employee Leave Management System</h2>
          <p>
            A professional workflow portal for role-based leave operations, approvals, support, and
            HR coordination.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm text-cyan-100">Workflow</p>
              <p className="text-xl font-bold">Request to Review to Decision</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm text-cyan-100">Security</p>
              <p className="text-xl font-bold">JWT + Role Permissions</p>
            </div>
          </div>
        </div>

        <div className="auth-form-pane">
          <form onSubmit={onSubmit} className="auth-form-inner">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Welcome Back</h1>
            <p className="text-sm text-slate-600">Sign in to continue to your dashboard.</p>
            {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
            <input
              className="field"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={onChange}
              required
            />
            <input
              className="field"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={onChange}
              required
            />
            <button disabled={loading} className="btn-primary w-full" type="submit">
              {loading ? "Signing in..." : "Login"}
            </button>
            <p className="text-sm text-slate-600">
              New user?{" "}
              <Link className="auth-link" to="/register">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
