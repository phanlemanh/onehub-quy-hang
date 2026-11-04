// Đã gửi (hàng 36: AC-3, AC-4, AC-5, AC-6) — phần thuần và phần dựng (renderToStaticMarkup), fetch giả ghi lời gọi.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DongCan } from "./chi-tiet";
import { hrefCanThay, taoTatLink, type CanTrongLink, type Goi, type TrangThaiTat, type VuaDoi } from "./da-gui";
import { CHU, ChiTietLanGui, DanhSachDaGui } from "./danh-sach";

const can = (changed: VuaDoi, suggestions: CanTrongLink["suggestions"] = []): CanTrongLink => ({ id: "L1", name: "Toà A · A-12.01", listPrice: 2_900_000_000, standardStatus: "Active", interest: 2, changed, suggestions });
const dung = (c: CanTrongLink) => renderToStaticMarkup(h(DongCan, { c }));

test("đã gửi: nhãn vừa đổi", () => {
  const BANG: [VuaDoi, string | null][] = [
    [null, null],
    [{ price: { from: 3_200_000_000, to: 2_900_000_000 } }, "Vừa đổi giá: 3,2 tỷ → 2,9 tỷ"],
    [{ status: { to: "Pending" } }, "Đã có người đặt cọc"],
    [{ status: { to: "Closed" } }, "Không còn"],
  ];
  assert.equal(BANG.length, 4, "số dòng bảng viết trước");
  for (const [changed, mong] of BANG) {
    const chu = dung(can(changed));
    if (mong) assert.ok(chu.includes(mong), `thiếu «${mong}»`);
    else for (const n of ["Vừa đổi", "đặt cọc", "Không còn"]) assert.ok(!chu.includes(n), `căn không đổi mang «${n}»`);
  }
});

test("đã gửi: gợi ý căn thay mở luồng Gửi", () => {
  const chu = dung(can({ status: { to: "Pending" } }, [{ id: "T1", name: "Toà A · A-11.02", listPrice: 3_000_000_000 }]));
  assert.equal(hrefCanThay("T1"), "/shares/new?can=T1");
  assert.ok(chu.includes(`href="${hrefCanThay("T1")}"`), "dòng căn thay không mở luồng Gửi");
  assert.ok(chu.includes("Gợi ý căn thay"));
});

test("đã gửi: tắt link một lần", async () => {
  const ghi = (status: number) => {
    const loi: string[] = [];
    const goi: Goi = async (url) => {
      loi.push(url);
      return { ok: status < 300, status };
    };
    return { goi, loi };
  };
  let tt: TrangThaiTat = "mo";
  const a = ghi(200);
  const bam = taoTatLink({ goi: a.goi, xacNhan: () => true, id: "S1", doi: (t) => (tt = t) });
  await bam();
  await bam();
  assert.deepEqual(a.loi, ["/api/v1/shares/S1/disable"], "một lời gọi sau xác nhận");
  assert.equal(tt, "da-tat");
  const b = ghi(200);
  await taoTatLink({ goi: b.goi, xacNhan: () => false, id: "S1", doi: () => {} })();
  assert.deepEqual(b.loi, [], "huỷ xác nhận mà vẫn gọi");
  const c = ghi(409);
  let t3: TrangThaiTat = "mo";
  await taoTatLink({ goi: c.goi, xacNhan: () => true, id: "S1", doi: (t) => (t3 = t) })();
  assert.equal(t3, "da-tat", "409 là đã tắt, không báo lỗi");
  const chi = (disabledAt: string | null) =>
    renderToStaticMarkup(h(ChiTietLanGui, { l: { id: "S1", audience: "client", recipient: "[Tên]", listingCount: 1, covers: [], createdAt: "2026-11-04T00:00:00Z", disabledAt, opens: 0, interests: 0, lastOpenedAt: null, mine: true, listings: [] }, tat: "mo" }));
  assert.ok(chi(null).includes('data-nut="tat-link"'), "link mở mà thiếu nút tắt");
  assert.ok(!chi("2026-11-04T01:00:00Z").includes('data-nut="tat-link"'), "link đã tắt còn nút tắt");
});

test("đã gửi: trạng thái màn", () => {
  const BANG: [Parameters<typeof DanhSachDaGui>[0]["tt"], string][] = [
    [{ kieu: "xong", ds: [] }, CHU.trong],
    [{ kieu: "loi" }, CHU.loi],
    [{ kieu: "dang-tai" }, 'data-slot="skeleton"'],
    [{ kieu: "khong-vai" }, CHU.khongVai],
  ];
  assert.equal(BANG.length, 4, "số dòng bảng viết trước");
  for (const [tt, mong] of BANG) assert.ok(renderToStaticMarkup(h(DanhSachDaGui, { tt })).includes(mong), `${tt.kieu}: thiếu «${mong}»`);
  assert.ok(renderToStaticMarkup(h(DanhSachDaGui, { tt: { kieu: "xong", ds: [] } })).includes('href="/inventory/cards"'), "trống mà thiếu lối đi gửi");
  assert.deepEqual([CHU.trong, CHU.loi, CHU.khongVai], ["Chưa gửi link nào", "Chưa tải được — thử lại", "Đầu khách và trưởng nhóm xem được Đã gửi"]);
});
