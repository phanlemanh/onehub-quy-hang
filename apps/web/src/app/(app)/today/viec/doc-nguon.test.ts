import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CHO_THU_LAI_MS, docCoThuLai, docKetQuaCoThuLai, docMang, nguonCanDocLai } from "./doc-nguon";
import { gopViec, type Nguon } from "./gop-viec";
import type { DongLeadTruongNhom } from "../nguon";

const khongCho = async () => {};

/** Fetch giả trả lần lượt các mã; `lan` đếm số lần gọi thật. */
function fetchGia(...ma: number[]) {
  const f = { lan: 0, goi: (async () => new Response('[{"leadId":"a"}]', { status: ma[f.lan++] ?? 200 })) as unknown as typeof fetch };
  return f;
}
/** Chuỗi thật của một nguồn: đọc qua fetch giả, tự thử lại, kết quả thành trạng thái nguồn rồi vào gopViec. */
async function gopSauDoc(f: ReturnType<typeof fetchGia>) {
  const ds = await docCoThuLai(() => docMang<DongLeadTruongNhom>("/api/v1/team/lead-queue", undefined, f.goi), khongCho);
  const hangDoi: Nguon<DongLeadTruongNhom> = ds === null ? { trang: "loi", ds: [] } : { trang: "ok", ds };
  return { ds, gop: gopViec<string>({ vai: ["team_lead"], bayGio: "2026-11-09T10:00:00.000Z", tv: null, dauChu: [], leadGiao: { trang: "ok" }, hangDoi, dauChuSan: { trang: "ok" }, leadCuaToi: { trang: "ok", ds: [] }, tin: { trang: "ok", ds: [] } }) };
}

describe("đọc nguồn của Hôm nay", () => {
  it("đọc lại: 500 rồi 200 tự hồi", async () => {
    const f = fetchGia(500, 200);
    const { ds, gop } = await gopSauDoc(f);
    assert.equal(ds?.length, 1);
    assert.equal(f.lan, 2);
    assert.deepEqual(gop.loi, [], "đã hồi thì không còn dòng báo");
  });
  it("đọc lại: 500 hai lần báo một dòng", async () => {
    const f = fetchGia(500, 500);
    const { ds, gop } = await gopSauDoc(f);
    assert.equal(ds, null);
    assert.equal(f.lan, 2, "chỉ thử lại một lần");
    assert.deepEqual(gop.loi, [{ nguon: "hang-doi", chu: "Chưa tải được lead quá hạn" }], "đúng một dòng, nêu tên nguồn");
    assert.equal(gop.so, 0);
  });
  it("đọc được ngay thì không thử lại", async () => {
    let lan = 0;
    await docCoThuLai(async () => {
      lan += 1;
      return [];
    }, khongCho);
    assert.equal(lan, 1);
  });
  it("thân hỏng là lỗi, không phải rỗng", async () => {
    const f = (async () => new Response("<html>", { status: 200 })) as typeof fetch;
    assert.equal(await docMang("/x", undefined, f), null);
  });
  it("mã 500 là lỗi; 200 mảng rỗng là rỗng", async () => {
    const f500 = (async () => new Response("[]", { status: 500 })) as typeof fetch;
    const f200 = (async () => new Response("[]", { status: 200 })) as typeof fetch;
    assert.equal(await docMang("/x", undefined, f500), null);
    assert.deepEqual(await docMang("/x", undefined, f200), []);
  });
  it("đọc kết quả có thử lại", async () => {
    type Kq = { ok: true; items: string[] } | { ok: false; mang: boolean };
    const HONG: Kq = { ok: false, mang: false };
    const MAT_MANG: Kq = { ok: false, mang: true };
    const DUOC: Kq = { ok: true, items: ["a"] };
    const BANG: [Kq[], string[] | null, number, number[]][] = [
      [[DUOC], ["a"], 1, []],
      [[HONG, DUOC], ["a"], 2, [CHO_THU_LAI_MS]],
      [[HONG, HONG], null, 2, [CHO_THU_LAI_MS]],
      [[MAT_MANG, DUOC], ["a"], 2, [CHO_THU_LAI_MS]],
    ];
    assert.equal(CHO_THU_LAI_MS, 2000);
    let dem = 0;
    for (const [lanLuot, mong, soGoi, cho] of BANG) {
      let lan = 0;
      const daCho: number[] = [];
      const ra = await docKetQuaCoThuLai(
        async () => lanLuot[lan++]!,
        async (ms) => void daCho.push(ms),
      );
      assert.deepEqual(ra, mong);
      assert.equal(lan, soGoi);
      assert.deepEqual(daCho, cho);
      dem++;
    }
    assert.equal(dem, 4);
  });
  it("đọc lại: có mạng trở lại đọc đúng nguồn lỗi", () => {
    assert.deepEqual(nguonCanDocLai({ a: "ok", b: "loi", c: "dang", d: "loi" }), ["b", "d"]);
  });
});
