// Bài đo của vòng chuyen-cho-delivery-loop-3-0. Mỗi ca một cặp hai chiều trên cùng một hàm đọc: vật thật của kho → xanh;
// bản sao phá đúng một chỗ → đỏ với thông điệp ghim. Không ghi vào cây kho; bản sao là chuỗi trong bộ nhớ hay thư mục tạm.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { BANG } from "../rang/bang-ten.mjs";
import { KIT_CU, KIT_MOI, soDauNhanh, soHaiKit } from "../rang/doi-chung.mjs";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SLUG = "chuyen-cho-delivery-loop-3-0";
const doc = (p) => readFileSync(join(GOC, p), "utf8");
const git = (...a) => execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8", maxBuffer: 64 << 20 }).trim();
const NEN = git("merge-base", "HEAD", "origin/main");

const TAG = "v3.0.0";
const MOI = ["acceptance-gate", "feature-loop", "diagram-design", "dispatch", "roadmap", "knowledge"];
const CU = ["acceptance-gate", "feature-loop", "diagram-design", "dieu-phoi", "road-map", "tri-thuc"];
const LUONG = [".github/workflows/ci.yml", ".github/workflows/ghim-lai-ban-that.yml"];

// ---------- AC-1: hai luồng CI kéo delivery-loop v3.0.0, lõi ở plugins/acceptance-gate ----------
export function kiemLuong(ten, text) {
  const tags = [...text.matchAll(/^\s*KIT_TAG:\s*(\S+)/gm)].map((m) => m[1]);
  if (tags.length !== 1 || tags[0] !== TAG) throw new Error(`${ten}: KIT_TAG là [${tags.join(", ")}], cần đúng một dòng ${TAG}`);
  if (!text.includes('fetch -q --depth 1 https://github.com/phanlemanh/delivery-loop "refs/tags/$KIT_TAG"'))
    throw new Error(`${ten}: không lấy kit từ phanlemanh/delivery-loop theo thẻ`);
  if (!text.includes('echo "CLAUDE_PLUGIN_ROOT=$RUNNER_TEMP/kit/plugins/acceptance-gate" >> "$GITHUB_ENV"'))
    throw new Error(`${ten}: CLAUDE_PLUGIN_ROOT không trỏ $RUNNER_TEMP/kit/plugins/acceptance-gate`);
  const cu = text.split("\n").findIndex((l) => l.includes("acceptance-gate-kit"));
  if (cu >= 0) throw new Error(`${ten}:${cu + 1}: còn «acceptance-gate-kit»`);
  // Bố cục 3.0: feature-loop là thư mục anh em của lõi, không nằm trong lõi.
  const sai = text.split("\n").findIndex((l) => /\$CLAUDE_PLUGIN_ROOT\/feature-loop\//.test(l));
  if (sai >= 0) throw new Error(`${ten}:${sai + 1}: gọi $CLAUDE_PLUGIN_ROOT/feature-loop/ — ở kit 3.0 là $CLAUDE_PLUGIN_ROOT/../feature-loop/`);
  if (ten.endsWith("ghim-lai-ban-that.yml")) {
    const goi = text.split("\n").filter((l) => l.includes('node "$CLAUDE_PLUGIN_ROOT/../feature-loop/scripts/repin-lane.mjs"'));
    if (goi.length !== 1) throw new Error(`${ten}: bước Ghim lại không gọi đúng một lần $CLAUDE_PLUGIN_ROOT/../feature-loop/scripts/repin-lane.mjs (thấy ${goi.length})`);
  }
}

test("AC-1 «hai luồng kéo delivery-loop v3.0.0»: vật thật xanh, sáu bản phá đỏ đúng thông điệp", () => {
  for (const f of LUONG) kiemLuong(f, doc(f));
  const ci = doc(LUONG[0]);
  const ghim = doc(LUONG[1]);
  const pha = [
    ["thẻ cũ", ci.replace("KIT_TAG: v3.0.0", "KIT_TAG: v2.39.0"), /KIT_TAG là \[v2\.39\.0\], cần đúng một dòng v3\.0\.0/],
    ["kho cũ", ci.replace("https://github.com/phanlemanh/delivery-loop", "https://github.com/phanlemanh/acceptance-gate-kit"), /không lấy kit từ phanlemanh\/delivery-loop/],
    ["lõi ở gốc kit", ci.replace("$RUNNER_TEMP/kit/plugins/acceptance-gate", "$RUNNER_TEMP/kit"), /CLAUDE_PLUGIN_ROOT không trỏ/],
    ["chú thích còn tên kho cũ", ci.replace("# Cổng nghiệm thu", "# acceptance-gate-kit — Cổng nghiệm thu"), /còn «acceptance-gate-kit»/],
    ["làn ghim lại theo bố cục cũ", ghim.replace("$CLAUDE_PLUGIN_ROOT/../feature-loop/", "$CLAUDE_PLUGIN_ROOT/feature-loop/"), /gọi \$CLAUDE_PLUGIN_ROOT\/feature-loop\//],
    ["bỏ bước Ghim lại", ghim.split("\n").filter((l) => !l.includes("repin-lane.mjs")).join("\n"), /bước Ghim lại không gọi đúng một lần .* \(thấy 0\)/],
  ];
  for (const [ten, banSao, thongDiep] of pha) {
    const laGhim = ["làn ghim lại theo bố cục cũ", "bỏ bước Ghim lại"].includes(ten);
    assert.notEqual(banSao, laGhim ? ghim : ci, `bản phá «${ten}» không đổi gì — ca lệch vật`);
    assert.throws(() => kiemLuong(laGhim ? "ban-sao/ghim-lai-ban-that.yml" : "ban-sao", banSao), thongDiep, `bản phá «${ten}»`);
  }
});

test("AC-1 «không tệp nào dưới .github/ còn tên kho kit cũ»", () => {
  const tep = git("ls-files", ".github").split("\n").filter(Boolean);
  const con = tep.filter((f) => doc(f).includes("acceptance-gate-kit"));
  assert.deepEqual(con, [], `còn tên kho cũ: ${con.join(", ")}`);
  assert.ok(tep.length >= 3, "đối chứng: quét thấy ít nhất ba tệp dưới .github/");
});

// ---------- AC-2, AC-3: phiên bật chợ mới, tắt đích danh chợ cũ ----------
export function kiemPhien(s, tagCi) {
  const cho = Object.keys(s.extraKnownMarketplaces ?? {});
  if (cho.join() !== "delivery-loop") throw new Error(`chợ khai: [${cho.join(", ")}], cần đúng [delivery-loop]`);
  const src = s.extraKnownMarketplaces["delivery-loop"].source ?? {};
  if (src.source !== "github" || src.repo !== "phanlemanh/delivery-loop") throw new Error(`nguồn chợ: ${JSON.stringify(src)}`);
  if (src.ref !== tagCi) throw new Error(`chợ ghim ref ${src.ref}, CI kéo ${tagCi} — hai phía phải cùng bản`);
  const ep = s.enabledPlugins ?? {};
  for (const p of MOI) if (ep[`${p}@delivery-loop`] !== true) throw new Error(`${p}@delivery-loop = ${ep[`${p}@delivery-loop`]}, cần true`);
}
export function kiemTatCu(s) {
  const ep = s.enabledPlugins ?? {};
  for (const p of CU) if (ep[`${p}@acceptance-gate-kit`] !== false) throw new Error(`${p}@acceptance-gate-kit = ${ep[`${p}@acceptance-gate-kit`]}, cần false`);
  const la = Object.keys(ep).filter((k) => k.endsWith("@acceptance-gate-kit") && !CU.includes(k.split("@")[0]));
  if (la.length) throw new Error(`khoá chợ cũ ngoài danh sách: ${la.join(", ")}`);
}
const tagCuaCi = () => doc(LUONG[0]).match(/^\s*KIT_TAG:\s*(\S+)/m)[1];
const settings = () => JSON.parse(doc(".claude/settings.json"));
const sao = (o) => JSON.parse(JSON.stringify(o));

test("AC-2 «phiên khai chợ delivery-loop cùng bản CI, bật sáu plugin»: vật thật xanh, bốn bản phá đỏ", () => {
  kiemPhien(settings(), tagCuaCi());
  const ca = [
    ["còn chợ cũ", (s) => { s.extraKnownMarketplaces["acceptance-gate-kit"] = { source: { source: "github", repo: "phanlemanh/acceptance-gate-kit" } }; }, /chợ khai: \[delivery-loop, acceptance-gate-kit\]/],
    ["ref lệch CI", (s) => { s.extraKnownMarketplaces["delivery-loop"].source.ref = "v3.0.1"; }, /chợ ghim ref v3\.0\.1, CI kéo v3\.0\.0/],
    ["thiếu knowledge", (s) => { delete s.enabledPlugins["knowledge@delivery-loop"]; }, /knowledge@delivery-loop = undefined, cần true/],
    ["roadmap tắt", (s) => { s.enabledPlugins["roadmap@delivery-loop"] = false; }, /roadmap@delivery-loop = false, cần true/],
  ];
  for (const [ten, pha, td] of ca) {
    const s = sao(settings());
    pha(s);
    assert.throws(() => kiemPhien(s, tagCuaCi()), td, `bản phá «${ten}»`);
  }
});

test("AC-3 «tắt đích danh đúng sáu plugin chợ cũ»: vật thật xanh, ba bản phá đỏ", () => {
  kiemTatCu(settings());
  const ca = [
    ["một khoá còn true", (s) => { s.enabledPlugins["tri-thuc@acceptance-gate-kit"] = true; }, /tri-thuc@acceptance-gate-kit = true, cần false/],
    ["xoá một khoá", (s) => { delete s.enabledPlugins["dieu-phoi@acceptance-gate-kit"]; }, /dieu-phoi@acceptance-gate-kit = undefined, cần false/],
    ["khoá lạ", (s) => { s.enabledPlugins["x@acceptance-gate-kit"] = false; }, /khoá chợ cũ ngoài danh sách: x@acceptance-gate-kit/],
  ];
  for (const [ten, pha, td] of ca) {
    const s = sao(settings());
    pha(s);
    assert.throws(() => kiemTatCu(s), td, `bản phá «${ten}»`);
  }
});

test("AC-2 «phần còn lại của .claude/settings.json giữ nguyên so với nhánh chính»", () => {
  const bo = (s) => { const o = sao(s); delete o.enabledPlugins; delete o.extraKnownMarketplaces; return o; };
  const nen = JSON.parse(git("show", `${NEN}:.claude/settings.json`));
  assert.deepEqual(bo(settings()), bo(nen), "quyền, hook hay khoá khác của settings.json đã đổi");
  const khac = Object.keys(nen.enabledPlugins).filter((k) => !k.includes("@acceptance-gate-kit"));
  for (const k of khac) assert.equal(settings().enabledPlugins[k], nen.enabledPlugins[k], `khoá ngoài kit ${k} đổi`);
  // Đối chứng: một thay đổi ở quyền bị bắt.
  const pha = sao(settings());
  pha.permissions = { ...(pha.permissions ?? {}), allow: [...(pha.permissions?.allow ?? []), "Bash(rm:*)"] };
  assert.notDeepEqual(bo(pha), bo(nen), "đối chứng: thêm một quyền phải bị thấy");
});

// ---------- AC-4: tim-kit.mjs đọc bản cài của chợ mới ----------
function chayTimKit(soCai) {
  const d = mkdtempSync(join(tmpdir(), "cc30-so-"));
  try {
    const f = join(d, "installed_plugins.json");
    writeFileSync(f, JSON.stringify({ version: 2, plugins: soCai }));
    const r = spawnSync(process.execPath, [join(GOC, "packages/ui-lint/tim-kit.mjs")], { cwd: GOC, encoding: "utf8", env: { ...process.env, QUY_HANG_PLUGIN_REGISTRY: f } });
    return { ma: r.status, ra: r.stdout };
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}

test("AC-4 «tim-kit.mjs chọn bản cài acceptance-gate@delivery-loop, bỏ qua chợ cũ»", () => {
  const that = mkdtempSync(join(tmpdir(), "cc30-cai-"));
  try {
    const muc = [{ scope: "user", installPath: that, version: "3.0.0" }];
    const moi = chayTimKit({ "acceptance-gate@delivery-loop": muc });
    assert.equal(moi.ma, 0);
    assert.equal(moi.ra, that, "sổ có mục chợ mới → in đường bản cài");
    const cu = chayTimKit({ "acceptance-gate@acceptance-gate-kit": muc });
    assert.equal(cu.ra, "", "sổ chỉ có mục chợ cũ → không in gì (đối chứng: khoá cũ không còn được đọc)");
  } finally {
    rmSync(that, { recursive: true, force: true });
  }
});

test("AC-4 «trên máy này, kit tim-kit tìm được là acceptance-gate 3.0.0 và có đủ script các lệnh executor gọi»", () => {
  const r = spawnSync(process.execPath, [join(GOC, "packages/ui-lint/tim-kit.mjs")], { cwd: GOC, encoding: "utf8", env: { ...process.env, QUY_HANG_PLUGIN_REGISTRY: "" } });
  const goc = (r.stdout ?? "").trim();
  assert.ok(goc, "tim-kit không in gì — máy chưa cài acceptance-gate@delivery-loop");
  const pj = JSON.parse(readFileSync(join(goc, ".claude-plugin/plugin.json"), "utf8"));
  assert.equal(pj.version, "3.0.0", `bản cài ở ${goc}`);
  for (const s of ["scripts/product-map.mjs", "scripts/design-floor-s4.mjs", "scripts/design-floor-khuon.mjs", "scripts/pre-merge-check.sh", "lib/evidence-core.cjs", "lib/eval-yaml.cjs"])
    assert.ok(existsSync(join(goc, s)), `kit thiếu ${s}`);
});

// ---------- AC-5: tệp sống thôi gọi tên lệnh cũ, thôi giữ khoá chợ cũ ----------
const LENH_CU = new RegExp(`(?<![\\w-])(${Object.keys(BANG).map((k) => k.replace(/[-:]/g, (c) => `\\${c}`)).join("|")})(?![\\w-])`);
// Luật loại trừ viết trước, mỗi luật một tên; tệp không khớp luật nào là tệp sống.
export const LOAI_TRU = [
  ["ho-so-da-ky", (f) => f.startsWith("_acceptance/") && f !== "_acceptance/config.yaml" && !f.startsWith("_acceptance/README")],
  ["mang-ngay", (f) => /(^|\/)\d{4}-\d{2}-\d{2}/.test(f)],
  ["nhat-ky", (f) => /(^|\/)CHANGELOG[^/]*$/i.test(f)],
  ["tai-lieu-tho", (f) => f.startsWith("docs/tri-thuc/raw/")],
  ["tep-sinh", (f) => ["LO-TRINH.html", "PRODUCT-MAP.md", "package-lock.json"].includes(f)],
];
export function luatBo(f, noiDung) {
  const l = LOAI_TRU.find(([, khop]) => khop(f));
  if (l) return l[0];
  return noiDung.includes("\0") ? "nhi-phan" : null;
}
export function quetTenCu(tep, doc) {
  const gap = [];
  for (const f of tep) {
    doc(f).split("\n").forEach((l, i) => {
      const m = l.match(LENH_CU);
      if (m) gap.push(`${f}:${i + 1} ${m[1]} → ${BANG[m[1]]}`);
      if (/[\w-]+@acceptance-gate-kit/.test(l) && f !== ".claude/settings.json") gap.push(`${f}:${i + 1} khoá …@acceptance-gate-kit`);
    });
  }
  return gap;
}

test("AC-5 «không tệp sống nào gọi tên lệnh cũ hay giữ khoá chợ cũ»: vật thật 0 chỗ, bản cấy đỏ đúng tệp:dòng", () => {
  const tat = git("ls-files").split("\n").filter(Boolean);
  const song = [];
  const boTheoLuat = {};
  for (const f of tat) {
    const ten = luatBo(f, existsSync(join(GOC, f)) ? readFileSync(join(GOC, f), "latin1") : "\0");
    if (ten) boTheoLuat[ten] = (boTheoLuat[ten] ?? 0) + 1;
    else song.push(f);
  }
  assert.equal(song.length + Object.values(boTheoLuat).reduce((a, b) => a + b, 0), tat.length, "mỗi tệp hoặc sống hoặc bị đúng một luật có tên bỏ");
  assert.ok(song.length > 200, `đối chứng: quét ${song.length} tệp sống`);
  for (const duoi of [/\.sh$/, /\.yml$/, /\.cjs$/, /^\.githooks\/[^.]+$/]) assert.ok(song.some((f) => duoi.test(f)), `tập quét thiếu loại tệp ${duoi}`);
  assert.deepEqual(quetTenCu(song, doc), []);
  const cay = { "docs/x.md": "a\nmở bằng `/dieu-phoi:mo-dot nen`\n", "tools/y.mjs": 'k = "acceptance-gate@acceptance-gate-kit"\n', ".githooks/z": "road-map:xem\n", "scripts/w.sh": "echo /tri-thuc:kiem\n", "docs/v.md": "dùng /dispatch:open và /knowledge:health\n" };
  assert.deepEqual(quetTenCu(Object.keys(cay), (f) => cay[f]), ["docs/x.md:2 dieu-phoi:mo-dot → dispatch:open", "tools/y.mjs:1 khoá …@acceptance-gate-kit", ".githooks/z:1 road-map:xem → roadmap:status", "scripts/w.sh:1 tri-thuc:kiem → knowledge:health"]);
  assert.equal(luatBo("_acceptance/nang-kit-2-36-0/contract.md", ""), "ho-so-da-ky");
  assert.equal(luatBo("_acceptance/config.yaml", ""), null, "config.yaml là tệp sống");
  assert.equal(luatBo("x.png", "a\0b"), "nhi-phan");
});

export function kiemTaiLieu(agents, thamChieu, tag) {
  if (!agents.includes("`phanlemanh/delivery-loop`")) throw new Error("AGENTS.md không nêu kho kit mới");
  const m = agents.match(/\(đang `(v[\d.]+)`\)/);
  if (m?.[1] !== tag) throw new Error(`AGENTS.md ghi thẻ ${m?.[1]}, ci.yml kéo ${tag}`);
  if (/Acceptance-Gate Kit/.test(agents)) throw new Error("AGENTS.md còn tên kit cũ");
  const dong = thamChieu.split("\n").find((l) => l.startsWith("| 19/11 |") && l.includes("delivery-loop") && l.includes(tag));
  if (!dong) throw new Error(`Sổ quyết định của Tham chiếu thiếu dòng 19/11 nêu delivery-loop ${tag}`);
}

test("AC-5 «AGENTS.md và Tham chiếu nói đúng kit và thẻ CI đang dùng»: vật thật xanh, ba bản phá đỏ", () => {
  const a = doc("AGENTS.md");
  const t = doc("docs/product/tham-chieu.md");
  kiemTaiLieu(a, t, tagCuaCi());
  assert.throws(() => kiemTaiLieu(a.replace("(đang `v3.0.0`)", "(đang `v2.39.0`)"), t, tagCuaCi()), /AGENTS\.md ghi thẻ v2\.39\.0, ci\.yml kéo v3\.0\.0/);
  assert.throws(() => kiemTaiLieu(`${a}\nAcceptance-Gate Kit`, t, tagCuaCi()), /AGENTS\.md còn tên kit cũ/);
  assert.throws(() => kiemTaiLieu(a, t.replace(/^\| 19\/11 \|.*delivery-loop.*$/m, ""), tagCuaCi()), /thiếu dòng 19\/11/);
});

// ---------- AC-7: hồ sơ ghim lại — dòng ghim khớp verified_commit, chữ ký người giữ nguyên ----------
const fm = (text, k) => (text.match(new RegExp(`^${k}:\\s*(.*)$`, "m")) ?? [])[1]?.trim();
export function kiemGhim(slug, runLog, report, reportNen) {
  const pin = runLog.split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return {}; } }).filter((d) => d.kind === "repin").at(-1);
  if (!pin) throw new Error(`${slug}: run-log không có dòng repin`);
  if (pin.sha !== fm(report, "verified_commit")) throw new Error(`${slug}: dòng repin sha ${pin.sha?.slice(0, 8)} ≠ verified_commit ${fm(report, "verified_commit")?.slice(0, 8)}`);
  const do_ = Object.entries(pin.evals_exit ?? {}).filter(([, v]) => v !== 0);
  if (!Object.keys(pin.evals_exit ?? {}).length || do_.length) throw new Error(`${slug}: evals_exit rỗng hoặc có mã ≠ 0 (${JSON.stringify(pin.evals_exit)})`);
  if (fm(report, "human_signoff") !== fm(reportNen, "human_signoff")) throw new Error(`${slug}: human_signoff đổi`);
  if (!report.includes(`run_id: ${pin.run_id}`)) throw new Error(`${slug}: evidence-report không cite run_id ${pin.run_id}`);
}

