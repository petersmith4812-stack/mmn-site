import client from "./client";

export const fetchProgress = (studentId, params = {}) =>
  client.get("/progress", { params: { studentId, ...params } }).then(r => r.data);

export const createProgress = (data) =>
  client.post("/progress", data).then(r => r.data);

export const updateProgress = (id, data) =>
  client.put(`/progress/${id}`, data).then(r => r.data);

export const deleteProgress = (id) =>
  client.delete(`/progress/${id}`).then(r => r.data);
