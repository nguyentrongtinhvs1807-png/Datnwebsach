"use client";

import { useEffect, useState } from "react";
import { Dropdown, Modal, Button, Badge, Card } from "react-bootstrap";
import { toast } from "react-toastify";

interface Order {
  don_hang_id: number;
  ma_don_hang?: string | null;
  DC_GH: string;
  ngay_dat: string;
  tong_tien: number;
  tam_tinh?: number;
  phi_ship?: number;
  giam_gia?: number;
  HT_Thanh_toan_id: number;
  trang_thai?: string | null;
  ly_do_huy?: string | null;
}

interface OrderItem {
  sach_id: number;
  ten_sach: string;
  So_luong: number;
  gia_ban: number;
  image?: string | null;
}

const VALID_STATUSES = [
  "Chờ xác nhận",
  "Đang xử lý",
  "Đang giao",
  "Hoàn thành",
  "Đã hủy",
];

const BOOK_PLACEHOLDER_URL =
  "https://placehold.co/60x80/6c757d/ffffff?text=Sách";

const ITEMS_PER_PAGE = 8;

const formatCurrency = (amount?: number | null) => {
  if (!amount) return "0 ₫";
  return amount.toLocaleString("vi-VN") + " ₫";
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  /* ================= helpers ================= */

  const getCleanOrderStatus = (o: Order) => {
    if (!o.trang_thai) return "Chờ xác nhận";
    if (o.HT_Thanh_toan_id === 3 && o.trang_thai.includes("Mã GD")) {
      return (
        VALID_STATUSES.find((s) => o.trang_thai!.includes(s)) ||
        "Chờ xác nhận"
      );
    }
    return o.trang_thai.trim();
  };

  const getStatusInfo = (status: string) => {
    const map: Record<string, string> = {
      "Chờ xác nhận": "warning",
      "Đang xử lý": "primary",
      "Đang giao": "info",
      "Hoàn thành": "success",
      "Đã hủy": "danger",
    };
    return map[status] || "secondary";
  };

  const nextStatuses = (s: string) => {
    if (s === "Chờ xác nhận") return ["Đang xử lý", "Đã hủy"];
    if (s === "Đang xử lý") return ["Đang giao"];
    if (s === "Đang giao") return ["Hoàn thành"];
    return [];
  };

  const isPaid = (o: Order) => o.HT_Thanh_toan_id === 3;

  /* ================= API ================= */

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:3003/orders?t=" + Date.now(),
        { cache: "no-store" }
      );
      const data = await res.json();
      setOrders(data);
      setCurrentPage(1); // 🔥 reset về trang 1 khi reload
    } catch {
      toast.error("Lỗi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (o: Order) => {
    setSelectedOrder(o);
    setShowDetail(true);
    setLoadingItems(true);
    try {
      const res = await fetch(
        `http://localhost:3003/orders/${o.don_hang_id}/details`
      );
      setOrderItems(res.ok ? await res.json() : []);
    } catch {
      toast.error("Lỗi tải chi tiết");
    } finally {
      setLoadingItems(false);
    }
  };

  const changeStatus = async (id: number, status: string) => {
    try {
      await fetch(`http://localhost:3003/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trang_thai: status }),
      });
      setOrders((o) =>
        o.map((x) =>
          x.don_hang_id === id ? { ...x, trang_thai: status } : x
        )
      );
      toast.success("Đã cập nhật trạng thái");
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  useEffect(() => {
    fetchOrders();
    const i = setInterval(fetchOrders, 8000);
    return () => clearInterval(i);
  }, []);

  /* ================= pagination ================= */

  const sortedOrders = [...orders].sort(
    (a, b) => b.don_hang_id - a.don_hang_id
  );

  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);

  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================= render ================= */

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="container">
        <div className="d-flex justify-content-between mb-3">
          <h5 className="fw-bold mb-0">Quản lý đơn hàng</h5>
          <Badge bg="dark">{orders.length} đơn</Badge>
        </div>

        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">Đang tải...</div>
            ) : (
              <>
                <div className="table-responsive">
                  <table
                    className="table table-sm align-middle mb-0"
                    style={{ tableLayout: "fixed" }}
                  >
                    <thead className="table-dark">
                      <tr>
                        <th style={{ width: 70 }}>ID</th>
                        <th style={{ width: 160 }}>Đơn hàng</th>
                        <th>Địa chỉ</th>
                        <th className="text-end" style={{ width: 120 }}>
                          Tổng
                        </th>
                        <th className="text-center" style={{ width: 120 }}>
                          TT
                        </th>
                        <th className="text-center" style={{ width: 140 }}>
                          Trạng thái
                        </th>
                        <th style={{ width: 80 }} />
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedOrders.map((o) => {
                        const s = getCleanOrderStatus(o);
                        return (
                          <tr key={o.don_hang_id}>
                            <td className="fw-bold">#{o.don_hang_id}</td>

                            <td>
                              <div className="fw-semibold small">
                                {o.ma_don_hang ||
                                  `PIBOOK-${o.don_hang_id
                                    .toString()
                                    .padStart(8, "0")}`}
                              </div>
                              <small className="text-muted">
                                {new Date(o.ngay_dat).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </small>
                            </td>

                            <td className="text-truncate">{o.DC_GH}</td>

                            <td className="text-end fw-bold text-danger">
                              {formatCurrency(o.tong_tien)}
                            </td>

                            <td className="text-center">
                              <Badge
                                bg={isPaid(o) ? "success" : "secondary"}
                              >
                                {isPaid(o) ? "Đã TT" : "COD"}
                              </Badge>
                            </td>

                            <td className="text-center">
                              <Dropdown>
                                <Dropdown.Toggle
                                  size="sm"
                                  variant={getStatusInfo(s)}
                                  className="px-2 py-1"
                                  style={{ minWidth: 110 }}
                                  disabled={nextStatuses(s).length === 0}
                                >
                                  {s}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                  {nextStatuses(s).map((n) => (
                                    <Dropdown.Item
                                      key={n}
                                      onClick={() =>
                                        changeStatus(o.don_hang_id, n)
                                      }
                                    >
                                      {n}
                                    </Dropdown.Item>
                                  ))}
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>

                            <td className="text-end">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => viewDetail(o)}
                              >
                                Xem
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ===== Pagination ===== */}
                <div className="d-flex justify-content-between align-items-center px-3 py-2">
                  <small className="text-muted">
                    Trang {currentPage} / {totalPages || 1}
                  </small>

                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      ← Trước
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Sau →
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card.Body>
        </Card>

        {/* ===== Modal chi tiết ===== */}
        <Modal
          show={showDetail}
          onHide={() => setShowDetail(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Đơn #{selectedOrder?.don_hang_id}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loadingItems ? "Đang tải..." : (
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Sách</th>
                    <th className="text-center">SL</th>
                    <th className="text-end">Giá</th>
                    <th className="text-end">Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((i) => (
                    <tr key={i.sach_id}>
                      <td className="d-flex gap-2">
                        <img
                          src={i.image || BOOK_PLACEHOLDER_URL}
                          width={40}
                        />
                        {i.ten_sach}
                      </td>
                      <td className="text-center">{i.So_luong}</td>
                      <td className="text-end">
                        {formatCurrency(i.gia_ban)}
                      </td>
                      <td className="text-end fw-bold">
                        {formatCurrency(i.So_luong * i.gia_ban)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
