import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { docCoThuLai, docMang, nguonCanDocLai } from "./doc-nguon";

const khongCho = async () => {};

describe("đọc nguồn của Hôm nay", () => {
  it("đọc lại: 500 rồi 200 tự hồi", async () => {
    let lan = 0;
    const kq = await docCoThuLai(async () => (++lan === 1 ? null : ["a"]), khongCho);
    assert.deepEqual(kq, ["a"]);
    assert.equal(lan, 2);
  });
  it("đọc lại: 500 hai lần báo một dòng", async () => {
    let lan = 0;
    const kq = await docCoThuLai(async () => {
      lan += 1;
      return null;
    }, khongCho);
    assert.equal(kq, null);
    assert.equal(lan, 2, "chỉ thử lại một lần");
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
  it("đọc lại: có mạng trở lại đọc đúng nguồn lỗi", () => {
    assert.deepEqual(nguonCanDocLai({ a: "ok", b: "loi", c: "dang", d: "loi" }), ["b", "d"]);
  });
});
