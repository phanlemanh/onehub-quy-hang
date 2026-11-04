"use client";

/**
 * Trình che vùng ảnh (hàng 19): kéo con trỏ vẽ khung trên ảnh đã xoay, rồi lưu một bản che nhẹ ở ngăn Gửi được và chuyển
 * bản gốc sang Nội bộ. Ghép từ thành phần đã cài (Dialog, Button) và một canvas; logic thuần ở `vung.ts`, `luu.ts`, `ve.ts`.
 */
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import type { UnitPhoto } from "@quy-hang/core/photos";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { luuBanChe, type NguonLuu } from "./luu";
import { dungBanChe, moAnh } from "./ve";
import { diemTrenKhung, khungTuMan, type Khung } from "./vung";

const KHUNG_MAN = { w: 960, h: 600 };

export function TrinhChe({ anh, nguon, urlGoc, onDong, onDaLuu }: { anh: UnitPhoto; nguon: NguonLuu; urlGoc: string; onDong: () => void; onDaLuu: () => void }) {
  const ve = useRef<HTMLCanvasElement>(null);
  const [bmp, setBmp] = useState<ImageBitmap | null>(null);
  const [loiMo, setLoiMo] = useState(false);
  const [khung, setKhung] = useState<Khung[]>([]);
  const [keo, setKeo] = useState<{ a: { x: number; y: number }; b: { x: number; y: number } } | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    let huy = false;
    fetch(urlGoc, { cache: "no-store" })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then(moAnh)
      .then((b) => (huy ? b.close() : setBmp(b)), () => !huy && setLoiMo(true));
    return () => {
      huy = true;
    };
  }, [urlGoc]);

  // Cỡ hiện: ảnh vừa khung màn, giữ tỉ lệ.
  const hien = bmp ? (() => { const k = Math.min(KHUNG_MAN.w / bmp.width, KHUNG_MAN.h / bmp.height, 1); return { w: Math.round(bmp.width * k), h: Math.round(bmp.height * k) }; })() : null;

  // Khung vẽ co theo hộp khi hiện: điểm trong viền đổi về cỡ vẽ `hien` trước khi sang điểm ảnh.
  const diem = (e: PointerEvent<HTMLCanvasElement>) => {
    const c = e.currentTarget;
    const r = c.getBoundingClientRect();
    const hienThi = { w: c.clientWidth, h: c.clientHeight };
    return diemTrenKhung({ x: e.clientX - r.left - c.clientLeft, y: e.clientY - r.top - c.clientTop }, hienThi, hien ?? hienThi);
  };
  const tam = keo && bmp && hien ? khungTuMan(keo.a, keo.b, hien, { w: bmp.width, h: bmp.height }) : null;

  useEffect(() => {
    const c = ve.current;
    if (!c || !bmp || !hien) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(bmp, 0, 0, hien.w, hien.h);
    const k = hien.w / bmp.width;
    ctx.fillStyle = "black";
    for (const x of tam ? [...khung, tam] : khung) ctx.fillRect(x.x * k, x.y * k, x.w * k, x.h * k);
  }, [bmp, hien, khung, tam]);

  const luu = useCallback(async () => {
    if (!bmp || !khung.length) return;
    setDangLuu(true);
    setLoi(null);
    const kq = await dungBanChe(bmp, khung).then((ban) => luuBanChe(anh, ban, nguon), () => ({ ok: false as const, loi: "Không dựng được bản che" }));
    setDangLuu(false);
    if (kq.ok) onDaLuu();
    else setLoi(kq.loi);
  }, [anh, bmp, khung, nguon, onDaLuu]);

  return (
    <Dialog open onOpenChange={(mo) => (!mo && !dangLuu ? onDong() : null)}>
      {/* Ngoại lệ có hạn của ADR-0024 (va-che-vung-anh): bề rộng hộp và trần cao khung vẽ đặt tay tới khi trình che chuyển
          sang ngăn nổi của hệ bố cục (hàng 91). Dưới sm giữ bề rộng mặc định của hộp trên điện thoại. */}
      {/* eslint-disable-next-line quy-hang-ui/no-layout-arbitrary -- bề rộng hộp của trình che vùng ảnh (va-che-vung-anh), tới khi trình che sang ngăn nổi của hệ bố cục */}
      <DialogContent className="sm:max-w-[min(64rem,calc(100%-2rem))]">
        <DialogHeader>
          <DialogTitle>Che vùng</DialogTitle>
          <DialogDescription>Kéo để vẽ vùng che. Bản che lưu ở ngăn Gửi được; bản gốc sang Nội bộ.</DialogDescription>
        </DialogHeader>
        {loiMo ? <TrangThai kind="error" title="Không mở được ảnh này" /> : null}
        {hien ? (
          <canvas
            ref={ve}
            width={hien.w}
            height={hien.h}
            aria-label="Ảnh để vẽ vùng che"
            // eslint-disable-next-line quy-hang-ui/no-layout-arbitrary -- trần cao và rộng của khung vẽ che vùng theo ảnh, không phải kích thước trang
            className="mx-auto block h-auto max-h-[calc(100dvh-13rem)] w-auto max-w-full cursor-crosshair touch-none rounded-md border"
            onPointerDown={(e) => (e.currentTarget.setPointerCapture(e.pointerId), setKeo({ a: diem(e), b: diem(e) }))}
            onPointerMove={(e) => (keo ? setKeo({ a: keo.a, b: diem(e) }) : null)}
            onPointerUp={() => {
              if (tam) setKhung((ds) => [...ds, tam]);
              setKeo(null);
            }}
          />
        ) : null}
        {loi ? <TrangThai kind="error" title={loi} /> : null}
        <DialogFooter className="items-center gap-2">
          <span className="text-muted-foreground me-auto text-xs tabular-nums">{khung.length} vùng che</span>
          <Button variant="outline" size="sm" disabled={!khung.length || dangLuu} onClick={() => setKhung((ds) => ds.slice(0, -1))}>
            Bỏ khung cuối
          </Button>
          <Button variant="outline" size="sm" disabled={!khung.length || dangLuu} onClick={() => setKhung([])}>
            Bỏ hết
          </Button>
          <Button size="sm" disabled={!khung.length || dangLuu || !bmp} onClick={() => void luu()}>
            {dangLuu ? "Đang lưu…" : "Lưu bản che"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
