"use client";

import { useEffect, useState } from "react";
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sachRes, nguoiDungRes, donHangRes] = await Promise.all([
          fetch("http://localhost:3003/sach"),
          fetch("http://localhost:3003/nguoi_dung"),
          fetch("http://localhost:3003/don_hang"), 
        ]);

        const sach = await sachRes.json();
        const nguoiDung = await nguoiDungRes.json();
        const donHang = await donHangRes.json();

        // Tính doanh thu
        let totalRevenue = 0;
        let pending = 0;
        let completed = 0;
        const revenueByMonth: Record<string, number> = {};

        donHang.forEach((dh: any) => {
          const tong = Number(dh.tong_tien) || 0;
          if (tong > 0) {
            totalRevenue += tong;

            const date = new Date(dh.ngay_dat || dh.ngay_dat_hang || Date.now());
            const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
            revenueByMonth[key] = (revenueByMonth[key] || 0) + tong;

            const status = (dh.trang_thai || "").toLowerCase();
            if (status.includes("chờ") || status.includes("giao")) pending++;
            if (status.includes("hoàn thành") || status.includes("thành công")) completed++;
          }
        });

        const monthlyData = Object.keys(revenueByMonth)
          .sort((a, b) => {
            const [m1, y1] = a.split("/").map(Number);
            const [m2, y2] = b.split("/").map(Number);
            return y2 - y1 || m2 - m1;
          })
          .slice(0, 6)
          .map(key => ({ month: `Tháng ${key}`, total: revenueByMonth[key] }))
          .reverse();

        setStats({
          totalProducts: Array.isArray(sach) ? sach.length : 0,
          totalUsers: Array.isArray(nguoiDung)
            ? nguoiDung.filter((u: any) => u.role !== "admin" && u.vai_tro !== "admin").length
            : 0,
          totalOrders: Array.isArray(donHang) ? donHang.length : 0,
          totalRevenue,
          pendingOrders: pending,
          completedOrders: completed,
          monthlyRevenue: monthlyData.length > 0 ? monthlyData : [{ month: "Chưa có", total: 0 }],
        });
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + " ₫";

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl">Đang tải...</div>;

  const chartData = {
    labels: stats.monthlyRevenue.map((r: any) => r.month),
    datasets: [{
      label: "Doanh thu (VNĐ)",
      data: stats.monthlyRevenue.map((r: any) => r.total),
      backgroundColor: "rgba(54, 162, 235, 0.7)",
      borderRadius: 8,
    }],
  };

  return (
    <div className="container-fluid py-5 px-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Bảng Điều Khiển - PIBOOK</h1>

      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="bg-gradient-purple text-white p-5 rounded-3 shadow-lg text-center">
            <h5>Tổng Sản Phẩm</h5>
            <h2 className="display-4">{stats.totalProducts}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-gradient-pink text-white p-5 rounded-3 shadow-lg text-center">
            <h5>Tổng Đơn Hàng</h5>
            <h2 className="display-4">{stats.totalOrders}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-gradient-blue text-white p-5 rounded-3 shadow-lg text-center">
            <h5>Khách Hàng</h5>
            <h2 className="display-4 text-info">{stats.totalUsers}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-gradient-green text-white p-5 rounded-3 shadow-lg text-center">
            <h5>Tổng Doanh Thu</h5>
            <h2 className="display-4 text-warning">{formatPrice(stats.totalRevenue)}</h2>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="bg-warning text-dark p-4 rounded-3 text-center shadow">
            <h5>Đơn chờ xử lý</h5>
            <h1 className="display-3 text-danger">{stats.pendingOrders}</h1>
          </div>
        </div>
        <div className="col-md-6">
          <div className="bg-success text-white p-4 rounded-3 text-center shadow">
            <h5>Đơn hoàn thành</h5>
            <h1 className="display-3">{stats.completedOrders}</h1>
          </div>
        </div>
      </div>

      <div className="card mt-5 shadow-lg">
        <div className="card-header bg-primary text-white">
          <h4>Doanh thu 6 tháng gần nhất</h4>
        </div>
        <div className="card-body" style={{ height: "400px" }}>
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}