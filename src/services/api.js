const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || data.error || "Não foi possível concluir a solicitação.");
    error.status = response.status;
    throw error;
  }
  return data;
}

export const getProgress = () => apiRequest("/api/progress/me");
export const getRanking = () => apiRequest("/api/progress/ranking");
export const getExams = () => apiRequest("/api/exams");
export const getExam = (id) => apiRequest(`/api/exams/${encodeURIComponent(id)}`);
export const submitExam = (id, answers) => apiRequest(`/api/exams/${encodeURIComponent(id)}/submit`, { method: "POST", body: { answers } });
export const searchCapy = (q, vestibular = "todos", limit = 8, signal) => {
  const params = new URLSearchParams({ q, vestibular, limit: String(limit) });
  return apiRequest(`/api/capy/search?${params}`, { signal });
};

export const updateProfile = (profile) => apiRequest("/api/auth/profile", { method: "PATCH", body: profile });

export const getExamCatalog = () => apiRequest("/api/exams/catalog");
export const createSimulation = (settings) => apiRequest("/api/exams/simulations", { method: "POST", body: settings });
export const getSimulation = (id) => apiRequest(`/api/exams/simulations/${encodeURIComponent(id)}`);
export const saveSimulationAnswers = (id, answers) => apiRequest(`/api/exams/simulations/${encodeURIComponent(id)}/answers`, { method: "PUT", body: { answers } });
export const submitSimulation = (id, answers) => apiRequest(`/api/exams/simulations/${encodeURIComponent(id)}/submit`, { method: "POST", body: { answers } });
export const saveOpenAnswer = (payload) => apiRequest("/api/exams/answer/open", { method: "POST", body: payload });
export const getStudyPlan = () => apiRequest("/api/study/plan");
export const saveStudyPlan = (plan) => apiRequest("/api/study/plan", { method: "PUT", body: plan });
export const generateStudyTasks = () => apiRequest("/api/study/plan/generate", { method: "POST", body: {} });
export const createStudyTask = (task) => apiRequest("/api/study/tasks", { method: "POST", body: task });
export const updateStudyTask = (id, updates) => apiRequest(`/api/study/tasks/${id}`, { method: "PATCH", body: updates });
export const deleteStudyTask = (id) => apiRequest(`/api/study/tasks/${id}`, { method: "DELETE" });
export const reviewOpenAnswer = (payload) => apiRequest("/api/exams/answer/open/review", { method: "POST", body: payload });
