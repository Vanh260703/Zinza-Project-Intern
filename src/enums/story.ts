export const STATUS_OPTIONS = [
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Đang ra", value: "PENDING" },
] as const;

export type Status = (typeof STATUS_OPTIONS)[number]["value"];
