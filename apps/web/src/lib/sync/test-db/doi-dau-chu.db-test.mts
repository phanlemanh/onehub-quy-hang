// Đổi đầu chủ hàng loạt qua bộ đồng bộ tới API thật (hàng 89, E4c): bộ đồng bộ của trưởng nhóm đã kéo 5 căn của đầu chủ D1;
// đổi sang D2 bằng lệnh API; một lần kéo nữa (không dựng lại kho) đưa listAgentKey = D2 về đúng 5 căn trên máy — cột đầu chủ
// đổi mà không tải lại trang. Chiều đỏ: không kéo lại sau khi đổi thì kho trên máy vẫn D1. Cần DATABASE_URL tới Postgres dãy.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { taoBoDongBo } from "../dong-bo";
import { taoKhoBoNho } from "../kho";
import { goiCua, H, nguoi, sanMoi, taoCan } from "./ha-tang.mjs";

after(H.cleanup);

test("E4c sau khi đổi đầu chủ, một lần kéo đưa đầu chủ mới về kho trên máy", async () => {
  const A = await sanMoi("ddc");
  const tn = await nguoi("ddc-tn", [{ companyId: A.companyId, vai: ["team_lead"] }]);
  const d1 = await nguoi("ddc-d1", [{ companyId: A.companyId, vai: ["listing_agent"] }]);
  const d2 = await nguoi("ddc-d2", [{ companyId: A.companyId, vai: ["listing_agent"] }]);
  // Năm căn của một chủ nhà, đầu chủ D1 tạo (người tạo hàng là đầu chủ đầu tiên), cùng một liên hệ chủ nhà.
  const can: string[] = [];
  // Căn đang bán (nấc Cả sàn) để trưởng nhóm đọc được trên bảng.
  for (let i = 0; i < 5; i++) can.push(await taoCan(d1, true));
  const { rows } = await H.appPool.query<{ id: string }>("insert into contacts (company_id, contact_types, owner_member_user_id, created_by) values ($1, '{Seller}', $2, 'x') returning id", [A.companyId, d1.userId]);
  for (const l of can) {
    await H.appPool.query(
      "insert into listing_owners (company_id, listing_id, owner_name, updated_by, contact_id) values ($1, $2, '[Tên]', 'x', $3) on conflict (company_id, listing_id) do update set contact_id = excluded.contact_id",
      [A.companyId, l, rows[0]!.id],
    );
    await H.appPool.query("insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) select $1, $2, 1, $3, 'x' where not exists (select 1 from listing_agent_assignments where listing_id = $2)", [A.companyId, l, d1.userId]);
  }
  const c = goiCua(tn, () => A.companyId);
  const bd = taoBoDongBo({ goi: c.goi, kho: taoKhoBoNho(tn.userId, new Map()), me: { userId: tn.userId, roles: ["team_lead"] }, companyId: A.companyId, nhip: false });
  await bd.khoiDong();
  const dauChu = () => can.map((id) => bd.danhSach().find((l) => l.id === id)?.listAgentKey ?? null);
  assert.deepEqual(dauChu(), can.map(() => d1.userId), "đối chứng: kho trên máy đã kéo D1");

  const r = await tn.goi("POST", "/api/v1/listings/agent-reassignments", { listingIds: [can[0]], userId: d2.userId });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.deepEqual(dauChu(), can.map(() => d1.userId), "chiều đỏ: chưa kéo lại thì kho trên máy vẫn D1");
  await bd.thuNgay();
  const lech = can.filter((id, i) => dauChu()[i] !== d2.userId);
  assert.deepEqual(lech, [], `căn chưa sang D2 trên máy: ${lech.join(", ")}`);
});
