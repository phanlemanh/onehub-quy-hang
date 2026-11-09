"use client";

// Hồ sơ căn (hàng 17): đọc kho trên máy và danh mục đã giữ; lịch sử kéo ở nền và giữ trên máy (hàng 13). Quyền là lớp phủ
// trên cùng màn (hàng 33): mô hình đọc cờ của `lopPhuHoSo` ở lõi, không rẽ theo tên vai. Phần tính dữ liệu ở `mo-hinh.ts`;
// rẽ thân theo khổ bằng đúng hàm khổ của Hôm nay điện thoại (`chonThan` → `khoCuaSo`, một mốc của kho): khổ điện thoại là
// thân điện thoại (`product-detail-5`, hồ sơ ho-so-dien-thoai-product-detail-5), máy tính là thân cột như cũ ở mọi chỗ.
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { useBoDongBo, useDanhSachHang } from "@/lib/sync/react";
import type { ListingView } from "@/lib/sync/types";
import { useCanNgoaiKhu, useDanhMuc } from "../../inventory/danh-muc";
import { useTuVung } from "../../inventory/tu-vung";
import { ngheKho } from "../../today/mobile/kho";
import { type Dich } from "../ready/san-sang";
import { NutSanSang } from "../ready/nut-san-sang";
import { ThanDienThoaiCan } from "./dien-thoai/than-dien-thoai";
import { cacLanRao, laChonHang, timCan, timHang, type ChonCan, type ChonCot } from "./ho-so";
import { chonThan, moHinhHoSo, type ChoHoSo, type Than } from "./mo-hinh";
import { OMaCan } from "./o-ma-can";
import { ThanCot, type KheHoSo } from "./than-cot";

/** Trình duyệt báo ngoại tuyến — lượt kéo chưa chạy thì `lastAttempt` chưa biết mất mạng. */
function useNgoaiTuyen() {
  return useSyncExternalStore(
    (f) => {
      window.addEventListener("online", f);
      window.addEventListener("offline", f);
      return () => {
        window.removeEventListener("online", f);
        window.removeEventListener("offline", f);
      };
    },
    () => !navigator.onLine,
    () => false,
  );
}

/** Thân theo khổ: nghe đổi qua mốc của kho (`ngheKho`), đọc bằng `chonThan`. Máy chủ dựng thân cột như `useDienThoai`. */
function useThan(cho: ChoHoSo): Than {
  return useSyncExternalStore(
    (f) => ngheKho(window, f),
    () => chonThan(window, cho),
    () => "cot",
  );
}

export type HoSoProps = {
  nguoi: string;
  san: string;
  /** Theo căn (`?unit=`), hay theo hàng (`?hang=`) cho hàng chưa có mã căn (ADR-0026). */
  chon: ChonCot;
  /** Đường đóng cột (về Bảng hàng); toàn màn không có. */
  dongHref?: string;
  /** Dựng đường cho một lần chọn khác: chọn toà khi mã trùng, chọn lần rao. */
  duong: (c: ChonCan) => string;
  /** Chỗ mở hồ sơ — quyết thân cùng khổ màn; vắng là toàn màn. */
  cho?: ChoHoSo;
};

/**
 * Hồ sơ theo căn hay theo hàng. Hàng của `?hang=` đã có mã (vừa gắn, hay mở link cũ) thì là hồ sơ theo căn; máy chủ đã
 * nhận mã (không còn lệnh chờ gửi của hàng) thì địa chỉ sang `?unit=` để link chép mở đúng căn.
 */
export function CotHoSo(props: HoSoProps) {
  const { bd } = useBoDongBo();
  const ds = useDanhSachHang();
  const { chon, duong } = props;
  const theoHang = laChonHang(chon) ? timHang(ds, chon.hang) : null;
  const choGui = theoHang?.kind === "co-ma" && bd.ngan().queue.some((o) => o.listingId === theoHang.chon.lan);
  const sang = theoHang?.kind === "co-ma" && !choGui ? duong(theoHang.chon) : null;
  useEffect(() => {
    if (sang) window.history.replaceState(null, "", sang);
  }, [sang]);
  if (!laChonHang(chon)) return <HoSoCan {...props} chon={chon} />;
  if (theoHang?.kind === "co-ma") return <HoSoCan {...props} chon={theoHang.chon} />;
  // Hàng không toà (lô, ngoài khu — hàng 79): hồ sơ theo hàng, mã của nó là tên hồ sơ.
  if (theoHang?.kind === "khong-toa") return <HoSoCan {...props} chon={{ ma: theoHang.hang.unitNumber ?? "", toa: null, lan: chon.hang }} khongToa={theoHang.hang} />;
  return <HoSoCan {...props} chon={{ ma: "", toa: null, lan: chon.hang }} chuaMa={theoHang?.kind === "chua-ma" ? theoHang.hang : null} />;
}

