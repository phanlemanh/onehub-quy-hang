"use client";
// Thân màn Cài đặt › Sàn › Trang môi giới (hàng 44): một khung settings-3 (MucCaiDatKhoi) với hai dòng SettingField — mức
// chia mặc định và công tắc ẩn — rồi «Lưu» một lượt PATCH /api/v1/company/settings. Lý do máy chủ từ chối hiện dưới ô.
import { useState, type FormEvent } from "react";
import { MucCaiDatKhoi } from "@/components/khoi/settings-3/muc-cai-dat";
import { SettingField } from "@/components/khoi/settings-3/setting-field";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CHU_CAI_DAT, docO, thanLuu, type CaiDatMoiGioi } from "./thuan";

type Luu = { loai: "yen" } | { loai: "dang-luu" } | { loai: "da-luu" } | { loai: "loi"; cau: string };

export function VungMoiGioi({ dau }: { dau: CaiDatMoiGioi }) {
  const [chu, setChu] = useState(dau.muc == null ? "" : String(dau.muc));
  const [an, setAn] = useState(dau.an);
  const [luu, setLuu] = useState<Luu>({ loai: "yen" });
  const [loiMay, setLoiMay] = useState<string | null>(null);
  const muc = docO(chu);
  const loiO = muc === "sai" ? CHU_CAI_DAT.loiMuc : loiMay;

  async function guiLuu(e: FormEvent) {
    e.preventDefault();
    if (muc === "sai") return;
    setLuu({ loai: "dang-luu" });
    setLoiMay(null);
    try {
      const r = await fetch("/api/v1/company/settings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(thanLuu(muc, an)) });
      if (r.status === 200) return setLuu({ loai: "da-luu" });
      const ly = ((await r.json().catch(() => null)) as { reason?: string } | null)?.reason;
      if (r.status === 400 && ly) {
        setLoiMay(ly);
        return setLuu({ loai: "yen" });
      }
      setLuu({ loai: "loi", cau: r.status === 403 ? "Chỉ Quản trị sàn đổi được cài đặt này" : "Thử lại sau ít phút" });
    } catch {
      setLuu({ loai: "loi", cau: "Lưu cần mạng — thử lại" });
    }
  }

  return (
    <form onSubmit={guiLuu}>
      <MucCaiDatKhoi
        tieuDe={CHU_CAI_DAT.tieuDe}
        moTa={CHU_CAI_DAT.moTa}
        chan={
          <div className="flex w-full flex-col items-end gap-3">
            {luu.loai === "loi" ? <TrangThai kind="error" title={CHU_CAI_DAT.chuaLuu} description={luu.cau} className="w-full" /> : null}
            {luu.loai === "da-luu" ? <TrangThai kind="notice" title={CHU_CAI_DAT.daLuu} description="Lần gửi mới mang mức chia này; bộ đã gửi giữ mức lúc gửi." className="w-full" /> : null}
            <Button type="submit" disabled={muc === "sai" || luu.loai === "dang-luu"}>
              {luu.loai === "dang-luu" ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        }
      >
        <SettingField title="Mức chia mặc định (%)" description="Phần trăm phí môi giới chia cho bên môi giới sàn khác. Để trống nếu không chia." labelFor="muc-chia">
          <div className="flex flex-col gap-1.5">
            <Input id="muc-chia" inputMode="decimal" value={chu} placeholder="Trống" aria-invalid={loiO ? true : undefined} onChange={(e) => (setChu(e.target.value), setLoiMay(null))} />
            {loiO ? <FieldError>{loiO}</FieldError> : null}
          </div>
        </SettingField>
        <SettingField title="Ẩn mức chia" description="Trang nhóm môi giới, tệp Excel và ảnh không hiện mức chia." labelFor="an-muc-chia" last>
          <Switch id="an-muc-chia" checked={an} onCheckedChange={(v) => setAn(Boolean(v))} />
        </SettingField>
      </MucCaiDatKhoi>
    </form>
  );
}
