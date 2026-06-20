import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Logo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          fontSize: "16px",
          fontWeight: 500,
          color: "#111",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      >
        CLAUSE
      </span>
      <div
        style={{
          height: "1px",
          width: "72px",
          background: "#111",
          margin: "1.5px 0",
        }}
      ></div>
      <span
        style={{
          fontSize: "16px",
          fontWeight: 500,
          color: "#111",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      >
        GUARD
      </span>
    </div>
  );
}

export { Logo };

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav
      style={{
        background: "white",
        borderBottom: "0.5px solid #e8e8e8",
        padding: "14px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Logo />
      <button
        onClick={handleLogout}
        style={{
          fontSize: "12px",
          color: "#555",
          background: "transparent",
          border: "0.5px solid #e0e0e0",
          borderRadius: "6px",
          padding: "6px 12px",
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
    </nav>
  );
}
