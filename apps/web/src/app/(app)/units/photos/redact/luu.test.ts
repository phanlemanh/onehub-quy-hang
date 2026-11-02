// Lưu bản che (hàng 19) — E5. Nguồn giả ghi lại thứ tự gọi.
import assert from "node:assert/strict";
import { test } from "node:test";
import { CHI_ANH_GUI_DUOC, GOC_CHUA_SANG, luuBanChe, TAI_LOI, type BanChe, type NguonLuu } from "./luu";

const BAN: BanChe = { file: new File([new Uint8Array([1])], "ban-che.webp", { type: "image/webp" }), thumb: new Blob([new Uint8Array([2])]), width: 1600, height: 1200 };
const GOC = { id: "g1", compartment: "shareable" as const, takenAt: "2026-10-30" };

function nguonGia(loi: { them?: boolean; sua?: boolean } = {}) {
  const goi: string[] = [];
  const nguon: NguonLuu = {
    async them(tep, ngan) { goi.push(`them:${ngan}:${tep.takenAt}`); if (loi.them) throw new Error("503"); },
    async sua(id, s) { goi.push(`sua:${id}:${s.compartment}`); if (loi.sua) throw new Error("500"); },
  };
  return { nguon, goi };
}

test("E5 (a) tải được → ảnh mới ở Gửi được cùng ngày chụp, rồi bản gốc sang Nội bộ, mỗi việc một lần", async () => {
  const { nguon, goi } = nguonGia();
  assert.deepEqual(await luuBanChe(GOC, BAN, nguon), { ok: true });
  assert.deepEqual(goi, ["them:shareable:2026-10-30", "sua:g1:internal"]);
});

test("E5 (b) tải lỗi → không chuyển bản gốc, báo lỗi", async () => {
  const { nguon, goi } = nguonGia({ them: true });
  assert.deepEqual(await luuBanChe(GOC, BAN, nguon), { ok: false, loi: TAI_LOI });
  assert.deepEqual(goi, ["them:shareable:2026-10-30"]);
});

test("E5 (c) tải được mà chuyển ngăn lỗi → báo bản gốc chưa sang Nội bộ", async () => {
  const { nguon } = nguonGia({ sua: true });
  const kq = await luuBanChe(GOC, BAN, nguon);
  assert.deepEqual(kq, { ok: false, loi: GOC_CHUA_SANG });
  assert.ok(!kq.ok && kq.loi.includes("bản gốc chưa sang Nội bộ"));
});

test("E5 (d) ảnh nguồn Nội bộ → từ chối trước khi tải, không gọi gì", async () => {
  const { nguon, goi } = nguonGia();
  assert.deepEqual(await luuBanChe({ ...GOC, compartment: "internal" }, BAN, nguon), { ok: false, loi: CHI_ANH_GUI_DUOC });
  assert.deepEqual(goi, []);
});

test("E5 đối chứng đỏ: chuyển ngăn trước khi tải thì ca (b) gọi chuyển ngăn và bị gọi tên", async () => {
  const { nguon, goi } = nguonGia({ them: true });
  const luuSai = async () => { await nguon.sua(GOC.id, { compartment: "internal" }); try { await nguon.them({ ok: true, file: BAN.file, type: "image/webp", takenAt: null, thumb: BAN.thumb, width: 1, height: 1 }, "shareable"); } catch { /* lỗi tải */ } };
  await luuSai();
  assert.ok(goi.includes("sua:g1:internal"), "ca (b): bản sai đã chuyển bản gốc dù tải lỗi");
});
