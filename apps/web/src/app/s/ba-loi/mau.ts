// Dữ liệu mẫu của trang ba lối hàng 35 (ADR-0019): bốn căn mẫu, nhãn mẫu, không người thật. Mọi căn đi qua `banRaNgoai`
// của lõi như trang thật — trang ba lối chỉ đổi cách trình, không đổi dữ liệu ra. Gỡ cùng trang khi chủ kho chọn lối.
import { banRaNgoai, canMoi, type CanNoiBo, type CanRaNgoai } from "@quy-hang/core/redaction";

const HOM_NAY = "2026-11-04";

const can = (o: Partial<CanNoiBo>): CanNoiBo => ({
  ...canMoi(),
  companyName: "[Tên sàn] Mẫu",
  senderName: "[Tên] Đầu khách mẫu",
  photos: [],
  ...o,
});

const NOI_BO: readonly CanNoiBo[] = [
  can({ buildingName: "Toà A", floor: 12, livingArea: 74.5, bedroomsTotal: 2, listPrice: 4_250_000_000, lastConfirmedAt: "2026-11-01T09:00:00Z" }),
  can({ buildingName: "Toà B", floor: 3, livingArea: 56, bedroomsTotal: 1, directionFaces: "Tây Bắc", listPrice: 2_980_000_000, feeInclusion: "included", lastConfirmedAt: "2026-11-04T08:00:00Z" }),
  can({ buildingName: "Toà A", floor: 8, livingArea: 92.3, bedroomsTotal: 3, standardStatus: "Pending", listPrice: 5_600_000_000, lastConfirmedAt: "2026-10-28T09:00:00Z" }),
  can({ buildingName: "Toà C", floor: 14, livingArea: 68, bedroomsTotal: 2, standardStatus: "Hold", listPrice: 3_700_000_000 }),
];

export const BO_MAU: readonly CanRaNgoai[] = NOI_BO.map((c) => banRaNgoai(c, { cua: "gui_link", nguoiNhan: "khach_rieng", today: HOM_NAY }));
