// Hoàn tác (hàng 15) — E8. Ma trận viết tay: hoàn tác được ⟺ chiều ngược có trong bảng ADR-0008.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { StandardStatus } from "@quy-hang/core/listing";
import { DA_HOAN_TAC, DA_SUA_SAU, hoanTacDuoc, lenhHoanTac, taoSoHoanTac, xetHoanTac, type BanGhiHoanTac, type KetQuaXet, type Truoc } from "./hoan-tac";
import { dungLenhTrangThai, type HangSua, type Lenh } from "./lenh";

test("hoàn tác đổi giá → một lệnh về đúng giá và phí cũ", () => {
  const truoc: Truoc = { listPrice: 4_500_000_000, feeInclusion: "excluded", standardStatus: "Active" };
  const sua: Lenh = { type: "price_changed", payload: { listPrice: 5_000_000_000, feeInclusion: "included" } };
  assert.deepEqual(lenhHoanTac(truoc, sua), { type: "price_changed", payload: { listPrice: 4_500_000_000, feeInclusion: "excluded" } });
});

test("lần đặt giá đầu không hoàn tác được", () => {
  const truoc: Truoc = { listPrice: null, feeInclusion: null, standardStatus: "Incomplete" };
  assert.equal(lenhHoanTac(truoc, { type: "price_changed", payload: { listPrice: 3_000_000_000, feeInclusion: "included" } }), null);
});

// [từ, sang, hoàn tác được] — mọi chuyển của bảng ADR-0008, viết tay.
const CHUYEN: [StandardStatus, StandardStatus, boolean][] = [
  ["Incomplete", "Active", false],
  ["Incomplete", "Hold", false],
  ["Incomplete", "Withdrawn", false],
  ["Active", "Pending", true],
  ["Active", "Closed", false],
  ["Active", "Hold", true],
  ["Active", "Withdrawn", false],
  ["Pending", "Active", true],
  ["Pending", "Closed", false],
  ["Pending", "Withdrawn", false],
  ["Hold", "Active", true],
  ["Hold", "Withdrawn", false],
];

for (const [tu, sang, duoc] of CHUYEN) {
  test(`hoàn tác ${tu} → ${sang}: ${duoc ? "được" : "không"}`, () => {
    const truoc: Truoc = { listPrice: 4_500_000_000, feeInclusion: "excluded", standardStatus: tu };
    const lenh: Lenh = { type: "status_changed", payload: { to: sang } };
    assert.equal(hoanTacDuoc(truoc, lenh), duoc);
    assert.deepEqual(lenhHoanTac(truoc, lenh), duoc ? { type: "status_changed", payload: { to: tu } } : null);
  });
}

test("trình sửa báo «Không hoàn tác được» bằng cùng hàm", () => {
  const hang: HangSua = { id: "h", unitNumber: "x", listPrice: 4_500_000_000, feeInclusion: "excluded", standardStatus: "Active", legalStatus: "a", occupantType: "b" };
  for (const [tu, sang, duoc] of CHUYEN.filter(([t]) => t === "Active")) {
    const kq = dungLenhTrangThai({ ...hang, standardStatus: tu }, sang, { giaChot: "4 tỷ", lyDo: "unreachable" }, true);
    assert.ok(kq.ok, `${tu}→${sang}`);
    assert.equal(kq.khongHoanTac, !duoc, `${tu}→${sang}`);
  }
});

test("đối chứng đỏ: coi Đã bán → Đang bán là hoàn tác được thì ma trận bắt", () => {
  const duocSai = (tu: StandardStatus, sang: StandardStatus) => (sang === "Closed" ? true : hoanTacDuoc({ listPrice: 1, feeInclusion: "excluded", standardStatus: tu }, { type: "status_changed", payload: { to: sang } }));
  const lech = CHUYEN.filter(([t, s, d]) => duocSai(t, s) !== d).map(([t, s]) => `${t}→${s}`);
  assert.deepEqual(lech, ["Active→Closed", "Pending→Closed"]);
});

// Hoàn tác trên thông báo cũ (va-sua-tren-o AC-5) — ma trận viết tay của hàm quyết.
const XET: [string, { daDung: boolean; phienBanSau: number }, number | undefined, KetQuaXet][] = [
  ["chưa dùng, cùng phiên bản", { daDung: false, phienBanSau: 7 }, 7, { ok: true }],
  ["có lần sửa sau (8)", { daDung: false, phienBanSau: 7 }, 8, { ok: false, loi: "Không hoàn tác được: căn đã có lần sửa sau" }],
  ["phiên bản lùi (6)", { daDung: false, phienBanSau: 7 }, 6, { ok: false, loi: "Không hoàn tác được: căn đã có lần sửa sau" }],
  ["căn không còn trên máy", { daDung: false, phienBanSau: 7 }, undefined, { ok: false, loi: "Không hoàn tác được: căn đã có lần sửa sau" }],
  ["đã dùng", { daDung: true, phienBanSau: 7 }, 7, { ok: false, loi: "Đã hoàn tác rồi" }],
];

