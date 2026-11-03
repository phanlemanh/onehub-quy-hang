"use client";

/**
 * Ngăn lọc theo nhu cầu khách và hàng thẻ lọc (hàng 32) — chuyển thể `filter-sidebar.tsx` của khối @reui/filter-sidebar-5
 * (khối đích ở `docs/design/vo-va-ia.md` §2): giữ hàng thẻ lọc đang chạy ở đầu thân ngăn, các mục cách nhau bằng vạch đứt,
 * mục nhiều giá trị là ô tích có số đếm hay nút bật, chân «Xoá lọc · Xem n căn». Đổi: Sheet → `NganNoi` (điện thoại mở
 * từ đáy); mục theo Hỏi-1 — Giá (tỷ, từ–đến), Phòng ngủ, Toà, Diện tích (m², từ–đến), Hướng; thanh trượt giá → hai ô số
 * gõ theo tỷ; bỏ ô màu, cỡ, chất liệu, hãng, sao, công tắc; thẻ lọc dùng `Button` thay thẻ `<button>` trần.
 */
import { XIcon } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { NganNoi } from "@/components/bo-cuc/ngan-noi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DongBang } from "../cot";
import { boTheLoc, locNhuCau, luaChonNhuCau, NHU_CAU_RONG, TEN_MUC, theLoc, type NhuCau } from "./the";

const doi = <T,>(ds: T[], v: T) => (ds.includes(v) ? ds.filter((x) => x !== v) : [...ds, v]);

/** Hàng thẻ lọc đang chạy: chạm × bỏ đúng một thẻ; «Xoá lọc» bỏ hết. */
export function HangTheLoc({ nc, onDoi }: { nc: NhuCau; onDoi: (nc: NhuCau) => void }) {
  const the = theLoc(nc);
  if (!the.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label="Nhu cầu đang lọc">
      {the.map((t) => (
        <Button key={t.khoa} type="button" variant="outline" size="xs" onClick={() => onDoi(boTheLoc(nc, t.khoa))} aria-label={`Bỏ lọc ${t.chu}`}>
          {t.chu}
          <XIcon data-icon="inline-end" aria-hidden="true" className="text-muted-foreground" />
        </Button>
      ))}
      <Button type="button" variant="ghost" size="xs" onClick={() => onDoi(NHU_CAU_RONG)}>
        Xoá lọc
      </Button>
    </div>
  );
}

function VachDut() {
  return (
    <div className="py-5" aria-hidden="true">
      <div className="border-border border-t border-dashed" />
    </div>
  );
}

function Muc({ id, ten, phai, children }: { id: string; ten: string; phai?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3" aria-labelledby={id}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={id} className="text-foreground text-sm font-semibold tracking-tight">
          {ten}
        </h3>
        {phai}
      </div>
      {children}
    </section>
  );
}

