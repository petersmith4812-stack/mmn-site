import client from "./client";

export const fetchAIStatus       = ()       => client.get("/ai/status").then(r => r.data);
export const aiChat              = (messages, systemPrompt) => client.post("/ai/chat", { messages, systemPrompt }).then(r => r.data);
export const generateLessonPlan  = (params) => client.post("/ai/lesson-plan", params).then(r => r.data);
export const getBehaviourInsight = (studentId) => client.post("/ai/behaviour-insight", { studentId }).then(r => r.data);
export const generateProgressReport = (studentId, term) => client.post("/ai/progress-report", { studentId, term }).then(r => r.data);
