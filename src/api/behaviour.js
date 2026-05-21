import client from "./client";

export const fetchBehaviour = (studentId, params = {}) =>
  client.get("/behaviour", { params: { studentId, ...params } }).then(r => r.data);

export const fetchBehaviourStats = (studentId, params = {}) =>
  client.get("/behaviour/stats", { params: { studentId, ...params } }).then(r => r.data);

export const createBehaviour = (data) =>
  client.post("/behaviour", data).then(r => r.data);

export const updateBehaviour = (id, data) =>
  client.put(`/behaviour/${id}`, data).then(r => r.data);

export const deleteBehaviour = (id) =>
  client.delete(`/behaviour/${id}`).then(r => r.data);
