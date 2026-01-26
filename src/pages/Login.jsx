import React, { useEffect, useRef, useState, useId } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { login } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const id = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [shake, setShake] = useState(false);

  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!message) return;

    if (message.type === "success") {
      const t = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 800);
      return () => clearTimeout(t);
    }

    if (message.type === "error") {
      setShake(true);
      const t = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(t);
    }
  }, [message, navigate]);

  const validate = () => {
    if (!email) return "Please enter your email.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email.";
    if (!password) return "Please enter your password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const error = validate();
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      setMessage({ type: "success", text: "Welcome back — redirecting…" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const labelBase =
    "absolute left-4 pointer-events-none transition-all duration-200 text-sm";

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
      {/* LEFT SIDE */}
      <div className="hidden md:flex relative items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 text-white">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-md px-10">
          <h1 className="text-4xl font-bold leading-tight">
            Welcome to <br /> TCAM Solution
          </h1>
          <p className="mt-4 text-white/80 text-lg">
            Secure access to your admin dashboard.
          </p>

          <ul className="mt-8 space-y-3 text-white/90">
            <li>✔ Secure Authentication</li>
            <li>✔ Role-Based Access</li>
            <li>✔ Fast & Reliable System</li>
          </ul>
        </div>
      </div>

      {/* RIGHT SIDE */}
      {/* RIGHT SIDE – MODERN STYLED FORM */}
      <div className="relative flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-100 px-6">
        {/* Accent glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-10 w-72 h-72 bg-indigo-300/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
        </div>

        <div
          className={`relative z-10 w-full max-w-md rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.25)] p-8 transition-all ${
            shake ? "animate-shake" : ""
          }`}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-slate-500">
              Sign in to your admin dashboard
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-inner ${
                message.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {message.type === "error" ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Email
              </label>
              <div className="relative">
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="example@gmail.com"
                  className="
              w-full rounded-2xl px-4 py-3 pr-11
              bg-white border border-slate-300
              text-slate-900
              focus:outline-none
              focus:ring-2 focus:ring-indigo-500
              focus:border-indigo-500
              focus:shadow-[inset_0_0_12px_rgba(99,102,241,0.25)]
              transition
            "
                />
                <Mail className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="••••••••"
                  className="
              w-full rounded-2xl px-4 py-3 pr-11
              bg-white border border-slate-300
              text-slate-900
              focus:outline-none
              focus:ring-2 focus:ring-indigo-500
              focus:border-indigo-500
              focus:shadow-[inset_0_0_12px_rgba(99,102,241,0.25)]
              transition
            "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition"
                ></button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
          w-full rounded-2xl py-3 font-semibold text-white
          bg-gradient-to-r from-indigo-600 to-purple-600
          shadow-lg shadow-indigo-600/30
          hover:scale-[1.03] hover:shadow-xl
          transition-all duration-200
          disabled:opacity-60 disabled:hover:scale-100
        "
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Continue"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-slate-400">
            Secure • Encrypted • Trusted
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes blob {
          0%,100%{transform:translate(0,0) scale(1);}
          33%{transform:translate(30px,-40px) scale(1.1);}
          66%{transform:translate(-20px,30px) scale(0.95);}
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay:2s; }

        @keyframes shake {
          0%,100%{transform:translateX(0);}
          25%,75%{transform:translateX(-8px);}
          50%{transform:translateX(8px);}
        }
        .animate-shake { animation: shake 0.6s; }
      `}</style>
    </div>
  );
}
