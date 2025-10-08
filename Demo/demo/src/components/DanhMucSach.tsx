"use client";

import { useEffect, useState } from "react";

interface DanhMuc {
  id: number;
  ten_danh_muc: string;
  mo_ta: string;
}

export default function DanhMucSach() {
  const [danhMuc, setDanhMuc] = useState<DanhMuc[]>([]);

  useEffect(() => {
    fetch("/api/danhmuc")
      .then((res) => res.json())
      .then((data) => setDanhMuc(data))
      .catch((err) => console.error("Lỗi khi tải danh mục:", err));
  }, []);

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-3 text-primary">📚 Danh mục sách</h3>
      <div className="row">
        {danhMuc.map((item) => (
          <div key={item.id} className="col-md-4 mb-3">
            <div className="border rounded p-3 shadow-sm bg-light">
              <h5 className="mb-2">{item.ten_danh_muc}</h5>
              <p className="text-muted">{item.mo_ta}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
