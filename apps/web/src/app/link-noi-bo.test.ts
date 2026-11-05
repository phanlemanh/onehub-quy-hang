// Link nội bộ không trỏ tới đường không có trang (hàng vá va-link-gui-can). Hai nút «Gửi căn» từng trỏ `/inventory/cards`
// — thư mục mã của bảng thẻ, không có page.tsx — nên bấm ra «Không thấy trang này». Bài này dựng tập đường thật từ cây
// `src/app` (page.tsx, route.ts; bỏ nhóm `(x)`; khớp `[x]`, `[...x]`, `[[...x]]`) rồi quét mọi đường tĩnh trong mã nguồn
// giao diện: `href="/…"`, `href={"/…"}`, `` href={`/…`} ``, `href: "/…"`, `redirect("/…")`, `router.push/replace("/…")`.
// Phần `${…}` trong template là một đoạn động; truy vấn và neo bị bỏ trước khi khớp.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(SRC, "app");

function* tep(goc: string): Generator<string> {
  for (const m of readdirSync(goc, { withFileTypes: true })) {
    const p = path.join(goc, m.name);
    if (m.isDirectory()) {
      if (m.name !== "node_modules") yield* tep(p);
    } else yield p;
  }
}

type Doan = { kieu: "chu"; ten: string } | { kieu: "mot" } | { kieu: "nhieu" } | { kieu: "tuy" };

/** Đường của một tệp page.tsx / route.ts, thành dãy đoạn khớp. Nhóm `(x)` không thành đoạn. */
export function duongCuaTep(tuongDoi: string): Doan[] {
  const doan = tuongDoi.split(/[\\/]/).slice(0, -1);
  return doan
    .filter((d) => !/^\(.*\)$/.test(d))
    .map((d): Doan => {
      if (/^\[\[\.\.\..+\]\]$/.test(d)) return { kieu: "tuy" };
      if (/^\[\.\.\..+\]$/.test(d)) return { kieu: "nhieu" };
      if (/^\[.+\]$/.test(d)) return { kieu: "mot" };
      return { kieu: "chu", ten: d };
    });
}

/** Tập đường thật của app: mọi page.tsx và route.ts dưới `src/app`. */
export function tapDuong(goc = APP): Doan[][] {
  return [...tep(goc)]
    .filter((p) => /[\\/](page\.tsx|route\.ts)$/.test(p))
    .map((p) => duongCuaTep(path.relative(goc, p)));
}

const DONG = "\u0000"; // đánh dấu một đoạn động `${…}` của template

/**
 * Mẫu đường có khớp dãy đoạn không. Đoạn chứa `${…}` (đánh dấu DONG) là đoạn động: chỉ khớp `[x]` hay đuôi `[...x]` của
 * mẫu, không bao giờ khớp một đoạn chữ cố định — link `/inventory/${x}` không được coi là có trang `/inventory/cards`.
 */
function khop(mau: Doan[], doan: string[]): boolean {
  const dau = mau[0];
  if (dau === undefined) return doan.length === 0;
  const con = mau.slice(1);
  if (dau.kieu === "tuy" || dau.kieu === "nhieu") {
    const tu = dau.kieu === "tuy" ? 0 : 1;
    for (let i = tu; i <= doan.length; i++) if (khop(con, doan.slice(i))) return true;
    return false;
  }
  const d = doan[0];
  if (d === undefined) return false;
  if (dau.kieu === "chu" && (d.includes(DONG) || dau.ten !== d)) return false;
  return khop(con, doan.slice(1));
}