export const UNG_VIEN = ["ghim-lai-ban-that-qua-ci", "va-nut-ci-ag-root", "va-nut-ci-gitleaks", "bat-rang-buoc-ban-ma", "luat-an-va-kiem-ro-ri", "moi-truong-that", "nang-kit-2-36-0", "tang-5-giao-dien", "va-bai-o-la-do-ngau-nhien", "va-ci-secrets-quet-dung-lich-su", "va-deploy-csdl-tam", "cach-goi-rieng", "chuan-hoa-moi-cua", "hom-nay-mot-danh-sach-viec", "luat-chia-lead", "luong-gui", "man-lien-he", "mau-nhap-va-bai", "nhap-tac-tu-ke-hoach", "thue-phi", "trang-nhom-moi-gioi", "trang-thai-rieng", "truong-rieng-toi-thieu", "va-thuoc-ci-ho-so-moi-truong-that", "bai-thu-dong-bo-mat-mang", "bai-thu-zalo", "chu-san-du-vai", "pooler-che-do-giao-dich", "va-dinh-nghia-doc-lai", "che-vung-anh", "he-bo-cuc", "sua-hang-loat", "va-che-vung-anh", "va-pool-ket-noi", "va-sua-tren-o", "va-thong-bao-lead"];
export function kiemPhanLoai(pl, kq) {
  if (pl.ung_vien.length !== UNG_VIEN.length || [...pl.ung_vien].sort().join() !== [...UNG_VIEN].sort().join()) throw new Error(`ứng viên lệch danh sách viết trước (${pl.ung_vien.length}/${UNG_VIEN.length})`);
  if (pl.kit_dau?.sha !== KIT_MOI.sha || pl.kit_nen?.sha !== KIT_CU.sha) throw new Error("tệp phân loại không chạy bằng hai kit ghim");
  const gia = pl.sau_gop_gia ?? {};
  const moi = pl.do_dau.filter((x) => pl.nen?.[x] !== "do" && gia.ket_qua?.[x] !== "xanh");
  if (moi.length) throw new Error(`đỏ trên HEAD mà xanh trên nhánh chính: ${moi.join(",")}`);
  const nhanh = pl.do_dau.filter((x) => pl.nen?.[x] !== "do").sort();
  const caHai = pl.do_dau.filter((x) => pl.nen?.[x] === "do").sort();
  if (nhanh.length && !/^[0-9a-f]{40}$/.test(gia.sha ?? "")) throw new Error("tập «doi-nhanh» không có bản sau gộp giả ghi sha");
  if (caHai.join() !== kq.doCaHai.join()) throw new Error(`tập «do-ca-hai» của hợp đồng [${kq.doCaHai}] ≠ tệp [${caHai}]`);
  if (nhanh.join() !== kq.doiNhanh.join()) throw new Error(`tập «doi-nhanh» của hợp đồng [${kq.doiNhanh}] ≠ tệp [${nhanh}]`);
  if ([...pl.ghim].sort().join() !== Object.keys(kq.ghim).sort().join()) throw new Error(`tập «ghim» của hợp đồng ≠ tệp`);
}

