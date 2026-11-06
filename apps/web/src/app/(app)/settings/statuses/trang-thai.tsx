"use client";

// Thân màn Cài đặt › Sàn › Trạng thái (hàng 46): một khung settings-3 (MucCaiDatKhoi) — sáu nhóm theo sáu trạng thái
// chuẩn, mỗi nhóm huy hiệu màu + nhãn mặc định, dưới là các nhãn riêng neo vào (ô chữ · số căn đang mang · gỡ) và «Thêm
// nhãn» khi chưa đủ 3. Gỡ một nhãn đang có căn mang → hộp hỏi nhãn thay cùng nhóm. Chân khung: «Lưu» một lượt PUT.
import { useMemo, useRef, useState, type FormEvent } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { STANDARD_STATUSES } from "@quy-hang/core/listing";

import { MucCaiDatKhoi } from "@/components/khoi/settings-3/muc-cai-dat";
import { SettingField } from "@/components/khoi/settings-3/setting-field";
import { Badge } from "@/components/reui/badge";
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
import { FieldError, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MAU_TRANG_THAI } from "@/lib/mau-trang-thai";

import {
  boGo,
  canHoi,
  cauHoi,
  chonThay,
  coTheLuu,
  coTheThem,
  doiChu,
  goNhan,
  loiCuaO,
  luaChonThay,
  manBanDau,
  oCuaNeo,
  thanLuu,
  themNhan,
  type BoTrangThaiMan,
  type ManTrangThai,
} from "./trang-thai-thuan";

type TrangThaiLuu = { loai: "yen" } | { loai: "dang-luu" } | { loai: "da-luu" } | { loai: "loi"; cau: string };

