"use client";

import type { ReactNode } from "react";
import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/reui/alert";
import { Badge } from "@/components/reui/badge";
import { Field, FieldError } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Chuyển thể từ khối ReUI solution-crm-6 (import-wizard-steps): giữ đầu mục của bước (SectionHeading), bảng ghép cột
// (MapStepFields: cột tệp · mẫu · trường, Select trong ô, Alert cảnh báo trên bảng), huy hiệu dấu (FlagBadge) và dòng
// tóm tắt (SummarySection/SummaryLine). Đổi: dữ liệu và chữ thành prop; chấm màu thô của FlagBadge thành biến thể Badge
// (luật no-raw-palette); bỏ bước tải giả, khoá trùng và lựa chọn ghi đè của khối (luật trùng của sàn quyết ở máy chủ).

export type LuaChon = { value: string; label: string };

export function DauBuoc({ id, tieuDe, moTa }: { id: string; tieuDe: string; moTa: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 id={id} className="text-base font-semibold">
        {tieuDe}
      </h2>
      <p className="text-muted-foreground text-sm">{moTa}</p>
    </div>
  );
}

function ChonDich({ id, value, options, onDoi }: { id: string; value: string; options: readonly LuaChon[]; onDoi: (v: string) => void }) {
  const chon = options.find((o) => o.value === value) ?? null;
  return (
    <Select value={chon} items={options} onValueChange={(v) => v && onDoi(v.value)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue>{(o: LuaChon | null) => o?.label ?? "Chọn trường"}</SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {options.map((o) => (
            <SelectItem key={o.value} value={o}>
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export type CotGhep = { ma: string; tieuDe: string; mau: string; lop: string; dich: string; loi?: string };

export function BangGhepCot({
  cot,
  options,
  canhBao,
  onDoi,
}: {
  cot: readonly CotGhep[];
  options: readonly LuaChon[];
  canhBao?: { tieuDe: string; moTa: ReactNode } | null;
  onDoi: (ma: string, dich: string) => void;
}) {
  return (
    <section className="flex flex-col gap-6" aria-labelledby="nhap-ghep-cot">
      <DauBuoc id="nhap-ghep-cot" tieuDe="Ghép cột" moTa="Mỗi cột trong tệp ứng với một trường của căn. Máy đã ghép sẵn theo tiêu đề." />
      {canhBao ? (
        <Alert variant="warning">
          <AlertCircleIcon className="size-4" aria-hidden="true" />
          <AlertTitle>{canhBao.tieuDe}</AlertTitle>
          <AlertDescription>{canhBao.moTa}</AlertDescription>
        </Alert>
      ) : null}
      <div className="overflow-x-auto rounded-md border">
        <Table aria-label="Ghép cột" className="w-full min-w-[640px] table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Cột trong tệp</TableHead>
              <TableHead className="w-[30%]">Mẫu</TableHead>
              <TableHead>Trường của căn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cot.map((c) => (
              <TableRow key={c.ma}>
                <TableCell className="align-top">
                  <span className="flex flex-col gap-1">
                    <span className="font-medium">{c.tieuDe}</span>
                    <span className="text-muted-foreground text-xs">{c.lop}</span>
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground align-top">{c.mau}</TableCell>
                <TableCell className="align-top">
                  <Field data-invalid={Boolean(c.loi)} className="gap-1.5">
                    <ChonDich id={`nhap-dich-${c.ma}`} value={c.dich} options={options} onDoi={(v) => onDoi(c.ma, v)} />
                    {c.loi ? <FieldError>{c.loi}</FieldError> : null}
                  </Field>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export type Dau = "keep" | "fixed" | "needs_person" | "blocked";
const DAU: Record<Dau, { nhan: string; variant: "secondary" | "info-light" | "warning-light" | "destructive-light" }> = {
  keep: { nhan: "Giữ nguyên", variant: "secondary" },
  fixed: { nhan: "Máy sửa", variant: "info-light" },
  needs_person: { nhan: "Cần người", variant: "warning-light" },
  blocked: { nhan: "Chặn", variant: "destructive-light" },
};

export function HuyHieuDau({ dau }: { dau: Dau }) {
  return <Badge variant={DAU[dau].variant}>{DAU[dau].nhan}</Badge>;
}

export function DongTomTat({ nhan, giaTri }: { nhan: string; giaTri: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 text-sm">
      <dt className="text-muted-foreground">{nhan}</dt>
      <dd className="text-foreground min-w-0 text-right font-medium break-words">{giaTri}</dd>
    </div>
  );
}

export function MucTomTat({ tieuDe, children }: { tieuDe: string; children: ReactNode }) {
  return (
    <section className="border-border/70 flex min-w-0 flex-col gap-3 rounded-md border p-4">
      <h3 className="text-sm font-semibold">{tieuDe}</h3>
      <dl className="flex flex-col gap-2">{children}</dl>
    </section>
  );
}
