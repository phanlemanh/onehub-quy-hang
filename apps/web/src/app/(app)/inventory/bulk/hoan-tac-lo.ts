/**
 * Hoàn tác một lô đổi trạng thái (hàng 16): mỗi căn một sự kiện bù về nấc cũ, chỉ khi căn chưa có lần sửa sau — cùng
 * luật với hoàn tác trên ô (va-sua-tren-o, Hỏi-1). Đánh dấu đã gọi không có lô hoàn tác: «Còn / giữ giá» không đảo được.
 */
import { DA_HOAN_TAC, xetHoanTac } from "../cell-edit/hoan-tac";
import type { Lenh } from "../cell-edit/lenh";

/** Một căn của lô: lệnh bù (null khi chuyển không đảo được) và phiên bản căn ngay sau lần ghi. */
export type MucLo = { id: string; lenh: Lenh | null; phienBanSau: number };
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
