import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { C } from "../../../constants/theme";
import {
  fetchFees, createFee, updateFee, deleteFee,
  fetchInvoices, fetchFinanceSummary, generateInvoices, updateInvoice, deleteInvoice,
} from "../../../api/finance";
import { checkApiHealth } from "../../../api/auth";

const PROGRAMS = { PRESCHOOL:"Preschool", AFTERSCHOOL_CLUB:"Afterschool Club", MOTHERS_PROGRAMME:"Mother's Programme" };
const FREQUENCIES = { monthly:"Monthly", termly:"Termly", annually:"Annually", weekly:"Weekly" };
const INV_STATUS = {
  DRAFT:     { label:"Draft",     color:"#6B6B8A", bg:"#6B6B8A12" },
  SENT:      { label:"Sent",      color:"#1B3F8B", bg:"#1B3F8B12" },
  PAID:      { label:"Paid",      color:"#22C55E", bg:"#22C55E12" },
  OVERDUE:   { label:"Overdue",   color:"#EF4444", bg:"#EF444412" },
  CANCELLED: { label:"Cancelled", color:"#F0876A", bg:"#F0876A12" },
};

const PKR = (n) => `PKR ${Number(n).toLocaleString("en-PK", { minimumFractionDigits:0, maximumFractionDigits:0 })}`;
const THIS_MONTH = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; };

const Modal = ({ onClose, children }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
    <div style={{ background:C.white, borderRadius:20, padding:32, maxWidth:500, width:"100%", maxHeight:"90vh", overflowY:"auto", position:"relative", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
      <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"transparent", border:"none", fontSize:20, cursor:"pointer", color:C.muted, lineHeight:1 }}>✕</button>
      {children}
    </div>
  </div>
);

const inp = { width:"100%", padding:"10px 14px", border:`1.5px solid ${C.navy}15`, borderRadius:10, fontFamily:"Nunito", fontSize:13.5, color:C.text, background:C.white, outline:"none", boxSizing:"border-box" };
const lbl = { display:"block", fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" };

const OfflineState = () => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:20 }}>
    <div style={{ fontSize:64 }}>💰</div>
    <div style={{ fontFamily:"Fredoka One", fontSize:26, color:C.navy }}>API Server Required</div>
    <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, textAlign:"center", maxWidth:440, lineHeight:1.7, margin:0 }}>Finance management requires the MMN API server. Go to the <strong>Cloud</strong> tab to connect.</p>
  </div>
);

