// E7 (hàng 43, AC-7) — bài kiểm rò rỉ của hộp thoại Xuất bảng hàng: căn mồi `canMoi()` thành dòng bảng hàng mồi, đi qua
// đúng đường của trang (`dongSangCan` → `xuatBang`) cho 5 mẫu × 2 người nhận × 4 cấu hình; `timRoRi` trên bài, từng ô xem
// trước, chữ trong .xlsx sau giải nén, chữ đưa bộ vẽ ảnh/PDF và nhãn «Cột không ra ngoài». Cùng tệp quét mã nguồn mọi tệp
// của hộp thoại. Chiều đỏ hai ca: hàm xuất đọc thẳng dòng; tệp hộp thoại chèn một lần đọc trường nội bộ.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { COT_BANG_HANG, xuatBang } from "@quy-hang/core/export";
import { CAU_HINH_MAC_DINH, canMoi, giaTriMoi, timRoRi } from "@quy-hang/core/redaction";
import { banXuatTuDong, cotLoi, dongSangCan } from "./chuyen-dong";
import { dongMoi, kiemDuongTrang, MOI_COT, quetNguon, TODAY, vanBanRa, type HamTrang } from "./moi-xuat.test-helpers";

const DAY = dirname(fileURLToPath(import.meta.url));
const KHOI = join(DAY, "..", "..", "..", "..", "components", "khoi", "dialog-5");
const NGU = { today: TODAY, tenSan: "[Tên sàn] Mồi", tenNguoiGui: "[Tên] Người gửi" };

const laTest = (t: string) => /\.test(-helpers)?\.tsx?$/.test(t);
const tepHopThoai = () =>
  [DAY, KHOI].flatMap((d) =>
    readdirSync(d)
      .filter((t) => /\.tsx?$/.test(t) && !laTest(t))
      .map((t) => ({ ten: join(d, t), nguon: readFileSync(join(d, t), "utf8") })),
  );

test("E7 mọi cột của bảng hàng có dòng ở bảng cột của lõi", () => {
  for (const id of MOI_COT) assert.ok(Object.prototype.hasOwnProperty.call(COT_BANG_HANG, cotLoi(id)), id);
});

test("E7 dòng mồi qua dongSangCan không mang khoá nội bộ nào của dòng lạ", () => {
  const can = dongSangCan(dongMoi(canMoi()), NGU);
  for (const r of timRoRi(JSON.stringify({ ...can, closePrice: null, closeDate: null, withdrawnReason: null }), giaTriMoi(canMoi(), "nhom_moi_gioi", CAU_HINH_MAC_DINH))) {
    assert.fail(`dongSangCan chép ${r.truong}`);
  }
});

test("E7 đường của trang — 5 mẫu × 2 người nhận × 4 cấu hình: 0 rò rỉ ở mọi đầu ra", () => {
  assert.deepEqual(kiemDuongTrang(canMoi()), []);
});

test("E7 lõi trên căn mồi đầy đủ với cột của bảng hàng: 0 rò rỉ", () => {
  // Cùng cột trang, nhưng căn mồi đủ mọi trường nội bộ (chủ nhà, liên hệ, trường riêng…) — lõi phải tự ẩn.
  const viaLoi: HamTrang = (_dong, tuy) => xuatBang([canMoi()], { ...tuy, cot: tuy.cot.map(cotLoi) });
  assert.deepEqual(kiemDuongTrang(canMoi(), viaLoi), []);
});

test("E7 khách riêng ẩn mã căn — không mã căn, không số tầng", () => {
  for (const mau of ["post_zalo", "post_facebook", "xlsx", "png", "pdf"] as const) {
    const ban = banXuatTuDong([dongMoi(canMoi())], { ...NGU, mau, nguoiNhan: "khach_rieng", cot: MOI_COT, cauHinh: CAU_HINH_MAC_DINH });
    assert.ok(!ban.khoa.includes("unitNumber") && !ban.khoa.includes("floor"), mau);
    assert.ok(ban.boQua.includes("Mã căn"), mau);
    for (const { ten, vanBan } of vanBanRa(ban)) {
      assert.doesNotMatch(vanBan, /Z-97\.53/, `${mau}: mã căn ở ${ten}`);
      assert.doesNotMatch(vanBan, /Tầng 12\b/, `${mau}: số tầng ở ${ten}`);
    }
    const iTang = ban.cot.indexOf("Tầng");
    assert.ok(iTang >= 0 && ban.dong.every((d) => d[iTang] !== "12"), `${mau}: ô Tầng mang số tầng`);
  }
  // Lõi trên căn đủ số tầng toà: tầng cao / thấp thay chỗ.
  const day = xuatBang([canMoi()], { mau: "xlsx", nguoiNhan: "khach_rieng", cot: MOI_COT.map(cotLoi), today: TODAY, tenSan: "[Tên sàn]" });
  assert.equal(day.dong[0]![day.cot.indexOf("Tầng")], "Tầng cao");
});

test("E7 quét nguồn — chỉ chuyen-dong.ts nhắc khoá nội bộ; bộ vẽ chỉ vẽ chữ của bản xuất", () => {
  const tep = tepHopThoai();
  assert.ok(tep.some((t) => t.ten.endsWith("hop-thoai.tsx")) && tep.some((t) => t.ten.endsWith("hop-buoc.tsx")), "đủ tệp hộp thoại");
  assert.deepEqual(quetNguon(tep), []);
  const ve = readFileSync(join(DAY, "ve-anh.ts"), "utf8");
  assert.match(ve, /const chu = chuDeVe\(bang\);/);
  assert.deepEqual([...ve.matchAll(/fillText\(([^,]+),/g)].map((m) => m[1]), ["s"], "fillText chỉ vẽ phần tử của chuDeVe");
  // Hộp thoại không nhập dòng bảng hàng ngoài kiểu, không gọi chuDeVe trên thứ khác bản xuất.
  const hop = readFileSync(join(DAY, "hop-thoai.tsx"), "utf8");
  assert.match(hop, /banXuatTuDong\(mo\.dong,/);
});

test("E7 chiều đỏ — bản sao hàm xuất đọc thẳng dòng thay vì bản đã ẩn → ca đỏ nêu trường lọt (chủ nhà)", () => {
  const docThang: HamTrang = (dong, tuy) => {
    const b = banXuatTuDong(dong, tuy);
    const tho = dong as readonly Record<string, unknown>[];
    return { ...b, dong: b.dong.map((d, r) => d.map((o, c) => (c === 0 ? `${o} ${String(tho[r]!["ownerName"])}` : o))) };
  };
  const loi = kiemDuongTrang(canMoi(), docThang);
  assert.ok(loi.some((l) => /rò ownerName/.test(l)), loi.join("\n"));
});

test("E7 chiều đỏ — bản sao tệp hộp thoại chèn một lần đọc trường nội bộ → ca quét nguồn đỏ nêu tên tệp", () => {
  const tep = tepHopThoai().map((t) =>
    t.ten.endsWith("hop-thoai.tsx") ? { ...t, nguon: `${t.nguon}\nconst lo = (d: { holderName: string }) => d.holderName;\n` } : t,
  );
  const loi = quetNguon(tep);
  assert.equal(loi.length, 1, loi.join("\n"));
  assert.match(loi[0]!, /hop-thoai\.tsx: đọc holderName/);
});
