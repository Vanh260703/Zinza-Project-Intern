import type { Metadata } from "next";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import StoreHydrator from "@/components/StoreHydrator";
import QueryProvider from "@/components/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web đọc truyện chữ top 1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#0f0e17] antialiased">
        <QueryProvider>
          <StoreHydrator />
          <Navbar />
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
        </QueryProvider>
      </body>
    </html>
  );
}
