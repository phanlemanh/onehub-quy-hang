// Bản đồ khuôn (hồ sơ ban-do-khuon-nhom-da-co, E1–E5). Ca «cây thật» đọc chính kho; mỗi ca đỏ chép bản đồ và
// apps/web/src thật sang thư mục tạm, kiểm bản sao lành ra 0 lỗi, 0 lệch, rồi phá ĐÚNG một chỗ và ghim thông điệp.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { docBanDo, kiemCay, KHOA_BAT_BUOC } from "../lib/ban-do.mjs";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(PKG, "..", "..");
const CLI = join(PKG, "ban-do-khuon.mjs");
const W = "apps/web/src";

function banSao() {
  const d = mkdtempSync(join(tmpdir(), "ban-do-"));
  for (const t of ["design/patterns", W]) cpSync(join(ROOT, t), join(d, t), { recursive: true });
  const lanh = docBanDo(d);
  const cay = kiemCay(d, lanh);
  assert.deepEqual(lanh.loi, [], "đối chứng dương: bản sao lành phải đọc 0 lỗi");
  assert.deepEqual(Object.values(cay).flatMap((r) => r.lech), [], "đối chứng dương: bản sao lành phải 0 lệch");
  return d;
}
const doc = (d, t) => readFileSync(join(d, t), "utf8");
function sua(d, t, cu, moi) {
  const s = doc(d, t);
  assert.ok(s.includes(cu), `bản sao ${t} không có đoạn cần phá: ${cu}`);
  writeFileSync(join(d, t), s.replace(cu, moi));
}
const lechCua = (d) => Object.values(kiemCay(d, docBanDo(d))).flatMap((r) => r.lech.map((l) => `${l.tep}: ${l.nhom} — ${l.dieu}`));
function voi(fn) {
  const d = banSao();
  try {
    fn(d);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}

const NHOM = ["cai-dat-san", "trang-tam", "trang-thai", "xac-thuc"];
const TRANG_TAM = [
  "exports/new",
  "imports/new",
  "inventory",
  "leads/new",
  "me",
  "shares",
  "team",
  "today",
  "units/[code]",
  "viewings",
].map((p) => `${W}/app/(app)/${p}/page.tsx`);
const BANG = {
  "xac-thuc": { theoKhuon: ["login", "no-company", "select-company"].map((p) => `${W}/app/(auth)/${p}/page.tsx`), ngoaiLe: [] },
  "cai-dat-san": {
    theoKhuon: [`${W}/app/settings/users/page.tsx`],
    ngoaiLe: [`${W}/app/settings/[section]/page.tsx`, `${W}/app/settings/page.tsx`],
  },
  "trang-tam": { theoKhuon: [...TRANG_TAM, `${W}/app/settings/[section]/page.tsx`], ngoaiLe: [] },
};
const NHAN_DIEN_TRANG_THAI = [
  ...TRANG_TAM.slice(0, 3),
  `${W}/app/(app)/layout.tsx`,
  ...TRANG_TAM.slice(3),
  ...["dang-xuat.tsx", "khung.tsx", "login/form.tsx", "login/page.tsx", "no-company/page.tsx", "select-company/danh-sach.tsx", "select-company/page.tsx"].map(
    (p) => `${W}/app/(auth)/${p}`,
  ),
  `${W}/app/layout.tsx`,
  `${W}/app/page.tsx`,
  ...["[section]/page.tsx", "khung.tsx", "layout.tsx", "page.tsx", "users/page.tsx", "users/quan-nguoi.tsx"].map((p) => `${W}/app/settings/${p}`),
  ...["account-menu", "app-shell", "company-switcher", "home-rail", "mobile-shell", "notifications", "placeholder", "second-column", "shell-layout", "unit-jump"].map(
    (p) => `${W}/components/shell/${p}.tsx`,
  ),
];
const CHO_TRANG_THAI = [
  `${W}/app/settings/users/page.tsx`,
  `${W}/app/settings/users/quan-nguoi.tsx`,
  `${W}/app/settings/users/quan-nguoi.tsx`,
  `${W}/components/shell/notifications.tsx`,
  `${W}/components/shell/placeholder.tsx`,
];

describe("E1 — bản đồ thật: bốn tệp đủ khoá §11.3", () => {
  const b = docBanDo(ROOT);
  it("bốn nhóm, 0 lỗi đọc", () => {
    assert.deepEqual(b.loi, []);
    assert.deepEqual(b.nhom.map((g) => g.data.nhom).sort(), NHOM);
    for (const g of b.nhom) assert.equal(`${g.data.nhom}.md`, g.tep);
  });
  // Ma trận viết trước: 4 nhóm × 9 khoá, mỗi ô một assert kiểu.
  const KIEU = {
    nhom: (v) => typeof v === "string" && v.length > 0,
    doi_tuong: (v) => Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "string"),
    khuon: (v) => typeof v?.ten === "string" && typeof v?.nhap === "string",
    nhan_dien: (v) => Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "string"),
    mau_dang_chay: (v) => typeof v?.tep === "string" && typeof v?.duong === "string" && Array.isArray(v?.trang_thai) && v.trang_thai.length > 0,
    khe_bat_buoc: (v) => Array.isArray(v) && v.every((x) => typeof x === "string"),
    cam_ngoai_khuon: (v) => Array.isArray(v) && v.every((x) => typeof x === "string"),
    ngoai_le: (v) => Array.isArray(v) && v.every((x) => typeof x.tep === "string" && typeof x.ly_do === "string" && x.ly_do.trim().length > 0),
    luat: (v) => Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "string"),
  };
  assert.deepEqual(Object.keys(KIEU), KHOA_BAT_BUOC, "ma trận phủ đúng chín khoá của bộ đọc");
  for (const n of NHOM)
    for (const k of KHOA_BAT_BUOC)
      it(`${n} · ${k}`, () => {
        const g = b.nhom.find((x) => x.data.nhom === n);
        assert.ok(KIEU[k](g.data[k]), `${n}.${k} sai kiểu: ${JSON.stringify(g.data[k])}`);
      });
  it("đối chứng: bản sao mất một tệp nhóm thì danh sách nhóm thiếu đúng tên ấy", () =>
    voi((d) => {
      unlinkSync(join(d, "design/patterns/trang-tam.md"));
      assert.deepEqual(docBanDo(d).nhom.map((g) => g.data.nhom).sort(), ["cai-dat-san", "trang-thai", "xac-thuc"]);
    }));
});

