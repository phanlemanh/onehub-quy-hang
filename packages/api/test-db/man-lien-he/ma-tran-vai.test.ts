// Ma trận vai trên bốn đường đọc liên hệ chủ nhà (va-ho-so-lien-he, Ngoài-22 hàng 103): danh sách, tìm theo số, xem hồ
// sơ, mở số. Một bảng viết trước (người × liên hệ → đọc được không; trùng bảng kỳ vọng của contract.md) áp cho cả bốn đường; mỗi ô một assert và được đếm, tổng số ô so với
// kích thước bảng. Người, lead, liên hệ dựng qua đường ghi thật của sàn thử; số mẫu `0900 000 0xx`, tên «[Tên]».
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { appPool, cleanup } from "../helpers";
import { nam, nhap, nhip, sanMoi, send, soMoi, type San } from "../san-thu";

after(cleanup);

const DOI = {
  ts: { vai: ["telesales"] },
  tn: { vai: ["team_lead"] },
  dc1: { vai: ["listing_agent"], khu: ["Toà A"] }, // người giữ liên hệ «giu», còn vai Đầu chủ
  dc2: { vai: ["listing_agent"], khu: ["Toà B"] }, // Đầu chủ khác, không giữ ai trong ma trận
  mat: { vai: ["listing_agent"], khu: ["Toà C"] }, // người giữ liên hệ «mat», sẽ mất vai Đầu chủ
  dk: { vai: ["buyer_agent"] },
  hai: { vai: ["buyer_agent", "listing_agent"] }, // hai vai, không giữ ai
};
type Nguoi = keyof typeof DOI | "qt" | "";
type Lh = "giu" | "mat";

/** Bảng viết trước: người → [đọc được liên hệ «giu», đọc được liên hệ «mat»] sau khi «mat» mất vai Đầu chủ. */
const DOC: [Nguoi, boolean, boolean][] = [
  ["dc1", true, false],
  ["mat", false, false],
  ["dc2", false, false],
  ["hai", false, false],
  ["tn", true, true],
  ["ts", false, false],
  ["dk", false, false],
  ["qt", false, false],
  ["", false, false], // không cookie
];
/** Vai được vào màn Liên hệ (Đầu chủ, Trưởng nhóm) — vai khác bị chặn trước khi xét liên hệ. */
const CO_VAI_MAN: Record<Nguoi, boolean> = { dc1: true, mat: false, dc2: true, hai: true, tn: true, ts: false, dk: false, qt: false, "": false };

const ck = (s: San, k: Nguoi) => (k ? (s.nguoi[k]?.cookie ?? "") : "");
const tenCua = async (userId: string) => (await appPool.query<{ name: string }>('select name from identity."user" where id = $1', [userId])).rows[0]!.name;
const soMo = async (contactId: string) =>
  (await appPool.query<{ n: number }>("select count(*)::int n from contact_phone_reveals where contact_id = $1", [contactId])).rows[0]!.n;

