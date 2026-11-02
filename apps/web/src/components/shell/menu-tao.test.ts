// AC-4 (hàng 91): việc tạo ở đúng một chỗ — nút chính là việc tạo đầu của vai, còn lại vào menu; không màn nào còn nút
// tạo trùng. Việc tạo theo vai đọc từ navigationFor thật (Tham chiếu §9).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { ACTION_PATH, type Action, navigationFor, type Role } from "@quy-hang/core";

import { chiaViecTao } from "./menu-tao";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Ma trận viết trước theo Tham chiếu §9.
const THEO_VAI: [Role, Action | null, Action[]][] = [
  ["telesales", "new_lead", []],
  ["listing_agent", "new_lead", ["import", "export"]],
  ["buyer_agent", null, []],
  ["team_lead", "new_lead", ["export"]],
  ["company_admin", "import", []],
];

const BO_QUA = [/^components\/shell\/menu-tao\.tsx$/, /^components\/ui\//, /^components\/reui\//, /^app\/mau\//, /\.test\.tsx?$/];

/** Liên kết tới một việc tạo: `href={ACTION_PATH…}` hay `href="/leads/new"` (…). */
const LIEN_KET = new RegExp(`href=\\{ACTION_PATH|href=["'](${Object.values(ACTION_PATH).join("|")})["']`);

export function tepCoNutTaoTrung(goc: string, doc: (p: string) => string = (p) => readFileSync(p, "utf8")): string[] {
  const ra: string[] = [];
  const di = (thu: string) => {
    for (const ten of readdirSync(thu)) {
      const p = join(thu, ten);
      if (statSync(p).isDirectory()) di(p);
      else if (/\.tsx?$/.test(ten)) {
        const rel = relative(goc, p);
        if (!BO_QUA.some((r) => r.test(rel)) && LIEN_KET.test(doc(p))) ra.push(rel);
      }
    }
  };
  for (const g of ["app", "components"]) di(join(goc, g));
  return ra.sort();
}

describe("menu Tạo", () => {
  it("menu Tạo: theo vai", () => {
    let ca = 0;
    for (const [vai, chinh, menu] of THEO_VAI) {
      const c = chiaViecTao(navigationFor([vai]).actions);
      assert.equal(c.chinh, chinh, `${vai}: nút chính`);
      assert.deepEqual(c.menu, menu, `${vai}: menu`);
      ca++;
    }
    assert.equal(ca, 5);
  });

  it("menu Tạo: không nút tạo trùng", () => {
    assert.deepEqual(tepCoNutTaoTrung(SRC), []);
    const shell = join(SRC, "components/shell/app-shell.tsx");
    const pha = tepCoNutTaoTrung(SRC, (p) => (p === shell ? `${readFileSync(p, "utf8")}\n<Link href={ACTION_PATH.new_lead} />` : readFileSync(p, "utf8")));
    assert.deepEqual(pha, ["components/shell/app-shell.tsx"]);
  });
});
