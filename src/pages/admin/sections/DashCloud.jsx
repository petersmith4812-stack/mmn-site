import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { C } from "../../../constants/theme";
import { checkApiHealth } from "../../../api/auth";
import { migrateLeads, migrateUsers, fetchStats } from "../../../api/leads";
import client, { API_BASE } from "../../../api/client";
import axios from "axios";

const P = C;
const PROJECT_REF = "zewokrqugycflirqoubd";
const SQL_EDITOR_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`;

const SCHEMA_SQL = `-- MMN Database Schema — run once in Supabase SQL Editor
-- Project: ${PROJECT_REF}

CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY DEFAULT 'school_' || replace(gen_random_uuid()::text, '-', ''),
  name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, timezone TEXT NOT NULL DEFAULT 'Asia/Karachi',
  country TEXT NOT NULL DEFAULT 'PK', city TEXT, address TEXT, phone TEXT, email TEXT,
  logo_url TEXT, settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT 'u_' || replace(gen_random_uuid()::text, '-', ''),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, email TEXT NOT NULL, password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'EDITOR' CHECK (role IN ('SUPERADMIN','PRINCIPAL','TEACHER','TEACHER_ASSISTANT','CRM_AGENT','PARENT_LIAISON','FINANCE_OFFICER','HR_MANAGER','CONTENT_EDITOR','ANALYTICS_VIEWER','EDITOR','VIEWER')),
  avatar TEXT NOT NULL DEFAULT '👤', active BOOLEAN NOT NULL DEFAULT TRUE, last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, email)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY DEFAULT 'rt_' || replace(gen_random_uuid()::text, '-', ''),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY DEFAULT 'cls_' || replace(gen_random_uuid()::text, '-', ''),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, age_group TEXT, max_size INTEGER NOT NULL DEFAULT 15, color TEXT
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY DEFAULT 'st_' || replace(gen_random_uuid()::text, '-', ''),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL, last_name TEXT NOT NULL, date_of_birth DATE,
  gender TEXT CHECK (gender IN ('MALE','FEMALE')), photo_url TEXT, admission_no TEXT,
  enrolled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('INQUIRY','APPLIED','WAITLISTED','ENROLLED','ACTIVE','GRADUATED','WITHDRAWN','INACTIVE')),
  program_type TEXT CHECK (program_type IN ('PRESCHOOL','AFTERSCHOOL_CLUB','MOTHERS_PROGRAMME')),
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  allergies TEXT[] NOT NULL DEFAULT '{}', medical_notes TEXT, emergency_contact TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parents (
  id TEXT PRIMARY KEY DEFAULT 'par_' || replace(gen_random_uuid()::text, '-', ''),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL, last_name TEXT NOT NULL DEFAULT '',
  email TEXT, phone TEXT, whatsapp TEXT, occupation TEXT, photo_url TEXT,
  portal_enabled BOOLEAN NOT NULL DEFAULT FALSE, portal_password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_parents (
  id TEXT PRIMARY KEY DEFAULT 'sp_' || replace(gen_random_uuid()::text, '-', ''),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id TEXT NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  relation TEXT NOT NULL DEFAULT 'mother', is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(student_id, parent_id)
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT 'l_' || replace(gen_random_uuid()::text, '-', ''),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, email TEXT, phone TEXT, whatsapp TEXT,
  child_name TEXT, child_age TEXT, program_interest TEXT, source TEXT, message TEXT,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','CONTACTED','VISIT_BOOKED','MEETING_DONE','ENROLLED','COLD')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW','MEDIUM','HIGH')),
  tags TEXT[] NOT NULL DEFAULT '{}', assigned_to_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  visit_date TIMESTAMPTZ, follow_up_date TIMESTAMPTZ, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_activities (
  id TEXT PRIMARY KEY DEFAULT 'la_' || replace(gen_random_uuid()::text, '-', ''),
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL, note TEXT, date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_years (
  id TEXT PRIMARY KEY DEFAULT 'ay_' || replace(gen_random_uuid()::text, '-', ''),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS terms (
  id TEXT PRIMARY KEY DEFAULT 'trm_' || replace(gen_random_uuid()::text, '-', ''),
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL, is_current BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY DEFAULT 'en_' || replace(gen_random_uuid()::text, '-', ''),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id),
  program_type TEXT NOT NULL CHECK (program_type IN ('PRESCHOOL','AFTERSCHOOL_CLUB','MOTHERS_PROGRAMME')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','COMPLETED','WITHDRAWN'))
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY DEFAULT 'sf_' || replace(gen_random_uuid()::text, '-', ''),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT, phone TEXT,
  role TEXT NOT NULL, photo_url TEXT, joined_at DATE, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress_records (
  id TEXT PRIMARY KEY DEFAULT 'pr_' || replace(gen_random_uuid()::text, '-', ''),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  domain TEXT NOT NULL, objective TEXT NOT NULL, level TEXT NOT NULL,
  notes TEXT, evidence_url TEXT, observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY DEFAULT 'att_' || replace(gen_random_uuid()::text, '-', ''),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL, status TEXT NOT NULL CHECK (status IN ('PRESENT','ABSENT','LATE','EXCUSED','HALF_DAY')),
  arrival_time TIMESTAMPTZ, departure_time TIMESTAMPTZ, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS behaviour_logs (
  id TEXT PRIMARY KEY DEFAULT 'bl_' || replace(gen_random_uuid()::text, '-', ''),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'NEUTRAL' CHECK (category IN ('POSITIVE','CHALLENGING','NEUTRAL')),
  setting TEXT DEFAULT 'CLASSROOM' CHECK (setting IN ('CLASSROOM','PLAYGROUND','LUNCH','NAP_TIME','TRANSITION','OTHER')),
  antecedent TEXT, behaviour TEXT NOT NULL, consequence TEXT,
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 5), duration INTEGER, notes TEXT,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE behaviour_logs ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'NEUTRAL' CHECK (category IN ('POSITIVE','CHALLENGING','NEUTRAL'));
ALTER TABLE behaviour_logs ADD COLUMN IF NOT EXISTS setting TEXT DEFAULT 'CLASSROOM' CHECK (setting IN ('CLASSROOM','PLAYGROUND','LUNCH','NAP_TIME','TRANSITION','OTHER'));

CREATE TABLE IF NOT EXISTS nutrition_logs (
  id TEXT PRIMARY KEY DEFAULT 'nl_' || replace(gen_random_uuid()::text, '-', ''),
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL, meal TEXT NOT NULL CHECK (meal IN ('BREAKFAST','MORNING_SNACK','LUNCH','AFTERNOON_SNACK')),
  items TEXT[] NOT NULL DEFAULT '{}', portion_eaten TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, date, meal)
);

CREATE TABLE IF NOT EXISTS fee_structures (
  id TEXT PRIMARY KEY DEFAULT 'fs_' || replace(gen_random_uuid()::text, '-', ''),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, program_type TEXT NOT NULL CHECK (program_type IN ('PRESCHOOL','AFTERSCHOOL_CLUB','MOTHERS_PROGRAMME')),
  amount DECIMAL(10,2) NOT NULL, currency TEXT NOT NULL DEFAULT 'PKR', frequency TEXT NOT NULL DEFAULT 'monthly'
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY DEFAULT 'inv_' || replace(gen_random_uuid()::text, '-', ''),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  fee_structure_id TEXT REFERENCES fee_structures(id) ON DELETE SET NULL,
  student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL, amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PKR', month TEXT, notes TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SENT','PAID','OVERDUE','CANCELLED')),
  due_date DATE, paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Upgrade helpers for existing installs:
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS student_id TEXT REFERENCES students(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS month TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
CREATE INDEX IF NOT EXISTS idx_invoices_school_month ON invoices(school_id, month);

CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY DEFAULT 'blg_' || replace(gen_random_uuid()::text, '-', ''),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL, slug TEXT NOT NULL, excerpt TEXT, content TEXT, cover_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}', status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  views INTEGER NOT NULL DEFAULT 0, published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(school_id, slug)
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY DEFAULT 'cm_' || replace(gen_random_uuid()::text, '-', ''),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft',
  subject TEXT, body TEXT, audience TEXT, sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT 'al_' || replace(gen_random_uuid()::text, '-', ''),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, entity TEXT NOT NULL, entity_id TEXT, changes JSONB, ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_school  ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_status  ON students(status);
CREATE INDEX IF NOT EXISTS idx_leads_school     ON leads(school_id);
CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads(status);
CREATE INDEX IF NOT EXISTS idx_users_school     ON users(school_id);
CREATE TABLE IF NOT EXISTS parent_messages (
  id TEXT PRIMARY KEY DEFAULT 'pm_' || replace(gen_random_uuid()::text, '-', ''),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  parent_id TEXT NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
  sender_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL, body TEXT NOT NULL, is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lesson_plans (
  id TEXT PRIMARY KEY DEFAULT 'lp_' || replace(gen_random_uuid()::text, '-', ''),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  academic_year_id TEXT REFERENCES academic_years(id) ON DELETE SET NULL,
  date DATE NOT NULL, subject TEXT NOT NULL, title TEXT NOT NULL,
  objectives TEXT[] NOT NULL DEFAULT '{}', activities TEXT, resources TEXT, assessment TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','READY','DONE')),
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_att_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_lessons_class_date ON lesson_plans(class_id, date);`;

export default function DashCloud() {
  const qc = useQueryClient();
  const [apiOnline, setApiOnline]     = useState(null);
  const [checking, setChecking]       = useState(true);
  const [dbStatus, setDbStatus]       = useState(null);
  const [statusErr, setStatusErr]     = useState(null);
  const [copied, setCopied]           = useState(false);
  const [seeding, setSeeding]         = useState(false);
  const [migrating, setMigrating]     = useState(false);
  const [migrateResult, setResult]    = useState(null);
  const [toast, setToast]             = useState("");
  const pollRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 4000); };

  const checkAll = useCallback(async () => {
    setChecking(true);
    setStatusErr(null);
    const h = await checkApiHealth();
    const online = h?.ok === true;
    setApiOnline(online);
    if (online) {
      try {
        const { data } = await axios.get(`${API_BASE}/setup/status`, { timeout: 6000 });
        setDbStatus(data);
        if (data.error) setStatusErr(data.error);
      } catch (e) {
        setDbStatus(null);
        setStatusErr(e.message || "Could not reach setup/status endpoint");
      }
    } else {
      setDbStatus(null);
      setStatusErr("API server not reachable at localhost:4002 — run: cd server && npm run api");
    }
    setChecking(false);
  }, []);

  // Auto-poll every 5 s until fully set up
  useEffect(() => {
    checkAll();
  }, [checkAll]);

  useEffect(() => {
    const fully = apiOnline && dbStatus?.tablesExist && dbStatus?.seeded;
    if (!fully) {
      pollRef.current = setInterval(checkAll, 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [apiOnline, dbStatus, checkAll]);

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["cloud-stats"],
    queryFn: () => client.get("/school/stats").then(r => r.data),
    enabled: apiOnline === true && dbStatus?.seeded === true,
    retry: false,
  });

  const copySQL = () => {
    navigator.clipboard.writeText(SCHEMA_SQL).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const runSeed = async () => {
    setSeeding(true);
    try {
      const { data } = await client.post("/setup/seed", {}, { timeout: 20000 });
      showToast(data.message || "✅ Database seeded! Login: admin@mmn.com / mmnadmin2024");
      await checkAll();
      refetchStats();
    } catch (e) {
      const msg = e.response?.data?.error || e.message || "Seeding failed";
      showToast("❌ " + msg + (e.response?.status === 401 ? " — try logging out and back in first" : ""));
    } finally { setSeeding(false); }
  };

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      const leads = (() => { try { return JSON.parse(localStorage.getItem("mmn_leads") || "[]"); } catch { return []; } })();
      const users = (() => { try { return JSON.parse(localStorage.getItem("mmn_users") || "[]"); } catch { return []; } })();
      const [lr, ur] = await Promise.all([
        leads.length ? client.post("/migrate/leads", { leads }).then(r => r.data) : Promise.resolve({ created:0, skipped:0 }),
        users.length ? client.post("/migrate/users", { users }).then(r => r.data) : Promise.resolve({ created:0, skipped:0 }),
      ]);
      setResult({ leads: lr, users: ur });
      showToast(`Done! ${lr.created} leads + ${ur.created} users migrated.`);
      refetchStats();
    } catch (e) { showToast(e.response?.data?.error || "Migration failed."); }
    finally { setMigrating(false); }
  };

  const tablesExist  = dbStatus?.tablesExist;
  const seeded       = dbStatus?.seeded;
  const fully        = apiOnline && tablesExist && seeded;
  const localLeads   = (() => { try { return JSON.parse(localStorage.getItem("mmn_leads")||"[]").length; } catch { return 0; }})();
  const localUsers   = (() => { try { return JSON.parse(localStorage.getItem("mmn_users")||"[]").length; } catch { return 0; }})();

  const cardStyle = (color) => ({ background:C.white, borderRadius:16, padding:"18px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", border:`1.5px solid ${color}20` });

  return (
    <div>
      {toast && (
        <div style={{ position:"fixed", top:20, right:24, background:P.navy, color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:13, padding:"12px 22px", borderRadius:100, zIndex:9999, boxShadow:"0 8px 24px rgba(0,0,0,0.2)" }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:24, color:"#1a1a2e", margin:"0 0 4px" }}>Cloud Setup</h2>
          <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, margin:0 }}>Connect Supabase · Create tables · Migrate data</p>
        </div>
        <button onClick={checkAll} disabled={checking} style={{ background:C.warmGray, color:P.navy, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:13, padding:"9px 20px", borderRadius:100 }}>
          {checking ? "Checking…" : "↻ Recheck"}
        </button>
      </div>

      {/* Status bar */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:24 }}>
        {[
          { label:"API Server",   val:apiOnline?"Online":"Offline",     icon:"🔌", color:apiOnline?P.mint:C.coral,  sub:"localhost:4002" },
          { label:"Tables",       val:tablesExist?"Created":"Missing",  icon:"🗄️", color:tablesExist?P.mint:C.coral, sub:"Supabase/PostgreSQL" },
          { label:"Seed Data",    val:seeded?"Done":"Pending",          icon:"🌱", color:seeded?P.mint:"#F5A623",   sub:"school + admin + classes" },
          { label:"Students",     val:stats?.students ?? "—",           icon:"🎒", color:P.navy,   sub:"active in cloud" },
          { label:"Leads",        val:stats?.leads ?? "—",              icon:"👥", color:P.coral,  sub:"in cloud" },
        ].map(({ label, val, icon, color, sub }) => (
          <div key={label} style={cardStyle(color)}>
            <div style={{ fontSize:24, marginBottom:6 }}>{icon}</div>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>{label}</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:18, color }}>{val}</div>
            <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Status error */}
      {statusErr && !fully && (
        <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", gap:10, alignItems:"flex-start" }}>
          <span style={{ fontSize:18, flexShrink:0 }}>⚠️</span>
          <div>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:"#c2410c", marginBottom:2 }}>
              {apiOnline === false ? "API Server Offline" : "Database Not Ready"}
            </div>
            <div style={{ fontFamily:"monospace", fontSize:12, color:"#9a3412" }}>{statusErr}</div>
          </div>
        </div>
      )}

      {/* Main columns */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))", gap:20 }}>

        {/* Step-by-step setup */}
        <div style={{ background:C.white, borderRadius:18, padding:"24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:20 }}>
          <div style={{ fontFamily:"Fredoka One", fontSize:18, color:"#1a1a2e" }}>📋 One-Time Setup</div>

          {/* Step 1: API Server */}
          <SetupStep done={apiOnline} num={1} title="Start the API server"
            desc={<>In a terminal inside <code style={{background:C.warmGray,padding:"1px 5px",borderRadius:4}}>server/</code> folder:</>}
            code="npm run api" />

          {/* Step 2: Copy + paste SQL */}
          <SetupStep done={tablesExist} num={2} title="Create database tables"
            desc="Copy the SQL below, open the Supabase SQL Editor, paste it and click RUN:">
            <div style={{ display:"flex", gap:8, marginBottom:8 }}>
              <button onClick={copySQL} style={{ flex:1, background:copied?P.mint:P.navy, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:12.5, padding:"9px 14px", borderRadius:100, transition:"background 0.2s" }}>
                {copied ? "✓ Copied!" : "📋 Copy Schema SQL"}
              </button>
              <a href={SQL_EDITOR_URL} target="_blank" rel="noreferrer" style={{ flex:1, background:`${P.coral}15`, color:P.coral, border:`1.5px solid ${P.coral}30`, fontFamily:"Nunito", fontWeight:700, fontSize:12.5, padding:"9px 14px", borderRadius:100, textDecoration:"none", textAlign:"center", display:"block" }}>
                Open SQL Editor ↗
              </a>
            </div>
            <div style={{ background:"#0F1D3E", borderRadius:10, padding:"10px 14px", maxHeight:120, overflowY:"auto" }}>
              <pre style={{ fontFamily:"monospace", fontSize:10.5, color:"#A8D8A8", margin:0, whiteSpace:"pre-wrap", lineHeight:1.5 }}>
                {SCHEMA_SQL.slice(0, 400)}…
              </pre>
            </div>
          </SetupStep>

          {/* Step 3: Seed */}
          <SetupStep done={seeded} num={3} title="Seed school data"
            desc="After the SQL runs successfully, click this to create your school, admin user, and default classes:">
            <button onClick={runSeed} disabled={!apiOnline || !tablesExist || seeding}
              style={{ width:"100%", padding:"12px", borderRadius:100, border:"none",
                background:(!apiOnline||!tablesExist||seeding)?C.muted:`linear-gradient(135deg,${P.mint},#2d9478)`,
                color:C.white, cursor:(!apiOnline||!tablesExist||seeding)?"default":"pointer",
                fontFamily:"Nunito", fontWeight:800, fontSize:14 }}>
              {seeding ? "Seeding…" : !apiOnline ? "Start API server first" : !tablesExist ? "Run SQL first (Step 2)" : seeded ? "✓ Already seeded — Re-seed" : "🌱 Complete Setup"}
            </button>
            {seeded && <div style={{ fontFamily:"Nunito", fontSize:12, color:P.mint, marginTop:6, textAlign:"center" }}>✓ Login: admin@mmn.com / mmnadmin2024</div>}
          </SetupStep>

          {fully && (
            <div style={{ background:`${P.mint}15`, border:`1.5px solid ${P.mint}40`, borderRadius:14, padding:"16px 18px", textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:6 }}>🎉</div>
              <div style={{ fontFamily:"Fredoka One", fontSize:18, color:P.mint }}>Cloud is Live!</div>
              <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, marginTop:4 }}>API + Database connected. Students module is active.</div>
            </div>
          )}
        </div>

        {/* Data Migration */}
        <div style={{ background:C.white, borderRadius:18, padding:"24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ fontFamily:"Fredoka One", fontSize:18, color:"#1a1a2e" }}>🔄 Data Migration</div>
          <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.muted, lineHeight:1.65, margin:0 }}>
            Move your existing leads and admin users from browser localStorage into Supabase. Duplicates are skipped safely.
          </p>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { icon:"👥", label:"Leads (local)",   val:localLeads },
              { icon:"👤", label:"Users (local)",   val:localUsers },
              { icon:"☁️", label:"Leads (cloud)",   val:stats?.leads ?? "—" },
              { icon:"🎒", label:"Students (cloud)", val:stats?.students ?? "—" },
            ].map(({ icon, label, val }) => (
              <div key={label} style={{ background:C.warmGray, borderRadius:12, padding:"12px 14px" }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
                <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>{label}</div>
                <div style={{ fontFamily:"Fredoka One", fontSize:20, color:"#1a1a2e" }}>{val}</div>
              </div>
            ))}
          </div>

          {migrateResult && (
            <div style={{ background:`${P.mint}15`, border:`1.5px solid ${P.mint}40`, borderRadius:12, padding:"12px 14px" }}>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:P.mint, marginBottom:4 }}>Migration Complete</div>
              <div style={{ fontFamily:"Nunito", fontSize:12.5, color:C.text }}>
                Leads: {migrateResult.leads.created} added, {migrateResult.leads.skipped} skipped<br/>
                Users: {migrateResult.users.created} added, {migrateResult.users.skipped} skipped
              </div>
            </div>
          )}

          <button onClick={handleMigrate}
            disabled={!fully || migrating || (localLeads === 0 && localUsers === 0)}
            style={{ padding:"14px", borderRadius:100, border:"none",
              background:(!fully||migrating)?C.muted:`linear-gradient(135deg,${P.coral},#d4623d)`,
              color:C.white, cursor:(!fully||migrating)?"default":"pointer",
              fontFamily:"Nunito", fontWeight:800, fontSize:14,
              boxShadow:fully?`0 6px 18px ${P.coral}40`:"none" }}>
            {migrating ? "Migrating…" : !fully ? "Complete setup first (Steps 1–3)" : "Migrate localStorage → Supabase"}
          </button>

          {/* Quick start terminal commands */}
          <div style={{ borderTop:`1px solid ${C.navy}10`, paddingTop:16 }}>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Terminal Quick Start</div>
            <div style={{ background:"#0F1D3E", borderRadius:12, padding:"14px 16px" }}>
              {[
                "# In one terminal (keep running):",
                "cd \"website files/mmn-site/mmn-site\"",
                "npm start",
                "",
                "# In another terminal:",
                "cd \"website files/mmn-site/mmn-site/server\"",
                "npm run api",
              ].map((line, i) => (
                <div key={i} style={{ fontFamily:"monospace", fontSize:12, color: line.startsWith("#") ? "#888" : "#A8D8A8", lineHeight:1.7 }}>{line || " "}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SetupStep({ num, done, title, desc, code, children }) {
  return (
    <div style={{ display:"flex", gap:14 }}>
      <div style={{ width:30, height:30, borderRadius:"50%", background:done?C.mint:`${C.navy}15`, color:done?C.white:C.navy, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Fredoka One", fontSize:13, flexShrink:0, marginTop:2, transition:"all 0.3s" }}>
        {done ? "✓" : num}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:14, color:"#1a1a2e", marginBottom:4 }}>{title}</div>
        {desc && <div style={{ fontFamily:"Nunito", fontSize:12.5, color:C.muted, lineHeight:1.65, marginBottom:8 }}>{desc}</div>}
        {code && <div style={{ background:"#0F1D3E", borderRadius:8, padding:"8px 14px", fontFamily:"monospace", fontSize:12.5, color:"#A8D8A8", marginBottom:8 }}>{code}</div>}
        {children}
      </div>
    </div>
  );
}
