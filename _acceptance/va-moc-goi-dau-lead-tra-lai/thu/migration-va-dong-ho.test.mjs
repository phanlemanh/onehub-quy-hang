// Hàng va-moc-goi-dau-lead-tra-lai — E2 (AC-3): bản vá là migration mới 023 định nghĩa lại mark_first_call, không sửa
// migration đã commit; E6 (AC-6): ca số đo của leads-mine lấy mốc đầu khoảng từ đồng hồ cơ sở dữ liệu. Gốc kho suy từ
// vị trí tệp; nhánh chính là origin/main, vắng thì main — không tìm được thì đỏ, không bỏ qua.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const MIG = path.join(GOC, "packages/db/migrations");
const git = (...a) => execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" });

const CAN_023 = [
  "create or replace function app.mark_first_call(p_lead uuid) returns void",
  "returned_at is null",
  "revoke all on function app.mark_first_call(uuid) from public",
  "grant execute on function app.mark_first_call(uuid) to quy_hang_app",
];
/** Câu bắt buộc mà nguồn 023 thiếu. */
const thieu023 = (nguon) => CAN_023.filter((c) => !nguon.includes(c));
/** Dòng `git diff --name-status` dưới migrations không phải thêm mới (A). */
const suaMigration = (dong) => dong.filter((l) => l && !/^A\t/.test(l));

function nhanhChinh() {
  for (const ref of ["origin/main", "main"]) {
    try {
      git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`);
      return ref;
    } catch {
      // ref này không có, thử ref kế
    }
  }
  return null;
}

test("migration: 023 định nghĩa lại mark_first_call", () => {
  const tep = readdirSync(MIG).filter((f) => /^023_.+\.sql$/.test(f));
  assert.equal(tep.length, 1, `một tệp 023: ${tep.join(", ")}`);
  const nguon = readFileSync(path.join(MIG, tep[0]), "utf8");
  assert.deepEqual(thieu023(nguon), []);
  // Đối chứng: bản sao bỏ điều kiện chưa trả lại thì thước nêu đúng câu ấy.
  assert.deepEqual(thieu023(nguon.replace("and returned_at is null", "")), ["returned_at is null"]);
});

test("migration: không sửa migration đã commit", () => {
  const ref = nhanhChinh();
  assert.ok(ref, "không tìm được nhánh chính (origin/main hay main)");
  const goc = git("merge-base", ref, "HEAD").trim();
  const dong = git("diff", "--name-status", goc, "HEAD", "--", "packages/db/migrations").split("\n");
  assert.deepEqual(suaMigration(dong), []);
  // Đối chứng: danh sách viết trước có một tệp cũ bị sửa thì thước nêu đúng tệp ấy.
  const vietTruoc = ["A\tpackages/db/migrations/023_va_moc_goi_dau.sql", "M\tpackages/db/migrations/011_chia_lead_va_han.sql"];
  assert.deepEqual(suaMigration(vietTruoc), ["M\tpackages/db/migrations/011_chia_lead_va_han.sql"]);
});

const CA = "số đo: ngày lead → Sẵn sàng bán trên bộ mẫu";
/** Thân một ca `test("…", async () => { … })` của tệp nguồn: từ dòng mở tới dòng `});` đầu tiên ở cột 0. */
function thanCa(nguon, ten) {
  const dau = nguon.indexOf(`test("${ten}"`);
  assert.ok(dau >= 0, `không thấy ca «${ten}»`);
  return nguon.slice(dau, nguon.indexOf("\n});", dau));
}
/** Lý do khối ca chưa lấy mốc từ đồng hồ cơ sở dữ liệu. */
function loiDongHo(khoi, nguon) {
  const ly = [];
  if (/const tu = new Date\(\)/.test(khoi)) ly.push("mốc tu từ Date()");
  const ham = /const tu = await (\w+)\(\)/.exec(khoi)?.[1];
  if (!ham || !new RegExp(`const ${ham} = [^\\n]*clock_timestamp\\(\\)`).test(nguon)) ly.push("tu không lấy từ clock_timestamp()");
  return ly;
}

test("chập chờn: mốc đầu khoảng đo từ đồng hồ cơ sở dữ liệu", () => {
  const nguon = readFileSync(path.join(GOC, "packages/api/test-db/leads-mine.test.ts"), "utf8");
  const khoi = thanCa(nguon, CA);
  assert.deepEqual(loiDongHo(khoi, nguon), []);
  for (const ky of ['"3.0"]', '"5.0"]', '"6.0"]']) assert.ok(khoi.includes(ky), `kỳ vọng ${ky} giữ nguyên`);
  // Đối chứng: bản sao khối với Date() thì thước nêu «Date()».
  const cu = khoi.replace(/const tu = await \w+\(\);/, "const tu = new Date();");
  assert.ok(loiDongHo(cu, nguon).some((l) => l.includes("Date()")));
});
