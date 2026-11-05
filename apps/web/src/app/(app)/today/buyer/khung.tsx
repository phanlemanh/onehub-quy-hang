import type { ReactNode } from "react";

// Khuôn của nhóm `hom-nay-dau-khach` (design/patterns/hom-nay-dau-khach.md): vùng «Đầu khách» của Hôm nay — một cột cuộn bố
// cục Dòng tin (ADR-0024), đặt trong KhungHomNay cạnh vùng của vai khác (Tham chiếu §10). Mỗi tin tự là một Frame của khối
// `solution-crm-5`; khuôn không thêm Frame nào để không lồng Frame trong Frame.
export function KhungHomNayDauKhach({ moTa, children }: { moTa?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby="hom-nay-dau-khach" className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h2 id="hom-nay-dau-khach" className="text-xl font-semibold tracking-tight">
          Đầu khách
        </h2>
        {moTa ? <p className="text-muted-foreground text-sm leading-5">{moTa}</p> : null}
      </div>
      {children}
    </section>
  );
}
