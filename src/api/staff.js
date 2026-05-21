import client from "./client";

export const fetchStaff   = (params = {}) => client.get("/staff", { params }).then(r => r.data);
export const fetchStaffById = (id)        => client.get(`/staff/${id}`).then(r => r.data);
export const createStaff  = (data)        => client.post("/staff", data).then(r => r.data);
export const updateStaff  = (id, data)    => client.put(`/staff/${id}`, data).then(r => r.data);
export const deleteStaff  = (id)          => client.delete(`/staff/${id}`).then(r => r.data);
