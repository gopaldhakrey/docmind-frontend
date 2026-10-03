import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault(); setError("");
    try { await login(identifier, password); navigate("/dashboard"); }
    catch (err) { setError(err.response?.data?.message || "Invalid username/email or password."); }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand"><div className="brand-mark">D</div><span>DocMind</span></div>
      <div className="auth-card">
        <div className="auth-icon"><FileText size={20}/></div>
        <p className="eyebrow">DOCUMENT INTELLIGENCE</p>
        <h1>Welcome back.</h1>
        <p className="auth-copy">Search your documents, ask questions, and find the exact context you need.</p>
        <form onSubmit={submit}>
          <label>Username<input value={identifier} onChange={e=>setIdentifier(e.target.value)} required /></label>
          <div>
            <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
            >
              <label style={{ flex: 1 }}>
                Password
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
              </label>

              <Link
                  to="/forgot-password"
                  style={{
                    fontSize: "11px",
                    color: "var(--olive)",
                    fontWeight: 600,
                    marginLeft: "10px",
                    marginTop: "22px",
                    whiteSpace: "nowrap",
                  }}
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <div className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="button primary full" disabled={loading}>{loading ? "Signing in…" : <>Sign in <ArrowRight size={17}/></>}</button>
        </form>
        <p className="switch-auth">Don't have an account? <Link to="/register">Create one</Link></p>
      </div>
    </div>
  );
}
