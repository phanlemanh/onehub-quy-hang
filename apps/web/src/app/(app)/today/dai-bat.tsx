"use client";

// Dải bật thông báo lead (hàng 26, ADR-0025) — vùng đầu Hôm nay cho đầu chủ và trưởng nhóm. Một Frame riêng như mọi vùng
// của khuôn KhungHomNay; trạng thái đi qua khuôn TrangThai. Đã bật thì dải ẩn; từ chối quyền thì chỉ một dòng chữ nhỏ.
import { BellRingIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Frame, FramePanel } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { batThongBao, docTrangThai, type TrangThaiThietBi } from "@/lib/push/dang-ky";

const BUOC_CAI = ["Bấm nút Chia sẻ ở thanh dưới của Safari", "Chọn «Thêm vào MH chính»", "Mở Quỹ hàng từ màn hình chính rồi bật thông báo"];

export function DaiBatThongBao() {
  const [tt, setTt] = useState<TrangThaiThietBi>("dang-kiem");
  const [dangBat, setDangBat] = useState(false);
  const [loi, setLoi] = useState(false);
  useEffect(() => {
    let huy = false;
    void docTrangThai().then((t) => {
      if (!huy) setTt(t);
    });
    return () => {
      huy = true;
    };
  }, []);

  if (tt === "dang-kiem" || tt === "da-bat") return null;
  if (tt === "tu-choi") return <p className="text-muted-foreground text-sm">Thông báo đang tắt trong trình duyệt</p>;

  // Thiết bị đã bật mà máy chủ chưa lưu (va-thong-bao-lead, Hỏi-1): cùng khối báo lỗi của lần bấm hỏng.
  const coLoi = loi || tt === "loi-luu";
  const bat = async () => {
    setDangBat(true);
    setLoi(false);
    const kq = await batThongBao();
    setDangBat(false);
    if (kq === "loi") setLoi(true);
    else setTt(kq);
  };

  const noiDung =
    tt === "ios-chua-cai" ? (
      <TrangThai
        kind="notice"
        title="Cài Quỹ hàng lên màn hình chính để nhận thông báo lead"
        description={
          <ol className="list-decimal ps-5">
            {BUOC_CAI.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ol>
        }
      />
    ) : tt === "chua-cau-hinh" ? (
      <TrangThai kind="notice" title="Thông báo chưa được cấu hình" description="Máy chủ chưa sẵn sàng gửi thông báo lead." />
    ) : tt === "khong-ho-tro" ? (
      <TrangThai kind="notice" title="Trình duyệt này không nhận được thông báo" description="Mở Quỹ hàng bằng Chrome, Edge hay Safari bản mới." />
    ) : (
      <TrangThai
        kind={coLoi ? "error" : "notice"}
        title={coLoi ? "Chưa bật được thông báo — thử lại" : "Bật thông báo lead"}
        description={
          <span className="flex flex-col items-start gap-2">
            <span>Nhận thông báo khi lead về bạn, kể cả khi không mở Quỹ hàng.</span>
            <Button size="sm" onClick={bat} disabled={dangBat}>
              <BellRingIcon data-icon="inline-start" />
              Bật thông báo
            </Button>
          </span>
        }
      />
    );

  return (
    <section aria-label="Thông báo lead" className="flex w-full max-w-7xl min-w-0 flex-col">
      <Frame className="w-full min-w-0">
        <FramePanel className="p-0!">{noiDung}</FramePanel>
      </Frame>
    </section>
  );
}