/** Đường có trang không — truy vấn, neo và gạch chéo cuối bị bỏ trước khi khớp. */
export function coTrang(duong: string, tap: Doan[][]): boolean {
  const sach = (duong.split(/[?#]/)[0] ?? "").replace(/\/+$/, "");
  const doan = sach.split("/").filter(Boolean);
  return tap.some((mau) => khop(mau, doan));
}

export type Link = { tep: string; dong: number; duong: string };

const MAU_LINK = [
  /href=\s*"(\/[^"]*)"/g,
  /href=\s*\{\s*"(\/[^"]*)"\s*\}/g,
  /href=\s*\{\s*`(\/[^`]*)`\s*\}/g,
  /href:\s*"(\/[^"]*)"/g,
  /href:\s*`(\/[^`]*)`/g,
  /\bredirect\(\s*"(\/[^"]*)"/g,
  /\bredirect\(\s*`(\/[^`]*)`/g,
  /\brouter\.(?:push|replace)\(\s*"(\/[^"]*)"/g,
  /\brouter\.(?:push|replace)\(\s*`(\/[^`]*)`/g,
];

/** Mọi đường tĩnh trong một đoạn mã. Đường bắt đầu `//` (không cùng nguồn) và `/api/` không phải link trang. */
export function linkTrongMa(ma: string, tenTep: string): Link[] {
  const ra: Link[] = [];
  for (const re of MAU_LINK)
    for (const m of ma.matchAll(re)) {
      const tho = m[1];
      if (tho === undefined || tho.startsWith("//")) continue;
      const duong = tho.replace(/\$\{[^}]*\}/g, DONG);
      if (duong.startsWith("/api/")) continue;
      ra.push({ tep: tenTep, dong: ma.slice(0, m.index).split("\n").length, duong });
    }
  return ra.sort((a, b) => a.dong - b.dong);
}

/** Mọi link của mã nguồn giao diện (bỏ tệp kiểm). */
export function linkCuaKho(goc = SRC): Link[] {
  return [...tep(goc)]
    .filter((p) => /\.(tsx?|mts)$/.test(p) && !/\.test\.tsx?$/.test(p) && !/[\\/]test-db[\\/]/.test(p))
    .flatMap((p) => linkTrongMa(readFileSync(p, "utf8"), path.relative(SRC, p)));
}

const TAP = tapDuong();

test("link nội bộ: ma trận khớp đường viết trước", () => {
  const BANG: [string, boolean][] = [
    ["/inventory", true],
    ["/inventory?hang=1", true],
    ["/inventory/cards", false],
    ["/inventory/views/abc", true],
    [`/units/${DONG}`, true],
    ["/units/A-04.06", true],
    ["/units/call/dial", true],
    ["/units/call/dial/x", false],
    ["/shares", true],
    ["/shares/new", true],
    ["/today", true],
    [`/s/${DONG}`, true],
    ["/settings/users", true],
    ["/settings", true],
    ["/exports/new", true],
    ["/login", true],
    ["/", true],
    ["/khong-co", false],
    [`/inventory/${DONG}`, false],
  ];
  assert.equal(BANG.length, 19, "số dòng bảng viết trước");
  for (const [duong, mong] of BANG) assert.equal(coTrang(duong, TAP), mong, `đường ${duong.replace(DONG, "${…}")}: mong ${mong ? "có trang" : "không có trang"}`);
});

test("link nội bộ: hai nút «Gửi căn» mở Bảng hàng", () => {
  const ds = linkCuaKho();
  const NUT: [string, number][] = [
    ["app/(app)/shares/danh-sach.tsx", 1],
    ["app/(app)/today/buyer/dong-tin.tsx", 1],
  ];
  assert.equal(NUT.length, 2, "số nút viết trước");
  for (const [t, n] of NUT) {
    const cua = ds.filter((l) => l.tep.split(path.sep).join("/") === t);
    assert.equal(cua.length, n, `${t}: số link quét được`);
    for (const l of cua) assert.equal(l.duong, "/inventory", `${t}:${l.dong} — nút «Gửi căn» phải mở /inventory`);
  }
});

test("link nội bộ: không link nào trỏ tới đường không có trang", () => {
  const ds = linkCuaKho();
  // Bộ quét không rỗng: có đủ các lối đã biết, nên một bộ quét hỏng không xanh oan.
  for (const d of ["/inventory", "/shares", "/login"]) assert.ok(ds.some((l) => l.duong === d), `bộ quét không thấy link ${d}`);
  const hong = ds.filter((l) => !coTrang(l.duong, TAP)).map((l) => `${l.tep}:${l.dong} → ${l.duong.replace(DONG, "${…}")}`);
  assert.deepEqual(hong, [], `link trỏ tới đường không có trang:\n${hong.join("\n")}`);
});

test("link nội bộ: chiều đỏ — mã trỏ /inventory/cards bị gọi tên", () => {
  const ma = ['<Button render={<a href="/inventory/cards" />}>Gửi căn</Button>', '<Link href={`/units/${ma}`}>x</Link>', "redirect(\"/today\")"].join("\n");
  const ds = linkTrongMa(ma, "mau.tsx");
  assert.deepEqual(
    ds.map((l) => [l.dong, l.duong.replace(DONG, "*")]),
    [
      [1, "/inventory/cards"],
      [2, "/units/*"],
      [3, "/today"],
    ],
    "bộ quét phải thấy đủ ba link của mẫu",
  );
  const hong = ds.filter((l) => !coTrang(l.duong, TAP)).map((l) => `${l.tep}:${l.dong} → ${l.duong}`);
  assert.deepEqual(hong, ["mau.tsx:1 → /inventory/cards"]);
});

