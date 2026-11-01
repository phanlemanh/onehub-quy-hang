"use client";

import { InboxIcon, PlusIcon, RotateCwIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { CAC_VUNG, type Vung } from "./du-lieu-mau";
import { kiemSoMoi } from "./dung-lead";

/** Nút «+ Lead» — lối vào Ô nhận lead. */
export function NutThemLead({ size = "default" }: { size?: "default" | "sm" }) {
  return (
    <Button size={size} render={<Link href="/leads/new" />} nativeButton={false}>
      <PlusIcon data-icon="inline-start" />
      Lead
    </Button>
  );
}

/** Vùng trống: một câu, một hành động. */
export function VungTrong() {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <TrangThai kind="empty" icon={InboxIcon} title="Chưa có lead nào" description="Lead bạn nhập hiện ở đây, mới nhất trước, kèm nấc đầu chủ đã tới." />
      <NutThemLead />
    </div>
  );
}

/** Vùng lỗi: nói chuyện gì xảy ra, một nút thử lại. */
export function VungLoi({ thuLai }: { thuLai: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <TrangThai kind="error" title="Không tải được lead đã nhập" description="Mạng hay máy chủ không trả lời. Lead đã gửi vẫn còn nguyên." />
      <div>
        <Button variant="outline" onClick={thuLai}>
          <RotateCwIcon data-icon="inline-start" />
          Thử lại
        </Button>
      </div>
    </div>
  );
}

/** Ô sửa số của lead bị trả lại: telesales gõ số mới rồi gửi lại. Không hiện số cũ. */
export function OGuiLai({ id, guiLai }: { id: string; guiLai: (id: string) => void }) {
  const [so, setSo] = useState("");
  const [loi, setLoi] = useState<string | null>(null);
  const oId = `so-moi-${id}`;
  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-start"
      onSubmit={(e) => {
        e.preventDefault();
        const l = kiemSoMoi(so);
        setLoi(l);
        if (!l) guiLai(id);
      }}
    >
      <Field data-invalid={!!loi || undefined} className="sm:w-60">
        <FieldLabel htmlFor={oId} className="sr-only">
          Số mới của chủ nhà
        </FieldLabel>
        <Input id={oId} type="tel" inputMode="tel" autoComplete="off" placeholder="Số mới, 0900 000 0xx" value={so} aria-invalid={!!loi || undefined} onChange={(e) => (setSo(e.target.value), setLoi(null))} />
        {loi && <FieldError>{loi}</FieldError>}
      </Field>
      <Button type="submit">Sửa số và gửi lại</Button>
    </form>
  );
}

/** Dải đổi trạng thái vùng của bản mẫu — chỉ có ở proto, không thuộc màn. */
export function ThanhBanMau({ duong, vung }: { duong: string; vung: Vung }) {
  return (
    <nav aria-label="Trạng thái vùng của bản mẫu" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      <span className="me-1">Bản mẫu · trạng thái vùng:</span>
      {CAC_VUNG.map((v) => (
        <Button key={v.ma} size="xs" variant={v.ma === vung ? "secondary" : "ghost"} render={<Link href={`${duong}?vung=${v.ma}`} />} nativeButton={false}>
          {v.nhan}
        </Button>
      ))}
    </nav>
  );
}
