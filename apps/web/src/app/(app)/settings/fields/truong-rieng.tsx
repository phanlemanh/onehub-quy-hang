"use client";

// Thân màn Cài đặt › Sàn › Trường riêng (hàng 47): một khung settings-3 (MucCaiDatKhoi) — hai nhóm «Trường của hàng» và
// «Trường của liên hệ». Mỗi trường một dòng: tên (máy dò trùng nghĩa ngay khi gõ), kiểu và loại liên hệ (chỉ chọn lúc tạo),
// lựa chọn của «chọn một», huy hiệu «Thông tin chủ nhà» khi lớp nguồn, «Bỏ trường» (hộp hỏi). Chân khung: «Lưu» một lượt PUT.
import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { CONTACT_TYPES, CONTACT_TYPE_LABELS } from "@quy-hang/core/contacts";
import { NHAN_KIEU, TRAN_TRUONG, boTuThan, type DoiTuong, type KieuTruong, type TruongRieng } from "@quy-hang/core/custom-fields";
import type { TuVung } from "@quy-hang/core/labels";

import { MucCaiDatKhoi } from "@/components/khoi/settings-3/muc-cai-dat";
import { SettingField } from "@/components/khoi/settings-3/setting-field";
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
import { FieldError, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  boTruong,
  coTheLuu,
  coTheThem,
  coTheThemLuaChon,
  doiChu,
  doiChuLuaChon,
  doiKieu,
  doiLoai,
  giuTruong,
  goLuaChon,
  laNguon,
  loiCuaO,
  manBanDau,
  oCua,
  thanLuu,
  themLuaChon,
  themTruong,
  trungNghia,
  type ManTruong,
  type OTruong,
} from "./truong-rieng-thuan";

type TrangThaiLuu = { loai: "yen" } | { loai: "dang-luu" } | { loai: "da-luu" } | { loai: "loi"; cau: string };

const NHOM: { target: DoiTuong; tieuDe: string; moTa: string }[] = [
  { target: "listing", tieuDe: "Trường của hàng", moTa: "Hiện thành cột ở Bảng hàng, lọc được; không ra trang khách." },
  { target: "contact", tieuDe: "Trường của liên hệ", moTa: "Hiện ở hồ sơ người mang loại đã chọn. Trường của chủ nhà là thông tin chủ nhà, không rời sàn." },
];

