// Nhật ký lời gọi bằng token (hàng 96) — E7, E9.
import { OpenAPIHono } from "@hono/zod-openapi";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { after, test } from "node:test";
import { registerFeedRoutes, type FeedHooks } from "../../src/catalog/feeds";
import { app, appPool, BASE_URL, capToken, demCan, deps, doiTrangThai, donDep, dongNhatKy, FEED, goi, goiMau, sanCoToken, sanMoi, themThoaThuan, thuHoi, tin } from "./chung";

after(donDep);

const coMoc = (hooks: FeedHooks) => {
  const a = new OpenAPIHono();
  registerFeedRoutes(a, deps, hooks);
  return a;
};
const tongDong = async () => Number((await appPool.query<{ n: string }>("select count(*) n from machine_token_calls")).rows[0]!.n);
const loiThu = async () => {
  throw new Error("lỗi thử của móc");
};

/** Tắt `console.error` của lỗi thử để đầu ra của bộ kiểm dễ đọc. */
async function imConsole<T>(fn: () => Promise<T>): Promise<T> {
  const goc = console.error;
  console.error = () => {};
  try {
    return await fn();
  } finally {
    console.error = goc;
  }
}

test("nhật ký: một lời gọi một dòng", async () => {
  type S = Awaited<ReturnType<typeof sanCoToken>>;
  type O = { outcome: string; status: number; chuanBi?: (s: S) => unknown; than?: unknown; a?: OpenAPIHono };
  const maTran: O[] = [
    { outcome: "accepted", status: 200 },
    { outcome: "invalid_payload", status: 422, than: { schemaVersion: 99 } },
    { outcome: "wrong_connection", status: 403, chuanBi: (s) => appPool.query("update agreements set direction = 'outbound' where id = $1", [s.agreementId]) },
    { outcome: "agreement_inactive", status: 403, chuanBi: (s) => doiTrangThai(s.agreementId, "paused") },
    { outcome: "token_revoked", status: 401, chuanBi: (s) => thuHoi(s, s.agreementId, s.tokenId) },
    { outcome: "server_error", status: 500, a: coMoc({ truocKhiGhi: loiThu }) },
  ];
  const truoc = await tongDong();
  let soLoi = 0;
  for (const [i, o] of maTran.entries()) {
    const s = await sanCoToken(`e7-${i}`);
    await o.chuanBi?.(s);
    const res = await imConsole(async () => goi("POST", FEED, { bearer: s.token, body: o.than ?? goiMau(`e7-${i}`), ...(o.a ? { a: o.a } : {}) }));
    assert.equal(res.status, o.status, o.outcome);
    const dong = await dongNhatKy(s.tokenId);
    assert.equal(dong.length, 1, `${o.outcome}: số dòng`);
    const d = dong[0]!;
    assert.deepEqual(
      [d.outcome, d.http_status, d.token_id, d.agreement_id, d.company_id, d.method, d.route],
      [o.outcome, o.status, s.tokenId, s.agreementId, s.companyId, "POST", "/api/v1/catalog/feeds"],
    );
    soLoi += 1;
  }
  assert.equal(soLoi, 6);
  assert.equal((await tongDong()) - truoc, maTran.length, "số dòng tăng phải bằng số lời gọi");
});

test("lỗi ngay sau bước tra token cũng có một dòng", async () => {
  const s = await sanCoToken("e7-sau-tra");
  const a = coMoc({ sauKhiTraToken: loiThu });
  const feed = goiMau("e7-sau-tra");
  const res = await imConsole(async () => goi("POST", FEED, { bearer: s.token, body: feed, a }));
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { error: "internal-error" });
  assert.deepEqual((await dongNhatKy(s.tokenId)).map((r) => [r.outcome, r.http_status]), [["server_error", 500]]);
  assert.equal(await demCan(feed.provider), 0);
});