test("liên hệ: ma trận vai trên bốn đường đọc", async () => {
  const s = await sanMoi(DOI);
  // Hai liên hệ chủ nhà qua lead đã chia theo khu: «giu» của dc1 (Toà A), «mat» của mat (Toà C).
  const LH: Record<Lh, { so: string; contactId: string; phoneId: string; holder: string }> = {} as never;
  for (const [lh, toa, k] of [["giu", "Toà A", "dc1"], ["mat", "Toà C", "mat"]] as const) {
    const so = soMoi(s);
    const l = await nhap(s, nam(so, toa));
    await nhip(new Date(), s);
    const contactId = (await appPool.query<{ contact_id: string }>("select contact_id from leads where id = $1", [l.id])).rows[0]!.contact_id;
    const h = await send("GET", `/api/v1/contacts/${contactId}/profile`, undefined, ck(s, k));
    assert.equal(h.status, 200, `dựng: người giữ ${k} đọc hồ sơ — ${await h.clone().text()}`);
    const phoneId = ((await h.json()) as { phones: { phoneId: string }[] }).phones[0]!.phoneId;
    LH[lh] = { so, contactId, phoneId, holder: s.nguoi[k]!.userId };
  }
  // «mat» mất vai Đầu chủ (sang Đầu khách) — liên hệ vẫn ghi «mat» là người giữ.
  assert.equal((await send("PATCH", `/api/v1/company/members/${LH.mat.holder}`, { roles: ["buyer_agent"] }, ck(s, "qt"))).status, 200);
  // Thân từ chối «không có» làm mẫu: hồ sơ và mở số của một mã không tồn tại.
  const khongCo = "00000000-0000-4000-8000-000000000001";
  const thanHoSoKhongCo = await (await send("GET", `/api/v1/contacts/${khongCo}/profile`, undefined, ck(s, "dc1"))).text();
  const thanMoKhongCo = await (await send("POST", `/api/v1/contacts/${khongCo}/phones/${khongCo}/reveal`, undefined, ck(s, "dc1"))).text();
  const tenGiu: Record<Lh, string> = { giu: await tenCua(LH.giu.holder), mat: await tenCua(LH.mat.holder) };

  // Bốn đường; mỗi đường nhận (người, liên hệ, đọc được) và tự kiểm một ô.
  const DUONG: Record<string, (k: Nguoi, lh: Lh, duoc: boolean) => Promise<void>> = {
    "danh sách": async (k, lh, duoc) => {
      const r = await send("GET", "/api/v1/contacts", undefined, ck(s, k));
      const o = `danh sách ${k || "không cookie"}/${lh}`;
      if (k === "") return assert.equal(r.status, 401, o);
      if (!CO_VAI_MAN[k]) return assert.deepEqual([r.status, await r.json()], [403, { error: "listing-agent-required" }], o);
      assert.equal(r.status, 200, o);
      const ids = ((await r.json()) as { items: { id: string }[] }).items.map((i) => i.id);
      assert.equal(ids.includes(LH[lh].contactId), duoc, `${o}: ${duoc ? "thiếu" : "lộ"} liên hệ trong danh sách`);
    },
    "tìm theo số": async (k, lh, duoc) => {
      const r = await send("POST", "/api/v1/contacts/lookup-phone", { phone: LH[lh].so }, ck(s, k));
      const o = `tìm theo số ${k || "không cookie"}/${lh}`;
      if (k === "") return assert.equal(r.status, 401, o);
      if (!CO_VAI_MAN[k]) return assert.deepEqual([r.status, await r.json()], [403, { error: "listing-agent-required" }], o);
      assert.deepEqual([r.status, await r.json()], [200, duoc ? { contactId: LH[lh].contactId } : { held: true, holderName: tenGiu[lh] }], o);
    },
    "xem hồ sơ": async (k, lh, duoc) => {
      const r = await send("GET", `/api/v1/contacts/${LH[lh].contactId}/profile`, undefined, ck(s, k));
      const o = `xem hồ sơ ${k || "không cookie"}/${lh}`;
      if (k === "") return assert.equal(r.status, 401, o);
      if (!duoc) return assert.deepEqual([r.status, await r.text()], [404, thanHoSoKhongCo], `${o}: phải 404 cùng thân với liên hệ không có`);
      assert.equal(r.status, 200, o);
      assert.equal(((await r.json()) as { contact: { id: string } }).contact.id, LH[lh].contactId, o);
    },
    "mở số": async (k, lh, duoc) => {
      const truoc = await soMo(LH[lh].contactId);
      const r = await send("POST", `/api/v1/contacts/${LH[lh].contactId}/phones/${LH[lh].phoneId}/reveal`, undefined, ck(s, k));
      const o = `mở số ${k || "không cookie"}/${lh}`;
      if (k === "") assert.equal(r.status, 401, o);
      else if (!duoc) assert.deepEqual([r.status, await r.text()], [404, thanMoKhongCo], `${o}: phải 404 cùng thân với liên hệ không có`);
      else assert.equal(((await r.json()) as { phone: string }).phone.replace(/\D/g, ""), LH[lh].so.replace(/\D/g, ""), o);
      assert.equal(await soMo(LH[lh].contactId), truoc + (duoc ? 1 : 0), `${o}: số sự kiện mở số`);
    },
  };

  // Bảng phải có cả ô đọc được lẫn ô bị chặn ở mỗi liên hệ — không thì ma trận không phân biệt gì.
  for (const i of [1, 2] as const) assert.ok(DOC.some((d) => d[i]) && DOC.some((d) => !d[i]), `bảng thiếu đối chứng ở cột ${i}`);
  let o = 0;
  for (const chay of Object.values(DUONG))
    for (const [k, giu, mat] of DOC) {
      await chay(k, "giu", giu);
      await chay(k, "mat", mat);
      o += 2;
    }
  assert.equal(o, Object.keys(DUONG).length * DOC.length * 2, "số ô đã kiểm khác kích thước bảng");
  assert.equal(o, 72);
});
