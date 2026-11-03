"use client";

// Màn Tôi (hàng 38): sáu nhóm dòng theo `nhomDong`, mỗi dòng nhãn · trạng thái · một nút. Cách vẽ theo lối chọn ở trang
// ba lối (ADR-0019) — `loi` chỉ đổi khối dựng, dữ liệu và hành động giữ nguyên. Hỏi xác nhận «Báo mất máy» qua AlertDialog
// kiểu nguy hiểm như hỏi đăng xuất.
import { BellRingIcon, BuildingIcon, LogOutIcon, MonitorSmartphoneIcon, SmartphoneIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { MucCaiDatKhoi } from "@/components/khoi/settings-3/muc-cai-dat";
import { SettingField } from "@/components/khoi/settings-3/setting-field";
import { PrivacySettings } from "@/components/khoi/settings-2/privacy-settings";
import { SettingRow } from "@/components/khoi/settings-2/setting-row";
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
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
import { BUOC_CAI_IOS } from "@/lib/push/nhan";
import { NHAN_LOAI_MAY, type LoaiMay } from "@quy-hang/core/thiet-bi";
import type { TrangThaiThietBi } from "@/lib/push/dang-ky";
import { coNutBaoMat, dongThongBao, HOI_BAO_MAT, LOI_DA_BAO, NHAN_CAI, nhomDong, type MaNhom, type TrangThaiCai, type TrangThaiMay } from "./toi";

export type Loi = "trong-kho" | "reui" | "ve-moi";
export type MayDong = { id: string; kind: LoaiMay; browser: string; lastUsedAt: string; current: boolean };

export type DuLieuToi = {
  email: string;
  tenSan: string;
  soSan: number;
  cai: TrangThaiCai;
  thongBao: TrangThaiThietBi;
  may: TrangThaiMay;
  dsMay: MayDong[];
};
export type HanhDongToi = { cai(): void; batThongBao(): void; baoMat(): void; thuLaiMay(): void; dangXuat(): void };

const ICON: Record<MaNhom, ReactNode> = {
  "ho-so": <UserIcon aria-hidden="true" />,
  san: <BuildingIcon aria-hidden="true" />,
  cai: <SmartphoneIcon aria-hidden="true" />,
  "thong-bao": <BellRingIcon aria-hidden="true" />,
  may: <MonitorSmartphoneIcon aria-hidden="true" />,
  "dang-xuat": <LogOutIcon aria-hidden="true" />,
};

const lanCuoi = (iso: string) => new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

type Dong = { ma: MaNhom; nhan: string; moTa: ReactNode; hanhDong?: ReactNode };

function dungDong(du: DuLieuToi, hd: HanhDongToi, moHoi: () => void): Dong[] {
  return nhomDong({ companies: Array.from({ length: du.soSan }) }).map((n): Dong => {
    switch (n.ma) {
      case "ho-so":
        return { ma: n.ma, nhan: n.nhan, moTa: du.email };
      case "san":
        return {
          ma: n.ma,
          nhan: n.nhan,
          moTa: du.tenSan,
          hanhDong: n.doiSan ? (
            <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/select-company" />}>
              Đổi sàn
            </Button>
          ) : undefined,
        };
      case "cai":
        return {
          ma: n.ma,
          nhan: n.nhan,
          moTa:
            du.cai === "ios-ba-buoc" ? (
              <ol className="list-decimal ps-5">
                {BUOC_CAI_IOS.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ol>
            ) : (
              NHAN_CAI[du.cai]
            ),
          hanhDong:
            du.cai === "co-nut" ? (
              <Button size="sm" onClick={hd.cai}>
                Cài
              </Button>
            ) : undefined,
        };
      case "thong-bao": {
        const d = dongThongBao(du.thongBao);
        return {
          ma: n.ma,
          nhan: n.nhan,
          moTa: d?.nhan ?? "Đang kiểm…",
          hanhDong: d?.coNut ? (
            <Button size="sm" onClick={hd.batThongBao}>
              Bật
            </Button>
          ) : undefined,
        };
      }
      case "may":
        return { ma: n.ma, nhan: n.nhan, moTa: <DanhSachMay du={du} hd={hd} />, hanhDong: coNutBaoMat(du.may) ? (
          <Button size="sm" variant="destructive" onClick={moHoi} disabled={du.may.loai === "dang-bao"}>
            Báo mất máy
          </Button>
        ) : undefined };
      case "dang-xuat":
        return {
          ma: n.ma,
          nhan: n.nhan,
          moTa: "Xoá dữ liệu Quỹ hàng của bạn trên máy này",
          hanhDong: (
            <Button size="sm" variant="outline" onClick={hd.dangXuat}>
              Đăng xuất
            </Button>
          ),
        };
    }
  });
}

function DanhSachMay({ du, hd }: { du: DuLieuToi; hd: HanhDongToi }) {
  if (du.may.loai === "dang-doc") return <span>Đang tải…</span>;
  if (du.may.loai === "loi")
    return (
      <TrangThai
        kind="error"
        title="Không đọc được danh sách máy"
        hanhDong={
          <Button size="sm" variant="outline" onClick={hd.thuLaiMay}>
            Thử lại
          </Button>
        }
      />
    );
  return (
    <span className="flex flex-col gap-1">
      {du.may.loai === "da-bao" ? <span>{LOI_DA_BAO(du.may.daThu)}</span> : null}
      {du.dsMay.map((m) => (
        <span key={m.id}>
          {NHAN_LOAI_MAY[m.kind]}
          {m.browser ? ` · ${m.browser}` : ""} · {m.current ? "Máy này" : `dùng ${lanCuoi(m.lastUsedAt)}`}
        </span>
      ))}
      {du.may.loai === "mot-may" ? <span>Chỉ có máy này</span> : null}
    </span>
  );
}

function TrongKho({ dong }: { dong: Dong[] }) {
  return (
    <MucCaiDatKhoi tieuDe="Tôi">
      {dong.map((d, i) => (
        <SettingField key={d.ma} title={d.nhan} description="" last={i === dong.length - 1} contentClassName="text-sm">
          <div className="flex flex-col items-start gap-2">
            <div>{d.moTa}</div>
            {d.hanhDong}
          </div>
        </SettingField>
      ))}
    </MucCaiDatKhoi>
  );
}

function Reui({ dong }: { dong: Dong[] }) {
  return (
    <PrivacySettings title="Tài khoản và máy" description="Mỗi dòng một việc: cài, bật thông báo, báo mất máy, đăng xuất.">
      {dong.map((d) => (
        <SettingRow key={d.ma} icon={ICON[d.ma]} title={d.nhan} description={d.moTa}>
          {d.hanhDong}
        </SettingRow>
      ))}
    </PrivacySettings>
  );
}

function VeMoi({ dong }: { dong: Dong[] }) {
  return (
    <div className="flex flex-col gap-4">
      {dong.map((d) => (
        <Frame key={d.ma} className="w-full">
          <FrameHeader>
            <FrameTitle>{d.nhan}</FrameTitle>
            <FrameDescription>{d.moTa}</FrameDescription>
          </FrameHeader>
          {d.hanhDong ? <FramePanel className="flex justify-end">{d.hanhDong}</FramePanel> : null}
        </Frame>
      ))}
    </div>
  );
}

export function ManToi({ loi, du, hd }: { loi: Loi; du: DuLieuToi; hd: HanhDongToi }) {
  const [hoi, setHoi] = useState(false);
  const dong = dungDong(du, hd, () => setHoi(true));
  return (
    <>
      {loi === "trong-kho" ? <TrongKho dong={dong} /> : loi === "ve-moi" ? <VeMoi dong={dong} /> : <Reui dong={dong} />}
      <AlertDialog open={hoi} onOpenChange={setHoi}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Báo mất máy?</AlertDialogTitle>
            <AlertDialogDescription>{HOI_BAO_MAT}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ở lại</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setHoi(false);
                hd.baoMat();
              }}
            >
              Đăng xuất mọi máy khác
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
