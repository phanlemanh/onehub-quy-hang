"use client";

import Link from "next/link";
import { PhoneIcon } from "lucide-react";

import { ChoTai } from "@/components/bo-cuc";
import { CapGiaTri, DauHoSo, MucHoSo, ThanHoSo } from "@/components/khoi/solution-crm-4/ho-so";
import { Badge } from "@/components/reui/badge";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";

import { CHU, giaTy, NHAN_LOAI, NHAN_NHU_CAU, NHAN_SO, NHAN_SU_KIEN, NHAN_TRANG_THAI_HANG, nhanPha, tenCan, type CoHoi, type HoSo } from "./lien-he";

// Hồ sơ một người — lối Trong kho (chủ kho chọn ở Cổng Phạm vi hàng 103, Hỏi-5): một cột theo khuôn hồ sơ căn (solution-crm-4
// đã chuyển thể): đầu hồ sơ · Số · Cơ hội · Căn · Dòng thời gian, các mục in hoa xếp chồng.

export type TrangThaiHoSo = { kieu: "dang-tai" } | { kieu: "loi" } | { kieu: "xong"; hs: HoSo };
/** Số đã mở của hồ sơ đang xem: phoneId → số rõ; «loi» khi mở hỏng. Chỉ trong state, rời hồ sơ là mất. */
export type SoDaMo = Record<string, string | "loi">;

const TONE_PHA = {
  cultivate: "outline",
  appointment: "info-light",
  active: "success-light",
  under_contract: "warning-light",
  closed: "success-light",
  closed_out: "outline",
} as const;

function DongCoHoi({ o }: { o: CoHoi }) {
  const chu =
    o.side === "seller" ? (
      <>
        <span className="text-muted-foreground">{NHAN_NHU_CAU[o.need] ?? o.need} · </span>
        {tenCan(o.unit.buildingName, o.unit.unitNumber)}
      </>
    ) : (
      <>
        <span className="text-muted-foreground">{NHAN_NHU_CAU[o.need] ?? o.need} · </span>
        {o.agentName ?? "—"} · {o.shareCount} lần gửi
      </>
    );
  return (
    <li className="flex items-center justify-between gap-2 text-sm" data-co-hoi={o.side}>
      {o.side === "seller" && o.listingId ? (
        <Link href={`/inventory?listing=${o.listingId}`} className="min-w-0 truncate hover:underline">
          {chu}
        </Link>
      ) : (
        <span className="min-w-0 truncate">{chu}</span>
      )}
      <Badge variant={TONE_PHA[o.phase]}>{nhanPha(o.phase)}</Badge>
    </li>
  );
}

export function HoSoNguoi({
  tt,
  daMo,
  onHienSo,
  onThuLai,
}: {
  tt: TrangThaiHoSo;
  daMo: SoDaMo;
  onHienSo: (phoneId: string) => void;
  onThuLai: () => void;
}) {
  if (tt.kieu === "dang-tai") return <ChoTai kieu="ho-so" />;
  if (tt.kieu === "loi")
    return (
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
  const { contact: c, phones, opportunities, listings, timeline } = tt.hs;
  const loai = c.contactTypes.map((t) => NHAN_LOAI[t] ?? t).join(" · ");
  return (
    <ThanHoSo>
      <DauHoSo
        ngu={`${loai}${c.holderName ? ` · ${c.holderName} giữ` : ""}`}
        ten={c.name ?? "[Chưa có tên]"}
        trangThai={c.status === "lead" ? CHU.lead : CHU.lienHe}
        trangThaiTone={c.status === "lead" ? "warning-light" : "success-light"}
        phu={`${phones.length} số · ${opportunities.length} cơ hội · ${listings.length} căn`}
      />
      <MucHoSo tieuDe="Số">
        {phones.length === 0 ? (
          <p className="text-muted-foreground text-sm">{CHU.chuaCoSo}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {phones.map((p) => {
              const so = daMo[p.phoneId];
              const ro = so && so !== "loi" ? so : null;
              return (
                <li key={p.phoneId} className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground shrink-0">
                      {(p.label && NHAN_SO[p.label]) ?? "Số"}
                      {p.isPrimary ? " · chính" : ""}
                    </span>
                    <span className="grow tabular-nums">{ro ?? `••• ${p.tail}`}</span>
                    {ro ? (
                      <Button size="sm" nativeButton={false} render={<a href={`tel:${ro.replace(/\s/g, "")}`} />}>
                        <PhoneIcon aria-hidden="true" /> {CHU.goi}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => onHienSo(p.phoneId)}>
                        {CHU.hienSo}
                      </Button>
                    )}
                  </div>
                  {so === "loi" ? <p className="text-destructive text-xs">{CHU.moSoLoi}</p> : null}
                </li>
              );
            })}
          </ul>
        )}
      </MucHoSo>
      <MucHoSo tieuDe="Cơ hội">
        {opportunities.length ? (
          <ul className="flex flex-col gap-2">
            {opportunities.map((o) => (
              <DongCoHoi key={o.side === "seller" ? o.leadId : o.prospectId} o={o} />
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">—</p>
        )}
      </MucHoSo>
      <MucHoSo tieuDe="Căn">
        {listings.length ? (
          <CapGiaTri ds={listings.map((h) => [tenCan(h.buildingName, h.unitNumber), `${NHAN_TRANG_THAI_HANG[h.status] ?? h.status} · ${giaTy(h.listPrice)}`])} />
        ) : (
          <p className="text-muted-foreground text-sm">—</p>
        )}
      </MucHoSo>
      <MucHoSo tieuDe="Dòng thời gian">
        <ul className="flex flex-col gap-2">
          {timeline.map((e, i) => (
            <li key={`${e.kind}-${e.at}-${i}`} className="flex items-baseline justify-between gap-2 text-sm">
              <span className="min-w-0 truncate">{NHAN_SU_KIEN[e.kind] ?? e.kind}</span>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">{new Date(e.at).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</span>
            </li>
          ))}
        </ul>
      </MucHoSo>
    </ThanHoSo>
  );
}
