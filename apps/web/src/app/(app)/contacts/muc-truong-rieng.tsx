"use client";

// Mục «Trường riêng» của hồ sơ liên hệ (hàng 47): mỗi trường áp cho loại người này một dòng, chọn là lưu; lưu hỏng thì về
// giá trị cũ kèm câu báo. Không trường nào áp → không hiện mục.
import { useEffect, useState } from "react";
import type { TruongRieng } from "@quy-hang/core/custom-fields";

import { MucHoSo } from "@/components/khoi/solution-crm-4/ho-so";
import { TrangThai } from "@/components/trang-thai";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { CHUA_GHI, chuMucTruong, docBoTruong, ghiTruong, luaChonMuc, truongCuaNguoi } from "./truong-rieng";

export function MucTruongRieng({ contactId, contactTypes, custom }: { contactId: string; contactTypes: string[]; custom: Record<string, unknown> }) {
  const [bo, setBo] = useState<TruongRieng[] | null>(null);
  const [gia, setGia] = useState<Record<string, unknown>>(custom);
  const [loi, setLoi] = useState(false);
  useEffect(() => {
    let song = true;
    void docBoTruong().then((b) => song && setBo(b));
    return () => {
      song = false;
    };
  }, []);
  const ds = bo ? truongCuaNguoi(bo, contactTypes) : [];
  if (!ds.length) return null;

  const chon = async (t: TruongRieng, khoa: string | null) => {
    const lc = luaChonMuc(t).find((x) => x.khoa === khoa);
    const v = khoa === "__bo" ? null : (lc?.value ?? null);
    const cu = gia;
    setGia((g) => {
      const m = { ...g };
      if (v === null) delete m[t.code];
      else m[t.code] = v;
      return m;
    });
    setLoi(false);
    const moi = await ghiTruong(contactId, t.code, v);
    if (moi) setGia(moi);
    else {
      setGia(cu);
      setLoi(true);
    }
  };

  return (
    <MucHoSo tieuDe="Trường riêng">
      <ul className="flex flex-col gap-2">
        {ds.map((t) => {
          const v = gia[t.code];
          const khoa = v === undefined ? null : String(v);
          // Ô hiện chữ của lựa chọn (bảng `items`), không mã thô — «Sáng», không «sang».
          const items = [...luaChonMuc(t).map((c) => ({ value: c.khoa, label: c.label })), { value: "__bo", label: "Bỏ trống" }];
          return (
            <li key={t.code} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground shrink-0">{t.label}</span>
              <Select items={items} value={khoa} onValueChange={(k) => void chon(t, (k as string | null) ?? null)}>
                <SelectTrigger aria-label={t.label} className="w-44">
                  <SelectValue>{khoa === null ? <span className="text-muted-foreground">{CHUA_GHI}</span> : chuMucTruong(t, v)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {luaChonMuc(t).map((c) => (
                    <SelectItem key={c.khoa} value={c.khoa}>
                      {c.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="__bo">Bỏ trống</SelectItem>
                </SelectContent>
              </Select>
            </li>
          );
        })}
      </ul>
      {loi ? <TrangThai kind="error" title="Chưa lưu được trường riêng" description="Giá trị về như cũ — thử lại." /> : null}
    </MucHoSo>
  );
}
