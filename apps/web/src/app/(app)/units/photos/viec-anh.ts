// Năm việc sửa, xoá ảnh của mục Ảnh và chữ báo khi không thành (va-anh-ban-that, AC-5). Mọi nút sửa, xoá đi qua lamViec —
// lỗi API hay mất mạng đều báo, rồi tải lại để ảnh về đúng trạng thái máy chủ.
export const VIEC_ANH = {
  bia: "Không đặt ảnh bìa được — thử lại",
  mau: "Không đánh dấu ảnh mẫu được — thử lại",
  ngan: "Không chuyển ngăn được — thử lại",
  thuTu: "Không đổi thứ tự được — thử lại",
  xoa: "Không xoá ảnh được — thử lại",
} as const;
export type ViecAnh = keyof typeof VIEC_ANH;

export async function lamViec(viec: ViecAnh, goi: () => Promise<void>, o: { baoLoi: (chu: string) => void; taiLai: () => void }) {
  try {
    await goi();
  } catch {
    o.baoLoi(VIEC_ANH[viec]);
  } finally {
    o.taiLai();
  }
}
