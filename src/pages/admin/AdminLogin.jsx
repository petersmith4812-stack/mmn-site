import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../../constants/theme";
import { useAdmin } from "../../context/AdminContext";
import { apiLogin } from "../../api/auth";

const AdminLogin = () => {
  const { users, updateUser } = useAdmin();
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode]       = useState(null); // "api" | "local" | null
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");

    // 1. Try the cloud API first
    try {
      await apiLogin(email.trim().toLowerCase(), pw);
      setMode("api");
      navigate("/admin/dashboard");
      return;
    } catch (apiErr) {
      // If network error (API not running) → fall back to localStorage
      if (!apiErr.response) {
        // localStorage fallback
        const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.active);
        if (user && user.password === pw) {
          updateUser(user.id, { lastLogin: new Date().toISOString() });
          sessionStorage.setItem("mmn_admin_session", JSON.stringify({ id:user.id, name:user.name, role:user.role, avatar:user.avatar }));
          setMode("local");
          navigate("/admin/dashboard");
        } else {
          setError(user === undefined ? "No active account found with that email." : "Incorrect password.");
          setLoading(false);
        }
      } else {
        // API responded with an error (e.g. wrong credentials)
        setError(apiErr.response?.data?.error || "Login failed. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0F1D3E 0%,#1B3F8B 60%,#2d51b8 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ position:"fixed", top:-120, right:-120, width:500, height:500, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }}/>
      <div style={{ position:"fixed", bottom:-80, left:-80, width:400, height:400, borderRadius:"50%", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }}/>

      <div style={{ background:C.white, borderRadius:28, padding:"52px 44px", width:"100%", maxWidth:440, boxShadow:"0 40px 120px rgba(0,0,0,0.4)", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ width:72, height:72, borderRadius:22, background:`linear-gradient(135deg,${C.navy},#2d51b8)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, margin:"0 auto 18px", boxShadow:`0 10px 28px ${C.navy}50` }}>🕌</div>
          <h1 style={{ fontFamily:"Fredoka One", fontSize:30, color:C.navy, margin:"0 0 6px" }}>MMN Admin</h1>
          <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.muted, margin:0 }}>Mini Muslims Nest — Control Panel</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {[
            { label:"Email Address", type:"email",    val:email, set:setEmail, ph:"admin@mmn.com" },
            { label:"Password",      type:"password", val:pw,    set:setPw,    ph:"Your password" },
          ].map(({ label, type, val, set, ph }) => (
            <div key={label}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.navy, letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6 }}>{label}</label>
              <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} required
                style={{ width:"100%", padding:"13px 16px", border:`2px solid ${C.navy}18`, borderRadius:12, fontFamily:"Nunito", fontSize:14, color:C.text, background:C.white, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" }}
                onFocus={e=>e.target.style.borderColor=C.navy}
                onBlur={e=>e.target.style.borderColor=`${C.navy}18`}
              />
            </div>
          ))}

          {error && (
            <div style={{ background:`${C.coral}12`, border:`1.5px solid ${C.coral}50`, borderRadius:10, padding:"11px 14px", fontFamily:"Nunito", fontSize:13, color:C.coral, display:"flex", gap:8, alignItems:"center" }}>
              ⚠ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ background:loading ? C.muted : `linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:loading?"default":"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:15, padding:"15px", borderRadius:100, marginTop:4, boxShadow:loading?"none":`0 8px 24px ${C.navy}40`, transition:"all 0.2s", letterSpacing:"0.02em" }}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <div style={{ marginTop:28, padding:"14px 18px", background:C.warmGray, borderRadius:12, textAlign:"center" }}>
          <p style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, margin:0 }}>
            Default: <strong style={{color:C.navy}}>admin@mmn.com</strong> / <strong style={{color:C.navy}}>mmnadmin2024</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
