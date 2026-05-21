import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchOverview, fetchEnrollmentTrend, fetchAttendanceTrend,
  fetchFinanceTrend, fetchBehaviourAnalytics, fetchStudentBreakdown,
} from "../../../api/analytics";

// ── Mini bar chart (pure CSS/SVG) ──────────────────────────────────────────────
function BarChart({ data, valueKey, labelKey, color = "#6366f1", height = 120, formatValue }) {
  if (!data || data.length === 0) return <div style={{ color: "#94a3b8", fontSize: 13, padding: 16 }}>No data</div>;
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height, padding: "0 4px" }}>
      {data.map((d, i) => {
        const val = d[valueKey] || 0;
        const pct = (val / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
            <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 2 }}>{formatValue ? formatValue(val) : val}</div>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
              <div style={{
                width: "100%", height: `${Math.max(pct, 2)}%`,
                background: color, borderRadius: "3px 3px 0 0",
                transition: "height 0.4s ease", minHeight: 2,
              }} title={`${d[labelKey]}: ${formatValue ? formatValue(val) : val}`}/>
            </div>
            <div style={{ fontSize: 8, color: "#94a3b8", textAlign: "center", maxWidth: 28, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {String(d[labelKey] || "").slice(-5)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Dual bar chart (2 values per group) ───────────────────────────────────────
function DualBarChart({ data, key1, key2, label1, label2, color1 = "#6366f1", color2 = "#10b981", height = 120, formatValue }) {
  if (!data || data.length === 0) return <div style={{ color: "#94a3b8", fontSize: 13, padding: 16 }}>No data</div>;
  const max = Math.max(...data.flatMap(d => [d[key1] || 0, d[key2] || 0]), 1);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, padding: "0 4px" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", gap: 2, alignItems: "flex-end", height: "100%" }}>
            {[{ k: key1, c: color1 }, { k: key2, c: color2 }].map(({ k, c }) => {
              const val = d[k] || 0;
              const pct = (val / max) * 100;
              return (
                <div key={k} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                    <div style={{ width: "100%", height: `${Math.max(pct, 2)}%`, background: c, borderRadius: "2px 2px 0 0", minHeight: 2 }}
                      title={`${k}: ${formatValue ? formatValue(val) : val}`}/>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, padding: "4px 4px 0" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 8, color: "#94a3b8" }}>
            {String(d.month || d.week || "").slice(-5)}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8, padding: "0 4px" }}>
        {[{ l: label1, c: color1 }, { l: label2, c: color2 }].map(({ l, c }) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: c }}/>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Donut / pie-ish (simple percentage rings using SVG) ────────────────────────
function DonutSegments({ data, colors }) {
  if (!data || Object.keys(data).length === 0) return <div style={{ color: "#94a3b8", fontSize: 13 }}>No data</div>;
  const total = Object.values(data).reduce((s, v) => s + v, 0) || 1;
  const entries = Object.entries(data);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {entries.map(([key, val], i) => {
        const pct = Math.round((val / total) * 100);
        const color = colors[i % colors.length];
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 120 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", position: "relative", flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" style={{ width: 40, height: 40, transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="4"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="4"
                  strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round"/>
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color }}>{pct}%</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{key}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{val} students</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const PKR = (n) => `PKR ${Number(n || 0).toLocaleString("en-PK")}`;

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#0ea5e9", "#f97316", "#64748b"];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashAnalytics() {
  const [enrollPeriod,    setEnrollPeriod]    = useState(6);
  const [attendancePeriod, setAttendancePeriod] = useState(8);
  const [financePeriod,   setFinancePeriod]   = useState(6);
  const [behaviourPeriod, setBehaviourPeriod] = useState(30);

  const { data: overviewData, isLoading: ovLoading } = useQuery({ queryKey: ["analytics-overview"], queryFn: fetchOverview });
  const { data: enrollData }   = useQuery({ queryKey: ["analytics-enroll", enrollPeriod],    queryFn: () => fetchEnrollmentTrend(enrollPeriod) });
  const { data: attData }      = useQuery({ queryKey: ["analytics-att", attendancePeriod],   queryFn: () => fetchAttendanceTrend(attendancePeriod) });
  const { data: finData }      = useQuery({ queryKey: ["analytics-fin", financePeriod],      queryFn: () => fetchFinanceTrend(financePeriod) });
  const { data: behData }      = useQuery({ queryKey: ["analytics-beh", behaviourPeriod],    queryFn: () => fetchBehaviourAnalytics(behaviourPeriod) });
  const { data: breakdownData } = useQuery({ queryKey: ["analytics-breakdown"],              queryFn: fetchStudentBreakdown });

  const ov = overviewData?.data || {};

  const CARDS = [
    { label: "Active Students", value: ov.activeStudents ?? "—", sub: `${ov.totalStudents ?? 0} total enrolled`, color: "#6366f1", bg: "#f5f3ff", icon: "🎒" },
    { label: "Active Staff", value: ov.activeStaff ?? "—", sub: "Teaching & support", color: "#10b981", bg: "#f0fdf4", icon: "👩‍🏫" },
    { label: "Monthly Revenue", value: ov.monthlyRevenue != null ? PKR(ov.monthlyRevenue) : "—", sub: `of ${PKR(ov.monthlyInvoiced)} invoiced`, color: "#f59e0b", bg: "#fffbeb", icon: "💰" },
    { label: "Attendance Rate", value: ov.attendanceRate != null ? `${ov.attendanceRate}%` : "—", sub: "Last 30 days", color: ov.attendanceRate >= 80 ? "#10b981" : "#ef4444", bg: "#f0fdf4", icon: "📅" },
    { label: "New This Month", value: ov.newEnrollments ?? "—", sub: "New enrollments", color: "#0ea5e9", bg: "#f0f9ff", icon: "✨" },
  ];

  const card = (title, children, extra = {}) => (
    <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", ...extra }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
      {children}
    </div>
  );

  const periodBtn = (val, current, setter) => (
    <button onClick={() => setter(val)} style={{
      padding: "3px 10px", borderRadius: 6, border: "1px solid " + (current === val ? "#6366f1" : "#e2e8f0"),
      background: current === val ? "#6366f1" : "#fff", color: current === val ? "#fff" : "#64748b",
      fontSize: 11, fontWeight: 600, cursor: "pointer",
    }}>{val}{typeof val === "number" && (val <= 12 ? "mo" : "wks" )}</button>
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" }}>Analytics</h2>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Live school performance overview</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {ovLoading ? (
          <div style={{ color: "#94a3b8", padding: 20 }}>Loading overview...</div>
        ) : CARDS.map(c => (
          <div key={c.label} style={{
            background: c.bg, borderRadius: 12, padding: "16px 20px",
            minWidth: 160, flex: "1 1 160px", borderLeft: `4px solid ${c.color}`,
          }}>
            <div style={{ fontSize: 26 }}>{c.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: c.color, lineHeight: 1, marginTop: 6 }}>{c.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", marginTop: 4 }}>{c.label}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 16 }}>

        {/* Enrollment trend */}
        {card(
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Enrollment Trend</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[3,6,12].map(v => periodBtn(v, enrollPeriod, setEnrollPeriod))}
            </div>
          </div>,
          <BarChart data={enrollData?.data} valueKey="enrolled" labelKey="month" color="#6366f1" height={130}/>
        )}

        {/* Attendance rate */}
        {card(
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Weekly Attendance Rate</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[4,8,12].map(v => periodBtn(v, attendancePeriod, setAttendancePeriod))}
            </div>
          </div>,
          <BarChart
            data={attData?.data}
            valueKey="rate" labelKey="week"
            color="#10b981" height={130}
            formatValue={v => v != null ? `${v}%` : "—"}
          />
        )}

        {/* Finance trend */}
        {card(
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Monthly Finance</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[3,6,12].map(v => periodBtn(v, financePeriod, setFinancePeriod))}
            </div>
          </div>,
          <DualBarChart
            data={finData?.data}
            key1="invoiced" key2="collected"
            label1="Invoiced" label2="Collected"
            color1="#6366f1" color2="#10b981"
            height={130}
            formatValue={v => `${Math.round(v / 1000)}k`}
          />
        )}

        {/* Behaviour breakdown */}
        {card(
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Behaviour by Category</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[7,30,90].map(v => periodBtn(v, behaviourPeriod, setBehaviourPeriod))}
            </div>
          </div>,
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              {behData?.data?.byCategory && Object.entries(behData.data.byCategory).map(([cat, count], i) => {
                const catColors = { POSITIVE: "#10b981", CHALLENGING: "#ef4444", NEUTRAL: "#64748b" };
                return (
                  <div key={cat} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: catColors[cat] || CHART_COLORS[i] }}>{count}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{cat.charAt(0) + cat.slice(1).toLowerCase()}</div>
                  </div>
                );
              })}
            </div>
            {behData?.data?.bySetting && (
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>BY SETTING</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.entries(behData.data.bySetting).map(([setting, count]) => (
                    <span key={setting} style={{
                      padding: "2px 8px", borderRadius: 10, background: "#f1f5f9",
                      fontSize: 11, color: "#475569", fontWeight: 600,
                    }}>{setting.replace(/_/g, " ")}: {count}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Student breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>

        {card("Students by Program",
          <DonutSegments data={breakdownData?.data?.byProgram} colors={CHART_COLORS}/>
        )}

        {card("Students by Status",
          <DonutSegments
            data={breakdownData?.data?.byStatus}
            colors={["#10b981","#6366f1","#f59e0b","#ef4444","#64748b"]}
          />
        )}

        {card("Students by Age Group",
          <div>
            {breakdownData?.data?.byAge && Object.entries(breakdownData.data.byAge).sort().map(([age, count], i) => {
              const total = Object.values(breakdownData.data.byAge).reduce((s, v) => s + v, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={age} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12, color: "#475569" }}>
                    <span style={{ fontWeight: 600 }}>Age {age}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div style={{ background: "#f1f5f9", borderRadius: 4, height: 8, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: CHART_COLORS[i % CHART_COLORS.length], borderRadius: 4, transition: "width 0.4s" }}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
