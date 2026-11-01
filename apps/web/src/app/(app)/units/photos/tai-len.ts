// Nhận ảnh thả hay dán vào mục Ảnh (hàng 18): kiểm tệp và đọc ngày chụp bằng luật lõi, vẽ bản nhẹ bằng canvas. Không giữ
// gì trên máy — tệp lỗi hay lúc mất mạng thì bỏ (Hỏi-5).
import { coBanNhe, docNgayChup, kiemTepAnh, type PhotoType } from "@quy-hang/core/photos";

export type TepSanSang = { ok: true; file: File; type: PhotoType; takenAt: string | null; thumb: Blob; width: number; height: number };
export type TepLoi = { ok: false; file: File; lyDo: string };

/** Ô nhập chữ đang giữ tiêu điểm thì ⌘V là dán chữ, không phải dán ảnh. */
export function dangGoChu(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (el as HTMLElement).isContentEditable === true;
}

/** Tệp ảnh trong một lượt dán — bỏ mục chữ; tiêu điểm ở ô nhập chữ thì không lấy gì. */
export function tepTuLuotDan(items: DataTransferItemList | readonly DataTransferItem[], tieuDiem: Element | null): File[] {
  if (dangGoChu(tieuDiem)) return [];
  const ra: File[] = [];
  for (const it of Array.from(items)) {
    if (it.kind !== "file") continue;
    const f = it.getAsFile();
    if (f) ra.push(f);
  }
  return ra;
}

async function veBanNhe(file: Blob, type: PhotoType): Promise<{ thumb: Blob; width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const { w, h } = coBanNhe(bmp.width, bmp.height);
  const canvas = new OffscreenCanvas(w, h);
  canvas.getContext("2d")?.drawImage(bmp, 0, 0, w, h);
  const thumb = await canvas.convertToBlob({ type: type === "image/png" ? "image/png" : "image/webp", quality: 0.82 });
  return { thumb, width: bmp.width, height: bmp.height };
}

/** Chuẩn bị một tệp: luật lõi quyết nhận hay không; nhận thì đọc ngày chụp và vẽ bản nhẹ. */
export async function chuanBiTep(file: File, ve = veBanNhe): Promise<TepSanSang | TepLoi> {
  const dau = new Uint8Array(await file.slice(0, 128 * 1024).arrayBuffer());
  const kq = kiemTepAnh(dau, file.size);
  if (!kq.ok) return { ok: false, file, lyDo: kq.lyDo };
  try {
    const { thumb, width, height } = await ve(file, kq.type);
    return { ok: true, file, type: kq.type, takenAt: docNgayChup(dau), thumb, width, height };
  } catch {
    return { ok: false, file, lyDo: "Không phải ảnh" };
  }
}