export function TruongRiengMan({
  bo: boDau,
  tuVung,
  thu = false,
}: {
  bo: TruongRieng[];
  /** Tên riêng sàn đặt cho trường chuẩn (hàng 45) — máy dò so cả với chúng. */
  tuVung?: TuVung | null;
  /** Bản mẫu: lưu giả, không đường ghi. */
  thu?: boolean;
}) {
  const [m, setM] = useState<ManTruong>(() => manBanDau(boDau));
  const [luu, setLuu] = useState<TrangThaiLuu>({ loai: "yen" });
  const [hoiBo, setHoiBo] = useState<string | null>(null);
  const luuDuoc = useMemo(() => coTheLuu(m, tuVung), [m, tuVung]);
  const xacNhan = useRef(false);

  const doi = (moi: ManTruong) => {
    setM(moi);
    if (luu.loai !== "dang-luu") setLuu({ loai: "yen" });
  };

  async function guiLuu(e: FormEvent) {
    e.preventDefault();
    if (!luuDuoc || luu.loai === "dang-luu") return;
    setLuu({ loai: "dang-luu" });
    const than = thanLuu(m);
    if (thu) {
      setLuu({ loai: "da-luu" });
      return;
    }
    try {
      const res = await fetch("/api/v1/company/fields", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(than) });
      if (!res.ok) {
        const loi = (await res.json().catch(() => null)) as { reason?: string } | null;
        setLuu({ loai: "loi", cau: res.status === 403 ? "Chỉ quản trị sàn đổi được trường riêng." : loi?.reason ? `Máy chủ từ chối: ${loi.reason}` : "Máy chủ chưa lưu được." });
        return;
      }
      setM(manBanDau(boTuThan((await res.json()) as { fields?: unknown[] })));
      setLuu({ loai: "da-luu" });
    } catch {
      setLuu({ loai: "loi", cau: "Không gửi được — kiểm tra mạng rồi lưu lại." });
    }
  }

  const oBo = hoiBo ? m.o.find((x) => x.khoa === hoiBo) : undefined;

  return (
    <form onSubmit={guiLuu} onKeyDown={(e) => e.key === "Enter" && e.target instanceof HTMLInputElement && e.preventDefault()}>
      <MucCaiDatKhoi
        tieuDe="Trường riêng của sàn"
        moTa={`Trước khi thêm: cùng nghĩa khác tên thì đổi tên ở Cách gọi; chỉ trường thật sự mới mới thành trường riêng. Tối đa ${TRAN_TRUONG} trường.`}
        chan={
          <div className="flex w-full flex-col items-end gap-3">
            {luu.loai === "loi" ? <TrangThai kind="error" title="Chưa lưu được trường riêng" description={luu.cau} className="w-full" /> : null}
            {luu.loai === "da-luu" ? <TrangThai kind="notice" title="Đã lưu trường riêng" description="Bảng hàng và hồ sơ liên hệ dùng trường mới từ lần mở kế." className="w-full" /> : null}
            <Button type="submit" disabled={!luuDuoc || luu.loai === "dang-luu"}>
              {luu.loai === "dang-luu" ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        }
      >
        {NHOM.map((nhom, i) => {
          const ds = oCua(m, nhom.target);
          return (
            <div key={nhom.target}>
              {i > 0 ? <FieldSeparator /> : null}
              <FieldSet className="gap-0">
                <FieldLegend variant="label" className="mb-0 flex flex-col gap-0.5 px-4 pt-4">
                  <span>{nhom.tieuDe}</span>
                  <span className="text-muted-foreground text-xs font-normal">{nhom.moTa}</span>
                </FieldLegend>
                {ds.length === 0 ? <p className="text-muted-foreground px-4 pt-3 text-sm">Chưa có trường nào.</p> : null}
                {ds.map((o, j) => (
                  <DongTruong key={o.khoa} o={o} m={m} tuVung={tuVung} last={j === ds.length - 1 && !coTheThem(m)} doi={doi} bamBo={() => (o.code ? setHoiBo(o.khoa) : doi(boTruong(m, o.khoa)))} />
                ))}
                {coTheThem(m) ? (
                  <div className="px-4 py-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => doi(themTruong(m, nhom.target))}>
                      <PlusIcon />
                      Thêm trường
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground px-4 py-3 text-xs">Đã đủ {TRAN_TRUONG} trường — bỏ bớt để thêm.</p>
                )}
              </FieldSet>
            </div>
          );
        })}
      </MucCaiDatKhoi>

      <AlertDialog
        open={!!oBo}
        onOpenChange={(mo) => {
          if (mo) return;
          xacNhan.current = false;
          setHoiBo(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bỏ trường «{oBo?.labelDaLuu ?? oBo?.label}»?</AlertDialogTitle>
            <AlertDialogDescription>Giá trị đã ghi vẫn giữ, trường thôi hiện ở Bảng hàng và hồ sơ liên hệ. Lưu mới bỏ thật.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Giữ trường</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (hoiBo) doi(boTruong(m, hoiBo));
                setHoiBo(null);
              }}
            >
              Bỏ trường
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {m.o.some((o) => o.bo) ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {m.o
            .filter((o) => o.bo)
            .map((o) => (
              <Button key={o.khoa} type="button" variant="ghost" size="sm" onClick={() => doi(giuTruong(m, o.khoa))}>
                Giữ lại «{o.labelDaLuu ?? o.label}» (sẽ bỏ khi Lưu)
              </Button>
            ))}
        </div>
      ) : null}
    </form>
  );
}

