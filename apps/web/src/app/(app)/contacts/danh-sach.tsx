"use client";

import { ContactIcon, SearchIcon } from "lucide-react";

import { ChoTai } from "@/components/bo-cuc";
import { Badge } from "@/components/reui/badge";
import { Frame, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { CHU, NHAN_LOAI, type DongLienHe } from "./lien-he";

export type TrangThaiDs =
  | { kieu: "dang-tai" }
  | { kieu: "loi" }
  | { kieu: "nguoi-khac-giu"; holderName: string | null }
  | { kieu: "xong"; ds: DongLienHe[]; con: boolean };

const LOAI = ["Seller", "Landlord", "Buyer", "Tenant"] as const;

/** Thân danh sách: ô tìm, lọc loại, bảng; trống · không khớp · người khác giữ · lỗi đi qua `TrangThai`. */
export function DanhSachLienHe({
  tt,
  q,
  loai,
  chon,
  onQ,
  onLoai,
  onChon,
  onThem,
  onThuLai,
}: {
  tt: TrangThaiDs;
  q: string;
  loai: string;
  chon: string | null;
  onQ: (q: string) => void;
  onLoai: (l: string) => void;
  onChon: (id: string) => void;
  onThem: () => void;
  onThuLai: () => void;
}) {
  let than;
  if (tt.kieu === "dang-tai") than = <ChoTai kieu="danh-sach-chi-tiet" />;
  else if (tt.kieu === "loi")
    than = (
      <TrangThai
        kind="error"
        title={CHU.loi}
        hanhDong={
          <Button size="sm" variant="outline" onClick={onThuLai}>
            {CHU.thuLai}
          </Button>
        }
      />
    );
  else if (tt.kieu === "nguoi-khac-giu") than = <TrangThai kind="notice" title={CHU.nguoiKhacGiu(tt.holderName)} />;
  else if (!tt.ds.length)
    than = q || loai ? <TrangThai kind="empty" icon={SearchIcon} title={CHU.khongKhop(q || NHAN_LOAI[loai] || loai)} /> : <TrangThai kind="empty" icon={ContactIcon} title={CHU.trong} description={CHU.trongMoTa} />;
  else
    than = (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Người giữ</TableHead>
              <TableHead className="text-right">Cơ hội mở</TableHead>
              <TableHead className="text-right">Căn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tt.ds.map((d) => (
              <TableRow key={d.id} data-state={chon === d.id ? "selected" : undefined} onClick={() => onChon(d.id)} className="cursor-pointer">
                <TableCell className="font-medium">
                  <Button variant="link" size="sm" className="h-auto p-0" onClick={() => onChon(d.id)}>
                    {d.name ?? "[Chưa có tên]"}
                  </Button>{" "}
                  {d.status === "lead" ? <Badge variant="warning-light">{CHU.lead}</Badge> : null}
                </TableCell>
                <TableCell>{d.contactTypes.map((t) => NHAN_LOAI[t] ?? t).join(" · ")}</TableCell>
                <TableCell>{d.holderName ?? "—"}</TableCell>
                <TableCell className="text-right tabular-nums">{d.openOpportunities}</TableCell>
                <TableCell className="text-right tabular-nums">{d.listingCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {tt.con ? (
          <div className="flex justify-center p-3">
            <Button size="sm" variant="outline" onClick={onThem}>
              {CHU.xemThem}
            </Button>
          </div>
        ) : null}
      </>
    );
  return (
    <Frame>
      <FrameHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <FrameTitle>{CHU.tieuDe}</FrameTitle>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ToggleGroup value={loai ? [loai] : []} onValueChange={(v: string[]) => onLoai(v[0] ?? "")} variant="outline" size="sm">
            {LOAI.map((l) => (
              <ToggleGroupItem key={l} value={l}>
                {NHAN_LOAI[l]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-2.5 left-2 size-4" aria-hidden="true" />
            <Input className="pl-8" placeholder={CHU.timGoi} value={q} onChange={(e) => onQ(e.target.value)} aria-label={CHU.timGoi} />
          </div>
        </div>
      </FrameHeader>
      <FramePanel className="p-0">{than}</FramePanel>
    </Frame>
  );
}
