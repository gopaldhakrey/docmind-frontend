import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({username:"",email:"",password:""});
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try { await register(form.username, form.email, form.password); navigate("/login"); }
    catch (err) { setError(err.response?.data?.message || "Registration failed."); }
    finally { setBusy(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand"><div className="brand-mark">D</div><span>DocMind</span></div>
      <div className="auth-card">
        <div className="auth-icon"><FileText size={20}/></div>
        <p className="eyebrow">GET STARTED</p>
        <h1>Create your workspace.</h1>
        <p className="auth-copy">Build a private library of PDFs and interrogate them with semantic search.</p>
        <form onSubmit={submit}>
          <label>Username<input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required /></label>
          <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></label>
          <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={6}/></label>
          {error && <div className="error-text">{error}</div>}
          <button className="button primary full" disabled={busy}>{busy ? "Creating…" : <>Create account <ArrowRight size={17}/></>}</button>
        </form>
        <p className="switch-auth">Already registered? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
