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

import { CHU, coQuyDoi, nhanNguon, nhanTruong, quyDoiThanhChu, sauKhiLuu, thanSua, TRUONG_CHON, type CotMauNhap, type TrangThaiMau } from "./mau-nhap";

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
    await goi("DELETE", xoa.headerKey).catch(() => null);
    setXoa(null);
    lamMoi();
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{CHU.cotTieuDe}</TableHead>
            <TableHead>{CHU.cotTruong}</TableHead>
            <TableHead>{CHU.cotQuyDoi}</TableHead>
            <TableHead>{CHU.cotNguon}</TableHead>
            <TableHead className="text-end" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tt.ds.map((c) => (
            <TableRow key={c.headerKey}>
              <TableCell className="font-medium">{c.headerKey}</TableCell>
              <TableCell>{nhanTruong(c.target)}</TableCell>
              <TableCell className="text-muted-foreground">{c.valueMap ? `${Object.keys(c.valueMap).length} giá trị` : "—"}</TableCell>
              <TableCell className="text-muted-foreground">{nhanNguon(c)}</TableCell>
              <TableCell className="text-end">
                <Button variant="ghost" size="sm" onClick={() => moSua(c)}>
                  {CHU.sua}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setXoa(c)}>
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
            <DialogTitle>
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

      <AlertDialog open={xoa !== null} onOpenChange={(m) => !m && setXoa(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {CHU.xoa} «{xoa?.headerKey}»?
            </AlertDialogTitle>
            <AlertDialogDescription>{xoa ? CHU.xoaHoi(xoa.headerKey) : null}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{CHU.huy}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void xacNhanXoa()}>{CHU.xoa}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
