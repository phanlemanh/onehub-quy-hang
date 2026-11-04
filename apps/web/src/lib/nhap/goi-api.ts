import type { CotMau } from "@quy-hang/core/import";
import type { GoiDong, KetQuaDong, TongKet, TrangThaiNhap, XemThu } from "./trang-thai";
import { canCuaTep, coQuyen, goiDong } from "./trang-thai";

/**
 * Lời gọi API của màn Nhập Excel (hàng man-nhap-excel) tới đường ghi lần nhập của hàng 65a. `fetch` truyền vào để bài kiểm
 * thay bằng fetch giả hay fetch tới máy chủ thật. Mở lần nhập chỉ gửi kế hoạch, tiêu đề, toà + mã căn — ô thô của dòng (có
 * thể mang số chủ) chỉ đi trong gói dòng tới `/imports/{id}/rows` (bất biến 2, AC-6).
 */

export const GOI = 200;
export type Fetch = (url: string, init?: RequestInit) => Promise<Response>;
export type LoiGoi = { loi: string; status?: number };

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const tong = (rows: readonly KetQuaDong[]): TongKet => {
  const t: TongKet = { create: 0, update: 0, supplement: 0, skip: 0 };
  for (const r of rows) t[r.action]++;
  return t;
};

export function chiaGoi<T>(rows: readonly T[], co = GOI): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += co) out.push(rows.slice(i, i + co));
  return out;
}

const LOI_MANG = "Không gửi được tới máy chủ — kiểm mạng rồi thử lại.";

async function goi<T>(f: Fetch, url: string, init: RequestInit): Promise<T | LoiGoi> {
  let res: Response;
  try {
    res = await f(url, init);
  } catch {
    return { loi: LOI_MANG };
  }
  if (!res.ok) {
    const b = (await res.json().catch(() => ({}))) as { error?: unknown };
    // Lỗi kiểm thân mặc định của máy chủ mang `error` là đối tượng — vẫn là lỗi, chữ cho người đọc (Ngoài-7 Màn Nhập Excel).
    const loi = typeof b.error === "string" && b.error ? b.error : `Máy chủ từ chối yêu cầu (mã ${res.status}).`;
    return { loi, status: res.status };
  }
  return (await res.json()) as T;
}

export const laLoi = (x: unknown): x is LoiGoi => !!x && typeof x === "object" && typeof (x as { loi?: unknown }).loi === "string";

/** Mở một lần nhập — thân chỉ mang lớp danh mục và kế hoạch, không ô thô. */
export async function moLanNhap(f: Fetch, s: TrangThaiNhap): Promise<{ id: string } | LoiGoi> {
  if (!coQuyen(s.vai)) return { loi: "Chỉ Đầu chủ và Trưởng nhóm nhập được." };
  if (!s.tep || !s.ong) return { loi: "Chưa có tệp." };
  return goi<{ id: string }>(
    f,
    "/api/v1/imports",
    json("POST", {
      fileName: s.tep.ten,
      fileHash: s.tep.bam,
      sheet: s.tep.trang,
      fileKind: s.tep.loai,
      headers: s.ong.table.headers,
      headerRow: s.ong.plan.headerRow,
      plan: s.ong.plan,
      units: canCuaTep(s),
    }),
  );
}

type KetQuaGoi = { importId: string; rows: KetQuaDong[]; summary: TongKet };

const guiGoi = (f: Fetch, id: string, rows: GoiDong[], dryRun: boolean) =>
  goi<KetQuaGoi>(f, `/api/v1/imports/${id}/rows`, json("POST", { dryRun, rows }));

/** Xem thử mọi gói, tuần tự; `onGoi(i, n)` báo tiến độ. Máy chủ chạy cùng đường ghi rồi lùi — không để lại gì. */
export async function xemThuTatCa(f: Fetch, s: TrangThaiNhap, onGoi?: (i: number, n: number) => void): Promise<XemThu | LoiGoi> {
  const mo = await moLanNhap(f, s);
  if (laLoi(mo)) return mo;
  const goiCa = chiaGoi(goiDong(s));
  const rows: KetQuaDong[] = [];
  for (const [i, g] of goiCa.entries()) {
    onGoi?.(i + 1, goiCa.length);
    const kq = await guiGoi(f, mo.id, g, true);
    if (laLoi(kq)) return kq;
    rows.push(...kq.rows);
  }
  return { importId: mo.id, rows, summary: tong(rows) };
}

/** Tiến độ ghi: gói đã ghi giữ nguyên kết quả; gói lỗi thì dừng, «Thử lại» gửi lại đúng gói ấy (máy chủ trả kết quả cũ
 *  cho dòng đã ghi, không nhân đôi). */
export type TienDoGhi = { importId: string; the: number; goi: GoiDong[][]; xong: KetQuaGoi[]; loi: (LoiGoi & { goi: number }) | null };

export function batDauGhi(s: TrangThaiNhap): TienDoGhi | LoiGoi {
  if (!s.xemThu) return { loi: "Chưa xem thử." };
  return { importId: s.xemThu.importId, the: s.the, goi: chiaGoi(goiDong(s)), xong: [], loi: null };
}

export async function ghiTiep(f: Fetch, t: TienDoGhi, onGoi?: (t: TienDoGhi) => void): Promise<TienDoGhi> {
  let cur: TienDoGhi = { ...t, loi: null };
  for (let i = cur.xong.length; i < cur.goi.length; i++) {
    const kq = await guiGoi(f, cur.importId, cur.goi[i]!, false);
    if (laLoi(kq)) return { ...cur, loi: { ...kq, goi: i + 1 } };
    cur = { ...cur, xong: [...cur.xong, kq] };
    onGoi?.(cur);
  }
  return cur;
}

/** Tiến độ ghi chỉ dùng tiếp cho đúng thế hệ và đúng lần nhập của bản xem thử đang có — đổi gì sau đó (thế hệ mới) hay xem
 *  thử lại (lần nhập mới) thì tiến độ cũ bỏ đi, không gửi gói cũ tới lần nhập cũ. */
export const tienDoCho = (t: TienDoGhi | null, s: TrangThaiNhap): TienDoGhi | null =>
  t && s.xemThu && t.importId === s.xemThu.importId && t.the === s.the ? t : null;

export const xongGhi = (t: TienDoGhi) => t.loi === null && t.xong.length === t.goi.length;
export const tongGhi = (t: TienDoGhi): TongKet => tong(t.xong.flatMap((g) => g.rows));

/** Đầu chủ của sàn cho Trưởng nhóm chọn (Hỏi-2). */
export const docDauChu = (f: Fetch) => goi<{ userId: string; name: string }[]>(f, "/api/v1/imports/agents", { method: "GET" });

/** Mẫu file của sàn (hàng 67): cột đã nhớ từ các lần nhập đã ghi. Lỗi thì màn ghép theo từ điển và báo một dòng. */
export async function docMau(f: Fetch): Promise<CotMau[] | LoiGoi> {
  return goi<CotMau[]>(f, "/api/v1/imports/templates", { method: "GET" });
}
