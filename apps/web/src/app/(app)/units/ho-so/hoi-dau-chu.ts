/**
 * Nút «Hỏi đầu chủ» của hồ sơ căn (hàng 33, Cổng Phạm vi 04/11: Hỏi-1 bảng chia sẻ của máy, Hỏi-2 nhãn). Người luôn là
 * người bấm gửi (bất biến 3): nút chỉ mở bảng chia sẻ hay chép tin, không gọi mạng khi chạm. Thuần, trừ `docTenDauChu`.
 */
export const NHAN_HOI = "Hỏi đầu chủ";
export const CHU_CHUA_GIU = "Căn chưa có đầu chủ giữ";
export const CHU_DA_CHEP = "Đã chép tin hỏi";

export type Tin = { text: string; url: string };
export type MayChiaSe = {
  share?: (d: { title?: string; text?: string; url?: string }) => Promise<void>;
  canShare?: (d: { text?: string; url?: string }) => boolean;
  clipboard?: { writeText(t: string): Promise<void> };
};
export type CachMo = "chia-se" | "chep" | "khong";

/** Máy mở được bảng chia sẻ thì chia sẻ; không thì chép; không cả hai thì không có cách nào. */
export function cachMo(may: MayChiaSe): CachMo {
  if (may.share && (!may.canShare || may.canShare({ text: "", url: "https://x.test/" }))) return "chia-se";
  if (may.clipboard) return "chep";
  return "khong";
}

/** «Hỏi đầu chủ · <tên>»; chưa tải được tên (mất mạng) thì nhãn trần — nút vẫn hỏi được. */
export function nhanNutHoi(ten: string | null): string {
  return ten ? `${NHAN_HOI} · ${ten}` : NHAN_HOI;
}

/** Nút của căn chưa ai giữ: tắt, mang chữ báo. */
export function nutHoi(dauChu: string | null, ten: string | null): { tat: boolean; chu: string } {
  return dauChu === null ? { tat: true, chu: CHU_CHUA_GIU } : { tat: false, chu: nhanNutHoi(ten) };
}

/** Gọi ngay trong lượt chạm của người. Người huỷ bảng chia sẻ thì «huy» — không báo gì. */
export async function moHoi(tin: Tin, may: MayChiaSe): Promise<"chia-se" | "da-chep" | "huy" | "loi"> {
  const cach = cachMo(may);
  if (cach === "chia-se") {
    try {
      await may.share!({ title: tin.text, text: tin.text, url: tin.url });
      return "chia-se";
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return "huy";
      // Máy từ chối chia sẻ: chép thay.
    }
  }
  if (!may.clipboard) return "loi";
  try {
    await may.clipboard.writeText(`${tin.text}\n${tin.url}`);
    return "da-chep";
  } catch {
    return "loi";
  }
}

/** Tên người dùng của đầu chủ giữ căn, đọc lúc mở hồ sơ (không phải lúc chạm). Lỗi hay mất mạng → `null`. */
export async function docTenDauChu(listingId: string): Promise<string | null> {
  try {
    const r = await fetch(`/api/v1/listings/${listingId}/owner`, { credentials: "same-origin" });
    if (!r.ok) return null;
    const b = (await r.json()) as { visible?: boolean; listingAgentName?: string | null };
    return b.visible === false ? (b.listingAgentName ?? null) : null;
  } catch {
    return null;
  }
}
