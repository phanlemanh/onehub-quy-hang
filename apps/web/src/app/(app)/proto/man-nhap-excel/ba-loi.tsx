"use client";

import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { BangGhepCot, HuyHieuDau, MucTomTat, DongTomTat, type CotGhep, type Dau, type LuaChon } from "@/components/khoi/solution-crm-6/buoc";
import { KhungBuoc, type Buoc } from "@/components/khoi/solution-crm-6/khung-buoc";
import { MucCaiDatKhoi } from "@/components/khoi/settings-3/muc-cai-dat";
import { SettingField } from "@/components/khoi/settings-3/setting-field";
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { Badge } from "@/components/reui/badge";
import { Button } from "@/components/ui/button";

// Trang ba lối của màn Nhập Excel (design-pass, ADR-0019): cùng một bộ dữ liệu mẫu, ba cách dựng bước «Ghép cột».
// Dữ liệu mẫu, không người thật: [Tên], 0900 000 0xx.
const BUOC: Buoc[] = [
  { so: 1, ten: "Tải tệp", moTa: "Chọn tệp .xlsx hay .csv." },
  { so: 2, ten: "Ghép cột", moTa: "Ghép 6 cột vào trường của căn." },
  { so: 3, ten: "Xem trước", moTa: "Từng ô sẽ ghi gì." },
  { so: 4, ten: "Trùng", moTa: "Từng dòng thành gì trên Quỹ hàng." },
  { so: 5, ten: "Tóm tắt", moTa: "Ghi vào Quỹ hàng." },
];

const DICH: LuaChon[] = [
  { value: "buildingName", label: "Toà" },
  { value: "unitNumber", label: "Mã căn" },
  { value: "livingArea", label: "Diện tích" },
  { value: "listPrice", label: "Giá chào" },
  { value: "ownerPhone", label: "Số chủ nhà" },
  { value: "keep_as_note", label: "Giữ làm ghi chú" },
  { value: "ignore_with_reason", label: "Bỏ cột" },
];

const COT_MAU: CotGhep[] = [
  { ma: "a", tieuDe: "Toà", mau: "Toà A", lop: "Danh mục", dich: "buildingName" },
  { ma: "b", tieuDe: "Mã căn", mau: "A-12.05", lop: "Danh mục", dich: "unitNumber" },
  { ma: "c", tieuDe: "DT (m2)", mau: "74,5", lop: "Danh mục", dich: "livingArea" },
  { ma: "d", tieuDe: "Giá", mau: "3,2 tỷ", lop: "Hàng chia sẻ được", dich: "listPrice" },
  { ma: "e", tieuDe: "SĐT chủ", mau: "số điện thoại · 10 chữ số", lop: "Nguồn — không rời sàn", dich: "ownerPhone" },
  { ma: "f", tieuDe: "Ghi chú", mau: "chữ tự do", lop: "Chữ tự do", dich: "keep_as_note" },
];

const DEM: Record<Dau, number> = { keep: 3912, fixed: 486, needs_person: 37, blocked: 5 };

export function BaLoi({ loi }: { loi: string }) {
  const [cot, setCot] = useState(COT_MAU);
  const doi = (ma: string, dich: string) =>
    setCot((ds) =>
      ds.map((c) =>
        c.ma !== ma
          ? c
          : { ...c, dich, loi: c.lop.startsWith("Nguồn") && dich !== "ownerPhone" && dich !== "ignore_with_reason" ? `Cột «${c.tieuDe}» là số chủ nhà — chỉ ghép vào «Số chủ nhà» hay bỏ.` : undefined },
      ),
    );
  const coLoi = cot.some((c) => c.loi);
  const chan = (
    <>
      <Button type="button" variant="outline">
        <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
        Lùi
      </Button>
      <Button type="button" disabled={coLoi}>
        Tiếp
        <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
      </Button>
    </>
  );

  if (loi === "trong-kho") {
    return (
      <>
        <MucCaiDatKhoi tieuDe="Bước 2 / 5 · Ghép cột" moTa="mau-b.xlsx · 740 dòng · trang «Bảng hàng»" chan={chan}>
          {cot.map((c, i) => (
            <SettingField key={c.ma} title={`Cột «${c.tieuDe}»`} description={`${c.lop} · mẫu: ${c.mau}`} last={i === cot.length - 1}>
              <Badge variant="outline">{DICH.find((d) => d.value === c.dich)?.label}</Badge>
            </SettingField>
          ))}
        </MucCaiDatKhoi>
      </>
    );
  }

  if (loi === "ve-moi") {
    return (
      <>
        <Frame className="w-full">
          <FrameHeader>
            <FrameTitle>mau-b.xlsx · 740 dòng</FrameTitle>
            <FrameDescription>Ghép cột, xem trước và ghi trên một trang — không chia bước.</FrameDescription>
          </FrameHeader>
          <FramePanel>
            <BangGhepCot cot={cot} options={DICH} onDoi={doi} />
          </FramePanel>
          <FramePanel>
            <MucTomTat tieuDe="Xem trước theo dấu">
              {(Object.keys(DEM) as Dau[]).map((d) => (
                <DongTomTat key={d} nhan="" giaTri={<span className="inline-flex items-center gap-2"><HuyHieuDau dau={d} />{DEM[d].toLocaleString("vi-VN")} ô</span>} />
              ))}
            </MucTomTat>
          </FramePanel>
          <FramePanel className="flex justify-end">
            <Button type="button" disabled={coLoi}>Xem thử rồi ghi</Button>
          </FramePanel>
        </Frame>
      </>
    );
  }

  return (
    <>
      <KhungBuoc tieuDe="Nhập Excel" moTa="mau-b.xlsx · 740 dòng · trang «Bảng hàng»" nhan="Bảng hàng" buoc={BUOC} hienTai={2} chan={chan}>
        <BangGhepCot
          cot={cot}
          options={DICH}
          onDoi={doi}
          canhBao={coLoi ? { tieuDe: "Có cột chưa ghép được", moTa: "Sửa cột có chữ đỏ rồi bấm Tiếp." } : null}
        />
      </KhungBuoc>
    </>
  );
}
