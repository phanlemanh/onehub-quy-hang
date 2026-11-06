"use client";

import { useState } from "react";

import { DauBuoc, HuyHieuDau, type Dau } from "@/components/khoi/solution-crm-6/buoc";
import { Badge } from "@/components/reui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Ong } from "@/lib/nhap/duong-ong";
import { deXuatCuaO, type TrangThaiOLa } from "@/lib/nhap/o-la";
import type { HanhDong, XemThu } from "@/lib/nhap/trang-thai";

// Hai bảng của màn Nhập Excel: xem trước từng ô (bước 3) và từng dòng thành gì (bước 4). Bảng của khối solution-crm-6
// (Table trong viền), chia trang 50 dòng để tệp hàng nghìn dòng không dựng hết một lúc.

const MOI_TRANG = 50;

function ChiaTrang({ trang, so, onDoi }: { trang: number; so: number; onDoi: (t: number) => void }) {
  if (so <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 text-sm">
      <span className="text-muted-foreground">
        Trang {trang + 1}/{so}
      </span>
      <Button variant="outline" size="sm" disabled={trang === 0} onClick={() => onDoi(trang - 1)}>
        Trước
      </Button>
      <Button variant="outline" size="sm" disabled={trang >= so - 1} onClick={() => onDoi(trang + 1)}>
        Sau
      </Button>
    </div>
  );
}

const DEM_DAU: Dau[] = ["keep", "fixed", "needs_person", "blocked"];

