// Bài có sẵn của các hàng trước chỉ đổi đúng chỗ giám sát duyệt (hàng bang-quyen-theo-vai, AC-9, E9c): Q-3 — người tạo
// hàng nhận thêm vai Bảng hàng (listing_agent hay buyer_agent, không team_lead); Q-0511-3 — ca Telesales, Quản trị sàn ở
// năm bài chủ nhà đổi kỳ vọng sang 404 «không có hàng này». Không bài nào mất assert. So tệp trên đĩa với merge-base
// của nhánh chính; rào chỉ sống trên nhánh của vòng này — gộp xong thì tự bỏ qua, không chặn vòng sau.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../../", import.meta.url));
const git = (...a: string[]) => execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

/** Sáu tệp được chạm và dòng nào được bỏ (chuỗi con của dòng cũ); dòng thêm nào được nhận. */
const CHO_PHEP: Record<string, { bo: string[]; them: RegExp }> = {
  "packages/api/test-db/listings.test.ts": { bo: ['[a.userId, ["company_admin"]], "người và vai lúc làm"'], them: /listing_agent|buyer_agent|^\s*\/\// },
  "packages/api/test-db/doi-gia-da-ban/doi-gia-da-ban.test.ts": { bo: [], them: /listing_agent|buyer_agent|^\s*\/\// },
  "packages/api/test-db/ngay-ban/ngay-ban.test.ts": { bo: [], them: /listing_agent|buyer_agent|^\s*\/\// },
  "apps/web/src/lib/sync/test-db/doi-gia-da-ban.db-test.mts": { bo: ['vai: ["company_admin"] }]);'], them: /listing_agent|buyer_agent|^\s*\/\// },
  "packages/api/test-db/owners.test.ts": {
    bo: [
      "for (const ai of [a.dauKhach, a.quanTri, a.truongNhom]) {",
      "for (const ai of [a.dauChuKhac, a.telesales, a.quanTri]) {",
      "for (const ai of [a.dauKhach, a.quanTri]) {",
      "assert.equal(res.status, 403);",
      'assert.equal((await json(res)).error, "listing-agent-required");',
      "assert.equal(res.status, 200, `${ten} ${duong}`);",
      "if (duong === chuNha(h)) assert.deepEqual(than,",
    ],
    them: /404|not-found|khongBangHang|listing-agent-required|\[ai, ma|res\.status, ma\)|error, loi\)|else if \(duong === chuNha\(h\)\) assert\.deepEqual\(than,|^\s*\/\//,
  },
  "packages/api/test-db/goi-ep-gia-dot-hai.test.ts": {
    bo: ['["telesales", co, s.nguoi.ts!.cookie, (r) => !(r.body && "floorPrice" in r.body) && (r.status === 403 || r.body?.visible === false)],'],
    them: /404|not-found|^\s*\/\//,
  },
};

const demAssert = (s: string) => (s.match(/\bassert\.\w+\(/g) ?? []).length;

/** Xét một tệp: trả lỗi gọi tên tệp, rỗng khi đúng luật. Thuần — bài hai chiều gọi thẳng trên bản sao. */
export function xetTep(tep: string, truoc: string, sau: string): string[] {
  const luat = CHO_PHEP[tep];
  if (!luat) return [`${tep}: không có trong danh sách được chạm`];
  const a = truoc.split("\n");
  const b = sau.split("\n");
  const bo = a.filter((l) => !b.includes(l));
  const them = b.filter((l) => !a.includes(l));
  const loi: string[] = [];
  for (const l of bo) if (!luat.bo.some((x) => l.includes(x))) loi.push(`${tep}: bỏ dòng không được duyệt «${l.trim()}»`);
  for (const l of them) {
    if (/team_lead/.test(l)) loi.push(`${tep}: dòng thêm có team_lead «${l.trim()}»`);
    else if (!luat.them.test(l) && l.trim() !== "") loi.push(`${tep}: dòng thêm không được duyệt «${l.trim()}»`);
  }
  if (demAssert(sau) < demAssert(truoc)) loi.push(`${tep}: mất assert (${demAssert(truoc)} → ${demAssert(sau)})`);
  return loi;
}

const TEP_NAY = "packages/api/test-db/bang-quyen-theo-vai/bai-cu.test.ts";

/** Nhánh chính tìm được (origin/main trước, rồi main), hay null ở bản sao nông. */
function nhanhChinh(): string | null {
  for (const nhanh of ["origin/main", "main"]) {
    try {
      git("rev-parse", "--verify", "--quiet", nhanh);
      return nhanh;
    } catch {
      /* thử nhánh kế */
    }
  }
  return null;
}

/** Rào chỉ sống trên nhánh của vòng này: commit thêm tệp này đã nằm trong nhánh chính → vòng đã gộp, rào hết hạn —
 *  các vòng sau sửa bài cơ sở dữ liệu không bị chặn oan. */
function vongDaGop(nhanh: string): boolean {
  const them = git("log", "--diff-filter=A", "--format=%H", "--", TEP_NAY).trim().split("\n").pop();
  if (!them) return false;
  try {
    git("merge-base", "--is-ancestor", them, nhanh);
    return true;
  } catch {
    return false;
  }
}

test("bảng quyền: bài có sẵn chỉ thêm vai, không đổi điều bài kiểm", (t) => {
  const nhanh = nhanhChinh();
  if (!nhanh) return t.skip("không tìm được nhánh chính (bản sao nông)");
  if (vongDaGop(nhanh)) return t.skip("vòng bang-quyen-theo-vai đã gộp vào nhánh chính — rào hết hạn");
  const base = git("merge-base", "HEAD", nhanh).trim();
  const doi = git("diff", "--name-only", base, "--", "packages/api/test-db", "apps/web/src/lib/sync/test-db")
    .split("\n")
    .filter((f) => f && !f.startsWith("packages/api/test-db/bang-quyen-theo-vai/"));
  for (const f of doi) assert.ok(f in CHO_PHEP, `${f}: tệp bài ngoài danh sách được chạm đã đổi`);
  let so = 0;
  for (const tep of Object.keys(CHO_PHEP)) {
    let truoc = "";
    try {
      truoc = git("show", `${base}:${tep}`);
    } catch {
      assert.fail(`${tep}: không có ở merge-base`);
    }
    // Đọc tệp trên đĩa — cùng cây với `git diff --name-only base` ở trên, nên sửa chưa commit cũng bị xét.
    const sau = readFileSync(join(GOC, tep), "utf8");
    assert.deepEqual(xetTep(tep, truoc, sau), [], tep);
    so++;
  }
  assert.equal(so, 6);
});

test("bảng quyền: bài canh bài cũ đỏ khi mất assert hay thêm team_lead", () => {
  const tep = "packages/api/test-db/listings.test.ts";
  const goc = git("show", `HEAD:${tep}`);
  const matAssert = goc.replace(/\n[^\n]*assert\.equal\([^\n]*\n/, "\n");
  assert.ok(xetTep(tep, goc, matAssert).some((l) => l.startsWith(`${tep}: mất assert`)), "xoá một assert phải đỏ");
  const themTn = goc.replace("'{listing_agent}'", "'{team_lead}'");
  assert.ok(xetTep(tep, goc, themTn).some((l) => l.includes("team_lead")), "thêm team_lead phải đỏ");
  assert.deepEqual(xetTep(tep, goc, goc), [], "đối chứng: tệp không đổi thì sạch");
});