describe("E2 — bộ đọc từ chối bản đồ sai khuôn, gọi tên tệp và trường", () => {
  const P = "design/patterns";
  const CA = [
    ["thiếu khoá", `${P}/xac-thuc.md`, "luat: [KH-xt-khong-vo, KH-xt-loi-gan-o]\n", "", "xac-thuc.md: luat: thiếu khoá"],
    ["ngoại lệ thiếu ly_do", `${P}/cai-dat-san.md`, 'ly_do: "Chỉ chuyển hướng sang mục đầu (Người dùng), không dựng màn nào."', 'ly_do: " "', "cai-dat-san.md: ngoai_le[0] thiếu ly_do"],
    ["khuon.nhap không có tệp", `${P}/cai-dat-san.md`, '"@/app/settings/khung"', '"@/app/settings/khong-co"', "cai-dat-san.md: khuon.nhap: «@/app/settings/khong-co» không có tệp"],
    ["khuôn không xuất ten", `${P}/cai-dat-san.md`, "ten: MucCaiDat", "ten: MucKhac", "cai-dat-san.md: khuon.ten: apps/web/src/app/settings/khung.tsx không xuất hàm «MucKhac»"],
    ["khe không phải tham số", `${P}/cai-dat-san.md`, "khe_bat_buoc: [title, children]", "khe_bat_buoc: [title, tieuDe]", "cai-dat-san.md: khe_bat_buoc: «tieuDe» không phải tham số của khuôn MucCaiDat"],
    [
      "màn mẫu không khớp nhan_dien",
      `${P}/cai-dat-san.md`,
      'tep: "apps/web/src/app/settings/users/page.tsx"',
      'tep: "apps/web/src/app/(auth)/login/page.tsx"',
      "cai-dat-san.md: mau_dang_chay.tep: «apps/web/src/app/(auth)/login/page.tsx» không khớp nhan_dien",
    ],
    ["khối cấm không có thật", `${P}/trang-thai.md`, "AlertTitle]", "AlertTitle, KhongCo]", "trang-thai.md: cam_ngoai_khuon: KhongCo không thành phần nào"],
    ["mã luật không có trong thân", `${P}/trang-thai.md`, "KH-ts-chua-co-kieu]", "KH-ts-chua-co-kieu, KH-khong-co]", "trang-thai.md: luat: mã «KH-khong-co» không có câu luật trong thân tệp"],
    ["dòng ngoài tập con", `${P}/trang-thai.md`, "doi_tuong: [trong, loi, bao]", "doi_tuong:\n  - trong", "trang-thai.md: dòng 4: ngoài tập con đọc được"],
    [
      "một tệp thuộc hai nhóm màn",
      `${P}/cai-dat-san.md`,
      ', { tep: "apps/web/src/app/settings/[section]/page.tsx", ly_do: "Mục chưa dựng (mục 45–50 của lộ trình) đi khuôn trang tạm; mỗi mục dựng thật thì có trang riêng dựng MucCaiDat." }',
      "",
      "tệp «apps/web/src/app/settings/[section]/page.tsx» thuộc hai nhóm",
    ],
  ];
  for (const [ten, tep, cu, moi, ghim] of CA)
    it(ten, () =>
      voi((d) => {
        sua(d, tep, cu, moi);
        const { loi } = docBanDo(d);
        assert.ok(
          loi.some((l) => l.includes(ghim)),
          `thiếu lỗi «${ghim}», có: ${JSON.stringify(loi)}`,
        );
      }));
});