test("AC-7 «phân loại ghim lại khớp hợp đồng, trên đúng cây HEAD»", () => {
  const pl = JSON.parse(doc(`_acceptance/${SLUG}/evidence/phan-loai-ghim.json`));
  const lech = spawnSync("git", ["-C", GOC, "diff", "--quiet", pl.sha, "HEAD", "--", ".", ":(exclude)_acceptance"]).status;
  assert.equal(lech, 0, `cây ngoài _acceptance/ của ${pl.sha?.slice(0, 8)} khác HEAD — phân loại chạy trên cây khác`);
  const kq = docKetQuaGhim(doc(`_acceptance/${SLUG}/contract.md`));
  kiemPhanLoai(pl, kq);
  const xanhNen = pl.ung_vien.find((x) => pl.nen?.[x] !== "do" && pl.sau_gop_gia?.ket_qua?.[x] !== "xanh") ?? "x";
  assert.throws(() => kiemPhanLoai({ ...pl, do_dau: [...pl.do_dau, xanhNen] }, kq), new RegExp(`đỏ trên HEAD mà xanh trên nhánh chính: ${xanhNen}`));
  assert.throws(() => kiemPhanLoai({ ...pl, ung_vien: pl.ung_vien.slice(1) }, kq), /ứng viên lệch danh sách viết trước/);
});

