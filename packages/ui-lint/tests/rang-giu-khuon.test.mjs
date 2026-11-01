// Răng giữ khuôn (hồ sơ rang-giu-khuon, E1–E7b). Ca đỏ chép bản đồ và apps/web/src thật sang thư mục tạm, kiểm bản sao
// lành trước rồi tiêm đúng một chỗ; ca «cấu hình thật» lint bằng eslint.config.mjs của chính kho.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import tseslint from "typescript-eslint";
import plugin from "../index.mjs";
import { tepVetKhoi } from "../kiem-chuan.mjs";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(PKG, "..", "..");
const CLI = join(PKG, "ban-do-khuon.mjs");
const KIEM_CHUAN = join(PKG, "kiem-chuan.mjs");
const W = "apps/web/src";
const LUAT = "quy-hang-ui/ban-do-khuon";
const TEP_KIEM_CHUAN = ["apps/web/components.json", ".agents/skills/quy-hang-ui", ".agents/skills/reui", "_acceptance/config.yaml", ".github/workflows/ci.yml"];

function banSao({ kiemChuan = false } = {}) {
  const d = mkdtempSync(join(tmpdir(), "rang-khuon-"));
  for (const t of ["design/patterns", W, ...(kiemChuan ? [...TEP_KIEM_CHUAN, ...tepVetKhoi(ROOT)] : [])]) cpSync(join(ROOT, t), join(d, t), { recursive: true });
  if (kiemChuan)
    for (const s of ["quy-hang-ui", "reui"]) {
      mkdirSync(join(d, ".claude/skills"), { recursive: true });
      execFileSync("ln", ["-s", `../../.agents/skills/${s}`, join(d, ".claude/skills", s)]);
    }
  return d;
}
async function voi(opt, fn) {
  const d = banSao(opt);
  try {
    return await fn(d);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}
const ghi = (d, t, s) => (mkdirSync(dirname(join(d, t)), { recursive: true }), writeFileSync(join(d, t), s));
function sua(d, t, cu, moi) {
  const s = readFileSync(join(d, t), "utf8");
  assert.ok(s.includes(cu), `bản sao ${t} không có đoạn cần phá: ${cu}`);
  writeFileSync(join(d, t), s.replace(cu, moi));
}

/** ESLint chỉ bật luật ban-do-khuon, chạy trong bản sao. */
function lintSao(d) {
  return new ESLint({
    cwd: d,
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ["**/*.{ts,tsx}"],
        languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
        plugins: { "quy-hang-ui": plugin },
        rules: { [LUAT]: "error" },
      },
    ],
  });
}
async function loiLuat(d, tep, code) {
  const [r] = code === undefined ? await lintSao(d).lintFiles([join(d, tep)]) : await lintSao(d).lintText(code, { filePath: join(d, tep) });
  assert.equal(r.filePath, join(d, tep), "tệp phải thật sự được lint");
  return r.messages.filter((m) => m.ruleId === LUAT);
}
const NHAP = (khoi, tu) => `import { ${khoi} } from "${tu}";\n`;

