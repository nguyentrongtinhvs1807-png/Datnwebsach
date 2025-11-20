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
    // THAY THẾ bằng một thẻ <div> hoặc Fragment (<>) để bao bọc nội dung
    <div className="admin-page-wrapper">
      {/* Đây sẽ là nơi bạn đặt Header, Sidebar hoặc cấu trúc chung của Admin */}
      
      {children}
      
      <BootstrapClient />
    </div>
  );
}