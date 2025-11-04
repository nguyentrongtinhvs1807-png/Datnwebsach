import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚙️ Cấu hình giữ nguyên vị trí cuộn khi điều hướng trang
  experimental: {
    scrollRestoration: true,
  },

  // ✅ Nếu bạn cần cấu hình thêm (ví dụ dùng ảnh ngoài domain khác)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Cho phép hiển thị ảnh từ tất cả domain
      },
    ],
  },
};

export default nextConfig;
