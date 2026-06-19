export const GENDER_OPTIONS = [
  { label: "Nam", value: "MALE" },
  { label: "Nữ", value: "FEMALE" },
  { label: "Khác", value: "OTHER" },
] as const;

export const ROLE_OPTIONS = [
  { label: "ADMIN", value: "admin" },
  { label: "USER", value: "user" },
] as const;

export type Gender = (typeof GENDER_OPTIONS)[number]["value"];
export type Role = (typeof ROLE_OPTIONS)[number]["value"];
