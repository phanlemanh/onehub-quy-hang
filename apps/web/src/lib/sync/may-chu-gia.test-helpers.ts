// Máy chủ giả cho ca kiểm thuần: giữ dãy sự kiện mỗi căn, áp đúng ba luật của API thật (phiên bản, «thắng ngay», bảng
// chuyển trạng thái của lõi), có công tắc mất mạng và mất phản hồi. Bài kiểm trên API thật nằm ở test-db/.
import { checkTransition, foldListing, WINS_IMMEDIATELY, type ListingEvent } from "@quy-hang/core/listing";
import type { Goi } from "./types";

export function mayChuGia(o: { userId: string; chiToiCuaNguoiKhac?: string[] }) {
  const can = new Map<string, ListingEvent[]>();
  let matMang = false;
  const anDi = new Set(o.chiToiCuaNguoiKhac ?? []);
  let matPhanHoiLanToi = false;
  const goiQua: { method: string; path: string }[] = [];
  const view = (id: string) => ({ id, ...foldListing(can.get(id)!), visibility: "Company" as const });
  const ghi = (id: string, actorUserId: string, type: ListingEvent["type"], payload: Record<string, unknown>) => {
    const ds = can.get(id)!;
    ds.push({ seq: ds.length + 1, type, payload, actorUserId, actorRoles: [], confirmedWithOwner: type !== "details_changed", occurredAt: new Date().toISOString() });
  };
  const goi: Goi = async (method, path, body) => {
    goiQua.push({ method, path });
    if (matMang) throw new Error("mất mạng");
    const m = path.match(/^\/api\/v1\/listings(?:\/([^/]+))?(\/events)?$/);
    const id = m?.[1];
    const an = (x: string) => anDi.has(x);
    if (method === "GET" && !id) return { status: 200, body: [...can.keys()].filter((x) => !an(x)).map(view) };
    if (!id || !can.has(id) || an(id)) return { status: 404, body: { error: "not-found" } };
    if (method === "GET") return { status: 200, body: { ...view(id), events: can.get(id) } };
    const c = body as { type: ListingEvent["type"]; payload: Record<string, unknown>; expectedVersion: number };
    const hien = foldListing(can.get(id)!);
    const thang = c.type === "status_changed" && WINS_IMMEDIATELY.includes(c.payload.to as never);
    if (!thang && c.expectedVersion !== hien.version) return { status: 409, body: { error: "version-conflict" } };
    if (c.type === "status_changed") {
      const kq = checkTransition(hien.standardStatus, c.payload.to, { ...hien, ...c.payload });
      if (!kq.ok) return { status: 400, body: kq.kind === "invalid-transition" ? { error: kq.kind, reason: kq.reason } : { error: kq.kind, missing: kq.missing } };
    }
    ghi(id, o.userId, c.type, c.payload);
    if (matPhanHoiLanToi) {
      matPhanHoiLanToi = false;
      throw new Error("mất phản hồi");
    }
    return { status: 200, body: view(id) };
  };
  return {
    goi,
    goiQua,
    can,
    tao(id: string, toa: string, actorUserId = o.userId) {
      can.set(id, []);
      ghi(id, actorUserId, "created", { buildingName: toa, unitNumber: `${id}-01` });
    },
    /** Căn thành «Chỉ tôi» của người khác với người này: mọi lời gọi vào căn trả 404. */
    an: (id: string) => void anDi.add(id),
    nguoiKhacGhi: (id: string, type: ListingEvent["type"], payload: Record<string, unknown>) => ghi(id, "u-khac", type, payload),
    datMatMang: (v: boolean) => {
      matMang = v;
    },
    matPhanHoiLanToi: () => {
      matPhanHoiLanToi = true;
    },
  };
}

/** Đồng hồ giả: tiến tay, chạy hẹn tới hạn. */
export function dongHoGia() {
  let t = Date.UTC(2026, 9, 31, 3, 0, 0);
  let id = 0;
  const hen = new Map<number, { luc: number; fn: () => void }>();
  return {
    now: () => t,
    setTimeout: (fn: () => void, ms: number) => {
      hen.set(++id, { luc: t + ms, fn });
      return id;
    },
    clearTimeout: (h: unknown) => void hen.delete(h as number),
    async tien(ms: number) {
      const den = t + ms;
      for (;;) {
        const sap = [...hen.entries()].filter(([, h]) => h.luc <= den).sort((a, b) => a[1].luc - b[1].luc)[0];
        if (!sap) break;
        hen.delete(sap[0]);
        t = sap[1].luc;
        sap[1].fn();
        for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
      }
      t = den;
    },
  };
}

export const xa = async () => {
  for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
};
