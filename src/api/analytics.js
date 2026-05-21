import client from "./client";

export const fetchOverview           = ()             => client.get("/analytics/overview").then(r => r.data);
export const fetchEnrollmentTrend    = (months = 6)   => client.get("/analytics/enrollment", { params: { months } }).then(r => r.data);
export const fetchAttendanceTrend    = (weeks = 8)    => client.get("/analytics/attendance", { params: { weeks } }).then(r => r.data);
export const fetchFinanceTrend       = (months = 6)   => client.get("/analytics/finance", { params: { months } }).then(r => r.data);
export const fetchBehaviourAnalytics = (days = 30)    => client.get("/analytics/behaviour", { params: { days } }).then(r => r.data);
export const fetchStudentBreakdown   = ()             => client.get("/analytics/students/breakdown").then(r => r.data);
