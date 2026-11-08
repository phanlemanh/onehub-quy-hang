// Căn nhập vào Hôm nay của người giữ (hàng can-nhap-len-bang-chung, E7; AC-7 sửa lời 08/11: «Thiếu thông tin» khi file có
// ngày xác nhận, «Cần gọi lại» khi không): trên API thật, Hôm nay dựng bằng đúng
// đường màn dùng — bộ đồng bộ kéo bản xem hàng, bộ nhóm đọc ở /company/settings/queue, dữ kiện căn qua `canHomNay`, chia
// bằng `chiaNhom` của lõi. Không lắp dữ kiện tay. Tên `[Tên]`.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { after, test } from "node:test";
import { planFromDictionary, readTable, type Cell } from "@quy-hang/core/import";
import { chiaNhom, type BoNhom } from "@quy-hang/core/today";
import { canHomNay } from "../../../app/(app)/today/ly-do";
import { taoBoDongBo } from "../dong-bo";
import { taoKhoBoNho } from "../kho";
import { goiCua, H, nguoi, sanMoi, taoCan, type Nguoi } from "./ha-tang.mjs";

after(H.cleanup);

const TIEU_DE = ["Toà", "Mã căn", "Giá", "Phí", "Tình trạng", "Ngày xác nhận"];
/** Dòng «Đang bán» thiếu pháp lý, tình trạng sử dụng; `coNgay` = file ghi ngày xác nhận hôm nay. */
const dong = (ma: string, coNgay: boolean): Cell[] => [ma.startsWith("B") ? "Toà B" : "Toà A", ma, "3,5 tỷ", "bao phí", "Đang bán", coNgay ? new Date().toLocaleDateString("vi-VN") : null];
let soTep = 0;

/** Một lần nhập của `n`, mỗi dòng một mã căn «Đang bán»; `giao` = đầu chủ giữ căn khi Trưởng nhóm nhập hộ. Trả mã căn theo dòng. */
async function nhap(n: Nguoi, companyId: string, ma: string[], giao?: string, coNgay = true): Promise<string[]> {
  const bang = readTable([TIEU_DE, ...ma.map((m) => dong(m, coNgay))]);
  const mo = await n.goi(
    "POST",
    "/api/v1/imports",
    {
      fileName: `[Tệp cn-web ${++soTep}].xlsx`,
      fileHash: createHash("sha256").update(`${H.RUN}-cn-web-${soTep}`).digest("hex"),
      fileKind: "xlsx",
      headers: bang.headers,
      headerRow: 0,
      plan: planFromDictionary(bang),
      units: ma.map((m, i) => ({ row: i + 2, buildingName: m.startsWith("B") ? "Toà B" : "Toà A", unitNumber: m })),
    },
    companyId,
  );
  assert.equal(mo.status, 201, JSON.stringify(mo.body));
  const rows = ma.map((m, i) => ({ row: i + 2, cells: dong(m, coNgay), ...(giao && { agentUserId: giao }) }));
  const ghi = await n.goi("POST", `/api/v1/imports/${mo.body.id}/rows`, { dryRun: false, rows }, companyId);
  assert.equal(ghi.status, 200, JSON.stringify(ghi.body));
  return (ghi.body.rows as { listingId: string; reason: string }[]).map((r) => r.listingId);
}

/** Hôm nay của `n` qua đường màn dùng: mã nhóm → mã căn. */
async function homNay(n: Nguoi, companyId: string): Promise<Map<string, string[]>> {
  const c = goiCua(n, () => companyId);
  const bd = taoBoDongBo({ goi: c.goi, kho: taoKhoBoNho(n.userId, new Map()), me: { userId: n.userId, roles: [] }, companyId, nhip: false });
  await bd.khoiDong();
  const bo = await n.goi("GET", "/api/v1/company/settings/queue", undefined, companyId);
  assert.equal(bo.status, 200, JSON.stringify(bo.body));
  const idx = new Map() as never;
  const nhom = chiaNhom(bo.body.groups as BoNhom, bd.danhSach().map((l) => canHomNay(l, idx)), n.userId, new Date().toISOString());
  bd.dung();
  return new Map(nhom.map((g) => [g.nhom.code, g.cans.map((x) => x.id)]));
}

test("căn nhập vào Thiếu thông tin của người giữ (can-nhap-len-bang-chung E7)", async () => {
  const S = await sanMoi("cn-web");
  const A = await nguoi("cn-a", [{ companyId: S.companyId, vai: ["listing_agent"] }]);
  const B = await nguoi("cn-b", [{ companyId: S.companyId, vai: ["listing_agent"] }]);
  const TN = await nguoi("cn-tn", [{ companyId: S.companyId, vai: ["team_lead"] }]);
  const [X] = await nhap(A, S.companyId, ["A-01.01"]);
  const [Y] = await nhap(TN, S.companyId, ["A-01.02"], B.userId);
  const xem = await A.goi("GET", `/api/v1/listings/${X}`, undefined, S.companyId);
  assert.equal(xem.body.standardStatus, "Active", "X lên Đang bán");
  assert.ok(xem.body.completeness.missing.includes("legalStatus"), `mức đủ X: ${JSON.stringify(xem.body.completeness)}`);
  assert.ok(xem.body.completeness.missing.includes("occupantType"), "mức đủ X thiếu tình trạng sử dụng");

  const cuaA = await homNay(A, S.companyId);
  const cuaB = await homNay(B, S.companyId);
  assert.ok(cuaA.get("missing_info")?.includes(X!), `X ở Thiếu thông tin của A: ${JSON.stringify([...cuaA])}`);
  assert.ok(![...cuaB.values()].flat().includes(X!), "X không ở Hôm nay của B");
  assert.ok(cuaB.get("missing_info")?.includes(Y!), `Y (mã ${Y}) ở Thiếu thông tin của B: ${JSON.stringify([...cuaB])}`);
  assert.ok(![...cuaA.values()].flat().includes(Y!), "Y không ở Hôm nay của A");

  // File không có ngày xác nhận (AC-7 sửa lời 08/11): căn vào «Cần gọi lại» của người giữ, mức đủ vẫn nêu pháp lý.
  const [Z] = await nhap(A, S.companyId, ["A-01.03"], undefined, false);
  assert.ok((await homNay(A, S.companyId)).get("call_back")?.includes(Z!), `Z (không ngày) ở Cần gọi lại của A`);
  const xemZ = await A.goi("GET", `/api/v1/listings/${Z}`, undefined, S.companyId);
  assert.ok(xemZ.body.completeness.missing.includes("legalStatus"), "mức đủ Z vẫn thiếu pháp lý");

  // Đối chứng âm cùng đường: căn đủ năm mục mô tả và có ảnh không vào «Thiếu thông tin».
  const du = await taoCan(A, true, S.companyId);
  const vDu = (await A.goi("GET", `/api/v1/listings/${du}`, undefined, S.companyId)).body.version as number;
  assert.equal((await A.goi("POST", `/api/v1/listings/${du}/events`, { type: "details_changed", payload: { furnished: "full", financing: "cash" }, expectedVersion: vDu }, S.companyId)).status, 200);
  assert.ok(!(await homNay(A, S.companyId)).get("missing_info")?.includes(du), "căn đủ không vào Thiếu thông tin");
});
