"use client";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

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
    fetch("http://localhost:3003/stats")
      .then(res => res.json())
      .then(data => {
        console.log("📊 Stats:", data);
        setStats(data);
      })
      .catch(err => console.error("❌ Lỗi fetch:", err));
  }, []);

  if (!stats) return <p>⏳ Đang tải dữ liệu...</p>;

  // Chuẩn bị dữ liệu cho ChartJS
  const chartData = {
    labels: stats.revenue.map(r => r.month),
    datasets: [
      {
        label: "Doanh thu",
        data: stats.revenue.map(r => r.total),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Dashboard</h1>

      {/* 3 ô thống kê */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-200 p-6 rounded-2xl text-center">
          <h2 className="text-lg font-semibold">Sản phẩm</h2>
          <p className="text-3xl font-bold">{stats.products}</p>
        </div>
        <div className="bg-green-200 p-6 rounded-2xl text-center">
          <h2 className="text-lg font-semibold">Đơn hàng</h2>
          <p className="text-3xl font-bold">{stats.orders}</p>
        </div>
        <div className="bg-yellow-200 p-6 rounded-2xl text-center">
          <h2 className="text-lg font-semibold">Người dùng</h2>
          <p className="text-3xl font-bold">{stats.users}</p>
        </div>
      </div>

      {/* Biểu đồ doanh thu */}
      <div className="bg-white shadow p-6 rounded-2xl">
        <h2 className="text-xl font-semibold mb-4">📈 Doanh thu theo tháng</h2>
        <Bar data={chartData} />
      </div>
    </div>
  );
}