describe("E3 — nhóm đơn vị màn: mọi màn hiện có dựng khuôn ở gốc", () => {
  it("cây thật: 0 lệch, danh sách tệp mỗi nhóm khớp bảng viết trước", () => {
    const cay = kiemCay(ROOT, docBanDo(ROOT));
    for (const [n, mong] of Object.entries(BANG)) {
      assert.deepEqual(cay[n].lech, [], `${n} có lệch`);
      assert.deepEqual({ theoKhuon: cay[n].theoKhuon, ngoaiLe: cay[n].ngoaiLe }, mong, n);
    }
  });
  const USERS = `${W}/app/settings/users/page.tsx`;
  it("Người dùng tự dựng <main min-h-svh> như trước hàng này → lệch nêu main", () =>
    voi((d) => {
      sua(d, USERS, "return (\n    <MucCaiDat", 'return (\n    <main className="flex min-h-svh justify-center bg-background p-4">\n    <MucCaiDat');
      sua(d, USERS, "</MucCaiDat>\n  );", "</MucCaiDat>\n    </main>\n  );");
      assert.deepEqual(lechCua(d), [`${USERS}: cai-dat-san — gốc là <main>, phải là <MucCaiDat> (khuôn của nhóm cai-dat-san)`]);
    }));
  it("Người dùng trả <Frame> ở gốc → lệch nêu tệp, nhóm, khuôn", () =>
    voi((d) => {
      sua(d, USERS, 'import { TrangThai } from "@/components/trang-thai";', 'import { TrangThai } from "@/components/trang-thai";\nimport { Frame } from "@/components/reui/frame";');
      sua(d, USERS, '<MucCaiDat title="Người dùng" description={`Người của sàn ${me.activeCompany.name}`}>', "<Frame>");
      sua(d, USERS, "</MucCaiDat>", "</Frame>");
      assert.deepEqual(lechCua(d), [`${USERS}: cai-dat-san — gốc là <Frame>, phải là <MucCaiDat> (khuôn của nhóm cai-dat-san)`]);
    }));
  it("Đăng nhập nhập Khung cùng tên từ tệp khác → lệch nói tệp nhập sai", () =>
    voi((d) => {
      writeFileSync(join(d, W, "app/(auth)/login/khung-gia.tsx"), "export function Khung({ title, children }: { title: string; children: unknown }) {\n  return null;\n}\n");
      sua(d, `${W}/app/(auth)/login/page.tsx`, 'import { Khung } from "../khung";', 'import { Khung } from "./khung-gia";');
      assert.deepEqual(lechCua(d), [
        `${W}/app/(auth)/login/page.tsx: xac-thuc — nhập Khung từ «./khung-gia», không phải tệp khuôn ${W}/app/(auth)/khung.tsx`,
      ]);
    }));
  it("Chưa gắn sàn bỏ khe title → lệch nói khe", () =>
    voi((d) => {
      sua(d, `${W}/app/(auth)/no-company/page.tsx`, '<Khung title="Chưa thuộc sàn nào">', "<Khung>");
      assert.deepEqual(lechCua(d), [`${W}/app/(auth)/no-company/page.tsx: xac-thuc — <Khung> thiếu khe «title»`]);
    }));
});

