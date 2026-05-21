import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchStaff, createStaff, updateStaff, deleteStaff } from "../../../api/staff";

const ROLES = ["Teacher","Teaching Assistant","Administrator","Nurse","Cook","Cleaner","Security","Driver","Other"];

const ROLE_COLORS = {
  Teacher: "#6366f1", "Teaching Assistant": "#8b5cf6", Administrator: "#0ea5e9",
  Nurse: "#10b981", Cook: "#f59e0b", Cleaner: "#64748b",
  Security: "#ef4444", Driver: "#f97316", Other: "#94a3b8",
};

const badge = (role) => ({
  display: "inline-block", padding: "2px 10px", borderRadius: 12,
  fontSize: 11, fontWeight: 600, background: ROLE_COLORS[role] || "#94a3b8",
  color: "#fff",
});

const EMPTY_FORM = { firstName: "", lastName: "", email: "", phone: "", role: "Teacher", joinedAt: "", active: true };

export default function DashStaff() {
  const qc = useQueryClient();
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("active");
  const [modal, setModal]         = useState(null); // null | "add" | "edit" | "delete" | "view"
  const [selected, setSelected]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formErr, setFormErr]     = useState("");
  const [toast, setToast]         = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const params = {};
  if (activeFilter !== "all") params.active = activeFilter === "active";
  if (roleFilter !== "all")   params.role   = roleFilter;

  const { data, isLoading } = useQuery({
    queryKey: ["staff", params],
    queryFn: () => fetchStaff(params),
  });

  const staff = (data?.data || []).filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.phone || "").toLowerCase().includes(q);
  });

  const createM = useMutation({
    mutationFn: createStaff,
    onSuccess: () => { qc.invalidateQueries(["staff"]); setModal(null); showToast("Staff member added"); },
    onError: (e) => setFormErr(e.response?.data?.error || e.message),
  });

  const updateM = useMutation({
    mutationFn: ({ id, data }) => updateStaff(id, data),
    onSuccess: () => { qc.invalidateQueries(["staff"]); setModal(null); showToast("Staff member updated"); },
    onError: (e) => setFormErr(e.response?.data?.error || e.message),
  });

  const deleteM = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => { qc.invalidateQueries(["staff"]); setModal(null); setSelected(null); showToast("Staff member removed"); },
    onError: (e) => showToast(e.response?.data?.error || e.message, false),
  });

  const openAdd = () => { setForm(EMPTY_FORM); setFormErr(""); setModal("add"); };

  const openEdit = (s) => {
    setSelected(s);
    setForm({
      firstName: s.first_name, lastName: s.last_name || "",
      email: s.email || "", phone: s.phone || "",
      role: s.role, joinedAt: s.joined_at ? s.joined_at.slice(0, 10) : "",
      active: s.active,
    });
    setFormErr("");
    setModal("edit");
  };

  const openView = (s) => { setSelected(s); setModal("view"); };

  const openDelete = (s) => { setSelected(s); setModal("delete"); };

  const handleSubmit = () => {
    if (!form.firstName.trim()) { setFormErr("First name is required"); return; }
    if (!form.role) { setFormErr("Role is required"); return; }
    setFormErr("");
    const payload = {
      firstName: form.firstName.trim(), lastName: form.lastName.trim(),
      email: form.email.trim() || null, phone: form.phone.trim() || null,
      role: form.role, joinedAt: form.joinedAt || null,
      active: form.active,
    };
    if (modal === "add") createM.mutate(payload);
    else updateM.mutate({ id: selected.id, data: payload });
  };

  const totalActive   = (data?.data || []).filter(s => s.active).length;
  const totalInactive = (data?.data || []).filter(s => !s.active).length;
  const roleCounts    = (data?.data || []).reduce((acc, s) => { acc[s.role] = (acc[s.role] || 0) + 1; return acc; }, {});

  return (
    <div style={{ padding: 24 }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          background: toast.ok ? "#10b981" : "#ef4444",
          color: "#fff", padding: "12px 20px", borderRadius: 10,
          fontWeight: 600, fontSize: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" }}>Staff & HR</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Manage teaching and support staff records</p>
        </div>
        <button onClick={openAdd} style={{
          background: "#6366f1", color: "#fff", border: "none", borderRadius: 8,
          padding: "10px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer",
        }}>+ Add Staff Member</button>
      </div>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Active Staff", value: totalActive, color: "#10b981", bg: "#f0fdf4" },
          { label: "Inactive", value: totalInactive, color: "#64748b", bg: "#f8fafc" },
          { label: "Total Roles", value: Object.keys(roleCounts).length, color: "#6366f1", bg: "#f5f3ff" },
        ].map(c => (
          <div key={c.label} style={{
            background: c.bg, borderRadius: 10, padding: "14px 20px",
            minWidth: 120, textAlign: "center",
          }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
        {/* Role breakdown chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", flex: 1 }}>
          {Object.entries(roleCounts).sort((a, b) => b[1] - a[1]).map(([role, count]) => (
            <span key={role} style={{ ...badge(role), fontSize: 12 }}>{role}: {count}</span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input
          placeholder="Search by name, email or phone..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0",
            fontSize: 14, width: 260, outline: "none",
          }}
        />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{
          padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14,
        }}>
          <option value="all">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, overflow: "hidden" }}>
          {[["active","Active"],["inactive","Inactive"],["all","All"]].map(([v, l]) => (
            <button key={v} onClick={() => setActiveFilter(v)} style={{
              padding: "8px 14px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: activeFilter === v ? "#6366f1" : "transparent",
              color: activeFilter === v ? "#fff" : "#64748b",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Name","Role","Email","Phone","Joined","Status","Actions"].map(h => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading...</td></tr>
            ) : staff.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No staff members found</td></tr>
            ) : staff.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: ROLE_COLORS[s.role] || "#94a3b8",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: 14,
                    }}>{(s.first_name?.[0] || "?").toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>
                        {s.first_name} {s.last_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 14px" }}><span style={badge(s.role)}>{s.role}</span></td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#475569" }}>{s.email || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#475569" }}>{s.phone || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "#475569" }}>
                  {s.joined_at ? new Date(s.joined_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : <span style={{ color: "#cbd5e1" }}>—</span>}
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{
                    display: "inline-block", padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                    background: s.active ? "#dcfce7" : "#f1f5f9",
                    color: s.active ? "#16a34a" : "#64748b",
                  }}>{s.active ? "Active" : "Inactive"}</span>
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openView(s)} style={{
                      padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
                      background: "#fff", cursor: "pointer", fontSize: 12, color: "#475569",
                    }}>View</button>
                    <button onClick={() => openEdit(s)} style={{
                      padding: "5px 10px", borderRadius: 6, border: "1px solid #6366f1",
                      background: "#fff", cursor: "pointer", fontSize: 12, color: "#6366f1", fontWeight: 600,
                    }}>Edit</button>
                    <button onClick={() => openDelete(s)} style={{
                      padding: "5px 10px", borderRadius: 6, border: "1px solid #fecaca",
                      background: "#fff", cursor: "pointer", fontSize: 12, color: "#ef4444",
                    }}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length > 0 && (
          <div style={{ padding: "10px 14px", fontSize: 12, color: "#94a3b8", borderTop: "1px solid #f1f5f9" }}>
            Showing {staff.length} staff member{staff.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* View Modal */}
      {modal === "view" && selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%",
                background: ROLE_COLORS[selected.role] || "#94a3b8",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 24,
              }}>{(selected.first_name?.[0] || "?").toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "#1e293b" }}>{selected.first_name} {selected.last_name}</div>
                <span style={badge(selected.role)}>{selected.role}</span>
              </div>
            </div>
            {[
              ["Email", selected.email], ["Phone", selected.phone],
              ["Joined", selected.joined_at ? new Date(selected.joined_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : null],
              ["Status", selected.active ? "Active" : "Inactive"],
              ["Added", new Date(selected.created_at).toLocaleDateString("en-GB")],
            ].map(([label, value]) => value && (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14 }}>
                <span style={{ color: "#64748b", fontWeight: 500 }}>{label}</span>
                <span style={{ color: "#1e293b", fontWeight: 600 }}>{value}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => openEdit(selected)} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "none",
                background: "#6366f1", color: "#fff", fontWeight: 600, cursor: "pointer",
              }}>Edit</button>
              <button onClick={() => setModal(null)} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0",
                background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer",
              }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: "#1e293b" }}>
              {modal === "add" ? "Add Staff Member" : "Edit Staff Member"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { key: "firstName", label: "First Name *", type: "text", placeholder: "e.g. Fatima", full: false },
                { key: "lastName",  label: "Last Name",    type: "text", placeholder: "e.g. Khan",   full: false },
                { key: "email", label: "Email", type: "email", placeholder: "fatima@school.com", full: false },
                { key: "phone", label: "Phone", type: "text", placeholder: "+92 300 1234567",    full: false },
                { key: "joinedAt", label: "Date Joined", type: "date", full: false },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.full ? "1 / -1" : undefined }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{f.label}</label>
                  <input
                    type={f.type} placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Role *</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{
                  width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14,
                }}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {modal === "edit" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Status</label>
                  <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, overflow: "hidden" }}>
                    {[["Active", true], ["Inactive", false]].map(([l, v]) => (
                      <button key={l} onClick={() => setForm(p => ({ ...p, active: v }))} style={{
                        padding: "7px 16px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                        background: form.active === v ? (v ? "#10b981" : "#ef4444") : "transparent",
                        color: form.active === v ? "#fff" : "#64748b",
                      }}>{l}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {formErr && <div style={{ marginTop: 12, color: "#ef4444", fontSize: 13 }}>{formErr}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={handleSubmit} disabled={createM.isPending || updateM.isPending} style={{
                flex: 1, padding: "11px", borderRadius: 8, border: "none",
                background: "#6366f1", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14,
              }}>{createM.isPending || updateM.isPending ? "Saving..." : modal === "add" ? "Add Staff Member" : "Save Changes"}</button>
              <button onClick={() => setModal(null)} style={{
                flex: 1, padding: "11px", borderRadius: 8, border: "1px solid #e2e8f0",
                background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer", fontSize: 14,
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {modal === "delete" && selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#1e293b" }}>Remove Staff Member?</h3>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>
              This will permanently delete <strong>{selected.first_name} {selected.last_name}</strong>'s record. This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => deleteM.mutate(selected.id)} disabled={deleteM.isPending} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "none",
                background: "#ef4444", color: "#fff", fontWeight: 600, cursor: "pointer",
              }}>{deleteM.isPending ? "Removing..." : "Yes, Remove"}</button>
              <button onClick={() => setModal(null)} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0",
                background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer",
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
