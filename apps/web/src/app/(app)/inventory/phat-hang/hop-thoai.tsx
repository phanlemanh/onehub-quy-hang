"use client";

/**
 * Hộp thoại «Xuất bảng hàng» (hàng 43, design §3, AC-2 … AC-4, AC-8) trên khối `dialog-5` đã chuyển thể: bốn bước Mẫu ·
 * Người nhận · Xem trước · Chép · Tải. Hộp thoại chỉ vẽ `BanXuat` của lõi (đã qua luật ẩn) — không đọc trường nào của dòng
 * bảng hàng; dòng đi thẳng vào `banXuatTuDong` (`chuyen-dong.ts`). Mạng duy nhất: ghi lần xuất (`xong.ts`).
 */
import { useMemo, useState } from "react";
import {
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ImageIcon,
  LayoutTemplateIcon,
  MessageCircleIcon,
  NewspaperIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import {
  dinhNghiaMau,
  MAU_XUAT,
  mauBiKhoa,
  NGUOI_NHAN_MAC_DINH,
  tenTep,
  type BanXuat,
  type MauXuat,
} from "@quy-hang/core/export";
import type { TuVung } from "@quy-hang/core/labels";
import type { NguoiNhan } from "@quy-hang/core/redaction";

import { HopBuoc, type BuocHop } from "@/components/khoi/dialog-5/hop-buoc";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { CotId, DongBang } from "../cot";
import { banXuatTuDong } from "./chuyen-dong";
import { dungTep } from "./ve-anh";
import { lamXuat, type KetQuaXong, type MoiTruong } from "./xong";

const BUOC: readonly BuocHop[] = [
  { id: "mau", nhan: "Mẫu", ghiChu: "Bài hay tệp", icon: LayoutTemplateIcon },
  { id: "nguoi-nhan", nhan: "Người nhận", ghiChu: "Ai đọc bản xuất", icon: UsersIcon },
  { id: "xem-truoc", nhan: "Xem trước", ghiChu: "Đúng nội dung sẽ ra", icon: EyeIcon },
  { id: "xuat", nhan: "Chép · Tải", ghiChu: "Người tự gửi", icon: DownloadIcon },
];

const ICON_MAU: Record<MauXuat, LucideIcon> = {
  post_zalo: MessageCircleIcon,
  post_facebook: NewspaperIcon,
  xlsx: FileSpreadsheetIcon,
  png: ImageIcon,
  pdf: FileTextIcon,
};
const GHI_CHU_MAU: Record<MauXuat, string> = {
  post_zalo: "Một dòng một căn — chép rồi dán vào Zalo",
  post_facebook: "Dòng đầu tên sàn, mỗi căn một khối",
  xlsx: "Một sheet, dòng đầu là nhãn cột",
  png: "Ảnh bảng — tối đa 30 căn",
  pdf: "Các trang ảnh của bảng, 25 căn một trang",
};

const NGUOI_NHAN_CHON: readonly { ma: NguoiNhan; nhan: string; ghiChu: string; icon: LucideIcon }[] = [
  { ma: "nhom_moi_gioi", nhan: "Nhóm môi giới", ghiChu: "Đội và sàn bạn — thấy mã căn, tầng", icon: UsersIcon },
  { ma: "khach_rieng", nhan: "Khách riêng", ghiChu: "Ẩn mã căn như trang khách — chỉ toà và tầng cao / thấp", icon: UserIcon },
];
const NHAN_NGUOI_NHAN: Record<NguoiNhan, string> = { nhom_moi_gioi: "Nhóm môi giới", khach_rieng: "Khách riêng" };

function taiVe(tep: Blob, ten: string) {
  const url = URL.createObjectURL(tep);
  const a = document.createElement("a");
  a.href = url;
  a.download = ten;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/** Một lựa chọn của bước 1, 2 — cùng cách dựng với cột bước của khối (Item bọc Label, RadioGroupItem ẩn). */
function LuaChon({ value, nhan, ghiChu, icon: Icon, chon, khoa }: { value: string; nhan: string; ghiChu: string; icon: LucideIcon; chon: boolean; khoa?: boolean }) {
  return (
    <Item
      variant="outline"
      render={<Label />}
      className={cn(
        "w-full min-w-0 cursor-pointer flex-nowrap items-center text-left",
        chon ? "bg-muted/70" : "hover:bg-muted/70",
        khoa && "cursor-not-allowed opacity-60 hover:bg-transparent",
      )}
    >
      <RadioGroupItem value={value} disabled={khoa} className="sr-only" />
      <ItemMedia className="translate-y-0 self-center">
        <Item variant="muted" className="size-9 items-center justify-center p-0">
          <Icon className="size-4" aria-hidden="true" />
        </Item>
      </ItemMedia>
      <ItemContent className="min-w-0 flex-1 gap-0.5">
        <ItemTitle className="text-sm leading-tight font-medium">{nhan}</ItemTitle>
        <ItemDescription className="text-muted-foreground mt-0.5 text-xs">{ghiChu}</ItemDescription>
      </ItemContent>
    </Item>
  );
}

function XemTruoc({ ban }: { ban: BanXuat }) {
  return (
    // Rộng đúng bằng khung phải (khung cuộn của khối nở theo nội dung): bảng nhiều cột cuộn ngang bên trong, không tràn hộp.
    <div className="flex w-0 min-w-full flex-col gap-3">
      {ban.boQua.length > 0 ? (
        <TrangThai kind="notice" title={`Cột không ra ngoài: ${ban.boQua.join(", ")}`} description="Luật ẩn của sàn bỏ các cột này khỏi bản xuất." />
      ) : null}
      {ban.bai !== undefined ? (
        <p className="text-sm whitespace-pre-wrap" aria-label="Bài sẽ chép">
          {ban.bai}
        </p>
      ) : (
        <Table aria-label="Bảng sẽ xuất">
          <TableHeader>
            <TableRow>
              {ban.cot.map((c) => (
                <TableHead key={c}>{c}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ban.dong.map((d, i) => (
              <TableRow key={i}>
                {d.map((o, j) => (
                  <TableCell key={j} className="tabular-nums">
                    {o}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export type MoXuat = {
  /** Tập căn đã chọn, theo thứ tự góc nhìn (`tapCanXuat`). */
  dong: readonly DongBang[];
  /** Cột đang hiện của góc nhìn, theo thứ tự góc nhìn. */
  cot: readonly CotId[];
  today: string;
  tenSan: string;
  tenNguoiGui: string;
  /** Cách gọi riêng của sàn (hàng 45). */
  tuVung?: TuVung;
};

export function HopThoaiXuat({ mo, onDong }: { mo: MoXuat; onDong: () => void }) {
  const n = mo.dong.length;
  const [buoc, setBuoc] = useState(0);
  const [denDuoc, setDenDuoc] = useState(1);
  const [mau, setMau] = useState<MauXuat>(() => MAU_XUAT.find((m) => !mauBiKhoa(m.ma, n).khoa)?.ma ?? "xlsx");
  const [nguoiNhan, setNguoiNhan] = useState<NguoiNhan>(NGUOI_NHAN_MAC_DINH);
  const [lanDung, setLanDung] = useState(0);
  const [dangLam, setDangLam] = useState(false);
  const [ketQua, setKetQua] = useState<KetQuaXong | null>(null);

  const dung = useMemo((): { ban: BanXuat } | { loi: string } => {
    void lanDung;
    try {
      return { ban: banXuatTuDong(mo.dong, { mau, nguoiNhan, cot: mo.cot, today: mo.today, tenSan: mo.tenSan, tenNguoiGui: mo.tenNguoiGui, tuVung: mo.tuVung }) };
    } catch (e) {
      return { loi: e instanceof Error ? e.message : String(e) };
    }
  }, [mo, mau, nguoiNhan, lanDung]);

  const dn = dinhNghiaMau(mau);
  const toi = (i: number) => {
    setBuoc(i);
    setDenDuoc((d) => Math.max(d, i + 1));
    setKetQua(null);
  };

  const xuat = async () => {
    if (!("ban" in dung)) return;
    setDangLam(true);
    const mt: MoiTruong = {
      clipboard: navigator.clipboard,
      fetch: (url, init) => fetch(url, init),
      dungTep,
      taiVe,
    };
    setKetQua(await lamXuat(dung.ban, mo.today, mt));
    setDangLam(false);
  };

  let than: React.ReactNode;
  if (buoc === 0) {
    than = (
      <RadioGroup value={mau} onValueChange={(v) => setMau(v as MauXuat)} aria-label="Mẫu" className="flex flex-col gap-2">
        {MAU_XUAT.map((m) => {
          const k = mauBiKhoa(m.ma, n);
          return <LuaChon key={m.ma} value={m.ma} nhan={m.nhan} ghiChu={k.khoa ? k.loi : GHI_CHU_MAU[m.ma]} icon={ICON_MAU[m.ma]} chon={m.ma === mau} khoa={k.khoa} />;
        })}
      </RadioGroup>
    );
  } else if (buoc === 1) {
    than = (
      <RadioGroup value={nguoiNhan} onValueChange={(v) => setNguoiNhan(v as NguoiNhan)} aria-label="Người nhận" className="flex flex-col gap-2">
        {NGUOI_NHAN_CHON.map((c) => (
          <LuaChon key={c.ma} value={c.ma} nhan={c.nhan} ghiChu={c.ghiChu} icon={c.icon} chon={c.ma === nguoiNhan} />
        ))}
      </RadioGroup>
    );
  } else if (!("ban" in dung)) {
    than = (
      <TrangThai
        kind="error"
        title="Chưa dựng được bản xem trước"
        description={
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setLanDung((x) => x + 1)}>
            Thử lại
          </Button>
        }
      />
    );
  } else if (buoc === 2) {
    than = <XemTruoc ban={dung.ban} />;
  } else {
    than = (
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          {dn.loai === "bai"
            ? "Bấm «Chép bài» rồi tự dán vào nhóm hay tin nhắn và bấm gửi — hệ thống không gửi, không đăng ở đâu."
            : `Bấm «Tải file» để lưu ${tenTep(mau, mo.today)} về máy.`}
        </p>
        {ketQua === null ? null : ketQua.ok ? (
          <>
            <TrangThai kind="notice" title={ketQua.thongBao} />
            {ketQua.chuaGhi ? <TrangThai kind="error" title={ketQua.chuaGhi} description="Lần xuất này không được đếm." /> : null}
          </>
        ) : (
          <TrangThai kind="error" title={ketQua.loi} description="Thử bấm lại." />
        )}
      </div>
    );
  }

  const hanhDong = (
    <>
      {buoc > 0 ? (
        <Button type="button" variant="outline" onClick={() => toi(buoc - 1)} disabled={dangLam}>
          Quay lại
        </Button>
      ) : null}
      {buoc < BUOC.length - 1 ? (
        <Button type="button" onClick={() => toi(buoc + 1)} disabled={mauBiKhoa(mau, n).khoa}>
          Tiếp
        </Button>
      ) : (
        <Button type="button" onClick={() => void xuat()} disabled={dangLam || !("ban" in dung)}>
          {dn.loai === "bai" ? <CopyIcon data-icon="inline-start" aria-hidden="true" /> : <DownloadIcon data-icon="inline-start" aria-hidden="true" />}
          {dn.loai === "bai" ? "Chép bài" : "Tải file"}
        </Button>
      )}
    </>
  );

  return (
    <HopBuoc
      open
      onOpenChange={(o) => (o ? null : onDong())}
      tieuDe="Xuất bảng hàng"
      moTa="Chọn mẫu và người nhận, xem trước rồi chép bài hay tải file."
      nhanRay="Các bước"
      buoc={BUOC}
      dangMo={BUOC[buoc]!.id}
      denDuoc={denDuoc}
      onChonBuoc={(id) => {
        const i = BUOC.findIndex((b) => b.id === id);
        if (i >= 0 && i < denDuoc) toi(i);
      }}
      tomTat={[`${n} căn`, dn.nhan, NHAN_NGUOI_NHAN[nguoiNhan]]}
      hanhDong={hanhDong}
    >
      {than}
    </HopBuoc>
  );
}