test("AC-7 «hồ sơ ghim lại giữ chữ ký, dòng ghim khớp verified_commit»", () => {
  const ten = Object.keys(GHIM);
  assert.ok(ten.length >= 1, "danh sách hồ sơ ghim lại rỗng");
  for (const s of ten) {
    const rl = doc(`_acceptance/${s}/run-log.jsonl`);
    const er = doc(`_acceptance/${s}/evidence-report.md`);
    const nen = git("show", `${NEN}:_acceptance/${s}/evidence-report.md`);
    assert.notEqual(fm(er, "verified_commit"), fm(nen, "verified_commit"), `${s}: chưa ghim lại trong vòng này`);
    kiemGhim(s, rl, er, nen);
    // Đối chứng trên cùng tệp: dòng repin cuối mang sha khác thì bị bắt.
    const lech = rl.trimEnd().split("\n").map((l, i, a) => (i === a.length - 1 ? l.replace(/"sha":"[0-9a-f]{40}"/, `"sha":"${"0".repeat(40)}"`) : l)).join("\n");
    assert.throws(() => kiemGhim(s, lech, er, nen), /dòng repin sha 00000000 ≠ verified_commit/);
    assert.throws(() => kiemGhim(s, rl, er.replace(/^human_signoff:.*$/m, "human_signoff: may"), nen), /human_signoff đổi/);
  }
});

