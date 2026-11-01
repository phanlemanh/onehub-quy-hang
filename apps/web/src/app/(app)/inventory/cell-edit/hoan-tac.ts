/**
 * Hoàn tác một lần sửa trên ô (hàng 15, luật 8): MỘT sự kiện mới đưa về giá trị trước — không xoá sự kiện cũ. Giới hạn bởi
 * bảng chuyển ADR-0008: chuyển mà chiều ngược không có trong bảng (nấc cuối, rời «Chưa đủ để rao») không hoàn tác được;
 * lần đặt giá đầu cũng không (lõi không nhận «chưa có giá»). Trình sửa dùng cùng hàm để báo trước «Không hoàn tác được».
 */
import { TRANSITIONS } from "@quy-hang/core/listing";
import type { HangSua, Lenh } from "./lenh";

export type Truoc = Pick<HangSua, "listPrice" | "feeInclusion" | "standardStatus">;

export const KHONG_HOAN_TAC = "Không hoàn tác được";

/** Lệnh đưa hàng về trạng thái trước lần sửa; null khi lần sửa không hoàn tác được. */
export function lenhHoanTac(truoc: Truoc, lenh: Lenh): Lenh | null {
  if (lenh.type === "price_changed") {
    if (truoc.listPrice === null || (truoc.feeInclusion !== "included" && truoc.feeInclusion !== "excluded")) return null;
    return { type: "price_changed", payload: { listPrice: truoc.listPrice, feeInclusion: truoc.feeInclusion } };
  }
  return TRANSITIONS[lenh.payload.to].includes(truoc.standardStatus) ? { type: "status_changed", payload: { to: truoc.standardStatus } } : null;
}

export function hoanTacDuoc(truoc: Truoc, lenh: Lenh): boolean {
  return lenhHoanTac(truoc, lenh) !== null;
}
