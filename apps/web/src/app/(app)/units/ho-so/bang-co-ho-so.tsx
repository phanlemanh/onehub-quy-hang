"use client";

// Bảng hàng kèm hồ sơ căn đang mở (`/inventory?unit=<mã>&toa=<toà>&lan=<lần rao>`, Tham chiếu §routes): bấm dòng mở hồ sơ
// ở cột kéo chia của bố cục «Danh sách – chi tiết» (ADR-0024 sửa đổi 05/11, hàng 105), bảng vẫn dùng được. Khuôn
// `KhungBangHang` dựng bố cục và cột qua `useHoSoCanhBang`; bảng trong khe của khuôn đọc dòng đang mở qua `BangCoHoSoCtx`.
// Nhóm panel của bố cục luôn dựng nên bảng không dựng lại (giữ lọc, nhóm, cuộn) khi cột mở, đổi căn hay đóng.
import { usePathname, useSearchParams } from "next/navigation";
import { Component, createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DongBang } from "../../inventory/cot";
import { BangHang } from "../../inventory/bang-hang";
import { CotHoSo } from "./cot-ho-so";
import { docCot, dongCot, laChonHang, moHang, type ChonCan } from "./ho-so";
import { KhungHoSoCan } from "./khung";

/** Cột đang mở theo URL và đường chọn căn khác — Bảng hàng trên máy tính và hồ sơ toàn màn trên điện thoại dùng chung. */
function useCotTheoUrl() {
  const q = useSearchParams();
  const path = usePathname();
  const qs = q.toString();
  const duong = useCallback(
    (c: ChonCan) => {
      const m = new URLSearchParams(dongCot(new URLSearchParams(qs)));
      m.set("unit", c.ma);
      if (c.toa) m.set("toa", c.toa);
      if (c.lan) m.set("lan", c.lan);
      return `${path}?${m}`;
    },
    [path, qs],
  );
  const dong = dongCot(new URLSearchParams(qs));
  return { chon: docCot(new URLSearchParams(qs)), path, qs, duong, dongHref: dong ? `${path}?${dong}` : path };
}

/**
 * Điện thoại (dưới `md`): có hồ sơ đang mở theo URL thì hồ sơ toàn màn, như `/units/<mã>`; lối của hàng chưa có mã căn
 * từ Hôm nay tới đây (ADR-0026). Không có thì trả `bao` — bảng thẻ của mục 32 (`inventory/cards/bang-the.tsx`) trao `null`
 * và tự dựng bảng thẻ bên cạnh.
 */
export function HoSoDienThoai({ nguoi, san, bao }: { nguoi: string; san: string; bao: ReactNode }) {
  const { chon, duong, dongHref } = useCotTheoUrl();
  // Chỉ dựng một hồ sơ mỗi khổ màn: ô mã căn mang id cố định, «Mã căn» trong «Còn thiếu» đưa con trỏ tới đó.
  const dienThoai = useIsMobile();
  if (!chon || !dienThoai) return bao;
  return (
    <KhungHoSoCan nhung>
      <CotHoSo nguoi={nguoi} san={san} chon={chon} dongHref={dongHref} duong={duong} />
    </KhungHoSoCan>
  );
}

/** Dòng đang mở và việc bấm dòng — khuôn Bảng hàng trao cho bảng trong khe của nó. */
type BangCot = { dangMo: string | null; moCan: (d: DongBang) => void };
export const BangCoHoSoCtx = createContext<BangCot | null>(null);

/**
 * Hồ sơ lỗi khi dựng thì chỉ cột báo lỗi kèm «Thử lại», bảng bên cạnh vẫn dùng được (AC-10 hàng 105). Đổi căn thì cột
 * dựng lại từ đầu (khoá theo căn ở chỗ gọi).
 */
class ChanLoiCot extends Component<{ children: ReactNode }, { loi: boolean }> {
  override state = { loi: false };
  static getDerivedStateFromError() {
    return { loi: true };
  }
  override render() {
    if (!this.state.loi) return this.props.children;
    return (
      <div className="p-4">
        <TrangThai
          kind="error"
          title="Không mở được hồ sơ căn"
          description="Bảng hàng vẫn dùng được."
          hanhDong={
            <Button type="button" variant="outline" size="sm" onClick={() => this.setState({ loi: false })}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }
}

/**
 * Hồ sơ cạnh Bảng hàng trên máy tính: cột phụ của bố cục khi URL mở một căn, và dòng đang mở cho bảng. Không trao `hoSo`
 * (góc nhìn đã lưu) hay trên điện thoại thì không có cột — điện thoại mở hồ sơ toàn màn ở khe của nó.
 */
export function useHoSoCanhBang(hoSo: { nguoi: string; san: string } | undefined) {
  const { chon: chonUrl, path, qs, duong, dongHref } = useCotTheoUrl();
  const dienThoai = useIsMobile();
  const nguoi = hoSo?.nguoi;
  const san = hoSo?.san;
  const chon = nguoi && san && !dienThoai ? chonUrl : null;

  const moCan = useCallback(
    (d: DongBang) => {
      // Chỉ đổi URL — không điều hướng của Next, mất mạng vẫn đổi được căn (lượt 1 S4). Hàng chưa có mã căn mở theo hàng.
      window.history.replaceState(null, "", `${path}?${moHang(new URLSearchParams(qs), d)}`);
    },
    [path, qs],
  );
  const dangMo = chon ? (laChonHang(chon) ? chon.hang : chon.lan) : null;
  const ctx = useMemo(() => (nguoi ? { dangMo, moCan } : null), [nguoi, dangMo, moCan]);
  const khoaCan = chon ? (laChonHang(chon) ? `hang:${chon.hang}` : `can:${chon.toa ?? ""}:${chon.ma}`) : "";
  const cotPhu =
    chon && nguoi && san ? (
      <KhungHoSoCan cotPhu>
        <ChanLoiCot key={khoaCan}>
          <CotHoSo nguoi={nguoi} san={san} chon={chon} dongHref={dongHref} duong={duong} />
        </ChanLoiCot>
      </KhungHoSoCan>
    ) : null;
  return { mo: chon !== null, cotPhu, ctx };
}

/** Bảng hàng trong khe của khuôn: dòng đang mở được đánh dấu, bấm dòng căn thì mở hồ sơ ở cột cạnh bên. */
export function BangCoHoSo({ nguoi, san, vai, tenSan }: { nguoi: string; san: string; vai?: readonly string[]; tenSan?: string }) {
  const c = useContext(BangCoHoSoCtx);
  return <BangHang nguoi={nguoi} san={san} dangMo={c?.dangMo ?? null} onMoCan={c?.moCan} vai={vai} tenSan={tenSan} />;
}
