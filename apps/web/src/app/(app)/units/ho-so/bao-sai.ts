/**
 * «Báo sai thông tin căn» (hàng 17, Hỏi-1): soạn lời báo từ thuộc tính căn đang hiện rồi để người gửi qua bảng chia sẻ của
 * thiết bị — không lời gọi mạng nào, không gì của chủ nhà (bất biến 2, 3). Nhận báo trên máy chủ là một hàng sau.
 */

export type BaoSai = { ma: string; toa: string; khu: string; truong: string; dangHien: string; dung: string; ghiChu: string };

export const TRAN_DUNG = 200;
export const TRAN_GHI_CHU = 500;

/** Giá trị đúng bắt buộc, 1–200 ký tự; ghi chú tối đa 500. */
export function coGui(b: Pick<BaoSai, "dung" | "ghiChu">): boolean {
  const d = b.dung.trim();
  return d.length > 0 && d.length <= TRAN_DUNG && b.ghiChu.length <= TRAN_GHI_CHU;
}

/** Lời báo dựng chỉ từ thuộc tính căn của danh mục và chữ người gõ. */
export function noiDungBaoSai(b: BaoSai): string {
  const dong = [
    `Báo sai thông tin căn ${b.ma}`,
    `Toà: ${b.toa}`,
    `Khu: ${b.khu}`,
    `Thuộc tính: ${b.truong}`,
    `Đang hiện: ${b.dangHien}`,
    `Đúng là: ${b.dung.trim()}`,
  ];
  if (b.ghiChu.trim()) dong.push(`Ghi chú: ${b.ghiChu.trim()}`);
  return dong.join("\n");
}

export type ThietBi = {
  share?: (d: { title?: string; text: string }) => Promise<void>;
  clipboard?: { writeText(t: string): Promise<void> };
};

/**
 * Mở bảng chia sẻ của thiết bị; không có thì chép vào bộ nhớ tạm. Gọi ngay trong lượt bấm của người (chia sẻ cần cử chỉ
 * của người — không chờ gì trước lời gọi đầu). Người huỷ bảng chia sẻ thì trả «huy».
 */
export async function chiaSe(text: string, tb: ThietBi): Promise<"chia-se" | "da-chep" | "huy" | "loi"> {
  if (tb.share) {
    try {
      await tb.share({ title: text.split("\n")[0], text });
      return "chia-se";
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return "huy";
      // Thiết bị từ chối chia sẻ: chép thay.
    }
  }
  if (!tb.clipboard) return "loi";
  try {
    await tb.clipboard.writeText(text);
    return "da-chep";
  } catch {
    return "loi";
  }
}
