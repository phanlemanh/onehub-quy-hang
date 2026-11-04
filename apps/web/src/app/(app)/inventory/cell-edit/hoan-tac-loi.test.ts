// Đường lỗi của hoàn tác trên ô và ghi an toàn (va-duong-loi-hoan-tac) — E3, E4.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { chayGhiLo, moTaBatNgo } from "../bulk/lo";
import { chayHoanTacLo, type BanGhiLo } from "../bulk/hoan-tac-lo";
import { chayHoanTac, DA_HOAN_TAC, taoSoHoanTac } from "./hoan-tac";
import { chayLuuO, ghiAnToan, LOI_BAT_NGO, type GhiFn, type HangSua, type KetQuaGhi, type Lenh } from "./lenh";

const VE_GIA: Lenh = { type: "price_changed", payload: { listPrice: 4_650_000_000, feeInclusion: "excluded" } };
const PHIEN = (v: number) => () => v;
const ok = (v = 3): KetQuaGhi => ({ ok: true, op: { expectedVersion: v } });

test("hoàn tác ô: lệnh bù hỏng giữ bản ghi", () => {
  const so = taoSoHoanTac();
  const b = so.ghi({ id: "c1", nhan: "giá A-01", lenh: VE_GIA, phienBanSau: 4 })!;
  const lan1 = so.dungNut(b, PHIEN(4));
  assert.ok(lan1.ok);
  so.traLai(b);
  const lan2 = so.dungNut(b, PHIEN(4));
  assert.ok(lan2.ok, "bấm lại sau khi trả lại không được ra «Đã hoàn tác rồi»");
  so.traLai(b);
  const phim = so.dungPhim(PHIEN(4));
  assert.ok(phim?.ok && phim.banGhi === b, "Ctrl/Cmd+Z trỏ đúng bản ghi đã trả lại");
  assert.deepEqual(so.dungNut(b, PHIEN(4)), { ok: false, loi: DA_HOAN_TAC });
});

test("hoàn tác ô: trả lại không đè lần sửa mới hơn", () => {
  const so = taoSoHoanTac();
  const cu = so.ghi({ id: "c1", nhan: "giá A-01", lenh: VE_GIA, phienBanSau: 4 })!;
  assert.ok(so.dungNut(cu, PHIEN(4)).ok);
  const moi = so.ghi({ id: "c2", nhan: "giá A-02", lenh: VE_GIA, phienBanSau: 7 })!;
  so.traLai(cu);
  const phim = so.dungPhim((id) => (id === "c2" ? 7 : 4));
  assert.ok(phim?.ok && phim.banGhi === moi);
});

test("hoàn tác ô: chạy lệnh bù", async () => {
  const so = taoSoHoanTac();
  const b = so.ghi({ id: "c1", nhan: "giá A-01", lenh: VE_GIA, phienBanSau: 4 })!;
  let hong = true;
  const sua: GhiFn = async () => (hong ? { ok: false, loi: { kind: "kho" } } : ok());
  const tb1 = await chayHoanTac(so, so.dungNut(b, PHIEN(4)), sua);
  assert.deepEqual(tb1, { loai: "loi", chu: "Không hoàn tác được: Máy chưa lưu được lần sửa — thử lại — giá A-01", thuLai: b });
  hong = false;
  const tb2 = await chayHoanTac(so, so.dungNut(b, PHIEN(4)), sua);
  assert.deepEqual(tb2, { loai: "thanh-cong", chu: "Đã hoàn tác giá A-01" });
  assert.deepEqual(await chayHoanTac(so, so.dungNut(b, PHIEN(4)), sua), { loai: "loi", chu: DA_HOAN_TAC, thuLai: null });
});

const HANG: HangSua = { id: "c1", unitNumber: "A-01", listPrice: 1, feeInclusion: "excluded", standardStatus: "Active", legalStatus: "pink_book", occupantType: "vacant" };
const VE_HOLD: Lenh = { type: "status_changed", payload: { to: "Hold" } };

test("ghi an toàn: lỗi bất ngờ thành lỗi có tên", async () => {
  const nem = ghiAnToan(async (): Promise<KetQuaGhi> => {
    throw new TypeError("lỗi lạ");
  });
  const kho: GhiFn = async () => ({ ok: false, loi: { kind: "kho" } });
  // Bốn chỗ ghi sau khi ô sửa đóng — mỗi chỗ một hàm điều phối, không chỗ nào ném ra.
  const BANG: [string, (sua: GhiFn) => Promise<string>][] = [
    ["lưu trên ô", async (sua) => {
      const kq = await chayLuuO(sua, "c1", VE_GIA, 3, "giá A-01");
      assert.ok(!kq.ok);
      return kq.chu;
    }],
    ["hoàn tác trên ô", async (sua) => {
      const so = taoSoHoanTac();
      const b = so.ghi({ id: "c1", nhan: "giá A-01", lenh: VE_GIA, phienBanSau: 4 })!;
      return (await chayHoanTac(so, so.dungNut(b, PHIEN(4)), sua)).chu;
    }],
    ["ghi lô", async (sua) => moTaBatNgo((await chayGhiLo(sua, [HANG], VE_HOLD)).batNgo) ?? "(không mô tả)"],
    ["hoàn tác lô", async (sua) => {
      const b: BanGhiLo = { muc: [{ id: "c1", lenh: VE_GIA, phienBanSau: 4, nhan: "A-01" }], daDung: false };
      return (await chayHoanTacLo(b, PHIEN(4), sua)).moTa ?? "(không mô tả)";
    }],
  ];
  for (const [cho, chay] of BANG) {
    const chu = await chay(nem);
    assert.ok(chu.includes(LOI_BAT_NGO) && chu.includes("A-01"), `${cho}: ${chu}`);
    const chuKho = await chay(kho);
    assert.ok(chuKho.includes("Máy chưa lưu được lần sửa — thử lại") || cho === "ghi lô", `${cho} (kho): ${chuKho}`);
    assert.ok(!chuKho.includes(LOI_BAT_NGO), `${cho} (kho) mang chữ lỗi bất ngờ`);
  }
  assert.equal(BANG.length, 4);
});

/** Số chỗ lấy hàm ghi trần (không bọc) trong một chuỗi mã nguồn. */
const tran = (nguon: string) => (nguon.match(/useSuaHang\(\)/g) ?? []).length - (nguon.match(/ghiAnToan\(useSuaHang\(\)\)/g) ?? []).length;

test("ghi an toàn: mọi chỗ gọi đi qua hàm bọc", () => {
  for (const tep of ["./tren-o.tsx", "../bulk/thanh.tsx"]) {
    const nguon = readFileSync(new URL(tep, import.meta.url), "utf8");
    assert.equal((nguon.match(/ghiAnToan\(useSuaHang\(\)\)/g) ?? []).length, 1, `${tep}: một chỗ lấy hàm ghi đã bọc`);
    assert.equal(tran(nguon), 0, `${tep}: còn useSuaHang() trần`);
    // Đối chứng: chèn một bản trần vào bản sao thì thước đỏ, nêu đúng tệp.
    assert.equal(tran(`${nguon}\nconst x = useSuaHang();`), 1, `${tep}: thước không bắt được bản trần`);
  }
});
