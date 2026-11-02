import { HammerIcon } from "lucide-react";

import { BoCuc, DauMan, type DuongDan } from "@/components/bo-cuc";
import { Frame, FramePanel } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";

// Khuôn của nhóm `trang-tam` (design/patterns/trang-tam.md). Trang giữ chỗ của nhà chưa có màn: cho biết màn này dựng ở mục nào của lộ trình (docs/plan/lo-trinh.json, trường
// `ma`). «Mục», không «hàng» — «Hàng» trong từ vựng là một lần chào bán căn. Trang tạm đi bố cục Đọc (hàng 91); `trongKhung`
// khi đặt trong khuôn của một màn khác (Hôm nay theo vai) — khung đã có bố cục của nó.
type Info = { title: string; question: string; rows: string };

const PLACEHOLDER: Record<string, Info> = {
  "/today": { title: "Hôm nay", question: "Giờ làm gì?", rows: "mục 22 (máy tính), 39 (điện thoại)" },
  "/shares": { title: "Đã gửi", question: "Khách đang phản ứng ra sao?", rows: "mục 34 (luồng Gửi), 36 (Đã gửi)" },
  "/viewings": { title: "Lịch xem", question: "Khách hẹn xem căn nào, lúc nào?", rows: "chưa xếp mục" },
  "/team": { title: "Đội", question: "Đội đang chạy thế nào?", rows: "chưa xếp mục" },
  "/settings/labels": { title: "Cách gọi", question: "Sàn gọi tên trường và giá trị thế nào?", rows: "mục 45" },
  "/settings/statuses": { title: "Trạng thái", question: "Hàng đi qua những trạng thái nào?", rows: "mục 46" },
  "/settings/fields": { title: "Trường riêng", question: "Sàn cần thêm trường nào?", rows: "mục 47" },
  "/settings/lead-routing": { title: "Luật chia lead", question: "Lead mới về tay ai?", rows: "mục 48" },
  "/settings/fees": { title: "Thuế phí", question: "Giá bao phí tính thế nào?", rows: "mục 49" },
  "/settings/templates": { title: "Mẫu nhập", question: "Bảng tính mẫu của sàn", rows: "mục 50" },
  "/leads/new": { title: "Lead", question: "Nhận lead chủ nhà", rows: "mục 24 (máy tính), 51 (điện thoại)" },
  "/imports/new": { title: "Nhập Excel", question: "Đưa hàng vào từ bảng tính", rows: "mục 20" },
  "/exports/new": { title: "Phát hàng", question: "Đưa hàng ra ngoài sàn", rows: "mục 43" },
  "/me": { title: "Tôi", question: "Tài khoản, sàn đang làm, cài app", rows: "mục 38" },
};

export function placeholderFor(path: string): Info {
  const unit = /^\/units\/([^/]+)/.exec(path);
  if (unit) {
    const code = decodeURIComponent(unit[1] ?? "");
    return { title: `Căn ${code}`, question: `Căn ${code}: chưa có dữ liệu`, rows: "mục 33 (điện thoại)" };
  }
  return PLACEHOLDER[path] ?? { title: "Chưa có màn", question: "Chưa có màn ở địa chỉ này", rows: "chưa xếp mục" };
}

function duongDanCua(path: string, title: string): [DuongDan, DuongDan] {
  if (path.startsWith("/settings/")) return [{ nhan: "Cài đặt sàn", href: "/settings" }, { nhan: title }];
  return [{ nhan: "Quỹ hàng", href: "/" }, { nhan: title }];
}

export function Placeholder({ path, trongKhung = false }: { path: string; trongKhung?: boolean }) {
  const p = placeholderFor(path);
  const than = (
    <Frame className="w-full">
      <FramePanel>
        <TrangThai
          kind="empty"
          icon={HammerIcon}
          title="Màn này đang dựng"
          description={p.rows === "chưa xếp mục" ? "Chưa xếp mục nào trong lộ trình." : `Dựng ở ${p.rows} của lộ trình.`}
        />
      </FramePanel>
    </Frame>
  );
  if (trongKhung) return than;
  return (
    <BoCuc kieu="doc" dauMan={<DauMan duongDan={duongDanCua(path, p.title)} tieuDe={p.title} moTa={p.question} />}>
      {than}
    </BoCuc>
  );
}
