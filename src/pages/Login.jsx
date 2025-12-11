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

  // Focus email on load
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // On success or error
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

  // Client-side validation
  const validate = () => {
    if (!email) return "Please enter your email.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email.";
    if (!password) return "Please enter your password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Validate first
    const error = validate();
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    try {
      setLoading(true);

      // Call login API (JWT)
      await login(email.trim(), password);

      setMessage({
        type: "success",
        text: "Welcome back — redirecting…",
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid email or password.";

      setMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  const labelBase =
    "absolute left-4 pointer-events-none transition-all duration-200 text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 px-4">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 -top-12 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -right-16 top-28 w-80 h-80 bg-indigo-600/25 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute left-10 bottom-[-80px] w-96 h-96 bg-pink-600/25 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Login card */}
      <div
        className={`relative z-10 w-full max-w-md mx-auto transform transition-all duration-500 ${
          shake ? "animate-shake" : ""
        }`}
      >
        <div className="backdrop-blur-2xl bg-white/6 border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="text-center mb-6">
            <div className="mx-auto inline-flex items-center justify-center rounded-full h-16 w-16 bg-white/12 shadow-inner">
              <Lock className="h-8 w-8 text-white" strokeWidth={2} />
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-white tracking-tight">
              TCAM Solution
            </h1>
            <p className="mt-1 text-sm text-white/70">Admin Dashboard Login</p>
          </div>

          {/* Message box */}
          {message && (
            <div
              className={`mb-4 flex items-center gap-3 px-4 py-2 rounded-xl text-sm ${
                message.type === "error"
                  ? "bg-red-600/20 text-red-100 border border-red-600/40"
                  : "bg-emerald-600/20 text-emerald-100 border border-emerald-600/40"
              }`}
            >
              {message.type === "error" ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email input */}
            <div className="relative">
              <input
                id={`${id}-email`}
                ref={emailRef}
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="peer w-full px-4 py-4 bg-white/6 border border-white/12 rounded-2xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
              />
              <label
                htmlFor={`${id}-email`}
                className={`${labelBase} ${
                  email ? "-top-3 text-xs text-white" : "top-3 text-white/70"
                } peer-focus:-top-3 peer-focus:text-xs peer-focus:text-white`}
              >
                Email address
              </label>
              <Mail className="absolute right-4 top-4 h-5 w-5 text-white/60" />
            </div>

            {/* Password input */}
            <div className="relative">
              <input
                id={`${id}-password`}
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="peer w-full px-4 py-4 bg-white/6 border border-white/12 rounded-2xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
              />
              <label
                htmlFor={`${id}-password`}
                className={`${labelBase} ${
                  password ? "-top-3 text-xs text-white" : "top-3 text-white/70"
                } peer-focus:-top-3 peer-focus:text-xs peer-focus:text-white`}
              >
                Password
              </label>

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-3 text-white/60 hover:text-white p-2"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="relative overflow-hidden w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg transition-all hover:scale-[1.03] focus:ring-4 focus:ring-indigo-400/30 disabled:opacity-70 btn-anim"
            >
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.12),rgba(255,255,255,0.06))] animate-shimmer"
              />

              <span className="relative flex items-center gap-3">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Continue to Dashboard"
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center text-white/60 text-sm">
            <Lock className="h-4 w-4 inline-block mr-1" />
            Secure • Encrypted • Protected
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
        .animation-delay-4000 { animation-delay:4s; }
        
        @keyframes shake {
          0%,100%{transform:translateX(0);}
          20%,60%{transform:translateX(-8px);}
          40%,80%{transform:translateX(8px);}
        }
        .animate-shake { animation: shake 0.6s ease-in-out; }

        @keyframes shimmer {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(0%); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .animate-shimmer { animation: shimmer 1.6s infinite linear; }
      `}</style>
    </div>
  );
}