function HoSoCan({ nguoi, san, chon, dongHref, duong, chuaMa, khongToa, cho = "toan-man" }: Omit<HoSoProps, "chon"> & { chon: ChonCan; chuaMa?: ListingView | null; khongToa?: ListingView | null }) {
  const { bd, vai } = useBoDongBo();
  const ds = useDanhSachHang();
  const ngan = bd.ngan();
  const ngoaiTuyen = useNgoaiTuyen();
  const danhMuc = useDanhMuc(san);
  const ngoaiKhu = useCanNgoaiKhu(san);
  const than = useThan(cho);
  const tv = useTuVung();
  // Mọi lần rao của căn (để kéo lịch sử ở nền) — cùng luật tìm của mô hình.
  const ids = useMemo(() => {
    if (khongToa) return khongToa.id;
    if (chuaMa) return chuaMa.id;
    if (chuaMa === null) return "";
    const tim = timCan(ds, chon.ma, chon.toa);
    return tim.kind === "mot" ? cacLanRao(ds, tim.toa, chon.ma, {}).map((r) => r.id).join(",") : "";
  }, [ds, chon.ma, chon.toa, chuaMa, khongToa]);

  // Kéo lịch sử mọi lần rao của căn ở nền (thường một, hai lần): lần rao xếp theo lúc tạo, lịch sử của lần đang xem.
  // Lần rao đã có lượt kéo xong (thành hay không): chưa có thì phần lịch sử đang tải.
  const [daKeo, setDaKeo] = useState<Record<string, true>>({});
  // Điều còn thiếu sau lần bấm «Sẵn sàng bán» gần nhất (hàng 23) — đánh dấu «Chưa có» đúng ô.
  // Kết quả «Sẵn sàng bán» gắn với lần rao đã bấm: đổi lần rao thì không mang dấu «Chưa có» sang (va-san-sang-ban).
  const [thieuCua, setThieuCua] = useState<{ id: string; dich: readonly Dich[] } | null>(null);
  const baoThieu = useCallback((id: string, dich: readonly Dich[]) => setThieuCua({ id, dich }), []);
  useEffect(() => {
    let huy = false;
    for (const id of ids ? ids.split(",") : []) {
      void bd.taiLichSu(id).finally(() => {
        if (!huy) setDaKeo((m) => ({ ...m, [id]: true }));
      });
    }
    return () => {
      huy = true;
    };
  }, [bd, ids]);

  const m = moHinhHoSo({ nguoi, vai, ds, ngan, danhMuc, chon, chuaMa, khongToa, ngoaiKhu, tv, daKeo, thieuCua, ngoaiTuyen, dongHref, duong });
  // Nút cần bộ đồng bộ dựng ở đây rồi trao vào khe của thân: «Sẵn sàng bán» nằm trong mục «Lần rao đang mở» của thân.
  let khe: KheHoSo = { sanSang: null, oMa: null };
  if (m.kind === "co") {
    const { can, chuaMa: hang } = m;
    khe = {
      sanSang: m.hienSanSang ? <NutSanSang key={can.id} hang={can} toa={m.toa} ma={m.ma} onThieu={baoThieu} /> : null,
      oMa: hang ? <OMaCan key={hang.id} hang={hang} danhMuc={danhMuc} moHangKia={m.moHangKia} /> : null,
    };
  }
  const hd = { thuNgay: () => void bd.thuNgay(), taiLichSu: (id: string) => void bd.taiLichSu(id) };
  return than === "dien-thoai" ? <ThanDienThoaiCan m={m} khe={khe} hd={hd} /> : <ThanCot m={m} khe={khe} hd={hd} />;
}
