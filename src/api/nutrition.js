import client from "./client";

export const fetchNutrition = (params = {}) =>
  client.get("/nutrition", { params }).then(r => r.data);

export const logMeal = (data) =>
  client.post("/nutrition", data).then(r => r.data);

export const updateMeal = (id, data) =>
  client.put(`/nutrition/${id}`, data).then(r => r.data);

export const deleteMeal = (id) =>
  client.delete(`/nutrition/${id}`).then(r => r.data);
