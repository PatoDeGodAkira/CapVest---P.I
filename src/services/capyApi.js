import { apiRequest } from "./api";

export function searchQuestions({ q, vestibular = "Todos", limit = 8, signal }) {
  const params = new URLSearchParams({ q, vestibular: vestibular.toLowerCase(), limit: String(limit) });
  return apiRequest(`/api/capy/search?${params}`, { signal });
}

export const checkAnswer = ({ id, choice }) => apiRequest("/api/exams/answer/check", { method: "POST", body: { id, choice } });
export const getCapyStatus = () => apiRequest("/api/capy/status");
export const examUrl = (result) => `/materiais/${result.vestibularId}?doc=${encodeURIComponent(result.docId)}&pagina=${result.page}`;
