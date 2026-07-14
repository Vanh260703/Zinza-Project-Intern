import { apiFetch } from "./client";

export const adminApi = {
  getUsers: () => apiFetch("/api/admin/users").then((r) => r.json()),

  getUserById: (id: string) => apiFetch(`/api/admin/users/${id}`).then((r) => r.json()),

  topupUser: (targetId: string, amount: number) =>
    apiFetch(`/api/admin/users/${targetId}/topup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    }).then((r) => r.json()),

  getDashboard: () => apiFetch("/api/admin/stats").then((r) => r.json()),
};
