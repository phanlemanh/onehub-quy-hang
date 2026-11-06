"use client";

// Thân mục chia lead (hàng 48): chuyển thể settings-3 (MucCaiDatKhoi + SettingField, khối đã chuyển thể của nhóm
// cai-dat-san) — một Frame, sáu dòng theo sổ điểm, chân Hoàn lại · Lưu. Nhãn lựa chọn nhập từ lõi; luật giá trị, câu hiệu
// lực, trạng thái và chữ nguồn ở `./luat` (phần thuần, có bài kiểm). Lưu một lần qua lối chung, chỉ khoá đã đổi.
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

import { ALERT_AUDIENCE_NHAN, ALERT_AUDIENCES, ROUTING_STRATEGIES, ROUTING_STRATEGY_NHAN, type RoutingStrategyKey } from "@quy-hang/core/routing";

import { MucCaiDatKhoi } from "@/components/khoi/settings-3/muc-cai-dat";
import { SettingField } from "@/components/khoi/settings-3/setting-field";
import { NumberField, NumberFieldDecrement, NumberFieldGroup, NumberFieldIncrement, NumberFieldInput } from "@/components/reui/number-field";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { FieldError, FieldSeparator } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

import {
  cauHieuLuc,
  chuNguon,
  diemMan,
  DOAN,
  ganLyDo,
  giaTriTu,
  ketQuaLuu,
  kiemBan,
  loiChoNguoi,
  trangThaiMan,
  type BanCauHinh,
  type BoNhomDangAp,
  type GiaTriMan,
  type KhoaMan,
} from "./luat";

const KHUNG_BAO = "luat-chia-lead";
const BAO_403 = "Chỉ quản trị sàn đổi được luật này";
const NHAN_CACH_CHIA = Object.fromEntries(ROUTING_STRATEGIES.map((k) => [k, ROUTING_STRATEGY_NHAN[k].nhan]));
const NHAN_NGUOI_DOC = Object.fromEntries(ALERT_AUDIENCES.map((k) => [k, ALERT_AUDIENCE_NHAN[k]]));

type LoiLuu = { kind: "chung"; cau: string; thuLai: boolean } | null;