export function TrangThaiRieng({ bo: boDau, thu = false }: { bo: BoTrangThaiMan; /** Bản mẫu: lưu giả, không đường ghi. */ thu?: boolean }) {
  const [bo, setBo] = useState(boDau);
  const [m, setM] = useState<ManTrangThai>(() => manBanDau(boDau));
  const [luu, setLuu] = useState<TrangThaiLuu>({ loai: "yen" });
  const [hoi, setHoi] = useState<{ khoa: string; chon: string | null | undefined } | null>(null);
  const luuDuoc = useMemo(() => coTheLuu(m), [m]);
  // Bấm «Gỡ và chuyển» cũng đóng hộp — cờ này để lượt đóng ấy không hoàn lại việc gỡ.
  const xacNhan = useRef(false);

  const doi = (moi: ManTrangThai) => {
    setM(moi);
    if (luu.loai !== "dang-luu") setLuu({ loai: "yen" });
  };

  const bamGo = (khoa: string) => {
    const da = goNhan(m, khoa);
    const o = da.o.find((x) => x.khoa === khoa);
    doi(da);
    if (o && canHoi(o)) setHoi({ khoa, chon: undefined });
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
      const res = await fetch("/api/v1/company/statuses", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(than) });
      if (!res.ok) {
        const loi = (await res.json().catch(() => null)) as { reason?: string } | null;
        setLuu({ loai: "loi", cau: res.status === 403 ? "Chỉ quản trị sàn đổi được trạng thái." : loi?.reason ? `Máy chủ từ chối: ${loi.reason}` : "Máy chủ chưa lưu được." });
        return;
      }
      const moi = (await res.json()) as BoTrangThaiMan;
      setBo(moi);
      setM(manBanDau(moi));
      setLuu({ loai: "da-luu" });
    } catch {
      setLuu({ loai: "loi", cau: "Không gửi được — kiểm tra mạng rồi lưu lại." });
    }
  }

  const oHoi = hoi ? m.o.find((x) => x.khoa === hoi.khoa) : undefined;

  return (
    <form onSubmit={guiLuu} onKeyDown={(e) => e.key === "Enter" && e.target instanceof HTMLInputElement && e.preventDefault()}>
      <MucCaiDatKhoi
        tieuDe="Nhãn trạng thái của sàn"
        moTa="Mỗi nhãn neo vào một trạng thái chuẩn và nhận luật, màu của trạng thái đó. Báo cáo vẫn đếm theo sáu trạng thái chuẩn."
        chan={
          <div className="flex w-full flex-col items-end gap-3">
            {luu.loai === "loi" ? <TrangThai kind="error" title="Chưa lưu được trạng thái" description={luu.cau} className="w-full" /> : null}
            {luu.loai === "da-luu" ? <TrangThai kind="notice" title="Đã lưu trạng thái" description="Bảng hàng và Hôm nay dùng nhãn mới từ lần mở kế." className="w-full" /> : null}
            <Button type="submit" disabled={!luuDuoc || luu.loai === "dang-luu"}>
              {luu.loai === "dang-luu" ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        }
      >
        {STANDARD_STATUSES.map((s, i) => {
          const dong = bo.statuses.find((x) => x.status === s);
          const nhan = oCuaNeo(m, s);
          return (
            <div key={s}>
              {i > 0 ? <FieldSeparator /> : null}
              <FieldSet className="gap-0">
                <FieldLegend variant="label" className="mb-0 flex items-center gap-2 px-4 pt-4">
                  <Badge variant={MAU_TRANG_THAI[s]}>{dong?.default ?? s}</Badge>
                  <span className="text-muted-foreground text-xs">Trạng thái chuẩn · nhãn riêng nhận luật và màu này</span>
                </FieldLegend>
                {nhan.map((o, j) => {
                  const loi = loiCuaO(m, o.khoa);
                  return (
                    <SettingField
                      key={o.khoa}
                      title={o.code ? "Nhãn riêng" : "Nhãn mới"}
                      description={o.code ? `${o.inUse} căn đang mang` : "Chưa lưu"}
                      labelFor={o.khoa}
                      last={j === nhan.length - 1 && !coTheThem(m, s)}
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <Input id={o.khoa} value={o.label} placeholder="Ví dụ: Giữ chỗ" aria-invalid={loi ? true : undefined} onChange={(e) => doi(doiChu(m, o.khoa, e.target.value))} />
                          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Gỡ nhãn ${o.label || "mới"}`} onClick={() => bamGo(o.khoa)}>
                            <Trash2Icon />
                          </Button>
                        </div>
                        {loi ? <FieldError>{loi}</FieldError> : null}
                      </div>
                    </SettingField>
                  );
                })}
                {coTheThem(m, s) ? (
                  <div className="px-4 py-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => doi(themNhan(m, s))}>
                      <PlusIcon />
                      Thêm nhãn
                    </Button>
                  </div>
                ) : null}
              </FieldSet>
            </div>
          );
        })}
      </MucCaiDatKhoi>

      <AlertDialog
        open={!!oHoi}
        onOpenChange={(mo) => {
          if (mo || !hoi) return;
          if (!xacNhan.current) doi(boGo(m, hoi.khoa));
          xacNhan.current = false;
          setHoi(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gỡ nhãn «{oHoi?.label}»?</AlertDialogTitle>
            <AlertDialogDescription>{oHoi ? cauHoi(oHoi) : null}</AlertDialogDescription>
          </AlertDialogHeader>
          {hoi ? (
            <RadioGroup value={hoi.chon === undefined ? "" : (hoi.chon ?? "__mac-dinh")} onValueChange={(v) => setHoi({ ...hoi, chon: v === "__mac-dinh" ? null : (v as string) })} aria-label="Nhãn thay" className="flex flex-col gap-2">
              {luaChonThay(m, hoi.khoa).map((c) => {
                const id = `thay-${c.value ?? "mac-dinh"}`;
                return (
                  <div key={id} className="flex items-center gap-2">
                    <RadioGroupItem id={id} value={c.value ?? "__mac-dinh"} />
                    <Label htmlFor={id}>{c.label}</Label>
                  </div>
                );
              })}
            </RadioGroup>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Giữ nhãn</AlertDialogCancel>
            <AlertDialogAction
              disabled={!hoi || hoi.chon === undefined || !oHoi?.code}
              onClick={() => {
                if (hoi && hoi.chon !== undefined && oHoi?.code) {
                  xacNhan.current = true;
                  doi(chonThay(m, oHoi.code, hoi.chon));
                }
                setHoi(null);
              }}
            >
              Gỡ và chuyển
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
