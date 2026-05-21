import client from "./client";

export const fetchLessons = (params = {}) =>
  client.get("/lessons", { params }).then(r => r.data);

export const fetchLesson = (id) =>
  client.get(`/lessons/${id}`).then(r => r.data);

export const createLesson = (data) =>
  client.post("/lessons", data).then(r => r.data);

export const updateLesson = (id, data) =>
  client.put(`/lessons/${id}`, data).then(r => r.data);

export const deleteLesson = (id) =>
  client.delete(`/lessons/${id}`).then(r => r.data);
