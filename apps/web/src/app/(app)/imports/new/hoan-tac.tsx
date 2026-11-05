"use client";

import { useEffect, useState } from "react";
import { Undo2Icon } from "lucide-react";
import { TrangThai } from "@/components/trang-thai";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { docLanNhapGanDay, hoanTacLanNhap, laLoi, xemThuHoanTac } from "@/lib/nhap/goi-api";
import {
  danhSachGanDay,
  moHop,
  NHAN_HOAN_TAC,
  nutXacNhan,
  tenCan,
  tieuDeHop,
  trangThaiDanhSach,
  type HopHoanTac as Hop,
  type LanNhapCuaToi,
} from "@/lib/nhap/hoan-tac";

/**
 * Hoàn tác cả lần nhập (hàng 66): «Lần nhập gần đây» ở bước 1 và hộp xác nhận dùng chung với nút ở bước 5. Phần máy ở
 * `lib/nhap/hoan-tac`; ở đây chỉ nối. Con số và lý do là của máy chủ.
 */
export function LanNhapGanDay({ lamMoi, onHoanTac }: { lamMoi: number; onHoanTac: (importId: string) => void }) {
  // Làm mới sau mỗi lần hoàn tác bằng khoá: mỗi lần là một lần đọc mới từ trạng thái đang tải.
  return <DanhSach key={lamMoi} onHoanTac={onHoanTac} />;
}

function DanhSach({ onHoanTac }: { onHoanTac: (importId: string) => void }) {
  const [ds, setDs] = useState<LanNhapCuaToi[] | null>(null);
  const [loi, setLoi] = useState(false);
  useEffect(() => {
    docLanNhapGanDay(fetch)
      .then((r) => (laLoi(r) ? setLoi(true) : setDs(r)))
      .catch(() => setLoi(true));
  }, []);
  const tt = trangThaiDanhSach(ds, loi);
  return (
    <section className="flex flex-col gap-3" aria-label="Lần nhập gần đây">
      <h2 className="text-sm font-medium">Lần nhập gần đây</h2>
      {tt === "dang-tai" ? <TrangThai kind="loading" title="Đang tải lần nhập gần đây…" /> : null}
      {tt === "loi" ? <TrangThai kind="error" title="Không tải được lần nhập gần đây" description="Tải lại trang để thử lại." /> : null}
      {tt === "trong" ? <TrangThai kind="empty" title="Chưa có lần nhập nào" description="Lần nhập đã ghi sẽ hiện ở đây để hoàn tác khi cần." /> : null}
      {tt === "co-dong" ? (
        <ul className="flex flex-col divide-y rounded-md border">
          {danhSachGanDay(ds!).map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{d.ten}</span>
                <span className="text-xs text-muted-foreground">
                  {d.ngay} · {d.soDong} dòng ghi
                </span>
              </div>
              {d.nhan ? <Badge variant="secondary">{d.nhan}</Badge> : null}
              {d.coNut ? (
                <Button type="button" variant="outline" size="sm" onClick={() => onHoanTac(d.id)}>
                  <Undo2Icon data-icon="inline-start" aria-hidden="true" />
                  {NHAN_HOAN_TAC}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** Hộp xác nhận hoàn tác: mở là xem thử (không ghi), bấm Hoàn tác mới ghi; đứt giữa chừng thì bấm lại làm tiếp. */
export function HopHoanTac({ importId, onDong, onXong }: { importId: string | null; onDong: () => void; onXong: () => void }) {
  return (
    <AlertDialog open={importId !== null} onOpenChange={(mo) => !mo && onDong()}>
      {importId ? <NoiDungHop key={importId} importId={importId} onXong={onXong} /> : null}
    </AlertDialog>
  );
}

function NoiDungHop({ importId, onXong }: { importId: string; onXong: () => void }) {
  const [h, setH] = useState<Hop>(() => moHop(importId));
  useEffect(() => {
    let con = true;
    xemThuHoanTac(fetch, importId).then((r) => {
      if (!con) return;
      setH(laLoi(r) ? { ...moHop(importId), buoc: "loi", loi: r.loi } : { ...moHop(importId), buoc: r.status === "undone" ? "xong" : "san-sang", keHoach: r });
    });
    return () => {
      con = false;
    };
  }, [importId]);

  async function lam() {
    setH({ ...h, buoc: "dang-ghi", loi: null });
    const r = await hoanTacLanNhap(fetch, h.importId);
    if (laLoi(r)) return setH({ ...h, buoc: "loi", loi: r.loi });
    setH({ ...h, buoc: "xong", keHoach: r, loi: null });
    onXong();
  }

  const nut = nutXacNhan(h);
  const k = h.keHoach;
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{h.buoc === "xong" ? "Đã hoàn tác lần nhập" : "Hoàn tác lần nhập này?"}</AlertDialogTitle>
        <AlertDialogDescription>
          {k ? tieuDeHop(k) : "Căn lần nhập tạo ra khỏi Quỹ hàng, căn có sẵn về giá cũ; lịch sử giữ nguyên."}
        </AlertDialogDescription>
      </AlertDialogHeader>
      {h.buoc === "xem-thu" ? <TrangThai kind="loading" title="Đang xem trước…" /> : null}
      {h.buoc === "loi" && h.loi ? <TrangThai kind="error" title={h.loi} /> : null}
      {k && k.danhSach.length ? (
        <ul className="flex max-h-60 flex-col gap-1 overflow-y-auto text-sm">
          {k.danhSach.map((d) => (
            <li key={d.rowNumber} className="flex flex-wrap justify-between gap-2">
              <span className="font-medium">{tenCan(d)}</span>
              <span className="text-muted-foreground">{d.lyDo}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <AlertDialogFooter>
        <AlertDialogCancel>{h.buoc === "xong" ? "Đóng" : "Giữ lại"}</AlertDialogCancel>
        {h.buoc !== "xong" ? (
          <AlertDialogAction
            disabled={nut.tat}
            onClick={(e) => {
              e.preventDefault();
              void lam();
            }}
          >
            {h.buoc === "dang-ghi" ? <Spinner data-icon="inline-start" /> : null}
            {nut.chu}
          </AlertDialogAction>
        ) : null}
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
