// Răng của hệ bố cục (hàng 91, AC-9): ma trận viết trước — mỗi luật một tệp thử vi phạm và một tệp thử lành trên cùng
// khung; bài quét khuôn và ngoại lệ có hạn chạy trên bản sao bản đồ, app và lộ trình thật, phá đúng một chỗ mỗi ca.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Linter } from "eslint";
import plugin from "../index.mjs";
import { docBanDo } from "../lib/ban-do.mjs";
import { docLoTrinh, dongHan, kiemBoCuc, LO_TRINH, vungMienHan } from "../lib/bo-cuc.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const W = "apps/web/src";
const MOI = `${W}/app/(app)/thu-bo-cuc/page.tsx`;

// Neo cwd ở gốc kho: `npm test -w` chạy từ packages/ui-lint, «**/*.tsx» ngoài cwd thì không cấu hình nào khớp.
const linter = new Linter({ configType: "flat", cwd: ROOT });
function loi(luat, tep, ma) {
  return linter
    .verify(ma, [
      {
        files: ["**/*.tsx"],
        languageOptions: { ecmaVersion: "latest", sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } } },
        plugins: { "quy-hang-ui": plugin },
        rules: { [`quy-hang-ui/${luat}`]: "error" },
      },
    ], join(ROOT, tep))
    .map((m) => m.message);
}

// Ma trận viết trước: [luật, tệp, mã, có lỗi, chữ ghim trong thông điệp].
const TRANG = (lop) => `export default function Page() {\n  return <div className="${lop}"><span /></div>;\n}\n`;
const CON = (lop) => `export default function Page() {\n  return <div><span className="${lop}" /></div>;\n}\n`;
const MA_TRAN = [
  ["no-layout-arbitrary", MOI, TRANG("flex max-w-2xl"), true, "max-w-2xl"],
  ["no-layout-arbitrary", MOI, TRANG("h-[calc(100svh-10rem)]"), true, "h-[calc(100svh-10rem)]"],
  ["no-layout-arbitrary", MOI, TRANG("w-[320px]"), true, "w-[320px]"],
  ["no-layout-arbitrary", MOI, TRANG("min-h-[60svh]"), true, "min-h-[60svh]"],
  ["no-layout-arbitrary", MOI, TRANG("flex p-6"), true, "lề ở gốc trang"],
  ["no-layout-arbitrary", MOI, CON("p-6"), false, ""],
  ["no-layout-arbitrary", `${W}/components/bo-cuc/bo-cuc.tsx`, TRANG("max-w-(--container-doc)"), false, ""],
  ["no-raw-skeleton", MOI, 'import { Skeleton } from "@/components/ui/skeleton";\n', true, "ChoTai"],
  ["no-raw-skeleton", `${W}/components/bo-cuc/cho-tai.tsx`, 'import { Skeleton } from "@/components/ui/skeleton";\n', false, ""],
  ["no-direct-sheet", MOI, 'import { Sheet } from "@/components/ui/sheet";\n', true, "NganNoi"],
  ["no-direct-sheet", MOI, 'import { Drawer } from "@/components/ui/drawer";\n', true, "NganNoi"],
  ["no-direct-sheet", `${W}/components/bo-cuc/ngan-noi.tsx`, 'import { Sheet } from "@/components/ui/sheet";\n', false, ""],
];

