// Đăng xuất trên máy này (hàng 13 AC-10, hàng 38 AC-4) — một đường cho menu tài khoản và tab Tôi. Xoá kho TRƯỚC khi gọi
// máy chủ: mạng hỏng giữa chừng thì kho đã xoá, phiên hết hạn sau là được; ngược lại thì kho còn trên máy đã «đăng xuất».
export type DangXuatDeps = {
  /** Bộ đồng bộ: hỏi khi còn thay đổi chưa gửi, rồi xoá kho của người. `false` khi người ở lại. */
  dangXuat: () => Promise<boolean>;
  /** Thân yêu cầu đăng xuất (mang pushEndpoint của máy để máy chủ gỡ đăng ký). */
  than: () => Promise<string>;
  goi: typeof fetch;
  /** Về màn đăng nhập. */
  ve: () => void;
};

/** Trả `false` khi người chọn ở lại. Lỗi mạng khi gọi máy chủ không giữ người lại: kho đã xoá, vẫn về màn đăng nhập. */
export async function dangXuatTrenMay(d: DangXuatDeps): Promise<boolean> {
  if (!(await d.dangXuat())) return false;
  await d
    .goi("/api/v1/auth/sign-out", { method: "POST", headers: { "content-type": "application/json" }, body: await d.than() })
    .catch(() => undefined);
  d.ve();
  return true;
}
