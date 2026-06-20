import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { analyzeContract } from "../lib/api";
import { Logo } from "../components/Navbar";

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runAnalysis = async () => {
    setLoading(true);
    setError("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const result = await analyzeContract(id, session.access_token);
      setAnalysis(result);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("users")
        .select("is_paid")
        .eq("id", user.id)
        .single();
      setIsPaid(profile?.is_paid ?? false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const riskColor = (level) => {
    if (level === "high")
      return { bg: "#fff5f5", color: "#c33", dot: "#e05", border: "#fcc" };
    if (level === "medium")
      return {
        bg: "#fffbf0",
        color: "#996600",
        dot: "#e6a817",
        border: "#ffeaa0",
      };
    return {
      bg: "#f5faf5",
      color: "#2a7a2a",
      dot: "#4caf50",
      border: "#d4edda",
    };
  };

  const scoreColor = (score) => {
    if (score >= 70)
      return { color: "#c33", bg: "#fff5f5", label: "High Risk" };
    if (score >= 40)
      return { color: "#996600", bg: "#fffbf0", label: "Medium Risk" };
    return { color: "#2a7a2a", bg: "#f5faf5", label: "Low Risk" };
  };

  const FREE_VISIBLE_HIGH_MEDIUM = 2;

  const isLockable = (clause) =>
    clause.risk_level === "high" || clause.risk_level === "medium";

  const getLocked = (clause, index) => {
    if (isPaid) return false;
    if (!isLockable(clause)) return false;
    const highMediumIndexBefore = analysis.clauses
      .slice(0, index)
      .filter(isLockable).length;
    return highMediumIndexBefore >= FREE_VISIBLE_HIGH_MEDIUM;
  };

  const hiddenCount = analysis
    ? analysis.clauses.filter(isLockable).length - FREE_VISIBLE_HIGH_MEDIUM
    : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          background: "white",
          borderBottom: "0.5px solid #ebebeb",
          padding: "14px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Logo />
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            fontSize: "12px",
            color: "#888",
            background: "transparent",
            border: "0.5px solid #e0e0e0",
            borderRadius: "6px",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </div>

      <main
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "36px 24px",
          width: "100%",
        }}
      >
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: "14px", color: "#aaa" }}>
              Analyzing contract…
            </p>
            <p style={{ fontSize: "12px", color: "#ccc", marginTop: "6px" }}>
              This takes 5–10 seconds
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#fff5f5",
              border: "0.5px solid #fdd",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <p style={{ fontSize: "13px", color: "#c33" }}>{error}</p>
          </div>
        )}

        {analysis && !loading && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Danger Score */}
            {analysis.danger_score !== undefined &&
              (() => {
                const sc = scoreColor(analysis.danger_score);
                return (
                  <div
                    style={{
                      background: sc.bg,
                      border: `0.5px solid ${sc.color}33`,
                      borderRadius: "10px",
                      padding: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: sc.color,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          marginBottom: "6px",
                        }}
                      >
                        {sc.label}
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#333",
                          lineHeight: 1.6,
                          maxWidth: "500px",
                        }}
                      >
                        {analysis.summary}
                      </p>
                    </div>
                    <div style={{ textAlign: "center", minWidth: "80px" }}>
                      <p
                        style={{
                          fontSize: "42px",
                          fontWeight: 700,
                          color: sc.color,
                          lineHeight: 1,
                        }}
                      >
                        {analysis.danger_score}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#aaa",
                          marginTop: "4px",
                        }}
                      >
                        / 100
                      </p>
                    </div>
                  </div>
                );
              })()}

            {/* Key Details */}
            {[
              analysis.parties,
              analysis.payment_terms,
              analysis.termination,
              analysis.governing_law,
            ].some(Boolean) && (
              <div
                style={{
                  background: "white",
                  border: "0.5px solid #ebebeb",
                  borderRadius: "10px",
                  padding: "20px 24px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    color: "#aaa",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    marginBottom: "14px",
                  }}
                >
                  Key Details
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {[
                    ["Parties", analysis.parties],
                    ["Payment Terms", analysis.payment_terms],
                    ["Termination", analysis.termination],
                    ["Governing Law", analysis.governing_law],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div
                        key={label}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "140px 1fr",
                          gap: "12px",
                          paddingBottom: "10px",
                          borderBottom: "0.5px solid #f5f5f5",
                        }}
                      >
                        <span style={{ fontSize: "12px", color: "#aaa" }}>
                          {label}
                        </span>
                        <span style={{ fontSize: "13px", color: "#111" }}>
                          {value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Clauses */}
            {analysis.clauses?.length > 0 && (
              <div
                style={{
                  background: "white",
                  border: "0.5px solid #ebebeb",
                  borderRadius: "10px",
                  padding: "20px 24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Clauses
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {["high", "medium", "low"].map((level) => {
                      const count = analysis.clauses.filter(
                        (c) => c.risk_level === level,
                      ).length;
                      if (!count) return null;
                      const colors = riskColor(level);
                      return (
                        <span
                          key={level}
                          style={{
                            fontSize: "10px",
                            background: colors.bg,
                            color: colors.color,
                            padding: "3px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          {count} {level}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {analysis.clauses.map((clause, i) => {
                    const colors = riskColor(clause.risk_level);
                    const locked = getLocked(clause, i);

                    return (
                      <div
                        key={i}
                        style={{
                          border: `0.5px solid ${colors.border}`,
                          borderRadius: "8px",
                          padding: "14px 16px",
                          background:
                            clause.risk_level === "high" ? "#fffafa" : "white",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "6px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 500,
                              color: "#111",
                            }}
                          >
                            {clause.type}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              background: colors.bg,
                              color: colors.color,
                              padding: "3px 8px",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span
                              style={{
                                width: "5px",
                                height: "5px",
                                borderRadius: "50%",
                                background: colors.dot,
                                display: "inline-block",
                              }}
                            ></span>
                            {clause.risk_level}
                          </span>
                        </div>

                        <div
                          style={{
                            filter: locked ? "blur(4px)" : "none",
                            userSelect: locked ? "none" : "auto",
                            pointerEvents: locked ? "none" : "auto",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "13px",
                              color: "#555",
                              lineHeight: 1.6,
                            }}
                          >
                            {clause.content}
                          </p>

                          {clause.flag_reason && (
                            <div
                              style={{
                                background: colors.bg,
                                borderRadius: "6px",
                                padding: "8px 12px",
                                marginTop: "10px",
                                borderLeft: `2px solid ${colors.dot}`,
                              }}
                            >
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: colors.color,
                                  lineHeight: 1.5,
                                }}
                              >
                                ⚠ {clause.flag_reason}
                              </p>
                            </div>
                          )}

                          {clause.recommendation && (
                            <div
                              style={{
                                background: "#f8f8f8",
                                borderRadius: "6px",
                                padding: "8px 12px",
                                marginTop: "8px",
                                borderLeft: "2px solid #ccc",
                              }}
                            >
                              <p
                                style={{
                                  fontSize: "11px",
                                  color: "#888",
                                  marginBottom: "2px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.04em",
                                }}
                              >
                                What to do
                              </p>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "#333",
                                  lineHeight: 1.5,
                                }}
                              >
                                {clause.recommendation}
                              </p>
                            </div>
                          )}
                        </div>

                        {locked && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "8px",
                            }}
                          >
                            <div style={{ textAlign: "center" }}>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "#888",
                                  marginBottom: "10px",
                                }}
                              >
                                Unlock full analysis to see this clause
                              </p>
                              <button
                                onClick={() =>
                                  window.open("YOUR_GUMROAD_LINK", "_blank")
                                }
                                style={{
                                  fontSize: "12px",
                                  background: "#111",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "8px 16px",
                                  cursor: "pointer",
                                }}
                              >
                                Unlock →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!isPaid && hiddenCount > 0 && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "16px",
                      background: "#111",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "white",
                          fontWeight: 500,
                        }}
                      >
                        {hiddenCount} critical clauses hidden
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#888",
                          marginTop: "2px",
                        }}
                      >
                        Unlock to see all risks and what to do about them
                      </p>
                    </div>
                    <button
                      onClick={() => window.open("YOUR_GUMROAD_LINK", "_blank")}
                      style={{
                        fontSize: "12px",
                        background: "white",
                        color: "#111",
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 16px",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      Unlock full analysis →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