// ---------- AC-6: hàm so của bài đối chứng (bài chạy thật: rang/doi-chung.mjs) ----------
test("AC-6 «hàm so đối chứng»: cùng tập OK xanh; lệch, VIOLATION, không chạy luật đều đỏ đúng thông điệp", () => {
  const ran = "pre-merge-check: rules ran=4 declared-off=0 expected=4";
  const ok = (...s) => [...s.map((x) => `OK [${x}]: …`), ran].join("\n");
  assert.equal(soHaiKit(ok("a", "b"), ok("b", "a")), null);
  assert.match(soHaiKit(ok("a", "b"), ok("a")), /tập OK lệch \(chỉ v2\.39\.0: b; chỉ v3\.0\.0: -\)/);
  assert.match(soHaiKit(ok("a"), `${ok("a")}\nVIOLATION [a]: x`), /kit v3\.0\.0 có 1 VIOLATION trên merge-base/);
  assert.match(soHaiKit("OK [a]: …", ok("a")), /kit v2\.39\.0 không chạy luật nào/);
  assert.equal(soDauNhanh(["a"], `${ok("a", SLUG)}\nVIOLATION [PR]: chờ ký`), null);
  assert.match(soDauNhanh(["a", "b"], ok("a")), /hồ sơ thôi OK trên HEAD: b/);
  assert.match(soDauNhanh(["a"], `${ok("a")}\nVIOLATION [a]: x`), /VIOLATION ngoài vòng trên HEAD — VIOLATION \[a\]/);
  assert.equal(KIT_CU.sha.length + KIT_MOI.sha.length, 80, "hai thẻ ghim commit đủ 40 hex");
});

