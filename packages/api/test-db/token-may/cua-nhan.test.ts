// Cửa nhận danh mục bằng token máy (hàng 96) — E3, E6, và hai ca Review Focus của kế hoạch.
import { OpenAPIHono } from "@hono/zod-openapi";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { registerFeedRoutes, type FeedHooks } from "../../src/catalog/feeds";
import { appPool, boTin, capToken, choQuaHan, demCan, demNhatKy, deps, doiTrangThai, donDep, dongNhatKy, FEED, giaHan, goi, goiMau, nguon, sanCoToken, sanMoi, themThoaThuan, thuHoi, tin } from "./chung";

after(donDep);

const coMoc = (hooks: FeedHooks) => {
  const a = new OpenAPIHono();
  registerFeedRoutes(a, deps, hooks);
  return a;
};
const docLoi = async (res: Response) => ((await res.json()) as { error: string }).error;

test("đẩy gói bằng token: không phiên, không Origin", async () => {
  const s = await sanMoi("e3");
  await tin(s.companyId);
  // Thoả thuận hợp lệ tạo TRƯỚC: đường phiên sẽ chọn nó, đường token phải dùng đúng thoả thuận gắn token.
  const tao = await themThoaThuan(s.companyId);
  const gan = await themThoaThuan(s.companyId);
  const t = await capToken(s, gan);

  const feed = goiMau("e3");
  const res = await goi("POST", FEED, { bearer: t.token, body: feed });
  assert.equal(res.status, 200, JSON.stringify(await res.clone().json()));
  assert.deepEqual(await res.json(), { subdivisions: 1, buildings: 1, units: 2, created: 2, updated: 0 });
  assert.equal(await demCan(feed.provider), 2);
  const docThoaThuan = async (p: string) => (await appPool.query<{ agreement_id: string }>("select distinct agreement_id from catalog_units where provider = $1", [p])).rows.map((r) => r.agreement_id);
  assert.deepEqual(await docThoaThuan(feed.provider), [gan]);

  // Đối chứng: đường phiên cùng sàn chọn thoả thuận tạo trước.
  const feedPhien = goiMau("e3-phien");
  assert.equal((await goi("POST", FEED, { cookie: s.cookie, body: feedPhien })).status, 200);
  assert.deepEqual(await docThoaThuan(feedPhien.provider), [tao]);
  assert.notEqual(tao, gan);
});

test("đẩy lại không nhân đôi", async () => {
  const s = await sanCoToken("e3-lai");
  const feed = goiMau("e3-lai");
  assert.equal((await goi("POST", FEED, { bearer: s.token, body: feed })).status, 200);
  const soDau = await demCan(feed.provider);
  const lai = await goi("POST", FEED, { bearer: s.token, body: feed });
  assert.equal(lai.status, 200);
  assert.equal(((await lai.json()) as { created: number }).created, 0);
  assert.equal(await demCan(feed.provider), soDau);
});

test("gói sai khuôn", async () => {
  const s = await sanCoToken("e3-sai");
  const feed = { ...goiMau("e3-sai"), schemaVersion: 99 };
  const res = await goi("POST", FEED, { bearer: s.token, body: feed });
  assert.equal(res.status, 422);
  assert.equal(await docLoi(res), "invalid-feed");
  assert.equal(await demCan(feed.provider), 0);
});

