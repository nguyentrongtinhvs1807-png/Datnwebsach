"use client";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { ISach, ILoaiSach } from "@/components/cautrucdata";
import ProductModal from "./product.modal";

const AdminProduct = () => {
  const [sachs, setSachs] = useState<ISach[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editSach, setEditSach] = useState<ISach | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSach();
  }, []);

  const fetchSach = async () => {
    try {
      const res = await fetch("http://localhost:3003/sach");
      const data = await res.json();
      setSachs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi lấy sách:", error);
    }
  };

  const handleHide = async (id: number) => {
    if (!confirm("Bạn có chắc muốn ẩn sách này không? Sách sẽ không hiển thị trên website nhưng vẫn còn trong database.")) return;
    try {
      const res = await fetch(`http://localhost:3003/sach/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSach();
        alert("Đã ẩn sách thành công!");
      } else {
        throw new Error("Lỗi khi ẩn sách");
      }
    } catch (error) {
      console.error("Lỗi khi ẩn:", error);
      alert("Có lỗi xảy ra khi ẩn sách!");
    }
  };

  const handleRestore = async (id: number) => {
    if (!confirm("Bạn có chắc muốn khôi phục sách này không?")) return;
    try {
      const res = await fetch(`http://localhost:3003/sach/${id}/restore`, { method: "PUT" });
      if (res.ok) {
        fetchSach();
        alert("Đã khôi phục sách thành công!");
      } else {
        throw new Error("Lỗi khi khôi phục sách");
      }
    } catch (error) {
      console.error("Lỗi khi khôi phục:", error);
      alert("Có lỗi xảy ra khi khôi phục sách!");
    }
  };

  const handleEdit = (sach: ISach) => {
    setEditSach(sach);
    setShowModal(true);
  };

  const filteredSachs = sachs.filter((sach) => {
    const keyword = search.toLowerCase();
    return (
      sach.ten_sach?.toLowerCase().includes(keyword) ||
      sach.ten_tac_gia?.toLowerCase().includes(keyword) ||
      sach.ten_NXB?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div>
      {/* Header với nút thêm và search */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="flex-grow-1 me-3">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm sách theo tên, tác giả, nhà xuất bản..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderRadius: "10px", border: "2px solid #e0e0e0", padding: "10px" }}
          />
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditSach(null);
            setShowModal(true);
          }}
          className="px-4 py-2 fw-semibold"
          style={{ borderRadius: "10px", minWidth: "150px" }}
        >
          Thêm sách mới
        </Button>
      </div>

      {/* Bảng sản phẩm */}
      {filteredSachs.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">
            {search ? "Không tìm thấy sách nào phù hợp." : "Chưa có sách nào."}
          </p>
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ background: "linear-gradient(90deg, #4369e3 0%, #62bbff 100%)", color: "white" }}>
              <tr>
                <th style={{ fontWeight: 600 }}>ID</th>
                <th style={{ fontWeight: 600 }}>Tên sách</th>
                <th style={{ fontWeight: 600 }}>Tác giả</th>
                <th style={{ fontWeight: 600 }}>Nhà XB</th>
                <th style={{ fontWeight: 600 }}>Giá (đ)</th>
                <th style={{ fontWeight: 600 }}>Tồn kho</th>
                <th style={{ fontWeight: 600 }}>Giảm giá (đ)</th>
                <th style={{ fontWeight: 600 }}>Loại bìa</th>
                <th style={{ fontWeight: 600 }}>Mô tả</th>
                <th style={{ fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSachs.map((sach) => (
                <tr 
                  key={sach.sach_id} 
                  style={{ 
                    transition: "background 0.2s",
                    opacity: sach.an_hien === 0 ? 0.6 : 1,
                    backgroundColor: sach.an_hien === 0 ? "#f8f9fa" : "white"
                  }}
                >
                  <td className="fw-semibold">
                    {sach.sach_id}
                    {sach.an_hien === 0 && (
                      <span className="badge bg-secondary ms-2" style={{ fontSize: "0.7rem" }}>Đã ẩn</span>
                    )}
                  </td>
                  <td className="fw-medium" style={{ color: "#21409A", maxWidth: "200px" }}>
                    {sach.ten_sach}
                  </td>
                  <td>{sach.ten_tac_gia}</td>
                  <td>{sach.ten_NXB}</td>
                  <td className="text-danger fw-bold">
                    {sach.gia_sach ? Number(sach.gia_sach).toLocaleString("vi-VN") + "đ" : "0đ"}
                  </td>
                  <td>
                    <span className={`badge ${(sach.ton_kho_sach || 0) > 0 ? "bg-success" : "bg-danger"}`} style={{ padding: "6px 12px", borderRadius: "8px" }}>
                      {sach.ton_kho_sach || 0}
                    </span>
                  </td>
                  <td className="text-success fw-semibold">
                    {sach.gg_sach > 0 ? Number(sach.gg_sach).toLocaleString("vi-VN") + "đ" : "-"}
                  </td>
                  <td>
                    <span className="badge bg-info" style={{ padding: "6px 12px", borderRadius: "8px" }}>
                      {sach.loai_bia || "N/A"}
                    </span>
                  </td>
                  <td style={{ maxWidth: "250px", wordBreak: "break-word" }}>
                    <span className="text-muted small" title={sach.mo_ta}>
                      {sach.mo_ta && sach.mo_ta.length > 50
                        ? `${sach.mo_ta.substring(0, 50)}...`
                        : sach.mo_ta || "-"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEdit(sach)}
                        className="fw-semibold"
                        style={{ borderRadius: "8px", minWidth: "80px" }}
                      >
                        Sửa
                      </Button>
                      {sach.an_hien === 1 || sach.an_hien === undefined ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleHide(sach.sach_id)}
                          className="fw-semibold"
                          style={{ borderRadius: "8px", minWidth: "80px" }}
                          title="Ẩn sách (không xóa khỏi database)"
                        >
                          Ẩn
                        </Button>
                      ) : (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleRestore(sach.sach_id)}
                          className="fw-semibold"
                          style={{ borderRadius: "8px", minWidth: "80px" }}
                          title="Khôi phục sách đã ẩn"
                        >
                          Khôi phục
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
