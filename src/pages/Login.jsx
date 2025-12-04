import React, { useState, useEffect, useRef } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error'|'success', text }
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    if (!message) return;
    // auto-clear success after 2.5s and redirect on success
    if (message.type === "success") {
      const t = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 900);
      return () => clearTimeout(t);
    }

    // shake animation on error
    if (message.type === "error") {
      setShake(true);
      const t2 = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(t2);
    }
  }, [message, navigate]);

  // simple client-side validation helper
  const validate = () => {
    if (!email) return "Please enter your email address.";
    // basic email regex
    const re = /\S+@\S+\.\S+/;
    if (!re.test(email)) return "Please enter a valid email address.";
    if (!password) return "Please enter your password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const clientError = validate();
    if (clientError) {
      setMessage({ type: "error", text: clientError });
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      setMessage({ type: "success", text: "Welcome back — redirecting…" });
      // note: navigation happens in useEffect after success
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Login failed — check email/password.";
      setMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 px-4">
      {/* Floating Blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 -top-12 w-96 h-96 bg-purple-600/25 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute -right-16 top-28 w-80 h-80 bg-indigo-600/25 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute left-10 bottom-[-80px] w-96 h-96 bg-pink-600/25 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        className={`relative z-10 w-full max-w-md mx-auto transform transition-all duration-500 ${
          shake ? "animate-shake" : "translate-y-0"
        }`}
      >
        <div className="backdrop-blur-2xl bg-white/6 border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto inline-flex items-center justify-center rounded-full h-16 w-16 bg-white/12 shadow-inner">
              <Lock className="h-8 w-8 text-white" strokeWidth={2} />
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-white tracking-tight">
              TCAM Solution
            </h1>
            <p className="mt-1 text-sm text-white/70">Admin Dashboard Login</p>
          </div>

          {/* Message */}
          {message && (
            <div
              role="alert"
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
              <div className="flex-1">{message.text}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full px-4 py-4 bg-white/6 border border-white/12 rounded-2xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
                placeholder="Email address"
                aria-label="Email address"
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-3 text-white/70 text-sm pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-white peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm"
              >
                Email address
              </label>
              <Mail className="absolute right-4 top-4 h-5 w-5 text-white/60" />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full px-4 py-4 bg-white/6 border border-white/12 rounded-2xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
                placeholder="Password"
                aria-label="Password"
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-3 text-white/70 text-sm pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-white peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm"
              >
                Password
              </label>

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-3 text-white/60 hover:text-white p-2"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:scale-[1.02] transform transition-all duration-200 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Continue to Dashboard"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-white/60 text-sm">
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4" /> Secure • Encrypted • Protected
            </span>
          </div>
        </div>
      </div>

      {/* Inline animations (Tailwind utilities + custom keyframes) */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -40px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 30px) scale(0.95);
          }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        /* shake on error */
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20%,
          60% {
            transform: translateX(-8px);
          }
          40%,
          80% {
            transform: translateX(8px);
          }
        }
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}
