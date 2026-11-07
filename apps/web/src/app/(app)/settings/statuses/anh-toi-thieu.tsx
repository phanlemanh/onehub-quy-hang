"use client";

// Ô «Số ảnh thật tối thiểu» ở Cài đặt › Sàn › Trạng thái (anh-khong-chan-ban, AC-8): chuyển thể settings-3 (MucCaiDatKhoi +
// SettingField) như mục Thuế phí; ô số ReUI, «Lưu» một lượt PATCH lối chung. Máy chủ kiểm khoảng lần nữa.
import { useState } from "react";

import { MucCaiDatKhoi } from "@/components/khoi/settings-3/muc-cai-dat";
import { SettingField } from "@/components/khoi/settings-3/setting-field";
import { NumberField, NumberFieldDecrement, NumberFieldGroup, NumberFieldIncrement, NumberFieldInput } from "@/components/reui/number-field";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { CAU_NGHIA, loiToiThieu, NHAN_O, thanLuuToiThieu, TOI_THIEU_LON, TOI_THIEU_NHO } from "./anh-toi-thieu-thuan";

type Luu = { loai: "yen" } | { loai: "dang-luu" } | { loai: "da-luu" } | { loai: "loi"; cau: string };

export function AnhToiThieu({ dau }: { dau: number }) {
  const [n, setN] = useState<number | null>(dau);
  const [luu, setLuu] = useState<Luu>({ loai: "yen" });
  const loi = loiToiThieu(n);

  const bamLuu = async () => {
    if (n === null || loi) {
      setLuu({ loai: "loi", cau: loi ?? `Cần số nguyên ${TOI_THIEU_NHO}–${TOI_THIEU_LON}` });
      return;
    }
    setLuu({ loai: "dang-luu" });
    try {
      const r = await fetch("/api/v1/company/settings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(thanLuuToiThieu(n)) });
      if (r.ok) return setLuu({ loai: "da-luu" });
      const than = (await r.json().catch(() => null)) as { reason?: string } | null;
      setLuu({ loai: "loi", cau: than?.reason ? `Chưa lưu được: ${than.reason}` : "Chưa lưu được — thử lại." });
    } catch {
      setLuu({ loai: "loi", cau: "Chưa lưu được — kiểm tra mạng rồi thử lại." });
    }
  };

  const dangLuu = luu.loai === "dang-luu";
  return (
    <MucCaiDatKhoi
      tieuDe="Lên Đang bán"
      chan={
        <Button onClick={() => void bamLuu()} disabled={dangLuu}>
          {dangLuu ? <Spinner data-icon="inline-start" /> : null}
          Lưu
        </Button>
      }
    >
      <SettingField title={NHAN_O} description={CAU_NGHIA} labelFor="anh-toi-thieu" last>
        <div className="flex flex-col gap-2" data-o-anh-toi-thieu="">
          <NumberField
            id="anh-toi-thieu"
            value={n}
            onValueChange={(v) => {
              setN(v);
              setLuu({ loai: "yen" });
            }}
            min={TOI_THIEU_NHO}
            max={TOI_THIEU_LON}
            step={1}
            locale="vi-VN"
            disabled={dangLuu}
            aria-label={NHAN_O}
          >
            <NumberFieldGroup>
              <NumberFieldDecrement />
              <NumberFieldInput aria-invalid={loi ? true : undefined} />
              <NumberFieldIncrement />
            </NumberFieldGroup>
          </NumberField>
          {luu.loai === "da-luu" ? <TrangThai kind="notice" title="Đã lưu" description="Áp từ lần đổi trạng thái kế." /> : null}
          {luu.loai === "loi" ? <TrangThai kind="error" title={luu.cau} /> : null}
        </div>
      </SettingField>
    </MucCaiDatKhoi>
  );
}
