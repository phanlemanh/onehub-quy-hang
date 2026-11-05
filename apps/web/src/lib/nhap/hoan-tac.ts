/**
 * Hoàn tác cả lần nhập trên màn Nhập (hàng 66 nhap-hoan-tac, AC-5, AC-8): danh sách «Lần nhập gần đây» và hộp xác nhận.
 * Hàm thuần — màn React chỉ nối; con số và lý do là của máy chủ (`POST /api/v1/imports/{id}/undo`), màn không tự đếm.
 */

export type LanNhapCuaToi = { id: string; fileName: string; createdAt: string; status: "committed" | "undone"; soDongGhi: number };
export type DongLietKe = { rowNumber: number; buildingName: string | null; unitNumber: string | null; lyDo: string };
export type KetQuaHoanTac = { importId: string; status: "committed" | "undone"; go: number; traGia: number; khongDuoc: number; danhSach: DongLietKe[] };

export const NHAN_HOAN_TAC = "Hoàn tác";
export const NUT_SAU_GHI = "Hoàn tác lần nhập này";
export const DA_HOAN_TAC = "Đã hoàn tác";
export const CHUA_XONG = "Hoàn tác chưa xong — bấm lại để làm tiếp";
export const KHONG_CO_GI = "Không có căn nào hoàn tác được";

export type DongGanDay = { id: string; ten: string; ngay: string; soDong: number; nhan: string | null; coNut: boolean };

/** Tối đa `toiDa` lần nhập, mới nhất trước; lần đã hoàn tác mang nhãn, không nút. */
export function danhSachGanDay(ds: readonly LanNhapCuaToi[], toiDa = 10): DongGanDay[] {
  return [...ds]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, toiDa)
    .map((l) => ({
      id: l.id,
      ten: l.fileName,
      ngay: l.createdAt.slice(0, 10),
      soDong: l.soDongGhi,
      nhan: l.status === "undone" ? DA_HOAN_TAC : null,
      coNut: l.status === "committed",
    }));
}

export type TrangThaiDanhSach = "dang-tai" | "trong" | "loi" | "co-dong";
export const trangThaiDanhSach = (ds: readonly LanNhapCuaToi[] | null, loi: boolean): TrangThaiDanhSach =>
  loi ? "loi" : ds === null ? "dang-tai" : ds.length ? "co-dong" : "trong";

export type HopHoanTac = { importId: string; buoc: "xem-thu" | "san-sang" | "dang-ghi" | "xong" | "loi"; keHoach: KetQuaHoanTac | null; loi: string | null };

export const moHop = (importId: string): HopHoanTac => ({ importId, buoc: "xem-thu", keHoach: null, loi: null });

/** Câu tóm tắt của kế hoạch (xem thử) hay kết quả (đã ghi). */
export function tieuDeHop(k: KetQuaHoanTac): string {
  return `Gỡ ${k.go} căn khỏi Quỹ hàng · Trả giá cũ cho ${k.traGia} căn · ${k.khongDuoc} căn không hoàn tác được`;
}

/** Nút xác nhận: tắt khi chưa có kế hoạch, kế hoạch không gỡ gì, đang ghi hay đã xong. */
export function nutXacNhan(h: HopHoanTac): { tat: boolean; chu: string } {
  if (h.buoc === "loi") return { tat: false, chu: "Hoàn tác tiếp" };
  if (h.buoc === "dang-ghi") return { tat: true, chu: "Đang hoàn tác…" };
  if (!h.keHoach || h.buoc !== "san-sang") return { tat: true, chu: NHAN_HOAN_TAC };
  if (h.keHoach.go + h.keHoach.traGia === 0) return { tat: true, chu: KHONG_CO_GI };
  return { tat: false, chu: NHAN_HOAN_TAC };
}

/** Một dòng của danh sách căn không hoàn tác được. */
export const tenCan = (d: DongLietKe): string => [d.buildingName, d.unitNumber].filter(Boolean).join(" · ") || `Dòng ${d.rowNumber}`;
