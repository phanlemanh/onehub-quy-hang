"use client";
// Hai nút tải của trang nhóm môi giới (hàng 44): tệp dựng trên máy người mở từ thân trang đã qua luật ẩn (Hỏi-6).
import { Download, ImageDown } from "lucide-react";
import { useState } from "react";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import type { ThanTrang } from "../[code]/doc";
import { CHU_MG } from "./chu";
import { anhMoiGioi, moHinhTep, xlsxMoiGioi } from "./tep";

function luu(blob: Blob, ten: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = ten;
  a.click();
  URL.revokeObjectURL(url);
}

/** Phần dựng của hai nút và câu báo lỗi — tách khỏi trạng thái để bài thuần dựng được trạng thái «tải lỗi» (E10c). */
export function KhungNutTai({ loi, taiExcel, taiAnh }: { loi: boolean; taiExcel: () => void; taiAnh: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={taiExcel}>
        <Download />
        {CHU_MG.taiExcel}
      </Button>
      <Button variant="outline" size="sm" onClick={taiAnh}>
        <ImageDown />
        {CHU_MG.taiAnh}
      </Button>
      {loi ? <TrangThai kind="error" title={CHU_MG.taiLoi} /> : null}
    </div>
  );
}

export function NutTai({ than, code }: { than: ThanTrang; code: string }) {
  const [loi, setLoi] = useState(false);
  const chay = async (f: () => Promise<void>) => {
    setLoi(false);
    try {
      await f();
    } catch {
      setLoi(true);
    }
  };
  const m = moHinhTep(than);
  return (
    <KhungNutTai
      loi={loi}
      taiExcel={() => void chay(async () => luu(new Blob([xlsxMoiGioi(m) as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `bang-hang-${code}.xlsx`))}
      taiAnh={() => void chay(async () => luu(await anhMoiGioi(m), `bang-hang-${code}.png`))}
    />
  );
}
