// Phần dựng của trang khách (hàng 35) — tách khỏi page.tsx để bài kiểm dựng được bằng renderToStaticMarkup.
import { TrangThai } from "@/components/trang-thai";
import { BaoMo } from "./bao-mo";
import { ChiTiet } from "./chi-tiet";
import type { ThanTrang } from "./doc";
import { KhungTrangKhach } from "./khung";
import { TheCan } from "./the-can";

export const LINK_TAT = "Link không còn mở được — hỏi lại người gửi";
export const LOI_TAM = "Chưa mở được — thử lại sau";

/** Đầu trang của khuôn: tên sàn, người gửi, số căn — link không mở được thì không có đầu trang (không lộ sàn). */
export const dauCua = (than: ThanTrang | null) => (than ? { san: than.companyName, nguoi: than.senderName, soCan: than.can.length } : undefined);

/** Nội dung trong khuôn: bộ căn, chi tiết một căn (`?can=<thứ tự>`), hay câu link không mở được. */
export function NoiDungTrangKhach({ code, than, can, loiTam = false }: { code: string; than: ThanTrang | null; can?: number; loiTam?: boolean }) {
  if (loiTam) return <TrangThai kind="error" title={LOI_TAM} />;
  if (!than) return <TrangThai kind="notice" title={LINK_TAT} />;
  const mot = can != null ? than.can[can] : undefined;
  return (
    <>
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
    </>
  );
}

/** Trọn trang (khuôn + nội dung) — page.tsx dựng đúng cấu trúc này với khuôn ở gốc. */
export function TrangKhachCongKhai(p: { code: string; than: ThanTrang | null; can?: number; loiTam?: boolean }) {
  return (
    <KhungTrangKhach dau={dauCua(p.than)}>
      <NoiDungTrangKhach {...p} />
    </KhungTrangKhach>
  );
}
