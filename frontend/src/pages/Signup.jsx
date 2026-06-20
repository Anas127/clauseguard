import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Logo } from "../components/Navbar";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else setDone(true);
  };

  if (done)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "320px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "#f0f0f0",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <span style={{ fontSize: "18px" }}>✓</span>
          </div>
          <p
            style={{
              fontSize: "18px",
              fontWeight: 500,
              color: "#111",
              marginBottom: "6px",
            }}
          >
            Check your email
          </p>
          <p style={{ fontSize: "13px", color: "#999", lineHeight: 1.6 }}>
            We sent a confirmation link to{" "}
            <strong style={{ color: "#111" }}>{email}</strong>
          </p>
        </div>
      </div>
    );

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
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#111",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            Sign in
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
            Create your account
          </p>
          <p style={{ fontSize: "13px", color: "#999", marginBottom: "28px" }}>
            Analyze contracts in seconds. No lawyer needed.
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
              <p
                style={{
                  fontSize: "11px",
                  color: "#888",
                  marginBottom: "5px",
                  letterSpacing: "0.02em",
                }}
              >
                Password
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
              {loading ? "Creating account…" : "Create account"}
            </button>

            <p
              style={{
                fontSize: "11px",
                color: "#bbb",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              By signing up you agree to our{" "}
              <span
                style={{
                  color: "#888",
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                  cursor: "pointer",
                }}
              >
                Terms
              </span>{" "}
              and{" "}
              <span
                style={{
                  color: "#888",
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                  cursor: "pointer",
                }}
              >
                Privacy Policy
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
