export const STATUS_OPTIONS = [
  { label: "Hoàn thành", value: "completed" },
  { label: "Đang ra", value: "pending" },
] as const;

export type Status = (typeof STATUS_OPTIONS)[number]["value"];
