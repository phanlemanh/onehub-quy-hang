/**
 * So giá căn đang gọi với toà (hàng 28, luật 12 và 14): mọi căn quy về giá chủ nhận về tay rồi mới xếp dải — không đặt
 * giá bao phí cạnh giá không bao phí. Chỉ đưa sự thật: dải, các dòng, vị trí căn đang gọi; không khoá «gợi ý» nào.
 */
import type { StandardStatus } from "../listing/status";
import type { FeeInclusion } from "./types";
import { tinhVeTay, TI_LE_BAO_PHI_MAC_DINH, type TiLeBaoPhi } from "./ve-tay";

/** Nấc được đem so (Hỏi-4): Đang bán và Đang giao dịch — căn còn hàng và căn đã cọc của bản phác KD1. */
export const SO_GIA_NAC: readonly StandardStatus[] = ["Active", "Pending"];

export type CanSo = {
  id: string;
  buildingName: string;
  unitNumber: string | null;
  /** Số phòng ngủ theo danh mục; `null` khi căn ngoài danh mục. */
  bedroomsTotal: number | null;
  standardStatus: StandardStatus;
  listPrice: number | null;
  feeInclusion: FeeInclusion | null;
  lastConfirmedAt: string | null;
};

export type CanDangGoi = {
  /** Hồ sơ căn của lead; chưa có là `null`. */
  id: string | null;
  buildingName: string;
  unitNumber: string | null;
  /** `null` khi lead chỉ biết toà hay căn ngoài danh mục — so cả toà. */
  bedroomsTotal: number | null;
  listPrice: number | null;
  feeInclusion: FeeInclusion | null;
};

export type DongSo = Omit<CanSo, "listPrice" | "feeInclusion" | "buildingName" | "bedroomsTotal"> & {
  listPrice: number;
  feeInclusion: FeeInclusion;
  veTay: number;
};

export type SoGiaToa = {
  /** Thấp nhất, trung vị, cao nhất của giá về tay; `null` khi toà không có căn hợp. */
  dai: { thap: number; giua: number; cao: number } | null;
  /** Xếp theo về tay giảm dần. */
  dong: DongSo[];
  /** Căn đang gọi trên dải: về tay và phần trăm lệch so với giữa (một số lẻ); `null` khi căn chưa có giá hay dải trống. */
  viTri: { veTay: number; lechPhanTram: number } | null;
  /** So cả toà vì không biết số phòng ngủ của căn đang gọi. */
  caToa: boolean;
};

const chuan = (s: string | null) => (s ?? "").trim().replace(/\s+/g, " ").toLowerCase();

function trungVi(ds: readonly number[]): number {
  const s = [...ds].sort((a, b) => a - b);
  const g = Math.floor(s.length / 2);
  return s.length % 2 ? s[g]! : Math.floor((s[g - 1]! + s[g]!) / 2);
}

export function soGiaToa({ can, cacCan, tiLe = TI_LE_BAO_PHI_MAC_DINH }: { can: CanDangGoi; cacCan: readonly CanSo[]; tiLe?: TiLeBaoPhi }): SoGiaToa {
  const caToa = can.bedroomsTotal === null;
  const laChinhCan = (c: CanSo) => c.id === can.id || (can.unitNumber !== null && chuan(c.unitNumber) === chuan(can.unitNumber));
  const dong: DongSo[] = cacCan
    .filter(
      (c) =>
        chuan(c.buildingName) === chuan(can.buildingName) &&
        SO_GIA_NAC.includes(c.standardStatus) &&
        c.listPrice !== null &&
        c.feeInclusion !== null &&
        (caToa || c.bedroomsTotal === can.bedroomsTotal) &&
        !laChinhCan(c),
    )
    .map((c) => ({
      id: c.id,
      unitNumber: c.unitNumber,
      standardStatus: c.standardStatus,
      lastConfirmedAt: c.lastConfirmedAt,
      listPrice: c.listPrice!,
      feeInclusion: c.feeInclusion!,
      veTay: tinhVeTay(c.listPrice!, c.feeInclusion!, tiLe).veTay,
    }))
    .sort((a, b) => b.veTay - a.veTay);
  if (!dong.length) return { dai: null, dong, viTri: null, caToa };
  const ve = dong.map((d) => d.veTay);
  const dai = { thap: Math.min(...ve), giua: trungVi(ve), cao: Math.max(...ve) };
  const veTay = can.listPrice !== null && can.feeInclusion !== null ? tinhVeTay(can.listPrice, can.feeInclusion, tiLe).veTay : null;
  const viTri = veTay === null ? null : { veTay, lechPhanTram: Math.round(((veTay - dai.giua) * 1000) / dai.giua) / 10 };
  return { dai, dong, viTri, caToa };
}