export default function DashFinance() {
  const qc = useQueryClient();
  const [isOnline, setIsOnline]   = useState(null);
  const [tab, setTab]             = useState("invoices");
  const [month, setMonth]         = useState(THIS_MONTH());
  const [statusFilter, setStatus] = useState("");
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [editFee, setEditFee]     = useState(null);
  const [feeForm, setFeeForm]     = useState({ name:"", programType:"PRESCHOOL", amount:"", frequency:"monthly" });
  const [feeErr, setFeeErr]       = useState("");
  const [showGenModal, setShowGenModal] = useState(false);
  const [genDueDate, setGenDueDate] = useState("");
  const [genResult, setGenResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [deleteId, setDeleteId]   = useState(null);
  const [deleteType, setDeleteType] = useState("inv");

  useEffect(() => { checkApiHealth().then(h => setIsOnline(!!h)); }, []);

  const { data: feesData }    = useQuery({ queryKey:["fees"], queryFn: fetchFees, enabled: !!isOnline });
  const fees = feesData?.data || [];

  const { data: summaryData } = useQuery({ queryKey:["fin-summary", month], queryFn: () => fetchFinanceSummary({ month }), enabled: !!isOnline });
  const summary = summaryData || { total:0, collected:0, pending:0, overdue:0, count:0, byStatus:{} };

  const { data: invData, isLoading: loadingInv } = useQuery({
    queryKey: ["invoices", month, statusFilter],
    queryFn: () => fetchInvoices({ month, status: statusFilter || undefined }),
    enabled: !!isOnline,
  });
  const invoices = invData?.data || [];

  const feeMut = useMutation({
    mutationFn: (data) => editFee ? updateFee(editFee.id, data) : createFee(data),
    onSuccess: () => { qc.invalidateQueries(["fees"]); setShowFeeModal(false); setEditFee(null); setFeeForm({ name:"", programType:"PRESCHOOL", amount:"", frequency:"monthly" }); },
    onError: (e) => setFeeErr(e.response?.data?.error || e.message),
  });
  const delFeeMut = useMutation({
    mutationFn: deleteFee,
    onSuccess: () => { qc.invalidateQueries(["fees"]); setDeleteId(null); },
  });
  const updateInvMut = useMutation({
    mutationFn: ({ id, data }) => updateInvoice(id, data),
    onSuccess: () => { qc.invalidateQueries(["invoices"]); qc.invalidateQueries(["fin-summary"]); },
  });
  const delInvMut = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => { qc.invalidateQueries(["invoices"]); qc.invalidateQueries(["fin-summary"]); setDeleteId(null); },
  });

  const openFeeModal = (fee) => {
    setEditFee(fee || null);
    setFeeForm(fee ? { name:fee.name, programType:fee.program_type, amount:fee.amount, frequency:fee.frequency } : { name:"", programType:"PRESCHOOL", amount:"", frequency:"monthly" });
    setFeeErr("");
    setShowFeeModal(true);
  };

  const saveFee = () => {
    if (!feeForm.name || !feeForm.amount) { setFeeErr("Name and amount required"); return; }
    setFeeErr("");
    feeMut.mutate({ name:feeForm.name, programType:feeForm.programType, amount:feeForm.amount, frequency:feeForm.frequency });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenResult(null);
    try {
      const r = await generateInvoices(month, genDueDate || null);
      setGenResult(r);
      qc.invalidateQueries(["invoices"]); qc.invalidateQueries(["fin-summary"]);
    } catch (e) {
      setGenResult({ error: e.response?.data?.error || e.message });
    } finally { setGenerating(false); }
  };

  const markStatus = (inv, status) => {
    updateInvMut.mutate({ id: inv.id, data: { status, paidAt: status==="PAID" ? new Date().toISOString() : null } });
  };

  if (isOnline === null) return <div style={{ padding:60, textAlign:"center", fontFamily:"Nunito", color:C.muted }}>Checking connection…</div>;
  if (isOnline === false) return <OfflineState />;

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"Fredoka One", fontSize:28, color:C.navy, margin:0 }}>💰 Finance</h1>
        <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, margin:"4px 0 0" }}>Fee structures, invoice generation, and payment tracking</p>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        {[{ k:"invoices",label:"Invoices",icon:"📄" },{ k:"fees",label:"Fee Structures",icon:"💳" }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            style={{ padding:"9px 20px", borderRadius:10, cursor:"pointer", border:`1.5px solid ${tab===t.k ? C.coral : `${C.navy}15`}`, background: tab===t.k ? `${C.coral}10` : "transparent", color: tab===t.k ? C.coral : C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── INVOICES ── */}
      {tab === "invoices" && (
        <div>
          {/* Summary cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
            {[
              { label:"Total Invoiced", value: PKR(summary.total),     color: C.navy },
              { label:"Collected",      value: PKR(summary.collected), color: "#22C55E" },
              { label:"Pending",        value: PKR(summary.pending),   color: "#F5A623" },
              { label:"Overdue",        value: PKR(summary.overdue),   color: "#EF4444" },
            ].map(s => (
              <div key={s.label} style={{ background:C.white, borderRadius:14, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", padding:"16px 18px" }}>
                <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>{s.label}</div>
                <div style={{ fontFamily:"Fredoka One", fontSize:20, color:s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:16, flexWrap:"wrap" }}>
            <input type="month" value={month} onChange={e => setMonth(e.target.value)}
              style={{ padding:"8px 14px", borderRadius:10, border:`1.5px solid ${C.navy}20`, fontFamily:"Nunito", fontSize:14, outline:"none", color:C.text }} />
            <select value={statusFilter} onChange={e => setStatus(e.target.value)}
              style={{ padding:"8px 14px", borderRadius:10, border:`1.5px solid ${C.navy}20`, fontFamily:"Nunito", fontSize:13, outline:"none", background:C.white, color:C.text }}>
              <option value="">All Statuses</option>
              {Object.entries(INV_STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <div style={{ flex:1 }} />
            <button onClick={() => { setGenResult(null); setShowGenModal(true); }}
              style={{ padding:"9px 20px", borderRadius:10, background:C.coral, color:C.white, border:"none", fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              ⚡ Generate for Month
            </button>
          </div>

          {/* Invoice table */}
          <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", overflow:"hidden" }}>
            {loadingInv ? (
              <div style={{ padding:40, textAlign:"center", fontFamily:"Nunito", color:C.muted }}>Loading invoices…</div>
            ) : invoices.length === 0 ? (
              <div style={{ padding:48, textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📄</div>
                <div style={{ fontFamily:"Fredoka One", fontSize:20, color:C.navy, marginBottom:8 }}>No Invoices</div>
                <div style={{ fontFamily:"Nunito", fontSize:14, color:C.muted }}>Click "Generate for Month" to create invoices for all active students.</div>
              </div>
            ) : (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:`${C.navy}06`, borderBottom:`1px solid ${C.navy}10` }}>
                    {["Student","Program","Amount","Due Date","Status","Actions"].map(h => (
                      <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.navy, textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => {
                    const stCfg = INV_STATUS[inv.status] || INV_STATUS.DRAFT;
                    return (
                      <tr key={inv.id} style={{ borderBottom:`1px solid ${C.navy}07`, background: i%2===0?"transparent":`${C.navy}02` }}>
                        <td style={{ padding:"11px 16px", fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.text }}>
                          {inv.student_name}
                          {inv.students?.classes && <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>{inv.students.classes.name}</div>}
                        </td>
                        <td style={{ padding:"11px 16px", fontFamily:"Nunito", fontSize:12, color:C.muted }}>
                          {inv.fee_structures ? PROGRAMS[inv.fee_structures.program_type] || inv.fee_structures.program_type : "—"}
                        </td>
                        <td style={{ padding:"11px 16px", fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.text }}>{PKR(inv.amount)}</td>
                        <td style={{ padding:"11px 16px", fontFamily:"Nunito", fontSize:12, color:C.muted }}>
                          {inv.due_date ? new Date(inv.due_date+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"}) : "—"}
                        </td>
                        <td style={{ padding:"11px 16px" }}>
                          <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:stCfg.color, background:stCfg.bg, padding:"3px 9px", borderRadius:100 }}>{stCfg.label}</span>
                        </td>
                        <td style={{ padding:"11px 16px" }}>
                          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                            {inv.status !== "PAID" && <button onClick={() => markStatus(inv,"PAID")} style={quickStatusBtn("#22C55E")}>✓ Paid</button>}
                            {inv.status === "DRAFT" && <button onClick={() => markStatus(inv,"SENT")} style={quickStatusBtn("#1B3F8B")}>Send</button>}
                            {["DRAFT","SENT"].includes(inv.status) && <button onClick={() => markStatus(inv,"OVERDUE")} style={quickStatusBtn("#EF4444")}>Overdue</button>}
                            <button onClick={() => { setDeleteId(inv.id); setDeleteType("inv"); }} style={{ padding:"4px 8px", borderRadius:7, border:"1px solid #EF444428", background:"transparent", color:"#EF4444", fontFamily:"Nunito", fontWeight:700, fontSize:10, cursor:"pointer" }}>✕</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── FEE STRUCTURES ── */}
      {tab === "fees" && (
        <div>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
            <button onClick={() => openFeeModal(null)} style={{ padding:"9px 20px", borderRadius:10, background:C.coral, color:C.white, border:"none", fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>+ Add Fee Structure</button>
          </div>
          <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", overflow:"hidden" }}>
            {fees.length === 0 ? (
              <div style={{ padding:48, textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>💳</div>
                <div style={{ fontFamily:"Fredoka One", fontSize:20, color:C.navy, marginBottom:8 }}>No Fee Structures</div>
                <div style={{ fontFamily:"Nunito", fontSize:14, color:C.muted }}>Add fee structures for each programme to generate invoices automatically.</div>
              </div>
            ) : (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:`${C.navy}06`, borderBottom:`1px solid ${C.navy}10` }}>
                    {["Programme","Fee Name","Amount","Frequency",""].map(h => (
                      <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.navy, textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee, i) => (
                    <tr key={fee.id} style={{ borderBottom:`1px solid ${C.navy}07`, background: i%2===0?"transparent":`${C.navy}02` }}>
                      <td style={{ padding:"12px 16px", fontFamily:"Nunito", fontSize:13, color:C.muted }}>{PROGRAMS[fee.program_type] || fee.program_type}</td>
                      <td style={{ padding:"12px 16px", fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.text }}>{fee.name}</td>
                      <td style={{ padding:"12px 16px", fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.navy }}>{PKR(fee.amount)}</td>
                      <td style={{ padding:"12px 16px", fontFamily:"Nunito", fontSize:13, color:C.muted, textTransform:"capitalize" }}>{fee.frequency}</td>
                      <td style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={() => openFeeModal(fee)} style={{ padding:"5px 10px", borderRadius:8, border:`1px solid ${C.navy}20`, background:"transparent", color:C.navy, fontFamily:"Nunito", fontWeight:700, fontSize:11, cursor:"pointer" }}>Edit</button>
                          <button onClick={() => { setDeleteId(fee.id); setDeleteType("fee"); }} style={{ padding:"5px 10px", borderRadius:8, border:"1px solid #EF444430", background:"transparent", color:"#EF4444", fontFamily:"Nunito", fontWeight:700, fontSize:11, cursor:"pointer" }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Fee modal */}
      {showFeeModal && (
        <Modal onClose={() => { setShowFeeModal(false); setEditFee(null); }}>
          <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:20 }}>{editFee ? "Edit" : "Add"} Fee Structure</div>
          <div style={{ display:"grid", gap:14 }}>
            <div><label style={lbl}>Fee Name *</label><input type="text" placeholder="e.g. Monthly Tuition" value={feeForm.name} onChange={e=>setFeeForm(f=>({...f,name:e.target.value}))} style={inp}/></div>
            <div><label style={lbl}>Programme *</label>
              <select value={feeForm.programType} onChange={e=>setFeeForm(f=>({...f,programType:e.target.value}))} style={inp}>
                {Object.entries(PROGRAMS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div><label style={lbl}>Amount (PKR) *</label><input type="number" min={0} placeholder="e.g. 8000" value={feeForm.amount} onChange={e=>setFeeForm(f=>({...f,amount:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>Frequency</label>
                <select value={feeForm.frequency} onChange={e=>setFeeForm(f=>({...f,frequency:e.target.value}))} style={inp}>
                  {Object.entries(FREQUENCIES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select></div>
            </div>
            {feeErr && <div style={{ fontFamily:"Nunito", fontSize:13, color:"#EF4444", fontWeight:700 }}>{feeErr}</div>}
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={()=>{setShowFeeModal(false);setEditFee(null);}} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${C.navy}20`, background:"transparent", color:C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={saveFee} disabled={feeMut.isPending} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:C.coral, color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>{feeMut.isPending?"Saving…":editFee?"Update":"Add"}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Generate modal */}
      {showGenModal && (
        <Modal onClose={() => { setShowGenModal(false); setGenResult(null); }}>
          <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:6 }}>⚡ Generate Invoices</div>
          <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, marginBottom:20 }}>Creates invoices for all active/enrolled students based on their programme's fee structure. Skips students already invoiced for this month.</div>
          <div style={{ display:"grid", gap:14 }}>
            <div>
              <label style={lbl}>Month *</label>
              <input type="month" value={month} onChange={e=>setMonth(e.target.value)} style={inp}/>
            </div>
            <div>
              <label style={lbl}>Due Date (optional)</label>
              <input type="date" value={genDueDate} onChange={e=>setGenDueDate(e.target.value)} style={inp}/>
            </div>
            {genResult && !genResult.error && (
              <div style={{ background:"#22C55E10", border:"1px solid #22C55E30", borderRadius:10, padding:"12px 16px", fontFamily:"Nunito", fontSize:13, color:"#22C55E" }}>
                ✓ Created {genResult.created} invoices. Skipped {genResult.skipped} (already existed or no fee structure).
              </div>
            )}
            {genResult?.error && <div style={{ fontFamily:"Nunito", fontSize:13, color:"#EF4444", fontWeight:700 }}>{genResult.error}</div>}
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={() => setShowGenModal(false)} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${C.navy}20`, background:"transparent", color:C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>Close</button>
              <button onClick={handleGenerate} disabled={generating}
                style={{ padding:"10px 24px", borderRadius:10, border:"none", background:C.coral, color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                {generating ? "Generating…" : "Generate"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <Modal onClose={() => setDeleteId(null)}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🗑️</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:8 }}>Delete {deleteType==="fee"?"Fee Structure":"Invoice"}?</div>
            <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, marginBottom:24 }}>This will be permanently removed.</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => setDeleteId(null)} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${C.navy}20`, background:"transparent", color:C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={() => deleteType==="fee" ? delFeeMut.mutate(deleteId) : delInvMut.mutate(deleteId)}
                disabled={delFeeMut.isPending || delInvMut.isPending}
                style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"#EF4444", color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

const quickStatusBtn = (color) => ({ padding:"4px 8px", borderRadius:7, border:`1px solid ${color}30`, background:`${color}10`, color, fontFamily:"Nunito", fontWeight:700, fontSize:10, cursor:"pointer" });
