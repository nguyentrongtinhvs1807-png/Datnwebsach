"use client";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type RevenueItem = { month: string; total: number };

type Stats = {
  products: number;
  users: number;
  orders: number;
  revenue: RevenueItem[];
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // ✅ Dữ liệu giả lập
    setTimeout(() => {
      setStats({
        products: 53,
        users: 3,
        orders: 57,
        revenue: [
          { month: "Tháng 1/2025", total: 4200000 },
          { month: "Tháng 2/2025", total: 5800000 },
          { month: "Tháng 3/2025", total: 6500000 },
          { month: "Tháng 4/2025", total: 7200000 },
          { month: "Tháng 5/2025", total: 6900000 },
        ],
      });
    }, 1000); // mô phỏng load API 1 giây
  }, []);

  if (!stats) return <p>⏳ Đang tải dữ liệu thống kê...</p>;

  const chartData = {
    labels: stats.revenue.map((r) => r.month),
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: stats.revenue.map((r) => r.total),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "📈 Doanh thu theo tháng" },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Bảng thống kê</h1>

      {/* Các ô thống kê */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-200 p-6 rounded-2xl text-center">
          <h2 className="text-lg font-semibold">📦 Sản phẩm</h2>
          <p className="text-3xl font-bold">{stats.products}</p>
        </div>
        <div className="bg-green-200 p-6 rounded-2xl text-center">
          <h2 className="text-lg font-semibold">🧾 Đơn hàng</h2>
          <p className="text-3xl font-bold">{stats.orders}</p>
        </div>
        <div className="bg-yellow-200 p-6 rounded-2xl text-center">
          <h2 className="text-lg font-semibold">👤 Người dùng</h2>
          <p className="text-3xl font-bold">{stats.users}</p>
        </div>
      </div>

      {/* Biểu đồ doanh thu */}
      <div className="bg-white shadow p-6 rounded-2xl">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
