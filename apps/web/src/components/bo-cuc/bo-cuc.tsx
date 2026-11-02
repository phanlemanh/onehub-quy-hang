import type { ReactNode } from "react";

import { TrangThai } from "@/components/trang-thai";
import { cn } from "cn";

import { ChoTai } from "./cho-tai";
import { DaiNgoaiTuyen } from "./dai-ngoai-tuyen";
import { coVung, type KieuBoCuc, THONG_TIN, type Vung } from "./ma-tran";

// Bố cục trang của hệ bố cục (ADR-0024): giữ khung trang — lề, đầu màn, xếp thân và cột phụ, bản điện thoại — còn mỗi
// vùng là một khối ReUI nguyên vẹn mang Frame của nó (đầu khung, thanh công cụ, chân). Bố cục KHÔNG dựng Frame: dựng thì
// khối thành Frame trong Frame và màn phải vẽ tay lại phần khối đã có (khảo sát ReUI + Verve, 02/11).

export type TrangThaiTai = "san-sang" | "cho-tai" | "loi" | "rong";

type Props = {
  kieu: KieuBoCuc;
  dauMan: ReactNode;
  /** Thân: một hay nhiều khối ReUI (mỗi khối một Frame). */
  children?: ReactNode;
  cotPhu?: ReactNode;
  /** Trạng thái tải của thân; mặc định `san-sang`. Rỗng và lỗi đi qua `rong`/`loi`, không dựng tay trong màn. */
  trangThai?: TrangThaiTai;
  rong?: ReactNode;
  loi?: ReactNode;
  /** Danh sách – chi tiết trên điện thoại: hai màn chồng — có chi tiết mở thì chỉ hiện cột phụ. */
  chiTietMo?: boolean;
  /** Danh sách – chi tiết trên máy tính: thân và cột phụ kéo chia (c-resizable-9) — bố cục nhận hàm xếp từ khối. */
  chiaDoi?: (trai: ReactNode, phai: ReactNode) => ReactNode;
  /** Trang mẫu sống dựng ngoại tuyến không cần ngắt mạng. */
  ngoaiTuyen?: boolean;
};

function chiCo(kieu: KieuBoCuc, vung: Vung, noiDung: ReactNode): ReactNode {
  if (noiDung == null) return null;
  if (!coVung(kieu, vung)) {
    if (process.env.NODE_ENV !== "production") console.warn(`bố cục ${kieu} không có vùng ${vung} — vùng bị bỏ (ADR-0024 §3)`);
    return null;
  }
  return noiDung;
}

export function BoCuc({ kieu, dauMan, children, cotPhu, trangThai = "san-sang", rong, loi, chiTietMo, chiaDoi, ngoaiTuyen }: Props) {
  const tt = THONG_TIN[kieu];
  const phu = trangThai === "san-sang" ? chiCo(kieu, "cot-phu", cotPhu) : null;
  const than = trangThai === "cho-tai" ? <ChoTai kieu={kieu} /> : trangThai === "loi" ? loi : trangThai === "rong" ? rong : children;

  const thanVaPhu = !phu ? (
    <div data-vung="than" className="flex min-w-0 flex-col gap-khung">
      {than}
    </div>
  ) : kieu === "danh-sach-chi-tiet" ? (
    <>
      <div className="hidden min-w-0 lg:flex">{chiaDoi ? chiaDoi(than, phu) : than}</div>
      <div className="flex min-w-0 flex-col gap-khung lg:hidden">
        <div data-vung="than" className={cn("min-w-0", chiTietMo && "max-lg:hidden")}>
          {than}
        </div>
        <div data-vung="cot-phu" className={cn("min-w-0", !chiTietMo && "max-lg:hidden")}>
          {phu}
        </div>
      </div>
    </>
  ) : kieu === "ho-so-hai-cot" ? (
    // Hồ sơ hai cột theo Verve: cột dữ kiện trái 20rem, thân phải; điện thoại dữ kiện lên trước.
    <div className="grid min-w-0 gap-khung lg:grid-cols-[20rem_minmax(0,1fr)]">
      <div data-vung="cot-phu" className="flex min-w-0 flex-col gap-khung">
        {phu}
      </div>
      <div data-vung="than" className="flex min-w-0 flex-col gap-khung">
        {than}
      </div>
    </div>
  ) : (
    // Luồng nhiều bước: thân hai phần, xem trước một phần.
    <div className="grid min-w-0 gap-khung lg:grid-cols-3">
      <div data-vung="than" className="flex min-w-0 flex-col gap-khung lg:col-span-2">
        {than}
      </div>
      <div data-vung="cot-phu" className="flex min-w-0 flex-col gap-khung">
        {phu}
      </div>
    </div>
  );

  return (
    <div
      data-bo-cuc-goc={kieu}
      data-bo-cuc={kieu}
      data-mat-do={tt.mat_do}
      className={cn("flex w-full min-w-0 flex-1 flex-col gap-khung p-trang", kieu === "dong-tin" && "mx-auto max-w-(--container-doc)")}
    >
      {dauMan}
      <DaiNgoaiTuyen ngoaiTuyen={ngoaiTuyen} />
      {kieu === "bang-dieu-khien" && (
        <div className="md:hidden">
          <TrangThai kind="notice" title="Bảng điều khiển không có trên điện thoại" description="Mở trên máy tính để xem đội." />
        </div>
      )}
      <div className={cn("flex min-w-0 flex-1 flex-col", kieu === "bang-dieu-khien" && "max-md:hidden")}>{thanVaPhu}</div>
    </div>
  );
}
