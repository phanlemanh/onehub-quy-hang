// Máy chủ giả cho ca kiểm thuần: giữ dãy sự kiện mỗi căn, áp đúng ba luật của API thật (phiên bản, «thắng ngay», bảng
// chuyển trạng thái của lõi), có công tắc mất mạng và mất phản hồi. Bài kiểm trên API thật nằm ở test-db/.
// Hàng 61: công tắc trả mã (401, 5xx, 4xx) theo phương thức và căn, ghi rồi trả 503, cấy khoá nguồn vào bản kéo.
// Hàng 52: ghi lại thân lệnh sự kiện nhận được (xem khoá `madeOffline`) và nhận đường lượt mất mạng như API thật — 201 lần
// đầu, gửi lại cùng `startedAt` + thiết bị trả 200 không thêm dòng; công tắc trả 503 một lần.
import { checkTransition, foldListing, WINS_IMMEDIATELY, type ListingEvent } from "@quy-hang/core/listing";
import type { Goi } from "./types";

export function mayChuGia(o: { userId: string; chiToiCuaNguoiKhac?: string[] }) {
  const can = new Map<string, ListingEvent[]>();
  let matMang = false;
  const anDi = new Set(o.chiToiCuaNguoiKhac ?? []);
  let matPhanHoiLanToi = false;
  let ghiRoi503LanToi = false;
  let cayNguon = false;
  /** Mã ép trả, khoá `<phương thức> <căn | ds | *>` — `ds` là danh sách, `*` mọi căn. */
  const ma = new Map<string, { status: number; body: unknown }>();
  const maCua = (method: string, id: string | undefined) => {
    const c = id ?? "ds";
    return ma.get(`${method} ${c}`) ?? ma.get(`* ${c}`) ?? (id ? (ma.get(`${method} *`) ?? ma.get("* *")) : ma.get("* *"));
  };
  const goiQua: { method: string; path: string }[] = [];
  /** Thân các lệnh `POST /listings/<id>/events` máy chủ nhận được, đúng thứ tự. */
  const lenhNhan: { listingId: string; body: Record<string, unknown> }[] = [];
  /** Các dòng lượt mất mạng máy chủ đã ghi. */
  const luotMatMang: Record<string, unknown>[] = [];
  let luot503LanToi = false;
  const view = (id: string) => ({ id, ...foldListing(can.get(id)!), visibility: "Company" as const });
  const ghi = (id: string, actorUserId: string, type: ListingEvent["type"], payload: Record<string, unknown>) => {
    const ds = can.get(id)!;
    ds.push({ seq: ds.length + 1, type, payload, actorUserId, actorRoles: [], confirmedWithOwner: type !== "details_changed", occurredAt: new Date().toISOString() });
  };
  const goi: Goi = async (method, path, body) => {
    goiQua.push({ method, path });
    if (matMang) throw new Error("mất mạng");
    if (method === "POST" && path === "/api/v1/sync/offline-sessions") {
      if (luot503LanToi) {
        luot503LanToi = false;
        return { status: 503, body: null };
      }
      const b = body as Record<string, unknown>;
      if (luotMatMang.some((x) => x.startedAt === b.startedAt && x.device === b.device)) return { status: 200, body: b };
      luotMatMang.push(structuredClone(b));
      return { status: 201, body: b };
    }
    const m = path.match(/^\/api\/v1\/listings(?:\/([^/]+))?(\/events)?$/);
    const id = m?.[1];
    const ep = maCua(method, id);
    if (ep) return { status: ep.status, body: ep.body };
    const an = (x: string) => anDi.has(x);
    if (method === "GET" && !id) return { status: 200, body: [...can.keys()].filter((x) => !an(x)).map((x) => (cayNguon ? { ...view(x), ownerPhone: "0900 000 012" } : view(x))) };
    if (!id || !can.has(id) || an(id)) return { status: 404, body: { error: "not-found" } };
    if (method === "GET") return { status: 200, body: { ...view(id), events: can.get(id) } };
    lenhNhan.push({ listingId: id, body: structuredClone(body) as Record<string, unknown> });
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
    if (ghiRoi503LanToi) {
      ghiRoi503LanToi = false;
      return { status: 503, body: null };
    }
    return { status: 200, body: view(id) };
  };
  return {
    goi,
    goiQua,
    lenhNhan,
    luotMatMang,
    /** Lần gửi lượt mất mạng tới: máy chủ trả 503, không ghi. */
    luot503LanToi: () => {
      luot503LanToi = true;
    },
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
    /** Ép mã cho `<phương thức> <căn | ds | *>`; `null` gỡ. */
    datMa: (khoa: string, status: number | null, body: unknown = { error: `ma-${status}` }) => {
      if (status === null) ma.delete(khoa);
      else ma.set(khoa, { status, body });
    },
    /** Lần POST tới: máy chủ ghi sự kiện rồi trả 503. */
    ghiRoi503LanToi: () => {
      ghiRoi503LanToi = true;
    },
    datCayNguon: (v: boolean) => {
      cayNguon = v;
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
