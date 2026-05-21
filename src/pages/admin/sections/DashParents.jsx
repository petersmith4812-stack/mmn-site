import { useState, useEffect } from "react";
import { C } from "../../../constants/theme";
import { checkApiHealth } from "../../../api/auth";
import { fetchAllParents, setParentPortal, sendParentMessage } from "../../../api/parentPortal";

const Modal = ({ onClose, children }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
    <div style={{ background:C.white, borderRadius:20, padding:32, maxWidth:480, width:"100%", maxHeight:"90vh", overflowY:"auto", position:"relative", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
      <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"transparent", border:"none", fontSize:20, cursor:"pointer", color:C.muted, lineHeight:1 }}>✕</button>
      {children}
    </div>
  </div>
);

const inp = { width:"100%", padding:"10px 14px", border:`1.5px solid ${C.navy}15`, borderRadius:10, fontFamily:"Nunito", fontSize:13.5, color:C.text, background:C.white, outline:"none", boxSizing:"border-box" };
const lbl = { display:"block", fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" };

const OfflineState = () => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:20 }}>
    <div style={{ fontSize:64 }}>👪</div>
    <div style={{ fontFamily:"Fredoka One", fontSize:26, color:C.navy }}>API Server Required</div>
    <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, textAlign:"center", maxWidth:440, lineHeight:1.7, margin:0 }}>
      Parent management requires the MMN API server. Go to the <strong>Cloud</strong> tab to connect.
    </p>
  </div>
);