export function LuatChiaLead({
  tieuDe,
  cauHinh: dau,
  boNhom,
  tenNguoi,
}: {
  tieuDe: string;
  cauHinh: BanCauHinh | null;
  boNhom: BoNhomDangAp | null;
  tenNguoi: Record<string, string> | null;
}) {
  const router = useRouter();
  const [cauHinh, setCauHinh] = useState<BanCauHinh | null>(dau);
  const dangAp = useMemo(() => (cauHinh ? giaTriTu(cauHinh) : null), [cauHinh]);
  const [nhap, setNhap] = useState<GiaTriMan | null>(dangAp);
  const [loiMay, setLoiMay] = useState<Partial<Record<KhoaMan, string>>>({});
  const [loiLuu, setLoiLuu] = useState<LoiLuu>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const ten = useMemo(() => (tenNguoi ? new Map(Object.entries(tenNguoi)) : null), [tenNguoi]);
  const tt = trangThaiMan(cauHinh, boNhom);

  if (tt.kind === "loi-tai" || !cauHinh || !dangAp || !nhap) {
    return (
      <TrangThai
        kind="error"
        title="Chưa tải được luật chia lead"
        hanhDong={
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>
            Thử lại
          </Button>
        }
      />
    );
  }

  const khoaKhoa = tt.khoaKhoa;
  const baoBoNhom = tt.baoBoNhom;
  const kq = kiemBan(dangAp, nhap);
  const loi: Partial<Record<KhoaMan, string>> = { ...loiMay, ...kq.loi };
  const doiO = (k: KhoaMan, v: unknown) => {
    setNhap({ ...nhap, [k]: v });
    setLoiMay({});
    setLoiLuu(null);
  };

  async function luu() {
    if (!kq.guiDuoc || !nhap) return;
    setDangLuu(true);
    setLoiLuu(null);
    setLoiMay({});
    try {
      const r = await fetch("/api/v1/company/settings", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(kq.than),
      });
      if (r.ok) {
        const moi = (await r.json()) as BanCauHinh;
        setCauHinh(moi);
        setNhap(giaTriTu(moi));
        const ket = ketQuaLuu(kq.doi, moi);
        if (ket.kind === "ok") toast.success(ket.cau, { toasterId: KHUNG_BAO });
        else setLoiLuu({ kind: "chung", cau: ket.cau, thuLai: false });
        router.refresh();
      } else if (r.status === 403) {
        setLoiLuu({ kind: "chung", cau: BAO_403, thuLai: false });
      } else {
        const than = (await r.json().catch(() => null)) as { reason?: string } | null;
        const lyDo = than?.reason ?? "";
        const dong = ganLyDo(lyDo);
        if (dong) setLoiMay({ [dong]: loiChoNguoi(dong, lyDo, nhap) });
        else setLoiLuu({ kind: "chung", cau: lyDo ? `Máy chủ không nhận: ${lyDo}` : "Máy chủ không nhận lần lưu này", thuLai: false });
      }
    } catch {
      setLoiLuu({ kind: "chung", cau: "Chưa lưu được — mất kết nối tới máy chủ", thuLai: true });
    } finally {
      setDangLuu(false);
    }
  }

  const hoanLai = () => {
    setNhap(dangAp);
    setLoiMay({});
    setLoiLuu(null);
  };

  function oNhap(k: KhoaMan) {
    const d = diemMan(k);
    const khoa = dangLuu || khoaKhoa.includes(k);
    const id = `o-${k}`;
    if (d.kieu.loai === "enum") {
      const nhan = k === "lead_routing.strategy" ? NHAN_CACH_CHIA : NHAN_NGUOI_DOC;
      return (
        <Select items={nhan} value={String(nhap?.[k] ?? "")} onValueChange={(v) => doiO(k, v)} disabled={khoa}>
          <SelectTrigger id={id} className="w-full" aria-invalid={loi[k] ? true : undefined}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(nhan).map(([v, chu]) => (
              <SelectItem key={v} value={v}>
                {chu}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    const v = nhap?.[k];
    return (
      <NumberField
        id={id}
        value={typeof v === "number" ? v : null}
        onValueChange={(n) => doiO(k, n)}
        step={1}
        disabled={khoa}
        aria-label={d.ten}
      >
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput aria-invalid={loi[k] ? true : undefined} />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
    );
  }

  const chan = (
    <>
      <Button variant="outline" onClick={hoanLai} disabled={dangLuu || kq.doi.length === 0}>
        Hoàn lại
      </Button>
      <Button onClick={luu} disabled={dangLuu || !kq.guiDuoc}>
        {dangLuu ? <Spinner data-icon="inline-start" /> : null}
        Lưu
      </Button>
    </>
  );

  return (
    <>
      <MucCaiDatKhoi tieuDe={tieuDe} chan={chan}>
        {tt.baoDongHong || loiLuu ? (
          <div className="flex flex-col gap-3 px-4 pt-4">
            {tt.baoDongHong ? <TrangThai kind="notice" title={tt.baoDongHong} /> : null}
            {loiLuu ? (
              <TrangThai
                kind="error"
                title={loiLuu.cau}
                hanhDong={
                  loiLuu.thuLai ? (
                    <Button variant="outline" size="sm" onClick={luu}>
                      Thử lại
                    </Button>
                  ) : undefined
                }
              />
            ) : null}
          </div>
        ) : null}
        {DOAN.map((doan, i) => (
          <section key={doan.tieuDe} aria-label={doan.tieuDe} className="flex flex-col">
            {i > 0 ? <FieldSeparator /> : null}
            <h3 className="px-4 pt-4 text-xs font-medium text-muted-foreground">{doan.tieuDe}</h3>
            {doan.khoa.some((k) => khoaKhoa.includes(k)) && baoBoNhom ? (
              <div className="px-4 pt-3">
                <TrangThai kind="notice" title={baoBoNhom} />
              </div>
            ) : null}
            {doan.khoa.map((k, j) => {
              const d = diemMan(k);
              const giaiThich = k === "lead_routing.strategy" ? ROUTING_STRATEGY_NHAN[nhap[k] as RoutingStrategyKey]?.giaiThich : null;
              return (
                <SettingField key={k} title={d.ten} description={cauHieuLuc(d)} labelFor={`o-${k}`} last={j === doan.khoa.length - 1}>
                  <div className="flex flex-col gap-1.5" data-khoa={k}>
                    {oNhap(k)}
                    {giaiThich ? <p className="text-xs text-muted-foreground">{giaiThich}</p> : null}
                    {loi[k] ? <FieldError id={`loi-${k}`}>{loi[k]}</FieldError> : null}
                    <p id={`nguon-${k}`} className="text-xs text-muted-foreground">
                      {chuNguon(
                        cauHinh.items.find((x) => x.key === k),
                        ten,
                      )}
                    </p>
                  </div>
                </SettingField>
              );
            })}
          </section>
        ))}
      </MucCaiDatKhoi>
      <Toaster id={KHUNG_BAO} position="bottom-center" />
    </>
  );
}
