// Cách gọi riêng trên Postgres thật (hàng 45: E1, E2, E2b, E3b, E6b, E8, E9). Sàn, người, căn, Lần gửi dựng qua đường
// ghi thật; kết nối chủ chỉ để đếm và đọc dòng cấu hình, nhật ký, sự kiện của hàng. Số mẫu `0900 000 0xx`, tên «[Tên]».
import { thanLanGui } from "@quy-hang/core/sharing";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { appPool, cleanup } from "../helpers";
import { hangCoChu, lenBang, maMoi, sanMoi, send, soMoi, type San } from "../san-thu";

after(cleanup);

const VAI = { tn: { vai: ["team_lead"] }, dc: { vai: ["listing_agent"], khu: ["Toà A"] }, dk: { vai: ["buyer_agent"] } };
const ck = (s: San, k: string) => s.nguoi[k]!.cookie;
const URL_NHAN = "/api/v1/company/labels";

type Bang = {
  fields: { field: string; label: string; default: string; custom: boolean }[];
  values: { field: string; value: string; label: string; default: string; custom: boolean }[];
};
async function doc(s: San, k = "qt"): Promise<Bang> {
  const r = await send("GET", URL_NHAN, undefined, ck(s, k));
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as Bang;
}
const ghi = (s: San, than: unknown, k = "qt") => send("PUT", URL_NHAN, than, ck(s, k));
const truong = (b: Bang, f: string) => b.fields.find((x) => x.field === f)!;
const giaTri = (b: Bang, f: string, v: string) => b.values.find((x) => x.field === f && x.value === v)!;

const dongNhan = async (s: San) =>
  (await appPool.query<{ key: string; value: unknown; data_class: string }>("select key, value, data_class from company_settings where company_id = $1 and key like 'labels.%' order by key", [s.companyId])).rows;
const demSuKien = async (s: San, key: string) =>
  (await appPool.query<{ n: number }>("select count(*)::int n from company_settings_events where company_id = $1 and key = $2", [s.companyId, key])).rows[0]!.n;
const suKienCuoi = async (s: San, key: string) =>
  (await appPool.query<{ value: unknown; actor_user_id: string }>("select value, actor_user_id from company_settings_events where company_id = $1 and key = $2 order by id desc limit 1", [s.companyId, key])).rows[0];

/** Một Lần gửi cho nhóm môi giới qua đường ghi thật của hàng 34; trả mã link. */
async function lanGuiNhom(s: San, listingIds: string[]) {
  const t = thanLanGui({ nguoiNhan: "nhom_moi_gioi", prospectId: null, listingIds });
  assert.ok(t.ok);
  const r = await send("POST", "/api/v1/shares", t.than, ck(s, "dk"));
  assert.equal(r.status, 201, await r.clone().text());
  return ((await r.json()) as { code: string }).code;
}
type ThanCongKhai = { nguoiNhan: string; can: { feeInclusion?: string }[]; tuVung?: { truong: Record<string, string>; giaTri: Record<string, Record<string, string>> } };
async function trangCongKhai(code: string): Promise<ThanCongKhai> {
  const r = await send("GET", `/api/v1/public/shares/${code}`);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as ThanCongKhai;
}
const canBaoPhi = async (s: San) => {
  const id = await hangCoChu(s, "dc", maMoi(s), soMoi(s));
  await lenBang(s, "dc", id); // giá 3,2 tỷ, feeInclusion included
  return id;
};

test("cách gọi: đổi tên trường", async () => {
  const s = await sanMoi(VAI);
  const truoc = await demSuKien(s, "labels.field.feeInclusion");
  const r = await ghi(s, { fields: [{ field: "feeInclusion", label: "Phí CN" }], values: [] });
  assert.equal(r.status, 200, await r.clone().text());
  const b = await doc(s);
  assert.deepEqual(truong(b, "feeInclusion"), { field: "feeInclusion", label: "Phí CN", default: "Điều kiện phí", custom: true });
  // Đối chứng: các trường khác vẫn mặc định.
  assert.deepEqual(b.fields.filter((f) => f.custom).map((f) => f.field), ["feeInclusion"]);
  assert.deepEqual(await dongNhan(s), [{ key: "labels.field.feeInclusion", value: "Phí CN", data_class: "company_internal" }]);
  assert.equal(await demSuKien(s, "labels.field.feeInclusion"), truoc + 1);
  assert.equal((await suKienCuoi(s, "labels.field.feeInclusion"))!.actor_user_id, s.nguoi.qt!.userId);
});

