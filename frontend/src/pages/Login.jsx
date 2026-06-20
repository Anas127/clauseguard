import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Logo } from "../components/Navbar";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else navigate("/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "18px 32px",
          borderBottom: "0.5px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Logo />
        <span style={{ fontSize: "12px", color: "#999" }}>
          No account?{" "}
          <Link
            to="/signup"
            style={{
              color: "#111",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            Sign up free
          </Link>
        </span>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "340px" }}>
          <p
            style={{
              fontSize: "20px",
              fontWeight: 500,
              color: "#111",
              letterSpacing: "-0.03em",
              marginBottom: "4px",
            }}
          >
            Welcome back
          </p>
          <p style={{ fontSize: "13px", color: "#999", marginBottom: "28px" }}>
            Sign in to your ClauseGuard account.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div>
              <p
                style={{
                  fontSize: "11px",
                  color: "#888",
                  marginBottom: "5px",
                  letterSpacing: "0.02em",
                }}
              >
                Email address
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                style={{
                  width: "100%",
                  border: "0.5px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  color: "#111",
                  background: "#fafafa",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    color: "#888",
                    letterSpacing: "0.02em",
                  }}
                >
                  Password
                </p>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#999",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                    cursor: "pointer",
                  }}
                >
                  Forgot password?
                </span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  border: "0.5px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  color: "#111",
                  background: "#fafafa",
                  outline: "none",
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: "12px", color: "#c33" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#111",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "11px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                marginTop: "4px",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
