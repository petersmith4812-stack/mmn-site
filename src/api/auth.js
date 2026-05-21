import client, { API_BASE } from "./client";
import axios from "axios";

export const apiLogin = async (email, password) => {
  const { data } = await client.post("/auth/login", { email, password });
  sessionStorage.setItem("mmn_access_token", data.accessToken);
  sessionStorage.setItem("mmn_refresh_token", data.refreshToken);
  sessionStorage.setItem("mmn_admin_session", JSON.stringify(data.user));
  return data.user;
};

export const apiLogout = async () => {
  const rt = sessionStorage.getItem("mmn_refresh_token");
  await client.post("/auth/logout", { refreshToken: rt }).catch(() => {});
  sessionStorage.clear();
};

export const apiMe = () => client.get("/auth/me").then(r => r.data);

export const apiChangePassword = (currentPassword, newPassword) =>
  client.put("/auth/change-password", { currentPassword, newPassword }).then(r => r.data);

export const checkApiHealth = () =>
  axios.get(`${API_BASE}/health`, { timeout: 3000 }).then(r => r.data).catch(() => null);