test("cách gọi: trả về mặc định", async () => {
  const s = await sanMoi(VAI);
  await ghi(s, { fields: [{ field: "feeInclusion", label: "Phí CN" }, { field: "legalStatus", label: "Sổ" }], values: [] });
  const [phi0, phap0] = [await demSuKien(s, "labels.field.feeInclusion"), await demSuKien(s, "labels.field.legalStatus")];
  const r = await ghi(s, { fields: [{ field: "legalStatus", label: "Sổ" }], values: [] });
  assert.equal(r.status, 200, await r.clone().text());
  const dong = await dongNhan(s);
  assert.deepEqual(dong.find((d) => d.key === "labels.field.feeInclusion")?.value, null, "trả về mặc định phải ghi null");
  assert.equal(await demSuKien(s, "labels.field.feeInclusion"), phi0 + 1, "không có sự kiện cho lần trả về mặc định");
  const cuoi = await suKienCuoi(s, "labels.field.feeInclusion");
  assert.deepEqual([cuoi!.value, cuoi!.actor_user_id], [null, s.nguoi.qt!.userId]);
  assert.equal(await demSuKien(s, "labels.field.legalStatus"), phap0, "legalStatus không đổi mà vẫn ghi lại");
  const b = await doc(s);
  assert.deepEqual([truong(b, "feeInclusion").label, truong(b, "feeInclusion").custom], ["Điều kiện phí", false]);
  assert.deepEqual([truong(b, "legalStatus").label, truong(b, "legalStatus").custom], ["Sổ", true]);
  // Lưu lại y hệt: 0 sự kiện mới.
  const tong = async () => (await appPool.query<{ n: number }>("select count(*)::int n from company_settings_events where company_id = $1 and key like 'labels.%'", [s.companyId])).rows[0]!.n;
  const t0 = await tong();
  await ghi(s, { fields: [{ field: "legalStatus", label: "Sổ" }], values: [] });
  assert.equal(await tong(), t0);
});

test("cách gọi: gỡ tên riêng đang được căn dùng", async () => {
  const s = await sanMoi(VAI);
  const [a, b] = [await canBaoPhi(s), await canBaoPhi(s)];
  await ghi(s, { fields: [], values: [{ field: "feeInclusion", value: "included", label: "BP" }] });
  const code = await lanGuiNhom(s, [a]);
  const hang = async () =>
    (await appPool.query<{ id: string; fee_inclusion: string; n: number }>(
      "select l.id, l.fee_inclusion, (select count(*)::int from listing_events e where e.listing_id = l.id) n from listings l where l.id = any ($1) order by l.id",
      [[a, b]],
    )).rows;
  const truoc = await hang();
  assert.deepEqual(truoc.map((h) => h.fee_inclusion), ["included", "included"]);
  assert.equal((await trangCongKhai(code)).tuVung?.giaTri.feeInclusion?.included, "BP");
  for (const [nhan, ky] of [["Bao phí SC", "Bao phí SC"], [null, undefined]] as const) {
    const than = nhan ? { fields: [], values: [{ field: "feeInclusion", value: "included", label: nhan }] } : { fields: [], values: [] };
    const r = await ghi(s, than);
    assert.equal(r.status, 200, await r.clone().text());
    assert.deepEqual(await hang(), truoc, `${String(nhan)}: căn đổi dữ liệu hay có thêm sự kiện của hàng`);
    const t = await trangCongKhai(code);
    assert.equal(t.tuVung?.giaTri.feeInclusion?.included, ky);
    assert.equal(t.can[0]!.feeInclusion, "included");
  }
});

