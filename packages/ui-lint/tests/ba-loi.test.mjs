// Trang ba lối (hồ sơ the-ba-loi, E1–E9). CLI chạy bằng tiến trình con trên kho tạm; ảnh thử sinh bằng bộ mã PNG dưới
// (rộng đúng khổ), ảnh vật thử chép từ hai hồ sơ đã ký; bảng và nhóm chép từ tệp thật của kho.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { kiemChuan, tepVetKhoi } from "../kiem-chuan.mjs";
import { rongPng } from "../lib/ba-loi.mjs";
import { tepBanDoHeThietKe } from "../lib/ban-do-he-thiet-ke.mjs";
import { tepBoCucCan } from "../lib/bo-cuc.mjs";
import { docBanDo } from "../lib/ban-do.mjs";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(PKG, "..", "..");
const CLI = join(PKG, "doi-chieu.mjs");
const SLUG = "thu-ba-loi";
const LOI = ["trong-kho", "reui", "ve-moi"];
const KHO = [1440, 375];
const VO = "docs/design/vo-va-ia.md";

const crc = (b) => {
  let c = ~0;
  for (const x of b) {
    c ^= x;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
};
/** PNG hợp lệ rộng `w`, cao 1, một màu. */
function png(w) {
  const chunk = (t, d) => {
    const l = Buffer.alloc(4);
    l.writeUInt32BE(d.length);
    const td = Buffer.concat([Buffer.from(t, "latin1"), d]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([l, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(1, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(w * 3, 120)]);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(row)), chunk("IEND", Buffer.alloc(0))]);
}

const git = (d, ...a) => execFileSync("git", ["-C", d, "-c", "user.email=may@example.test", "-c", "user.name=may", ...a], { encoding: "utf8" });
const chay = (d, ...a) => spawnSync(process.execPath, [CLI, "--root", d, ...a], { encoding: "utf8" });
const ghi = (d, t, s) => (mkdirSync(dirname(join(d, t)), { recursive: true }), writeFileSync(join(d, t), s));
const sua = (d, t, f) => writeFileSync(join(d, t), f(readFileSync(join(d, t), "utf8")));
const thuMuc = (d, slug = SLUG) => join(d, "_acceptance", slug, "ba-loi");

function tam(fn) {
  const d = mkdtempSync(join(tmpdir(), "ba-loi-"));
  try {
    return fn(d);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}
/** Kho git tạm chép design/patterns, vo-va-ia.md và một màn của nhóm cai-dat-san từ kho thật, commit gốc. */
function kho(fn) {
  return tam((d) => {
    for (const t of ["design/patterns", VO, "apps/web/src/app/settings/users/page.tsx"]) cpSync(join(ROOT, t), join(d, t), { recursive: true });
    git(d, "init", "-q");
    git(d, "add", "-A");
    git(d, "commit", "-qm", "goc");
    return fn(d, git(d, "rev-parse", "HEAD").trim());
  });
}

const DU = {
  man: "Màn thử",
  khuyen: { loi: "reui", ly_do: "Đúng khối đích; đọc một lần cuộn." },
  loi: {
    "trong-kho": { nhan: "Khuôn Cài đặt sàn", dong_co: "Động cơ trong kho.", danh_doi: "Đánh đổi trong kho." },
    reui: { nhan: "solution-crm-4", dong_co: "Động cơ ReUI.", danh_doi: "Đánh đổi ReUI." },
    "ve-moi": { nhan: "Ghép Frame + Tabs", dong_co: "Động cơ vẽ mới.", danh_doi: "Đánh đổi vẽ mới." },
  },
};
/** Đặt ba-loi.json và sáu ảnh đúng khổ vào hồ sơ. */
function datDu(d, du = DU, slug = SLUG) {
  const t = thuMuc(d, slug);
  mkdirSync(t, { recursive: true });
  writeFileSync(join(t, "ba-loi.json"), JSON.stringify(du, null, 2));
  for (const l of LOI) for (const k of KHO) writeFileSync(join(t, `${l}-${k}.png`), png(k));
}
const doc = (d, slug = SLUG) => readFileSync(join(thuMuc(d, slug), "index.html"), "utf8");
const cotCua = (h) => [...h.matchAll(/<section data-loi="([a-z-]+)"/g)].map((m) => m[1]);
const sectionCua = (h, l) => h.split(`<section data-loi="${l}"`)[1].split("</section>")[0];

describe("ba lối: kế hoạch sáu ảnh và khung", () => {
  it("in sáu ảnh, ghi khung, không đè", () =>
    tam((d) => {
      const r = chay(d, "--ba-loi", "--slug", SLUG);
      assert.equal(r.status, 0, r.stderr);
      const ten = r.stdout.trim().split("\n").map((l) => l.split("ba-loi/")[1]);
      assert.equal(ten.length, 6);
      assert.deepEqual(new Set(ten), new Set(LOI.flatMap((l) => KHO.map((k) => `${l}-${k}.png`))));
      const p = join(thuMuc(d), "ba-loi.json");
      const k = JSON.parse(readFileSync(p, "utf8"));
      assert.deepEqual(Object.keys(k), ["man", "khuyen", "loi"]);
      assert.deepEqual(Object.keys(k.loi), LOI);
      k.man = "Đã điền";
      writeFileSync(p, JSON.stringify(k));
      assert.equal(chay(d, "--ba-loi", "--slug", SLUG).status, 0);
      assert.equal(JSON.parse(readFileSync(p, "utf8")).man, "Đã điền");
    }));
});

describe("ba lối: khung đi trọn tới trang", () => {
  it("khung chưa điền → mã 1 gọi tên ba lối, lời khuyên, màn; điền đúng khoá → mã 0", () =>
    tam((d) => {
      chay(d, "--ba-loi", "--slug", SLUG);
      const r = chay(d, "--dung-ba-loi", SLUG);
      assert.equal(r.status, 1, r.stderr);
      const dong = r.stderr.trim().split("\n");
      for (const l of LOI) assert.equal(dong.filter((x) => x.startsWith(`ba lối «${l}»`)).length, 1, `${l}: ${r.stderr}`);
      assert.ok(dong.some((x) => x.startsWith("ba lối «lời khuyên»")));
      assert.ok(dong.some((x) => x.startsWith("ba lối «màn»")));
      const p = join(thuMuc(d), "ba-loi.json");
      const k = JSON.parse(readFileSync(p, "utf8"));
      k.man = "Màn thử";
      k.khuyen.loi = "trong-kho";
      k.khuyen.ly_do = "Lý do.";
      for (const l of LOI) for (const f of Object.keys(k.loi[l])) k.loi[l][f] = `${f} ${l}`;
      writeFileSync(p, JSON.stringify(k));
      for (const l of LOI) for (const kh of KHO) writeFileSync(join(thuMuc(d), `${l}-${kh}.png`), png(kh));
      const r2 = chay(d, "--dung-ba-loi", SLUG);
      assert.equal(r2.status, 0, r2.stderr);
    }));
});

describe("ba lối: dựng trang đủ ba cột", () => {
  it("lời khuyên ghim đầu, ba cột đúng thứ tự, cột khuyên đánh dấu, ảnh nhúng, tất định", () =>
    tam((d) => {
      datDu(d);
      assert.equal(chay(d, "--dung-ba-loi", SLUG).status, 0);
      const h = doc(d);
      assert.deepEqual(cotCua(h), LOI);
      const iKh = h.indexOf("data-khuyen=");
      assert.ok(iKh > 0 && iKh < h.indexOf("<section"), "lời khuyên đứng trước cột đầu");
      const kh = h.slice(iKh).split("</div>")[0];
      assert.match(kh, /ReUI/);
      assert.ok(kh.includes(DU.khuyen.ly_do));
      assert.deepEqual([...h.matchAll(/<section data-loi="([a-z-]+)" class="chon"/g)].map((m) => m[1]), ["reui"]);
      for (const l of LOI) {
        const s = sectionCua(h, l);
        assert.equal([...s.matchAll(/<img src="data:image\/png;base64,/g)].length, 2, l);
        assert.ok(s.includes(DU.loi[l].dong_co) && s.includes(DU.loi[l].danh_doi), l);
      }
      assert.doesNotMatch(h, /src="(?!data:)/);
      chay(d, "--dung-ba-loi", SLUG);
      assert.equal(doc(d), h);
    }));
});

describe("ba lối: lối không có vẫn giữ cột", () => {
  it("khai không có → cột ghi «không có» và điều đã tra, không ảnh", () =>
    tam((d) => {
      const da = "`saved views` → không có";
      datDu(d, { ...DU, loi: { ...DU.loi, "ve-moi": { khong_co: true, da_tra: da } } });
      for (const k of KHO) unlinkSync(join(thuMuc(d), `ve-moi-${k}.png`));
      const r = chay(d, "--dung-ba-loi", SLUG);
      assert.equal(r.status, 0, r.stderr);
      const s = sectionCua(doc(d), "ve-moi");
      assert.ok(s.includes("không có") && s.includes("`saved views` → không có"));
      assert.doesNotMatch(s, /<img/);
    }));
  it("lối rỗng → đỏ gọi tên lối, không ghi trang", () =>
    tam((d) => {
      datDu(d, { ...DU, loi: { ...DU.loi, "ve-moi": {} } });
      const r = chay(d, "--dung-ba-loi", SLUG);
      assert.equal(r.status, 1);
      assert.match(r.stderr, /ba lối «ve-moi»/);
      assert.ok(!existsSync(join(thuMuc(d), "index.html")));
    }));
  it("khai không có mà thiếu điều đã tra → đỏ", () =>
    tam((d) => {
      datDu(d, { ...DU, loi: { ...DU.loi, "ve-moi": { khong_co: true, da_tra: "" } } });
      const r = chay(d, "--dung-ba-loi", SLUG);
      assert.equal(r.status, 1);
      assert.match(r.stderr, /ba lối «ve-moi».*đã tra/);
    }));
});

describe("ba lối: trang sai thì đỏ gọi tên", () => {
  const voi = (f) => (du) => {
    const c = structuredClone(du);
    f(c);
    return c;
  };
  const CA = [
    ["thiếu dong_co", voi((c) => (c.loi.reui.dong_co = "")), null, "ba lối «reui»", "động cơ"],
    ["thiếu danh_doi", voi((c) => (c.loi.reui.danh_doi = "")), null, "ba lối «reui»", "đánh đổi"],
    ["thiếu nhan", voi((c) => (c.loi.reui.nhan = "")), null, "ba lối «reui»", "nhãn"],
    ["thiếu ảnh", null, (t) => unlinkSync(join(t, "reui-375.png")), "ba lối «reui»", "thiếu ảnh reui-375.png"],
    ["ảnh sai khổ", null, (t) => writeFileSync(join(t, "reui-1440.png"), png(1280)), "ba lối «reui»", "khổ 1440"],
    ["ảnh không phải PNG", null, (t) => writeFileSync(join(t, "reui-375.png"), "không phải ảnh"), "ba lối «reui»", "PNG"],
    ["khuyên lối lạ", voi((c) => (c.khuyen.loi = "khac")), null, "ba lối «lời khuyên»", "khac"],
    ["khuyên lối không có", voi((c) => (c.loi["ve-moi"] = { khong_co: true, da_tra: "x" }, (c.khuyen.loi = "ve-moi"))), null, "ba lối «lời khuyên»", "không có"],
    ["khuyên thiếu lý do", voi((c) => (c.khuyen.ly_do = "")), null, "ba lối «lời khuyên»", "lý do"],
    ["thiếu tên màn", voi((c) => (c.man = "")), null, "ba lối «màn»", "tên màn"],
  ];
  it("ma trận đủ 10 ca", () => assert.equal(CA.length, 10));
  for (const [ten, suaDu, suaAnh, ai, dieu] of CA)
    it(`${ten} → thoát 1, «${ai}» · «${dieu}», không ghi trang`, () =>
      tam((d) => {
        datDu(d, suaDu ? suaDu(DU) : DU);
        if (suaAnh) suaAnh(thuMuc(d));
        const r = chay(d, "--dung-ba-loi", SLUG);
        assert.equal(r.status, 1, r.stdout);
        const dong = r.stderr.split("\n").find((l) => l.startsWith(ai));
        assert.ok(dong && dong.includes(dieu), r.stderr);
        assert.ok(!existsSync(join(thuMuc(d), "index.html")));
      }));
  it("đối chứng: bản đủ → 0; json vắng → 2", () =>
    tam((d) => {
      datDu(d);
      assert.equal(chay(d, "--dung-ba-loi", SLUG).status, 0);
      assert.equal(chay(d, "--dung-ba-loi", "khac").status, 2);
    }));
});

/** Dòng bảng §3 chép từ dòng «Luật chia lead» thật, đổi tên Chỗ. */
const themChoHo = (md, ten) => {
  const dong = md.split("\n").find((l) => l.startsWith("| Luật chia lead |"));
  return md.replace(dong, `${dong}\n${dong.replace("| Luật chia lead |", `| ${ten} |`)}`);
};
const dieuIn = (r) => r.stdout.split("\n").filter((l) => l.startsWith("ô chưa có khuôn: "));

describe("ô chưa có khuôn: nhận ba loại", () => {
  const CA = [
    ["nhóm mới", (d) => ghi(d, "design/patterns/thu-moi.md", readFileSync(join(ROOT, "design/patterns/trang-tam.md"), "utf8")), "ô chưa có khuôn: nhóm mới thu-moi"],
    ["đổi khối đích", (d) => sua(d, VO, (s) => s.replace("[`auth-15`](https://reui.io/preview/radix/auth-15) | trọn", "[`auth-4`](https://reui.io/preview/radix/auth-4) | trọn")), "ô chưa có khuôn: đổi khối đích Đăng nhập"],
    ["chỗ hở mới", (d) => sua(d, VO, (s) => themChoHo(s, "Ô thử")), "ô chưa có khuôn: chỗ hở mới Ô thử"],
  ];
  it("ma trận 3 ca", () => assert.equal(CA.length, 3));
  for (const [ten, lam, mong] of CA)
    it(`${ten} → «${mong}», cây làm việc và --den như nhau`, () =>
      kho((d, goc) => {
        lam(d);
        const r = chay(d, "--kiem-ba-loi", "--base", goc, "--slug", SLUG);
        assert.deepEqual(dieuIn(r), [mong], r.stdout + r.stderr);
        git(d, "add", "-A");
        git(d, "commit", "-qm", "dau");
        const r2 = chay(d, "--kiem-ba-loi", "--base", goc, "--den", "HEAD", "--slug", SLUG);
        assert.deepEqual(dieuIn(r2), [mong]);
      }));
  it("đối chứng: sửa chữ ô «Vì sao không đứng» của dòng cũ → không điều nào", () =>
    kho((d, goc) => {
      sua(d, VO, (s) => s.replace("Khối luật định tuyến cho AI", "Khối luật định tuyến (sửa chữ) cho AI"));
      const r = chay(d, "--kiem-ba-loi", "--base", goc, "--slug", SLUG);
      assert.equal(r.status, 0);
      assert.deepEqual(dieuIn(r), []);
      assert.match(r.stdout, /không cần trang/);
    }));
  it("--den trỏ commit không có → mã 2", () => kho((d, goc) => assert.equal(chay(d, "--kiem-ba-loi", "--base", goc, "--den", "khong-co", "--slug", SLUG).status, 2)));
});

const dp = (d, dv) => ghi(d, `_acceptance/${SLUG}/design-pass.md`, `---\nslug: ${SLUG}\ndivergence: ${dv}\n---\n# design-pass\n`);

describe("ô chưa có khuôn: bỏ bước phân kỳ thì đỏ", () => {
  const nhomMoi = (d) => ghi(d, "design/patterns/thu-moi.md", readFileSync(join(ROOT, "design/patterns/trang-tam.md"), "utf8"));
  const CA = [
    ["design-pass vắng", () => {}, "design-pass.md"],
    ["skipped", (d) => dp(d, "skipped — khối đích đã chốt"), "skipped"],
    ["opened mà thiếu trang", (d) => dp(d, "opened"), "ba-loi.json"],
    ["trang sai (thiếu danh_doi)", (d) => (dp(d, "opened"), datDu(d, { ...DU, loi: { ...DU.loi, reui: { ...DU.loi.reui, danh_doi: "" } } })), "đánh đổi"],
    ["trang sửa tay sau khi dựng", (d) => (dp(d, "opened"), datDu(d), chay(d, "--dung-ba-loi", SLUG), sua(d, `_acceptance/${SLUG}/ba-loi/index.html`, (s) => s.replace("Động cơ ReUI.", "Động cơ khác."))), "khác bản dựng lại"],
  ];
  it("ma trận 5 ca đỏ", () => assert.equal(CA.length, 5));
  for (const [ten, lam, dieu] of CA)
    it(`${ten} → thoát 1, «${dieu}»`, () =>
      kho((d, goc) => {
        nhomMoi(d);
        lam(d);
        const r = chay(d, "--kiem-ba-loi", "--base", goc, "--slug", SLUG);
        assert.equal(r.status, 1, r.stdout);
        assert.ok(r.stderr.includes(dieu), r.stderr);
      }));
  it("đối chứng: opened cùng trang dựng bằng lệnh → 0", () =>
    kho((d, goc) => {
      nhomMoi(d);
      dp(d, "opened — màn đầu nhóm thu-moi");
      datDu(d);
      chay(d, "--dung-ba-loi", SLUG);
      const r = chay(d, "--kiem-ba-loi", "--base", goc, "--slug", SLUG);
      assert.equal(r.status, 0, r.stderr);
      assert.match(r.stdout, /bước phân kỳ đã mở/);
    }));
});

describe("ô chưa có khuôn: đi khuôn sẵn thì không cần trang", () => {
  for (const [ten, lam] of [
    ["skipped", (d) => dp(d, "skipped")],
    ["design-pass vắng", () => {}],
  ])
    it(`sửa màn nhóm có sẵn, ${ten} → 0, không cần trang`, () =>
      kho((d, goc) => {
        sua(d, "apps/web/src/app/settings/users/page.tsx", (s) => s + "\n// sửa thử\n");
        sua(d, VO, (s) => s.replace("# Vỏ, IA và khối đích của từng màn", "# Vỏ, IA và khối đích của từng màn (sửa thử)"));
        lam(d);
        const r = chay(d, "--kiem-ba-loi", "--base", goc, "--slug", SLUG);
        assert.equal(r.status, 0, r.stderr);
        assert.match(r.stdout, /không cần trang/);
        assert.deepEqual(dieuIn(r), []);
      }));
});

/** Chữ của hai trang tay đã ký — động cơ, đánh đổi, lời khuyên chép từ index.html của hồ sơ ấy. */
const VAT_THU = {
  "cot-ho-so-can": {
    man: "Cột hồ sơ căn",
    khuyen: { loi: "reui", ly_do: "Đúng khối đích đã chọn cho Hồ sơ căn; giá, mức đủ và lịch sử trả giá cùng một lần cuộn." },
    loi: {
      "trong-kho": { nhan: "Khuôn Cài đặt sàn: mỗi mục một khung có tiêu đề", dong_co: "Đã có trong kho, quen mắt với Cài đặt sàn.", danh_doi: "Bốn khung chồng ăn chỗ; lịch sử rơi xuống đáy, phải cuộn mới thấy." },
      reui: { nhan: "solution-crm-4 chuyển thành cột: giá + mức đủ, trường chính, dòng thời gian", dong_co: "Khối đích đã chốt; giá, mức đủ và lịch sử đọc trong một cuộn.", danh_doi: "Khối gốc là ngăn phủ — phải đổi thành cột chia đôi; dài hơn Vẽ mới." },
      "ve-moi": { nhan: "Ghép khung + ba ngăn: Căn · Lần rao · Lịch sử", dong_co: "Gọn nhất, không cuộn.", danh_doi: "Lịch sử và lần rao nằm sau một chạm; tự ghép nên phải ghi «Chỗ hở» kèm hạn xem lại." },
    },
  },
  "lead-bon-nac": {
    man: "Lead đã nhập · bốn nấc",
    khuyen: { loi: "reui", ly_do: "Khối đích đã chọn ở ADR-0002 đứng được sau chuyển thể: tám lead vừa một màn 1440 không cuộn, cột Nấc thẳng hàng để quét, co về hai cột trên điện thoại." },
    loi: {
      "trong-kho": { nhan: "Khuôn Frame của Ô nhận lead", dong_co: "Không cài gì mới: khuôn Frame của Ô nhận lead, mỗi lead một dòng Item viền với nấc là Badge và giờ.", danh_doi: "Thưa nhất trong ba lối (cần cuộn từ lead thứ tám ở 1440) và nấc nằm lệch phải theo độ dài dòng, khó quét dọc." },
      reui: { nhan: "list-11 đã cài, chuyển thể", dong_co: "Khối đích list-11 (Frame stacked, bảng ba cột, Badge -light): Lead · Nấc · Giờ và đầu chủ.", danh_doi: "Thêm thành phần table vào kho và một bảng thứ hai cạnh data-grid; lead bị trả lại vẫn nằm theo thời gian, không nổi lên đầu." },
      "ve-moi": { nhan: "Bốn cột theo nấc", dong_co: "Trục là nấc, không phải thời gian: bốn cột Đã gửi · Đã nhận · Đã gọi · Lên bảng.", danh_doi: "Không vừa cột phải hẹp cạnh Ô nhận lead, bỏ thứ tự «mới nhất trước»." },
    },
  },
};

describe("vật thử: trang 17 và 27 dựng bằng lệnh", () => {
  it("ma trận 2 hồ sơ", () => assert.equal(Object.keys(VAT_THU).length, 2));
  for (const [ho, du] of Object.entries(VAT_THU))
    it(`${ho}: ảnh thật đúng khổ, trang đủ ba cột, sáu ảnh nhúng`, () =>
      tam((d) => {
        const t = thuMuc(d);
        mkdirSync(t, { recursive: true });
        for (const l of LOI)
          for (const k of KHO) {
            const b = readFileSync(join(ROOT, "_acceptance", ho, "ba-loi", `${l}-${k}.png`));
            assert.equal(rongPng(b), k, `${ho} ${l}-${k}`);
            writeFileSync(join(t, `${l}-${k}.png`), b);
          }
        writeFileSync(join(t, "ba-loi.json"), JSON.stringify(du));
        const r = chay(d, "--dung-ba-loi", SLUG);
        assert.equal(r.status, 0, r.stderr);
        const h = doc(d);
        assert.deepEqual(cotCua(h), LOI);
        assert.equal([...h.matchAll(/<img src="data:image\/png;base64,/g)].length, 6);
      }));
});

describe("vật thử: lịch sử bảng thật", () => {
  /** Kho có gốc là bản đổi của tệp thật, đầu là tệp thật. */
  const truocSau = (lamGoc, fn) =>
    tam((d) => {
      for (const t of ["design/patterns", VO]) cpSync(join(ROOT, t), join(d, t), { recursive: true });
      const that = new Map(["design/patterns/ho-so-can.md", "design/patterns/lead-cua-toi.md", VO].map((t) => [t, readFileSync(join(d, t), "utf8")]));
      lamGoc(d);
      git(d, "init", "-q");
      git(d, "add", "-A");
      git(d, "commit", "-qm", "goc");
      const goc = git(d, "rev-parse", "HEAD").trim();
      for (const [t, s] of that) ghi(d, t, s);
      return fn(chay(d, "--kiem-ba-loi", "--base", goc, "--slug", SLUG));
    });
  it("nhóm thật ho-so-can và lead-cua-toi thêm vào → nhóm mới", () =>
    truocSau(
      (d) => ["ho-so-can", "lead-cua-toi"].forEach((n) => unlinkSync(join(d, `design/patterns/${n}.md`))),
      (r) => assert.deepEqual(dieuIn(r), ["ô chưa có khuôn: nhóm mới ho-so-can", "ô chưa có khuôn: nhóm mới lead-cua-toi"]),
    ));
  it("dòng «Cột hồ sơ cạnh bảng» thật thêm vào §3 → chỗ hở mới", () =>
    truocSau(
      (d) => sua(d, VO, (s) => s.split("\n").filter((l) => !l.startsWith("| Cột hồ sơ cạnh bảng |")).join("\n")),
      (r) => assert.deepEqual(dieuIn(r), ["ô chưa có khuôn: chỗ hở mới Cột hồ sơ cạnh bảng"]),
    ));
  it("§3 hai cột (cùng 13 tên Chỗ, như trước hàng 83) → năm cột: không điều nào", () =>
    truocSau(
      (d) =>
        sua(d, VO, (s) =>
          s
            .split("\n")
            .map((l) => {
              if (!/^\| /.test(l) || !s.split("## 3.")[1]?.split("\n## ")[0].includes(l)) return l;
              const o = l.trim().slice(1, -1).split("|");
              return `|${o[0]}|${o[1]}|`;
            })
            .join("\n"),
        ),
      (r) => {
        assert.equal(r.status, 0, r.stderr);
        assert.deepEqual(dieuIn(r), []);
      },
    ));
});

// ——— Răng trên cây (kiểm chuẩn) ———
const TEP_CAY = ["apps/web/components.json", "apps/web/src", "design/patterns", ".agents/skills/quy-hang-ui", ".agents/skills/reui", "_acceptance/config.yaml", ".github/workflows/ci.yml", ".mcp.json"];
const HO_THAT = ["cot-ho-so-can", "lead-bon-nac"];
function cay(fn) {
  return tam((d) => {
    for (const rel of [...TEP_CAY, ...tepVetKhoi(ROOT), ...tepBanDoHeThietKe(ROOT), ...tepBoCucCan(ROOT, docBanDo(ROOT))]) cpSync(join(ROOT, rel), join(d, rel), { recursive: true });
    for (const h of HO_THAT) for (const t of ["design-pass.md", "ba-loi"]) cpSync(join(ROOT, "_acceptance", h, t), join(d, "_acceptance", h, t), { recursive: true });
    mkdirSync(join(d, ".claude/skills"), { recursive: true });
    for (const s of ["quy-hang-ui", "reui"]) symlinkSync(`../../.agents/skills/${s}`, join(d, ".claude/skills", s));
    return fn(d);
  });
}
const loiBaLoi = (d) => kiemChuan(d, { homNay: "2026-11-01" }).loi.filter((l) => l.startsWith("hồ sơ "));

describe("kiểm chuẩn: ba lối mở mà thiếu trang thì đỏ", () => {
  it("bản sao lành → không lỗi ba lối, dòng đếm 2 trang", () =>
    cay((d) => {
      const kq = kiemChuan(d, { homNay: "2026-11-01" });
      assert.deepEqual(loiBaLoi(d), []);
      assert.ok(kq.dong.includes("ba lối: 2 trang · 0 dựng bằng lệnh"), kq.dong.join("\n"));
    }));
  it("xoá trang của hồ sơ khai opened → đỏ gọi tên hồ sơ", () =>
    cay((d) => {
      unlinkSync(join(d, "_acceptance/lead-bon-nac/ba-loi/index.html"));
      assert.deepEqual(loiBaLoi(d), ["hồ sơ lead-bon-nac: design-pass mở bước phân kỳ mà thiếu ba-loi/index.html"]);
    }));
  it("ba-loi.json sai (thiếu danh_doi) → đỏ gọi tên hồ sơ", () =>
    cay((d) => {
      dp(d, "opened");
      datDu(d, { ...DU, loi: { ...DU.loi, reui: { ...DU.loi.reui, danh_doi: "" } } });
      const l = loiBaLoi(d);
      assert.equal(l.length, 1);
      assert.ok(l[0].startsWith(`hồ sơ ${SLUG}: ba lối «reui»`) && l[0].includes("đánh đổi"), l[0]);
    }));
  const trangSuaTay = (d, st) => {
    dp(d, "opened");
    datDu(d);
    chay(d, "--dung-ba-loi", SLUG);
    sua(d, `_acceptance/${SLUG}/ba-loi/index.html`, (s) => s.replace("Động cơ ReUI.", "Động cơ khác."));
    ghi(d, `_acceptance/${SLUG}/contract.md`, `---\nslug: ${SLUG}\nstatus: ${st}\n---\n`);
  };
  it("trang khác bản dựng lại ở hồ sơ draft → đỏ", () =>
    cay((d) => {
      trangSuaTay(d, "draft");
      const l = loiBaLoi(d);
      assert.equal(l.length, 1);
      assert.match(l[0], /khác bản dựng lại/);
    }));
  const DA_KY = ["signed-off", "machine-cleared"];
  it("ma trận 2 trạng thái đã ký", () => assert.equal(DA_KY.length, 2));
  for (const st of DA_KY)
    it(`trang khác bản dựng lại ở hồ sơ ${st} → giữ nguyên, không lỗi`, () =>
      cay((d) => {
        trangSuaTay(d, st);
        assert.deepEqual(loiBaLoi(d), []);
      }));
});
