// Đổi đầu chủ hàng loạt (hàng 89): phần thuần — trạng thái nút, hộp hỏi dựng từ bản xem trước của máy chủ, chữ thông báo
// đổi và hoàn tác, lời gọi ba lệnh API. Màn (`doi-dau-chu.tsx`) chỉ dựng những gì các hàm này trả; bài kiểm gọi thẳng chúng.

/** Thời lượng thông báo có «Hoàn tác» — như sửa hàng loạt (hàng 16). */
export const THOI_GIAN_HOAN_TAC = 10_000;
export const LOI_MAT_MANG = "Cần mạng để đổi đầu chủ";

/** Nút «Đổi đầu chủ»: mất mạng thì tắt kèm lời — đổi đi thẳng máy chủ, không qua kho trên máy. */
export function trangThaiNut(coMang: boolean): { tat: boolean; loi: string | null } {
  return coMang ? { tat: false, loi: null } : { tat: true, loi: LOI_MAT_MANG };
}

export type XemTruoc = { listings: { listingId: string; selected: boolean; fromUserId: string | null; contactId: string | null }[]; contacts: number };
export type DongHop = { id: string; maCan: string; cu: string; cungChu: boolean };

/** Hộp hỏi: mọi căn của bản xem trước, căn trưởng nhóm đã tích lên trước; căn kéo theo đánh dấu «cùng chủ nhà». */
export function dungHop(x: XemTruoc, maCan: (id: string) => string, ten: (userId: string) => string): { dong: DongHop[]; soCan: number; soLienHe: number } {
  const dong = x.listings.map((l) => ({ id: l.listingId, maCan: maCan(l.listingId), cu: l.fromUserId ? ten(l.fromUserId) : "Chưa có đầu chủ", cungChu: !l.selected }));
  dong.sort((a, b) => Number(a.cungChu) - Number(b.cungChu) || a.maCan.localeCompare(b.maCan, "vi"));
  return { dong, soCan: dong.length, soLienHe: x.contacts };
}

export const chuDaDoi = (kq: { listings: number; contacts: number }) => `Đã đổi đầu chủ ${kq.listings} căn, ${kq.contacts} liên hệ`;

/** Thông báo sau hoàn tác: số đã trả, số bỏ qua vì đổi tiếp, và lời riêng cho căn trước chưa có đầu chủ (Hỏi-2). */
export function chuHoanTac(kq: { restored: number; skipped: number; keptNoPriorAgent: number }, tenNhan: string): { chu: string; moTa: string | null } {
  const moTa = [
    kq.skipped ? `Bỏ qua ${kq.skipped} căn hay liên hệ đã đổi tiếp sau đó` : null,
    kq.keptNoPriorAgent ? `${kq.keptNoPriorAgent} căn trước chưa có đầu chủ nên giữ ${tenNhan}` : null,
  ].filter(Boolean).join(" · ");
  return { chu: `Đã trả lại người giữ cũ cho ${kq.restored} căn và liên hệ`, moTa: moTa || null };
}

const LOI: Record<string, string> = {
  "reassignment-too-large": "Tối đa 200 căn một lần",
  "team-lead-required": "Chỉ trưởng nhóm đổi được đầu chủ",
  "reassignment-undone": "Lần đổi này đã hoàn tác",
  "invalid-payload": "Người nhận không phải đầu chủ của sàn",
  "not-found": "Có căn không còn ở sàn này",
};
export const loiCua = (code: string | null) => (code && LOI[code]) || "Không đổi được đầu chủ — thử lại";

type Goi = typeof fetch;
async function goi<T>(f: Goi, duong: string, than?: unknown): Promise<{ ok: true; data: T } | { ok: false; loi: string }> {
  const r = await f(duong, {
    method: "POST",
    credentials: "same-origin",
    headers: than === undefined ? undefined : { "content-type": "application/json" },
    body: than === undefined ? undefined : JSON.stringify(than),
  }).catch(() => null);
  if (!r) return { ok: false, loi: LOI_MAT_MANG };
  const j = (await r.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!r.ok) return { ok: false, loi: loiCua(j?.error ?? null) };
  return { ok: true, data: j as T };
}

const BASE = "/api/v1/listings/agent-reassignments";
export const xemTruoc = (ids: readonly string[], f: Goi = fetch) => goi<XemTruoc>(f, `${BASE}/preview`, { listingIds: ids });
export const doiDauChu = (ids: readonly string[], userId: string, f: Goi = fetch) => goi<{ id: string; listings: number; contacts: number }>(f, BASE, { listingIds: ids, userId });
export const hoanTacDoi = (id: string, f: Goi = fetch) => goi<{ restored: number; skipped: number; keptNoPriorAgent: number }>(f, `${BASE}/${encodeURIComponent(id)}/undo`);

/**
 * Đổi rồi kéo đồng bộ: gọi lệnh đổi; chỉ khi máy chủ nhận mới báo thông báo (có «Hoàn tác») và kéo lại kho trên máy.
 * Lỗi thì trả lời lỗi, không kéo. Phụ thuộc truyền vào để bài kiểm ghi thứ tự gọi.
 */
export async function chayDoi(d: {
  doi: () => Promise<{ ok: true; data: { id: string; listings: number; contacts: number } } | { ok: false; loi: string }>;
  bao: (chu: string, id: string) => void;
  keo: () => Promise<void>;
}): Promise<{ ok: true; id: string } | { ok: false; loi: string }> {
  const r = await d.doi();
  if (!r.ok) return r;
  d.bao(chuDaDoi(r.data), r.data.id);
  await d.keo();
  return { ok: true, id: r.data.id };
}

/** Hoàn tác rồi kéo đồng bộ: chỉ kéo khi máy chủ nhận; trả chữ thông báo. */
export async function chayHoanTac(d: {
  hoanTac: () => Promise<{ ok: true; data: { restored: number; skipped: number; keptNoPriorAgent: number } } | { ok: false; loi: string }>;
  keo: () => Promise<void>;
  tenNhan: string;
}): Promise<{ ok: true; chu: string; moTa: string | null } | { ok: false; loi: string }> {
  const r = await d.hoanTac();
  if (!r.ok) return r;
  await d.keo();
  return { ok: true, ...chuHoanTac(r.data, d.tenNhan) };
}