for (const [ten, banGhi, hienTai, mong] of XET) {
  test(`AC-5 xetHoanTac: ${ten}`, () => {
    assert.deepEqual(xetHoanTac(banGhi, hienTai), mong, `ô «${ten}»`);
  });
}

test("đối chứng đỏ: hàm quyết bỏ so phiên bản thì ô «có lần sửa sau (8)» bị gọi tên", () => {
  const xetSai = (b: { daDung: boolean }): KetQuaXet => (b.daDung ? { ok: false, loi: DA_HOAN_TAC } : { ok: true });
  const lech = XET.filter(([, b, , mong]) => JSON.stringify(xetSai(b)) !== JSON.stringify(mong)).map(([ten]) => ten);
  assert.ok(lech.includes("có lần sửa sau (8)"), `ô lệch: ${lech.join(", ")}`);
});

// Bộ giữ bản ghi (AC-6): mỗi chiều một ca, đếm lệnh bù. Phiên bản trên máy giả: lệnh bù ghi thì phiên bản căn tăng một.
const BU = (gia: number): Lenh => ({ type: "price_changed", payload: { listPrice: gia, feeInclusion: "excluded" } });

function mayGia(so = taoSoHoanTac()) {
  const phienBan = new Map<string, number>();
  const bu: string[] = [];
  const sua = (id: string, gia: number) => {
    const sau = (phienBan.get(id) ?? 0) + 1;
    phienBan.set(id, sau);
    return so.ghi({ id, nhan: `giá ${id}`, lenh: BU(gia), phienBanSau: sau })!;
  };
  const chay = (kq: ReturnType<typeof so.dungPhim>) => {
    if (kq?.ok) {
      bu.push(kq.banGhi.id);
      phienBan.set(kq.banGhi.id, phienBan.get(kq.banGhi.id)! + 1);
    }
    return kq;
  };
  const doc = (id: string) => phienBan.get(id);
  return { sua, bu, nut: (b: Parameters<typeof so.dungNut>[0]) => chay(so.dungNut(b, doc)), phim: () => chay(so.dungPhim(doc)) };
}

test("AC-6 (a): nút của A rồi phím đảo B; phím lần nữa không làm gì", () => {
  const m = mayGia();
  const a = m.sua("A", 1);
  m.sua("B", 2);
  assert.ok(m.nut(a)?.ok);
  assert.ok(m.phim()?.ok);
  assert.equal(m.phim(), null);
  assert.deepEqual(m.bu, ["A", "B"]);
});

test("AC-6 (b): nút rồi phím → đúng một lệnh bù", () => {
  const m = mayGia();
  const d = m.sua("D", 1);
  m.nut(d);
  m.phim();
  assert.deepEqual(m.bu, ["D"], "chiều nút → phím");
});

test("AC-6 (c): phím rồi nút → đúng một lệnh bù, nút báo «Đã hoàn tác rồi»", () => {
  const m = mayGia();
  const d = m.sua("D", 1);
  m.phim();
  assert.deepEqual(m.nut(d), { ok: false, loi: DA_HOAN_TAC });
  assert.deepEqual(m.bu, ["D"], "chiều phím → nút");
});

test("AC-5: thông báo cũ khi căn đã có lần sửa sau → từ chối, không lệnh bù", () => {
  const m = mayGia();
  const lan1 = m.sua("A", 1);
  m.sua("A", 2);
  assert.deepEqual(m.nut(lan1), { ok: false, loi: DA_SUA_SAU });
  assert.deepEqual(m.bu, []);
});

test("đối chứng đỏ: bỏ đánh dấu đã dùng thì chiều nút → phím ra hai lệnh bù", () => {
  // Phiên bản đứng yên — khoảng trước khi lệnh bù tới máy: chỉ cờ đã dùng chặn được lần bấm thứ hai.
  const doc = () => 1;
  const banGhi = { id: "D", nhan: "giá D", lenh: BU(1), phienBanSau: 1 };
  const dem = (so: Pick<ReturnType<typeof taoSoHoanTac>, "ghi" | "dungNut" | "dungPhim">) => {
    const b = so.ghi(banGhi)!;
    return [so.dungNut(b, doc), so.dungPhim(doc)].filter((k) => k?.ok).length;
  };
  // Bản sai: cùng hàm quyết nhưng không đánh dấu, không rời Ctrl+Z.
  let ganNhat: BanGhiHoanTac | null = null;
  const sai = {
    ghi: (b: Omit<BanGhiHoanTac, "daDung"> | null) => (ganNhat = b ? { ...b, daDung: false } : null),
    dungNut: (b: BanGhiHoanTac, d: (id: string) => number | undefined) => {
      const kq = xetHoanTac(b, d(b.id));
      return kq.ok ? { ok: true as const, banGhi: b } : kq;
    },
    dungPhim: (d: (id: string) => number | undefined) => (ganNhat ? sai.dungNut(ganNhat, d) : null),
  };
  assert.equal(dem(taoSoHoanTac()), 1, "bộ thật: chiều nút → phím một lệnh bù");
  assert.equal(dem(sai), 2, "bản bỏ đánh dấu phải bị bắt ở chiều nút → phím: hai lệnh bù");
});