test("từ chối lời gọi kế", async () => {
  type O = { ten: string; lam: (s: Awaited<ReturnType<typeof sanCoToken>>) => unknown; status: number; ma: string };
  const maTran: O[] = [
    { ten: "thu hồi", lam: (s) => thuHoi(s, s.agreementId, s.tokenId), status: 401, ma: "invalid-machine-token" },
    { ten: "paused", lam: (s) => doiTrangThai(s.agreementId, "paused"), status: 403, ma: "agreement-inactive" },
    { ten: "ended", lam: (s) => doiTrangThai(s.agreementId, "ended"), status: 403, ma: "agreement-inactive" },
    { ten: "quá hạn", lam: (s) => choQuaHan(s.agreementId), status: 403, ma: "agreement-inactive" },
    { ten: "rời danh sách tin", lam: (s) => boTin(s.companyId), status: 403, ma: "agreement-inactive" },
  ];
  let soLan = 0;
  for (const [i, o] of maTran.entries()) {
    const s = await sanCoToken(`e6-${i}`);
    // Đối chứng dương ngay trước: cùng token, gói khác nguồn.
    assert.equal((await goi("POST", FEED, { bearer: s.token, body: goiMau(`e6-${i}-truoc`) })).status, 200, `${o.ten}: đối chứng`);
    await o.lam(s);
    const feed = goiMau(`e6-${i}-sau`);
    const res = await goi("POST", FEED, { bearer: s.token, body: feed });
    assert.equal(res.status, o.status, o.ten);
    assert.equal(await docLoi(res), o.ma, o.ten);
    assert.equal(await demCan(feed.provider), 0, `${o.ten}: có dòng ghi`);
    soLan += 1;
  }
  assert.equal(soLan, maTran.length);

  const hong = ["qhm_" + "a".repeat(43), "qhm_ngan", "khongphaitoken", "qhm_" + "!".repeat(43)];
  let soHong = 0;
  for (const token of hong) {
    const feed = goiMau(`e6-hong-${soHong}`);
    const res = await goi("POST", FEED, { bearer: token, body: feed });
    assert.equal(res.status, 401, token);
    assert.equal(res.headers.get("www-authenticate"), 'Bearer error="invalid_token"');
    assert.equal(await docLoi(res), "invalid-machine-token", token);
    assert.equal(await demCan(feed.provider), 0);
    soHong += 1;
  }
  assert.equal(soHong, hong.length);
});

test("Bearer hỏng kèm cookie quản trị", async () => {
  const s = await sanCoToken("e6-ck");
  const daThu = await capToken(s, s.agreementId);
  assert.equal((await thuHoi(s, s.agreementId, daThu.id)).status, 204);
  const maTran = [
    { ten: "đã thu hồi", token: daThu.token },
    { ten: "lạ đúng dạng", token: "qhm_" + "b".repeat(43) },
    { ten: "sai dạng", token: "khongphaitoken" },
  ];
  let soLan = 0;
  for (const [i, o] of maTran.entries()) {
    const feed = goiMau(`e6-ck-${i}`);
    const res = await goi("POST", FEED, { bearer: o.token, cookie: s.cookie, body: feed });
    assert.equal(res.status, 401, o.ten);
    assert.equal(await docLoi(res), "invalid-machine-token", o.ten);
    assert.equal(await demCan(feed.provider), 0, `${o.ten}: rơi về phiên`);
    soLan += 1;
  }
  assert.equal(soLan, maTran.length);
  // Đối chứng: cùng cookie, không Bearer thì 200.
  assert.equal((await goi("POST", FEED, { cookie: s.cookie, body: goiMau("e6-ck-dc") })).status, 200);
  // Scheme viết thường vẫn đi đường token: lời gọi sinh một dòng nhật ký.
  const truoc = await demNhatKy(s.tokenId);
  const res = await goi("POST", FEED, { headers: { authorization: `bearer ${s.token}` }, body: goiMau("e6-ck-thuong") });
  assert.equal(res.status, 200);
  assert.equal(await demNhatKy(s.tokenId), truoc + 1);
});

test("mở lại thoả thuận", async () => {
  const maTran = [
    { ten: "paused rồi active", tat: (id: string) => doiTrangThai(id, "paused"), mo: (id: string) => doiTrangThai(id, "active"), status: 200 },
    { ten: "quá hạn rồi gia hạn", tat: (id: string) => choQuaHan(id), mo: (id: string) => giaHan(id), status: 200 },
    { ten: "ended rồi active", tat: (id: string) => doiTrangThai(id, "ended"), mo: (id: string) => doiTrangThai(id, "active"), status: 401 },
  ];
  let soLan = 0;
  for (const [i, o] of maTran.entries()) {
    const s = await sanCoToken(`e6-mo-${i}`);
    await o.tat(s.agreementId);
    await o.mo(s.agreementId);
    const res = await goi("POST", FEED, { bearer: s.token, body: goiMau(`e6-mo-${i}`) });
    assert.equal(res.status, o.status, o.ten);
    soLan += 1;
  }
  assert.equal(soLan, maTran.length);
});

