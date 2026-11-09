// Đọc dấu định nghĩa cho dòng phụ dưới giá bao phí (va-dinh-nghia-doc-lai, Ngoài-3 hàng 49). Dấu do cơ sở dữ liệu đóng lúc giá vào máy chủ,
// nên giá còn chờ gửi thì chưa có dấu của giá ấy: không đọc, không có dòng, và lần đọc đang giữ bị bỏ để hết chờ là đọc lại. Thứ tự đọc nằm
// ở đây, không dính React, để bài kiểm chạy đúng thứ tự thật; thành phần chỉ nối.
import type { DauPhi } from "@quy-hang/core/pricing";
import type { Goi } from "@/lib/sync/types";
import { dongDinhNghia } from "./dinh-nghia";
import type { HoSoCo } from "./mo-hinh";

/** Điều dòng phụ cần biết: giá trên máy, giá có còn chờ gửi không, lần kéo thành công gần nhất. */
export type VaoDong = { listingId: string; gia: number | null; phi: string | null; giaChoGui: boolean; keoLuc: string | null };
export const vaoCua = (m: HoSoCo): VaoDong => ({ listingId: m.can.id, gia: m.can.listPrice, phi: m.can.feeInclusion, giaChoGui: m.giaChoGui, keoLuc: m.keoLuc });

/** Lần đọc gần nhất: đọc được (`dau` là `null` khi máy chủ không có dấu), hay hỏng ở lần kéo `keoLuc`. */
export type LanDoc = { khoa: string; kq: "co"; dau: DauPhi | null } | { khoa: string; kq: "hong"; keoLuc: string | null };
export type KetQuaDoc = { kq: "co"; dau: DauPhi | null } | { kq: "hong" };

export const khoaGia = (v: Pick<VaoDong, "listingId" | "gia" | "phi">) => `${v.listingId}:${v.gia ?? ""}:${v.phi ?? ""}`;

/** Khoá của lần đọc cần chạy, `null` là không đọc. Lần đọc hỏng được thử lại khi có lần kéo thành công mới. */
export function khoaDoc(v: VaoDong, giu: LanDoc | null): string | null {
  if (v.phi !== "included" || v.gia === null || v.giaChoGui) return null;
  const khoa = khoaGia(v);
  if (giu?.khoa !== khoa) return khoa;
  if (giu.kq === "co" || giu.keoLuc === v.keoLuc) return null;
  return `${khoa}@${v.keoLuc}`;
}

/** Chữ dòng phụ: chỉ khi giá đã lên máy chủ và đã đọc được dấu của đúng giá ấy. */
export function chuDong(v: VaoDong, giu: LanDoc | null): string | null {
  if (v.phi !== "included" || v.giaChoGui || giu?.khoa !== khoaGia(v) || giu.kq !== "co") return null;
  return dongDinhNghia(v.gia, giu.dau);
}

/** Một lần đọc qua hàm gọi API của bộ đồng bộ: mất mạng hay 5xx là hỏng, còn lại là kết quả cuối. */
export async function docDau(goi: Goi, listingId: string): Promise<KetQuaDoc> {
  try {
    const r = await goi("GET", `/api/v1/listings/${encodeURIComponent(listingId)}/fee-basis`);
    if (r.status >= 500) return { kq: "hong" };
    return { kq: "co", dau: r.status === 200 ? (r.body as DauPhi | null) : null };
  } catch {
    return { kq: "hong" };
  }
}

export type BoDocDau = ReturnType<typeof taoBoDocDau>;

/** Giữ lần đọc gần nhất và tối đa một lời đọc đang bay; phản hồi của lời đọc đã bị thay thì bỏ. */
export function taoBoDocDau(doc: (listingId: string) => Promise<KetQuaDoc>) {
  let giu: LanDoc | null = null;
  let dangDoc: { khoa: string } | null = null;
  let keoLuc: string | null = null;
  let phienBan = 0;
  const nghe = new Set<() => void>();
  const bao = () => {
    phienBan++;
    nghe.forEach((f) => f());
  };
  return {
    /** Trạng thái hiện tại của màn: chạy lời đọc khi cần. */
    vao(v: VaoDong) {
      keoLuc = v.keoLuc;
      if (v.giaChoGui && giu) {
        giu = null;
        bao();
      }
      const khoa = khoaDoc(v, giu);
      if (khoa === null) {
        dangDoc = null;
        return;
      }
      if (dangDoc?.khoa === khoa) return;
      const lan = { khoa };
      dangDoc = lan;
      const cua = khoaGia(v);
      void doc(v.listingId).then((kq) => {
        if (dangDoc !== lan) return;
        dangDoc = null;
        giu = kq.kq === "co" ? { khoa: cua, kq: "co", dau: kq.dau } : { khoa: cua, kq: "hong", keoLuc };
        bao();
      });
    },
    chu: (v: VaoDong) => chuDong(v, giu),
    dangKy(f: () => void) {
      nghe.add(f);
      return () => {
        nghe.delete(f);
      };
    },
    phienBan: () => phienBan,
  };
}
