import { cotChuaGhep, dungGoiDeXuat, gopDeXuat, type DeXuatCot, type GoiDeXuat, type LoiDeXuat } from "@quy-hang/core/import";
import { apLai, coTheTiepGhep, type Ong } from "./duong-ong";

/**
 * «Xử lý bằng AI» ở màn Nhập Excel (hàng 68, AC-7, AC-8, AC-10): sau khi máy ghép như cũ (mẫu → từ điển → bộ dò), các cột
 * còn chưa ghép được gửi — dưới dạng gói đã che của lõi — tới đường đề xuất; đề xuất về được gộp bằng lõi và giữ «chờ
 * duyệt» tới khi người đồng ý hay đổi đích. Không còn cột chưa ghép thì không gọi. Mọi ca không dùng được AI: kế hoạch nền
 * giữ nguyên, một dòng báo nói lý do. Hàm thuần — màn chỉ giữ trạng thái và vẽ.
 */
export type KetQuaGoiDeXuat = { cheDo: "ai"; deXuat: DeXuatCot[]; loi: LoiDeXuat[] } | { cheDo: "tat-dinh"; lyDo: string };
export type TrangThaiAi = { bat: boolean; tamNgung: boolean; sanSang: boolean; conTran: boolean; tranThangUsd: number; daDungUsd: number | null; laQuanTri: boolean };
export type HoiDeXuat = (goi: GoiDeXuat) => Promise<KetQuaGoiDeXuat | { loi: string }>;

/** `phien` tăng mỗi lần chọn tệp: kết quả về muộn của tệp cũ bị bỏ, không gộp vào tệp mới. */
export type TrangThaiDeXuat = { phien: number; dangHoi: boolean; choDuyet: number[]; daDongY: number[]; baoTatDinh: string | null };
export const ttDau = (phien: number): TrangThaiDeXuat => ({ phien, dangHoi: false, choDuyet: [], daDongY: [], baoTatDinh: null });

export const CHO_DE_XUAT = "Máy đang đề xuất cách ghép…";
export const cauTatDinh = (lyDo: string) => `Chưa dùng được AI: ${lyDo} — ghép tay các cột còn lại`;
export const cauChoDuyet = (n: number) => `Còn ${n} cột máy đề xuất chưa duyệt`;
const LOI_MANG = "không gửi được tới máy chủ";

/** Trạng thái AI màn đọc được: `"loi"` khi không đọc được (máy chủ hay mạng), không phải «tắt». */
export type AiMan = TrangThaiAi | "loi";
export const KHONG_DOC_TRANG_THAI = "không đọc được trạng thái AI";

const conChuaGhep = (ong: Ong) => cotChuaGhep(dungGoiDeXuat(ong.profile, ong.plan)).length > 0;

/** Có nên hỏi máy không: sàn đã bật, còn trần, máy chủ sẵn sàng, và file còn cột chưa ghép. */
export function canHoi(ong: Ong, ai: AiMan | null): boolean {
  if (!ai || ai === "loi" || !ai.bat || !ai.sanSang || !ai.conTran) return false;
  return conChuaGhep(ong);
}

/**
 * Sàn đã bật AI (hay không đọc được trạng thái) mà máy không hỏi được — một dòng lý do cho màn, như khi máy chủ trả tất
 * định. Sàn chưa bật hay đang tạm ngừng, hay tệp không còn cột chưa ghép → `null`: màn như hàng 65, không dòng nào.
 */
export function lyDoKhongHoi(ong: Ong, ai: AiMan | null): string | null {
  if (!ai || !conChuaGhep(ong)) return null;
  if (ai === "loi") return cauTatDinh(KHONG_DOC_TRANG_THAI);
  if (!ai.bat) return null;
  if (!ai.sanSang) return cauTatDinh("AI chưa sẵn sàng trên máy chủ");
  if (!ai.conTran) return cauTatDinh("Hết trần AI tháng này");
  return null;
}

/**
 * Hỏi đường đề xuất cho đúng gói của `ong`, gộp kết quả. Không cột chưa ghép → không gọi. Không ném: lỗi bất kỳ trên đường
 * (thân trả lời hỏng, mạng đứt giữa chừng, gộp lỗi) thành dải tất định, kế hoạch nền giữ nguyên — dải chờ không kẹt.
 */
export async function hoiDeXuat(ong: Ong, hoi: HoiDeXuat, phien: number): Promise<{ ong: Ong; tt: TrangThaiDeXuat }> {
  const goi = dungGoiDeXuat(ong.profile, ong.plan);
  if (cotChuaGhep(goi).length === 0) return { ong, tt: ttDau(phien) };
  const tatDinh = (lyDo: string) => ({ ong, tt: { ...ttDau(phien), baoTatDinh: cauTatDinh(lyDo) } });
  try {
    const kq = await hoi(goi);
    if (!kq || typeof kq !== "object" || !("cheDo" in kq)) return tatDinh(LOI_MANG);
    if (kq.cheDo === "tat-dinh") return tatDinh(kq.lyDo);
    const plan = gopDeXuat(ong.table, ong.plan, { deXuat: kq.deXuat, loi: kq.loi });
    return { ong: apLai(ong.table, ong.lop, ong.profile, plan, ong.ctx), tt: { ...ttDau(phien), choDuyet: kq.deXuat.map((d) => d.cot) } };
  } catch {
    return tatDinh(LOI_MANG);
  }
}

/** Kết quả về muộn của tệp đã bỏ. */
export const laKetQuaCu = (phienHienTai: number, tt: TrangThaiDeXuat) => tt.phien !== phienHienTai;

export const dongY = (tt: TrangThaiDeXuat, cot: number): TrangThaiDeXuat =>
  tt.choDuyet.includes(cot) ? { ...tt, choDuyet: tt.choDuyet.filter((c) => c !== cot), daDongY: [...tt.daDongY, cot] } : tt;
export const dongYHet = (tt: TrangThaiDeXuat): TrangThaiDeXuat => ({ ...tt, choDuyet: [], daDongY: [...tt.daDongY, ...tt.choDuyet] });
/** Người đổi đích một cột máy đề xuất: cột ấy thành người chọn, ra khỏi hàng chờ. */
export const khiDoiDich = (tt: TrangThaiDeXuat, cot: number): TrangThaiDeXuat => ({
  ...tt,
  choDuyet: tt.choDuyet.filter((c) => c !== cot),
  daDongY: tt.daDongY.filter((c) => c !== cot),
});

/** Bước ghép cho Tiếp khi không đang hỏi máy, không còn đề xuất chờ duyệt và kế hoạch không lỗi. */
export function coTheTiepGhepAi(ong: Ong, tt: TrangThaiDeXuat): { ok: boolean; thongDiep: string | null } {
  if (tt.dangHoi) return { ok: false, thongDiep: CHO_DE_XUAT };
  if (tt.choDuyet.length) return { ok: false, thongDiep: cauChoDuyet(tt.choDuyet.length) };
  return { ok: coTheTiepGhep(ong), thongDiep: null };
}

/** Sang Xem trước: chỉ gọi `xemThu` khi được Tiếp — không có đường đi tắt từ đề xuất chưa duyệt sang ghi. */
export async function sangXemTruoc<T>(ong: Ong, tt: TrangThaiDeXuat, xemThu: () => Promise<T>): Promise<T | null> {
  return coTheTiepGhepAi(ong, tt).ok ? xemThu() : null;
}
