"use client";

// Bảng hàng kèm hồ sơ căn đang mở (`/inventory?unit=<mã>&toa=<toà>&lan=<lần rao>`, Tham chiếu §routes): bấm dòng mở cột
// phải, bảng vẫn dùng được. Nhóm panel luôn dựng để bảng không dựng lại (mất lọc, cuộn) khi cột mở hay đóng.
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import type { DongBang } from "../../inventory/cot";
import { BangHang } from "../../inventory/bang-hang";
import { CotHoSo } from "./cot-ho-so";
import { docCot, dongCot, moCot, type ChonCan } from "./ho-so";
import { KhungHoSoCan } from "./khung";

export function BangCoHoSo({ nguoi, san }: { nguoi: string; san: string }) {
  const q = useSearchParams();
  const path = usePathname();
  const chon = docCot(new URLSearchParams(q));
  const qs = q.toString();

  const moCan = useCallback(
    (d: DongBang) => {
      if (!d.unitNumber) return;
      // Chỉ đổi URL — không điều hướng của Next, mất mạng vẫn đổi được căn (lượt 1 S4).
      window.history.replaceState(null, "", `${path}?${moCot(new URLSearchParams(qs), { ma: d.unitNumber, toa: d.buildingName, lan: d.id })}`);
    },
    [path, qs],
  );
  const duong = useCallback((c: ChonCan) => {
    const m = new URLSearchParams(dongCot(new URLSearchParams(qs)));
    m.set("unit", c.ma);
    if (c.toa) m.set("toa", c.toa);
    if (c.lan) m.set("lan", c.lan);
    return `${path}?${m}`;
  }, [path, qs]);
  const dong = dongCot(new URLSearchParams(qs));

  return (
    <ResizablePanelGroup orientation="horizontal" id="bang-co-ho-so">
      <ResizablePanel id="bang" minSize="35%">
        <BangHang nguoi={nguoi} san={san} dangMo={chon?.lan ?? null} onMoCan={moCan} />
      </ResizablePanel>
      {chon ? (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel id="ho-so" defaultSize="38%" minSize="28%">
            <KhungHoSoCan cot>
              <CotHoSo nguoi={nguoi} san={san} chon={chon} dongHref={dong ? `${path}?${dong}` : path} duong={duong} />
            </KhungHoSoCan>
          </ResizablePanel>
        </>
      ) : null}
    </ResizablePanelGroup>
  );
}