export default function DashParents() {
  const [isOnline, setIsOnline]   = useState(null);
  const [parents, setParents]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [portalParent, setPortalParent] = useState(null);
  const [msgParent, setMsgParent] = useState(null);
  const [portalEnabled, setPortalEnabled] = useState(false);
  const [portalPass, setPortalPass] = useState("");
  const [portalConfirm, setPortalConfirm] = useState("");
  const [portalErr, setPortalErr] = useState("");
  const [portalSaving, setPortalSaving] = useState(false);
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody]     = useState("");
  const [msgStudent, setMsgStudent] = useState("");
  const [msgErr, setMsgErr]       = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const [toast, setToast]         = useState("");

  useEffect(() => { checkApiHealth().then(h => setIsOnline(!!h)); }, []);

  const loadParents = () => {
    if (!isOnline) return;
    setLoading(true);
    fetchAllParents()
      .then(r => { setParents(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { if (isOnline) loadParents(); }, [isOnline]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const openPortalModal = (parent) => {
    setPortalParent(parent);
    setPortalEnabled(parent.portal_enabled);
    setPortalPass("");
    setPortalConfirm("");
    setPortalErr("");
  };

  const savePortal = async () => {
    if (portalEnabled && !portalPass && !portalParent.portal_enabled) {
      setPortalErr("Set a password to enable the portal"); return;
    }
    if (portalEnabled && portalPass && portalPass.length < 6) {
      setPortalErr("Password must be at least 6 characters"); return;
    }
    if (portalEnabled && portalPass && portalPass !== portalConfirm) {
      setPortalErr("Passwords do not match"); return;
    }
    setPortalErr("");
    setPortalSaving(true);
    try {
      await setParentPortal(portalParent.id, portalEnabled, portalPass || undefined);
      showToast(portalEnabled ? "Portal enabled successfully" : "Portal disabled");
      setPortalParent(null);
      loadParents();
    } catch (e) {
      setPortalErr(e.response?.data?.error || e.message);
    } finally {
      setPortalSaving(false);
    }
  };

  const openMsgModal = (parent) => {
    setMsgParent(parent);
    setMsgSubject("");
    setMsgBody("");
    setMsgStudent(parent.student_parents?.[0]?.students?.id || "");
    setMsgErr("");
  };

  const sendMsg = async () => {
    if (!msgSubject.trim() || !msgBody.trim()) { setMsgErr("Subject and message are required"); return; }
    setMsgErr("");
    setMsgSending(true);
    try {
      await sendParentMessage(msgParent.id, { subject: msgSubject.trim(), body: msgBody.trim(), studentId: msgStudent || null });
      showToast("Message sent to parent");
      setMsgParent(null);
    } catch (e) {
      setMsgErr(e.response?.data?.error || e.message);
    } finally {
      setMsgSending(false);
    }
  };

  const filtered = search
    ? parents.filter(p => `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(search.toLowerCase()))
    : parents;

  if (isOnline === null) return <div style={{ padding:60, textAlign:"center", fontFamily:"Nunito", color:C.muted }}>Checking connection…</div>;
  if (isOnline === false) return <OfflineState />;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"Fredoka One", fontSize:28, color:C.navy, margin:0 }}>👪 Parent Management</h1>
        <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, margin:"4px 0 0" }}>Manage parent portal access and send messages to families</p>
      </div>

      {/* Info banner */}
      <div style={{ background:`${C.navy}08`, border:`1px solid ${C.navy}15`, borderRadius:14, padding:"14px 20px", marginBottom:24 }}>
        <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.navy, marginBottom:4 }}>Parent Portal</div>
        <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted }}>
          Parents can log in at <strong style={{ color:C.navy }}>/parent</strong> with their email and the password you set here.
          Enable the portal per parent and set a secure password — they can then view their child's attendance, progress, daily logs, and messages.
        </div>
      </div>

      {/* Search + stats */}
      <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:20 }}>
        <input type="text" placeholder="Search parents…" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inp, maxWidth:300 }} />
        <div style={{ flex:1 }} />
        <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted }}>
          {parents.filter(p => p.portal_enabled).length} of {parents.length} parents have portal access
        </div>
        <button onClick={loadParents} style={{ padding:"8px 16px", borderRadius:10, border:`1px solid ${C.navy}20`, background:"transparent", color:C.navy, fontFamily:"Nunito", fontWeight:700, fontSize:12, cursor:"pointer" }}>
          Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", overflow:"hidden" }}>
        {loading ? (
          <div style={{ padding:48, textAlign:"center", fontFamily:"Nunito", color:C.muted }}>Loading parents…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:48, textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>👪</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:20, color:C.navy, marginBottom:8 }}>No Parents Found</div>
            <div style={{ fontFamily:"Nunito", fontSize:14, color:C.muted }}>
              Parents are created when you add a student with a parent. Go to the Students tab to add students with parent information.
            </div>
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:`${C.navy}06`, borderBottom:`1px solid ${C.navy}10` }}>
                {["Parent","Email / Phone","Children","Portal","Actions"].map(h => (
                  <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.navy, textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((parent, i) => {
                const students = parent.student_parents || [];
                return (
                  <tr key={parent.id} style={{ borderBottom:`1px solid ${C.navy}07`, background: i%2===0?"transparent":`${C.navy}02` }}>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:14, color:C.text }}>{parent.first_name} {parent.last_name}</div>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      {parent.email && <div style={{ fontFamily:"Nunito", fontSize:13, color:C.text }}>{parent.email}</div>}
                      {parent.phone && <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted }}>{parent.phone}</div>}
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      {students.length === 0 ? (
                        <span style={{ fontFamily:"Nunito", fontSize:12, color:C.muted }}>—</span>
                      ) : students.map((sp, j) => (
                        <div key={j} style={{ fontFamily:"Nunito", fontSize:12, color:C.text }}>
                          {sp.students?.first_name} {sp.students?.last_name}
                          <span style={{ color:C.muted }}> ({sp.relation})</span>
                        </div>
                      ))}
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color: parent.portal_enabled ? "#22C55E" : C.muted, background: parent.portal_enabled ? "#22C55E14" : `${C.muted}14`, padding:"3px 10px", borderRadius:100 }}>
                        {parent.portal_enabled ? "✓ Active" : "Disabled"}
                      </span>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => openPortalModal(parent)}
                          style={{ padding:"5px 12px", borderRadius:8, border:`1px solid ${C.navy}20`, background:"transparent", color:C.navy, fontFamily:"Nunito", fontWeight:700, fontSize:11, cursor:"pointer" }}>
                          {parent.portal_enabled ? "Manage Access" : "Enable Portal"}
                        </button>
                        {parent.email && (
                          <button onClick={() => openMsgModal(parent)}
                            style={{ padding:"5px 12px", borderRadius:8, border:`1px solid ${C.coral}30`, background:"transparent", color:C.coral, fontFamily:"Nunito", fontWeight:700, fontSize:11, cursor:"pointer" }}>
                            Message
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Portal modal */}
      {portalParent && (
        <Modal onClose={() => setPortalParent(null)}>
          <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:4 }}>Parent Portal Access</div>
          <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, marginBottom:20 }}>{portalParent.first_name} {portalParent.last_name} · {portalParent.email}</div>
          <div style={{ display:"grid", gap:14 }}>
            <div>
              <label style={lbl}>Portal Access</label>
              <div style={{ display:"flex", gap:8 }}>
                {[true,false].map(val => (
                  <button key={String(val)} onClick={() => setPortalEnabled(val)}
                    style={{ flex:1, padding:"9px", borderRadius:10, cursor:"pointer", border:`1.5px solid ${portalEnabled===val ? (val?"#22C55E":"#EF4444") : `${C.navy}15`}`, background: portalEnabled===val ? `${val?"#22C55E":"#EF4444"}12` : "transparent", color: portalEnabled===val ? (val?"#22C55E":"#EF4444") : C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:13 }}>
                    {val ? "✓ Enable Portal" : "✕ Disable Portal"}
                  </button>
                ))}
              </div>
            </div>
            {portalEnabled && (
              <>
                <div>
                  <label style={lbl}>{portalParent.portal_enabled ? "New Password (leave blank to keep current)" : "Set Password *"}</label>
                  <input type="password" placeholder="Min. 6 characters" value={portalPass}
                    onChange={e => setPortalPass(e.target.value)} style={inp} />
                </div>
                {portalPass && (
                  <div>
                    <label style={lbl}>Confirm Password</label>
                    <input type="password" placeholder="Repeat password" value={portalConfirm}
                      onChange={e => setPortalConfirm(e.target.value)} style={inp} />
                  </div>
                )}
                <div style={{ background:`${C.navy}06`, borderRadius:10, padding:"10px 14px", fontFamily:"Nunito", fontSize:12, color:C.muted, lineHeight:1.6 }}>
                  Parent logs in at <strong>/parent</strong> using email <strong>{portalParent.email}</strong> and the password you set above.
                </div>
              </>
            )}
            {portalErr && <div style={{ fontFamily:"Nunito", fontSize:13, color:"#EF4444", fontWeight:700 }}>{portalErr}</div>}
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={() => setPortalParent(null)} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${C.navy}20`, background:"transparent", color:C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={savePortal} disabled={portalSaving}
                style={{ padding:"10px 24px", borderRadius:10, border:"none", background:C.coral, color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                {portalSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Message modal */}
      {msgParent && (
        <Modal onClose={() => setMsgParent(null)}>
          <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:4 }}>Send Message</div>
          <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, marginBottom:20 }}>To: {msgParent.first_name} {msgParent.last_name}</div>
          <div style={{ display:"grid", gap:14 }}>
            {(msgParent.student_parents || []).length > 1 && (
              <div>
                <label style={lbl}>Regarding (child)</label>
                <select value={msgStudent} onChange={e => setMsgStudent(e.target.value)} style={inp}>
                  <option value="">General message</option>
                  {msgParent.student_parents.map(sp => (
                    <option key={sp.students?.id} value={sp.students?.id}>{sp.students?.first_name} {sp.students?.last_name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label style={lbl}>Subject *</label>
              <input type="text" placeholder="e.g. Weekly Update" value={msgSubject}
                onChange={e => setMsgSubject(e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Message *</label>
              <textarea rows={5} placeholder="Write your message to the parent…" value={msgBody}
                onChange={e => setMsgBody(e.target.value)} style={{ ...inp, resize:"vertical", lineHeight:1.6 }} />
            </div>
            {msgErr && <div style={{ fontFamily:"Nunito", fontSize:13, color:"#EF4444", fontWeight:700 }}>{msgErr}</div>}
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={() => setMsgParent(null)} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${C.navy}20`, background:"transparent", color:C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={sendMsg} disabled={msgSending}
                style={{ padding:"10px 24px", borderRadius:10, border:"none", background:C.coral, color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                {msgSending ? "Sending…" : "Send Message"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:32, right:32, background:C.navy, color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"12px 22px", borderRadius:14, boxShadow:"0 8px 30px rgba(0,0,0,0.2)", zIndex:2000 }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
