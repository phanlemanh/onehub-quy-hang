"use client";

// Lối «ReUI» (hàng 42, ADR-0019): khối ReUI Pro dashboard-6 chuyển thể ở `components/khoi/dashboard-6` — dải ô số
// (MetricPanel), bảng theo đầu chủ (CoverageTable) cạnh hàng đợi lead quá hạn (ActionQueue); bỏ biểu đồ và bộ chọn ngày.
// Gỡ khi màn thật ra.
import type { ReactNode } from "react";
import { AlertTriangleIcon, ClockAlertIcon, HistoryIcon, PhoneOffIcon, UserRoundXIcon } from "lucide-react";

import { CoverageDashboard } from "@/components/khoi/dashboard-6/coverage-dashboard";
import type { CrewMember, CrewStatus, MetricCard, QueueAction } from "@/components/khoi/dashboard-6/data";
import { Badge } from "@/components/reui/badge";
import { GiaoLai, useTruongNhom } from "./chung";
import { BADGE_LOAI, CHU_PHAM_VI, CHUA_CO_NGUOI, chuQuaHan, NHAN_LOAI, tenDauChu, type LoaiViec } from "./mau";

const ICON_LOAI: Record<LoaiViec, ReactNode> = {
  "chua-chia": <UserRoundXIcon aria-hidden="true" />,
  "qua-han-nhan": <ClockAlertIcon aria-hidden="true" />,
  "qua-han-goi": <PhoneOffIcon aria-hidden="true" />,
};

const trangThai = (tuoi: number): CrewStatus => (tuoi >= 80 ? "tuoi" : tuoi >= 60 ? "chu-y" : "cu");

export function ReUI() {
  const tn = useTruongNhom();
  const metrics: MetricCard[] = [
    { id: "qua-han", label: "Lead quá hạn", value: String(tn.so.leadQuaHan), detail: "quá hạn nhận hay gọi", change: "Giao lại", variant: "destructive-light", icon: <ClockAlertIcon aria-hidden="true" /> },
    { id: "ngoai-le", label: "Ngoại lệ", value: String(tn.so.ngoaiLe), detail: "lead chưa chia được", change: "Chưa có người", variant: "warning-light", icon: <AlertTriangleIcon aria-hidden="true" /> },
    { id: "hang-cu", label: "Hàng cũ", value: String(tn.so.hangCu), detail: "căn cần gọi lại", change: "Toàn sàn", variant: "info-light", icon: <HistoryIcon aria-hidden="true" /> },
  ];
  const members: CrewMember[] = [
    ...tn.dauChu.map((d) => ({
      id: d.id,
      name: d.ten,
      role: d.nghi ? "Đang nghỉ" : "Đầu chủ",
      initials: d.ten.replace(/[[\]]/g, "").split(" ").pop()?.slice(0, 2) ?? "—",
      location: String(d.canMo),
      coverage: d.tuoi,
      reliefHours: d.canGoiLai,
      notes: `${d.canMo - d.canGoiLai}/${d.canMo} căn`,
      status: trangThai(d.tuoi),
    })),
    {
      id: "chua-co",
      name: "Chưa có người giữ",
      role: "Cần chia",
      initials: "—",
      location: String(CHUA_CO_NGUOI.canMo),
      coverage: CHUA_CO_NGUOI.tuoi,
      reliefHours: CHUA_CO_NGUOI.canGoiLai,
      notes: `${CHUA_CO_NGUOI.canMo - CHUA_CO_NGUOI.canGoiLai}/${CHUA_CO_NGUOI.canMo} căn`,
      status: trangThai(CHUA_CO_NGUOI.tuoi),
    },
  ];
  const items: QueueAction[] = tn.hangDoi.map((d) => ({
    id: d.id,
    title: `${d.toa} · ${d.can ?? "chỉ biết toà"}`,
    detail: (
      <span className="flex items-center gap-1.5">
        <Badge variant={BADGE_LOAI[d.loai]}>{NHAN_LOAI[d.loai]}</Badge>
        <span className="truncate">
          {tenDauChu(tn.dauChu, d.dauChu)} · {chuQuaHan(d.phut)}
        </span>
      </span>
    ),
    variant: BADGE_LOAI[d.loai],
    icon: ICON_LOAI[d.loai],
  }));

  return (
    <CoverageDashboard
      heading="Hôm nay của trưởng nhóm"
      crumbs={[{ label: "Hôm nay", href: "/today" }, { label: "Trưởng nhóm" }]}
      metrics={metrics}
      members={members}
      coverage={{
        title: "Theo đầu chủ",
        description: "Căn đang mở, cần gọi lại và độ tươi",
        badge: `${tn.dauChu.length} đầu chủ`,
        member: "Đầu chủ",
        location: "Căn đang mở",
        coverage: "Tỉ lệ tươi",
        relief: "Cần gọi lại",
        status: "Trạng thái",
        empty: "Chưa có căn nào",
        footnote: CHU_PHAM_VI,
      }}
      queue={{
        title: "Lead quá hạn và ngoại lệ",
        description: items.length > 0 ? `${items.length} lead, lâu nhất trước` : "Không lead nào quá hạn",
        emptyTitle: "Không lead nào quá hạn",
        emptyDescription: "Lead mới chia sẽ hiện ở đây khi quá hạn.",
      }}
      queueItems={items}
      renderQueueCta={(item) => {
        const dong = tn.hangDoi.find((d) => d.id === item.id);
        return dong ? <GiaoLai dong={dong} tn={tn} size="xs" /> : null;
      }}
    />
  );
}
