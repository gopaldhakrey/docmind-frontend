import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, FileText } from "lucide-react";

export default function ForgotPassword() {
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-mark">D</div>
        <span>DocMind</span>
      </div>

      <div className="auth-card">
        <div className="auth-icon">
          <FileText size={20} />
        </div>

        <p className="eyebrow">ACCOUNT RECOVERY</p>

        <h1>Password reset is coming soon</h1>

        <p className="auth-copy">
          Password reset via email is currently being finalized.
          This feature will be available soon.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 16px",
            marginTop: "20px",
            marginBottom: "24px",
            borderRadius: "8px",
            background: "rgba(128, 128, 0, 0.08)",
            fontSize: "13px",
            lineHeight: "1.5",
          }}
        >
          <Clock size={18} />
          <span>
            Please try again later. We're working on making
            password recovery available.
          </span>
        </div>

        <Link
          to="/login"
          className="button primary full"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <ArrowLeft size={17} />
          Back to login
        </Link>
      </div>
    </div>
  );
}
