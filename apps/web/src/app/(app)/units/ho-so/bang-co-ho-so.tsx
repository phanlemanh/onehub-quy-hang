"use client";

// Bảng hàng kèm hồ sơ căn đang mở (`/inventory?unit=<mã>&toa=<toà>&lan=<lần rao>`, Tham chiếu §routes): bấm dòng mở cột
// phải, bảng vẫn dùng được. Nhóm panel luôn dựng để bảng không dựng lại (mất lọc, cuộn) khi cột mở hay đóng.
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, type ReactNode } from "react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
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

export function BangCoHoSo({ nguoi, san, vai, tenSan }: { nguoi: string; san: string; vai?: readonly string[]; tenSan?: string }) {
  const { chon: chonUrl, path, qs, duong, dongHref } = useCotTheoUrl();
  const chon = useIsMobile() ? null : chonUrl;

  const moCan = useCallback(
    (d: DongBang) => {
      // Chỉ đổi URL — không điều hướng của Next, mất mạng vẫn đổi được căn (lượt 1 S4). Hàng chưa có mã căn mở theo hàng.
      window.history.replaceState(null, "", `${path}?${moHang(new URLSearchParams(qs), d)}`);
    },
    [path, qs],
  );

  return (
    <ResizablePanelGroup orientation="horizontal" id="bang-co-ho-so">
      <ResizablePanel id="bang" minSize="35%">
        <BangHang nguoi={nguoi} san={san} dangMo={chon ? (laChonHang(chon) ? chon.hang : chon.lan) : null} onMoCan={moCan} vai={vai} tenSan={tenSan} />
      </ResizablePanel>
      {chon ? (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel id="ho-so" defaultSize="38%" minSize="28%">
            <KhungHoSoCan cot>
              <CotHoSo nguoi={nguoi} san={san} chon={chon} dongHref={dongHref} duong={duong} />
            </KhungHoSoCan>
          </ResizablePanel>
        </>
      ) : null}
    </ResizablePanelGroup>
  );
}
