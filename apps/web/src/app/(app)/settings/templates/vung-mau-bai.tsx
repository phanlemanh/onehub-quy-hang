"use client";

import { KENH_BAI, type KenhBai, type LoiMauBai, type MauBai } from "@quy-hang/core/export";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { BaoHong } from "./bao-hong";
import { CHU_MAU, loiO, sauKhiLuuMau, thanPutBai, xemTruocBai, type TrangThaiMauSan } from "./mau-san";

/** Vùng của tab trong vỏ: làm mới bằng router của app. */
export function VungMauBai({ tt }: { tt: TrangThaiMauSan<MauBai> }) {
  const router = useRouter();
  return <BangMauBai tt={tt} lamMoi={() => router.refresh()} />;
}

/** Tab «Mẫu bài»: mỗi kênh một khối — lời mở đầu, lời kết, xem trước, Lưu, Về mặc định. */
export function BangMauBai({ tt, lamMoi, guiPut }: { tt: TrangThaiMauSan<MauBai>; lamMoi: () => void; guiPut?: (than: unknown) => void }) {
  if (tt.kieu === "dang-tai") return <TrangThai kind="loading" title={CHU_MAU.dangTai} />;
  if (tt.kieu === "loi")
    return <TrangThai kind="error" title={CHU_MAU.loiDoc} hanhDong={<Button variant="outline" onClick={() => lamMoi()}>{CHU_MAU.thuLai}</Button>} />;
  return (
    <div className="flex flex-col gap-6">
      <BaoHong cau={tt.baoHong} />
      {KENH_BAI.map((k) => (
        <KhoiKenh key={k} kenh={k} mau={tt.giaTri} lamMoi={lamMoi} guiPut={guiPut} />
      ))}
    </div>
  );
}

function KhoiKenh({ kenh, mau, lamMoi, guiPut }: { kenh: KenhBai; mau: MauBai; lamMoi: () => void; guiPut?: (than: unknown) => void }) {
  const [dau, setDau] = useState(mau[kenh]?.opening ?? "");
  const [cuoi, setCuoi] = useState(mau[kenh]?.closing ?? "");
  const [bao, setBao] = useState<{ ok: boolean; cau: string } | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const loiDau = loiO(dau);
  const loiCuoi = loiO(cuoi);

  const ghi = async (loi: LoiMauBai | null) => {
    const than = thanPutBai(mau, kenh, loi);
    guiPut?.(than);
    setDangLuu(true);
    const res = await fetch("/api/v1/company/templates/posts", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(than) }).catch(() => null);
    const reason = res && res.status === 400 ? ((await res.json().catch(() => ({}))) as { reason?: string }).reason : undefined;
    const kq = sauKhiLuuMau(res ? { status: res.status, reason } : null);
    setDangLuu(false);
    setBao(kq);
    if (kq.ok) {
      if (!loi) {
        setDau("");
        setCuoi("");
      }
      lamMoi();
    }
  };

  return (
    <section className="flex flex-col gap-3" aria-label={CHU_MAU.kenh[kenh]}>
      <h3 className="text-sm font-medium">{CHU_MAU.kenh[kenh]}</h3>
      {bao ? <TrangThai kind={bao.ok ? "notice" : "error"} title={bao.cau} /> : null}
      <Field>
        <FieldLabel htmlFor={`${kenh}-dau`}>{CHU_MAU.dau}</FieldLabel>
        <Textarea id={`${kenh}-dau`} rows={2} value={dau} onChange={(e) => setDau(e.target.value)} />
        <FieldDescription>{CHU_MAU.demKyTu(dau.length)}</FieldDescription>
        {loiDau ? <FieldError>{loiDau}</FieldError> : null}
      </Field>
      <Field>
        <FieldLabel htmlFor={`${kenh}-cuoi`}>{CHU_MAU.cuoi}</FieldLabel>
        <Textarea id={`${kenh}-cuoi`} rows={2} value={cuoi} onChange={(e) => setCuoi(e.target.value)} />
        <FieldDescription>{CHU_MAU.demKyTu(cuoi.length)}</FieldDescription>
        {loiCuoi ? <FieldError>{loiCuoi}</FieldError> : null}
      </Field>
      <Field>
        <FieldLabel>{CHU_MAU.xemTruoc}</FieldLabel>
        <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">{xemTruocBai(kenh, { opening: dau, closing: cuoi })}</pre>
      </Field>
      <div className="flex gap-2">
        <Button onClick={() => void ghi({ opening: dau, closing: cuoi })} disabled={dangLuu || loiDau !== null || loiCuoi !== null}>
          {CHU_MAU.luu}
        </Button>
        <Button variant="outline" onClick={() => void ghi(null)} disabled={dangLuu}>
          {CHU_MAU.veMacDinh}
        </Button>
      </div>
    </section>
  );
}
