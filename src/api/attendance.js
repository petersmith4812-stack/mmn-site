import client from "./client";

export const fetchAttendance = (params = {}) =>
  client.get("/attendance", { params }).then(r => r.data);

export const fetchAttendanceStats = (studentId, params = {}) =>
  client.get("/attendance/stats", { params: { studentId, ...params } }).then(r => r.data);

export const saveAttendance = (data) =>
  client.post("/attendance", data).then(r => r.data);

export const bulkSaveAttendance = (records) =>
  client.post("/attendance/bulk", { records }).then(r => r.data);

export const deleteAttendance = (id) =>
  client.delete(`/attendance/${id}`).then(r => r.data);