function KhoangSo({ id, donVi, tu, den, onDoi }: { id: string; donVi: string; tu?: string; den?: string; onDoi: (tu?: string, den?: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Input id={`${id}-tu`} inputMode="decimal" placeholder="Từ" aria-label={`Từ (${donVi})`} value={tu ?? ""} onChange={(e) => onDoi(e.target.value || undefined, den)} />
      <span className="text-muted-foreground text-sm">–</span>
      <Input id={`${id}-den`} inputMode="decimal" placeholder="Đến" aria-label={`Đến (${donVi})`} value={den ?? ""} onChange={(e) => onDoi(tu, e.target.value || undefined)} />
      <span className="text-muted-foreground shrink-0 text-sm">{donVi}</span>
    </div>
  );
}

function OTich({ id, nhan, so, checked, onDoi }: { id: string; nhan: string; so: number; checked: boolean; onDoi: () => void }) {
  return (
    <li className="flex items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onDoi} />
      <Label htmlFor={id} className="text-foreground flex min-w-0 flex-1 justify-between gap-3 text-sm font-normal">
        <span className="truncate">{nhan}</span>
        <span className="text-muted-foreground tabular-nums">{so}</span>
      </Label>
    </li>
  );
}

/** Ngăn lọc: nháp nhu cầu trong ngăn, «Xem n căn» đếm ngay trên máy rồi áp. */
export function NganLoc({ mo, onMo, dong, nc, onAp }: { mo: boolean; onMo: (mo: boolean) => void; dong: readonly DongBang[]; nc: NhuCau; onAp: (nc: NhuCau) => void }) {
  // Nháp bắt đầu từ nhu cầu đang áp: trang mở ngăn bằng `key` mới mỗi lần, nên ngăn dựng lại từ `nc`.
  const [nhap, setNhap] = useState(nc);
  const lc = useMemo(() => luaChonNhuCau(dong), [dong]);
  const dem = (k: "unitType" | "buildingName" | "directionFaces", v: string) => dong.filter((d) => d[k] === v).length;
  const so = useMemo(() => locNhuCau(dong, nhap).length, [dong, nhap]);

  return (
    <NganNoi
      mo={mo}
      onMo={onMo}
      tieuDe="Lọc theo nhu cầu"
      chan={
        <>
          <Button type="button" variant="outline" onClick={() => setNhap(NHU_CAU_RONG)}>
            Xoá lọc
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={() => {
              onAp(nhap);
              onMo(false);
            }}
          >
            Xem {so} căn
          </Button>
        </>
      }
    >
      <div className="flex flex-col p-4">
        <HangTheLoc nc={nhap} onDoi={setNhap} />
        {theLoc(nhap).length ? <VachDut /> : null}
        <Muc id="loc-gia" ten={TEN_MUC.gia}>
          <KhoangSo id="loc-gia" donVi="tỷ" tu={nhap.giaTu} den={nhap.giaDen} onDoi={(giaTu, giaDen) => setNhap({ ...nhap, giaTu, giaDen })} />
        </Muc>
        <VachDut />
        <Muc id="loc-phong-ngu" ten={TEN_MUC.phongNgu}>
          <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="loc-phong-ngu">
            {lc.phongNgu.map((v) => {
              const bat = nhap.phongNgu.includes(v);
              return (
                <Button key={v} type="button" size="sm" variant={bat ? "default" : "outline"} aria-pressed={bat} className="min-w-12" onClick={() => setNhap({ ...nhap, phongNgu: doi(nhap.phongNgu, v) })}>
                  {v} <span className="tabular-nums opacity-70">{dem("unitType", v)}</span>
                </Button>
              );
            })}
          </div>
        </Muc>
        <VachDut />
        <Muc id="loc-toa" ten={TEN_MUC.toa}>
          <ul className="flex flex-col gap-2.5">
            {lc.toa.map((v) => (
              <OTich key={v} id={`loc-toa-${v}`} nhan={v} so={dem("buildingName", v)} checked={nhap.toa.includes(v)} onDoi={() => setNhap({ ...nhap, toa: doi(nhap.toa, v) })} />
            ))}
          </ul>
        </Muc>
        <VachDut />
        <Muc id="loc-dt" ten={TEN_MUC.dt}>
          <KhoangSo id="loc-dt" donVi="m²" tu={nhap.dtTu} den={nhap.dtDen} onDoi={(dtTu, dtDen) => setNhap({ ...nhap, dtTu, dtDen })} />
        </Muc>
        <VachDut />
        <Muc id="loc-huong" ten={TEN_MUC.huong}>
          <ul className="flex flex-col gap-2.5">
            {lc.huong.map((v) => (
              <OTich key={v} id={`loc-huong-${v}`} nhan={v} so={dem("directionFaces", v)} checked={nhap.huong.includes(v)} onDoi={() => setNhap({ ...nhap, huong: doi(nhap.huong, v) })} />
            ))}
          </ul>
        </Muc>
      </div>
    </NganNoi>
  );
}
