// Fixture chép từ chính tệp thật của kho (round-trip bên ghi), rồi phá từng chỗ trên một bản sao mới.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as KC from "../kiem-chuan.mjs";
import { kiemChuan, tepVetKhoi } from "../kiem-chuan.mjs";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(PKG, "..", "..");
const SCRIPT = join(PKG, "kiem-chuan.mjs");
const TEP = [
  "apps/web/components.json",
  "apps/web/src",
  "design/patterns",
  ".agents/skills/quy-hang-ui",
  ".agents/skills/reui",
  "_acceptance/config.yaml",
  ".github/workflows/ci.yml",
];

function banSao() {
  const root = mkdtempSync(join(tmpdir(), "kiem-chuan-"));
  for (const rel of [...TEP, ...tepVetKhoi(ROOT)]) cpSync(join(ROOT, rel), join(root, rel), { recursive: true });
  mkdirSync(join(root, ".claude/skills"), { recursive: true });
  for (const s of ["quy-hang-ui", "reui"]) symlinkSync(`../../.agents/skills/${s}`, join(root, ".claude/skills", s));
  return root;
}
const sua = (root, rel, f) => writeFileSync(join(root, rel), f(readFileSync(join(root, rel), "utf8")));

function phaThu(ten, pha, thongDiep) {
  it(`phá: ${ten} → thoát 1, «${thongDiep}»`, () => {
    const root = banSao();
    try {
      pha(root);
      const r = spawnSync("node", [SCRIPT, "--root", root], { encoding: "utf8" });
      assert.equal(r.status, 1, r.stdout);
      assert.ok(r.stderr.includes(thongDiep), `stderr: ${r.stderr}`);
      assert.doesNotMatch(r.stdout, /chuẩn giao diện: đạt/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
}

describe("kiem-chuan.mjs", () => {
  it("đối chứng dương: bản sao lành → thoát 0, «chuẩn giao diện: đạt»", () => {
    const root = banSao();
    try {
      const r = spawnSync("node", [SCRIPT, "--root", root], { encoding: "utf8" });
      assert.equal(r.status, 0, r.stderr);
      assert.match(r.stdout, /chuẩn giao diện: đạt/);
      assert.match(r.stdout, /catalog khớp \d+ thành phần/);
      assert.match(r.stdout, /CI: job check chạy npm run lint/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("kho thật đạt", () => assert.deepEqual(kiemChuan(ROOT).loi, []));

  phaThu("style radix-nova", (r) => sua(r, "apps/web/components.json", (s) => s.replace('"base-nova"', '"radix-nova"')), "components.json: style");
  phaThu("bỏ registry @reui", (r) => sua(r, "apps/web/components.json", (s) => s.replace('"@reui"', '"@khac"')), "thiếu registry @reui");
  phaThu("xoá frame", (r) => unlinkSync(join(r, "apps/web/src/components/reui/frame.tsx")), "thiếu thành phần: frame");
  phaThu("thành phần mới chưa vào catalog", (r) => writeFileSync(join(r, "apps/web/src/components/ui/x.tsx"), "export {};\n"), "catalog.md thiếu: x");
  phaThu("catalog ghi thành phần không có", (r) => sua(r, ".agents/skills/quy-hang-ui/catalog.md", (s) => s.replace("| frame | reui |", "| frame | reui |\n| khong-co | ui | x | x |\n| frame-cu | reui |")), "catalog.md thừa: khong-co");
  phaThu(
    "thành phần dạng thư mục chưa vào catalog",
    (r) => {
      // Thư mục giả — data-grid thật đã cài và có dòng từ hàng 14.
      mkdirSync(join(r, "apps/web/src/components/reui/luoi-thu"));
      writeFileSync(join(r, "apps/web/src/components/reui/luoi-thu/luoi-thu.tsx"), "export {};\n");
    },
    "catalog.md thiếu: luoi-thu",
  );
  phaThu(
    "symlink reui trỏ sai",
    (r) => {
      unlinkSync(join(r, ".claude/skills/reui"));
      symlinkSync("../../.agents/skills/quy-hang-ui", join(r, ".claude/skills/reui"));
    },
    "symlink .claude/skills/reui",
  );
  phaThu("cấu hình thiếu ui_standards_skill", (r) => sua(r, "_acceptance/config.yaml", (s) => s.replace(/^ {2}ui_standards_skill:.*\n/m, "")), "ui_standards_skill");
  phaThu("cấu hình thiếu executors.design.floor", (r) => sua(r, "_acceptance/config.yaml", (s) => s.replace(/^ {2}design:\n {4}floor:.*\n/m, "")), "executors.design.floor");
  phaThu("cấu hình thiếu design.surface_globs", (r) => sua(r, "_acceptance/config.yaml", (s) => s.replace(/\ndesign:\n {2}surface_globs:.*\n(?: {4}- .*\n)+/, "\n")), "design.surface_globs");
  phaThu("job check bỏ npm run lint", (r) => sua(r, ".github/workflows/ci.yml", (s) => s.replace("      - run: npm run lint\n", "")), "job check thiếu npm run lint");
});

// Vết chọn khối (hàng 83 vet-chon-khoi, E2–E7): mọi ca dựng trên bản sao hai tệp thật, sửa đúng một ô.
const CATALOG = ".agents/skills/quy-hang-ui/catalog.md";
const VVI = "docs/design/vo-va-ia.md";
const HOM_NAY = "2026-11-01";
const voiBanSao = (fn) => {
  const root = banSao();
  try {
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
const loiVet = (root, homNay = HOM_NAY) => {
  const r = kiemChuan(root, { homNay });
  return { loi: r.loi.filter((l) => /^(catalog\.md (khối|thiếu khối)|vo-va-ia\.md chỗ hở)/.test(l)), canhBao: r.canhBao };
};
/** Sửa ô thứ `cot` của dòng bảng bắt đầu bằng `dauDong`, giữ nguyên mọi ô khác. */
const suaO = (root, rel, dauDong, cot, giaTri) =>
  sua(root, rel, (s) => {
    const dong = s.split("\n");
    const i = dong.findIndex((l) => l.startsWith(dauDong));
    assert.ok(i >= 0, `không thấy dòng ${dauDong}`);
    const o = dong[i].trim().slice(1, -1).split("|");
    o[cot] = ` ${giaTri} `;
    dong[i] = `|${o.join("|")}|`;
    return dong.join("\n");
  });
const DONG_SHELL = "| `@reui/app-shell-8` |";
const DONG_CHIA = "| Luật chia lead |";

describe("vết chọn khối — danh mục khối", () => {
  it("khối: chuyển thể mà thiếu dòng thì đỏ gọi tên khối", () =>
    voiBanSao((root) => {
      assert.deepEqual(loiVet(root).loi, [], "đối chứng dương: cây sạch không lỗi khối");
      writeFileSync(join(root, "apps/web/src/x.tsx"), "// chuyển thể `list-11` cho thử\nexport {};\n");
      const { loi } = loiVet(root);
      assert.ok(loi.some((l) => l.includes("catalog.md thiếu khối: list-11") && l.includes("x.tsx:1")), loi.join("\n"));
    }));

  it("khối: bộ quét bắt ba khối thật", () => {
    // Hàng 17 thêm `solution-crm-4` (Hồ sơ căn).
    const thatTren = ["app-shell-8", "data-grid-editing-6", "solution-crm-4"];
    assert.equal(thatTren.length, 3);
    const noi = spawnSync("grep", ["-rn", "chuyển thể", join(ROOT, "apps/web/src")], { encoding: "utf8" }).stdout;
    for (const khoi of thatTren)
      voiBanSao((root) => {
        sua(root, CATALOG, (s) => s.split("\n").filter((l) => !l.startsWith(`| \`@reui/${khoi}\``)).join("\n"));
        const { loi } = loiVet(root);
        const dong = loi.find((l) => l.startsWith(`catalog.md thiếu khối: ${khoi} `));
        assert.ok(dong, `không bắt ${khoi}: ${loi.join("\n")}`);
        const tepDong = /chuyển thể ở (.+)\)$/.exec(dong)[1];
        assert.ok(noi.includes(tepDong.replace(/:(\d+)$/, ":$1:")), `${tepDong} không là chú thích thật`);
      });
    const soDong = (readFileSync(join(ROOT, CATALOG), "utf8").split("## Khối đã chuyển thể")[1].split(/\n## /)[0].match(/^\| `@reui\//gm) ?? []).length;
    voiBanSao((root) => {
      const { khoiDaChuyenThe } = KC;
      assert.equal(khoiDaChuyenThe(root).size, soDong);
    });
  });

  it("khối: tên đứng trước chữ chuyển thể không tính", () =>
    voiBanSao((root) => {
      writeFileSync(join(root, "apps/web/src/y.tsx"), "// khối đích `auth-15` chuyển thể ở việc riêng (Hỏi-3).\nexport {};\n");
      assert.deepEqual(loiVet(root).loi, []);
    }));

  it("khối: dòng thiếu ô hay trỏ sai thì đỏ gọi tên dòng và cột", () => {
    const COT = ["Khối gốc", "Archetype", "Nhóm đang dùng", "Tệp đang dùng", "Màn", "Ảnh chuẩn", "Phiên bản ReUI", "Duyệt", "Đã đổi gì khi chuyển thể"];
    const ca = [
      ...COT.slice(1).map((cot) => [cot, COT.indexOf(cot), ""]),
      ["Archetype", 1, "—"],
      ["Ảnh chuẩn", 5, "`_acceptance/khong-co.png`"],
      ["Tệp đang dùng", 3, "`apps/web/src/khong-co/`"],
      ["Tệp đang dùng", 3, "apps/web/src/khong-co/"],
      ["Nhóm đang dùng", 2, "nhom-khong-co"],
      ["Duyệt", 7, "hôm qua"],
      ["Duyệt", 7, "2026-10-31 · [Tên] · vo-ung-dung"],
      ["Phiên bản ReUI", 6, "mới nhất"],
    ];
    assert.equal(ca.length, 16);
    for (const [cot, i, giaTri] of ca)
      voiBanSao((root) => {
        suaO(root, CATALOG, DONG_SHELL, i, giaTri);
        const { loi } = loiVet(root);
        assert.ok(loi.some((l) => l.startsWith(`catalog.md khối app-shell-8: ${cot} — `)), `${cot}=«${giaTri}»: ${loi.join("\n")}`);
      });
  });
});

describe("vết chọn khối — Chỗ hở", () => {
  const bangThat = () => readFileSync(join(ROOT, VVI), "utf8").split("## 3. Chỗ hở")[1].split(/\n## /)[0];
  const dongThat = () => bangThat().split("\n").filter((l) => /^\| /.test(l)).slice(2).map((l) => l.trim().slice(1, -1).split("|").map((o) => o.trim()));

  it("chỗ hở: cây thật đủ năm ô cho 13 dòng", () => {
    const dong = dongThat();
    assert.equal(dong.length, 13);
    for (const o of dong) {
      assert.equal(o.length, 5, o[0]);
      for (const c of o) assert.ok(c !== "" && !/^[—–-]$/.test(c), `${o[0]}: ô rỗng`);
      assert.match(o[4], /^(\d{4}-\d{2}-\d{2}|khi )/, o[0]);
    }
    assert.deepEqual(kiemChuan(ROOT).loi.filter((l) => l.startsWith("vo-va-ia.md chỗ hở")), []);
  });

  it("chỗ hở: ô đã tra khớp kết quả ReUI thô", () => {
    const tho = readFileSync(join(ROOT, "_acceptance/vet-chon-khoi/evidence/reui-tra.md"), "utf8");
    const ketQua = new Map(
      tho.split(/^## /m).slice(1).map((k) => [/^`([^`]+)`/.exec(k)[1], [...k.matchAll(/^- (\S+)$/gm)].map((m) => m[1])]),
    );
    const khop = (o) => {
      const [, truyVan, ungVien] = /^`([^`]+)` → (.+)$/.exec(o[2]);
      assert.ok(ketQua.has(truyVan), `${o[0]}: truy vấn «${truyVan}» không có trong kết quả thô`);
      if (ungVien !== "không có") assert.ok(ketQua.get(truyVan).includes(ungVien), `${o[0]}: «${ungVien}» không nằm trong kết quả của truy vấn`);
    };
    for (const o of dongThat()) khop(o);
    const o = dongThat()[0];
    assert.throws(() => khop([o[0], o[1], o[2].replace(/→ .+$/, "→ khoi-khong-co-1")]), /không nằm trong kết quả/);
  });

  it("chỗ hở: dòng thiếu ô thì đỏ gọi tên dòng", () => {
    const COT = ["Chỗ", "Ghép", "Đã tra trên ReUI", "Vì sao không đứng", "Hạn xem lại"];
    const ca = [...COT.slice(1).flatMap((cot) => [[cot, ""], [cot, "—"]]), ["Hạn xem lại", "sau này"], ["Đã tra trên ReUI", "đã tra"], ["Ghép", " "]];
    assert.equal(ca.length, 11);
    voiBanSao((root) => assert.deepEqual(loiVet(root).loi, [], "đối chứng dương"));
    for (const [cot, giaTri] of ca)
      voiBanSao((root) => {
        suaO(root, VVI, DONG_CHIA, COT.indexOf(cot), giaTri);
        const { loi } = loiVet(root);
        assert.ok(loi.some((l) => l.startsWith(`vo-va-ia.md chỗ hở «Luật chia lead»: ${cot} — `)), `${cot}=«${giaTri}»: ${loi.join("\n")}`);
      });
  });

  it("chỗ hở: hạn đã tới thì cảnh báo có tên, không lỗi", () =>
    voiBanSao((root) => {
      suaO(root, VVI, DONG_CHIA, 4, "2026-10-30 — khi thử");
      let r = loiVet(root);
      assert.deepEqual(r.loi, []);
      assert.equal(r.canhBao.filter((c) => c.includes("«Luật chia lead»")).length, 1);
      assert.ok(r.canhBao.some((c) => c.includes("«Luật chia lead»") && c.includes("2026-10-30")));
      for (const han of ["2099-01-01 — sau", "khi có màn thứ hai"]) {
        suaO(root, VVI, DONG_CHIA, 4, han);
        r = loiVet(root);
        assert.equal(r.canhBao.filter((c) => c.includes("«Luật chia lead»")).length, 0, han);
      }
    }));

  it("chỗ hở: cây thật có bốn cảnh báo chỗ tạm", () => {
    const r = kiemChuan(ROOT, { homNay: HOM_NAY });
    assert.deepEqual(r.loi, []);
    assert.equal(r.canhBao.length, 4);
    for (const ten of ["Đăng nhập", "Ô nhận lead", "Trống · lỗi · báo", "Người dùng"])
      assert.equal(r.canhBao.filter((c) => c.includes(`«${ten}`)).length, 1, ten);
  });
});

describe("vết chọn khối — sửa ngoài hai bảng", () => {
  it("vết khối: sửa ngoài hai bảng thì đầu ra không đổi", () =>
    voiBanSao((root) => {
      const truoc = loiVet(root);
      sua(root, VVI, (s) => s.replace("## 4. Tránh", "## 4. Tránh\n\nĐoạn thử: chuyển thể list-11 sau này.\n"));
      sua(root, CATALOG, (s) => s.replace("## Khối đã chuyển thể", "## Ghi chú thử\n\n| a | b |\n| --- | --- |\n| x | y |\n\n## Khối đã chuyển thể"));
      mkdirSync(join(root, "docs/khac"), { recursive: true });
      writeFileSync(join(root, "docs/khac/ghi.md"), "chuyển thể `list-11`\n");
      assert.deepEqual(loiVet(root), truoc);
      suaO(root, VVI, DONG_CHIA, 3, "");
      assert.notDeepEqual(loiVet(root), truoc, "đối chứng dương: sửa trong bảng thì đầu ra đổi");
    }));
});
