// Màn ngoài bản đồ (hồ sơ vong-giao-dien-qua-ban-do, E4–E5). Bản sao design/patterns + apps/web/src thật trong thư mục
// tạm; mỗi ca kiểm bản sao lành trước rồi phá đúng một chỗ.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tepVetKhoi } from "../kiem-chuan.mjs";
import { tepBanDoHeThietKe } from "../lib/ban-do-he-thiet-ke.mjs";
import { tepBoCucCan } from "../lib/bo-cuc.mjs";
import { docBanDo } from "../lib/ban-do.mjs";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(PKG, "..", "..");
const CLI = join(PKG, "ban-do-khuon.mjs");
const KIEM_CHUAN = join(PKG, "kiem-chuan.mjs");
const W = "apps/web/src";
const TEP_KIEM_CHUAN = ["apps/web/components.json", ".agents/skills/quy-hang-ui", ".agents/skills/reui", "_acceptance/config.yaml", ".github/workflows/ci.yml", ".mcp.json"];
// Màn mẫu của ca (a): Lịch xem — còn ở trang tạm, chưa nhóm nào (Bảng hàng đã có nhóm từ hàng 14).
const LICH_XEM = `${W}/app/(app)/viewings/page.tsx`;
const BAO_CAO = `${W}/app/(app)/bao-cao/page.tsx`;
const NHAN_TRANG_TAM = 'nhan_dien: ["apps/web/src/app/(app)/**/page.tsx"]';

