"use client";

import type { ReactNode } from "react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";

import { NganNoi } from "./ngan-noi";

// Danh sách – chi tiết trên máy tính — chuyển thể app-shell-11 (ReUI Pro, hàng 105; chủ kho chọn lối C 05/11): chi tiết là
// một cột đứng cạnh thân, kéo chia, cao từ đỉnh vùng làm việc tới đáy; thân co sang trái và vẫn bấm được, không lớp phủ.
// Giữ tỉ lệ của khối (cột 38%, kéo 28–50%) và tay kéo `withHandle`; bỏ cột điều hướng, thanh trên và dữ liệu demo của khối
// (vỏ của kho giữ chúng). Nhóm panel luôn dựng — cột mở hay đóng thì thân không dựng lại (giữ lọc, nhóm, cuộn của bảng).
// Điện thoại không có cột: chi tiết mở ngăn từ đáy (ADR-0024 §5) khi màn trao tên ngăn; không thì màn tự lo (Bảng hàng mở
// hồ sơ toàn màn).

/** Tỉ lệ kéo chia (phần trăm bề rộng nhóm) — khối `app-shell-11`; bài kiểm và phép đo đọc cùng chỗ này. */
export const KEO_CHIA = { than: { nhoNhat: 35 }, cot: { macDinh: 38, nhoNhat: 28, lonNhat: 50 } } as const;

const pt = (n: number) => `${n}%`;

export type ChiTiet = {
  /** Cột chi tiết đang mở. */
  mo: boolean;
  /** Điện thoại: người đóng ngăn. */
  onMo?: (mo: boolean) => void;
  /** Điện thoại: tên ngăn từ đáy; không có thì điện thoại không mở ngăn. */
  tieuDe?: ReactNode;
  hanhDong?: ReactNode;
  chan?: ReactNode;
};

export function CotKeoChia({ than, phu, chiTiet }: { than: ReactNode; phu: ReactNode; chiTiet: ChiTiet }) {
  const dienThoai = useIsMobile();
  const mo = chiTiet.mo && phu != null;
  return (
    <>
      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel id="than" data-nho-nhat={KEO_CHIA.than.nhoNhat} minSize={pt(KEO_CHIA.than.nhoNhat)}>
          <div data-vung="than" className="flex h-full min-w-0 flex-col gap-khung">
            {than}
          </div>
        </ResizablePanel>
        {mo && !dienThoai ? (
          <>
            <ResizableHandle withHandle className="mx-2" />
            <ResizablePanel
              id="cot-phu"
              data-vung="cot-phu"
              data-mac-dinh={KEO_CHIA.cot.macDinh}
              data-nho-nhat={KEO_CHIA.cot.nhoNhat}
              data-lon-nhat={KEO_CHIA.cot.lonNhat}
              defaultSize={pt(KEO_CHIA.cot.macDinh)}
              minSize={pt(KEO_CHIA.cot.nhoNhat)}
              maxSize={pt(KEO_CHIA.cot.lonNhat)}
            >
              <div className="flex h-full min-w-0 flex-col">{phu}</div>
            </ResizablePanel>
          </>
        ) : null}
      </ResizablePanelGroup>
      {dienThoai && chiTiet.tieuDe ? (
        <NganNoi mo={mo} onMo={chiTiet.onMo ?? (() => undefined)} tieuDe={chiTiet.tieuDe} hanhDong={chiTiet.hanhDong} chan={chiTiet.chan}>
          <div data-vung="cot-phu">{phu}</div>
        </NganNoi>
      ) : null}
    </>
  );
}