function DongTruong({
  o,
  m,
  tuVung,
  last,
  doi,
  bamBo,
}: {
  o: OTruong;
  m: ManTruong;
  tuVung?: TuVung | null;
  last: boolean;
  doi: (m: ManTruong) => void;
  bamBo: () => void;
}) {
  const loi = loiCuaO(m, o.khoa);
  const trung = trungNghia(m, o.khoa, tuVung);
  const moi = !o.code;
  return (
    <SettingField
      title={moi ? "Trường mới" : (o.labelDaLuu ?? o.label)}
      description={moi ? "Chưa lưu" : `${NHAN_KIEU[o.kind]}${o.kind === "single_select" ? ` · ${o.options.length} lựa chọn` : ""}${o.target === "contact" ? ` · ${o.contactTypes.map((t) => CONTACT_TYPE_LABELS[t]).join(", ")}` : ""}`}
      badge={laNguon(o) ? { label: "Thông tin chủ nhà", variant: "warning-light" } : undefined}
      labelFor={o.khoa}
      last={last}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Input id={o.khoa} value={o.label} placeholder={o.target === "listing" ? "Ví dụ: Căn góc" : "Ví dụ: Nguồn khách"} aria-invalid={loi || trung ? true : undefined} onChange={(e) => doi(doiChu(m, o.khoa, e.target.value))} />
          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Bỏ trường ${o.label || "mới"}`} onClick={bamBo}>
            <Trash2Icon />
          </Button>
        </div>
        {trung ? (
          <TrangThai
            kind="notice"
            title="Trùng nghĩa một trường chuẩn"
            description={`${trung}. Cùng nghĩa khác tên thì đặt tên riêng cho trường chuẩn, không tạo trường mới.`}
            hanhDong={
              <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/settings/labels" />}>
                Mở Cách gọi
              </Button>
            }
          />
        ) : null}
        {loi ? <FieldError>{loi}</FieldError> : null}
        {moi ? (
          <RadioGroup value={o.kind} onValueChange={(v) => doi(doiKieu(m, o.khoa, v as KieuTruong))} aria-label="Kiểu trường" className="flex flex-row gap-4">
            {(["bool", "single_select"] as const).map((k) => (
              <div key={k} className="flex items-center gap-2">
                <RadioGroupItem id={`${o.khoa}-${k}`} value={k} />
                <Label htmlFor={`${o.khoa}-${k}`}>{NHAN_KIEU[k]}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : null}
        {moi && o.target === "contact" ? (
          <div className="flex flex-wrap gap-4" role="group" aria-label="Loại liên hệ">
            {CONTACT_TYPES.map((t) => (
              <div key={t} className="flex items-center gap-2">
                <Checkbox id={`${o.khoa}-${t}`} checked={o.contactTypes.includes(t)} onCheckedChange={(c) => doi(doiLoai(m, o.khoa, t, c === true))} />
                <Label htmlFor={`${o.khoa}-${t}`}>{CONTACT_TYPE_LABELS[t]}</Label>
              </div>
            ))}
          </div>
        ) : null}
        {o.kind === "single_select" ? (
          <div className="flex flex-col gap-2">
            {o.options.map((x, k) => (
              <div key={x.khoa} className="flex items-center gap-2">
                <Input aria-label={`Lựa chọn ${k + 1}`} value={x.label} placeholder={`Lựa chọn ${k + 1}`} onChange={(e) => doi(doiChuLuaChon(m, o.khoa, x.khoa, e.target.value))} />
                {x.code ? null : (
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Gỡ lựa chọn ${k + 1}`} onClick={() => doi(goLuaChon(m, o.khoa, x.khoa))}>
                    <XIcon />
                  </Button>
                )}
              </div>
            ))}
            {coTheThemLuaChon(o) ? (
              <Button type="button" variant="ghost" size="sm" className="self-start" onClick={() => doi(themLuaChon(m, o.khoa))}>
                <PlusIcon />
                Thêm lựa chọn
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </SettingField>
  );
}
