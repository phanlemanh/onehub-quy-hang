"use client";

// Thân màn Cài đặt › Sàn › Cách gọi (hàng 45): một khung settings-3 (MucCaiDatKhoi) — nhóm «Tên trường» rồi nhóm «Giá
// trị riêng», mỗi ô một dòng SettingField; chân khung là «Lưu» một lượt PUT nguyên khối. Ô rỗng = mặc định của sàn
// (chữ mặc định hiện làm gợi ý). Lỗi gắn ô đi `FieldError`; lỗi máy chủ đi `TrangThai`.
import { useMemo, useState, type FormEvent } from "react";

import { MucCaiDatKhoi } from "@/components/khoi/settings-3/muc-cai-dat";
import { SettingField } from "@/components/khoi/settings-3/setting-field";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { FieldError, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { coTheLuu, loiCuaO, oBanDau, oGiaTri, oTruong, tenTruong, thanLuu, traVeMacDinh, type BoNhanMan } from "./cach-goi-thuan";

type TrangThaiLuu = { loai: "yen" } | { loai: "dang-luu" } | { loai: "da-luu" } | { loai: "loi"; cau: string };

export function CachGoi({ bo: boDau, thu = false }: { bo: BoNhanMan; /** Bản mẫu: lưu giả, không đường ghi. */ thu?: boolean }) {
  const [bo, setBo] = useState(boDau);
  const [o, setO] = useState<Record<string, string>>(() => oBanDau(boDau));
  const [luu, setLuu] = useState<TrangThaiLuu>({ loai: "yen" });
  const luuDuoc = useMemo(() => coTheLuu(o), [o]);

  const doi = (khoa: string, chu: string) => {
    setO((cu) => ({ ...cu, [khoa]: chu }));
    if (luu.loai !== "dang-luu") setLuu({ loai: "yen" });
  };
  const veMacDinh = (khoa: string) => {
    setO((cu) => traVeMacDinh(cu, khoa));
    if (luu.loai !== "dang-luu") setLuu({ loai: "yen" });
  };

  async function guiLuu(e: FormEvent) {
    e.preventDefault();
    if (!luuDuoc || luu.loai === "dang-luu") return;
    setLuu({ loai: "dang-luu" });
    const than = thanLuu(bo, o);
    if (thu) {
      setLuu({ loai: "da-luu" });
      return;
    }
    try {
      const res = await fetch("/api/v1/company/labels", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(than) });
      if (!res.ok) {
        const loi = (await res.json().catch(() => null)) as { reason?: string } | null;
        setLuu({ loai: "loi", cau: res.status === 403 ? "Chỉ quản trị sàn đổi được cách gọi." : (loi?.reason ? `Máy chủ từ chối: ${loi.reason}` : "Máy chủ chưa lưu được.") });
        return;
      }
      const moi = (await res.json()) as BoNhanMan;
      setBo(moi);
      setO(oBanDau(moi));
      setLuu({ loai: "da-luu" });
    } catch {
      setLuu({ loai: "loi", cau: "Không gửi được — kiểm tra mạng rồi lưu lại." });
    }
  }

  const dongTruong = bo.fields.map((f, i) => {
    const khoa = oTruong(f.field);
    const chu = o[khoa] ?? "";
    const loi = loiCuaO(khoa, chu);
    return (
      <SettingField key={khoa} title={f.default} description={chu.trim() ? `Mặc định «${f.default}»` : "Đang dùng tên mặc định"} labelFor={khoa} last={i === bo.fields.length - 1}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Input id={khoa} value={chu} placeholder={f.default} aria-invalid={loi ? true : undefined} onChange={(e) => doi(khoa, e.target.value)} />
            {chu.trim() ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => veMacDinh(khoa)}>
                Trả về mặc định
              </Button>
            ) : null}
          </div>
          {loi ? <FieldError>{loi}</FieldError> : null}
        </div>
      </SettingField>
    );
  });

  const dongGiaTri = bo.values.map((v, i) => {
    const khoa = oGiaTri(v.field, v.value);
    const chu = o[khoa] ?? "";
    const loi = loiCuaO(khoa, chu);
    return (
      <SettingField
        key={khoa}
        title={`${tenTruong(bo, v.field)} · ${v.default}`}
        description={`Neo vào giá trị chuẩn «${v.default}» — lọc và đếm vẫn theo giá trị chuẩn`}
        labelFor={khoa}
        last={i === bo.values.length - 1}
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Input id={khoa} value={chu} placeholder={v.default} aria-invalid={loi ? true : undefined} onChange={(e) => doi(khoa, e.target.value)} />
            {chu.trim() ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => veMacDinh(khoa)}>
                Trả về mặc định
              </Button>
            ) : null}
          </div>
          {loi ? <FieldError>{loi}</FieldError> : null}
        </div>
      </SettingField>
    );
  });

  return (
    <form onSubmit={guiLuu} onKeyDown={(e) => e.key === "Enter" && e.target instanceof HTMLInputElement && e.preventDefault()}>
      <MucCaiDatKhoi
        tieuDe="Tên của sàn"
        moTa="Tên sàn dùng cho trường và giá trị chuẩn. Để trống là dùng tên mặc định."
        chan={
          <div className="flex w-full flex-col items-end gap-3">
            {luu.loai === "loi" ? <TrangThai kind="error" title="Chưa lưu được cách gọi" description={luu.cau} className="w-full" /> : null}
            {luu.loai === "da-luu" ? <TrangThai kind="notice" title="Đã lưu cách gọi" description="Bảng hàng, bản phát hàng và trang khách dùng tên mới từ lần mở kế." className="w-full" /> : null}
            <Button type="submit" disabled={!luuDuoc || luu.loai === "dang-luu"}>
              {luu.loai === "dang-luu" ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        }
      >
        <FieldSet className="gap-0">
          <FieldLegend variant="label" className="text-muted-foreground mb-0 px-4 pt-4">
            Tên trường
          </FieldLegend>
          {dongTruong}
        </FieldSet>
        <FieldSeparator />
        <FieldSet className="gap-0">
          <FieldLegend variant="label" className="text-muted-foreground mb-0 px-4 pt-4">
            Giá trị riêng
          </FieldLegend>
          {dongGiaTri}
        </FieldSet>
      </MucCaiDatKhoi>
    </form>
  );
}
