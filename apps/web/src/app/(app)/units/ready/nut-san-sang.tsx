"use client";

// Nút «Sẵn sàng bán» ở mục «Lần rao đang mở» của hồ sơ căn (hàng 23). Phần kiểm và gửi là bamSanSang (thuần); thành phần
// chỉ nối mạng, ảnh của căn và hàm gửi của trình sửa ô.
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { useDocPhienBan, useSuaHang } from "@/lib/sync/react";
import type { HangSua } from "../../inventory/cell-edit/lenh";
import { nguonApi } from "../photos/nguon-api";
import { bamSanSang, CHU_ANH_CAP_NHAT, CHU_CAN_MANG_KIEM_ANH, docToiThieuSan, NEO_MA_CAN, thieuHienTai, type Dich, type TrangThaiNut } from "./san-sang";

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

export function NutSanSang({ hang, toa, ma, onThieu }: { hang: HangSua; toa: string; ma: string; onThieu: (id: string, dich: Dich[]) => void }) {
  const coMang = useCoMang();
  const sua = useSuaHang();
  const docPhienBan = useDocPhienBan();
  // Hàng chưa có mã căn (ADR-0026) không có ảnh để đếm — ảnh gắn theo toà + mã; lõi chỉ báo «Mã căn».
  const nguon = useMemo(() => (ma ? nguonApi(toa, ma) : null), [toa, ma]);
  const [tt, setTt] = useState<TrangThaiNut>({ kind: "san" });
  const [dang, setDang] = useState(false);
  // Số ảnh tối thiểu của sàn (anh-khong-chan-ban): 0 thì không đếm ảnh, mất mạng vẫn bấm được; chưa đọc xong coi như 0.
  const [toiThieu, setToiThieu] = useState(0);
  useEffect(() => {
    let con = true;
    void docToiThieuSan().then((n) => con && setToiThieu(n));
    return () => {
      con = false;
    };
  }, []);

  const bam = async () => {
    setDang(true);
    try {
      const kq = await bamSanSang(hang, {
        onLine: navigator.onLine,
        docAnh: () => (nguon ? nguon.danhSach() : Promise.resolve({ anh: [] })),
        gui: (lenh) => sua(hang.id, lenh.type, lenh.payload, docPhienBan(hang.id)),
        toiThieu,
      });
      setTt(kq);
    } finally {
      setDang(false);
    }
  };

  // Danh sách tính lại từ hàng đang xem mỗi lần vẽ: điền xong điều nào thì điều đó rời ngay, không tự gửi khi đủ.
  const thieu = thieuHienTai(tt, hang);
  const khoaDich = thieu.map((t) => t.dich).join(",");
  const id = hang.id;
  useEffect(() => {
    onThieu(id, khoaDich ? (khoaDich.split(",") as Dich[]) : []);
  }, [id, khoaDich, onThieu]);
  // Nút gỡ ra (lần rao lên Đang bán, đổi lần rao) thì dấu «Chưa có» của lần rao ấy không còn.
  useEffect(() => () => onThieu(id, []), [id, onThieu]);

  const canMang = (toiThieu > 0 && !coMang) || tt.kind === "can-mang";
  return (
    <div className="flex flex-col gap-2" data-slot="san-sang-ban">
      <div className="flex items-center gap-2">
        <Button size="sm" disabled={(toiThieu > 0 && !coMang) || dang} onClick={() => void bam()}>
          Sẵn sàng bán
        </Button>
        {canMang ? <span className="text-xs text-muted-foreground">{CHU_CAN_MANG_KIEM_ANH}</span> : null}
      </div>
      {tt.kind === "loi" ? <TrangThai kind="error" title="Chưa gửi được:" description={tt.chu} /> : null}
      {thieu.length ? (
        <TrangThai
          kind="notice"
          title="Còn thiếu:"
          description={
            <ul className="flex flex-col gap-1">
              {thieu.map((t) => (
                <li key={t.nhan}>
                  {t.dich === "anh" ? (
                    <a href={`#${NEO_MUC_ANH}`} className="underline underline-offset-2">
                      {t.nhan}
                    </a>
                  ) : t.dich === "ma" ? (
                    <a
                      href={NEO_MA_CAN}
                      onClick={(e) => {
                        e.preventDefault();
                        document.querySelector<HTMLInputElement>(NEO_MA_CAN)?.focus();
                      }}
                      className="underline underline-offset-2"
                    >
                      {t.nhan}
                    </a>
                  ) : (
                    <span>
                      {t.nhan} <span className="text-muted-foreground">· điền ở Bảng hàng</span>
                    </span>
                  )}
                </li>
              ))}
              {thieu.some((t) => t.dich === "anh") ? <li className="text-muted-foreground">{CHU_ANH_CAP_NHAT}</li> : null}
            </ul>
          }
        />
      ) : null}
    </div>
  );
}
