import type { Metadata } from "next";
import BootstrapClient from "../bootstrap.client";

export const metadata: Metadata = {
  title: "Admin - Pibook",
  description: "Trang quản trị Pibook",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BootstrapClient />
    </>
  );
}

