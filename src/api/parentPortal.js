import axios from "axios";

const BASE = "http://localhost:4002/api/v1";

const pClient = axios.create({ baseURL: BASE, timeout: 8000 });

pClient.interceptors.request.use(cfg => {
  const token = sessionStorage.getItem("mmn_parent_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const parentLogin = (email, password) =>
  pClient.post("/parents/login", { email, password }).then(r => r.data);

export const fetchParentMe = () =>
  pClient.get("/parents/me").then(r => r.data);

export const fetchParentAttendance = (params = {}) =>
  pClient.get("/parents/me/attendance", { params }).then(r => r.data);

export const fetchParentProgress = (params = {}) =>
  pClient.get("/parents/me/progress", { params }).then(r => r.data);

export const fetchParentNutrition = (params = {}) =>
  pClient.get("/parents/me/nutrition", { params }).then(r => r.data);

export const fetchParentBehaviour = (params = {}) =>
  pClient.get("/parents/me/behaviour", { params }).then(r => r.data);

export const fetchParentMessages = () =>
  pClient.get("/parents/me/messages").then(r => r.data);

// Admin: manage parents
export const fetchAllParents = () =>
  axios.get(`${BASE}/parents`, {
    headers: { Authorization: `Bearer ${sessionStorage.getItem("mmn_admin_token")}` }
  }).then(r => r.data);

export const setParentPortal = (id, enabled, password) =>
  axios.put(`${BASE}/parents/${id}/portal`, { enabled, password }, {
    headers: { Authorization: `Bearer ${sessionStorage.getItem("mmn_admin_token")}` }
  }).then(r => r.data);

export const sendParentMessage = (id, data) =>
  axios.post(`${BASE}/parents/${id}/message`, data, {
    headers: { Authorization: `Bearer ${sessionStorage.getItem("mmn_admin_token")}` }
  }).then(r => r.data);