describe("E1 — tiêm khối cấm vào tệp màn của mỗi nhóm → đúng một lỗi có tên", () => {
  it("đối chứng dương: bản sao lành 0 lỗi luật", async () =>
    voi({}, async (d) => {
      const r = await lintSao(d).lintFiles([join(d, W)]);
      assert.deepEqual(r.flatMap((x) => x.messages.filter((m) => m.ruleId === LUAT)), []);
    }));
  const CA = [
    ["settings/thu/page.tsx mới nhập Frame", `${W}/app/settings/thu/page.tsx`, NHAP("Frame", "@/components/reui/frame") + "export default function P() {\n  return null;\n}\n", "Frame", "cai-dat-san", "MucCaiDat"],
    ["trang đăng nhập nhập Card", `${W}/app/(auth)/login/page.tsx`, null, "Card", "xac-thuc", "Khung"],
    ["trang tạm Hôm nay nhập Empty", `${W}/app/(app)/today/page.tsx`, null, "Empty", "trang-tam", "Placeholder"],
    ["quan-nguoi.tsx nhập Alert", `${W}/app/settings/users/quan-nguoi.tsx`, null, "Alert", "trang-thai", "TrangThai"],
  ];
  const TU = { Card: "@/components/ui/card", Empty: "@/components/ui/empty", Alert: "@/components/reui/alert" };
  for (const [ten, tep, moi, khoi, nhom, khuon] of CA)
    it(ten, () =>
      voi({}, async (d) => {
        if (moi) ghi(d, tep, moi);
        else ghi(d, tep, NHAP(khoi, TU[khoi]) + readFileSync(join(d, tep), "utf8"));
        const m = await loiLuat(d, tep);
        const coTrongLoi = m.length === 1 ? m[0] : null;
        assert.equal(m.length, 1, JSON.stringify(m));
        const tepTrongLoi = tep;
        assert.equal(coTrongLoi.line, moi ? 1 : 1);
        assert.equal(coTrongLoi.message, `«${tepTrongLoi}» thuộc nhóm ${nhom}: không nhập ${khoi} ngoài khuôn — dựng qua <${khuon}> (design/patterns/${nhom}.md).`);
      }));
});

describe("E2 — phải im", () => {
  const CA = [
    ["tệp khuôn tự nhập khối của nó", `${W}/app/settings/khung.tsx`, null],
    ["ngoại lệ đã khai nhập Frame", `${W}/app/settings/page.tsx`, NHAP("Frame", "@/components/reui/frame")],
    ["tệp ngoài mọi nhóm màn nhập Frame", `${W}/components/shell/app-shell.tsx`, NHAP("Frame", "@/components/reui/frame")],
    ["tệp nhóm nhập khối không cấm", `${W}/app/(auth)/login/page.tsx`, NHAP("Button", "@/components/ui/button")],
  ];
  for (const [ten, tep, them] of CA)
    it(ten, () =>
      voi({}, async (d) => {
        if (them) ghi(d, tep, them + readFileSync(join(d, tep), "utf8"));
        assert.deepEqual(await loiLuat(d, tep), []);
      }));
  it("đối chứng: ngoại lệ của cai-dat-san nhập Empty → 1 lỗi nhóm trang-thai (luật không tắt ở tệp ấy)", () =>
    voi({}, async (d) => {
      const tep = `${W}/app/settings/page.tsx`;
      ghi(d, tep, NHAP("Empty", "@/components/ui/empty") + readFileSync(join(d, tep), "utf8"));
      const m = await loiLuat(d, tep);
      assert.equal(m.length, 1);
      assert.match(m[0].message, /thuộc nhóm trang-thai: không nhập Empty/);
    }));
});

describe("E3 — nhập đổi tên vẫn bị bắt theo tên gốc", () => {
  const tep = `${W}/app/settings/thu/page.tsx`;
  const than = "export default function P() {\n  return null;\n}\n";
  it("Frame as F → 1 lỗi nêu Frame", () =>
    voi({}, async (d) => {
      const m = await loiLuat(d, tep, 'import { Frame as F } from "@/components/reui/frame";\n' + than);
      assert.equal(m.length, 1);
      assert.match(m[0].message, /không nhập Frame ngoài khuôn/);
      assert.doesNotMatch(m[0].message, / F /);
    }));
  it("đối chứng: Badge as F → 0 lỗi", () =>
    voi({}, async (d) => assert.deepEqual(await loiLuat(d, tep, 'import { Badge as F } from "@/components/reui/badge";\n' + than), [])));
});

