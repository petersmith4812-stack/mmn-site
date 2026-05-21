import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../../constants/theme";
import { parentLogin } from "../../api/parentPortal";

export default function ParentLogin() {
  const navigate = useNavigate();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await parentLogin(email.trim(), password);
      sessionStorage.setItem("mmn_parent_token", res.token);
      sessionStorage.setItem("mmn_parent_session", JSON.stringify({
        parentId:  res.parent.id,
        firstName: res.parent.firstName,
        lastName:  res.parent.lastName,
        email:     res.parent.email,
        students:  res.students,
      }));
      navigate("/parent/dashboard");
    } catch (e) {
      setError(e.response?.data?.error || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(135deg,${C.navy} 0%,#1a2e5a 60%,${C.coral}33 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:C.white, borderRadius:24, padding:"40px 40px 36px", maxWidth:420, width:"100%", boxShadow:"0 24px 80px rgba(0,0,0,0.25)" }}>
        {/* Brand */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:64, height:64, borderRadius:18, background:`linear-gradient(135deg,${C.coral},${C.yellow})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, margin:"0 auto 14px" }}>🕌</div>
          <div style={{ fontFamily:"Fredoka One", fontSize:26, color:C.navy, lineHeight:1 }}>Mini Muslims Nest</div>
          <div style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, marginTop:4 }}>Parent Portal</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Email Address</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="parent@example.com" autoComplete="email"
              style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:`1.5px solid ${C.navy}20`, fontFamily:"Nunito", fontSize:15, color:C.text, outline:"none", boxSizing:"border-box" }}
            />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password"
              style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:`1.5px solid ${C.navy}20`, fontFamily:"Nunito", fontSize:15, color:C.text, outline:"none", boxSizing:"border-box" }}
            />
          </div>
          {error && (
            <div style={{ background:"#FEE2E2", border:"1px solid #FECACA", borderRadius:10, padding:"10px 14px", marginBottom:16, fontFamily:"Nunito", fontSize:13, color:"#DC2626" }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{ width:"100%", padding:"13px", borderRadius:12, background:`linear-gradient(135deg,${C.coral},${C.yellow})`, color:C.white, border:"none", fontFamily:"Nunito", fontWeight:800, fontSize:16, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.8 : 1 }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop:24, padding:"14px 16px", background:`${C.navy}06`, borderRadius:12 }}>
          <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, marginBottom:4 }}>Need access?</div>
          <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, lineHeight:1.6 }}>
            Contact the school at <strong>+92 306 5058989</strong> to get your parent portal login details.
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:20 }}>
          <a href="/" style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, textDecoration:"none" }}>← Back to school website</a>
        </div>
      </div>
    </div>
  );
}
