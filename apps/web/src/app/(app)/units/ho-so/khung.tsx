import type { ReactNode } from "react";

import { BoCuc } from "@/components/bo-cuc";
import { Frame, FramePanel } from "@/components/reui/frame";

// Khuôn của nhóm `ho-so-can` (design/patterns/ho-so-can.md): hồ sơ một căn toàn màn (`/units/<mã>`) dựng trong bố cục «Hồ
// sơ» của ADR-0024 (hàng 33) — một cột căn giữa, thân là đúng một Frame; ở cột phải của Bảng hàng (`/inventory?unit=`) nó
// là một FramePanel trong Frame của Bảng hàng, cạnh lưới; trên điện thoại trong Bảng hàng thẻ (`nhung`) là Frame trần vì
// trang Bảng hàng giữ lề. Lối dựng bên trong: `solution-crm-4` chuyển thành cột (Cổng Phạm vi hàng 17, Hỏi-2).
export function KhungHoSoCan({ cot = false, nhung = false, children }: { cot?: boolean; nhung?: boolean; children: ReactNode }) {
  if (cot) {
    return (
      // eslint-disable-next-line quy-hang-ui/no-layout-arbitrary -- cột phải cuộn riêng trong Frame của Bảng hàng (trên máy tính): cao bằng phần còn lại của khung Bảng hàng, không phải trang của hồ sơ
      <FramePanel className="flex h-[calc(100svh-10.5rem)] min-h-96 flex-col overflow-y-auto p-0" aria-label="Hồ sơ căn">
        {children}
      </FramePanel>
    );
  }
  const khung = (
    <Frame className="w-full">
      {/* overflow-visible: FramePanel cắt tràn mặc định, làm nút «Hỏi đầu chủ» không dính đáy khung nhìn (hàng 33, S4 E9). */}
      <FramePanel className="flex flex-col overflow-visible p-0" aria-label="Hồ sơ căn">
        {children}
      </FramePanel>
    </Frame>
  );
  if (nhung) return khung;
  return (
    <BoCuc kieu="ho-so" dauMan={null}>
      {khung}
    </BoCuc>
  );
}
