// Khu Cài đặt hợp nhất (hàng cai-dat-hop-nhat: E2, E3b, E4, E5, E6) — ma trận viết trước, mỗi ma trận kèm chiều đỏ
// trên bản sao hỏng; bài quét mã nguồn liệt kê tệp bằng máy, không danh sách tay.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { BAO_CHI_QUAN_TRI, chanMucSan, cotCaiDat, mucTaiKhoan, type NhomCot, PHAM_VI, PHAM_VI_MAY, tenNhomSan } from "./cai-dat";

const DIR = dirname(fileURLToPath(import.meta.url));
const APP = join(DIR, "..");
const SHELL = join(DIR, "../../../components/shell");
const doc = (p: string) => readFileSync(p, "utf8");
const SAN = "[Mẫu] Sàn A";

const TO_HOP: Record<string, string[]> = {
  "đầu chủ": ["listing_agent"],
  "đầu khách": ["buyer_agent"],
  "trưởng nhóm": ["team_lead"],
  telesales: ["telesales"],
  "quản trị": ["company_admin"],
  "quản trị + đầu chủ": ["company_admin", "listing_agent"],
};
const QUAN_TRI = (ten: string) => ten.startsWith("quản trị");

const MUC_SAN = ["Người dùng", "Cách gọi", "Trường riêng", "Trạng thái", "Luật chia lead", "Thuế phí", "Mẫu nhập", "Từ điển", "Xử lý bằng AI", "Trang môi giới"];

// E2 — cột mục lục của nhà Cài đặt.
function lechCot(f: (roles: string[], tenSan: string) => NhomCot[]): string[] {
  const out: string[] = [];
  for (const [ten, roles] of Object.entries(TO_HOP)) {
    const nhom = f(roles, SAN);
    const caNhan = nhom[0];
    if (caNhan?.tieuDe !== "Cá nhân" || caNhan.muc.length !== 1 || caNhan.muc[0]?.href !== "/settings/personal") out.push(`${ten}: thiếu nhóm Cá nhân`);
    const san = nhom.find((n) => n.tieuDe === tenNhomSan(SAN));
    if (QUAN_TRI(ten) !== Boolean(san)) out.push(`${ten}: nhóm Sàn ${san ? "có" : "không có"}`);
    if (san && JSON.stringify(san.muc.map((m) => m.label)) !== JSON.stringify(MUC_SAN)) out.push(`${ten}: mục sàn ${JSON.stringify(san.muc.map((m) => m.label))}`);
  }
  return out;
}

test("E2: cột Cài đặt — Cá nhân cho mọi vai, nhóm «Sàn [Mẫu] Sàn A» tám mục chỉ quản trị (6 tổ hợp)", () => {
  assert.deepEqual(lechCot(cotCaiDat), []);
  assert.equal(tenNhomSan(SAN), "Sàn [Mẫu] Sàn A");
});

test("E2: đối chứng đỏ — bản sao trả nhóm sàn cho đầu chủ → gọi tên vai", () => {
  const gia = (roles: string[], tenSan: string) => (roles.includes("listing_agent") ? cotCaiDat(["company_admin"], tenSan) : cotCaiDat(roles, tenSan));
  assert.deepEqual(lechCot(gia), ["đầu chủ: nhóm Sàn có"]);
});

test("E2: cột thứ hai dựng nhà Cài đặt từ cotCaiDat, không danh sách riêng", () => {
  const src = doc(join(SHELL, "second-column.tsx"));
  assert.match(src, /cotCaiDat\(caiDat\.roles, caiDat\.tenSan\)/);
  assert.doesNotMatch(src, /label: "Người dùng"/);
});

// E3b — menu tài khoản, trang /me, trang /settings.
function lechMenu(f: (roles: string[]) => { label: string; href: string }[]): string[] {
  const out: string[] = [];
  for (const [ten, roles] of Object.entries(TO_HOP)) {
    const want = QUAN_TRI(ten) ? ["Cá nhân:/settings/personal", "Cài đặt sàn:/settings/users"] : ["Cá nhân:/settings/personal"];
    const got = f(roles).map((m) => `${m.label}:${m.href}`);
    if (JSON.stringify(got) !== JSON.stringify(want)) out.push(`${ten}: ${JSON.stringify(got)}`);
  }
  return out;
}

test("E3b: menu tài khoản — Cá nhân cho mọi vai, quản trị thêm Cài đặt sàn (6 tổ hợp)", () => {
  assert.deepEqual(lechMenu(mucTaiKhoan), []);
  const src = doc(join(SHELL, "account-menu.tsx"));
  assert.match(src, /mucTaiKhoan\(roles\)/);
  assert.doesNotMatch(src, /href="\/me"/);
});

