import axios from "axios";

export const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4002/api/v1";

const client = axios.create({ baseURL: API_BASE, timeout: 8000 });

// Attach access token to every request
client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("mmn_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let queue = [];

const processQueue = (err, token) =>
  queue.splice(0).forEach(p => (err ? p.reject(err) : p.resolve(token)));

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then(token => { orig.headers.Authorization = `Bearer ${token}`; return client(orig); });
      }
      orig._retry = true;
      isRefreshing = true;
      const rt = sessionStorage.getItem("mmn_refresh_token");
      if (!rt) {
        sessionStorage.clear();
        window.location.href = "/admin";
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken: rt });
        sessionStorage.setItem("mmn_access_token", data.accessToken);
        sessionStorage.setItem("mmn_refresh_token", data.refreshToken);
        processQueue(null, data.accessToken);
        orig.headers.Authorization = `Bearer ${data.accessToken}`;
        return client(orig);
      } catch (err) {
        processQueue(err, null);
        sessionStorage.clear();
        window.location.href = "/admin";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default client;
