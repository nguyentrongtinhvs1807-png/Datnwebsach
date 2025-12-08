'use client';

import { useEffect, useState } from 'react';
import { Dropdown, Modal, Button, Badge, Card, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

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

const VALID_STATUSES = ['Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'];
const BOOK_PLACEHOLDER_URL = `https://placehold.co/60x80/6c757d/ffffff?text=Sách`;

const formatCurrency = (amount: number | undefined | null) => {
  if (amount == null || amount === 0) return amount === 0 ? 'Miễn phí' : '0đ';
  return Number(amount).toLocaleString('vi-VN') + 'đ';
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const getCleanOrderStatus = (order: Order): string => {
    if (!order.trang_thai) return 'Chờ xác nhận';

    const isVNPayWithLongStatus = order.HT_Thanh_toan_id === 3 && order.trang_thai.includes('Mã GD:');
    if (isVNPayWithLongStatus) {
      const foundStatus = VALID_STATUSES.find(s => order.trang_thai!.includes(s));
      return foundStatus || 'Chờ xác nhận';
    }

    return order.trang_thai.trim();
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3003/orders?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) throw new Error('API Lỗi');
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (e) {
      toast.error('Lỗi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const viewDetail = async (order: Order) => {
    setSelectedOrder(order);
    setShowDetail(true);
    setLoadingItems(true);
    setOrderItems([]);

    try {
      const res = await fetch(`http://localhost:3003/orders/${order.don_hang_id}/details`);
      const items = res.ok ? await res.json() : [];
      setOrderItems(items);
    } catch {
      toast.error('Lỗi tải chi tiết đơn hàng');
      setOrderItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const changeStatus = async (id: number, status: string) => {
    try {
      await fetch(`http://localhost:3003/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trang_thai: status })
      });

      setOrders(prev => prev.map(o => o.don_hang_id === id ? { ...o, trang_thai: status } : o));
      toast.success('Cập nhật trạng thái thành công!');
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const getStatusInfo = (status: string) => {
    const map: Record<string, { variant: string; icon: string; text: string }> = {
      'Chờ xác nhận': { variant: 'warning', icon: 'bi-hourglass-split', text: 'Chờ xác nhận' },
      'Đang xử lý': { variant: 'primary', icon: 'bi-gear-wide-connected', text: 'Đang xử lý' },
      'Đang giao': { variant: 'info', icon: 'bi-truck', text: 'Đang giao' },
      'Hoàn thành': { variant: 'success', icon: 'bi-check-circle-fill', text: 'Hoàn thành' },
      'Đã hủy': { variant: 'danger', icon: 'bi-x-octagon-fill', text: 'Đã hủy' },
    };
    return map[status] || { variant: 'secondary', icon: 'bi-question-circle', text: status };
  };

  const getPaymentInfo = (o: Order) => {
    const isVNPay = o.HT_Thanh_toan_id === 3;
    return {
      isVNPay,
      paymentIcon: isVNPay ? 'bi-credit-card-2-front-fill' : 'bi-cash-coin',
      paymentText: isVNPay ? 'Đã thanh toán' : 'COD'
    };
  };

  // Tính tạm tính từ danh sách sản phẩm (nếu backend không trả tam_tinh)
  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.So_luong * item.gia_ban, 0);
  };

  return (
    <div className="container-fluid py-5 bg-light min-vh-100">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between mb-5">
          <h2 className="fw-bolder text-dark fs-1 mb-0">
            Quản Lý Đơn Hàng
          </h2>
          <Badge bg="primary" className="fs-5 px-4 py-2 rounded-pill shadow-lg text-uppercase">
            Tổng Đơn: {orders.length}
          </Badge>
        </div>

        <Card className="shadow-lg border-0 rounded-4">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }}></div>
                <p className="mt-3 fs-5 text-muted">Đang tải dữ liệu đơn hàng...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-secondary opacity-50"></i>
                <p className="fs-3 text-muted mt-3">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped align-middle mb-0 border-top">
                  <thead className="table-dark">
                    <tr>
                      <th className="text-center">#ID</th>
                      <th>Mã đơn & Ngày đặt</th>
                      <th>Địa chỉ giao</th>
                      <th className="text-end">Tổng tiền</th>
                      <th className="text-center">Thanh toán</th>
                      <th className="text-center">Trạng thái</th>
                      <th className="text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .sort((a, b) => b.don_hang_id - a.don_hang_id)
                      .map((o) => {
                        const maDonDefault = `PIBOOK-${o.don_hang_id.toString().padStart(8, '0')}`;
                        const displayMaDon = o.ma_don_hang || maDonDefault;
                        const orderStatus = getCleanOrderStatus(o);
                        const statusInfo = getStatusInfo(orderStatus);
                        const paymentInfo = getPaymentInfo(o);

                        const nextStatus = orderStatus === 'Chờ xác nhận'
                          ? ['Đang xử lý', 'Đã hủy']
                          : orderStatus === 'Đang xử lý'
                            ? ['Đang giao']
                            : orderStatus === 'Đang giao'
                              ? ['Hoàn thành']
                              : [];

                        return (
                          <tr key={o.don_hang_id} className={orderStatus === 'Đã hủy' ? 'opacity-75 table-danger' : ''}>
                            <td className="text-center fw-bold text-primary">#{o.don_hang_id}</td>

                            <td>
                              <div className="fw-bold text-dark mb-1">
                                {displayMaDon}
                              </div>
                              <small className="text-muted">
                                {new Date(o.ngay_dat).toLocaleString('vi-VN')}
                              </small>
                            </td>

                            <td className="small" style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {o.DC_GH || '—'}
                            </td>

                            <td className="text-end text-danger fw-bolder fs-5">
                              {formatCurrency(o.tong_tien)}
                            </td>

                            <td className="text-center">
                              <Badge bg={paymentInfo.isVNPay ? 'success' : 'secondary'} className="px-3 py-2 fw-bold">
                                {paymentInfo.paymentText}
                              </Badge>
                            </td>

                            <td className="text-center">
                              <div className="d-flex flex-column align-items-center gap-2">
                                <Dropdown drop="down">
                                  <Dropdown.Toggle
                                    variant={statusInfo.variant}
                                    className="rounded-pill px-3 py-2 fw-bold text-white shadow-sm"
                                    size="sm"
                                    disabled={nextStatus.length === 0}
                                  >
                                    {statusInfo.text}
                                  </Dropdown.Toggle>

                                  {nextStatus.length > 0 && (
                                    <Dropdown.Menu className="shadow-lg border-0">
                                      <Dropdown.Header>Chuyển trạng thái</Dropdown.Header>
                                      {nextStatus.map(s => {
                                        const nextInfo = getStatusInfo(s);
                                        return (
                                          <Dropdown.Item
                                            key={s}
                                            onClick={() => changeStatus(o.don_hang_id, s)}
                                          >
                                            {nextInfo.text}
                                          </Dropdown.Item>
                                        );
                                      })}
                                    </Dropdown.Menu>
                                  )}
                                </Dropdown>

                                {orderStatus === 'Đã hủy' && o.ly_do_huy && (
                                  <div className="text-danger small mt-1 px-3 py-2 bg-danger-subtle rounded-pill">
                                    Lý do: {o.ly_do_huy}
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="text-center">
                              <Button
                                variant="outline-dark"
                                size="sm"
                                className="rounded-pill px-3"
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
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Modal chi tiết đơn hàng - CÓ PHÍ SHIP + TẠM TÍNH */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-dark text-white p-4">
          <Modal.Title className="fs-4 fw-bolder">
            Chi Tiết Đơn Hàng #{selectedOrder?.don_hang_id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedOrder && (
            <>
              <Card className="mb-4 shadow-sm border-0 bg-light rounded-3">
                <Card.Body>
                  <Row className="text-center g-4">
                    <Col md={3}>
                      <p className="text-muted small fw-bold mb-1">Mã Đơn Hàng</p>
                      <h4 className="text-primary fw-bolder">
                        {selectedOrder.ma_don_hang || `PIBOOK-${selectedOrder.don_hang_id.toString().padStart(8, '0')}`}
                      </h4>
                    </Col>
                    <Col md={3}>
                      <p className="text-muted small fw-bold mb-1">Ngày Đặt</p>
                      <h5 className="fw-bold">
                        {new Date(selectedOrder.ngay_dat).toLocaleDateString('vi-VN')}
                      </h5>
                    </Col>
                    <Col md={3}>
                      <p className="text-muted small fw-bold mb-1">Thanh Toán</p>
                      <h5 className="fw-bold">
                        {getPaymentInfo(selectedOrder).paymentText}
                      </h5>
                    </Col>
                    <Col md={3}>
                      <p className="text-muted small fw-bold mb-1">Địa Chỉ</p>
                      <h6 className="fw-bold text-dark">
                        {selectedOrder.DC_GH || 'Chưa có'}
                      </h6>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* BẢNG TÍNH TIỀN CHI TIẾT */}
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Body className="bg-success bg-opacity-5 rounded-3">
                  <Row className="g-3">
                    <Col md={6} className="d-flex justify-content-between">
                      <span>Tạm tính ({orderItems.length} sản phẩm):</span>
                      <strong>{formatCurrency(selectedOrder.tam_tinh || calculateSubtotal())}</strong>
                    </Col>
                    <Col md={6} className="d-flex justify-content-between">
                      <span>Giảm giá:</span>
                      <strong className="text-success">
                        {formatCurrency(selectedOrder.giam_gia || 0) === '0đ' ? '0đ' : `-${formatCurrency(selectedOrder.giam_gia)}`}
                      </strong>
                    </Col>
                    <Col md={6} className="d-flex justify-content-between">
                      <span>Phí vận chuyển:</span>
                      <strong className={selectedOrder.phi_ship === 0 ? 'text-success' : 'text-warning'}>
                        {formatCurrency(selectedOrder.phi_ship)}
                      </strong>
                    </Col>
                    <Col md={6} className="d-flex justify-content-between border-top pt-3 border-2">
                      <h5 className="fw-bold m-0 text-dark">Tổng thanh toán:</h5>
                      <h4 className="text-danger fw-bold m-0">{formatCurrency(selectedOrder.tong_tien)}</h4>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <h5 className="mb-3 fw-bold text-dark">
                Danh sách sản phẩm
              </h5>

              {loadingItems ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                  <p className="mt-2 text-muted">Đang tải...</p>
                </div>
              ) : orderItems.length === 0 ? (
                <p className="text-center text-muted py-4 border rounded-3">
                  Không tìm thấy sản phẩm
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-secondary">
                      <tr>
                        <th>Sản phẩm</th>
                        <th className="text-center">SL</th>
                        <th className="text-end">Đơn giá</th>
                        <th className="text-end">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map(item => {
                        const total = item.So_luong * item.gia_ban;
                        return (
                          <tr key={item.sach_id}>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <img
                                  src={item.image || BOOK_PLACEHOLDER_URL}
                                  alt={item.ten_sach}
                                  width={60}
                                  height={80}
                                  className="rounded shadow"
                                  onError={e => (e.target as HTMLImageElement).src = BOOK_PLACEHOLDER_URL}
                                />
                                <div>
                                  <strong>{item.ten_sach}</strong>
                                  <br />
                                  <small className="text-muted">ID: {item.sach_id}</small>
                                </div>
                              </div>
                            </td>
                            <td className="text-center fw-bold">{item.So_luong}</td>
                            <td className="text-end">{formatCurrency(item.gia_ban)}</td>
                            <td className="text-end text-danger fw-bold">{formatCurrency(total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="dark" size="lg" onClick={() => setShowDetail(false)} className="rounded-pill px-5">
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}