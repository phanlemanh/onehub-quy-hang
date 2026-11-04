// Đăng xuất trên máy này (hàng 13 AC-10, hàng 38 AC-4) — một đường cho menu tài khoản, tab Tôi và màn chọn sàn. Xoá kho
// TRƯỚC khi gọi máy chủ: mạng hỏng giữa chừng thì kho đã xoá; ngược lại thì kho còn trên máy đã «đăng xuất».
// Luật 55 (dang-nhap-mat-khau): máy chủ lỗi hay mất mạng thì KHÔNG về màn đăng nhập — phiên trên máy chủ còn sống, người
// thấy «Chưa đăng xuất được» và thử lại.
export type KetCucDangXuat = "xong" | "o-lai" | "loi";

export const CHUA_DANG_XUAT = "Chưa đăng xuất được";

export type DangXuatDeps = {
  /** Bộ đồng bộ: hỏi khi còn thay đổi chưa gửi, rồi xoá kho của người. `false` khi người ở lại. */
  dangXuat: () => Promise<boolean>;
  /** Thân yêu cầu đăng xuất (mang pushEndpoint của máy để máy chủ gỡ đăng ký). */
  than: () => Promise<string>;
  goi: typeof fetch;
  /** Về màn đăng nhập. */
  ve: () => void;
  /** Lần thử lại sau «loi»: kho đã xoá ở lần trước, không hỏi lại. */
  daXoa?: boolean;
};

/** «o-lai» khi người chọn ở lại; «loi» khi máy chủ trả lỗi hay không tới được — không về; «xong» thì đã về đăng nhập. */
export async function dangXuatTrenMay(d: DangXuatDeps): Promise<KetCucDangXuat> {
  if (!d.daXoa && !(await d.dangXuat())) return "o-lai";
  try {
    const res = await d.goi("/api/v1/auth/sign-out", { method: "POST", headers: { "content-type": "application/json" }, body: await d.than() });
    if (!res.ok) return "loi";
  } catch {
    return "loi";
  }
  d.ve();
  return "xong";
}
