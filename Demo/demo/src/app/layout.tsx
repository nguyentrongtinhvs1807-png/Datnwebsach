import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "../components/header";
import Footer from "../components/footer";
import Container from "react-bootstrap/esm/Container";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
      <body
        className={`${inter.variable} antialiased d-flex flex-column min-vh-100`}
      >
        {/* 🔝 Cuộn lên đầu khi đổi trang */}
        <ScrollToTop />

        <Header />

        <main className="flex-grow-1">
          <Container>{children}</Container>
        </main>

        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

        <Footer />
        <BootstrapClient /> {/* ✅ Load JS bootstrap ở client */}
      </body>
    </html>
  );
}
