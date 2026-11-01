// Hàng tạo từ lead chưa ghi chủ nhà (hàng va-lien-he: AC-2): lối chủ nhà báo «chưa có chủ nhà», không trả tên trống.
// Người, lead qua đường ghi thật; số là số mẫu `0900 000 0xx`.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { appPool, cleanup } from "./helpers";
import { hangCoChu, hangTuLead, lenBang, nam, nhap, nhip, sanMoi, send, soMoi } from "./san-thu";

after(cleanup);

const VAI = { ts: { vai: ["telesales"] }, tn: { vai: ["team_lead"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] } };

test("chủ nhà của hàng tạo từ lead: chưa có tên thì báo chưa có chủ nhà", async () => {
  const s = await sanMoi(VAI);
  const lead = (await nhap(s, nam(soMoi(s), "Toà A", "A-09.01"))).id;
  await nhip(new Date(), s);
  const hang = await hangTuLead(s, "dc1", lead);
  await lenBang(s, "dc1", hang); // trưởng nhóm chỉ thấy hàng đã lên Bảng hàng
  const goi = (k: string, cach: "GET" | "POST", duong: string) => send(cach, `/api/v1/listings/${hang}/owner${duong}`, undefined, s.nguoi[k]!.cookie);
  // [dòng, người, cách gọi, đường] → 404 owner-not-set
  const BANG: [string, string, "GET" | "POST", string][] = [
    ["đầu chủ GET owner", "dc1", "GET", ""],
    ["trưởng nhóm GET owner", "tn", "GET", ""],
    ["đầu chủ POST phone-reveal", "dc1", "POST", "/phone-reveal"],
    ["trưởng nhóm POST phone-reveal", "tn", "POST", "/phone-reveal"],
  ];
  let so = 0;
  for (const [ten, k, cach, duong] of BANG) {
    const r = await goi(k, cach, duong);
    const than = (await r.json()) as { error?: string };
    assert.deepEqual([r.status, than.error ?? null], [404, "owner-not-set"], `dòng «${ten}»`);
    so++;
  }
  assert.equal(so, BANG.length);
  // Ghi chủ nhà có tên rồi đọc lại: đúng tên, liên hệ của lead vẫn gắn chủ nhà.
  const ghi = await send("PUT", `/api/v1/listings/${hang}/owner`, { ownerName: "[Tên]" }, s.nguoi.dc1!.cookie);
  assert.equal(ghi.status, 200, await ghi.clone().text());
  const doc = await goi("dc1", "GET", "");
  assert.equal(doc.status, 200);
  assert.equal(((await doc.json()) as { ownerName: string }).ownerName, "[Tên]");
  const lien = (await appPool.query<{ a: string | null; b: string | null }>(
    "select (select contact_id from listing_owners where listing_id = $1) a, (select contact_id from leads where id = $2) b",
    [hang, lead],
  )).rows[0]!;
  assert.ok(lien.b, "lead chưa gắn liên hệ");
  assert.equal(lien.a, lien.b, "chủ nhà của hàng không còn là liên hệ của lead");
  // Đối chứng: hàng tạo thường có chủ nhà đọc ra 200 với tên.
  const thuong = await hangCoChu(s, "dc1", "A-09.02", soMoi(s));
  const r = await send("GET", `/api/v1/listings/${thuong}/owner`, undefined, s.nguoi.dc1!.cookie);
  assert.equal(r.status, 200);
  assert.equal(((await r.json()) as { ownerName: string }).ownerName, "[Tên]");
});
