import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import Header from "@/components/header";
import Footer from "@/components/footer";
import Container from "react-bootstrap/Container";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./ScrollToTop";

// IMPORT ZALO CHAT ĐÚNG ĐƯỜNG DẪN
import ZaloChat from "@/components/ZaloChat";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pibook",
  description: "Website bán sách trực tuyến Pibook",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>

      <body
        className={`${inter.variable} antialiased d-flex flex-column min-vh-100 bg-light`}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <ScrollToTop />
        <Header />

        <main className="flex-grow-1 py-4 py-md-5">
          <Container className="px-3 px-sm-4 px-lg-5">
            {children}
          </Container>
        </main>

        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={12}
          toastOptions={{
            duration: 4000,
            style: {
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              fontWeight: "600",
              borderRadius: "12px",
              padding: "16px 24px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              fontSize: "1rem",
            },
            success: { style: { background: "#28a745" } },
            error: { style: { background: "#dc3545" } },
          }}
        />
        <Footer />
                {/* ZALO CHAT GÓC PHẢI DƯỚI – ĐẸP NHƯ FAHASA */}
       <ZaloChat />
      </body>
    </html>
  );
}