import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "../components/header";
import Footer from "../components/footer";
import Container from "react-bootstrap/esm/Container";
import { Toaster } from "react-hot-toast";        // ĐÚNG
// XÓA DÒNG NÀY ĐI → KHÔNG CÒN TỒN TẠI TRONG PHIÊN BẢN MỚI
// import "react-hot-toast/css";              // ← XÓA DÒNG NÀY
import BootstrapClient from "./bootstrap.client";
import ScrollToTop from "./ScrollToTop";

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} antialiased d-flex flex-column min-vh-100`}>
        <ScrollToTop />
        <Header />

        <main className="flex-grow-1">
          <Container>{children}</Container>
        </main>

        {/* TOAST SIÊU ĐẸP – react-hot-toast */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={16}
          containerStyle={{ zIndex: 99999 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: "bold",
              borderRadius: "16px",
              padding: "18px 28px",
              boxShadow: "0 12px 35px rgba(102, 126, 234, 0.35)",
              fontSize: "1.05rem",
            },
            success: {
              duration: 3000,
              style: {
                background: "linear-gradient(135deg, #28a745, #20c997)",
              },
            },
            error: {
              duration: 5000,
              style: {
                background: "#dc3545",
              },
            },
          }}
        />

        <Footer />
        <BootstrapClient />
      </body>
    </html>
  );
}