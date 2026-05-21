import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { C } from "../../../constants/theme";
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "../../../api/students";
import { fetchClasses } from "../../../api/leads";
import { checkApiHealth } from "../../../api/auth";

const P = C;

const STATUS_CONFIG = {
  ACTIVE:    { label:"Active",     color:"#22C55E", bg:"#22C55E15" },
  ENROLLED:  { label:"Enrolled",   color:"#1B3F8B", bg:"#1B3F8B15" },
  APPLIED:   { label:"Applied",    color:"#6C63FF", bg:"#6C63FF15" },
  WAITLISTED:{ label:"Waitlisted", color:"#F5A623", bg:"#F5A62315" },
  INQUIRY:   { label:"Inquiry",    color:"#4BAE95", bg:"#4BAE9515" },
  GRADUATED: { label:"Graduated",  color:"#9B59B6", bg:"#9B59B615" },
  WITHDRAWN: { label:"Withdrawn",  color:"#F0876A", bg:"#F0876A15" },
  INACTIVE:  { label:"Inactive",   color:"#6B6B8A", bg:"#6B6B8A15" },
};

const PROGRAM_CONFIG = {
  PRESCHOOL:        { label:"Preschool",       icon:"🎒" },
  AFTERSCHOOL_CLUB: { label:"Afterschool Club", icon:"🌈" },
  MOTHERS_PROGRAMME:{ label:"Mother's Programme", icon:"👩" },
};

const EMPTY_FORM = {
  firstName:"", lastName:"", dateOfBirth:"", gender:"", programType:"", classId:"",
  status:"ACTIVE", admissionNo:"", allergies:[], medicalNotes:"", emergencyContact:"", notes:"",
  parentFirstName:"", parentLastName:"", parentPhone:"", parentWhatsapp:"", parentEmail:"", parentRelation:"mother",
};

const baseInput = {
  width:"100%", padding:"10px 14px", border:`1.5px solid ${C.navy}15`, borderRadius:10,
  fontFamily:"Nunito", fontSize:13.5, color:C.text, background:C.white, outline:"none",
  boxSizing:"border-box",
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;
  return <span style={{ fontFamily:"Nunito", fontWeight:800, fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", background:cfg.bg, color:cfg.color, padding:"3px 10px", borderRadius:100 }}>{cfg.label}</span>;
};

const OfflineState = () => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:20 }}>
    <div style={{ fontSize:64 }}>☁️</div>
    <div style={{ fontFamily:"Fredoka One", fontSize:26, color:"#1a1a2e", textAlign:"center" }}>Connect to Cloud to Manage Students</div>
    <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, textAlign:"center", maxWidth:460, lineHeight:1.7, margin:0 }}>
      The Students module requires the MMN API server and a Supabase database. Head to the <strong>Cloud</strong> tab to set up your connection — it only takes a few minutes.
    </p>
    <div style={{ background:`${C.navy}08`, borderRadius:16, padding:"20px 28px", maxWidth:440, width:"100%" }}>
      <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.08em" }}>Quick Setup</div>
      {[
        "1. Create a free Supabase account at supabase.com",
        "2. Create a new project and copy your connection string",
        "3. Paste it into server/.env as DATABASE_URL and DIRECT_URL",
        "4. Run: cd server && npm install && npm run db:push && npm run db:seed",
        "5. In a new terminal: npm run api",
      ].map(step => (
        <div key={step} style={{ fontFamily:"Nunito", fontSize:13, color:C.text, marginBottom:6 }}>{step}</div>
      ))}
    </div>
  </div>
);