describe("E4 — bản đồ đọc lỗi làm lint và kiem-chuan đỏ", () => {
  const PHA = ['ly_do: "Chỉ chuyển hướng sang mục đầu (Người dùng), không dựng màn nào."', 'ly_do: " "'];
  it("đối chứng dương rồi phá ngoại lệ thiếu lý do", () =>
    voi({ kiemChuan: true }, async (d) => {
      const tep = `${W}/app/(app)/today/page.tsx`;
      assert.deepEqual(await loiLuat(d, tep), [], "bản sao lành: 0 lỗi luật");
      const lanh = spawnSync(process.execPath, [KIEM_CHUAN, "--root", d], { encoding: "utf8" });
      assert.equal(lanh.status, 0, lanh.stderr);
      sua(d, "design/patterns/cai-dat-san.md", ...PHA);
      const m = await loiLuat(d, tep);
      assert.equal(m.length, 1);
      assert.match(m[0].message, /cai-dat-san\.md: ngoai_le\[0\] thiếu ly_do/);
      const hong = spawnSync(process.execPath, [KIEM_CHUAN, "--root", d], { encoding: "utf8" });
      assert.equal(hong.status, 1);
      assert.match(hong.stderr, /cai-dat-san\.md: ngoai_le\[0\] thiếu ly_do/);
    }));
});

describe("E5 — bài quét khuôn trong kiem-chuan", () => {
  it("cây lành in dòng tóm tắt, Người dùng trả <main> thì đỏ", () =>
    voi({ kiemChuan: true }, (d) => {
      const lanh = spawnSync(process.execPath, [KIEM_CHUAN, "--root", d], { encoding: "utf8" });
      assert.equal(lanh.status, 0, lanh.stderr);
      assert.ok(lanh.stdout.split("\n").includes("khuôn: 6 nhóm · 0 lỗi đọc · 0 lệch"), lanh.stdout);
      const U = `${W}/app/settings/users/page.tsx`;
      sua(d, U, "return (\n    <MucCaiDat", 'return (\n    <main className="min-h-svh">\n    <MucCaiDat');
      sua(d, U, "</MucCaiDat>\n  );", "</MucCaiDat>\n    </main>\n  );");
      const hong = spawnSync(process.execPath, [KIEM_CHUAN, "--root", d], { encoding: "utf8" });
      assert.equal(hong.status, 1);
      assert.match(hong.stderr, /khuôn: apps\/web\/src\/app\/settings\/users\/page\.tsx: cai-dat-san — gốc là <main>/);
    }));
});

