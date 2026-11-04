// Phần dựng của trang khách (hàng 35) — tách khỏi page.tsx để bài kiểm dựng được bằng renderToStaticMarkup.
import { TrangThai } from "@/components/trang-thai";
import { BaoMo } from "./bao-mo";
import { ChiTiet } from "./chi-tiet";
import type { ThanTrang } from "./doc";
import { KhungTrangKhach } from "./khung";
import { TheCan } from "./the-can";

export const LINK_TAT = "Link không còn mở được — hỏi lại người gửi";

export function TrangKhachCongKhai({ code, than, can }: { code: string; than: ThanTrang | null; can?: number }) {
  if (!than)
    return (
      <KhungTrangKhach>
        <TrangThai kind="notice" title={LINK_TAT} />
      </KhungTrangKhach>
    );
  const mot = can != null ? than.can[can] : undefined;
  return (
    <KhungTrangKhach dau={{ san: than.companyName, nguoi: than.senderName, soCan: than.can.length }}>
      <BaoMo code={code} />
      {mot ? (
        <ChiTiet b={mot} code={code} listingId={than.listingIds[can!]} />
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 p-4 sm:grid-cols-3">
          {than.can.map((b, i) => (
            <TheCan key={i} b={b} i={i} code={code} listingId={than.listingIds[i]} />
          ))}
        </div>
      )}
    </KhungTrangKhach>
  );
}
