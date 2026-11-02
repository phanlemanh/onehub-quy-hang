import { Children, Fragment, type ReactNode } from "react";

import { Badge } from "@/components/reui/badge";
import { Frame, FramePanel } from "@/components/reui/frame";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// chuyển thể solution-crm-4 (ReUI Pro) — giải phẫu hồ sơ một bản ghi rút từ hồ sơ căn đang chạy (hàng 17, `units/ho-so/`),
// chủ kho 02/11 chọn làm chuẩn cho bố cục Hồ sơ (hàng 91): đầu hồ sơ · khối số chính · các mục có tiêu đề in hoa, ngăn bằng
// đường kẻ. Giữ nguyên lớp và khoảng cách của màn đang chạy; hồ sơ căn, liên hệ, lead dựng từ các mảnh này.

const TIEU_MUC = "text-xs font-medium uppercase tracking-wide text-muted-foreground";

/**
 * Khung hồ sơ: toàn màn là một Frame (bố cục Hồ sơ căn giữa 48rem); cạnh bảng (`cot`) là một FramePanel cuộn trong cột phụ
 * của Danh sách – chi tiết. Các mảnh con xếp chồng, bố cục chèn đường kẻ giữa chúng.
 */
export function KhungHoSo({ cot = false, nhan = "Hồ sơ", children }: { cot?: boolean; nhan?: string; children: ReactNode }) {
  const than = <ThanHoSo>{children}</ThanHoSo>;
  if (cot)
    return (
      <FramePanel className="flex h-full min-h-0 flex-col overflow-y-auto p-0" aria-label={nhan}>
        {than}
      </FramePanel>
    );
  return (
    <Frame className="w-full">
      <FramePanel className="flex flex-col p-0" aria-label={nhan}>
        {than}
      </FramePanel>
    </Frame>
  );
}

/** Thân hồ sơ không khung: các mảnh xếp chồng, ngăn bằng đường kẻ — đặt trong ngăn nổi (NganNoi) hay trong KhungHoSo. */
export function ThanHoSo({ children }: { children: ReactNode }) {
  const manh = Children.toArray(children).filter(Boolean);
  return (
    <div className="flex flex-col" data-slot="ho-so">
      {manh.map((m, i) => (
        <Fragment key={i}>
          {i > 0 && <Separator />}
          {m}
        </Fragment>
      ))}
    </div>
  );
}

/** Đầu hồ sơ: dòng ngữ cảnh nhỏ · tên và nhãn trạng thái · nút góc phải (mở toàn màn, đóng) · một dòng phụ. */
export function DauHoSo({
  ngu,
  ten,
  trangThai,
  trangThaiTone = "success-light",
  phu,
  nut,
}: {
  ngu?: ReactNode;
  ten: ReactNode;
  trangThai?: ReactNode;
  trangThaiTone?: "success-light" | "warning-light" | "info-light" | "destructive-light" | "outline";
  phu?: ReactNode;
  nut?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          {ngu && <span className="text-xs text-muted-foreground">{ngu}</span>}
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{ten}</h2>
            {trangThai && <Badge variant={trangThaiTone}>{trangThai}</Badge>}
          </div>
        </div>
        {nut && <div className="flex gap-1">{nut}</div>}
      </div>
      {phu && <span className="text-xs text-muted-foreground">{phu}</span>}
    </div>
  );
}

/** Khối số chính của hồ sơ: một con số lớn, nhãn phụ, và thanh tiến độ (mức đủ, xác suất…) khi có. */
export function SoChinh({
  giaTri,
  nhan,
  tienDo,
}: {
  giaTri: ReactNode;
  nhan?: ReactNode;
  tienDo?: { co: number; tren: number; chu: ReactNode; nhanThanh: string };
}) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold">{giaTri}</span>
        {nhan && <Badge variant="outline">{nhan}</Badge>}
      </div>
      {tienDo && (
        <>
          <Progress value={(tienDo.co / tienDo.tren) * 100} aria-label={tienDo.nhanThanh} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{tienDo.chu}</span>
            <span>
              {tienDo.co}/{tienDo.tren}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/** Một mục của hồ sơ: tiêu đề in hoa, hành động bên phải, nội dung. */
export function MucHoSo({ tieuDe, phai, id, children }: { tieuDe: string; phai?: ReactNode; id?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 p-4" aria-label={tieuDe} id={id}>
      <div className="flex min-h-8 items-center justify-between gap-2">
        <h3 className={TIEU_MUC}>{tieuDe}</h3>
        {phai}
      </div>
      {children}
    </section>
  );
}

/** Cặp nhãn – giá trị của một mục: nhãn 8rem, giá trị phần còn lại. */
export function CapGiaTri({ ds }: { ds: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm">
      {ds.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
