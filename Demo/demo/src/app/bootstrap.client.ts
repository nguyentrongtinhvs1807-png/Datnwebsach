"use client";

import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js")
      .then(() => {
        console.log("✅ Bootstrap JS loaded thành công");
      })
      .catch((err) => console.error("❌ Lỗi load Bootstrap:", err));
  }, []);

  return null;
}
