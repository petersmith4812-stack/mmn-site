import client, { API_BASE } from "./client";

export const submitPublicLead = async (data) => {
  const res = await fetch(`${API_BASE}/leads/public`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Submission failed");
  }
  return res.json();
};

export const fetchLeads = (params = {}) =>
  client.get("/leads", { params }).then(r => r.data);

export const createLead = (data) =>
  client.post("/leads", data).then(r => r.data);

export const updateLead = (id, data) =>
  client.put(`/leads/${id}`, data).then(r => r.data);

export const deleteLead = (id) =>
  client.delete(`/leads/${id}`).then(r => r.data);

export const addLeadActivity = (id, data) =>
  client.post(`/leads/${id}/activity`, data).then(r => r.data);

export const migrateLeads = (leads) =>
  client.post("/migrate/leads", { leads }).then(r => r.data);

export const migrateUsers = (users) =>
  client.post("/migrate/users", { users }).then(r => r.data);

export const fetchStats = () =>
  client.get("/school/stats").then(r => r.data);

export const fetchClasses = () =>
  client.get("/school/classes").then(r => r.data);
