export type NovelStatus = "PENDING" | "COMPLETED";

export const NOVEL_STATUS_CONFIG = {
  PENDING: {
    label: "Đang ra", // dùng trong filter chip, text thường
    labelUpper: "ĐANG RA", // dùng trong badge trên card
    cls: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  COMPLETED: {
    label: "Hoàn thành",
    labelUpper: "HOÀN THÀNH",
    cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
} as const;

// Fallback khi status không xác định
export const STATUS_FALLBACK = {
  label: "—",
  labelUpper: "—",
  cls: "text-stone-400 bg-stone-800 border-stone-700",
} as const;

export function getNovelStatus(status: string) {
  return NOVEL_STATUS_CONFIG[status as NovelStatus] ?? STATUS_FALLBACK;
}
