// Màn nhập: lần nhập gần đây và hộp hoàn tác (hàng 66 nhap-hoan-tac, AC-5, AC-8, E8). Hàm thuần của lib/nhap, fetch giả.
import assert from "node:assert/strict";
import { test } from "node:test";
import { docLanNhapGanDay, hoanTacLanNhap, xemThuHoanTac, type Fetch } from "./goi-api";
import {
  CHUA_XONG,
  DA_HOAN_TAC,
  danhSachGanDay,
  KHONG_CO_GI,
  moHop,
  NUT_SAU_GHI,
  nutXacNhan,
  tieuDeHop,
  trangThaiDanhSach,
  type KetQuaHoanTac,
  type LanNhapCuaToi,
} from "./hoan-tac";

const lan = (i: number, status: LanNhapCuaToi["status"] = "committed"): LanNhapCuaToi => ({
  id: `lan-${i}`,
  fileName: `[Tệp ${i}].xlsx`,
  createdAt: `2026-11-${String(i + 1).padStart(2, "0")}T08:00:00.000Z`,
  status,
  soDongGhi: i,
});
const KE: KetQuaHoanTac = { importId: "lan-1", status: "committed", go: 2, traGia: 1, khongDuoc: 1, danhSach: [{ rowNumber: 4, buildingName: "Toà A", unitNumber: "A-01.01", lyDo: "Đã có người sửa sau lần nhập" }] };

test("màn nhập: lần nhập gần đây và nút hoàn tác", async () => {
  // Mười hai lần lộn thứ tự, hai lần đã hoàn tác.
  const ds = [5, 11, 0, 3, 9, 1, 7, 10, 2, 8, 4, 6].map((i) => lan(i, i === 11 || i === 4 ? "undone" : "committed"));
  const dong = danhSachGanDay(ds);
  assert.deepEqual(dong.map((d) => d.id), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2].map((i) => `lan-${i}`), "10 lần mới nhất trước");
  const daHt = dong.filter((d) => d.id === "lan-11" || d.id === "lan-4");
  assert.ok(daHt.every((d) => d.nhan === DA_HOAN_TAC && !d.coNut), "lần đã hoàn tác: nhãn, không nút");
  assert.ok(dong.filter((d) => !daHt.includes(d)).every((d) => d.coNut && d.nhan === null), "lần còn lại: có nút");
  assert.deepEqual(
    [trangThaiDanhSach(null, false), trangThaiDanhSach([], false), trangThaiDanhSach(null, true), trangThaiDanhSach(ds, false)],
    ["dang-tai", "trong", "loi", "co-dong"],
    "bốn trạng thái danh sách",
  );
  assert.equal(NUT_SAU_GHI, "Hoàn tác lần nhập này");

  // Lời gọi API: địa chỉ và thân.
  const goi: { url: string; body: unknown }[] = [];
  const f: Fetch = async (url, init) => {
    goi.push({ url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    return new Response(JSON.stringify(url === "/api/v1/imports" ? ds : KE), { status: 200 });
  };
  await docLanNhapGanDay(f);
  await xemThuHoanTac(f, "lan-1");
  assert.deepEqual(goi.at(-1), { url: "/api/v1/imports/lan-1/undo", body: { dryRun: true } }, "xem thử gửi dryRun");
  assert.equal(goi[0]!.url, "/api/v1/imports");

  // Hộp xác nhận.
  assert.equal(tieuDeHop(KE), "Gỡ 2 căn khỏi Quỹ hàng · Trả giá cũ cho 1 căn · 1 căn không hoàn tác được");
  const khongGi = nutXacNhan({ ...moHop("lan-1"), buoc: "san-sang", keHoach: { ...KE, go: 0, traGia: 0 } });
  assert.equal(khongGi.tat, true, "không có gì để gỡ: nút tắt");
  assert.equal(khongGi.chu, KHONG_CO_GI);
  assert.equal(nutXacNhan({ ...moHop("lan-1"), buoc: "dang-ghi", keHoach: KE }).tat, true, "đang ghi: nút khoá");
  assert.equal(nutXacNhan({ ...moHop("lan-1"), buoc: "san-sang", keHoach: KE }).tat, false, "có kế hoạch: nút mở");
  const f503: Fetch = async () => new Response(JSON.stringify({ error: "import-undo-incomplete" }), { status: 503 });
  const loi = await hoanTacLanNhap(f503, "lan-1");
  assert.deepEqual("loi" in loi ? loi.loi : null, CHUA_XONG, "lỗi giữa chừng: chữ nguyên văn");
  assert.equal(nutXacNhan({ ...moHop("lan-1"), buoc: "loi", keHoach: KE, loi: CHUA_XONG }).tat, false, "lỗi giữa chừng: nút mở lại");
  // Huỷ: chỉ xem thử, không lời gọi ghi.
  const truocHuy = goi.length;
  await xemThuHoanTac(f, "lan-2");
  assert.deepEqual(goi.slice(truocHuy).map((g) => g.body), [{ dryRun: true }], "mở hộp rồi huỷ: không lời gọi ghi");
});
