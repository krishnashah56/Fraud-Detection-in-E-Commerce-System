import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, authError, setAuthError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");
    setAuthError("");

    if (!username || !password) {
      setLocalError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      await login(username.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (loginError) {
      setLocalError(loginError.response?.data?.message || loginError.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950/95 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        <div className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Secure admin console</p>
          <h1 className="text-4xl font-semibold text-white">Admin login</h1>
          <p className="text-sm text-slate-400">
            Enter dashboard credentials to access the fraud control panel.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Username</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="admin"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="••••••••"
            />
          </div>

          {(localError || authError) && (
            <div className="rounded-3xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {localError || authError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full justify-center rounded-3xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 rounded-3xl border border-slate-700 bg-slate-950/80 p-4 text-sm text-slate-400">
          <p className="font-medium text-slate-100">Login help</p>
          <p>Please enter the administrator credentials to access the dashboard.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
