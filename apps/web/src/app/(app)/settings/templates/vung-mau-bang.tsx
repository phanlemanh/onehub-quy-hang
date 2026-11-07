"use client";

import type { CotBangHang, MauBang } from "@quy-hang/core/export";
import { ArrowDown, ArrowUp } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { batTatCot, CHU_MAU, doiCho, LUA_CHON_COT, nhanCot, sauKhiLuuMau, thanPutBang, type TrangThaiMauSan } from "./mau-san";

const ghi = async (than: unknown) => {
  const res = await fetch("/api/v1/company/templates/export", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(than) }).catch(() => null);
  const reason = res && res.status === 400 ? ((await res.json().catch(() => ({}))) as { reason?: string }).reason : undefined;
  return sauKhiLuuMau(res ? { status: res.status, reason } : null);
};

/** Vùng của tab trong vỏ: làm mới bằng router của app. */
export function VungMauBang({ tt }: { tt: TrangThaiMauSan<MauBang[]> }) {
  const router = useRouter();
  return <BangMauBang tt={tt} lamMoi={() => router.refresh()} />;
}

/** Tab «Mẫu bảng hàng»: danh sách mẫu; Thêm, Sửa mở hộp (tên, cột, thứ tự); Xoá qua hộp xác nhận. */
export function BangMauBang({ tt, lamMoi, baoDau = null }: { tt: TrangThaiMauSan<MauBang[]>; lamMoi: () => void; baoDau?: string | null }) {
  const [sua, setSua] = useState<MauBang | null>(null);
  const [ten, setTen] = useState("");
  const [cot, setCot] = useState<CotBangHang[]>([]);
  const [loi, setLoi] = useState("");
  const [bao, setBao] = useState<string | null>(baoDau);
  const [dangLuu, setDangLuu] = useState(false);
  const [xoa, setXoa] = useState<MauBang | null>(null);

  if (tt.kieu === "dang-tai") return <TrangThai kind="loading" title={CHU_MAU.dangTai} />;
  if (tt.kieu === "loi")
    return <TrangThai kind="error" title={CHU_MAU.loiDoc} hanhDong={<Button variant="outline" onClick={() => lamMoi()}>{CHU_MAU.thuLai}</Button>} />;
  const ds = tt.giaTri;

  const mo = (m: MauBang | null) => {
    setSua(m ?? { id: crypto.randomUUID(), name: "", columns: [] });
    setTen(m?.name ?? "");
    setCot(m ? [...m.columns] : []);
    setLoi("");
  };
  const luu = async () => {
    if (!sua) return;
    setDangLuu(true);
    const kq = await ghi(thanPutBang(ds, { id: sua.id, name: ten, columns: cot }));
    setDangLuu(false);
    if (kq.ok) {
      setSua(null);
      setBao(kq.cau);
      lamMoi();
    } else setLoi(kq.cau);
  };
  const xacNhanXoa = async () => {
    if (!xoa) return;
    const kq = await ghi(thanPutBang(ds, xoa, true));
    setXoa(null);
    setBao(kq.cau);
    lamMoi();
  };

  const nutThem = <Button onClick={() => mo(null)}>{CHU_MAU.them}</Button>;
  return (
    <div className="flex flex-col gap-4">
      {bao ? <TrangThai kind={bao === CHU_MAU.daLuu ? "notice" : "error"} title={bao} /> : null}
      {ds.length === 0 ? (
        <TrangThai kind="empty" title={CHU_MAU.trongBang} hanhDong={nutThem} />
      ) : (
        <>
          <div>{nutThem}</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{CHU_MAU.ten}</TableHead>
                <TableHead>{CHU_MAU.cot}</TableHead>
                <TableHead className="text-end" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ds.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {CHU_MAU.soCot(m.columns.length)} · {m.columns.map(nhanCot).join(" · ")}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button variant="ghost" size="sm" onClick={() => mo(m)}>
                      {CHU_MAU.sua}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setXoa(m)}>
                      {CHU_MAU.xoa}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      <Dialog open={sua !== null} onOpenChange={(m) => !m && setSua(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{sua?.name ? `${CHU_MAU.sua} «${sua.name}»` : CHU_MAU.them}</DialogTitle>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="ten-mau">{CHU_MAU.ten}</FieldLabel>
            <Input id="ten-mau" value={ten} onChange={(e) => setTen(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>{CHU_MAU.cot}</FieldLabel>
            <ol className="flex flex-col gap-1">
              {cot.map((c, i) => (
                <li key={c} className="flex items-center gap-2">
                  <span className="flex-1 text-sm">{nhanCot(c)}</span>
                  <Button variant="ghost" size="icon-sm" aria-label={`${CHU_MAU.len} ${nhanCot(c)}`} disabled={i === 0} onClick={() => setCot(doiCho(cot, i, -1))}>
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`${CHU_MAU.xuong} ${nhanCot(c)}`}
                    disabled={i === cot.length - 1}
                    onClick={() => setCot(doiCho(cot, i, 1))}
                  >
                    <ArrowDown />
                  </Button>
                </li>
              ))}
            </ol>
            <div className="grid grid-cols-2 gap-2">
              {LUA_CHON_COT.map((l) => (
                <label key={l.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={cot.includes(l.id)} onCheckedChange={() => setCot(batTatCot(cot, l.id))} />
                  {l.nhan}
                </label>
              ))}
            </div>
          </Field>
          {loi ? <FieldError>{loi}</FieldError> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSua(null)}>
              {CHU_MAU.huy}
            </Button>
            <Button onClick={() => void luu()} disabled={dangLuu}>
              {CHU_MAU.luu}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={xoa !== null} onOpenChange={(m) => !m && setXoa(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{xoa ? CHU_MAU.xoaHoi(xoa.name) : ""}</AlertDialogTitle>
            <AlertDialogDescription>{CHU_MAU.xoaMoTa}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{CHU_MAU.huy}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void xacNhanXoa()}>{CHU_MAU.xoa}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
