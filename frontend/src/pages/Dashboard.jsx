import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { uploadContract, getContracts } from "../lib/api";
import { Logo } from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [contracts, setContracts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [contractsUsed, setContractsUsed] = useState(0);
  const fileRef = useRef();
  const navigate = useNavigate();
  const MAX_FREE = 2;

  const loadData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const data = await getContracts(session.access_token);
      setContracts(data);
      setContractsUsed(data.length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await uploadContract(file, session.access_token);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      fileRef.current.value = "";
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", display: "flex" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          minHeight: "100vh",
          background: "white",
          borderRight: "0.5px solid #ebebeb",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
          flexShrink: 0,
        }}
      >
        <div style={{ marginBottom: "32px", paddingLeft: "8px" }}>
          <Logo />
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 10px",
              borderRadius: "6px",
              background: "#f5f5f5",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "14px" }}>📄</span>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "#111" }}>
              Contracts
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 10px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "14px" }}>⚙️</span>
            <span style={{ fontSize: "13px", color: "#888" }}>Settings</span>
          </div>
        </nav>

        <div
          style={{
            borderTop: "0.5px solid #ebebeb",
            paddingTop: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div
            style={{ background: "#111", borderRadius: "8px", padding: "12px" }}
          >
            <p style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>
              Free uses left
            </p>
            <p
              style={{
                fontSize: "18px",
                fontWeight: 500,
                color: "white",
                marginBottom: "10px",
              }}
            >
              {Math.max(0, MAX_FREE - contractsUsed)} / {MAX_FREE}
            </p>
            <button
              style={{
                background: "white",
                color: "#111",
                border: "none",
                padding: "7px",
                borderRadius: "5px",
                fontSize: "11px",
                fontWeight: 500,
                cursor: "pointer",
                width: "100%",
              }}
            >
              Unlock more →
            </button>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/login");
            }}
            style={{
              fontSize: "12px",
              color: "#aaa",
              background: "transparent",
              border: "0.5px solid #ebebeb",
              borderRadius: "6px",
              padding: "7px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              fontWeight: 500,
              color: "#111",
              letterSpacing: "-0.02em",
            }}
          >
            Contracts
          </p>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleUpload}
              style={{ display: "none" }}
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              style={{
                background: "#111",
                color: "white",
                borderRadius: "7px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: uploading ? "not-allowed" : "pointer",
                opacity: uploading ? 0.6 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {uploading ? "Uploading…" : "+ Upload contract"}
            </label>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "white",
              border: "0.5px solid #ebebeb",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "8px" }}>
              Contracts uploaded
            </p>
            <p style={{ fontSize: "24px", fontWeight: 500, color: "#111" }}>
              {contractsUsed}
            </p>
          </div>
          <div
            style={{
              background: "white",
              border: "0.5px solid #ebebeb",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "8px" }}>
              Analyzed
            </p>
            <p style={{ fontSize: "24px", fontWeight: 500, color: "#111" }}>
              {contracts.filter((c) => c.summary).length}
            </p>
          </div>
          <div
            style={{
              background: "white",
              border: "0.5px solid #ebebeb",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "8px" }}>
              Pending review
            </p>
            <p style={{ fontSize: "24px", fontWeight: 500, color: "#111" }}>
              {contracts.filter((c) => !c.summary).length}
            </p>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: "12px", color: "#c33", marginBottom: "12px" }}>
            {error}
          </p>
        )}

        <div
          style={{
            background: "white",
            border: "0.5px solid #ebebeb",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 16px",
              background: "#fafafa",
              borderBottom: "0.5px solid #f0f0f0",
              display: "grid",
              gridTemplateColumns: "1fr 130px 100px 60px",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "11px", color: "#bbb" }}>File</span>
            <span style={{ fontSize: "11px", color: "#bbb" }}>Status</span>
            <span style={{ fontSize: "11px", color: "#bbb" }}>Uploaded</span>
            <span style={{ fontSize: "11px", color: "#bbb" }}></span>
          </div>

          {contracts.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "#ccc" }}>
                No contracts yet. Upload one above.
              </p>
            </div>
          ) : (
            contracts.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: "13px 16px",
                  borderBottom: "0.5px solid #f8f8f8",
                  display: "grid",
                  gridTemplateColumns: "1fr 130px 100px 60px",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "9px" }}
                >
                  <span style={{ fontSize: "14px" }}>
                    {c.filename.endsWith(".pdf") ? "📄" : "📝"}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#111",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.filename}
                  </span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: c.summary ? "#4caf50" : "#ddd",
                      display: "inline-block",
                    }}
                  ></span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: c.summary ? "#2a7a2a" : "#bbb",
                    }}
                  >
                    {c.summary ? "Analyzed" : "Not analyzed"}
                  </span>
                </div>
                <span style={{ fontSize: "12px", color: "#aaa" }}>
                  {new Date(c.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span
                  onClick={() => navigate(`/contract/${c.id}`)}
                  style={{
                    fontSize: "12px",
                    color: "#999",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                    cursor: "pointer",
                  }}
                >
                  {c.summary ? "View" : "Analyze"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
