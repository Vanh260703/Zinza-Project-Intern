import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "WEB ĐỌC TRUYỆN TU TIÊN",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#0f0e17] antialiased">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1927",
              border: "1px solid #3f3f46",
              color: "#f4f4f5",
            },
          }}
        />
      </body>
    </html>
  );
}