test("link nội bộ: ma trận kiểu đường trên cây mẫu viết trước", () => {
  // Cây mẫu đi qua đúng bộ đọc tên tệp của cây thật (duongCuaTep), phủ mọi kiểu đoạn mà cây thật có thể có.
  const CAY = ["page.tsx", "(g)/a/page.tsx", "docs/[...slug]/page.tsx", "help/[[...p]]/page.tsx", "x/[id]/y/page.tsx", "api/v1/[[...route]]/route.ts"];
  const tap = CAY.map(duongCuaTep);
  const BANG: [string, boolean][] = [
    ["/", true],
    ["/a", true],
    ["/(g)/a", false],
    ["/b", false],
    ["/docs", false],
    ["/docs/1", true],
    ["/docs/1/2/3", true],
    ["/help", true],
    ["/help/1/2", true],
    ["/x/9/y", true],
    ["/x/9", false],
    [`/x/${DONG}/y`, true],
    [`/a/${DONG}`, false],
    ["/api/v1/health", true],
    ["/api/v1", true],
    ["/a?q=1", true],
    ["/a#neo", true],
    ["/a/", true],
  ];
  assert.equal(BANG.length, 18, "số dòng bảng viết trước");
  for (const [duong, mong] of BANG) assert.equal(coTrang(duong, tap), mong, `cây mẫu, đường ${duong.replace(DONG, "${…}")}: mong ${mong ? "có trang" : "không có trang"}`);
});

test("link nội bộ: trích đường theo từng dạng link", () => {
  // Mười một dạng mà bộ quét hứa đọc, mỗi dạng một dòng, cùng trỏ /khong-co; bốn dòng cuối không phải link trang.
  const DANG: [string, string][] = [
    ['href="…"', '<a href="/khong-co/1">'],
    ['href={"…"}', '<Link href={"/khong-co/2"}>'],
    ["href={`…`}", "<Link href={`/khong-co/3/${x}`}>"],
    ['href: "…"', '{ href: "/khong-co/4" }'],
    ["href: `…`", "{ href: `/khong-co/5?a=${x}` }"],
    ['redirect("…")', 'redirect("/khong-co/6")'],
    ["redirect(`…`)", "redirect(`/khong-co/7`)"],
    ['router.push("…")', 'router.push("/khong-co/8")'],
    ['router.replace("…")', 'router.replace("/khong-co/9")'],
    ["router.push(`…`)", "router.push(`/khong-co/10`)"],
    ["router.replace(`…`)", "router.replace(`/khong-co/11#neo`)"],
  ];
  assert.equal(DANG.length, 11, "số dạng viết trước");
  const NGOAI = ['<a href="//cdn.vi-du/a">', '<a href="/api/v1/health">', '<a href="https://vi-du.vn/a">', 'fetch("/khong-co/12")'];
  const ma = [...DANG.map(([, m]) => m), ...NGOAI].join("\n");
  const ds = linkTrongMa(ma, "mau.tsx");
  const MONG = ["/khong-co/1", "/khong-co/2", `/khong-co/3/${DONG}`, "/khong-co/4", `/khong-co/5?a=${DONG}`, "/khong-co/6", "/khong-co/7", "/khong-co/8", "/khong-co/9", "/khong-co/10", "/khong-co/11#neo"];
  assert.equal(ds.length, DANG.length, `bộ quét phải thấy đúng ${DANG.length} link, thấy ${ds.length}`);
  DANG.forEach(([ten], i) => {
    assert.equal(ds[i]?.dong, i + 1, `dạng ${ten}: dòng`);
    assert.equal(ds[i]?.duong, MONG[i], `dạng ${ten}: đường trích ra`);
  });
  const hong = ds.filter((l) => !coTrang(l.duong, TAP)).map((l) => `${l.tep}:${l.dong}`);
  assert.deepEqual(hong, DANG.map((_, i) => `mau.tsx:${i + 1}`), "mọi dạng trỏ đường không có trang phải bị gọi tên");
});
