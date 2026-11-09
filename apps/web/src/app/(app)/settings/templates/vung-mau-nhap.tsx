"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { CHU, coQuyDoi, nhanNguon, nhanTruong, quyDoiThanhChu, sauKhiLuu, sauKhiXoa, thanSua, TRUONG_CHON, type CotMauNhap, type TrangThaiMau } from "./mau-nhap";

const goi = (method: string, khoa: string, body?: unknown) =>
  fetch(`/api/v1/company/import-templates/${encodeURIComponent(khoa)}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

/** Vùng của màn trong vỏ: làm mới bằng router của app. */
export function VungMauNhap({ tt }: { tt: TrangThaiMau }) {
  const router = useRouter();
  return <BangMauNhap tt={tt} lamMoi={() => router.refresh()} />;
}

/** Màn Mẫu nhập (hàng 50): bảng các cột đã nhớ; Sửa mở hộp (trường, quy đổi ở trường đóng); Xoá qua hộp xác nhận. */
export function BangMauNhap({ tt, lamMoi }: { tt: TrangThaiMau; lamMoi: () => void }) {
  const [sua, setSua] = useState<CotMauNhap | null>(null);
  const [truong, setTruong] = useState("");
  const [quyDoi, setQuyDoi] = useState("");
  const [loi, setLoi] = useState("");
  const [dangLuu, setDangLuu] = useState(false);
  const [xoa, setXoa] = useState<CotMauNhap | null>(null);
  const [loiXoa, setLoiXoa] = useState("");
  const [dangXoa, setDangXoa] = useState(false);

  if (tt.kieu === "dang-tai") return <TrangThai kind="loading" title={CHU.dangTai} />;
  if (tt.kieu === "loi")
    return <TrangThai kind="error" title={CHU.loi} hanhDong={<Button variant="outline" onClick={() => lamMoi()}>{CHU.thuLai}</Button>} />;
  if (!tt.ds.length) return <TrangThai kind="empty" title={CHU.trong} />;

  const moSua = (c: CotMauNhap) => {
    setSua(c);
    setTruong(c.target);
    setQuyDoi(quyDoiThanhChu(c.valueMap));
    setLoi("");
  };
  const luu = async () => {
    if (!sua) return;
    setDangLuu(true);
    const res = await goi("PUT", sua.headerKey, thanSua(sua, truong, quyDoi)).catch(() => null);
    const reason = res && res.status === 400 ? ((await res.json().catch(() => ({}))) as { reason?: string }).reason : undefined;
    const kq = sauKhiLuu(res ? { status: res.status, reason } : null);
    setDangLuu(false);
    if (kq.dong) {
      setSua(null);
      lamMoi();
    } else setLoi(kq.loi);
  };
  const xacNhanXoa = async () => {
    if (!xoa) return;
    setDangXoa(true);
    setLoiXoa("");
    const res = await goi("DELETE", xoa.headerKey).catch(() => null);
    const kq = sauKhiXoa(res ? res.status : null);
    setDangXoa(false);
    if (kq.dong) {
      setXoa(null);
      lamMoi();
      return;
    }
    setLoiXoa(kq.loi);
    if (kq.lamMoi) lamMoi();
  };
  const moXoa = (c: CotMauNhap) => {
    setXoa(c);
    setLoiXoa("");
  };
  const moTaQuyDoi = (c: CotMauNhap) => (c.valueMap ? `${Object.keys(c.valueMap).length} giá trị` : "—");

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{CHU.cotTieuDe}</TableHead>
            <TableHead className="hidden lg:table-cell">{CHU.cotTruong}</TableHead>
            <TableHead className="hidden lg:table-cell">{CHU.cotQuyDoi}</TableHead>
            <TableHead className="hidden lg:table-cell">{CHU.cotNguon}</TableHead>
            <TableHead className="text-end" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tt.ds.map((c) => (
            <TableRow key={c.headerKey}>
              <TableCell className="font-medium wrap-anywhere whitespace-normal">
                {c.headerKey}
                <div data-dong-phu className="mt-0.5 text-xs font-normal text-muted-foreground lg:hidden">
                  {CHU.cotTruong} {nhanTruong(c.target)}
                  {c.valueMap ? ` · ${moTaQuyDoi(c)}` : ""} · {nhanNguon(c)}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">{nhanTruong(c.target)}</TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">{moTaQuyDoi(c)}</TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">{nhanNguon(c)}</TableCell>
              <TableCell className="text-end">
                <Button variant="ghost" size="sm" onClick={() => moSua(c)}>
                  {CHU.sua}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => moXoa(c)}>
                  {CHU.xoa}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={sua !== null} onOpenChange={(m) => !m && setSua(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="wrap-anywhere">
              {CHU.sua} «{sua?.headerKey}»
            </DialogTitle>
            <DialogDescription>{CHU.moTa}</DialogDescription>
          </DialogHeader>
          <Select value={truong} onValueChange={(v) => v && setTruong(v)}>
            <SelectTrigger aria-label={CHU.cotTruong}>
              <SelectValue>{nhanTruong(truong)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TRUONG_CHON.map((t) => (
                <SelectItem key={t} value={t}>
                  {nhanTruong(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {coQuyDoi(truong) ? (
            <Textarea aria-label={CHU.cotQuyDoi} placeholder={CHU.quyDoiMoTa} value={quyDoi} onChange={(e) => setQuyDoi(e.target.value)} rows={4} />
          ) : sua?.valueMap ? (
            <p className="text-sm text-muted-foreground">{CHU.boQuyDoi}</p>
          ) : null}
          {loi ? <FieldError>{loi}</FieldError> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSua(null)}>
              {CHU.huy}
            </Button>
            <Button onClick={() => void luu()} disabled={dangLuu}>
              {CHU.luu}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={xoa !== null} onOpenChange={(m) => !m && !dangXoa && setXoa(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="wrap-anywhere">
              {CHU.xoa} «{xoa?.headerKey}»?
            </AlertDialogTitle>
            <AlertDialogDescription className="wrap-anywhere">{xoa ? CHU.xoaHoi(xoa.headerKey) : null}</AlertDialogDescription>
          </AlertDialogHeader>
          {loiXoa ? <FieldError>{loiXoa}</FieldError> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dangXoa}>{CHU.huy}</AlertDialogCancel>
            <AlertDialogAction disabled={dangXoa} onClick={() => void xacNhanXoa()}>
              {CHU.xoa}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