test("cách gọi: giá trị riêng có neo", async () => {
  const s = await sanMoi(VAI);
  const r = await ghi(s, { fields: [], values: [{ field: "feeInclusion", value: "included", label: "BP" }] });
  assert.equal(r.status, 200, await r.clone().text());
  assert.deepEqual(giaTri(await doc(s), "feeInclusion", "included"), { field: "feeInclusion", value: "included", label: "BP", default: "Bao phí", custom: true });
  const truoc = (await dongNhan(s)).length;
  const sai = await ghi(s, { fields: [{ field: "legalStatus", label: "Sổ" }], values: [{ field: "feeInclusion", value: "maybe", label: "BP" }] });
  assert.equal(sai.status, 400);
  assert.match(((await sai.json()) as { reason: string }).reason, /^labels\.value\.feeInclusion/);
  assert.equal((await dongNhan(s)).length, truoc, "ghi nửa chừng");
  const thieuNeo = await ghi(s, { fields: [], values: [{ field: "feeInclusion", label: "BP" }] });
  assert.equal(thieuNeo.status, 400);
});

test("cách gọi: nhóm môi giới thấy tên riêng", async () => {
  const s = await sanMoi(VAI);
  const id = await canBaoPhi(s);
  await ghi(s, { fields: [{ field: "feeInclusion", label: "Phí CN" }, { field: "closePrice", label: "Giá chốt riêng" }], values: [{ field: "feeInclusion", value: "included", label: "BP" }, { field: "withdrawnReason", value: "unreachable", label: "MOI-LYDO" }] });
  const t = await trangCongKhai(await lanGuiNhom(s, [id]));
  assert.equal(t.nguoiNhan, "nhom_moi_gioi");
  assert.equal(t.tuVung?.giaTri.feeInclusion?.included, "BP");
  assert.equal(t.tuVung?.truong.feeInclusion, "Phí CN");
  assert.equal(t.can[0]!.feeInclusion, "included");
  assert.ok(!("closePrice" in (t.tuVung?.truong ?? {})), "nhãn giá chốt ra ngoài");
  assert.ok(!JSON.stringify(t).includes("MOI-LYDO"), "nhãn lý do ngừng ra ngoài");
});

test("cách gọi: sàn khác thấy mặc định", async () => {
  const [a, b] = [await sanMoi(VAI), await sanMoi(VAI)];
  await ghi(a, { fields: [{ field: "feeInclusion", label: "Phí CN" }], values: [{ field: "feeInclusion", value: "included", label: "BP" }] });
  const bangB = await doc(b);
  assert.deepEqual([...bangB.fields, ...bangB.values].filter((x) => x.custom), []);
  assert.equal(truong(bangB, "feeInclusion").label, "Điều kiện phí");
  // Đối chứng dương: sàn A thấy tên riêng của mình.
  assert.equal(truong(await doc(a), "feeInclusion").label, "Phí CN");
  const t = await trangCongKhai(await lanGuiNhom(b, [await canBaoPhi(b)]));
  assert.deepEqual(t.tuVung ?? { truong: {}, giaTri: {} }, { truong: {}, giaTri: {} });
});

test("cách gọi: chỉ quản trị ghi, chữ sạch", async () => {
  const s = await sanMoi(VAI);
  const dung = { fields: [{ field: "feeInclusion", label: "Phí CN" }], values: [] };
  // Bảng viết trước: [ai, thân, mã HTTP, số dòng labels.* sau lượt].
  const bang: [string, unknown, number, number][] = [
    ["dc", dung, 403, 0],
    ["tn", dung, 403, 0],
    ["", dung, 401, 0],
    ["qt", { fields: [{ field: "feeInclusion", label: "Gọi 0900 000 001" }], values: [] }, 400, 0],
    ["qt", { fields: [{ field: "feeInclusion", label: "[Tên]@vidu.vn" }], values: [] }, 400, 0],
    ["qt", { fields: [{ field: "feeInclusion", label: "x".repeat(41) }], values: [] }, 400, 0],
    ["qt", dung, 200, 1],
  ];
  let dem = 0;
  for (const [ai, than, ma, soDong] of bang) {
    const r = await send("PUT", URL_NHAN, than, ai ? ck(s, ai) : "");
    assert.equal(r.status, ma, `${ai || "không cookie"}: ${await r.clone().text()}`);
    assert.equal((await dongNhan(s)).length, soDong, `${ai || "không cookie"}: số dòng nhãn`);
    dem++;
  }
  assert.equal(dem, 7);
  // Mọi vai đọc được.
  assert.equal(truong(await doc(s, "dc"), "feeInclusion").label, "Phí CN");
});