function banSao() {
  const d = mkdtempSync(join(tmpdir(), "rang-bo-cuc-"));
  for (const t of ["design/patterns", W, LO_TRINH]) cpSync(join(ROOT, t), join(d, t), { recursive: true });
  // Hồ sơ của các hàng lộ trình nhắc tới: chỉ contract.md, để bộ đọc lộ trình biết hàng nào đã gộp.
  for (const slug of docLoTrinh(ROOT).keys()) {
    const hd = join(ROOT, "_acceptance", slug, "contract.md");
    if (!existsSync(hd)) continue;
    mkdirSync(join(d, "_acceptance", slug), { recursive: true });
    cpSync(hd, join(d, "_acceptance", slug, "contract.md"));
  }
  const lanh = kiemBoCuc(d, docBanDo(d));
  assert.deepEqual(lanh.lech, [], "đối chứng dương: bản sao lành phải 0 lệch bố cục");
  return d;
}
function sua(d, t, cu, moi) {
  const s = readFileSync(join(d, t), "utf8");
  assert.ok(s.includes(cu), `bản sao ${t} không có đoạn cần phá: ${cu}`);
  writeFileSync(join(d, t), s.split(cu).join(moi));
}
function voi(fn) {
  const d = banSao();
  try {
    fn(d);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}
const lechCua = (d) => kiemBoCuc(d, docBanDo(d)).lech.map((l) => `${l.tep}: ${l.nhom} — ${l.dieu}`);
const CAI_DAT = "design/patterns/cai-dat-san.md";
const BANG_HANG = "design/patterns/bang-hang.md";
// Hàng 79 (bang-hang-theo-loai-hinh, Hỏi-2 «chuyển»): trang thử nhanh-tuc-thi rời ngoại lệ có hạn, chịu luật như mọi màn.
// Cơ chế ngoại lệ có hạn thử trên bản sao: chèn lại đúng dòng ngoại lệ cũ với hạn cần thử.
const TRANG_THU = `${W}/app/(app)/proto/nhanh-tuc-thi/page.tsx`;
const BO_CUC_BH = "\nbo_cuc: danh-sach-chi-tiet";
const chenHan = (d, han) => sua(d, BANG_HANG, BO_CUC_BH, `${BO_CUC_BH}\nngoai_le_han: [{ tep: "${TRANG_THU}", han: ${han}, ly_do: "Ca thử của bài kiểm." }]`);

describe("răng của hệ bố cục", () => {
  it("răng: ma trận vi phạm", () => {
    let ca = 0;
    for (const [luat, tep, ma, coLoi, ghim] of MA_TRAN) {
      const m = loi(luat, tep, ma);
      if (coLoi) {
        assert.equal(m.length, 1, `${luat} · ${tep}: phải đúng một lỗi, ra ${JSON.stringify(m)}`);
        assert.ok(m[0].includes(ghim), `${luat}: thông điệp «${m[0]}» thiếu «${ghim}»`);
      } else assert.deepEqual(m, [], `${luat} · ${tep}: tệp lành phải xanh`);
      ca++;
    }
    assert.equal(ca, 12);
  });

  it("răng: vùng của màn còn ngoại lệ có hạn được bỏ qua", () => {
    // Bảng hàng rời ngoại lệ ở hàng 105, trang thử nhanh-tuc-thi ở hàng 79 — cả hai vùng chịu luật.
    assert.equal(loi("no-raw-skeleton", `${W}/app/(app)/proto/nhanh-tuc-thi/trang-thu.tsx`, 'import { Skeleton } from "@/components/ui/skeleton";\n').length, 1);
    assert.ok(!vungMienHan(docBanDo(ROOT)).includes(`${W}/app/(app)/proto/nhanh-tuc-thi/`), "trang thử còn trong vùng miễn");
    // Cơ chế: bản đồ mang ngoại lệ có hạn của trang thử thì vùng của nó được miễn.
    voi((d) => {
      chenHan(d, "bang-hang-theo-loai-hinh");
      assert.ok(vungMienHan(docBanDo(d)).includes(`${W}/app/(app)/proto/nhanh-tuc-thi/`), "ngoại lệ chèn lại không miễn vùng");
    });
    assert.equal(loi("no-raw-skeleton", `${W}/app/(app)/inventory/bang-hang.tsx`, 'import { Skeleton } from "@/components/ui/skeleton";\n').length, 1);
    assert.equal(loi("no-raw-skeleton", `${W}/app/(app)/shares/page.tsx`, 'import { Skeleton } from "@/components/ui/skeleton";\n').length, 1);
  });

  it("bài quét: nhóm thiếu bo_cuc thì đỏ", () =>
    voi((d) => {
      sua(d, CAI_DAT, "\nbo_cuc: doc", "");
      assert.deepEqual(lechCua(d), [
        `${W}/app/(app)/settings/ai/page.tsx: cai-dat-san — nhóm chưa khai bo_cuc (design/patterns/cai-dat-san.md)`,
        `${W}/app/(app)/settings/broker-page/page.tsx: cai-dat-san — nhóm chưa khai bo_cuc (design/patterns/cai-dat-san.md)`,
        `${W}/app/(app)/settings/dictionary/page.tsx: cai-dat-san — nhóm chưa khai bo_cuc (design/patterns/cai-dat-san.md)`,
        `${W}/app/(app)/settings/fees/page.tsx: cai-dat-san — nhóm chưa khai bo_cuc (design/patterns/cai-dat-san.md)`,
        `${W}/app/(app)/settings/fields/page.tsx: cai-dat-san — nhóm chưa khai bo_cuc (design/patterns/cai-dat-san.md)`,
        `${W}/app/(app)/settings/labels/page.tsx: cai-dat-san — nhóm chưa khai bo_cuc (design/patterns/cai-dat-san.md)`,
        `${W}/app/(app)/settings/lead-routing/page.tsx: cai-dat-san — nhóm chưa khai bo_cuc (design/patterns/cai-dat-san.md)`,
        `${W}/app/(app)/settings/statuses/page.tsx: cai-dat-san — nhóm chưa khai bo_cuc (design/patterns/cai-dat-san.md)`,
        `${W}/app/(app)/settings/templates/page.tsx: cai-dat-san — nhóm chưa khai bo_cuc (design/patterns/cai-dat-san.md)`,
        `${W}/app/(app)/settings/users/page.tsx: cai-dat-san — nhóm chưa khai bo_cuc (design/patterns/cai-dat-san.md)`,
      ]);
    }));

  it("bài quét: khuôn dựng BoCuc sai kiểu thì đỏ", () =>
    voi((d) => {
      sua(d, CAI_DAT, "\nbo_cuc: doc", "\nbo_cuc: tran");
      assert.deepEqual(lechCua(d), [
        `${W}/app/(app)/settings/ai/page.tsx: cai-dat-san — khuôn ${W}/app/(app)/settings/khung.tsx không dựng <BoCuc kieu="tran"> (đang dựng doc)`,
        `${W}/app/(app)/settings/broker-page/page.tsx: cai-dat-san — khuôn ${W}/app/(app)/settings/khung.tsx không dựng <BoCuc kieu="tran"> (đang dựng doc)`,
        `${W}/app/(app)/settings/dictionary/page.tsx: cai-dat-san — khuôn ${W}/app/(app)/settings/khung.tsx không dựng <BoCuc kieu="tran"> (đang dựng doc)`,
        `${W}/app/(app)/settings/fees/page.tsx: cai-dat-san — khuôn ${W}/app/(app)/settings/khung.tsx không dựng <BoCuc kieu="tran"> (đang dựng doc)`,
        `${W}/app/(app)/settings/fields/page.tsx: cai-dat-san — khuôn ${W}/app/(app)/settings/khung.tsx không dựng <BoCuc kieu="tran"> (đang dựng doc)`,
        `${W}/app/(app)/settings/labels/page.tsx: cai-dat-san — khuôn ${W}/app/(app)/settings/khung.tsx không dựng <BoCuc kieu="tran"> (đang dựng doc)`,
        `${W}/app/(app)/settings/lead-routing/page.tsx: cai-dat-san — khuôn ${W}/app/(app)/settings/khung.tsx không dựng <BoCuc kieu="tran"> (đang dựng doc)`,
        `${W}/app/(app)/settings/statuses/page.tsx: cai-dat-san — khuôn ${W}/app/(app)/settings/khung.tsx không dựng <BoCuc kieu="tran"> (đang dựng doc)`,
        `${W}/app/(app)/settings/templates/page.tsx: cai-dat-san — khuôn ${W}/app/(app)/settings/khung.tsx không dựng <BoCuc kieu="tran"> (đang dựng doc)`,
        `${W}/app/(app)/settings/users/page.tsx: cai-dat-san — khuôn ${W}/app/(app)/settings/khung.tsx không dựng <BoCuc kieu="tran"> (đang dựng doc)`,
      ]);
    }));

  it("ngoại lệ có hạn", () => {
    const that = kiemBoCuc(ROOT, docBanDo(ROOT));
    // Hàng 79 chuyển trang thử: bản đồ thật không còn ngoại lệ nào trỏ bang-hang-theo-loai-hinh; trang ở chỗ cũ.
    assert.ok(!that.han.some((x) => x.han === "bang-hang-theo-loai-hinh"), "còn ngoại lệ có hạn trỏ hàng 79");
    assert.ok(existsSync(join(ROOT, TRANG_THU)), "trang thử phải còn ở chỗ cũ (Hỏi-2: chuyển, không gỡ)");
    // Bảng hàng dựng Danh sách – chi tiết (hàng 105): không còn ngoại lệ có hạn.
    assert.ok(!that.han.some((x) => x.tep.startsWith(`${W}/app/(app)/inventory/`)), "Bảng hàng còn ngoại lệ có hạn");
    // Ngoại lệ trỏ hàng 79 chèn lại: còn hiệu lực khi 79 chưa gộp, «hạn đã tới» khi 79 đã gộp.
    const h79 = docLoTrinh(ROOT).get("bang-hang-theo-loai-hinh");
    voi((d) => {
      chenHan(d, "bang-hang-theo-loai-hinh");
      const kq = kiemBoCuc(d, docBanDo(d));
      if (h79?.daGop) assert.match(lechCua(d).join("\n"), /hạn đã tới — hàng 79 \(bang-hang-theo-loai-hinh\)/);
      else assert.equal(dongHan(kq.han.find((x) => x.tep === TRANG_THU)), `ngoại lệ có hạn: ${TRANG_THU} → hàng 79 (bang-hang-theo-loai-hinh)`);
    });
    // Hàng đã gộp chọn từ hồ sơ signed-off thật của lộ trình.
    const daGop = [...docLoTrinh(ROOT).values()].find((x) => x.daGop);
    assert.ok(daGop, "lộ trình phải có ít nhất một hàng đã gộp");
    voi((d) => {
      chenHan(d, daGop.slug);
      const l = lechCua(d);
      assert.equal(l.length, 1, JSON.stringify(l));
      for (const x of l) assert.match(x, new RegExp(`hạn đã tới — hàng ${daGop.ma} \\(${daGop.slug}\\)`));
    });
    voi((d) => {
      chenHan(d, "hang-khong-co");
      const l = lechCua(d);
      assert.equal(l.length, 1, JSON.stringify(l));
      for (const x of l) assert.match(x, /hạn lạ «hang-khong-co»/);
    });
    voi((d) => {
      chenHan(d, "he-bo-cuc");
      const l = lechCua(d);
      assert.equal(l.length, 1, JSON.stringify(l));
      for (const x of l) assert.match(x, /hạn lạ «he-bo-cuc»/);
    });
  });
});
