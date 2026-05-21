import client from "./client";

export const fetchStudents = (params = {}) =>
  client.get("/students", { params }).then(r => r.data);

export const fetchStudent = (id) =>
  client.get(`/students/${id}`).then(r => r.data);

export const createStudent = (data) =>
  client.post("/students", data).then(r => r.data);

export const updateStudent = (id, data) =>
  client.put(`/students/${id}`, data).then(r => r.data);

export const deleteStudent = (id) =>
  client.delete(`/students/${id}`).then(r => r.data);