// ---------- AC-8: diff chỉ chạm tệp của việc chuyển chợ ----------
export const DUOC = [
  /^\.github\/workflows\/(ci|ghim-lai-ban-that)\.yml$/, /^\.claude\/settings\.json$/, /^packages\/ui-lint\/tim-kit\.mjs$/,
  /^AGENTS\.md$/, /^_acceptance\/config\.yaml$/, /^docs\/README\.md$/, /^docs\/tri-thuc\/TRI-THUC\.md$/, /^docs\/product\/tham-chieu\.md$/,
  /^docs\/plan\/(lo-trinh\.json|dot-(nen-dau|nen-2|dau-chu-dong-vao|dau-khach-nhap)\/README\.md)$/,
  /^(LO-TRINH\.html|PRODUCT-MAP\.md)$/,
  new RegExp(`^_acceptance/${SLUG}/`), new RegExp(`^docs/superpowers/(specs|plans)/2026-11-19-${SLUG}`),
];
// Hồ sơ ghim lại và tệp đo được phép đổi: rút từ mục «Ghim lại — kết quả» của hợp đồng, không ghi cứng.
export function docKetQuaGhim(contract) {
  const muc = contract.split("## Ghim lại — kết quả")[1]?.split("\n## ")[0] ?? "";
  const ghim = {};
  const doCaHai = [];
  const doiNhanh = [];
  for (const l of muc.split("\n")) {
    const n = l.match(/^- doi-nhanh: `([^`]+)`/);
    if (n) doiNhanh.push(n[1]);
    const g = l.match(/^- ghim: `([^`]+)` — tệp đo: (.+)$/);
    if (g) ghim[g[1]] = [...g[2].matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    const d = l.match(/^- do-ca-hai: `([^`]+)`/);
    if (d) doCaHai.push(d[1]);
  }
  return { ghim, doCaHai: doCaHai.sort(), doiNhanh: doiNhanh.sort() };
}
export const GHIM = docKetQuaGhim(doc(`_acceptance/${SLUG}/contract.md`)).ghim;
export function ngoaiPhamVi(tep, ghimMap = GHIM) {
  return tep.filter((f) => {
    if (DUOC.some((r) => r.test(f))) return false;
    const m = f.match(/^_acceptance\/([^/]+)\/(.+)$/);
    if (m && ghimMap[m[1]] && (["run-log.jsonl", "evidence-report.md"].includes(m[2]) || ghimMap[m[1]].includes(m[2]))) return false;
    return true;
  });
}

test("AC-8 «diff từ nhánh chính chỉ chạm tệp của việc chuyển chợ»: vật thật 0 tệp lạ, bản cấy đỏ", () => {
  const tep = git("diff", "--name-only", `${NEN}...HEAD`).split("\n").filter(Boolean);
  assert.ok(tep.includes(".claude/settings.json"), "đối chứng: diff có tệp của việc chuyển chợ");
  assert.deepEqual(ngoaiPhamVi(tep), []);
  const mot = Object.keys(GHIM)[0];
  assert.ok(mot, "hợp đồng chưa nêu hồ sơ ghim lại nào");
  const cay = ["packages/core/src/agreements.ts", "_acceptance/luat-chia-lead/contract.md", `_acceptance/${mot}/contract.md`, `_acceptance/${mot}/evals.yaml`];
  assert.deepEqual(ngoaiPhamVi([...tep, ...cay]), cay);
  assert.deepEqual(ngoaiPhamVi([`_acceptance/${mot}/${GHIM[mot][0]}`], {}), [`_acceptance/${mot}/${GHIM[mot][0]}`], "đối chứng: tệp đo chỉ được phép khi hợp đồng nêu tên");
});
