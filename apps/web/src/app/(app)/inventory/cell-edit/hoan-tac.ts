/**
 * Hoàn tác một lần sửa trên ô (hàng 15, luật 8): MỘT sự kiện mới đưa về giá trị trước — không xoá sự kiện cũ. Giới hạn bởi
 * bảng chuyển ADR-0008: chuyển mà chiều ngược không có trong bảng (nấc cuối, rời «Chưa đủ để rao») không hoàn tác được;
 * lần đặt giá đầu cũng không (lõi không nhận «chưa có giá»). Trình sửa dùng cùng hàm để báo trước «Không hoàn tác được».
 */
import { TRANSITIONS } from "@quy-hang/core/listing";
import { moTaLoi, type GhiFn, type HangSua, type Lenh } from "./lenh";

export type Truoc = Pick<HangSua, "listPrice" | "feeInclusion" | "standardStatus" | "statusLabel">;

export const KHONG_HOAN_TAC = "Không hoàn tác được";

/** Lệnh đưa hàng về trạng thái trước lần sửa; null khi lần sửa không hoàn tác được. */
export function lenhHoanTac(truoc: Truoc, lenh: Lenh): Lenh | null {
  if (lenh.type === "price_changed") {
    if (truoc.listPrice === null || (truoc.feeInclusion !== "included" && truoc.feeInclusion !== "excluded")) return null;
    return { type: "price_changed", payload: { listPrice: truoc.listPrice, feeInclusion: truoc.feeInclusion } };
  }
  // Nhãn riêng căn mang trước lần sửa (hàng 46) đi theo lệnh ngược; nhãn đã bị gỡ thì máy chủ từ chối và báo như lỗi khác.
  const nhan = truoc.statusLabel ?? null;
  if (lenh.payload.to === truoc.standardStatus) return { type: "status_changed", payload: { to: truoc.standardStatus, label: nhan } };
  return TRANSITIONS[lenh.payload.to].includes(truoc.standardStatus)
    ? { type: "status_changed", payload: { to: truoc.standardStatus, ...(nhan !== null && { label: nhan }) } }
    : null;
}

export function hoanTacDuoc(truoc: Truoc, lenh: Lenh): boolean {
  return lenhHoanTac(truoc, lenh) !== null;
}

/**
 * Bản ghi hoàn tác của một lần sửa thành công (va-sua-tren-o): thông báo giữ đúng bản ghi của nó, Ctrl/Cmd+Z giữ bản ghi
 * của lần sửa thành công gần nhất. `phienBanSau` là phiên bản căn ngay sau lần ghi — căn đã đổi phiên bản thì có lần sửa
 * sau (của mình hay người khác kéo về máy), hoàn tác không ghi đè lên nó.
 */
export type BanGhiHoanTac = { id: string; nhan: string; lenh: Lenh; phienBanSau: number; daDung: boolean };

export const DA_SUA_SAU = `${KHONG_HOAN_TAC}: căn đã có lần sửa sau`;
export const DA_HOAN_TAC = "Đã hoàn tác rồi";

export type KetQuaXet = { ok: true } | { ok: false; loi: string };

/** Quyết một lần bấm hoàn tác: đã dùng → «Đã hoàn tác rồi»; phiên bản trên máy khác phiên bản sau lần ghi → từ chối. */
export function xetHoanTac(banGhi: Pick<BanGhiHoanTac, "daDung" | "phienBanSau">, phienBanHienTai: number | undefined): KetQuaXet {
  if (banGhi.daDung) return { ok: false, loi: DA_HOAN_TAC };
  if (phienBanHienTai !== banGhi.phienBanSau) return { ok: false, loi: DA_SUA_SAU };
  return { ok: true };
}

export type KetQuaDung = { ok: true; banGhi: BanGhiHoanTac } | { ok: false; loi: string };

/**
 * Bộ giữ bản ghi — thuần, không React. Chỉ lần sửa của người gọi `ghi`; lệnh bù không tạo bản ghi. Dùng xong (nút hay phím)
 * thì bản ghi đánh dấu đã dùng và rời Ctrl+Z. `phienBan` đọc phiên bản trên máy của căn lúc bấm.
 */
export function taoSoHoanTac() {
  let ganNhat: BanGhiHoanTac | null = null;
  const dung = (b: BanGhiHoanTac, phienBan: (id: string) => number | undefined): KetQuaDung => {
    const kq = xetHoanTac(b, phienBan(b.id));
    if (!kq.ok) return kq;
    b.daDung = true;
    if (ganNhat === b) ganNhat = null;
    return { ok: true, banGhi: b };
  };
  return {
    /** Lần sửa thành công: bản ghi mới, hoặc null khi lần sửa không hoàn tác được (Ctrl+Z thôi trỏ lần trước). */
    ghi(b: Omit<BanGhiHoanTac, "daDung"> | null): BanGhiHoanTac | null {
      ganNhat = b ? { ...b, daDung: false } : null;
      return ganNhat;
    },
    /** Nút «Hoàn tác» trên thông báo: đúng bản ghi của thông báo ấy. */
    dungNut: dung,
    /**
     * Lệnh bù của bản ghi không ghi được: bản ghi thôi «đã dùng» để bấm lại (va-duong-loi-hoan-tac). Ctrl/Cmd+Z lại trỏ nó,
     * trừ khi đã có lần sửa thành công mới hơn — phím luôn trỏ lần sửa gần nhất.
     */
    traLai(b: BanGhiHoanTac) {
      b.daDung = false;
      ganNhat ??= b;
    },
    /** Ctrl/Cmd+Z: bản ghi gần nhất; null khi không còn gì để hoàn tác (phím không làm gì). */
    dungPhim(phienBan: (id: string) => number | undefined): KetQuaDung | null {
      return ganNhat ? dung(ganNhat, phienBan) : null;
    },
  };
}

export type SoHoanTac = ReturnType<typeof taoSoHoanTac>;

export type ThongBaoHoanTac = { loai: "thanh-cong"; chu: string } | { loai: "loi"; chu: string; thuLai: BanGhiHoanTac | null };

/**
 * Chạy một lần bấm hoàn tác trên ô: bộ giữ đã từ chối thì báo lý do; lệnh bù ghi được thì «Đã hoàn tác …»; hỏng thì trả
 * bản ghi lại cho bộ giữ và đưa bản ghi ra để thông báo lỗi mang nút «Hoàn tác» bấm lại đúng lần sửa ấy. Lệnh bù mang
 * phiên bản vừa xét: một lần kéo về chen giữa thì thành xung đột, không ghi đè lặng lần sửa sau.
 */
export async function chayHoanTac(so: Pick<SoHoanTac, "traLai">, kq: KetQuaDung, sua: GhiFn): Promise<ThongBaoHoanTac> {
  if (!kq.ok) return { loai: "loi", chu: kq.loi, thuLai: null };
  const g = kq.banGhi;
  const ketQua = await sua(g.id, g.lenh.type, g.lenh.payload, g.phienBanSau);
  if (ketQua.ok) return { loai: "thanh-cong", chu: `Đã hoàn tác ${g.nhan}` };
  so.traLai(g);
  return { loai: "loi", chu: `${KHONG_HOAN_TAC}: ${moTaLoi(ketQua.loi)} — ${g.nhan}`, thuLai: g };
}
