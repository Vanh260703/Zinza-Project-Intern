import { createRequire } from "module";

const require = createRequire(import.meta.url);
const nextConfig = require("eslint-config-next");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

export default [
  ...nextConfig,
  {
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // <img> intentional — ảnh serve từ internal API route /api/cover/[id]
      // dùng next/image cần cấu hình thêm remotePatterns
      "@next/next/no-img-element": "off",
    },
  },
];
