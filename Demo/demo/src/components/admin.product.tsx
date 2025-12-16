"use client";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { ISach } from "@/components/cautrucdata";
import ProductModal from "./product.modal";

const ITEMS_PER_PAGE = 8;

const AdminProduct = () => {
  const [sachs, setSachs] = useState<ISach[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editSach, setEditSach] = useState<ISach | null>(null);
  const [search, setSearch] = useState("");

  // phân trang
  const [currentPage, setCurrentPage] = useState(1);

  // Lấy danh sách sách
  const fetchSach = async () => {
    try {
      const res = await fetch("http://localhost:3003/sach");
      const data = await res.json();
      setSachs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi lấy sách:", error);
    }
  };

  useEffect(() => {
    fetchSach();
  }, []);

  // reset trang khi search
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ẨN SÁCH
  const handleHide = async (id: number) => {
    if (!confirm("Bạn có chắc muốn ẩn sách này không?")) return;

    try {
      const res = await fetch(`http://localhost:3003/sach/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSachs(prev =>
          prev.map(s => (s.sach_id === id ? { ...s, an_hien: 0 } : s))
        );
        alert("Đã ẩn sách thành công!");
      } else {
        alert(result.message || "Lỗi khi ẩn sách");
      }
    } catch {
      alert("Không thể kết nối đến server!");
    }
  };

  // KHÔI PHỤC SÁCH
  const handleRestore = async (id: number) => {
    if (!confirm("Bạn có chắc muốn khôi phục sách này không?")) return;

    try {
      const res = await fetch(`http://localhost:3003/sach/${id}/restore`, {
        method: "PUT",
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSachs(prev =>
          prev.map(s => (s.sach_id === id ? { ...s, an_hien: 1 } : s))
        );
        alert("Đã khôi phục sách thành công!");
      } else {
        alert(result.message || "Lỗi khi khôi phục sách");
      }
    } catch {
      alert("Không thể kết nối đến server!");
    }
  };

  const handleEdit = (sach: ISach) => {
    setEditSach(sach);
    setShowModal(true);
  };

  // SEARCH
  const filteredSachs = sachs.filter((sach) => {
    const keyword = search.toLowerCase();
    return (
      sach.ten_sach?.toLowerCase().includes(keyword) ||
      sach.ten_tac_gia?.toLowerCase().includes(keyword) ||
      sach.ten_NXB?.toLowerCase().includes(keyword)
    );
  });

  // PAGINATION
  const totalPages = Math.ceil(filteredSachs.length / ITEMS_PER_PAGE);

  const paginatedSachs = filteredSachs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      {/* Header */}
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

      {/* Bảng sách */}
      {paginatedSachs.length === 0 ? (
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
                <th>ID</th>
                <th>Tên sách</th>
                <th>Tác giả</th>
                <th>Nhà XB</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Giảm giá</th>
                <th>Loại bìa</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSachs.map((sach) => (
                <tr
                  key={sach.sach_id}
                  style={{
                    opacity: sach.an_hien === 0 ? 0.6 : 1,
                    backgroundColor: sach.an_hien === 0 ? "#f8f9fa" : "white",
                  }}
                >
                  <td>
                    {sach.sach_id}
                    {sach.an_hien === 0 && (
                      <span className="badge bg-secondary ms-2">Đã ẩn</span>
                    )}
                  </td>
                  <td className="fw-semibold text-primary">{sach.ten_sach}</td>
                  <td>{sach.ten_tac_gia}</td>
                  <td>{sach.ten_NXB}</td>
                  <td className="fw-bold text-danger">
                    {Number(sach.gia_sach || 0).toLocaleString("vi-VN")}đ
                  </td>
                  <td>
                    <span className={`badge ${sach.ton_kho_sach > 0 ? "bg-success" : "bg-danger"}`}>
                      {sach.ton_kho_sach || 0}
                    </span>
                  </td>
                  <td className="text-success fw-semibold">
                    {sach.gg_sach > 0 ? Number(sach.gg_sach).toLocaleString("vi-VN") + "đ" : "-"}
                  </td>
                  <td>
                    <span className="badge bg-info">{sach.loai_bia}</span>
                  </td>
                  <td style={{ maxWidth: 220 }}>
                    {sach.mo_ta?.length > 50 ? sach.mo_ta.substring(0, 50) + "..." : sach.mo_ta}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="warning" onClick={() => handleEdit(sach)}>
                        Sửa
                      </Button>
                      {sach.an_hien === 1 || sach.an_hien === undefined ? (
                        <Button size="sm" variant="secondary" onClick={() => handleHide(sach.sach_id)}>
                          Ẩn
                        </Button>
                      ) : (
                        <Button size="sm" variant="success" onClick={() => handleRestore(sach.sach_id)}>
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

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            Trang {currentPage} / {totalPages}
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
      )}

      {/* Modal thêm / sửa */}
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
