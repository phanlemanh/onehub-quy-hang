"use client";

// Phần chung của ba lối Luồng Gửi (hàng 34, ADR-0019): trạng thái lần gửi, bản ra dựng bằng `banRaNgoai` của lõi (đường
// duy nhất dựng dữ liệu ra ngoài — bất biến 4), tin soạn sẵn từ bản ra, ngăn xem trước dựng chính trang khách, và nút Gửi
// mở bảng chia sẻ của máy (bất biến 3 — người tự bấm gửi trong Zalo). Dữ liệu mẫu, không gọi mạng. Gỡ khi màn thật ra.
import { banRaNgoai, type CanRaNgoai, type NguoiNhan } from "@quy-hang/core/redaction";
import { ImageIcon, PhoneCallIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { NganNoi } from "@/components/bo-cuc";
import { Badge } from "@/components/reui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Item } from "@/components/ui/item";
import { dinhDangGia, FEE_LABEL } from "../../inventory/cot";
import { CAN_MAU, HOM_NAY, KHACH_MAU, LINK_MAU, type CanMau } from "./mau";

/** Luật sản phẩm 25: căn quá 14 ngày chưa xác nhận mang nhắc «Gọi xác nhận trước» — nhắc, không chặn. */
export const NGAY_NHAC_XAC_NHAN = 14;

export function tuoiXacNhan(c: CanMau): number | null {
  const d = c.noiBo.lastConfirmedAt;
  if (!d) return null;
  return Math.round((Date.parse(HOM_NAY) - Date.parse(d)) / 86_400_000);
}
export const canNhac = (c: CanMau) => (tuoiXacNhan(c) ?? Infinity) > NGAY_NHAC_XAC_NHAN;

export const TANG: Record<"high" | "low", string> = { high: "Tầng cao", low: "Tầng thấp" };

/** Tên căn khách thấy: khách riêng không có mã căn — toà + nấc tầng. */
export function tenRa(b: CanRaNgoai): string {
  if (b.unitNumber) return b.unitNumber;
  return [b.buildingName, b.floorBand ? TANG[b.floorBand] : null].filter(Boolean).join(" · ");
}

export function thongSoRa(b: CanRaNgoai): string {
  return [b.livingArea != null ? `${String(b.livingArea).replace(".", ",")} m²` : null, b.bedroomsTotal != null ? `${b.bedroomsTotal} PN` : null, b.directionFaces]
    .filter(Boolean)
    .join(" · ");
}

function taoTin(ban: CanRaNgoai[], nguoiNhan: NguoiNhan, tenKhach: string | null): string {
  const chao = nguoiNhan === "khach_rieng" ? `Chào anh/chị ${tenKhach ?? "[Tên khách]"},` : "Gửi các anh chị nhóm,";
  const dong = ban.map((b, i) => `${i + 1}. ${tenRa(b)} — ${thongSoRa(b)} — ${dinhDangGia(b.listPrice ?? null)}`);
  return [chao, `Em gửi ${ban.length} căn đang bán phù hợp:`, ...dong, `Xem ảnh và chi tiết: ${LINK_MAU}`].join("\n");
}

export type NguoiNhanChon = NguoiNhan | null;

/** Trạng thái một lần gửi — cùng một nguồn cho ba lối, để ảnh so cùng dữ liệu. */
export function useLanGui() {
  const [nguoiNhan, setNguoiNhan] = useState<NguoiNhanChon>("khach_rieng");
  const [khachId, setKhachId] = useState<string | null>("k1");
  const [ds, setDs] = useState<CanMau[]>(CAN_MAU);
  const [tinSua, setTinSua] = useState<string | null>(null);
  const [xem, setXem] = useState(false);
  const [daChep, setDaChep] = useState(false);

  const khach = KHACH_MAU.find((k) => k.id === khachId) ?? null;
  const ban = useMemo(
    () => (nguoiNhan ? ds.map((c) => banRaNgoai(c.noiBo, { cua: "gui_link", nguoiNhan, today: HOM_NAY })) : []),
    [ds, nguoiNhan],
  );
  const tinMacDinh = nguoiNhan ? taoTin(ban, nguoiNhan, khach?.ten ?? null) : "";
  const duNguoiNhan = nguoiNhan === "nhom_moi_gioi" || (nguoiNhan === "khach_rieng" && khach !== null);

  return {
    nguoiNhan,
    chonNguoiNhan: (n: NguoiNhanChon) => {
      setNguoiNhan(n);
      setTinSua(null);
    },
    khach,
    chonKhach: (id: string) => {
      setKhachId(id);
      setTinSua(null);
    },
    ds,
    boCan: (id: string) => setDs((d) => d.filter((c) => c.id !== id)),
    ban,
    tin: tinSua ?? tinMacDinh,
    suaTin: setTinSua,
    duNguoiNhan,
    xem,
    setXem,
    daChep,
    gui: async () => {
      const tin = tinSua ?? tinMacDinh;
      // Máy có bảng chia sẻ: mở nó với tin (link trong thân tin — bài thử Zalo hàng 3); không thì chép tin.
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ text: tin });
          return;
        } catch {
          // Người đóng bảng chia sẻ — không làm gì thêm.
          return;
        }
      }
      try {
        await navigator.clipboard.writeText(tin);
        setDaChep(true);
      } catch {
        setDaChep(false);
      }
    },
  };
}
export type LanGui = ReturnType<typeof useLanGui>;

