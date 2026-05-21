import client from "./client";

export const fetchFees      = ()         => client.get("/finance/fees").then(r => r.data);
export const createFee      = (data)     => client.post("/finance/fees", data).then(r => r.data);
export const updateFee      = (id, data) => client.put(`/finance/fees/${id}`, data).then(r => r.data);
export const deleteFee      = (id)       => client.delete(`/finance/fees/${id}`).then(r => r.data);

export const fetchInvoices      = (params = {})    => client.get("/finance/invoices", { params }).then(r => r.data);
export const fetchFinanceSummary = (params = {})   => client.get("/finance/summary", { params }).then(r => r.data);
export const createInvoice      = (data)           => client.post("/finance/invoices", data).then(r => r.data);
export const generateInvoices   = (month, dueDate) => client.post("/finance/invoices/generate", { month, dueDate }).then(r => r.data);
export const updateInvoice      = (id, data)       => client.put(`/finance/invoices/${id}`, data).then(r => r.data);
export const deleteInvoice      = (id)             => client.delete(`/finance/invoices/${id}`).then(r => r.data);
