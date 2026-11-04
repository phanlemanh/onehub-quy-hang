/**
 * Hoàn tác một lô đổi trạng thái (hàng 16): mỗi căn một sự kiện bù về nấc cũ, chỉ khi căn chưa có lần sửa sau — cùng
 * luật với hoàn tác trên ô (va-sua-tren-o, Hỏi-1). Đánh dấu đã gọi không có lô hoàn tác: «Còn / giữ giá» không đảo được.
 */
import { DA_HOAN_TAC, xetHoanTac } from "../cell-edit/hoan-tac";
import { moTaLoi, thuLaiDuoc, type GhiFn, type Lenh, type LoiGhi } from "../cell-edit/lenh";

/** Một căn của lô: lệnh bù (null khi chuyển không đảo được), phiên bản căn ngay sau lần ghi, và mã căn để kể khi hỏng. */
export type MucLo = { id: string; lenh: Lenh | null; phienBanSau: number; nhan?: string };
export type BanGhiLo = { muc: MucLo[]; daDung: boolean };

export type KetQuaHoanTacLo = { ok: false; loi: string } | { ok: true; bu: { id: string; lenh: Lenh; coSo: number }[]; suaSau: number; khongDao: number };

/** Quyết lần bấm Hoàn tác của lô: căn nào nhận sự kiện bù, bao nhiêu căn bỏ qua vì đã có lần sửa sau. */
export function xetHoanTacLo(b: Pick<BanGhiLo, "muc" | "daDung">, phienBan: (id: string) => number | undefined): KetQuaHoanTacLo {
  if (b.daDung) return { ok: false, loi: DA_HOAN_TAC };
  const bu: { id: string; lenh: Lenh; coSo: number }[] = [];
  let suaSau = 0;
  let khongDao = 0;
  for (const m of b.muc) {
    if (!m.lenh) khongDao++;
    else if (!xetHoanTac({ daDung: false, phienBanSau: m.phienBanSau }, phienBan(m.id)).ok) suaSau++;
    else bu.push({ id: m.id, lenh: m.lenh, coSo: m.phienBanSau });
  }
  return { ok: true, bu, suaSau, khongDao };
}

/** Dùng bản ghi lô: xét rồi đánh dấu đã dùng — bấm lần hai ra «Đã hoàn tác rồi». */
export function dungLo(b: BanGhiLo, phienBan: (id: string) => number | undefined): KetQuaHoanTacLo {
  const kq = xetHoanTacLo(b, phienBan);
  if (kq.ok) b.daDung = true;
  return kq;
}

export function chuHoanTacLo(kq: Extract<KetQuaHoanTacLo, { ok: true }>, ghiDuoc: number): string {
  const phan = [`Đã hoàn tác ${ghiDuoc} căn`];
  if (kq.suaSau) phan.push(`${kq.suaSau} căn đã có lần sửa sau — bỏ qua`);
  if (kq.khongDao) phan.push(`${kq.khongDao} căn không hoàn tác được`);
  return phan.join(" · ");
}

/** Thông báo liệt tối đa năm mã căn; lô lớn hơn thì căn chưa về vẫn tích trên lưới (va-duong-loi-hoan-tac). */
export const TRAN_MA = 5;

export function lietMa(ds: readonly { nhan: string; ly: string }[]): string {
  const dau = ds.slice(0, TRAN_MA).map((d) => `${d.nhan} (${d.ly})`);
  if (ds.length > TRAN_MA) dau.push(`và ${ds.length - TRAN_MA} căn khác`);
  return dau.join(" · ");
}

export type ThongBaoLo = {
  /** «thanh-cong» khi mọi căn về như trước hàng 88; «trung-tinh» khi có căn chưa về (nếp ghi lô một phần của hàng 16). */
  loai: "thanh-cong" | "trung-tinh" | "loi";
  chu: string;
  moTa?: string;
  /** Bản ghi lô mới chỉ gồm căn hỏng vì kho hay lỗi bất ngờ — nút «Hoàn tác» của thông báo bấm lại đúng các căn ấy. */
  thuLai: BanGhiLo | null;
  /** Căn chưa về, tích lại trên lưới. */
  tichLai: string[];
};

/**
 * Chạy một lần bấm Hoàn tác của lô: mỗi căn một lệnh bù; căn hỏng vì kho trên máy hay lỗi bất ngờ vào bản ghi bấm lại
 * (cùng phiên bản cơ sở — lần ghi hỏng không đổi phiên bản), căn hỏng vì luật của lõi kể vào «không hoàn tác được».
 */
export async function chayHoanTacLo(b: BanGhiLo, phienBan: (id: string) => number | undefined, sua: GhiFn): Promise<ThongBaoLo> {
  const kq = dungLo(b, phienBan);
  if (!kq.ok) return { loai: "loi", chu: kq.loi, thuLai: null, tichLai: [] };
  const nhanCua = new Map(b.muc.map((m) => [m.id, m.nhan ?? m.id]));
  let duoc = 0;
  const hong: { muc: MucLo; loi: LoiGhi }[] = [];
  const khongVe: { muc: MucLo; loi: LoiGhi }[] = [];
  for (const x of kq.bu) {
    const r = await sua(x.id, x.lenh.type, x.lenh.payload, x.coSo);
    if (r.ok) duoc++;
    else (thuLaiDuoc(r.loi) ? hong : khongVe).push({ muc: { id: x.id, lenh: x.lenh, phienBanSau: x.coSo, nhan: nhanCua.get(x.id) }, loi: r.loi });
  }
  if (!hong.length && !khongVe.length) return { loai: "thanh-cong", chu: chuHoanTacLo(kq, duoc), thuLai: null, tichLai: [] };
  const phan = [`Đã hoàn tác ${duoc} căn`];
  if (hong.length) phan.push(`${hong.length} căn chưa hoàn tác được`);
  if (kq.suaSau) phan.push(`${kq.suaSau} căn đã có lần sửa sau — bỏ qua`);
  if (kq.khongDao + khongVe.length) phan.push(`${kq.khongDao + khongVe.length} căn không hoàn tác được`);
  return {
    loai: "trung-tinh",
    chu: phan.join(" · "),
    moTa: lietMa([...hong, ...khongVe].map((h) => ({ nhan: h.muc.nhan ?? h.muc.id, ly: moTaLoi(h.loi) }))),
    thuLai: hong.length ? { muc: hong.map((h) => h.muc), daDung: false } : null,
    tichLai: [...hong, ...khongVe].map((h) => h.muc.id),
  };
}