test("token lạ không sinh dòng", async () => {
  const truoc = await tongDong();
  const res = await goi("POST", FEED, { bearer: "qhm_" + "c".repeat(43), body: goiMau("e7-la") });
  assert.equal(res.status, 401);
  assert.equal(await tongDong(), truoc);
  // Đối chứng: token thật sinh một dòng.
  const s = await sanCoToken("e7-la-dc");
  assert.equal((await goi("POST", FEED, { bearer: s.token, body: goiMau("e7-la-dc") })).status, 200);
  assert.equal(await tongDong(), truoc + 1);
});

test("ghi nhật ký lỗi thì gói không vào", async () => {
  const s = await sanCoToken("e7-loi");
  const a = coMoc({ truocGhiNhatKy: async (o) => { if (o === "accepted") await loiThu(); } });
  const feed = goiMau("e7-loi");
  const res = await imConsole(async () => goi("POST", FEED, { bearer: s.token, body: feed, a }));
  assert.ok(res.status >= 500, `nhận ${res.status}`);
  assert.equal(await demCan(feed.provider), 0);
});

test("ghi nhật ký từ chối lỗi thì vẫn trả mã từ chối", async () => {
  const s = await sanCoToken("e7-tc");
  await doiTrangThai(s.agreementId, "paused");
  const a = coMoc({ truocGhiNhatKy: loiThu });
  const res = await imConsole(async () => goi("POST", FEED, { bearer: s.token, body: goiMau("e7-tc"), a }));
  assert.equal(res.status, 403);
  assert.deepEqual(await res.json(), { error: "agreement-inactive" });
});

test("token không vào console", async () => {
  const CAC = ["log", "info", "warn", "error"] as const;
  const goc = Object.fromEntries(CAC.map((k) => [k, console[k]])) as Record<(typeof CAC)[number], (...a: unknown[]) => void>;
  const ghi: string[] = [];
  for (const k of CAC) console[k] = (...a: unknown[]) => void ghi.push(a.map(String).join(" "));
  const quet = (chuoi: string[]) => ghi.filter((d) => chuoi.some((x) => d.includes(x)));
  let token = "";
  let bam = "";
  try {
    const s = await sanMoi("e9");
    await tin(s.companyId);
    const id = await themThoaThuan(s.companyId);
    const t = await capToken(s, id);
    token = t.token;
    bam = createHash("sha256").update(token).digest("hex");
    assert.equal((await goi("POST", FEED, { bearer: token, body: goiMau("e9") })).status, 200);
    assert.equal((await goi("POST", FEED, { bearer: token, body: { schemaVersion: 99 } })).status, 422);
    assert.equal((await goi("POST", FEED, { bearer: token, body: goiMau("e9-5"), a: coMoc({ truocKhiGhi: loiThu }) })).status, 500);
    await doiTrangThai(id, "paused");
    assert.equal((await goi("POST", FEED, { bearer: token, body: goiMau("e9-p") })).status, 403);
    await doiTrangThai(id, "active");
    assert.equal((await thuHoi(s, id, t.id)).status, 204);
    assert.equal((await goi("POST", FEED, { bearer: token, body: goiMau("e9-r") })).status, 401);
    assert.deepEqual(quet([token, bam]), [], "console chứa token rõ hay băm");
    // Đối chứng dương: phép quét thấy chuỗi khi cố tình log token.
    console.error("bản thử", token);
    assert.equal(quet([token]).length, 1);
  } finally {
    for (const k of CAC) console[k] = goc[k];
  }
});

test("OpenAPI khai đường token", async () => {
  const doc = (await (await app.request(`${BASE_URL}/api/v1/openapi.json`)).json()) as {
    components: { securitySchemes: Record<string, { type: string; scheme: string }> };
    paths: Record<string, { post: { security: Record<string, unknown>[]; responses: Record<string, unknown> } }>;
  };
  assert.deepEqual(doc.components.securitySchemes.machineToken, { type: "http", scheme: "bearer" });
  const post = doc.paths[FEED]!.post;
  assert.ok(post.security.some((s) => "machineToken" in s), "cửa nhận phải tham chiếu scheme token");
  for (const ma of ["401", "403"]) assert.ok(post.responses[ma], `thiếu mã ${ma}`);
});