function banSao({ kiemChuan = false } = {}) {
  const d = mkdtempSync(join(tmpdir(), "ngoai-ban-do-"));
  for (const t of ["design/patterns", W, ...(kiemChuan ? [...TEP_KIEM_CHUAN, ...tepVetKhoi(ROOT), ...tepBanDoHeThietKe(ROOT), ...tepBoCucCan(ROOT, docBanDo(ROOT))] : [])]) cpSync(join(ROOT, t), join(d, t), { recursive: true });
  if (kiemChuan)
    for (const s of ["quy-hang-ui", "reui"]) {
      mkdirSync(join(d, ".claude/skills"), { recursive: true });
      execFileSync("ln", ["-s", `../../.agents/skills/${s}`, join(d, ".claude/skills", s)]);
    }
  return d;
}
function voi(opt, fn) {
  const d = banSao(opt);
  try {
    return fn(d);
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
const chay = (d, ...a) => spawnSync(process.execPath, [CLI, "--root", d, ...a], { encoding: "utf8" });
const dongNgoai = (out) => out.split("\n").filter((l) => l.includes(": ngoai-ban-do — "));

/** Trang tạm thôi phủ mọi page.tsx dưới (app): chỉ còn các địa chỉ đang là trang tạm (màn thật rời nhóm, KH-tt-roi-nhom). */
function roiTrangTam(d, boRa = []) {
  sua(
    d,
    "design/patterns/trang-tam.md",
    NHAN_TRANG_TAM,
    `nhan_dien: [${["today", "me", "team", "shares", "viewings", "exports/new", "imports/new", "leads/new", "units/[code]"]
      .filter((m) => !boRa.includes(m))
      .map((m) => `"apps/web/src/app/(app)/${m}/page.tsx"`)
      .join(", ")}, "apps/web/src/app/(app)/settings/[section]/page.tsx"]`,
  );
}
const LICH_XEM_KHUON = 'export function LichXem({ title }: { title: string }) {\n  return <section>{title}</section>;\n}\n';
const LICH_XEM_MD = `---
nhom: lich-xem
doi_tuong: [lich-xem]
khuon: { ten: LichXem, nhap: "@/components/lich-xem/khung" }
nhan_dien: ["apps/web/src/app/(app)/viewings/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/viewings/page.tsx", duong: "/viewings", trang_thai: [mac-dinh] }
khe_bat_buoc: [title]
cam_ngoai_khuon: [Card]
ngoai_le: []
luat: [KH-lx-mot]
---
# Lịch xem

- **KH-lx-mot** — Lịch xem dựng qua LichXem.
`;

describe("màn ngoài bản đồ — ban-do-khuon.mjs đầy đủ (E4)", () => {
  it("đối chứng dương: bản sao lành → mã 0, không dòng ngoai-ban-do", () =>
    voi({}, (d) => {
      const r = chay(d);
      assert.equal(r.status, 0, r.stderr);
      assert.deepEqual(dongNgoai(r.stderr), []);
    }));

  it("(a) viewings rời trang tạm mà không có nhóm → đúng một dòng ngoai-ban-do nêu tệp và design/patterns/", () =>
    voi({}, (d) => {
      roiTrangTam(d, ["viewings"]);
      ghi(d, LICH_XEM, 'export default function P() {\n  return <main>lịch</main>;\n}\n');
      const r = chay(d);
      assert.equal(r.status, 1);
      const ds = dongNgoai(r.stderr);
      assert.equal(ds.length, 1, r.stderr);
      assert.ok(ds[0].startsWith(`${LICH_XEM}: ngoai-ban-do — màn chưa thuộc nhóm nào`), ds[0]);
      assert.ok(ds[0].includes("design/patterns/"), ds[0]);
      assert.ok(!r.stderr.includes(`${LICH_XEM}: trang-tam`), "tệp đã rời trang tạm không được báo lệch trang-tam");
    }));

  it("(a) chiều xanh: thêm design/patterns/lich-xem.md + khuôn, trang dựng <LichXem> → mã 0", () =>
    voi({}, (d) => {
      roiTrangTam(d, ["viewings"]);
      ghi(d, LICH_XEM, 'import { LichXem } from "@/components/lich-xem/khung";\n\nexport default function P() {\n  return <LichXem title="Lịch xem" />;\n}\n');
      assert.equal(chay(d).status, 1, "trước khi thêm mục bản đồ phải đỏ");
      ghi(d, `${W}/components/lich-xem/khung.tsx`, LICH_XEM_KHUON);
      ghi(d, "design/patterns/lich-xem.md", LICH_XEM_MD);
      const r = chay(d);
      assert.equal(r.status, 0, r.stderr);
      assert.ok(r.stdout.includes("lich-xem: 1 tệp theo khuôn · 0 ngoại lệ · 0 lệch"), r.stdout);
    }));

  it("(b) trang mới bao-cao trả <div>, ngoài mọi nhóm → một dòng ngoai-ban-do", () =>
    voi({}, (d) => {
      roiTrangTam(d);
      ghi(d, BAO_CAO, "export default function P() {\n  return <div>báo cáo</div>;\n}\n");
      const r = chay(d);
      assert.equal(r.status, 1);
      assert.deepEqual(dongNgoai(r.stderr).map((l) => l.split(":")[0]), [BAO_CAO]);
    }));

  it("im: app/page.tsx chỉ chuyển hướng không bao giờ bị báo, kể cả khi mọi nhóm bỏ nó", () =>
    voi({}, (d) => {
      roiTrangTam(d);
      const r = chay(d);
      assert.equal(r.status, 0, r.stderr);
      assert.ok(!r.stderr.includes(`${W}/app/page.tsx`));
      // Đối chứng: cùng tệp mà trả JSX thì bị báo — chứng ca im là vì không trả JSX, không vì tệp bị bỏ qua.
      ghi(d, `${W}/app/page.tsx`, "export default function Home() {\n  return <p>x</p>;\n}\n");
      assert.deepEqual(dongNgoai(chay(d).stderr).map((l) => l.split(":")[0]), [`${W}/app/page.tsx`]);
    }));
});

describe("màn ngoài bản đồ — chấm theo vòng và kiem-chuan (E5)", () => {
  const git = (d, ...a) => execFileSync("git", ["-C", d, "-c", "user.email=may@example.test", "-c", "user.name=may", ...a], { encoding: "utf8" });
  function kho(fn) {
    return voi({ kiemChuan: true }, (d) => {
      git(d, "init", "-q");
      git(d, "add", "-A");
      git(d, "commit", "-qm", "lanh");
      return fn(d, git(d, "rev-parse", "HEAD").trim());
    });
  }
  const kc = (d) => spawnSync(process.execPath, [KIEM_CHUAN, "--root", d], { encoding: "utf8" });

  it("đối chứng: cây lành → --base mã 0 và kiem-chuan «0 lệch»", () =>
    kho((d, ref) => {
      assert.equal(chay(d, "--base", ref).status, 0);
      const k = kc(d);
      assert.equal(k.status, 0, k.stdout + k.stderr);
      assert.ok(k.stdout.split("\n").includes("khuôn: 13 nhóm · 0 lỗi đọc · 0 lệch"), k.stdout);
    }));

  it("vòng chỉ thêm một màn ngoài bản đồ → --base đỏ nêu tệp, không lối «không tệp nào đổi»; kiem-chuan đỏ nêu tệp", () =>
    kho((d) => {
      // Bản đồ đổi TRƯỚC <ref>: diff của vòng chỉ có trang mới, không chạm design/patterns.
      roiTrangTam(d);
      git(d, "commit", "-qam", "roi-trang-tam");
      const ref = git(d, "rev-parse", "HEAD").trim();
      ghi(d, BAO_CAO, "export default function P() {\n  return <div>báo cáo</div>;\n}\n");
      const r = chay(d, "--base", ref);
      assert.equal(r.status, 1, r.stdout + r.stderr);
      assert.ok(r.stderr.includes(`${BAO_CAO}: ngoai-ban-do`), r.stderr);
      assert.ok(!r.stdout.includes("không tệp nào của nhóm đổi"), r.stdout);
      const k = kc(d);
      assert.equal(k.status, 1);
      // kiem-chuan đỏ thì không in dòng tóm tắt; mỗi lỗi một dòng stderr.
      assert.deepEqual(k.stderr.split("\n").filter((l) => l.startsWith("khuôn: ")), [`khuôn: ${BAO_CAO}: ngoai-ban-do — màn chưa thuộc nhóm nào — vòng dựng màn đầu của nhóm mới tạo design/patterns/<nhóm>.md và khuôn (docs/design/vo-va-ia.md §2 «Nhóm mới»)`]);
    }));

  it("--base không rơi lối «không tệp nào đổi» kể cả khi không nhóm nào (cả nhóm trạng thái) phủ trang mới", () =>
    kho((d) => {
      roiTrangTam(d);
      sua(d, "design/patterns/trang-thai.md", '"apps/web/src/app/**/*.tsx"', '"apps/web/src/app/(auth)/**/*.tsx", "apps/web/src/app/(app)/settings/**/*.tsx", "apps/web/src/app/(app)/today/*.tsx", "apps/web/src/app/page.tsx"');
      git(d, "commit", "-qam", "thu-hep");
      const ref = git(d, "rev-parse", "HEAD").trim();
      ghi(d, BAO_CAO, "export default function P() {\n  return <div>báo cáo</div>;\n}\n");
      const r = chay(d, "--base", ref);
      assert.ok(!r.stdout.includes("không tệp nào của nhóm đổi"), r.stdout);
      assert.equal(r.status, 1, r.stdout + r.stderr);
      assert.ok(r.stderr.includes(`${BAO_CAO}: ngoai-ban-do`), r.stderr);
    }));

  it("im: tệp mới chỉ dưới docs/ → «khuôn: không tệp nào của nhóm đổi», mã 0", () =>
    kho((d, ref) => {
      ghi(d, "docs/moi.md", "# x\n");
      const r = chay(d, "--base", ref);
      assert.equal(r.status, 0);
      assert.equal(r.stdout.trim(), "khuôn: không tệp nào của nhóm đổi");
    }));
});
