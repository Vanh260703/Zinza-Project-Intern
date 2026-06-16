export const adminApi = {
  getUsers: () => fetch("/api/admin/users").then((r) => r.json()),

  getUserById: (id: string) => fetch(`/api/admin/users/${id}`).then((r) => r.json()),

  topupUser: (targetId: string, amount: number, adminId: string) =>
    fetch(`/api/admin/users/${targetId}/topup`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, adminId }),
    }).then((r) => r.json()),

  getNovels: () => fetch("/api/admin/novels").then((r) => r.json()),

  getDashboard: () => fetch("/api/admin/stats").then((r) => r.json()),
};
