"use client";

// Nút «Sẵn sàng bán» ở mục «Lần rao đang mở» của hồ sơ căn (hàng 23). Phần kiểm và gửi là bamSanSang (thuần); thành phần
// chỉ nối mạng, ảnh của căn và hàm gửi của trình sửa ô.
import { useMemo, useState, useSyncExternalStore } from "react";

import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { useDocPhienBan, useSuaHang } from "@/lib/sync/react";
import type { HangSua } from "../../inventory/cell-edit/lenh";
import { nguonApi } from "../photos/nguon-api";
import { bamSanSang, CHU_CAN_MANG_KIEM_ANH, type Dich, type TrangThaiNut } from "./san-sang";

function useCoMang() {
  return useSyncExternalStore(
    (f) => {
      window.addEventListener("online", f);
      window.addEventListener("offline", f);
      return () => {
        window.removeEventListener("online", f);
        window.removeEventListener("offline", f);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}

/** Neo của mục Ảnh trong hồ sơ căn — dòng «Ảnh thật» dẫn tới đây. */
export const NEO_MUC_ANH = "muc-anh";

export function NutSanSang({ hang, toa, ma, onThieu }: { hang: HangSua; toa: string; ma: string; onThieu: (dich: Dich[]) => void }) {
  const coMang = useCoMang();
  const sua = useSuaHang();
  const docPhienBan = useDocPhienBan();
  const nguon = useMemo(() => nguonApi(toa, ma), [toa, ma]);
  const [tt, setTt] = useState<TrangThaiNut>({ kind: "san" });
  const [dang, setDang] = useState(false);

  const bam = async () => {
    setDang(true);
    try {
      const kq = await bamSanSang(hang, {
        onLine: navigator.onLine,
        docAnh: () => nguon.danhSach(),
        gui: (lenh) => sua(hang.id, lenh.type, lenh.payload, docPhienBan(hang.id)),
      });
      setTt(kq);
      onThieu(kq.kind === "thieu" ? kq.thieu.map((t) => t.dich) : []);
    } finally {
      setDang(false);
    }
  };

  const canMang = !coMang || tt.kind === "can-mang";
  return (
    <div className="flex flex-col gap-2" data-slot="san-sang-ban">
      <div className="flex items-center gap-2">
        <Button size="sm" disabled={!coMang || dang} onClick={() => void bam()}>
          Sẵn sàng bán
        </Button>
        {canMang ? <span className="text-xs text-muted-foreground">{CHU_CAN_MANG_KIEM_ANH}</span> : null}
      </div>
      {tt.kind === "thieu" ? (
        <TrangThai
          kind="notice"
          title="Còn thiếu:"
          description={
            <ul className="flex flex-col gap-1">
              {tt.thieu.map((t) => (
                <li key={t.nhan}>
                  {t.dich === "anh" ? (
                    <a href={`#${NEO_MUC_ANH}`} className="underline underline-offset-2">
                      {t.nhan}
                    </a>
                  ) : (
                    <span>
                      {t.nhan} <span className="text-muted-foreground">· điền ở Bảng hàng</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          }
        />
      ) : null}
    </div>
  );
}