function StudentForm({ form, setForm, classes, onSave, onCancel, saving, isEdit }) {
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const Field = ({ label, name, type="text", options, span }) => (
    <div style={{ gridColumn: span ? "1 / -1" : "auto" }}>
      <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:5 }}>{label}</label>
      {options ? (
        <select value={form[name]} onChange={e=>set(name, e.target.value)} style={{ ...baseInput, cursor:"pointer" }}>
          <option value="">— Select —</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} value={form[name]} onChange={e=>set(name, e.target.value)} style={baseInput} />
      )}
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Student */}
      <div>
        <div style={{ fontFamily:"Fredoka One", fontSize:15, color:P.navy, marginBottom:12 }}>Student Information</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Field label="First Name *" name="firstName" />
          <Field label="Last Name *"  name="lastName" />
          <Field label="Date of Birth" name="dateOfBirth" type="date" />
          <Field label="Gender" name="gender" options={[{value:"MALE",label:"Male"},{value:"FEMALE",label:"Female"}]} />
          <Field label="Program" name="programType" options={Object.entries(PROGRAM_CONFIG).map(([v,c])=>({value:v,label:`${c.icon} ${c.label}`}))} />
          <Field label="Class / Group" name="classId" options={(classes||[]).map(c=>({value:c.id,label:`${c.name}${c.ageGroup?` (${c.ageGroup})`:""}`}))} />
          <Field label="Status" name="status" options={Object.entries(STATUS_CONFIG).map(([v,c])=>({value:v,label:c.label}))} />
          <Field label="Admission No." name="admissionNo" />
          <Field label="Emergency Contact" name="emergencyContact" span />
          <Field label="Medical / Allergy Notes" name="medicalNotes" span />
          <Field label="Internal Notes" name="notes" span />
        </div>
      </div>

      {/* Parent (only for new students) */}
      {!isEdit && (
        <div>
          <div style={{ fontFamily:"Fredoka One", fontSize:15, color:P.navy, marginBottom:12 }}>Primary Parent / Guardian</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Parent First Name" name="parentFirstName" />
            <Field label="Parent Last Name"  name="parentLastName" />
            <Field label="Phone" name="parentPhone" />
            <Field label="WhatsApp" name="parentWhatsapp" />
            <Field label="Email" name="parentEmail" type="email" />
            <Field label="Relation" name="parentRelation" options={[{value:"mother",label:"Mother"},{value:"father",label:"Father"},{value:"guardian",label:"Guardian"}]} />
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:10, paddingTop:4 }}>
        <button onClick={onSave} disabled={saving} style={{ flex:1, background:saving?C.muted:`linear-gradient(135deg,${P.navy},#2d51b8)`, color:C.white, border:"none", cursor:saving?"default":"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"13px", borderRadius:100 }}>
          {saving ? "Saving…" : (isEdit ? "Update Student" : "Add Student")}
        </button>
        <button onClick={onCancel} style={{ flex:1, background:C.warmGray, color:C.muted, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"13px", borderRadius:100 }}>Cancel</button>
      </div>
    </div>
  );
}

