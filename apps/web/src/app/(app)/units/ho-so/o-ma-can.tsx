"use client";

// Ô «Mã căn» của hàng chưa có mã (ADR-0026): gõ mã một lần, lưu qua hàng đợi trên máy như mọi lần sửa. Máy chủ từ chối
// thì hàng về chưa mã và lệnh vào «Cần xem» — ô đọc lại lý do từ đó, giữ chữ đã gõ. Ghép Field + Input + Button như các ô
// sửa khác của kho (bản bấm được ở Cổng Phạm vi, Hỏi-4).
import type { CatalogData } from "@quy-hang/core";
import { useId, useState, type KeyboardEvent } from "react";

import { Badge } from "@/components/reui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useBoDongBo, useCanXem, useSuaHang } from "@/lib/sync/react";
import type { ListingView } from "@/lib/sync/types";
import { moTaLoi } from "../../inventory/cell-edit/lenh";
import { dungLenhGanMa, ID_O_MA_CAN } from "./ho-so";

const chuan = (s: string) => s.trim().toLowerCase();

/** Mã căn của toà trong danh mục đã giữ trên máy — gợi ý, không giới hạn (mã ngoài danh mục vẫn lưu được, Hỏi-2). */
function maCuaToa(dm: CatalogData | null, toa: string): string[] {
  for (const khu of dm?.subdivisions ?? []) for (const b of khu.buildings) if (chuan(b.buildingName) === chuan(toa)) return b.units.map((u) => u.unitNumber);
  return [];
}

export function OMaCan({ hang, danhMuc, moHangKia }: { hang: ListingView; danhMuc: CatalogData | null; moHangKia: (id: string) => string | null }) {
  const { bd } = useBoDongBo();
  const sua = useSuaHang();
  const canXem = useCanXem();
  // Lần gắn trước bị máy chủ từ chối: lý do và chữ đã gõ nằm ở mục «Cần xem» của hàng.
  const tuChoi = canXem.find((r) => r.listingId === hang.id && r.kind === "tu-choi" && r.mine.some((o) => o.type === "unit_number_assigned"));
  const daGo = tuChoi?.mine.find((o) => o.type === "unit_number_assigned")?.payload.unitNumber;
  const [chu, setChu] = useState(typeof daGo === "string" ? daGo : "");
  const [loi, setLoi] = useState<string | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const goiY = maCuaToa(danhMuc, hang.buildingName ?? "");
  const idGoiY = useId();

  const loiHien = loi ?? tuChoi?.reason ?? null;
  const kia = loi ? null : tuChoi?.conflictListingId ? moHangKia(tuChoi.conflictListingId) : null;

  const luu = async () => {
    const kq = dungLenhGanMa(hang, chu);
    if ("loi" in kq) {
      setLoi(kq.loi);
      return;
    }
    setDangLuu(true);
    try {
      // Lần gắn mới thay lần đã bị từ chối: bỏ mục «Cần xem» cũ để lệnh mới không bị giữ lại sau nó.
      if (tuChoi) await bd.boThayDoi(hang.id);
      const r = await sua(hang.id, kq.lenh.type, kq.lenh.payload, kq.lenh.coSo);
      setLoi(r.ok ? null : moTaLoi(r.loi));
    } finally {
      setDangLuu(false);
    }
  };
  const phim = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") void luu();
    if (e.key === "Escape") {
      setChu("");
      setLoi(null);
    }
  };

  return (
    <Field data-invalid={loiHien ? true : undefined} data-slot="o-ma-can">
      <FieldLabel htmlFor={ID_O_MA_CAN} className="flex items-center gap-2">
        Mã căn <Badge variant="warning-light">Chưa có</Badge>
      </FieldLabel>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={ID_O_MA_CAN}
          list={goiY.length ? idGoiY : undefined}
          value={chu}
          placeholder="VD A-12.07"
          autoComplete="off"
          disabled={dangLuu}
          aria-invalid={loiHien ? true : undefined}
          onChange={(e) => {
            setChu(e.target.value);
            setLoi(null);
          }}
          onKeyDown={phim}
        />
        <Button disabled={dangLuu} onClick={() => void luu()}>
          {dangLuu ? "Đang lưu…" : "Lưu mã căn"}
        </Button>
      </div>
      {goiY.length ? (
        <datalist id={idGoiY}>
          {goiY.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      ) : null}
      {loiHien ? (
        <FieldError>
          {loiHien}
          {kia ? (
            <>
              {" · "}
              <a href={kia} className="underline underline-offset-2">
                Mở hàng kia
              </a>
            </>
          ) : null}
        </FieldError>
      ) : (
        <FieldDescription>
          {goiY.length ? `Gợi ý theo danh mục ${hang.buildingName}. ` : ""}Mã ngoài danh mục vẫn lưu được. Gắn rồi thì khoá.
        </FieldDescription>
      )}
    </Field>
  );
}
