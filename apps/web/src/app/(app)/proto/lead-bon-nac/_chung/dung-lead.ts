"use client";

import { useCallback, useState } from "react";

import { LEAD_MAU, type LeadMau, type Vung } from "./du-lieu-mau";

/** Kiểm số mới telesales gõ: mười chữ số, bắt đầu bằng 0 (cho gõ cách hay +84). Trả câu lỗi hay null. */
export function kiemSoMoi(raw: string): string | null {
  const so = raw.replace(/[\s.-]/g, "").replace(/^\+84/, "0");
  if (!so) return "Nhập số mới của chủ nhà.";
  if (!/^0\d{9}$/.test(so)) return "Số cần mười chữ số, bắt đầu bằng 0.";
  return null;
}

/**
 * Trạng thái của vùng «Lead đã nhập» trong bản mẫu — máy chủ giả. «Thử lại» đi qua đang tải rồi có dữ liệu; «Sửa số
 * và gửi lại» biến lead bị trả lại thành «Đã gửi lại» và thêm lead mới ở nấc Đã gửi, đang chờ chia.
 */
export function useLeadMau(vungDau: Vung) {
  const [vung, setVung] = useState<Vung>(vungDau);
  const [leads, setLeads] = useState<LeadMau[]>(vungDau === "trong" ? [] : LEAD_MAU);

  const thuLai = useCallback(() => {
    setVung("dang-tai");
    setTimeout(() => (setLeads(LEAD_MAU), setVung("co-du-lieu")), 900);
  }, []);

  const guiLai = useCallback((id: string) => {
    setLeads((ds) => {
      const cu = ds.find((l) => l.id === id);
      if (!cu) return ds;
      const so = ds.reduce((m, l) => Math.max(m, Number(l.id.slice(2))), 0) + 1;
      const moi: LeadMau = { ...cu, id: `L-${String(so).padStart(2, "0")}`, kieu: "bon-nac", dauChu: null, moc: { "da-gui": "Vừa xong" }, guiLaiTu: cu.id, traLai: undefined };
      return [moi, ...ds.map((l) => (l.id === id ? { ...l, kieu: "da-gui-lai" as const, guiLaiThanh: moi.id } : l))];
    });
  }, []);

  return { vung, leads: vung === "trong" ? [] : leads, thuLai, guiLai };
}