test("E3b: đối chứng đỏ — bản sao thêm Cài đặt sàn cho trưởng nhóm → gọi tên vai", () => {
  const gia = (roles: string[]) => (roles.includes("team_lead") ? mucTaiKhoan(["company_admin"]) : mucTaiKhoan(roles));
  assert.deepEqual(lechMenu(gia), ['trưởng nhóm: ["Cá nhân:/settings/personal","Cài đặt sàn:/settings/users"]']);
});

test("E3b: /me chỉ chuyển về Cá nhân; /settings chuyển theo settingsLanding của lõi; nhãn tab", () => {
  const me = doc(join(APP, "me/page.tsx"));
  assert.match(me, /redirect\("\/settings\/personal"\)/);
  assert.doesNotMatch(me, /KhungToi|ToiThat/);
  const settings = doc(join(DIR, "page.tsx"));
  assert.match(settings, /redirect\(settingsLanding\(/);
  assert.doesNotMatch(settings, /company_admin/);
  const nhan = doc(join(SHELL, "nav-labels.ts"));
  assert.match(nhan, /settings: \{ label: "Cài đặt sàn"/);
  assert.match(nhan, /me: \{ label: "Tôi"/);
  assert.match(doc(join(SHELL, "mobile-shell.tsx")), /activeTab\(pathname, nav\.tabs\) === tab/);
});

// E4 — Cá nhân dựng lại màn Tôi, không bản thứ hai.
function trangDungLai(src: string): string[] {
  const out: string[] = [];
  if (!/from "@\/app\/\(app\)\/me\/toi-that"/.test(src)) out.push("không nhập ToiThat của me/");
  if (!/<KhungToi>/.test(src)) out.push("không dựng KhungToi");
  if (/nhomDong\(|NHAN_NHOM|SettingRow|SettingField/.test(src)) out.push("tự dựng danh sách dòng");
  return out;
}

test("E4: Cá nhân (personal/ca-nhan.tsx, dựng bởi settings/[section]) dựng ToiThat trong KhungToi, đường dẫn Cài đặt › Cá nhân", () => {
  assert.deepEqual(trangDungLai(doc(join(DIR, "personal/ca-nhan.tsx"))), []);
  assert.match(doc(join(APP, "me/khung.tsx")), /duongDan=\{\[\{ nhan: "Cài đặt", href: "\/settings" \}, \{ nhan: "Cá nhân" \}\]\}/);
  // Đoạn «personal» của trang mục dựng CaNhan, và đi trước luật chặn mục sàn (ai cũng mở được Cá nhân).
  const muc = doc(join(DIR, "[section]/page.tsx"));
  assert.ok(muc.indexOf('section === "personal"') >= 0 && muc.indexOf('section === "personal"') < muc.indexOf("chanMucSan("), "Cá nhân phải đứng trước luật chặn");
  assert.match(muc, /<CaNhan /);
});

test("E4: đối chứng đỏ — bản sao trang tự dựng danh sách dòng → nêu lỗi", () => {
  const gia = doc(join(DIR, "personal/ca-nhan.tsx")).replace("<ToiThat", "<div>{nhomDong(me)}</div><ToiThat");
  assert.deepEqual(trangDungLai(gia), ["tự dựng danh sách dòng"]);
});

test("E4: không tệp nào ngoài me/ định nghĩa lại nhãn sáu nhóm", () => {
  const thua: string[] = [];
  const duyet = (d: string) => {
    for (const ten of readdirSync(d)) {
      const p = join(d, ten);
      if (statSync(p).isDirectory()) duyet(p);
      else if (/\.(ts|tsx)$/.test(ten) && !/\.test\.ts$/.test(ten) && !p.includes(`${join(APP, "me")}`) && /const NHAN_NHOM\b/.test(doc(p))) thua.push(relative(APP, p));
    }
  };
  duyet(APP);
  assert.deepEqual(thua, []);
});

// E5 — chặn mục sàn ở máy chủ.
const DUONG_SAN = ["/settings/users", "/settings/labels"];
function lechChan(f: (roles: string[]) => string | null): string[] {
  const out: string[] = [];
  for (const [ten, roles] of Object.entries(TO_HOP)) {
    for (const duong of DUONG_SAN) {
      const want = QUAN_TRI(ten) ? null : "/settings/personal?chi-quan-tri=1";
      if (f(roles) !== want) out.push(`${ten} ${duong}: ${f(roles)}`);
    }
  }
  return out;
}

test("E5: chặn mục sàn — 4 vai không quản trị × 2 đường ra Cá nhân kèm báo, quản trị × 2 ra null (12 ô)", () => {
  assert.deepEqual(lechChan(chanMucSan), []);
  assert.equal(BAO_CHI_QUAN_TRI, "Mục này chỉ quản trị sàn mở được");
  const caNhan = doc(join(DIR, "personal/ca-nhan.tsx"));
  assert.match(caNhan, /biChan && <TrangThai kind="notice" title=\{BAO_CHI_QUAN_TRI\} \/>/);
});

/** Mọi page.tsx dưới settings/ trừ Cá nhân và trang chuyển hướng gọi chanMucSan rồi redirect. */
function trangThieuChan(doc1: (p: string) => string): string[] {
  const out: string[] = [];
  const duyet = (d: string) => {
    for (const ten of readdirSync(d)) {
      const p = join(d, ten);
      if (statSync(p).isDirectory()) duyet(p);
      else if (ten === "page.tsx") {
        const r = relative(DIR, p);
        if (r === "page.tsx" || r.startsWith("personal")) continue;
        if (!/const chan = chanMucSan\(/.test(doc1(p)) || !/if \(chan\) redirect\(chan\)/.test(doc1(p))) out.push(r);
      }
    }
  };
  duyet(DIR);
  return out;
}

test("E5: mọi mục sàn gọi hàm chặn ở máy chủ (bài quét liệt kê tệp)", () => {
  assert.deepEqual(trangThieuChan(doc), []);
});

test("E5: đối chứng đỏ — bản sao users/page.tsx bỏ lời gọi → gọi tên tệp", () => {
  const gia = (p: string) => (p.endsWith(join("users", "page.tsx")) ? doc(p).replace("const chan = chanMucSan(", "const x = (") : doc(p));
  assert.deepEqual(trangThieuChan(gia), [join("users", "page.tsx")]);
});

// E6 — câu phạm vi từ một bảng.
test("E6: chữ phạm vi — Cá nhân, mục sàn có tên sàn, dòng máy «Trên máy này»", () => {
  assert.equal(PHAM_VI.caNhan, "Áp cho tài khoản của bạn ở mọi sàn");
  assert.equal(PHAM_VI.san(SAN), "Chỉ áp cho sàn [Mẫu] Sàn A");
  assert.equal(PHAM_VI_MAY, "Trên máy này");
  const manToi = doc(join(APP, "me/man-toi.tsx"));
  for (const ma of ["cai", "thong-bao"]) assert.ok(new RegExp(`case "${ma}":[\\s\\S]{0,200}trenMayNay\\(`).test(manToi), `dòng ${ma} thiếu «Trên máy này»`);
  for (const ma of ["ho-so", "may"]) assert.ok(!new RegExp(`case "${ma}":[^\\n]*\\n?[^\\n]*trenMayNay\\(`).test(manToi), `dòng ${ma} không áp cho máy`);
});

/** Mọi page.tsx dưới settings/ (trừ trang chuyển hướng) lấy câu phạm vi từ bảng PHAM_VI — trực tiếp hay qua khuôn. */
function trangThieuPhamVi(doc1: (p: string) => string): string[] {
  const out: string[] = [];
  const duyet = (d: string) => {
    for (const ten of readdirSync(d)) {
      const p = join(d, ten);
      if (statSync(p).isDirectory()) duyet(p);
      else if (ten === "page.tsx") {
        const r = relative(DIR, p);
        if (r === "page.tsx") continue;
        const s = doc1(p);
        const qua = /PHAM_VI\.san\(|<MucCaiDat |<KhungToi>/.test(s);
        if (!qua) out.push(r);
      }
    }
  };
  duyet(DIR);
  return out;
}

test("E6: mọi mục Cài đặt lấy câu phạm vi từ bảng (bài quét liệt kê tệp)", () => {
  assert.deepEqual(trangThieuPhamVi(doc), []);
  assert.match(doc(join(DIR, "khung.tsx")), /PHAM_VI\.san\(tenSan\)/);
  assert.match(doc(join(APP, "me/khung.tsx")), /moTa=\{PHAM_VI\.caNhan\}/);
});

test("E6: đối chứng đỏ — bản sao trang mục sàn bỏ câu phạm vi → gọi tên tệp", () => {
  const gia = (p: string) => (p.includes("[section]") ? doc(p).replace("PHAM_VI.san(", "String(") : doc(p));
  assert.deepEqual(trangThieuPhamVi(gia), [join("[section]", "page.tsx")]);
});
