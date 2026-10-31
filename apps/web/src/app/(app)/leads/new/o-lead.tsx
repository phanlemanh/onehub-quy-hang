"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import {
  LISTING_TIME_LABELS,
  LISTING_TIMES,
  NEED_LABELS,
  NEEDS,
  understoodPrice,
  validateLeadInput,
  type FeeInclusion,
  type LeadResultView,
  type ListingTime,
  type Need,
} from "@quy-hang/core/dedupe";

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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/** Ba lời gọi của ô nhận lead — màn thật gọi API, trang mẫu (design-pass) đưa bản giả. */
export type NguonLead = {
  gui: (body: unknown) => Promise<{ ok: true; lead: LeadResultView } | { ok: false; loi: Record<string, string> } | { ok: false; mang: true }>;
  bo: (id: string) => Promise<boolean>;
  traMa: (ma: string) => Promise<{ buildingName: string; unitNumber: string } | { khong: string }>;
};

const LOI_CHU: Record<string, string> = {
  ownerPhone: "Cần số điện thoại Việt Nam 10 chữ số",
  buildingName: "Cần căn hoặc toà",
  unitNumber: "Mã căn chưa đọc được",
  need: "Chọn nhu cầu",
  listPrice: "Cần giá (đồng)",
  feeInclusion: "Chọn bao phí hay không",
  desiredListingTime: "Chọn thời gian muốn ra hàng",
};

const FEE_LABELS: Record<FeeInclusion, string> = { included: "Bao phí", excluded: "Không bao phí" };

const soTien = (s: string) => Number(s.replace(/\D/g, "")) || 0;
const dauCham = (n: number) => (n ? new Intl.NumberFormat("vi-VN").format(n) : "");

