export const adminApi = {
  getUsers: () => fetch("/api/admin/users").then((r) => r.json()),

  getUserById: (id: string) => fetch(`/api/admin/users/${id}`).then((r) => r.json()),

  topupUser: (targetId: string, amount: number) =>
    fetch(`/api/admin/users/${targetId}/topup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    }).then((r) => r.json()),

  getNovels: () => fetch("/api/admin/novels").then((r) => r.json()),

  getDashboard: () => fetch("/api/admin/stats").then((r) => r.json()),
};