export function BangXemTruoc({
  ong,
  bo,
  ola,
  onSua,
  onDung,
  onBo,
}: {
  ong: Ong;
  bo: ReadonlySet<number>;
  /** Đề xuất ô lạ (hàng 69) — vắng thì bảng như hàng 65. */
  ola?: TrangThaiOLa;
  onSua: (source: number, cot: number, raw: string) => void;
  onDung?: (source: number, cot: number) => void;
  onBo: (source: number, bo: boolean) => void;
}) {
  const [chiCanNguoi, setChiCanNguoi] = useState(false);
  const [trang, setTrang] = useState(0);
  const cot = ong.plan.columns.map((c, i) => ({ i, c })).filter(({ c }) => c.target !== "ignore_with_reason");
  const can = (d: Ong["dong"][number]) => d.cells.some((c) => c.mark === "needs_person" || c.mark === "blocked");
  const ds = chiCanNguoi ? ong.dong.filter(can) : ong.dong;
  const soTrang = Math.max(1, Math.ceil(ds.length / MOI_TRANG));
  const dang = ds.slice(trang * MOI_TRANG, (trang + 1) * MOI_TRANG);
  return (
    <section className="flex flex-col gap-4" aria-labelledby="nhap-xem-truoc">
      <DauBuoc id="nhap-xem-truoc" tieuDe="Xem trước" moTa="Từng ô sẽ ghi gì. Ô cần người hay chặn sửa được tại chỗ; dòng không muốn nhập thì bỏ." />
      <div className="flex flex-wrap items-center gap-2">
        {DEM_DAU.map((d) => (
          <span key={d} className="inline-flex items-center gap-1.5 text-sm">
            <HuyHieuDau dau={d} />
            <span className="tabular-nums">{ong.dem[d].toLocaleString("vi-VN")}</span>
          </span>
        ))}
        <label className="ml-auto inline-flex items-center gap-2 text-sm">
          <Switch
            checked={chiCanNguoi}
            onCheckedChange={(v) => {
              setChiCanNguoi(v);
              setTrang(0);
            }}
          />
          Chỉ dòng cần người · chặn
        </label>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table aria-label="Xem trước" className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Bỏ</TableHead>
              <TableHead className="w-16">Dòng</TableHead>
              {cot.map(({ i, c }) => (
                <TableHead key={i}>{c.column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dang.map((d) => (
              <TableRow key={d.source} data-bo={bo.has(d.source) || undefined} className="data-[bo]:opacity-50">
                <TableCell>
                  <Checkbox aria-label={`Bỏ dòng ${d.source + 1}`} checked={bo.has(d.source)} onCheckedChange={(v) => onBo(d.source, v === true)} />
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">{d.source + 1}</TableCell>
                {cot.map(({ i, c }) => {
                  const o = d.cells.find((x) => x.column === c.column);
                  if (!o) return <TableCell key={i} />;
                  const sua = o.mark === "needs_person" || o.mark === "blocked";
                  return (
                    <TableCell key={i} className="align-top" title={o.reason}>
                      <div className="flex min-w-32 flex-col gap-1">
                        {sua ? (
                          <Input
                            defaultValue={o.raw === null ? "" : String(o.raw)}
                            aria-label={`Sửa ${c.column} dòng ${d.source + 1}`}
                            onBlur={(e) => e.target.value !== String(o.raw ?? "") && onSua(d.source, i, e.target.value)}
                          />
                        ) : (
                          <span>
                            {o.raw === null ? "" : String(o.raw)}
                            {o.mark === "fixed" && o.value !== undefined && o.value !== null && String(o.value) !== String(o.raw) ? ` → ${String(o.value)}` : ""}
                          </span>
                        )}
                        {o.mark !== "keep" ? <HuyHieuDau dau={o.mark} /> : null}
                        {o.reason && o.mark !== "keep" ? <span className="text-muted-foreground text-xs">{o.reason}</span> : null}
                        {(() => {
                          const dx = ola && onDung ? deXuatCuaO(ong, ola, d.source, i) : null;
                          if (!dx) return null;
                          return (
                            <span className="flex flex-wrap items-center gap-2 pt-1 whitespace-normal" data-de-xuat-o-la="">
                              <Badge variant="info-light">Máy đề xuất</Badge>
                              <span className="text-sm font-medium break-words">{dx.giaTri}</span>
                              <Button type="button" size="sm" variant="outline" className="min-h-11 sm:min-h-0" onClick={() => onDung!(d.source, i)} aria-label={`Dùng «${dx.giaTri}» cho ${c.column} dòng ${d.source + 1}`}>
                                Dùng
                              </Button>
                              <span className="text-muted-foreground w-full text-xs break-words">{dx.lyDo}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ChiaTrang trang={trang} so={soTrang} onDoi={setTrang} />
    </section>
  );
}

const HANH_DONG: Record<HanhDong, { nhan: string; variant: "success-light" | "info-light" | "warning-light" | "secondary" }> = {
  create: { nhan: "Căn mới", variant: "success-light" },
  update: { nhan: "Cập nhật", variant: "info-light" },
  supplement: { nhan: "Tin bổ sung", variant: "warning-light" },
  skip: { nhan: "Bỏ", variant: "secondary" },
};

export function BangTrung({ xemThu, bo, onBo }: { xemThu: XemThu; bo: ReadonlySet<number>; onBo: (source: number) => void }) {
  const [trang, setTrang] = useState(0);
  const soTrang = Math.max(1, Math.ceil(xemThu.rows.length / MOI_TRANG));
  const dang = xemThu.rows.slice(trang * MOI_TRANG, (trang + 1) * MOI_TRANG);
  const t = xemThu.summary;
  return (
    <section className="flex flex-col gap-4" aria-labelledby="nhap-trung">
      <DauBuoc id="nhap-trung" tieuDe="Trùng" moTa="Máy chủ đã xem thử từng dòng theo luật trùng của sàn — chưa ghi gì." />
      <div className="flex flex-wrap gap-2">
        {(Object.keys(HANH_DONG) as HanhDong[]).map((h) => (
          <Badge key={h} variant={HANH_DONG[h].variant}>
            {HANH_DONG[h].nhan} · {t[h].toLocaleString("vi-VN")}
          </Badge>
        ))}
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table aria-label="Từng dòng thành gì" className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Dòng</TableHead>
              <TableHead className="w-32">Thành</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {dang.map((r) => (
              <TableRow key={r.row}>
                <TableCell className="text-muted-foreground tabular-nums">{r.row + 1}</TableCell>
                <TableCell>
                  <Badge variant={HANH_DONG[r.action].variant}>{HANH_DONG[r.action].nhan}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{r.reason}</TableCell>
                <TableCell>
                  {r.action !== "skip" && !bo.has(r.row) ? (
                    <Button variant="ghost" size="sm" onClick={() => onBo(r.row)}>
                      Bỏ
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ChiaTrang trang={trang} so={soTrang} onDoi={setTrang} />
    </section>
  );
}
