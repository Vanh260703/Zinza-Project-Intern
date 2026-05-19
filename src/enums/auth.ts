export const GENDER_OPTIONS = [
  { label: "Nam",  value: "male"   },
  { label: "Nữ",   value: "female" },
  { label: "Khác", value: "other"  },
] as const;

export const ROLE_OPTIONS = [
  { label: "ADMIN", value: "admin" },
  { label: "USER",  value: "user"  },
] as const;

export type Gender = (typeof GENDER_OPTIONS)[number]["value"];
export type Role   = (typeof ROLE_OPTIONS)[number]["value"];