export default function DashStudents() {
  const qc = useQueryClient();
  const [apiOnline, setApiOnline] = useState(null);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("");
  const [programFilter, setProgram] = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [editStudent, setEdit]    = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [confirmDel, setConfirmDel] = useState(null);
  const [toast, setToast]         = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // Check API health once on mount
  useEffect(() => {
    checkApiHealth().then(h => setApiOnline(h?.ok === true));
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["students", search, statusFilter, programFilter],
    queryFn: () => fetchStudents({ q: search || undefined, status: statusFilter || undefined, programType: programFilter || undefined }),
    enabled: apiOnline === true,
    retry: false,
  });

  const { data: classData } = useQuery({
    queryKey: ["classes"],
    queryFn: fetchClasses,
    enabled: apiOnline === true,
  });

  const createMut = useMutation({
    mutationFn: createStudent,
    onSuccess: () => { qc.invalidateQueries(["students"]); setShowForm(false); setForm(EMPTY_FORM); showToast("Student added."); },
    onError: (e) => showToast(e.response?.data?.error || "Failed to add student."),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateStudent(id, data),
    onSuccess: () => { qc.invalidateQueries(["students"]); setEdit(null); setForm(EMPTY_FORM); showToast("Student updated."); },
    onError: (e) => showToast(e.response?.data?.error || "Failed to update student."),
  });

  const deleteMut = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => { qc.invalidateQueries(["students"]); setConfirmDel(null); showToast("Student removed."); },
  });

  const openAdd = () => { setForm(EMPTY_FORM); setEdit(null); setShowForm(true); };
  const openEdit = (s) => {
    setForm({
      firstName: s.firstName, lastName: s.lastName,
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0,10) : "",
      gender: s.gender || "", programType: s.programType || "", classId: s.classId || "",
      status: s.status, admissionNo: s.admissionNo || "",
      allergies: s.allergies || [], medicalNotes: s.medicalNotes || "",
      emergencyContact: s.emergencyContact || "", notes: s.notes || "",
      parentFirstName:"", parentLastName:"", parentPhone:"", parentWhatsapp:"", parentEmail:"", parentRelation:"mother",
    });
    setEdit(s);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) { showToast("First and last name are required."); return; }
    const payload = {
      firstName: form.firstName.trim(), lastName: form.lastName.trim(),
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender || null, programType: form.programType || null,
      classId: form.classId || null, status: form.status,
      admissionNo: form.admissionNo || null,
      medicalNotes: form.medicalNotes || null,
      emergencyContact: form.emergencyContact || null, notes: form.notes || null,
    };
    if (editStudent) {
      updateMut.mutate({ id: editStudent.id, data: payload });
    } else {
      const parentData = form.parentFirstName ? {
        firstName: form.parentFirstName, lastName: form.parentLastName,
        phone: form.parentPhone, whatsapp: form.parentWhatsapp,
        email: form.parentEmail, relation: form.parentRelation,
      } : null;
      createMut.mutate({ ...payload, parentData });
    }
  };

  const students = data?.students || [];
  const total    = data?.total || 0;
  const classes  = classData || [];
  const isSaving = createMut.isPending || updateMut.isPending;

  if (apiOnline === null) {
    return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:300 }}>
      <div style={{ fontFamily:"Nunito", color:C.muted, fontSize:14 }}>Checking connection…</div>
    </div>;
  }

  if (apiOnline === false) return <OfflineState />;

  return (
    <div>
      {toast && (
        <div style={{ position:"fixed", top:20, right:24, background:C.navy, color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:13, padding:"12px 22px", borderRadius:100, zIndex:9999, boxShadow:"0 8px 24px rgba(0,0,0,0.2)" }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:24, color:"#1a1a2e", margin:"0 0 4px" }}>Students</h2>
          <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, margin:0 }}>{total} students enrolled</p>
        </div>
        <button onClick={openAdd} style={{ background:`linear-gradient(135deg,${P.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"10px 22px", borderRadius:100, boxShadow:`0 4px 14px ${P.navy}35` }}>+ Add Student</button>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, ID…" style={{ ...baseInput, flex:1, minWidth:180 }} />
        <select value={statusFilter} onChange={e=>setStatus(e.target.value)} style={{ ...baseInput, width:"auto", cursor:"pointer" }}>
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([v,c])=><option key={v} value={v}>{c.label}</option>)}
        </select>
        <select value={programFilter} onChange={e=>setProgram(e.target.value)} style={{ ...baseInput, width:"auto", cursor:"pointer" }}>
          <option value="">All Programs</option>
          {Object.entries(PROGRAM_CONFIG).map(([v,c])=><option key={v} value={v}>{c.icon} {c.label}</option>)}
        </select>
      </div>

      {/* Student list */}
      {isLoading ? (
        <div style={{ fontFamily:"Nunito", color:C.muted, fontSize:14, textAlign:"center", padding:40 }}>Loading students…</div>
      ) : isError ? (
        <div style={{ fontFamily:"Nunito", color:C.coral, fontSize:14, textAlign:"center", padding:40 }}>Failed to load students. Is the API running?</div>
      ) : students.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px" }}>
          <div style={{ fontSize:52, marginBottom:16 }}>🎒</div>
          <div style={{ fontFamily:"Fredoka One", fontSize:22, color:"#1a1a2e", marginBottom:8 }}>No students yet</div>
          <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted }}>Click "Add Student" to enrol the first child.</p>
        </div>
      ) : (
        <div style={{ background:C.white, borderRadius:18, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", overflow:"hidden" }}>
          {students.map((s, idx) => {
            const primaryParent = s.parents?.find(sp => sp.isPrimary)?.parent || s.parents?.[0]?.parent;
            const cls = classes.find(c => c.id === s.classId);
            const prog = PROGRAM_CONFIG[s.programType];
            return (
              <div key={s.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 22px", borderBottom:idx<students.length-1?`1px solid ${C.navy}08`:"none", flexWrap:"wrap" }}>
                {/* Avatar */}
                <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${P.coral}25,${P.yellow}25)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                  {s.gender === "MALE" ? "👦" : s.gender === "FEMALE" ? "👧" : "🧒"}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:14, color:"#1a1a2e", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    {s.firstName} {s.lastName}
                    {s.admissionNo && <span style={{ fontFamily:"Nunito", fontSize:10, color:C.muted, background:C.warmGray, padding:"2px 8px", borderRadius:100 }}>#{s.admissionNo}</span>}
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:5, flexWrap:"wrap", alignItems:"center" }}>
                    <StatusBadge status={s.status} />
                    {prog && <span style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>{prog.icon} {prog.label}</span>}
                    {cls && <span style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>· {cls.name}</span>}
                    {primaryParent && <span style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>· {primaryParent.firstName} {primaryParent.lastName} {primaryParent.phone && `(${primaryParent.phone})`}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <button onClick={()=>openEdit(s)} style={{ background:`${P.navy}10`, color:P.navy, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"7px 14px", borderRadius:8 }}>Edit</button>
                  <button onClick={()=>setConfirmDel(s)} style={{ background:`${C.coral}12`, color:C.coral, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"7px 14px", borderRadius:8 }}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <>
          <div onClick={()=>{setShowForm(false);setEdit(null);}} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:400 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:C.white, borderRadius:22, padding:"32px 28px", width:"min(620px,95vw)", zIndex:401, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.25)" }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:22, color:"#1a1a2e", marginBottom:20 }}>{editStudent ? "Edit Student" : "Add New Student"}</div>
            <StudentForm form={form} setForm={setForm} classes={classes} onSave={handleSave} onCancel={()=>{setShowForm(false);setEdit(null);}} saving={isSaving} isEdit={!!editStudent} />
          </div>
        </>
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <>
          <div onClick={()=>setConfirmDel(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:500 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:C.white, borderRadius:20, padding:"32px 28px", width:"min(340px,90vw)", zIndex:501, textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:20, color:"#1a1a2e", marginBottom:8 }}>Remove {confirmDel.firstName}?</div>
            <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.muted, marginBottom:24 }}>This will permanently delete the student and all related records.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>deleteMut.mutate(confirmDel.id)} style={{ flex:1, background:C.coral, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"12px", borderRadius:100 }}>Delete</button>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1, background:C.warmGray, color:C.text, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"12px", borderRadius:100 }}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
