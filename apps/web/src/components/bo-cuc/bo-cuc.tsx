import type { ReactNode } from "react";

import { TrangThai } from "@/components/trang-thai";
import { cn } from "cn";

import { ChoTai } from "./cho-tai";
import { type ChiTiet, CotKeoChia } from "./cot-keo-chia";
import { DaiNgoaiTuyen } from "./dai-ngoai-tuyen";
import { LuongToanMan } from "./luong-toan-man";
import { coVung, type KieuBoCuc, THONG_TIN, type Vung } from "./ma-tran";

// Bố cục trang của hệ bố cục (ADR-0024): giữ khung trang — lề, đầu màn, xếp thân và cột phụ, bản điện thoại — còn mỗi
// vùng là một khối ReUI nguyên vẹn mang Frame của nó (đầu khung, thanh công cụ, chân). Bố cục KHÔNG dựng Frame: dựng thì
// khối thành Frame trong Frame và màn phải vẽ tay lại phần khối đã có (khảo sát ReUI + Verve, 02/11). Hồ sơ là một cột căn
// giữa 48rem như hồ sơ căn đang chạy (chủ kho 02/11). Danh sách – chi tiết đặt chi tiết ở cột kéo chia (`CotKeoChia`,
// sửa đổi 05/11); ngăn nổi `NganNoi` giữ cho ngăn báo, lọc trên điện thoại và Luồng nhiều bước.

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
   * Danh sách – chi tiết có chi tiết (ADR-0024 sửa đổi 05/11, hàng 105): trên máy tính chi tiết (cột phụ) là cột kéo chia
   * đứng cạnh thân (`app-shell-11`, 38%, kéo 28–50%), cao từ đỉnh vùng làm việc tới đáy; gốc cao bằng vùng làm việc nên
   * trang không cuộn, thân tự cuộn trong khối của nó. Điện thoại mở ngăn từ đáy khi có `tieuDe`.
   */
  chiTiet?: ChiTiet;
  /** Trang mẫu sống dựng ngoại tuyến không cần ngắt mạng. */
  ngoaiTuyen?: boolean;
  /** Luồng nhiều bước: tên luồng ở đầu ngăn toàn màn trên điện thoại, và việc khi người đóng ngăn (mặc định quay lại). */
  luong?: { tieuDe: ReactNode; onDong?: () => void };
};

function chiCo(kieu: KieuBoCuc, vung: Vung, noiDung: ReactNode): ReactNode {
  if (noiDung == null) return null;
  if (!coVung(kieu, vung)) {
    if (process.env.NODE_ENV !== "production") console.warn(`bố cục ${kieu} không có vùng ${vung} — vùng bị bỏ (ADR-0024 §3)`);
    return null;
  }
  return noiDung;
}

export function BoCuc({ kieu, dauMan, children, cotPhu, trangThai = "san-sang", rong, loi, chiTiet, ngoaiTuyen, luong }: Props) {
  const tt = THONG_TIN[kieu];
  const phu = trangThai === "san-sang" ? chiCo(kieu, "cot-phu", cotPhu) : null;
  const than = trangThai === "cho-tai" ? <ChoTai kieu={kieu} /> : trangThai === "loi" ? loi : trangThai === "rong" ? rong : children;

  // Kéo chia: nhóm panel dựng cả khi cột đóng, để thân không dựng lại khi cột mở hay đóng.
  const keoChia = kieu === "danh-sach-chi-tiet" && chiTiet !== undefined;

  const thanVaPhu = keoChia ? (
    <CotKeoChia than={than} phu={phu} chiTiet={chiTiet} />
  ) : !phu ? (
    <div data-vung="than" className="flex min-w-0 flex-col gap-khung">
      {than}
    </div>
  ) : kieu === "danh-sach-chi-tiet" ? (
    // Không khai chi tiết: màn chưa mở cột (Lead đã nhập, Đã gửi) — chỉ thân, trang cuộn như cũ.
    <div data-vung="than" className="flex min-w-0 flex-col gap-khung">
      {than}
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

  const noiDung = (
    <>
      {dauMan}
      <DaiNgoaiTuyen ngoaiTuyen={ngoaiTuyen} />
      {kieu === "bang-dieu-khien" && (
        <div className="md:hidden">
          <TrangThai kind="notice" title="Bảng điều khiển không có trên điện thoại" description="Mở trên máy tính để xem đội." />
        </div>
      )}
      <div className={cn("flex min-w-0 flex-1 flex-col", kieu === "bang-dieu-khien" && "max-md:hidden", keoChia && "md:min-h-0")}>{thanVaPhu}</div>
    </>
  );

  return (
    <div
      data-bo-cuc-goc={kieu}
      data-bo-cuc={kieu}
      data-mat-do={tt.mat_do}
      className={cn(
        "flex w-full min-w-0 flex-1 flex-col gap-khung p-trang",
        (kieu === "dong-tin" || kieu === "ho-so") && "mx-auto max-w-(--container-doc)",
        // Đọc giữ bề rộng đọc, đứng sát cột mục lục bên trái (ADR-0024 sửa đổi 04/11, hàng cai-dat-hop-nhat).
        kieu === "doc" && "max-w-(--container-doc)",
        // Kéo chia: gốc cao đúng vùng làm việc (trang không cuộn), cột và thân chạy tới đáy vùng làm việc.
        keoChia && "md:min-h-0 md:overflow-hidden md:pb-0",
      )}
    >
      {kieu === "luong-nhieu-buoc" ? (
        // Điện thoại: cả luồng nằm trong ngăn phủ toàn màn (ADR-0024 §5); máy tính giữ trong trang.
        <LuongToanMan tieuDe={luong?.tieuDe ?? tt.ten} onDong={luong?.onDong}>
          {noiDung}
        </LuongToanMan>
      ) : (
        noiDung
      )}
    </div>
  );
}
