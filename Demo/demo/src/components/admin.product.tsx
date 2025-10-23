"use client";
import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { ISach, ILoaiSach } from "@/components/cautrucdata";
import ProductModal from "./product.modal";

const AdminProduct = () => {
  const [sachs, setSachs] = useState<ISach[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editSach, setEditSach] = useState<ISach | null>(null);

  useEffect(() => {
    fetchSach();
  }, []);

  const fetchSach = async () => {
    try {
      const res = await fetch("http://localhost:3003/sach");
      const data = await res.json();
      setSachs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Lỗi khi lấy sách:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá sách này không?")) return;
    try {
      await fetch(`http://localhost:3003/sach/${id}`, { method: "DELETE" });
      fetchSach();
    } catch (error) {
      console.error("❌ Lỗi khi xoá:", error);
    }
  };

  const handleEdit = (sach: ISach) => {
    setEditSach(sach);
    setShowModal(true);
  };

  return (
    <div className="p-4">
      <div className="text-center mb-3">
        <Button
          variant="primary"
          onClick={() => {
            setEditSach(null);
            setShowModal(true);
          }}
        >
          + Thêm sách
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Tên sách</th>
            <th>Tác giả</th>
            <th>Nhà XB</th>
            <th>Giá (₫)</th>
            <th>Tồn kho</th>
            <th>Giảm giá (₫)</th>
            <th>Loại bìa</th>
            <th>Mô tả</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {sachs.map((sach) => (
            <tr key={sach.sach_id}>
              <td>{sach.sach_id}</td>
              <td>{sach.ten_sach}</td>
              <td>{sach.ten_tac_gia}</td>
              <td>{sach.ten_NXB}</td>
              <td className="text-danger fw-bold">
                {sach.gia_sach.toLocaleString("vi-VN")}
              </td>
              <td>{sach.ton_kho_sach}</td>
              <td>{sach.gg_sach.toLocaleString("vi-VN")}</td>
              <td>{sach.loai_bia}</td>
              <td style={{ maxWidth: "200px" }} className="text-truncate">
                {sach.mo_ta}
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEdit(sach)}
                >
                  ✏️
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(sach.sach_id)}
                >
                  🗑️
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <ProductModal
        showModal={showModal}
        setShowModal={setShowModal}
        fetchSach={fetchSach}
        editSach={editSach}
      />
    </div>
  );
};

export default AdminProduct;
