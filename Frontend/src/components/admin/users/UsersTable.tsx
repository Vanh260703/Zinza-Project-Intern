"use client";

import { useState, useMemo } from "react";
import { useAdminUsers } from "@/hooks/useAdmin";
import { useRouter } from "next/navigation";

import {
  Search,
  Candy,
  Ticket,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
type SortKey = "name" | "candy" | "recommendationTicket" | "joinedAt";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 15;

function Th({
  label,
  sortKey,
  k,
  sortDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  k: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = sortKey === k;
  return (
    <th className="px-4 py-3 text-left cursor-pointer select-none group" onClick={() => onSort(k)}>
      <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-stone-500 group-hover:text-stone-300 transition-colors">
        {label}
        {active ? (
          sortDir === "asc" ? (
            <ChevronUp className="w-3 h-3 text-violet-400" />
          ) : (
            <ChevronDown className="w-3 h-3 text-violet-400" />
          )
        ) : (
          <ChevronUp className="w-3 h-3 text-stone-700" />
        )}
      </div>
    </th>
  );
}

const ROLE_CLS: Record<string, string> = {
  admin: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  user: "text-stone-500 bg-stone-800 border-stone-700",
};

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

export default function UsersTable() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("joinedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const { data: users = [], isLoading: loading } = useAdminUsers();

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...users];
    if (q.trim()) {
      const lq = q.toLowerCase();
      list = list.filter(
        (u) => u.name.toLowerCase().includes(lq) || u.email.toLowerCase().includes(lq)
      );
    }
    if (role !== "all") list = list.filter((u) => u.role === role);
    list.sort((a, b) => {
      const va = a[sortKey] ?? "";
      const vb = b[sortKey] ?? "";
      const cmp =
        String(va).toLowerCase() < String(vb).toLowerCase()
          ? -1
          : String(va).toLowerCase() > String(vb).toLowerCase()
            ? 1
            : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [users, q, role, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const curPage = Math.min(page, totalPages);
  const paginated = filtered.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-stone-700 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 focus-within:border-violet-500/60 transition-colors flex-1">
          <Search className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên hoặc email..."
            className="bg-transparent text-stone-200 text-sm placeholder-stone-600 outline-none flex-1"
          />
        </div>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="bg-stone-800 border border-stone-700 text-stone-300 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-violet-500/60 transition-colors"
        >
          <option value="all">Tất cả role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      <p className="text-stone-600 text-xs">{filtered.length.toLocaleString()} người dùng</p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-stone-800">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-stone-900/80 border-b border-stone-800">
            <tr>
              <Th label="Tên" k="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Email
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Role
              </th>
              <Th label="Kẹo" k="candy" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <Th
                label="Vé tháng"
                k="recommendationTicket"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <Th
                label="Tham gia"
                k="joinedAt"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-stone-600 text-sm">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              paginated.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => router.push(`/admin/users/${u.id}`)}
                  className="bg-stone-900/40 hover:bg-stone-800/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-amber-400">
                          {u.name[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-stone-200 font-medium truncate max-w-[160px]">
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-stone-400 text-xs">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold ${ROLE_CLS[u.role] ?? ROLE_CLS.user}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Candy className="w-3.5 h-3.5" />
                      {u.candy.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-sky-400">
                      <Ticket className="w-3.5 h-3.5" />
                      {u.recommendationTicket}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-stone-600 text-xs">{formatDate(u.joinedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-stone-600 text-xs">
            Trang {curPage} / {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={curPage === 1}
              className="p-1.5 rounded-lg border border-stone-800 text-stone-400 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - curPage) <= 1)
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="px-1 text-stone-700 text-xs">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${curPage === p ? "bg-violet-500/20 border border-violet-500/30 text-violet-400" : "border border-stone-800 text-stone-500 hover:bg-stone-800 hover:text-white"}`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={curPage === totalPages}
              className="p-1.5 rounded-lg border border-stone-800 text-stone-400 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