describe("E4 — nhóm trạng thái: mọi chỗ trình trống · lỗi · báo đi qua TrangThai", () => {
  const QN = `${W}/app/settings/users/quan-nguoi.tsx`;
  it("cây thật: 0 lệch, nhan_dien và năm chỗ khớp bảng viết trước", () => {
    const r = kiemCay(ROOT, docBanDo(ROOT))["trang-thai"];
    assert.deepEqual(r.lech, []);
    assert.deepEqual(r.nhanDien, [...NHAN_DIEN_TRANG_THAI].sort());
    assert.deepEqual(r.theoKhuon.map((c) => c.replace(/:\d+$/, "")), CHO_TRANG_THAI);
  });
  it("dòng lỗi cũ <p role=\"alert\" className=\"text-sm text-destructive\"> của Người dùng → lệch", () =>
    voi((d) => {
      sua(d, QN, '<TrangThai kind="error" title={loiSua} />', '<p role="alert" className="text-sm text-destructive">\n                {loiSua}\n              </p>');
      const l = lechCua(d);
      assert.equal(l.length, 1, JSON.stringify(l));
      assert.match(l[0], /quan-nguoi\.tsx: trang-thai — dòng \d+: thẻ <p> trần mang role="alert" — dựng qua <TrangThai>/);
    }));
  it("<Empty> dùng thẳng ngoài khuôn ở chuông → lệch nêu Empty", () =>
    voi((d) => {
      const N = `${W}/components/shell/notifications.tsx`;
      sua(d, N, 'import { TrangThai } from "@/components/trang-thai";', 'import { TrangThai } from "@/components/trang-thai";\nimport { Empty } from "@/components/ui/empty";');
      sua(d, N, '          className="flex-1"\n        />', '          className="flex-1"\n        />\n        <Empty />');
      const l = lechCua(d);
      assert.equal(l.length, 1, JSON.stringify(l));
      assert.match(l[0], /notifications\.tsx: trang-thai — dòng \d+: <Empty> dùng ngoài khuôn — dựng qua <TrangThai>/);
    }));
  it("TrangThai thiếu kind → lệch nêu khe", () =>
    voi((d) => {
      sua(d, `${W}/components/shell/placeholder.tsx`, '            kind="empty"\n', "");
      const l = lechCua(d);
      assert.equal(l.length, 1, JSON.stringify(l));
      assert.match(l[0], /placeholder\.tsx: trang-thai — dòng \d+: <TrangThai> thiếu khe «kind»/);
    }));
  it("phải im: FieldError role=alert, CommandEmpty, tệp ngoài nhan_dien", () =>
    voi((d) => {
      assert.match(doc(d, `${W}/app/(auth)/login/form.tsx`), /<FieldError role="alert">/);
      assert.match(doc(d, `${W}/components/shell/unit-jump.tsx`), /<CommandEmpty/);
      writeFileSync(join(d, W, "lib/ngoai-nhom.tsx"), 'export function X() {\n  return <p role="alert">ngoài nhóm</p>;\n}\n');
      assert.deepEqual(lechCua(d), []);
    }));
});

describe("E5 — lệnh ban-do-khuon.mjs", () => {
  const chay = (root, ...a) => spawnSync(process.execPath, [CLI, "--root", root, ...a], { encoding: "utf8" });
  it("cây thật: mã 0, bốn dòng tóm tắt khớp số của bộ kiểm", () => {
    const r = chay(ROOT);
    assert.equal(r.status, 0, r.stderr);
    const dong = r.stdout.trim().split("\n");
    assert.deepEqual(dong, [
      "cai-dat-san: 1 tệp theo khuôn · 2 ngoại lệ · 0 lệch",
      "trang-tam: 11 tệp theo khuôn · 0 ngoại lệ · 0 lệch",
      "trang-thai: 5 chỗ theo khuôn · 0 ngoại lệ · 0 lệch",
      "xac-thuc: 3 tệp theo khuôn · 0 ngoại lệ · 0 lệch",
    ]);
    const j = JSON.parse(chay(ROOT, "--json").stdout);
    assert.deepEqual(
      Object.entries(j.nhom).map(([n, v]) => `${n}: ${v.theo_khuon} ${v.don_vi === "phan-tu" ? "chỗ" : "tệp"} theo khuôn · ${v.ngoai_le} ngoại lệ · ${v.lech} lệch`),
      dong,
    );
    assert.deepEqual(j.loi_doc, []);
  });
  it("bản sao có một lệch: mã 1, một dòng «tệp: nhóm — điều lệch»", () =>
    voi((d) => {
      sua(d, `${W}/app/(auth)/no-company/page.tsx`, '<Khung title="Chưa thuộc sàn nào">', "<Khung>");
      const r = chay(d);
      assert.equal(r.status, 1);
      assert.equal(r.stderr.trim(), `${W}/app/(auth)/no-company/page.tsx: xac-thuc — <Khung> thiếu khe «title»`);
      assert.match(r.stdout, /^xac-thuc: 2 tệp theo khuôn · 0 ngoại lệ · 1 lệch$/m);
      const j = JSON.parse(chay(d, "--json").stdout);
      assert.equal(j.nhom["xac-thuc"].lech, 1);
      assert.equal(j.lech.length, 1);
    }));
});
