/**
 * Tệp của bản xuất (hàng 43, Hỏi-3): Excel qua `ghiXlsx` của lõi; Ảnh là bảng vẽ lên canvas của trình duyệt → PNG; PDF
 * là các trang ảnh JPEG (25 căn mỗi trang) gói bằng `ghiPdf` của lõi — không thêm thư viện. Bộ vẽ chỉ nhận nhãn cột và chữ
 * ô của `BanXuat` (đã qua luật ẩn); `chuDeVe` trả đúng danh sách chữ ấy để bài kiểm rò rỉ quét.
 *
 * Màu vẽ là màu của tệp (nền trắng, chữ đen để in và gửi Zalo), không phải màu của giao diện — tên màu CSS, không theo theme.
 */
import { chiaTheoTrang, ghiPdf, ghiXlsx, type BanXuat, type TrangJpeg } from "@quy-hang/core/export";

export type BangVe = Pick<BanXuat, "cot" | "dong">;

/** Mọi chữ bộ vẽ đưa lên ảnh hay PDF: nhãn cột rồi chữ từng ô, theo thứ tự vẽ. */
export function chuDeVe(ban: BangVe): string[] {
  return [...ban.cot, ...ban.dong.flat()];
}

const PHONG = "14px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const PHONG_DAU = `600 ${PHONG}`;
const DEM_NGANG = 12;
const CAO_DONG = 30;
const TY_LE = 2;

function veBang(bang: BangVe): HTMLCanvasElement {
  const chu = chuDeVe(bang);
  const soCot = bang.cot.length;
  const doRong = document.createElement("canvas").getContext("2d");
  if (!doRong) throw new Error("Trình duyệt không vẽ được ảnh");
  const rongCot = Array.from({ length: soCot }, () => 0);
  // Đo theo đúng danh sách chữ sẽ vẽ: nhãn cột (đậm) rồi chữ ô.
  chu.forEach((s, i) => {
    const c = i % soCot;
    doRong.font = i < soCot ? PHONG_DAU : PHONG;
    rongCot[c] = Math.max(rongCot[c] ?? 0, Math.ceil(doRong.measureText(s).width) + DEM_NGANG * 2);
  });
  const rong = Math.max(1, rongCot.reduce((a, b) => a + b, 0));
  const soDong = 1 + bang.dong.length;
  const cao = soDong * CAO_DONG;

  const canvas = document.createElement("canvas");
  canvas.width = rong * TY_LE;
  canvas.height = cao * TY_LE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không vẽ được ảnh");
  ctx.scale(TY_LE, TY_LE);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, rong, cao);
  ctx.fillStyle = "whitesmoke";
  ctx.fillRect(0, 0, rong, CAO_DONG);
  ctx.textBaseline = "middle";
  chu.forEach((s, i) => {
    const r = Math.floor(i / soCot);
    const c = i % soCot;
    const x = rongCot.slice(0, c).reduce((a, b) => a + b, 0) + DEM_NGANG;
    ctx.font = r === 0 ? PHONG_DAU : PHONG;
    ctx.fillStyle = "black";
    ctx.fillText(s, x, r * CAO_DONG + CAO_DONG / 2);
  });
  ctx.strokeStyle = "gainsboro";
  ctx.lineWidth = 1;
  for (let r = 1; r < soDong; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CAO_DONG + 0.5);
    ctx.lineTo(rong, r * CAO_DONG + 0.5);
    ctx.stroke();
  }
  return canvas;
}

function thanhBlob(canvas: HTMLCanvasElement, kieu: string, chat?: number): Promise<Blob> {
  return new Promise((ok, hong) =>
    canvas.toBlob((b) => (b ? ok(b) : hong(new Error("Trình duyệt không dựng được ảnh"))), kieu, chat),
  );
}

/** Ảnh PNG của bảng. */
export function veAnh(bang: BangVe): Promise<Blob> {
  return thanhBlob(veBang(bang), "image/png");
}

/** PDF: mỗi trang 25 căn, mỗi trang một ảnh JPEG; nhãn cột lặp ở đầu mỗi trang. */
export async function vePdf(bang: BangVe): Promise<Uint8Array> {
  const trang: TrangJpeg[] = [];
  for (const dong of chiaTheoTrang(bang.dong)) {
    const canvas = veBang({ cot: bang.cot, dong });
    const jpeg = await thanhBlob(canvas, "image/jpeg", 0.92);
    trang.push({ bytes: new Uint8Array(await jpeg.arrayBuffer()), rong: canvas.width, cao: canvas.height });
  }
  return ghiPdf(trang);
}

const KIEU_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Tệp của mẫu Excel, Ảnh, PDF. */
export async function dungTep(ban: BanXuat): Promise<Blob> {
  if (ban.mau === "xlsx") return new Blob([ghiXlsx(ban) as Uint8Array<ArrayBuffer>], { type: KIEU_XLSX });
  if (ban.mau === "png") return veAnh(ban);
  if (ban.mau === "pdf") return new Blob([(await vePdf(ban)) as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
  throw new Error(`mẫu ${ban.mau} không phải tệp`);
}
