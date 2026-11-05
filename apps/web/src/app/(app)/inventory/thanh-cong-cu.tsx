"use client";

/**
 * Điều khiển trên thanh công cụ của Bảng hàng: menu «Góc nhìn ▾» (đầu thanh — Tham chiếu §9), chọn cách nhóm, ẩn hiện
 * cột, và hộp đặt tên / xác nhận xoá góc nhìn. Ghép từ thành phần đã cài (DropdownMenu, Select, Dialog, AlertDialog).
 */
import { useState } from "react";
import { BookmarkIcon, ChevronDownIcon, Columns3Icon } from "lucide-react";

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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COT, type CotId } from "./cot";
import { TEN_TOI_DA, doiTen, luuMoi, xoa, type CachXem, type GocNhin } from "./goc-nhin";
import { khoTrinhDuyet } from "./goc-nhin-react";
import { CACH_NHOM, type CachNhom } from "./nhom";

export function MenuGocNhin(p: {
  ds: GocNhin[];
  dangMo: GocNhin | undefined;
  daDoi: boolean;
  onMo: (g: GocNhin) => void;
  onLuuMoi: () => void;
  onLuuDe: () => void;
  onDoiTen: () => void;
  onXoa: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button type="button" variant="outline" />}>
        <BookmarkIcon data-icon="inline-start" aria-hidden="true" />
        {/* eslint-disable-next-line quy-hang-ui/no-layout-arbitrary -- trần bề rộng tên góc nhìn trong nút (cắt chữ), không phải kích thước trang */}
        <span className="max-w-48 truncate">{p.dangMo ? p.dangMo.ten : "Góc nhìn"}</span>
        <ChevronDownIcon data-icon="inline-end" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Góc nhìn của tôi</DropdownMenuLabel>
          {p.ds.length === 0 ? <DropdownMenuItem disabled>Chưa có góc nhìn</DropdownMenuItem> : null}
          {p.ds.map((g) => (
            <DropdownMenuItem key={g.id} onClick={() => p.onMo(g)}>
              <span className="truncate">{g.ten}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {p.dangMo && p.daDoi ? <DropdownMenuItem onClick={p.onLuuDe}>Lưu đè</DropdownMenuItem> : null}
          <DropdownMenuItem onClick={p.onLuuMoi}>{p.dangMo ? "Lưu thành góc nhìn mới…" : "Lưu góc nhìn…"}</DropdownMenuItem>
          {p.dangMo ? (
            <>
              <DropdownMenuItem onClick={p.onDoiTen}>Đổi tên…</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={p.onXoa}>
                Xoá góc nhìn…
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ChonNhom({ value, onChange }: { value: CachNhom; onChange: (v: CachNhom) => void }) {
  return (
    <Select items={CACH_NHOM} value={value} onValueChange={(v) => v && onChange(v as CachNhom)}>
      <SelectTrigger aria-label="Nhóm" className="min-w-40">
        <span className="text-muted-foreground">Nhóm:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" alignItemWithTrigger={false}>
        {CACH_NHOM.map((c) => (
          <SelectItem key={c.value} value={c.value}>
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ChonCot({ value, onChange }: { value: CotId[]; onChange: (v: CotId[]) => void }) {
  const doi = (id: CotId, bat: boolean) => {
    const moi = new Set(value);
    if (bat) moi.add(id);
    else moi.delete(id);
    onChange(COT.map((c) => c.id).filter((x) => moi.has(x)));
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button type="button" variant="outline" />}>
        <Columns3Icon data-icon="inline-start" aria-hidden="true" />
        Cột
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Cột hiện trên bảng</DropdownMenuLabel>
          {COT.map((c) => (
            <DropdownMenuCheckboxItem
              key={c.id}
              checked={value.includes(c.id)}
              disabled={c.id === "unitNumber"}
              onCheckedChange={(bat) => doi(c.id, bat === true)}
            >
              {c.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type CheDoHop = { loai: "moi" } | { loai: "doi-ten"; gocNhin: GocNhin } | { loai: "xoa"; gocNhin: GocNhin };

export function HopGocNhin(p: {
  cheDo: CheDoHop;
  nguoi: string;
  san: string;
  cachXem: CachXem;
  onDong: () => void;
  onDaLuu: (g: GocNhin) => void;
  onDaXoa: () => void;
}) {
  const { cheDo } = p;
  const [ten, setTen] = useState(cheDo.loai === "doi-ten" ? cheDo.gocNhin.ten : "");
  const [loi, setLoi] = useState<string | null>(null);

  if (cheDo.loai === "xoa") {
    return (
      <AlertDialog open onOpenChange={(o) => !o && p.onDong()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá góc nhìn «{cheDo.gocNhin.ten}»?</AlertDialogTitle>
            <AlertDialogDescription>Bảng hàng không đổi; chỉ mất cách xem đã lưu trên máy này.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Giữ lại</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                xoa(khoTrinhDuyet, p.nguoi, p.san, cheDo.gocNhin.id);
                p.onDong();
                p.onDaXoa();
              }}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const luu = () => {
    const kq =
      cheDo.loai === "moi"
        ? luuMoi(khoTrinhDuyet, p.nguoi, p.san, ten, p.cachXem, crypto.randomUUID(), new Date().toISOString())
        : doiTen(khoTrinhDuyet, p.nguoi, p.san, cheDo.gocNhin.id, ten);
    if (!kq.ok) {
      setLoi(kq.lyDo);
      return;
    }
    p.onDong();
    p.onDaLuu(kq.gocNhin);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && p.onDong()}>
      {/* eslint-disable-next-line quy-hang-ui/no-layout-arbitrary -- bề rộng hộp lưu góc nhìn, không phải kích thước trang */}
      <DialogContent className="sm:max-w-md">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            luu();
          }}
        >
          <DialogHeader>
            <DialogTitle>{cheDo.loai === "moi" ? "Lưu góc nhìn" : "Đổi tên góc nhìn"}</DialogTitle>
          </DialogHeader>
          <Field data-invalid={loi ? true : undefined}>
            <FieldLabel htmlFor="ten-goc-nhin">Tên</FieldLabel>
            <Input
              id="ten-goc-nhin"
              autoFocus
              value={ten}
              maxLength={TEN_TOI_DA + 20}
              placeholder="Ví dụ: 2PN dưới 5 tỷ"
              aria-invalid={loi ? true : undefined}
              onChange={(e) => {
                setTen(e.target.value);
                setLoi(null);
              }}
            />
            {loi ? <FieldError>{loi}</FieldError> : null}
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={p.onDong}>
              Huỷ
            </Button>
            <Button type="submit">Lưu</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
