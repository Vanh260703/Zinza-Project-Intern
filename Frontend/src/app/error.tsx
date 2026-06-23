"use client";

import ErrorPage from "@/components/error/ErrorPage";

export default function GlobalError() {
  return (
    <ErrorPage
      code={500}
      title="Đã xảy ra lỗi"
      description="Máy chủ gặp sự cố không mong muốn. Vui lòng thử lại sau."
    />
  );
}
