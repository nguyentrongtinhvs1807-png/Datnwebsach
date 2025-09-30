"use client";
import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";

type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type Order = {
  id: number;
  products: Product[];
  totalPrice: number;
  status: string;
  customer: {
    name: string;
    email?: string | null;
    phone: string | null;
    address: string | null;
    payment: string | null;
  };
};

const STATUS_LIST = [
  "Chờ xác nhận",
  "Đã xác nhận",
  "Đang vận chuyển",
  "Hoàn thành",
  "Đã hủy",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  // Lấy danh sách đơn hàng từ DB
  useEffect(() => {
    fetch("http://localhost:3003/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const grouped: { [key: number]: Order } = {};

          data.forEach((order: any) => {
            const orderId = order.id_dh;
            if (!grouped[orderId]) {
              grouped[orderId] = {
                id: orderId,
                products: [],
                totalPrice: 0,
                status: order.trang_thai || "Chờ xác nhận",
                customer: {
                  name: order.ho_ten,
                  email: order.email, // ✅ lấy email từ API
                  phone: order.sdt,
                  address: order.dia_chi,
                  payment: order.phuong_thuc,
                },
              };
            }

            if (order.ten_sp) {
              grouped[orderId].products.push({
                id: order.product_id,
                name: order.ten_sp,
                price: order.gia,
                quantity: order.so_luong,
                image: order.hinh,
              });

              grouped[orderId].totalPrice +=
                (order.gia || 0) * (order.so_luong || 1);
            }
          });

          setOrders(Object.values(grouped));
        }
      })
      .catch((err) => console.error("Lỗi khi load orders:", err));
  }, []);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:3003/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trang_thai: newStatus }),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status: newStatus,
              }
            : o
        )
      );
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      alert("Cập nhật thất bại!");
    }
  };

  const sortedOrders = [...orders].sort((a, b) => b.id - a.id);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold text-center">Quản lý đơn hàng</h2>
      {sortedOrders.length === 0 ? (
        <p>Không có đơn hàng nào.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Khách hàng</th>
              <th>Thông tin sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order, index) => (
              <tr key={order.id}>
                <td>{index + 1}</td>
                <td>
                  {order.customer?.name ? (
                    <>
                      <p>
                        <strong>{order.customer.name}</strong>
                      </p>
                      <p>📧 {order.customer.email || "Không có email"}</p>
                      <p>📞 {order.customer.phone || "Không có số ĐT"}</p>
                      <p>📍 {order.customer.address || "Không có địa chỉ"}</p>
                    </>
                  ) : (
                    <em>Không có thông tin khách hàng</em>
                  )}
                </td>
                <td>
                  {order.products.length > 0 ? (
                    order.products.map((product) => (
                      <div
                        key={product.id}
                        className="d-flex align-items-center mb-2"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          width={40}
                          className="rounded me-2"
                        />
                        <div>
                          <p className="mb-0">
                            {product.name} x {product.quantity}
                          </p>
                          <small className="text-danger fw-bold">
                            {(
                              product.price * product.quantity
                            ).toLocaleString()}
                            đ
                          </small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <em>Không có sản phẩm</em>
                  )}
                </td>
                <td className="fw-bold text-danger">
                  {order.totalPrice.toLocaleString()}đ
                </td>
                <td>
                  {order.customer?.payment === "cod"
                    ? "Thanh toán khi nhận hàng (COD)"
                    : order.customer?.payment === "bank"
                    ? "Chuyển khoản ngân hàng"
                    : order.customer?.payment
                    ? order.customer.payment
                    : "Chưa chọn"}
                </td>
                <td>
                  <Form.Select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                  >
                    {STATUS_LIST.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Form.Select>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
