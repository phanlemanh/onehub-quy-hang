import type { ReactNode } from "react";

import { Frame, FrameFooter, FramePanel } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";
import { cn } from "cn";

import { ChoTai } from "./cho-tai";
import { DaiNgoaiTuyen } from "./dai-ngoai-tuyen";
import { coVung, type KieuBoCuc, THONG_TIN, type Vung } from "./ma-tran";

// Bố cục trang của hệ bố cục (ADR-0024): màn chọn một trong bảy kiểu và điền vùng; lề, bề rộng, khoảng cách và bản
// điện thoại thuộc về đây, đọc từ token bố cục ở globals.css. Vùng không thuộc kiểu đã chọn không hiện (bảng vùng ở
// ma-tran.ts) và bị báo ở môi trường dựng.

export type TrangThaiTai = "san-sang" | "cho-tai" | "loi" | "rong";

type Props = {
  kieu: KieuBoCuc;
  dauMan: ReactNode;
  thanhCongCu?: ReactNode;
  cotPhu?: ReactNode;
  chan?: ReactNode;
  /** Thân: nội dung của màn khi đã có dữ liệu. */
  children?: ReactNode;
  /** Trạng thái tải của thân; mặc định `san-sang`. Rỗng và lỗi đi qua `rong`/`loi`, không dựng tay trong màn. */
  trangThai?: TrangThaiTai;
  rong?: ReactNode;
  loi?: ReactNode;
  /** Danh sách – chi tiết trên điện thoại: hai màn chồng — có chi tiết mở thì chỉ hiện cột phụ. */
  chiTietMo?: boolean;
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

export function BoCuc({ kieu, dauMan, thanhCongCu, cotPhu, chan, children, trangThai = "san-sang", rong, loi, chiTietMo, ngoaiTuyen }: Props) {
  const tt = THONG_TIN[kieu];
  const congCu = chiCo(kieu, "thanh-cong-cu", thanhCongCu);
  const phu = chiCo(kieu, "cot-phu", cotPhu);
  const day = chiCo(kieu, "chan", chan);

  const than =
    trangThai === "cho-tai" ? (
      <ChoTai kieu={kieu} />
    ) : trangThai === "loi" ? (
      loi
    ) : trangThai === "rong" ? (
      rong
    ) : (
      children
    );

  const khung = (
    <Frame data-bo-cuc={kieu} data-mat-do={tt.mat_do} className="w-full">
      {dauMan}
      <DaiNgoaiTuyen ngoaiTuyen={ngoaiTuyen} />
      {congCu && (
        <div data-vung="thanh-cong-cu" className="flex flex-wrap items-center gap-2 px-(--frame-px)">
          {congCu}
        </div>
      )}
      <ThanVaCotPhu kieu={kieu} than={than} phu={trangThai === "san-sang" ? phu : null} chiTietMo={chiTietMo} />
      {day && (
        <FrameFooter
          data-vung="chan"
          className={cn(
            "flex flex-row flex-wrap items-center justify-end gap-2",
            (kieu === "luong-nhieu-buoc" || kieu === "doc") && "max-md:sticky max-md:bottom-0 max-md:bg-background",
          )}
        >
          {day}
        </FrameFooter>
      )}
    </Frame>
  );

  return (
    <div
      data-bo-cuc-goc={kieu}
      className={cn(
        "flex w-full min-w-0 flex-1 flex-col gap-khung p-trang",
        (kieu === "doc" || kieu === "dong-tin") && "mx-auto max-w-(--container-doc)",
      )}
    >
      {kieu === "bang-dieu-khien" && (
        <div className="md:hidden">
          <TrangThai kind="notice" title="Bảng điều khiển không có trên điện thoại" description="Mở trên máy tính để xem đội." />
        </div>
      )}
      <div className={cn("flex min-w-0 flex-1 flex-col", kieu === "bang-dieu-khien" && "max-md:hidden")}>{khung}</div>
    </div>
  );
}

function ThanVaCotPhu({ kieu, than, phu, chiTietMo }: { kieu: KieuBoCuc; than: ReactNode; phu: ReactNode; chiTietMo?: boolean }) {
  if (!phu)
    return (
      <FramePanel data-vung="than" className="flex min-w-0 flex-col gap-khung">
        {than}
      </FramePanel>
    );
  if (kieu === "danh-sach-chi-tiet")
    return (
      <div className="grid min-w-0 gap-(--frame-gap) lg:grid-cols-3">
        <FramePanel data-vung="than" className={cn("flex min-w-0 flex-col gap-khung lg:col-span-2", chiTietMo && "max-md:hidden")}>
          {than}
        </FramePanel>
        <FramePanel data-vung="cot-phu" className={cn("min-w-0", !chiTietMo && "max-md:hidden")}>
          {phu}
        </FramePanel>
      </div>
    );
  // Hồ sơ hai cột và Luồng nhiều bước: thân hai phần, cột phụ một phần; điện thoại xếp một cột.
  return (
    <div className="grid min-w-0 gap-(--frame-gap) lg:grid-cols-3">
      <FramePanel data-vung="than" className="flex min-w-0 flex-col gap-khung lg:col-span-2">
        {than}
      </FramePanel>
      <FramePanel data-vung="cot-phu" className="min-w-0">
        {phu}
      </FramePanel>
    </div>
  );
}
