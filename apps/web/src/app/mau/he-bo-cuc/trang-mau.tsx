import type { Home } from "@quy-hang/core";
import Link from "next/link";

import { BO_CUC, type KieuBoCuc, THONG_TIN } from "@/components/bo-cuc/ma-tran";
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { AppShell } from "@/components/shell/app-shell";
import type { LoiMenuTao } from "@/components/shell/menu-tao";
import { Button } from "@/components/ui/button";

import { NAV_MAU, NGUOI_MAU } from "./du-lieu-mau";
import { ManMau } from "./man-mau";
import { diaChiTrang, diaChiXem, type KhoMau, type LoiDauMan, KHO_MAU, TEN_TRANG_THAI, type TrangThaiMau, TRANG_THAI_MAU } from "./to-hop";

// Khuôn của nhóm `trang-mau` (design/patterns/trang-mau.md): trang mẫu sống của hệ bố cục (ADR-0024 quyết định 8, hàng
// 91) — chọn bố cục × trạng thái × khổ, xem trong khung đúng bề rộng. Không cần cơ sở dữ liệu, không đăng nhập: proxy cho
// địa chỉ này qua, trang chỉ đọc dữ liệu mẫu. Ảnh chuẩn chụp từ trang xem (`/mau/he-bo-cuc/xem`) ở từng khổ.

// Nhà đứng cho từng bố cục trên trang mẫu, để cột thứ hai hiện như màn thật dùng bố cục ấy.
const NHA_CUA: Record<KieuBoCuc, Home> = {
  tran: "inventory",
  "danh-sach-chi-tiet": "today",
  doc: "settings",
  "ho-so-hai-cot": "inventory",
  "bang-dieu-khien": "team",
  "luong-nhieu-buoc": "inventory",
  "dong-tin": "shares",
};

const CAO: Record<(typeof KHO_MAU)[number], number> = { 1440: 900, 1024: 768, 375: 812 };

/** `che="tong"` — trang chọn tổ hợp, xem trong khung đúng bề rộng; `che="xem"` — một tổ hợp trong vỏ thật với người mẫu. */
export function TrangMau({
  che,
  boCuc,
  trangThai,
  kho,
  menuTao,
  dauMan,
}: {
  che: "tong" | "xem";
  dauMan: LoiDauMan;
  boCuc: KieuBoCuc;
  trangThai: TrangThaiMau;
  kho: KhoMau;
  menuTao: LoiMenuTao;
}) {
  if (che === "xem")
    return (
      <AppShell user={NGUOI_MAU} nav={NAV_MAU} remembered={{}} mau menuTao={menuTao} nhaMau={NHA_CUA[boCuc]}>
        <ManMau kieu={boCuc} trangThai={trangThai} dauMan={dauMan} />
      </AppShell>
    );
  const tt = THONG_TIN[boCuc];
  return (
    <main className="flex min-h-svh flex-col gap-khung bg-background p-trang">
      <Frame>
        <FrameHeader>
          <FrameTitle>Hệ bố cục — trang mẫu sống</FrameTitle>
          <FrameDescription>
            {tt.ten} · mật độ {tt.mat_do === "day" ? "dày" : "thường"} · khối nguồn {tt.khoi_nguon} · điện thoại: {tt.dien_thoai}
          </FrameDescription>
        </FrameHeader>
        <FramePanel className="flex flex-col gap-3">
          <nav aria-label="Bố cục" className="flex flex-wrap gap-2">
            {BO_CUC.map((b) => (
              <Button key={b} size="sm" variant={b === boCuc ? "default" : "outline"} nativeButton={false} render={<Link href={diaChiTrang(b, trangThai, kho)} />}>
                {THONG_TIN[b].ten}
              </Button>
            ))}
          </nav>
          <nav aria-label="Trạng thái" className="flex flex-wrap gap-2">
            {TRANG_THAI_MAU.map((t) => (
              <Button key={t} size="sm" variant={t === trangThai ? "secondary" : "ghost"} nativeButton={false} render={<Link href={diaChiTrang(boCuc, t, kho)} />}>
                {TEN_TRANG_THAI[t]}
              </Button>
            ))}
          </nav>
          <nav aria-label="Khổ" className="flex flex-wrap gap-2">
            {KHO_MAU.map((k) => (
              <Button key={k} size="sm" variant={k === kho ? "secondary" : "ghost"} nativeButton={false} render={<Link href={diaChiTrang(boCuc, trangThai, k)} />}>
                {k}
              </Button>
            ))}
            <Button size="sm" variant="link" nativeButton={false} render={<Link href={diaChiXem(boCuc, trangThai)} />}>
              Mở riêng
            </Button>
          </nav>
        </FramePanel>
      </Frame>
      <div className="overflow-x-auto">
        <iframe
          key={`${boCuc}-${trangThai}-${kho}`}
          title={`${tt.ten} · ${TEN_TRANG_THAI[trangThai]} · ${kho}`}
          src={diaChiXem(boCuc, trangThai)}
          width={kho}
          height={CAO[kho]}
          className="rounded-lg border bg-background"
        />
      </div>
    </main>
  );
}
