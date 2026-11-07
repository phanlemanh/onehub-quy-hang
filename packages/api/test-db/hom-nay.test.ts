// Hôm nay của đầu chủ qua API trên Postgres thật (hàng 22: AC-3..AC-6). Người theo nếp sàn thử của hàng 27; hàng và lead
// qua đường ghi thật. Số chủ là số mẫu `0900 000 0xx`, tên chủ `[Tên]`.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { findSourceLeaks } from "@quy-hang/core/access";
import { boMacDinh, type BoNhom } from "@quy-hang/core/today";
import { appPool, cleanup } from "./helpers";
import { hangCoChu, lenBang, nam, nhap, nhip, sanMoi, send, soMoi, type San } from "./san-thu";

after(cleanup);

const QUEUE = "/api/v1/company/settings/queue";
type QueueBody = { groups: BoNhom; source: string; errors: string[] };
const docBo = async (s: San, k = "qt") => {
  const r = await send("GET", QUEUE, undefined, s.nguoi[k]!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as QueueBody;
};
/** Ghi thẳng một dòng `company_settings` bằng kết nối chủ — như dữ liệu cũ hay bị sửa tay. */
const ghiThang = (s: San, key: string, value: unknown) =>
  appPool.query(
    `insert into company_settings (company_id, key, value, updated_by) values ($1, $2, $3::jsonb, $4)
     on conflict (company_id, key) do update set value = excluded.value`,
    [s.companyId, key, JSON.stringify(value), s.nguoi.qt!.userId],
  );

/** Bộ của sàn hợp lệ: tắt Thiếu thông tin, đổi tên Cần gọi lại, Mới đổi lên trước. */
function boCuaSan(): BoNhom {
  const bo = boMacDinh();
  const goiLai = bo.find((n) => n.code === "call_back")!;
  const moiDoi = bo.find((n) => n.code === "recent_change")!;
  return [
    bo[0]!,
    bo[1]!,
    moiDoi,
    { ...goiLai, label: "Gọi xác nhận" },
    { ...bo.find((n) => n.code === "missing_info")!, enabled: false },
  ];
}

// ---- AC-3 (E3b) ----
test("settings/queue: đọc bộ của sàn", async () => {
  const a = await sanMoi({ dc: { vai: ["listing_agent"] } });
  const b = await sanMoi({ dc: { vai: ["listing_agent"] } });
  const truoc = await docBo(a, "dc");
  assert.deepEqual([truoc.source, truoc.groups.length, truoc.errors], ["default", 6, []]);
  assert.deepEqual(truoc.groups, boMacDinh());

  const bo = boCuaSan();
  await ghiThang(a, "queue.groups", bo);
  const sau = await docBo(a, "dc");
  assert.deepEqual([sau.source, sau.errors], ["company", []]);
  assert.deepEqual(sau.groups, bo);
  // Sàn khác cùng lúc vẫn bộ mặc định.
  const khac = await docBo(b, "dc");
  assert.deepEqual([khac.source, khac.groups], ["default", boMacDinh()]);

  assert.equal((await send("GET", QUEUE)).status, 401);
});

// ---- AC-4 (E4b) ----
test("settings/queue: ghi bộ nhóm", async () => {
  const s = await sanMoi({ dc: { vai: ["listing_agent"] }, tn: { vai: ["team_lead"] } });
  const ghi = (body: unknown, k = "qt") => send("PUT", QUEUE, body, s.nguoi[k]!.cookie);

  const bo = boCuaSan();
  const r = await ghi({ groups: bo });
  assert.equal(r.status, 200, await r.clone().text());
  assert.deepEqual(await r.json(), { groups: bo, source: "company", errors: [] });
  const daLuu = await docBo(s, "dc");
  assert.deepEqual([daLuu.source, daLuu.groups], ["company", bo]);

  // Ghi sai: 400 nêu chỗ sai, bộ cũ giữ nguyên.
  const sua = (f: (b: BoNhom) => unknown) => f(structuredClone(bo));
  const SAI: [string, unknown, string][] = [
    ["hành động auto_dial", sua((b) => ((b[1]!.actions as string[]).push("auto_dial"), b)), "actions"],
    ["nhóm căn mang accept", sua((b) => ((b[1]!.actions as string[]).push("accept"), b)), "subject"],
    [
      "loại hình Nhà phố",
      sua((b) => [...b, { code: "town_house", label: "Nhà phố", subject: "listing", enabled: true, conditions: [{ kind: "property_sub_type_in", in: ["Nhà phố"] }], actions: ["open_record"] }]),
      "property_sub_type_in",
    ],
  ];
  for (const [ten, groups, cho] of SAI) {
    const res = await ghi({ groups });
    assert.equal(res.status, 400, ten);
    const than = (await res.json()) as { error: string; details: { path: string; reason: string }[] };
    assert.equal(than.error, "invalid-settings", ten);
    assert.ok(than.details.length > 0 && than.details.every((d) => d.path === "groups"), ten);
    assert.ok(than.details.some((d) => d.reason.includes(cho)), `${ten}: ${JSON.stringify(than.details)}`);
    assert.deepEqual(await docBo(s, "dc"), daLuu, `${ten}: bộ cũ giữ nguyên`);
  }

  // Không phải quản trị sàn: 403, không ghi.
  for (const k of ["dc", "tn"]) assert.equal((await ghi({ groups: boMacDinh() }, k)).status, 403, k);
  assert.deepEqual(await docBo(s), daLuu);
  assert.equal((await send("PUT", QUEUE, { groups: bo })).status, 401);

  // Bộ hỏng nằm sẵn trong cơ sở dữ liệu: đọc về mặc định kèm lỗi.
  await ghiThang(s, "queue.groups", sua((b) => ((b[1]!.actions as string[]).push("auto_dial"), b)));
  const hong = await docBo(s, "dc");
  assert.equal(hong.source, "default");
  assert.deepEqual(hong.groups, boMacDinh());
  assert.ok(hong.errors.some((e) => e.includes("actions")), JSON.stringify(hong.errors));
});

// ---- AC-5 (E5) ----
type HangView = Record<string, unknown> & { id: string };
test("listings: người giữ và mốc đổi", async () => {
  const s = await sanMoi({ a: { vai: ["listing_agent"] }, b: { vai: ["team_lead"] } });
  const A = s.nguoi.a!;
  const B = s.nguoi.b!;
  const lenh = async (k: string, id: string, type: string, payload: object) => {
    const v = (await appPool.query<{ version: number }>("select version from listings where id = $1", [id])).rows[0]!.version;
    const r = await send("POST", `/api/v1/listings/${id}/events`, { type, payload, expectedVersion: v }, s.nguoi[k]!.cookie);
    assert.equal(r.status, 200, await r.clone().text());
  };
  const tao = async (can: string) => {
    const r = await send("POST", "/api/v1/listings", { buildingName: "Toà A", unitNumber: can }, A.cookie);
    assert.equal(r.status, 201, await r.clone().text());
    return ((await r.json()) as { id: string }).id;
  };

  // H1: A tạo và đưa lên bảng (giá đầu 3,2 tỷ) để trưởng nhóm thấy; trưởng nhóm gán A, đổi giá; A đổi trạng thái.
  const h1 = await tao("A-01.01");
  await lenBang(s, "a", h1);
  const gan = await send("PUT", `/api/v1/listings/${h1}/listing-agent`, { userId: A.userId }, B.cookie);
  assert.equal(gan.status, 200, await gan.clone().text());
  await lenh("b", h1, "price_changed", { listPrice: 3_000_000_000, feeInclusion: "included" });
  await lenh("a", h1, "status_changed", { to: "Hold" });
  const h2 = await tao("A-02.02");

  const suKien = async (type: string) =>
    (
      await appPool.query<{ occurred_at: Date }>(
        "select occurred_at from listing_events where listing_id = $1 and type = $2 order by seq desc limit 1",
        [h1, type],
      )
    ).rows[0]!.occurred_at.toISOString();
  const mocGia = await suKien("price_changed");
  const mocTrangThai = await suKien("status_changed");
  const mocTao = await suKien("created");
  assert.notEqual(mocGia, mocTao);

  const r = await send("GET", "/api/v1/listings", undefined, A.cookie);
  assert.equal(r.status, 200);
  const ds = (await r.json()) as HangView[];
  const v1 = ds.find((h) => h.id === h1)!;
  const v2 = ds.find((h) => h.id === h2)!;
  assert.ok(v1 && v2);

  assert.equal(v1.listAgentKey, A.userId);
  assert.equal(v1.priceChangeTimestamp, mocGia);
  assert.equal(v1.statusChangeTimestamp, mocTrangThai);
  const gia = v1.lastPriceChange as { at: string; byUserId: string; byRoles: string[]; from: unknown; to: unknown };
  assert.deepEqual([gia.at, gia.byUserId, gia.from, gia.to], [mocGia, B.userId, 3_200_000_000, 3_000_000_000]);
  assert.ok(gia.byRoles.includes("team_lead"), JSON.stringify(gia.byRoles));
  const tt = v1.lastStatusChange as { at: string; byUserId: string; byRoles: string[]; from: unknown; to: unknown };
  assert.deepEqual([tt.at, tt.byUserId, tt.from, tt.to], [mocTrangThai, A.userId, "Active", "Hold"]);
  assert.ok(tt.byRoles.includes("listing_agent"));

  for (const k of ["listAgentKey", "priceChangeTimestamp", "statusChangeTimestamp", "lastPriceChange", "lastStatusChange"]) {
    assert.ok(k in v2, k);
    assert.equal(v2[k], null, `H2.${k}`);
  }
  assert.deepEqual(findSourceLeaks(ds), []);

  // Bản một hàng mang cùng năm trường.
  const mot = (await (await send("GET", `/api/v1/listings/${h1}`, undefined, A.cookie)).json()) as HangView;
  for (const k of ["listAgentKey", "priceChangeTimestamp", "statusChangeTimestamp", "lastPriceChange", "lastStatusChange"]) {
    assert.deepEqual(mot[k], v1[k], `/{id}.${k}`);
  }
  assert.deepEqual(findSourceLeaks(mot), []);
});

// ---- AC-6 (E6) ----
type LeadView = Record<string, unknown> & { id: string; stage: string };
const ASSIGNED_KEYS = ["id", "buildingName", "unitNumber", "need", "priceText", "createdAt", "stage", "acceptedAt", "acceptDueAt", "callDueAt"];

test("leads/assigned: chỉ lead giao cho tôi đang chờ gọi", async () => {
  const VAI = {
    ts: { vai: ["telesales"] },
    a: { vai: ["listing_agent"], khu: ["Toà A"] },
    b: { vai: ["listing_agent"], khu: ["Toà B"] },
  };
  const s = await sanMoi(VAI);
  const khac = await sanMoi(VAI, 80);
  const ghi = async (id: string, duoi: string, k = "a") => {
    const r = await send("POST", `/api/v1/leads/${id}/${duoi}`, undefined, s.nguoi[k]!.cookie);
    assert.equal(r.status, 200, await r.clone().text());
  };
  const leadVe = async (san: San, toa: string) => (await nhap(san, nam(soMoi(san), toa))).id;

  const daGui = await leadVe(s, "Toà A");
  const daNhan = await leadVe(s, "Toà A");
  const daGoi = await leadVe(s, "Toà A");
  const traLai = await leadVe(s, "Toà A");
  const cuaB = await leadVe(s, "Toà B");
  const sanKhac = await leadVe(khac, "Toà A");
  await nhip(new Date(), s, khac);
  await ghi(daNhan, "accept");
  await ghi(daGoi, "first-call");
  await ghi(traLai, "return");
  // Lead căn trùng về A (A giữ căn đang mở), rồi telesales bỏ.
  await hangCoChu(s, "a", "A-09.09", soMoi(s));
  const daBo = (await nhap(s, nam(soMoi(s), "Toà A", "A-09.09"))).id;
  const bo = await send("POST", `/api/v1/leads/${daBo}/discard`, undefined, s.nguoi.ts!.cookie);
  assert.equal(bo.status, 200, await bo.clone().text());

  const lay = async (san: San, k: string) => {
    const r = await send("GET", "/api/v1/leads/assigned", undefined, san.nguoi[k]!.cookie);
    assert.equal(r.status, 200, `${k}: ${await r.clone().text()}`);
    return (await r.json()) as LeadView[];
  };
  const dsA = await lay(s, "a");
  assert.deepEqual(new Set(dsA.map((l) => l.id)), new Set([daGui, daNhan]));
  assert.deepEqual(Object.fromEntries(dsA.map((l) => [l.id, l.stage])), { [daGui]: "sent", [daNhan]: "accepted" });
  const { rows } = await appPool.query<{ id: string; created_at: Date; routed_at: Date; accept_minutes: number; first_call_minutes: number; accepted_at: Date | null }>(
    "select id, created_at, routed_at, accept_minutes, first_call_minutes, accepted_at from leads where id = any ($1)",
    [[daGui, daNhan]],
  );
  for (const l of dsA) {
    assert.deepEqual(Object.keys(l), ASSIGNED_KEYS);
    for (const k of Object.keys(l)) assert.ok(!/phone/i.test(k), k);
    const d = rows.find((x) => x.id === l.id)!;
    assert.deepEqual(
      [l.buildingName, l.unitNumber, l.need, l.priceText, l.createdAt, l.acceptedAt],
      ["Toà A", null, "sale", "3,2 tỷ, đã bao phí", d.created_at.toISOString(), d.accepted_at?.toISOString() ?? null],
    );
    assert.equal(l.acceptDueAt, new Date(d.routed_at.getTime() + d.accept_minutes * 60_000).toISOString());
    assert.equal(l.callDueAt, new Date(d.routed_at.getTime() + d.first_call_minutes * 60_000).toISOString());
  }
  assert.deepEqual(findSourceLeaks(dsA), []);

  assert.deepEqual((await lay(s, "b")).map((l) => l.id), [cuaB]);
  assert.deepEqual((await lay(khac, "a")).map((l) => l.id), [sanKhac]);

  // Người hai vai nhận lead giao cho mình; telesales không vai Đầu chủ nhận 403.
  // Lead người hai vai tự nhập, về đầu chủ khác: luật đọc của bảng cho người nhập đọc — lối này vẫn không trả.
  const hai = await sanMoi({ ts: { vai: ["telesales"] }, x: { vai: ["listing_agent", "telesales"], khu: ["Toà A"] }, y: { vai: ["listing_agent"], khu: ["Toà B"] } }, 70);
  const cuaX = await leadVe(hai, "Toà A");
  const xNhapChoY = (await nhap(hai, nam(soMoi(hai), "Toà B"), "x")).id;
  await nhip(new Date(), hai);
  assert.deepEqual((await lay(hai, "x")).map((l) => l.id), [cuaX]);
  assert.deepEqual((await lay(hai, "y")).map((l) => l.id), [xNhapChoY]);
  const cam = await send("GET", "/api/v1/leads/assigned", undefined, s.nguoi.ts!.cookie);
  assert.deepEqual([cam.status, ((await cam.json()) as { error: string }).error], [403, "listing-agent-required"]);
  assert.equal((await send("GET", "/api/v1/leads/assigned")).status, 401);
});
