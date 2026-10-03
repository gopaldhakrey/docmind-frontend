import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api/v1";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit(e) {
        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/auth/forgot-password`,
                { email }
            );

            setMessage(
                response.data ||
                "If an account exists with this email, a password reset link has been sent."
            );

            setEmail("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to process your request. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

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

                <h1>Forgot your password?</h1>

                <p className="auth-copy">
                    Enter the email address associated with your account and we'll send
                    you a password reset link.
                </p>

                <form onSubmit={submit}>
                    <label>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </label>

                    {error && <div className="error-text">{error}</div>}

                    {message && <div className="success-text">{message}</div>}

                    <button
                        className="button primary full"
                        disabled={loading}
                    >
                        {loading ? (
                            "Sending…"
                        ) : (
                            <>
                                Send reset link <ArrowRight size={17} />
                            </>
                        )}
                    </button>
                </form>

                <p className="switch-auth">
                    <Link to="/login">
                        <ArrowLeft size={15} /> Back to login
                    </Link>
                </p>
            </div>
        </div>
    );
}