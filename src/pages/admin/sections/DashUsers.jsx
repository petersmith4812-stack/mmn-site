import { useState } from "react";
import { C } from "../../../constants/theme";
import { useAdmin, ROLES, ROLE_ACCESS } from "../../../context/AdminContext";

const AVATARS = ["👑","👤","🧑‍💼","👩‍💼","🧑‍🏫","👩‍🏫","🧕","👨‍💻","🧕‍♀️","🦁"];
const fmt = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "Never";

export default function DashUsers({ currentUser }) {
  const { users, addUser, updateUser, deleteUser } = useAdmin();
  const [showAdd, setShowAdd]     = useState(false);
  const [editing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [showPw, setShowPw]       = useState({});
  const [newUser, setNewUser]      = useState({ name:"", email:"", password:"", role:"editor", avatar:"👤" });
  const [saved, setSaved]          = useState("");
  const [errors, setErrors]        = useState({});

  const isSuperAdmin = currentUser.role === "superadmin";

  const validate = (u) => {
    const e = {};
    if (!u.name.trim()) e.name = "Name required";
    if (!u.email.trim()) e.email = "Email required";
    if (users.some(x=>x.email.toLowerCase()===u.email.toLowerCase()&&x.id!==editing)) e.email = "Email already exists";
    if (!editing && u.password.length < 6) e.password = "Min. 6 characters";
    return e;
  };

  const doAdd = () => {
    const e = validate(newUser);
    if (Object.keys(e).length) { setErrors(e); return; }
    addUser(newUser);
    setNewUser({ name:"", email:"", password:"", role:"editor", avatar:"👤" });
    setShowAdd(false); setErrors({});
    setSaved("added"); setTimeout(()=>setSaved(""), 2200);
  };

  const toggleActive = (id, active) => updateUser(id, { active: !active });

  const baseInput = { width:"100%", padding:"11px 14px", border:`1.5px solid ${C.navy}18`, borderRadius:10, fontFamily:"Nunito", fontSize:13.5, color:C.text, background:C.white, outline:"none", boxSizing:"border-box" };

  const RoleBadge = ({ role }) => {
    const r = ROLES[role] || ROLES.viewer;
    return <span style={{ fontFamily:"Nunito", fontWeight:800, fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", background:r.bg, color:r.color, padding:"3px 10px", borderRadius:100 }}>{r.label}</span>;
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:24, color:"#1a1a2e", margin:"0 0 4px" }}>User Management</h2>
          <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, margin:0 }}>{users.length} admin users</p>
        </div>
        {isSuperAdmin && (
          <button onClick={()=>setShowAdd(true)} style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"10px 22px", borderRadius:100, boxShadow:`0 4px 14px ${C.navy}35` }}>+ Add User</button>
        )}
      </div>

      {saved && (
        <div style={{ background:`${C.mint}18`, border:`1.5px solid ${C.mint}40`, borderRadius:12, padding:"12px 16px", marginBottom:16, fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.mint }}>✓ User {saved} successfully.</div>
      )}

      {/* Role guide */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12, marginBottom:20 }}>
        {Object.entries(ROLES).map(([key, { label, color, bg }]) => (
          <div key={key} style={{ background:C.white, borderRadius:14, padding:"14px 16px", boxShadow:"0 1px 6px rgba(0,0,0,0.05)", border:`1.5px solid ${color}20` }}>
            <RoleBadge role={key} />
            <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, marginTop:8, lineHeight:1.5 }}>
              {ROLE_ACCESS[key].join(", ")}
            </div>
          </div>
        ))}
      </div>

      {/* Users list */}
      <div style={{ background:C.white, borderRadius:18, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", overflow:"hidden" }}>
        {users.map((user, idx) => {
          const isMe = user.id === currentUser.id;
          return (
            <div key={user.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 22px", borderBottom:idx<users.length-1?`1px solid ${C.navy}08`:"none", flexWrap:"wrap" }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:`linear-gradient(135deg,${C.coral}30,${C.yellow}30)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{user.avatar}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:14, color:"#1a1a2e", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  {user.name}
                  {isMe && <span style={{ fontFamily:"Nunito", fontSize:10, color:C.mint, background:`${C.mint}15`, padding:"2px 8px", borderRadius:100 }}>You</span>}
                  {!user.active && <span style={{ fontFamily:"Nunito", fontSize:10, color:C.coral, background:`${C.coral}15`, padding:"2px 8px", borderRadius:100 }}>Inactive</span>}
                </div>
                <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, marginTop:2 }}>{user.email}</div>
                <div style={{ display:"flex", gap:8, marginTop:6, flexWrap:"wrap", alignItems:"center" }}>
                  <RoleBadge role={user.role} />
                  <span style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>Joined {fmt(user.createdAt)}</span>
                  <span style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>· Last login: {fmt(user.lastLogin)}</span>
                </div>
              </div>

              {isSuperAdmin && !isMe && (
                <div style={{ display:"flex", gap:8, flexShrink:0, flexWrap:"wrap" }}>
                  <select value={user.role} onChange={e=>updateUser(user.id,{role:e.target.value})} style={{ ...baseInput, width:"auto", padding:"7px 10px", fontSize:12, cursor:"pointer" }}>
                    {Object.keys(ROLES).map(r=><option key={r} value={r}>{ROLES[r].label}</option>)}
                  </select>
                  <button onClick={()=>toggleActive(user.id, user.active)} style={{ background:user.active?`${C.yellow}20`:`${C.mint}20`, color:user.active?"#9B7000":C.mint, border:`1px solid ${user.active?C.yellow:C.mint}40`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"7px 12px", borderRadius:8 }}>
                    {user.active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={()=>setConfirmDel(user.id)} style={{ background:`${C.coral}12`, color:C.coral, border:`1px solid ${C.coral}30`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"7px 12px", borderRadius:8 }}>Delete</button>
                </div>
              )}

              {/* Show/hide password for own account */}
              {isMe && (
                <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito" }}>
                  <span>PW: {showPw[user.id] ? user.password : "••••••••"}</span>
                  <button onClick={()=>setShowPw(p=>({...p,[user.id]:!p[user.id]}))} style={{ background:"none", border:"none", cursor:"pointer", color:C.navy, fontSize:12, marginLeft:6 }}>{showPw[user.id]?"hide":"show"}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isSuperAdmin && (
        <div style={{ marginTop:12, padding:"12px 16px", background:`${C.navy}08`, borderRadius:12 }}>
          <p style={{ fontFamily:"Nunito", fontSize:12.5, color:C.navy, margin:0 }}>Only Super Admins can add, edit, or delete users.</p>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAdd && (
        <>
          <div onClick={()=>{setShowAdd(false);setErrors({});}} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:300 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:C.white, borderRadius:22, padding:"36px 32px", width:"min(480px,95vw)", zIndex:301, boxShadow:"0 24px 80px rgba(0,0,0,0.2)", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:22, color:"#1a1a2e", marginBottom:20 }}>Add New User</div>

            {/* Avatar picker */}
            <div style={{ marginBottom:18 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:8 }}>Avatar</label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {AVATARS.map(a=>(
                  <button key={a} onClick={()=>setNewUser(p=>({...p,avatar:a}))} style={{ width:40, height:40, borderRadius:"50%", border:`2px solid ${newUser.avatar===a?C.navy:"transparent"}`, background:newUser.avatar===a?`${C.navy}12`:"#F5F5F5", cursor:"pointer", fontSize:20 }}>{a}</button>
                ))}
              </div>
            </div>

            {[
              { label:"Full Name *",        key:"name",     type:"text",     ph:"Jane Smith" },
              { label:"Email Address *",    key:"email",    type:"email",    ph:"jane@example.com" },
              { label:"Password * (min 6)", key:"password", type:"password", ph:"••••••" },
            ].map(({ label, key, type, ph }) => (
              <div key={key} style={{ marginBottom:14 }}>
                <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:errors[key]?C.coral:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:5 }}>{label}</label>
                <input type={type} value={newUser[key]} onChange={e=>{setNewUser(p=>({...p,[key]:e.target.value}));setErrors(p=>({...p,[key]:""}));}} placeholder={ph} style={{ ...baseInput, borderColor:errors[key]?C.coral:`${C.navy}18` }} />
                {errors[key] && <div style={{ fontFamily:"Nunito", fontSize:11.5, color:C.coral, marginTop:3 }}>{errors[key]}</div>}
              </div>
            ))}

            <div style={{ marginBottom:20 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:5 }}>Role</label>
              <select value={newUser.role} onChange={e=>setNewUser(p=>({...p,role:e.target.value}))} style={{ ...baseInput, cursor:"pointer" }}>
                {Object.entries(ROLES).map(([k,r])=><option key={k} value={k}>{r.label} — {ROLE_ACCESS[k].join(", ")}</option>)}
              </select>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={doAdd} style={{ flex:1, background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"13px", borderRadius:100 }}>Add User</button>
              <button onClick={()=>{setShowAdd(false);setErrors({});}} style={{ flex:1, background:C.warmGray, color:C.muted, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"13px", borderRadius:100 }}>Cancel</button>
            </div>
          </div>
        </>
      )}

      {confirmDel && (
        <>
          <div onClick={()=>setConfirmDel(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:400 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:C.white, borderRadius:20, padding:"32px 28px", width:"min(360px,90vw)", zIndex:401, textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:20, color:"#1a1a2e", marginBottom:8 }}>Delete this user?</div>
            <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.muted, marginBottom:24 }}>They will lose all access immediately.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>{deleteUser(confirmDel);setConfirmDel(null);setSaved("deleted");setTimeout(()=>setSaved(""),2200);}} style={{ flex:1, background:C.coral, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"12px", borderRadius:100 }}>Delete</button>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1, background:C.warmGray, color:C.text, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"12px", borderRadius:100 }}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
