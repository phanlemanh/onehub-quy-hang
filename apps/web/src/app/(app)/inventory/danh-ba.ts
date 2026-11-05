"use client";

/**
 * Danh bạ thành viên của sàn cho cột «Đầu chủ» của Bảng hàng (hàng 105): `GET /api/v1/company/member-names` — mọi vai
 * của sàn đọc được, chỉ mã và tên. Đọc khi mở bảng và khi bảng gặp một người giữ chưa có trong danh bạ (vừa gán cho người
 * mới vào sàn) — mỗi bộ người lạ một lần. Giữ bản cuối trên máy theo sàn (như danh mục) để mất mạng vẫn hiện tên; chưa có
 * bản nào thì `null`.
 *
 * Hàng 48 (Ngoài-9, Ngoài-10 của hàng 105): bản giữ trên máy mang `moi: false` — chưa đủ để kết luận «Đã rời sàn»; chỉ
 * danh bạ đọc từ máy chủ trong phiên mới `moi: true`. Đọc hỏng (máy chủ lỗi, mất mạng) không còn bị nuốt: hook trả `loi`
 * để Bảng hàng báo kèm «Thử lại»; `thuLai` đọc lại đúng một lần, không có vòng tự thử lại.
 */
import { useCallback, useEffect, useMemo, useState } from "react";

import type { DanhBaDauChu } from "./cot";

export type ThanhVien = { id: string; name: string };
const khoa = (san: string) => `qh:danh-ba:v1:${san}`;

function docBanGiu(san: string): Map<string, string> | null {
  try {
    const v = JSON.parse(window.localStorage.getItem(khoa(san)) ?? "null") as ThanhVien[] | null;
    return Array.isArray(v) ? new Map(v.map((t) => [t.id, t.name])) : null;
  } catch {
    return null;
  }
}

export type KetQuaDocDanhBa = { kind: "xong"; ds: ThanhVien[] } | { kind: "loi" };

/** Một lần đọc danh bạ từ máy chủ — phần thuần, bài kiểm trao `fetch` giả. Mọi đường hỏng đều là `loi`, không nuốt. */
export async function docDanhBa(goi: typeof fetch): Promise<KetQuaDocDanhBa> {
  try {
    const r = await goi("/api/v1/company/member-names", { credentials: "same-origin" });
    if (!r.ok) return { kind: "loi" };
    const ds = (await r.json()) as unknown;
    return Array.isArray(ds) ? { kind: "xong", ds: ds as ThanhVien[] } : { kind: "loi" };
  } catch {
    return { kind: "loi" };
  }
}

export type DanhBaBangHang = { danhBa: DanhBaDauChu; loi: boolean; thuLai: () => void };

export function useDanhBaDauChu(san: string, nguoiGiu: readonly (string | null | undefined)[]): DanhBaBangHang {
  // Bản giữ trên máy đọc lúc dựng — máy chủ không có nó, và lúc ấy bảng còn đang tải nên không lệch lúc hydrate.
  const [danhBa, setDanhBa] = useState<DanhBaDauChu>(() => {
    if (typeof window === "undefined") return null;
    const ten = docBanGiu(san);
    return ten ? { ten, moi: false } : null;
  });
  const [loi, setLoi] = useState(false);
  // Lượt đọc: tăng khi người bấm «Thử lại» — đổi thì đọc lại một lần.
  const [luot, setLuot] = useState(0);
  // Người giữ chưa có trong danh bạ máy chủ đã đọc: đổi thì đọc lại.
  const la = useMemo(
    () => [...new Set(nguoiGiu.filter((k): k is string => !!k && !(danhBa?.moi && danhBa.ten.has(k))))].sort().join(","),
    [nguoiGiu, danhBa],
  );
  const daDoc = danhBa?.moi === true;
  useEffect(() => {
    if (daDoc && !la) return;
    // Lượt trước hỏng: chỉ đọc lại khi người bấm «Thử lại» (luot đổi), không đọc theo mỗi lần dựng.
    let huy = false;
    void docDanhBa(fetch).then((kq) => {
      if (huy) return;
      if (kq.kind === "loi") {
        setLoi(true);
        return;
      }
      setLoi(false);
      setDanhBa({ ten: new Map(kq.ds.map((t) => [t.id, t.name])), moi: true });
      try {
        window.localStorage.setItem(khoa(san), JSON.stringify(kq.ds));
      } catch {
        // Không giữ được bản trên máy: lần mất mạng sau ô chờ danh bạ.
      }
    });
    return () => {
      huy = true;
    };
    // `loi` cố ý không nằm trong phụ thuộc: lượt hỏng không tự gọi lại.
  }, [san, la, daDoc, luot]);
  const thuLai = useCallback(() => {
    setLoi(false);
    setLuot((n) => n + 1);
  }, []);
  return { danhBa, loi, thuLai };
}