test("tắt giữa lúc kiểm và ghi", async () => {
  const s = await sanCoToken("e6-giua");
  let daChay = false;
  const a = coMoc({
    truocKhiGhi: async () => {
      await doiTrangThai(s.agreementId, "paused");
      daChay = true;
    },
  });
  const feed = goiMau("e6-giua");
  const res = await goi("POST", FEED, { bearer: s.token, body: feed, a });
  assert.ok(daChay, "móc phải chạy");
  assert.equal(res.status, 403);
  assert.equal(await docLoi(res), "agreement-inactive");
  assert.equal(await demCan(feed.provider), 0);
  assert.deepEqual((await dongNhatKy(s.tokenId)).map((r) => r.outcome), ["agreement_inactive"]);
});

test("thu hồi sau bước tra", async () => {
  const s = await sanCoToken("e6-tra");
  const a = coMoc({
    sauKhiTraToken: async () => {
      assert.equal((await thuHoi(s, s.agreementId, s.tokenId)).status, 204);
    },
  });
  const feed = goiMau("e6-tra");
  const res = await goi("POST", FEED, { bearer: s.token, body: feed, a });
  assert.equal(res.status, 401);
  assert.equal(await docLoi(res), "invalid-machine-token");
  assert.equal(await demCan(feed.provider), 0);
  assert.deepEqual((await dongNhatKy(s.tokenId)).map((r) => r.outcome), ["token_revoked"]);
});

test("thu hồi giữa lúc ghi", async () => {
  const s = await sanCoToken("e6-ghi");
  const thuTu: string[] = [];
  let thuHoiXong: Promise<unknown> = Promise.resolve();
  const a = coMoc({
    truocKhiGhi: async () => {
      // Thu hồi phải chờ khoá của lần ghi đang chạy.
      thuHoiXong = appPool
        .query("update machine_tokens set revoked_at = now(), revoked_by = '[Tên]' where id = $1", [s.tokenId])
        .then(() => thuTu.push("thu-hoi-xong"));
      await new Promise((r) => setTimeout(r, 150));
      thuTu.push("ghi-tiep");
    },
  });
  const feed = goiMau("e6-ghi");
  const res = await goi("POST", FEED, { bearer: s.token, body: feed, a });
  thuTu.push("tra-loi");
  assert.equal(res.status, 200, "lần đang chạy phải xong");
  await thuHoiXong;
  assert.ok(thuTu.indexOf("ghi-tiep") < thuTu.indexOf("thu-hoi-xong"), thuTu.join(" → "));
  assert.equal(await demCan(feed.provider), 2);
  const ke = await goi("POST", FEED, { bearer: s.token, body: goiMau("e6-ghi-ke") });
  assert.equal(ke.status, 401);
});

test("scheme khác và Bearer rỗng", async () => {
  const s = await sanCoToken("rf-scheme");
  // Basic đi đường phiên như cũ.
  const khongCookie = await goi("POST", FEED, { headers: { authorization: "Basic YWJj" }, body: goiMau("rf-basic-1") });
  assert.equal(khongCookie.status, 401);
  assert.equal(await docLoi(khongCookie), "unauthenticated");
  assert.equal((await goi("POST", FEED, { cookie: s.cookie, headers: { authorization: "Basic YWJj" }, body: goiMau("rf-basic-2") })).status, 200);
  // Bearer không giá trị đi đường token: 401, không rơi về cookie.
  const feed = goiMau("rf-rong");
  const rong = await goi("POST", FEED, { cookie: s.cookie, headers: { authorization: "Bearer" }, body: feed });
  assert.equal(rong.status, 401);
  assert.equal(await docLoi(rong), "invalid-machine-token");
  assert.equal(await demCan(nguon("rf-rong")), 0);
});

test("thân hỏng có token", async () => {
  const s = await sanCoToken("rf-than");
  const res = await goi("POST", FEED, { bearer: s.token, raw: "không phải json" });
  assert.equal(res.status, 422);
  assert.equal(await docLoi(res), "invalid-feed");
  const dong = await dongNhatKy(s.tokenId);
  assert.deepEqual(dong.map((r) => [r.outcome, r.http_status]), [["invalid_payload", 422]]);
});
