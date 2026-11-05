/**
 * Kế hoạch hoàn tác cả lần nhập (hàng 66, ADR-0011 quyết định 8): mỗi dòng của lần nhập một kết cục, quyết từ dòng
 * `import_rows` và dãy sự kiện hiện tại của hàng. Thuần — đường ghi ở `packages/api/src/imports/undo` làm theo kết cục.
 *
 * «Đã có người sửa sau lần nhập» = hàng có sự kiện sau sự kiện cuối của lần nhập, bất kể ai ghi và ghi gì (Hỏi-4 Cổng Phạm
 * vi) — so phiên bản, không so giá trị, như hoàn tác ô sửa (`va-sua-tren-o`).
 */
import type { ListingEvent } from "./events";
import { foldListing } from "./fold";

export type KetCucHoanTac = "go" | "tra-gia" | "khong-doi" | "da-sua-sau" | "khong-tra-duoc" | "tin-bo-sung" | "bo-qua";
export const KET_CUC_HOAN_TAC: readonly KetCucHoanTac[] = ["go", "tra-gia", "khong-doi", "da-sua-sau", "khong-tra-duoc", "tin-bo-sung", "bo-qua"];

/** Lý do liệt kê cho người — chỉ kết cục không ghi gì mà người cần biết. */
export const LY_DO_HOAN_TAC = {
  "da-sua-sau": "Đã có người sửa sau lần nhập",
  "tin-bo-sung": "Tin bổ sung đã gửi — không thu lại",
  "khong-doi": "Độ tươi theo ngày trong file vẫn giữ",
  "khong-tra-duoc": "Trước lần nhập căn chưa có giá",
} as const satisfies Partial<Record<KetCucHoanTac, string>>;

export type DongNhap = {
  rowNumber: number;
  action: "create" | "update" | "supplement" | "skip";
  listingId: string | null;
  /** Phiên bản của hàng có sẵn ngay trước lần nhập (`import_rows.listing_version_before`). */
  versionBefore: number | null;
};
export type SuKienNhap = ListingEvent & { importId: string | null };
export type LenhBu = { kind: "voided" } | { kind: "price"; listPrice: number; feeInclusion: string };
export type KeHoachDong = {
  rowNumber: number;
  ketCuc: KetCucHoanTac;
  lyDo: string | null;
  listingId: string | null;
  lenh: LenhBu | null;
  /** Phiên bản hiện tại của hàng — lệnh bù ghi với phiên bản này; `null` khi không ghi. */
  expectedVersion: number | null;
};

const ket = (d: DongNhap, ketCuc: KetCucHoanTac, lenh: LenhBu | null = null, expectedVersion: number | null = null): KeHoachDong => ({
  rowNumber: d.rowNumber,
  ketCuc,
  lyDo: ketCuc in LY_DO_HOAN_TAC ? LY_DO_HOAN_TAC[ketCuc as keyof typeof LY_DO_HOAN_TAC] : null,
  listingId: d.listingId,
  lenh,
  expectedVersion,
});

/** Kết cục của một dòng. `suKien` là dãy sự kiện hiện tại của hàng (`null` khi dòng không có hàng). */
export function keHoachDong(d: DongNhap, suKien: readonly SuKienNhap[] | null, importId: string): KeHoachDong {
  if (d.action === "skip") return ket(d, "bo-qua");
  if (d.action === "supplement") return ket(d, "tin-bo-sung");
  const ds = [...(suKien ?? [])].sort((a, b) => a.seq - b.seq);
  const cuaLan = ds.filter((e) => e.importId === importId);
  const cuoi = ds.at(-1);
  if (!cuoi || cuaLan.length === 0) return ket(d, d.action === "create" ? "go" : "khong-doi");
  const seqCuoiCuaLan = Math.max(...cuaLan.map((e) => e.seq));
  if (cuoi.seq > seqCuoiCuaLan) return ket(d, "da-sua-sau");
  if (d.action === "create") return ket(d, "go", { kind: "voided" }, cuoi.seq);
  if (!cuaLan.some((e) => e.type === "price_changed")) return ket(d, "khong-doi");
  const truoc = foldListing(ds.filter((e) => e.seq <= (d.versionBefore ?? 0)));
  if (truoc.listPrice === null || truoc.feeInclusion === null) return ket(d, "khong-tra-duoc");
  return ket(d, "tra-gia", { kind: "price", listPrice: truoc.listPrice, feeInclusion: truoc.feeInclusion }, cuoi.seq);
}
