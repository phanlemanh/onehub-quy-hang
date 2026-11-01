/**
 * Xếp căn và lead vào hàng đợi của Hôm nay (hàng 22, luật 18): đi qua bộ nhóm theo thứ tự, vào nhóm bật đầu tiên mà mọi
 * điều kiện đều đúng — nên mỗi căn đúng một nhóm và thứ tự là thứ tự thắng. Lõi không đọc đồng hồ: `bayGio` truyền vào.
 * «Ngày» tính theo lịch Việt Nam (UTC+7 cố định), không theo múi giờ của máy.
 */
import type { BoNhom, Condition, DuKienCan, DuKienLead, Nhom } from "./kieu";

const VN_MS = 7 * 60 * 60 * 1000;
const NGAY_MS = 24 * 60 * 60 * 1000;
/** Số ngày lịch Việt Nam của một mốc. */
const ngayVn = (iso: string) => Math.floor((Date.parse(iso) + VN_MS) / NGAY_MS);
/** 0 giờ (giờ Việt Nam) của ngày `lui` trước `bayGio`, dạng ms UTC. */
const dauNgayVn = (bayGio: string, lui: number) => (ngayVn(bayGio) - lui) * NGAY_MS - VN_MS;

/** Lúc căn lên Đang bán: lần đổi trạng thái gần nhất nếu nó đưa căn tới Đang bán. */
const lucLenDangBan = (c: DuKienCan) => (c.lastStatusChange?.to === "Active" ? c.lastStatusChange.at : null);

function moc(c: DuKienCan, anchor: Extract<Condition, { kind: "days_since" }>["anchor"]): string | null {
  const gia = c.priceChangeTimestamp ?? lucLenDangBan(c);
  if (anchor === "price") return gia;
  if (anchor === "confirmed") return c.lastConfirmedAt;
  if (anchor === "active_since") return lucLenDangBan(c);
  const ds = [gia, c.lastConfirmedAt].filter((x): x is string => !!x);
  return ds.length ? ds.reduce((a, b) => (Date.parse(a) >= Date.parse(b) ? a : b)) : null;
}

/** Một điều kiện trên một căn. Mốc chưa có thì «quá ngày» là đúng. */
export function dungVoiCan(d: Condition, c: DuKienCan, nguoi: string, bayGio: string): boolean {
  switch (d.kind) {
    case "status_in":
      return d.in.includes(c.standardStatus);
    case "days_since": {
      const m = moc(c, d.anchor);
      return m === null || ngayVn(bayGio) - ngayVn(m) >= d.days;
    }
    case "missing_info":
      return c.missing.length > 0;
    case "changed_by_other": {
      const tu = dauNgayVn(bayGio, d.since === "yesterday" ? 1 : 0);
      return [c.lastPriceChange, c.lastStatusChange].some((l) => !!l && l.byUserId !== nguoi && Date.parse(l.at) >= tu);
    }
    case "property_sub_type_in":
      return c.propertySubType !== null && d.in.includes(c.propertySubType);
    case "lead_stage_in":
      return false;
  }
}

/** Điều kiện ngầm của mọi nhóm căn: căn mình giữ, chưa Đã bán, chưa Ngừng bán. */
const canVaoDuoc = (c: DuKienCan, nguoi: string) => c.listAgentKey === nguoi && c.standardStatus !== "Closed" && c.standardStatus !== "Withdrawn";

/** Nhóm của một căn, hay `null` khi không nhóm nào nhận. */
export function nhomCuaCan(bo: BoNhom, c: DuKienCan, nguoi: string, bayGio: string): Nhom | null {
  if (!canVaoDuoc(c, nguoi)) return null;
  return bo.find((n) => n.enabled && n.subject === "listing" && n.conditions.every((d) => dungVoiCan(d, c, nguoi, bayGio))) ?? null;
}

/** Điều kiện ngầm của nhóm lead: lead giao cho mình (người gọi đã lọc), chưa trả lại, chưa bỏ. */
export function nhomCuaLead(bo: BoNhom, l: DuKienLead): Nhom | null {
  if (l.stage === "returned" || l.stage === "discarded") return null;
  return (
    bo.find((n) => n.enabled && n.subject === "lead" && n.conditions.every((d) => d.kind === "lead_stage_in" && d.in.includes(l.stage))) ?? null
  );
}

/** Chia một danh sách căn theo bộ nhóm: trả nhóm theo thứ tự của bộ (chỉ nhóm căn bật), mỗi nhóm kèm các căn của nó. */
export function chiaNhom<T extends DuKienCan>(bo: BoNhom, cans: readonly T[], nguoi: string, bayGio: string): { nhom: Nhom; cans: T[] }[] {
  const ra = bo.filter((n) => n.enabled && n.subject === "listing").map((nhom) => ({ nhom, cans: [] as T[] }));
  for (const c of cans) {
    const n = nhomCuaCan(bo, c, nguoi, bayGio);
    if (n) ra.find((x) => x.nhom.code === n.code)!.cans.push(c);
  }
  return ra;
}
