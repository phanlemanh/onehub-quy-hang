"use client";

// Trang quay số trên điện thoại (hàng 30): mở từ thông báo «Gọi chủ nhà». Một nút lớn — bấm thì mở số (một vết) rồi đưa
// trình duyệt tới `tel:`. Số chỉ sống trong trạng thái của trang; tải lại thì ẩn.
import { NEED_LABELS, type Need } from "@quy-hang/core/dedupe";
import Link from "next/link";
import { useEffect, useState } from "react";

import { FramePanel } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { goiFetch } from "@/lib/sync/goi-fetch";
import { chuSo, telHref } from "../../../today/mo-so";
import { docLeadCuocGoi, KHONG_THAY_LEAD, LOI_TAI_LEAD, type KetQuaLead } from "../nguon";
import { goiChuNha } from "./quay-so";

export function TrangQuaySo({ leadId }: { leadId: string | null }) {
  const [tai, setTai] = useState<KetQuaLead | { kind: "dang" }>(leadId ? { kind: "dang" } : { kind: "vang" });
  const [lan, setLan] = useState(0);
  useEffect(() => {
    if (!leadId) return;
    let huy = false;
    void docLeadCuocGoi(goiFetch, leadId).then((kq) => !huy && setTai(kq));
    return () => {
      huy = true;
    };
  }, [leadId, lan]);

  if (tai.kind === "dang")
    return (
      <FramePanel className="flex flex-col gap-3" aria-busy="true">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-12 w-full" />
      </FramePanel>
    );
  if (tai.kind === "vang")
    return (
      <FramePanel className="flex flex-col items-start gap-2">
        <TrangThai kind="notice" title={KHONG_THAY_LEAD} />
        <Button size="sm" nativeButton={false} render={<Link href="/today" />}>
          Về Hôm nay
        </Button>
      </FramePanel>
    );
  if (tai.kind === "loi")
    return (
      <FramePanel className="flex flex-col items-start gap-2">
        <TrangThai kind="error" title={LOI_TAI_LEAD} />
        <Button size="sm" variant="outline" onClick={() => (setTai({ kind: "dang" }), setLan((n) => n + 1))}>
          Thử lại
        </Button>
      </FramePanel>
    );
  return <GoiChuNha id={tai.lead.id} tieuDe={`${tai.lead.buildingName} · ${NEED_LABELS[tai.lead.need as Need] ?? tai.lead.need}`} />;
}

function GoiChuNha({ id, tieuDe }: { id: string; tieuDe: string }) {
  const [dang, setDang] = useState(false);
  const [so, setSo] = useState<string | null>(null);
  const [loi, setLoi] = useState<string | null>(null);
  const goi = async () => {
    setDang(true);
    const kq = await goiChuNha(id);
    setDang(false);
    if (kq.ok) {
      setSo(kq.so);
      setLoi(null);
    } else setLoi(kq.loi);
  };
  return (
    <FramePanel className="flex flex-col gap-3" aria-label="Quay số">
      <h1 className="text-lg font-semibold">{tieuDe}</h1>
      {so ? (
        <div className="flex flex-col gap-2">
          <span className="text-xl font-semibold tabular-nums">{chuSo(so)}</span>
          <Button size="lg" className="w-full" nativeButton={false} render={<a href={telHref(so)} />}>
            Gọi
          </Button>
        </div>
      ) : (
        <Button size="lg" className="w-full" disabled={dang} onClick={() => void goi()}>
          Gọi chủ nhà
        </Button>
      )}
      {loi ? <p className="text-destructive text-sm">{loi}</p> : null}
    </FramePanel>
  );
}