/** Trang khách — dựng CHỈ từ bản ra (`CanRaNgoai`), họ card như trang `/s/<mã>` của hàng 35. */
export function TrangKhach({ ban, nguoiNhan }: { ban: CanRaNgoai[]; nguoiNhan: NguoiNhan }) {
  const dau = ban[0];
  return (
    <div className="flex flex-col gap-4" data-trang-khach={nguoiNhan}>
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs">
          {dau?.companyName} · {dau?.senderName} gửi
        </p>
        <h2 className="text-foreground text-lg font-semibold tracking-tight">{ban.length} căn đang bán</h2>
      </div>
      {ban.map((b, i) => (
        <Card key={i} size="sm">
          <CardContent>
            <Item variant="muted" className="relative aspect-video overflow-hidden border-0 p-0 shadow-none">
              <ImageIcon aria-hidden="true" className="text-muted-foreground absolute inset-0 m-auto size-6" />
            </Item>
          </CardContent>
          <CardHeader>
            <CardTitle>{tenRa(b)}</CardTitle>
            <CardDescription>{thongSoRa(b)}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-foreground text-base font-semibold tabular-nums">{dinhDangGia(b.listPrice ?? null)}</span>
              {b.feeInclusion ? <span className="text-muted-foreground text-xs">{FEE_LABEL[b.feeInclusion] ?? b.feeInclusion}</span> : null}
            </div>
            {b.confirmedAgeDays != null ? (
              <span className="text-muted-foreground text-xs">Giá xác nhận {b.confirmedAgeDays === 0 ? "hôm nay" : `${b.confirmedAgeDays} ngày trước`}</span>
            ) : null}
          </CardContent>
          <CardContent>
            <Button variant="outline" size="sm" className="w-full">
              Quan tâm
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Ngăn xem trước: phủ toàn màn trên điện thoại (NganNoi toanMan), ngăn phải trên máy tính. */
export function XemTruoc({ g }: { g: LanGui }) {
  if (!g.nguoiNhan) return null;
  return (
    <NganNoi
      toanMan
      mo={g.xem}
      onMo={g.setXem}
      tieuDe={g.nguoiNhan === "khach_rieng" ? `Xem trước — ${g.khach?.ten ?? "khách riêng"} thấy` : "Xem trước — nhóm môi giới thấy"}
      moTa={g.nguoiNhan === "khach_rieng" ? "Khách riêng không thấy mã căn — chỉ toà và nấc tầng." : "Nhóm môi giới thấy mã căn."}
      chan={
        <Button className="w-full" disabled={!g.duNguoiNhan} onClick={() => void g.gui()}>
          Gửi
        </Button>
      }
    >
      <div className="p-trang">
        <TrangKhach ban={g.ban} nguoiNhan={g.nguoiNhan} />
      </div>
    </NganNoi>
  );
}

export function NhacXacNhan() {
  return (
    <Badge variant="warning-light" radius="full" className="gap-1 self-start">
      <PhoneCallIcon aria-hidden="true" />
      Gọi xác nhận trước
    </Badge>
  );
}

/** Chữ của nút Gửi theo trạng thái (đặc tả UX). */
export function chuNutGui(g: LanGui): { chu: string; mo: boolean } {
  if (g.ds.length === 0) return { chu: "Không còn căn", mo: false };
  if (!g.duNguoiNhan) return { chu: "Chọn người nhận", mo: false };
  return { chu: g.daChep ? "Đã chép" : "Gửi", mo: true };
}
