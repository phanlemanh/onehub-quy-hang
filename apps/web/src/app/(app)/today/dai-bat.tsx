"use client";

// Dải bật thông báo lead (hàng 26, ADR-0025) — vùng đầu Hôm nay cho đầu chủ và trưởng nhóm. Một Frame riêng như mọi vùng
// của khuôn KhungHomNay; trạng thái đi qua khuôn TrangThai. Đã bật thì dải ẩn; từ chối quyền thì chỉ một dòng chữ nhỏ.
import { BellRingIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Frame, FramePanel } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { batThongBao, docTrangThai, type TrangThaiThietBi } from "@/lib/push/dang-ky";
import { BUOC_CAI_IOS, MO_THONG_BAO, NHAN_THONG_BAO } from "@/lib/push/nhan";


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
  if (tt === "tu-choi") return <p className="text-muted-foreground text-sm">{NHAN_THONG_BAO["tu-choi"]}</p>;

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
        title={NHAN_THONG_BAO["ios-chua-cai"]}
        description={
          <ol className="list-decimal ps-5">
            {BUOC_CAI_IOS.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ol>
        }
      />
    ) : tt === "chua-cau-hinh" ? (
      <TrangThai kind="notice" title={NHAN_THONG_BAO["chua-cau-hinh"]} description={MO_THONG_BAO["chua-cau-hinh"]} />
    ) : tt === "khong-ho-tro" ? (
      <TrangThai kind="notice" title={NHAN_THONG_BAO["khong-ho-tro"]} description={MO_THONG_BAO["khong-ho-tro"]} />
    ) : (
      <TrangThai
        kind={coLoi ? "error" : "notice"}
        title={coLoi ? NHAN_THONG_BAO["loi-luu"] : NHAN_THONG_BAO["chua-bat"]}
        description={
          <span className="flex flex-col items-start gap-2">
            <span>{MO_THONG_BAO["chua-bat"]}</span>
            <Button size="sm" onClick={bat} disabled={dangBat}>
              <BellRingIcon data-icon="inline-start" />
              Bật thông báo
            </Button>
          </span>
        }
      />
    );

  return (
    <section aria-label="Thông báo lead" className="flex w-full min-w-0 flex-col">
      <Frame className="w-full min-w-0">
        <FramePanel className="p-0!">{noiDung}</FramePanel>
      </Frame>
    </section>
  );
}