describe("E6 — chế độ --base: chỉ chấm tệp và dòng vòng chạm", () => {
  const U = `${W}/app/settings/users/page.tsx`;
  const git = (d, ...a) => execFileSync("git", ["-C", d, ...a], { encoding: "utf8" });
  const chay = (d, ...a) => spawnSync(process.execPath, [CLI, "--root", d, ...a], { encoding: "utf8" });
  /** Kho git tạm: commit cây lành, rồi commit nợ cũ (Người dùng trả <main>) làm ref. */
  function kho(fn) {
    return voi({}, (d) => {
      git(d, "init", "-q");
      git(d, "-c", "user.email=may@example.test", "-c", "user.name=may", "add", "-A");
      git(d, "-c", "user.email=may@example.test", "-c", "user.name=may", "commit", "-qm", "lanh");
      sua(d, U, "return (\n    <MucCaiDat", 'return (\n    <main className="min-h-svh">\n    <MucCaiDat');
      sua(d, U, "</MucCaiDat>\n  );", "</MucCaiDat>\n    </main>\n  );");
      git(d, "-c", "user.email=may@example.test", "-c", "user.name=may", "commit", "-qam", "no-cu");
      return fn(d, git(d, "rev-parse", "HEAD").trim());
    });
  }
  it("(a) chỉ sửa docs và hồ sơ → im; đối chứng: chấm cả cây thì nợ cũ có thật", () =>
    kho((d, ref) => {
      ghi(d, "docs/x.md", "x\n");
      ghi(d, "_acceptance/y/y.md", "y\n");
      const r = chay(d, "--base", ref);
      assert.equal(r.status, 0, r.stderr);
      assert.equal(r.stdout.trim(), "khuôn: không tệp nào của nhóm đổi");
      assert.doesNotMatch(r.stdout + r.stderr, /users\/page\.tsx/);
      const ca = chay(d);
      assert.equal(ca.status, 1);
      assert.match(ca.stderr, /users\/page\.tsx: cai-dat-san — gốc là <main>/);
    }));
  it("(b) sửa tệp màn khác cho lệch → chỉ nêu tệp ấy", () =>
    kho((d, ref) => {
      sua(d, `${W}/app/(auth)/no-company/page.tsx`, '<Khung title="Chưa thuộc sàn nào">', "<Khung>");
      const r = chay(d, "--base", ref);
      assert.equal(r.status, 1);
      assert.deepEqual(r.stderr.trim().split("\n"), [`${W}/app/(auth)/no-company/page.tsx: xac-thuc — <Khung> thiếu khe «title»`]);
    }));
  it("(c) tệp màn mới chưa theo dõi dựng lệch → nêu tệp ấy", () =>
    kho((d, ref) => {
      ghi(d, `${W}/app/settings/thu/page.tsx`, 'export default function P() {\n  return <main className="min-h-svh">x</main>;\n}\n');
      const r = chay(d, "--base", ref);
      assert.equal(r.status, 1);
      assert.match(r.stderr, /settings\/thu\/page\.tsx: cai-dat-san — gốc là <main>/);
    }));
  it("(d) sửa dòng không lệch trong tệp có nợ cũ → im kèm nhãn nợ cũ; đối chứng: sửa chính dòng lệch → đỏ", () =>
    kho((d, ref) => {
      sua(d, U, "export const dynamic", "// một dòng chú thích mới\nexport const dynamic");
      const r = chay(d, "--base", ref);
      assert.equal(r.status, 0, r.stderr);
      assert.match(r.stdout, /^nợ cũ: apps\/web\/src\/app\/settings\/users\/page\.tsx: cai-dat-san — gốc là <main>/m);
      git(d, "checkout", "-q", "--", U);
      sua(d, U, '<main className="min-h-svh">', '<main className="min-h-svh p-2">');
      const r2 = chay(d, "--base", ref);
      assert.equal(r2.status, 1);
      assert.match(r2.stderr, /users\/page\.tsx: cai-dat-san — gốc là <main>/);
    }));
  it("(e) bản đồ hỏng → nêu lỗi đọc", () =>
    kho((d, ref) => {
      sua(d, "design/patterns/cai-dat-san.md", 'ly_do: "Chỉ chuyển hướng sang mục đầu (Người dùng), không dựng màn nào."', 'ly_do: " "');
      const r = chay(d, "--base", ref);
      assert.equal(r.status, 1);
      assert.match(r.stderr, /cai-dat-san\.md: ngoai_le\[0\] thiếu ly_do/);
    }));
});

describe("E7b — cấu hình eslint thật của kho", () => {
  const that = () => new ESLint({ cwd: ROOT });
  it("trang Cài đặt mới nhập Frame → đúng 1 lỗi ban-do-khuon mức error", async () => {
    const [r] = await that().lintText(NHAP("Frame", "@/components/reui/frame") + "export default function P() {\n  return null;\n}\n", {
      filePath: join(ROOT, W, "app/settings/thu/page.tsx"),
    });
    const m = r.messages.filter((x) => x.ruleId === LUAT);
    assert.equal(m.length, 1, JSON.stringify(r.messages));
    assert.equal(m[0].severity, 2);
  });
  it("luật ở mức error cho một tệp mỗi nhóm", async () => {
    for (const t of ["app/(auth)/login/page.tsx", "app/settings/users/page.tsx", "app/(app)/today/page.tsx", "app/settings/users/quan-nguoi.tsx"]) {
      const c = await that().calculateConfigForFile(join(ROOT, W, t));
      assert.deepEqual([c.rules?.[LUAT]?.[0]], [2], t);
    }
  });
  it("cây thật với chỉ thị trong mã bị bỏ qua → 0 lỗi ban-do-khuon", async () => {
    const r = await new ESLint({ cwd: ROOT, overrideConfig: { linterOptions: { noInlineConfig: true } } }).lintFiles([join(ROOT, W)]);
    assert.deepEqual(r.flatMap((x) => x.messages.filter((m) => m.ruleId === LUAT).map((m) => `${x.filePath}:${m.line}`)), []);
  });
  it("skill quy-hang-ui liệt luật trong bảng luật", () =>
    assert.match(readFileSync(join(ROOT, ".agents/skills/quy-hang-ui/SKILL.md"), "utf8"), /^\| `ban-do-khuon` \|/m));
});