export function OLead({ toa, nguon }: { toa: readonly string[]; nguon: NguonLead }) {
  const soRef = useRef<HTMLInputElement>(null);
  const [so, setSo] = useState("");
  const [maCan, setMaCan] = useState("");
  const [toaChon, setToaChon] = useState<string>("");
  const [canDoc, setCanDoc] = useState<string | null>(null);
  const [baoMa, setBaoMa] = useState<string | null>(null);
  const [need, setNeed] = useState<Need | "">("");
  const [gia, setGia] = useState("");
  const [phi, setPhi] = useState<FeeInclusion | "">("");
  const [thoiGian, setThoiGian] = useState<ListingTime | "">("");
  const [loi, setLoi] = useState<Record<string, string>>({});
  const [dangGui, setDangGui] = useState(false);
  const [ketQua, setKetQua] = useState<LeadResultView | null>(null);
  const [loiMang, setLoiMang] = useState(false);

  const sua = (k: string) =>
    loi[k] &&
    setLoi((cu) => {
      const con = { ...cu };
      delete con[k];
      return con;
    });

  /** Tra mã căn trong danh mục (hàng 9); trả căn đọc được để bước gửi dùng ngay, không chờ state. */
  async function docMa(): Promise<{ buildingName: string; unitNumber: string } | null> {
    setBaoMa(null);
    setCanDoc(null);
    if (!maCan.trim()) return null;
    const r = await nguon.traMa(maCan.trim());
    if ("khong" in r) {
      setBaoMa(r.khong);
      return null;
    }
    setToaChon(r.buildingName);
    setCanDoc(r.unitNumber);
    sua("buildingName");
    return r;
  }

  function thanLead(toa: string, can: string | null) {
    return {
      ownerPhone: so,
      ...(toa && { buildingName: toa }),
      ...(can && { unitNumber: can }),
      ...(need && { need }),
      ...(gia && { listPrice: soTien(gia) }),
      ...(phi && { feeInclusion: phi }),
      ...(thoiGian && { desiredListingTime: thoiGian }),
    };
  }

  async function gui(e: FormEvent) {
    e.preventDefault();
    // Gõ mã căn rồi bấm gửi ngay: lượt tra lúc rời ô có thể chưa xong — tra ở đây và dùng kết quả trả về.
    let toa = toaChon;
    let can = canDoc;
    if (maCan.trim() && !canDoc) {
      const r = await docMa();
      if (r) [toa, can] = [r.buildingName, r.unitNumber];
    }
    const than = thanLead(toa, can);
    const kiem = validateLeadInput(than);
    if (!kiem.ok) {
      setLoi(Object.fromEntries(kiem.errors.map((x) => [x.path, LOI_CHU[x.path] ?? x.reason])));
      return;
    }
    setLoi({});
    setLoiMang(false);
    setKetQua(null);
    setDangGui(true);
    const r = await nguon.gui(than);
    setDangGui(false);
    if (r.ok) {
      setKetQua(r.lead);
      setSo("");
      setMaCan("");
      setToaChon("");
      setCanDoc(null);
      setNeed("");
      setGia("");
      setPhi("");
      setThoiGian("");
    } else if ("mang" in r) setLoiMang(true);
    else setLoi(Object.fromEntries(Object.entries(r.loi).map(([k, v]) => [k, LOI_CHU[k] ?? v])));
  }

  // Gửi xong thì về ô số chủ cho lead kế — sau khi ô hết khoá, vì ô đang khoá không nhận tiêu điểm.
  useEffect(() => {
    if (ketQua && !dangGui) soRef.current?.focus();
  }, [ketQua, dangGui]);

  async function boLead() {
    if (ketQua && (await nguon.bo(ketQua.id))) setKetQua({ ...ketQua, discarded: true });
  }

  const giaSo = soTien(gia);
  return (
    <form className="flex flex-col gap-6" onSubmit={gui} noValidate>
      <FieldGroup className="grid gap-6 md:grid-cols-2">
        <Field data-invalid={!!loi.ownerPhone || undefined}>
          <FieldLabel htmlFor="so-chu">Số chủ nhà</FieldLabel>
          <Input ref={soRef} id="so-chu" type="tel" inputMode="tel" autoComplete="off" placeholder="0900 000 000" value={so} disabled={dangGui} aria-invalid={!!loi.ownerPhone || undefined} onChange={(e) => (setSo(e.target.value), sua("ownerPhone"))} />
          {loi.ownerPhone && <FieldError>{loi.ownerPhone}</FieldError>}
        </Field>

        <Field data-invalid={!!loi.buildingName || undefined}>
          <FieldLabel htmlFor="ma-can">Căn hoặc toà</FieldLabel>
          <div className="flex gap-2">
            <Input id="ma-can" className="min-w-0 flex-1" placeholder="Mã căn, ví dụ A-12.05" value={maCan} disabled={dangGui} onChange={(e) => setMaCan(e.target.value)} onBlur={() => void docMa()} />
            <Select value={toaChon} onValueChange={(v) => (setToaChon(v ?? ""), sua("buildingName"))}>
              <SelectTrigger className="w-28 shrink-0" aria-label="Toà" disabled={dangGui}>
                <SelectValue placeholder="Toà" />
              </SelectTrigger>
              <SelectContent>
                {toa.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {canDoc ? (
            <FieldDescription>
              Căn {canDoc} · {toaChon}
            </FieldDescription>
          ) : (
            <FieldDescription>{baoMa ?? "Chỉ biết toà thì để trống mã căn, chọn toà."}</FieldDescription>
          )}
          {loi.buildingName && <FieldError>{loi.buildingName}</FieldError>}
        </Field>

        <Field data-invalid={!!loi.need || undefined}>
          <FieldLabel>Nhu cầu</FieldLabel>
          <ToggleGroup className="flex-wrap" variant="outline" value={need ? [need] : []} onValueChange={(v) => (setNeed((v[0] as Need | undefined) ?? ""), sua("need"))} disabled={dangGui} aria-label="Nhu cầu">
            {NEEDS.map((n) => (
              <ToggleGroupItem key={n} value={n}>
                {NEED_LABELS[n]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {loi.need && <FieldError>{loi.need}</FieldError>}
        </Field>

        <Field data-invalid={!!(loi.listPrice || loi.feeInclusion) || undefined}>
          <FieldLabel htmlFor="gia">Giá</FieldLabel>
          <div className="flex flex-wrap gap-2">
            <Input id="gia" className="min-w-40 flex-1" inputMode="numeric" placeholder="Giá chủ muốn (đồng)" value={dauCham(giaSo)} disabled={dangGui} onChange={(e) => (setGia(e.target.value), sua("listPrice"))} />
            <ToggleGroup className="flex-wrap" variant="outline" value={phi ? [phi] : []} onValueChange={(v) => (setPhi((v[0] as FeeInclusion | undefined) ?? ""), sua("feeInclusion"))} disabled={dangGui} aria-label="Điều kiện phí">
              {(["included", "excluded"] as const).map((f) => (
                <ToggleGroupItem key={f} value={f}>
                  {FEE_LABELS[f]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          {giaSo > 0 && phi && <FieldDescription>Hiểu là: {understoodPrice(giaSo, phi)}</FieldDescription>}
          {(loi.listPrice || loi.feeInclusion) && <FieldError>{loi.listPrice ?? loi.feeInclusion}</FieldError>}
        </Field>

        <Field data-invalid={!!loi.desiredListingTime || undefined} className="md:col-span-2">
          <FieldLabel>Thời gian muốn ra hàng</FieldLabel>
          <ToggleGroup className="flex-wrap" variant="outline" value={thoiGian ? [thoiGian] : []} onValueChange={(v) => (setThoiGian((v[0] as ListingTime | undefined) ?? ""), sua("desiredListingTime"))} disabled={dangGui} aria-label="Thời gian muốn ra hàng">
            {LISTING_TIMES.map((t) => (
              <ToggleGroupItem key={t} value={t}>
                {LISTING_TIME_LABELS[t]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {loi.desiredListingTime && <FieldError>{loi.desiredListingTime}</FieldError>}
        </Field>
      </FieldGroup>

      <div>
        <Button type="submit" disabled={dangGui}>
          {dangGui ? "Đang kiểm trùng…" : "Gửi lead"}
        </Button>
      </div>

      {loiMang && <TrangThai kind="error" title="Chưa gửi được — kiểm mạng rồi gửi lại" description="Chữ đã gõ vẫn còn trong các ô." />}
      {ketQua && <KetQua lead={ketQua} onBo={boLead} />}
    </form>
  );
}

// Kết quả kiểm trùng dựng từ bản của telesales mà lõi trả (KH-ol-ket-qua-tu-loi), qua khuôn TrangThai.
function KetQua({ lead, onBo }: { lead: LeadResultView; onBo: () => Promise<void> }) {
  if (lead.discarded) return <TrangThai kind="notice" title="Đã bỏ lead này — có ghi lại" />;
  if (lead.outcome === "new") return <TrangThai kind="notice" title="Không trùng — lead chờ chia theo luật của sàn" />;
  if (lead.outcome === "owner_has_agent") {
    return <TrangThai kind="notice" title={`Chủ nhà đã có đầu chủ ${lead.agentName} — lead đã về ${lead.agentName}`} />;
  }
  const ten = lead.agentName ?? "một đầu chủ";
  return (
    <TrangThai
      kind="notice"
      title={`Căn ${lead.unitNumber} đã có hàng mở của ${ten} — lead thành tin bổ sung cho ${lead.agentName ?? "đầu chủ ấy"}`}
      description={
        <AlertDialog>
          <AlertDialogTrigger render={<Button type="button" variant="outline" size="sm" className="mt-2" />}>Bỏ lead này</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bỏ lead này?</AlertDialogTitle>
              <AlertDialogDescription>Lead không còn là tin bổ sung cho đầu chủ. Lần bỏ được ghi lại.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Giữ lại</AlertDialogCancel>
              <AlertDialogAction onClick={() => void onBo()}>Bỏ lead</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      }
    />
  );
}
