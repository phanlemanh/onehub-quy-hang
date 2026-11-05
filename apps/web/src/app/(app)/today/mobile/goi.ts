/**
 * Hôm nay của đầu chủ trên điện thoại (hàng 39): phần thuần — rẽ khổ, bảng nút của thẻ, bộ kết quả của ngăn «Kết quả cuộc
 * gọi», chạy gọi một chạm, nhớ ngăn trên máy. Thẻ và bài kiểm cùng đọc các hàm này.
 */
import { telHref, type KetQuaMoSo } from "../mo-so";
import { viecCuaDong, type MaViec, type ViecDong } from "../viec-dong";

/** Dưới mốc này là điện thoại: thẻ thay lưới (cùng mốc `md` của vỏ và `useIsMobile`). */
export const MOC_DIEN_THOAI = 768;
export const laDienThoai = (rong: number) => rong < MOC_DIEN_THOAI;

/** Việc của thẻ: việc của máy tính, «Mở số» của lead thay bằng «Gọi» (mở số rồi gọi trong một chạm). */
export type MaViecDT = Exclude<MaViec, "mo-so"> | "goi";
export const NHAN_GOI = "Gọi";

/** Nhóm căn mà việc là gọi chủ nhà (bộ nhóm mặc định, Tham chiếu §10). */
const NHOM_CAN_GOI: ReadonlySet<string> = new Set(["price_adjustment", "call_back"]);

/**
 * Dòng mà việc là gọi (câu giao hàng 39, giám sát trả H-23): lead đã nhận chưa gọi lần đầu, căn ở nhóm nên gọi điều chỉnh
 * giá hay cần gọi lại. Lead còn chờ nhận thì việc đầu vẫn là «Nhận».
 */
export function laViecGoi(v: ViecDong): boolean {
  if (v.kind === "lead") return v.stage !== "sent" && (v.nhom.actions as readonly string[]).includes("first_call");
  return NHOM_CAN_GOI.has(v.nhom.code);
}

/**
 * Nút mép phải và việc trong ⋯ của thẻ. `coSo`: dòng có số gọi được (lead của mình; căn mình giữ). Dòng mà việc là gọi và có
 * số → «Gọi» làm nút; việc máy tính đứng đầu vào ⋯. Dòng khác giữ đúng nút máy tính, «Gọi» (khi có số) đứng đầu ⋯.
 */
export function nutDienThoai(v: ViecDong, coSo: boolean): { chinh: MaViecDT | null; phu: MaViecDT[] } {
  const ds: MaViecDT[] = viecCuaDong(v).filter((m): m is Exclude<MaViec, "mo-so"> => m !== "mo-so");
  if (!coSo) {
    const [chinh = null, ...phu] = ds;
    return { chinh, phu };
  }
  if (laViecGoi(v)) return { chinh: "goi", phu: ds };
  const [chinh = null, ...phu] = ds;
  return { chinh, phu: ["goi", ...phu] };
}

/** Lựa chọn của ngăn «Kết quả cuộc gọi»: việc một chạm của nhóm (như máy tính), mở hồ sơ, và «Không nghe máy». */
export type MucKetQua = "da-goi" | "tra-lai" | "con-giu-gia" | "doi-gia-trang-thai" | "khong-nghe";
export const NHAN_KET_QUA: Readonly<Record<MucKetQua, string>> = {
  "da-goi": "Đã gọi",
  "tra-lai": "Trả lại",
  "con-giu-gia": "Còn · giữ giá",
  "doi-gia-trang-thai": "Đổi giá, trạng thái · Mở hồ sơ",
  "khong-nghe": "Không nghe máy",
};

export function ketQuaCua(v: ViecDong): MucKetQua[] {
  const co = (a: string) => (v.nhom.actions as readonly string[]).includes(a);
  const ds: MucKetQua[] = [];
  if (v.kind === "lead") {
    if (co("first_call")) ds.push("da-goi");
    if (co("return")) ds.push("tra-lai");
  } else {
    if (co("owner_confirmed")) ds.push("con-giu-gia");
    if (co("open_record")) ds.push("doi-gia-trang-thai");
  }
  ds.push("khong-nghe");
  return ds;
}

/**
 * Gọi một chạm: số đã mở của dòng thì dùng lại (như máy tính — mỗi dòng mở số một lần trong phiên trang); chưa có thì gọi
 * máy chủ mở số. Có số → mở `tel:`, rồi mở ngăn kết quả (Hỏi-1: ngăn mở cùng lần chạm). Mở số lỗi → không gọi, trả lỗi.
 */
export async function chayGoi(d: {
  soCu: string | null;
  moSo: () => Promise<KetQuaMoSo>;
  daMo: (so: string) => void;
  moTel: (href: string) => void;
  moNgan: () => void;
}): Promise<{ ok: true; so: string } | { ok: false; loi: string }> {
  let so = d.soCu;
  if (!so) {
    const kq = await d.moSo();
    if (!kq.ok) return kq;
    so = kq.so;
    d.daMo(so);
  }
  d.moTel(telHref(so));
  d.moNgan();
  return { ok: true, so };
}

/** Khoá nhớ ngăn đang mở trên máy (theo phiên trình duyệt), để quay lại app sau cuộc gọi — kể cả trang tải lại — vẫn còn. */
export const KHOA_NGAN = "quy-hang:hom-nay:ngan-ket-qua";
type Kho = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function ghiNganMo(kho: Kho | null, id: string): void {
  try {
    kho?.setItem(KHOA_NGAN, id);
  } catch {
    // Không ghi được (chế độ riêng tư): ngăn vẫn mở trong lần này.
  }
}
export function docNganMo(kho: Kho | null): string | null {
  try {
    return kho?.getItem(KHOA_NGAN) ?? null;
  } catch {
    return null;
  }
}
export function xoaNganMo(kho: Kho | null): void {
  try {
    kho?.removeItem(KHOA_NGAN);
  } catch {
    // bỏ qua
  }
}
