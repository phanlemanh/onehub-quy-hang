import type { ReactNode } from "react";

import { TrangThai } from "@/components/trang-thai";
import { cn } from "cn";

import { ChoTai } from "./cho-tai";
import { DaiNgoaiTuyen } from "./dai-ngoai-tuyen";
import { NganNoi } from "./ngan-noi";
import { coVung, type KieuBoCuc, THONG_TIN, type Vung } from "./ma-tran";

// Bố cục trang của hệ bố cục (ADR-0024): giữ khung trang — lề, đầu màn, xếp thân và cột phụ, bản điện thoại — còn mỗi
// vùng là một khối ReUI nguyên vẹn mang Frame của nó (đầu khung, thanh công cụ, chân). Bố cục KHÔNG dựng Frame: dựng thì
// khối thành Frame trong Frame và màn phải vẽ tay lại phần khối đã có (khảo sát ReUI + Verve, 02/11). Hồ sơ là một cột căn
// giữa 48rem như hồ sơ căn đang chạy (chủ kho 02/11).

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
  /**
   * Danh sách – chi tiết: bảng giữ toàn bề rộng, chi tiết (cột phụ) trượt ra trong ngăn inset bên phải đè lên bảng mà bảng
   * vẫn bấm được (sheet-9; chủ kho 02/11). Điện thoại mở ngăn từ đáy.
   */
  chiTiet?: { mo: boolean; onMo: (mo: boolean) => void; tieuDe: ReactNode; hanhDong?: ReactNode; chan?: ReactNode };
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

export function BoCuc({ kieu, dauMan, children, cotPhu, trangThai = "san-sang", rong, loi, chiTiet, ngoaiTuyen }: Props) {
  const tt = THONG_TIN[kieu];
  const phu = trangThai === "san-sang" ? chiCo(kieu, "cot-phu", cotPhu) : null;
  const than = trangThai === "cho-tai" ? <ChoTai kieu={kieu} /> : trangThai === "loi" ? loi : trangThai === "rong" ? rong : children;

  const thanVaPhu = !phu ? (
    <div data-vung="than" className="flex min-w-0 flex-col gap-khung">
      {than}
    </div>
  ) : kieu === "danh-sach-chi-tiet" ? (
    <>
      <div data-vung="than" className="flex min-w-0 flex-col gap-khung">
        {than}
      </div>
      {chiTiet && (
        <NganNoi phuBang mo={chiTiet.mo} onMo={chiTiet.onMo} tieuDe={chiTiet.tieuDe} hanhDong={chiTiet.hanhDong} chan={chiTiet.chan}>
          <div data-vung="cot-phu">{phu}</div>
        </NganNoi>
      )}
    </>
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
      className={cn("flex w-full min-w-0 flex-1 flex-col gap-khung p-trang", (kieu === "dong-tin" || kieu === "ho-so") && "mx-auto max-w-(--container-doc)")}
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
