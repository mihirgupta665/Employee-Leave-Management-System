import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import authBg from "../assets/auth-workflow-bg.svg";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      toast.success("Registration successful");
      navigate("/employee");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg-page" style={{ backgroundImage: `url(${authBg})` }}>
      <div className="auth-overlay-card">
        <div className="auth-copy">
          <h2>Create Your Employee Account</h2>
          <p>
            Register to access leave applications, analytics, and employee support workflows in one
            professional workspace.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm text-cyan-100">Onboarding</p>
              <p className="text-xl font-bold">Quick and Structured</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm text-cyan-100">Experience</p>
              <p className="text-xl font-bold">Elegant and Responsive</p>
            </div>
          </div>
        </div>

        <div className="auth-form-pane">
          <form onSubmit={onSubmit} className="auth-form-inner">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Register</h1>
            <p className="text-sm text-slate-600">Create your account to access the employee portal.</p>
            {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
            <input
              className="field"
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={onChange}
              required
            />
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
              {loading ? "Creating account..." : "Create account"}
            </button>
            <p className="text-sm text-slate-600">
              Have an account?{" "}
              <Link className="auth-link" to="/login">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
