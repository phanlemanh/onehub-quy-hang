// Gọi từ máy tính (hồ sơ goi-tu-may-tinh, E6, E7, E11). Mỗi bảng viết trước, đếm bằng assert số.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type { Goi } from "@/lib/sync/types";
import { LOI_MO_SO } from "../../../today/mo-so";
import { docMaLead } from "../nguon";
import { BAO_QUAY_SO, goiChuNha, guiQuaySo } from "./quay-so";

const ID = "00000000-0000-4000-8000-0000000000d1";

/** Kho trên máy bị cấm: chạm vào là ném. */
function camKho() {
  const g = globalThis as Record<string, unknown>;
  const cu = { localStorage: g.localStorage, sessionStorage: g.sessionStorage, indexedDB: g.indexedDB };
  const nem = () => {
    throw new Error("chạm kho trên máy");
  };
  for (const k of Object.keys(cu)) Object.defineProperty(g, k, { configurable: true, get: nem });
  return () => {
    for (const [k, v] of Object.entries(cu)) Object.defineProperty(g, k, { configurable: true, writable: true, value: v });
  };
}

describe("quay số trên điện thoại (máy tính)", () => {
  it("bảng sáu câu trả lời → câu báo theo số thiết bị khác", async () => {
    const BANG: [string, () => Promise<{ status: number; body: unknown }>, string][] = [
      ["3 thiết bị, 2 khác", async () => ({ status: 200, body: { devices: 3, otherDevices: 2 } }), "Đã gửi tới 2 thiết bị khác — chạm thông báo trên điện thoại để gọi"],
      ["1 thiết bị, 1 khác", async () => ({ status: 200, body: { devices: 1, otherDevices: 1 } }), "Đã gửi tới 1 thiết bị khác — chạm thông báo trên điện thoại để gọi"],
      ["chỉ máy tính này", async () => ({ status: 200, body: { devices: 1, otherDevices: 0 } }), "Chưa có điện thoại nào bật thông báo lead — trên điện thoại mở Hôm nay, bấm Bật thông báo"],
      ["404", async () => ({ status: 404, body: null }), "Lead này không còn của bạn"],
      ["401", async () => ({ status: 401, body: null }), "Hết phiên đăng nhập — đăng nhập lại rồi thử"],
      ["mạng lỗi", async () => { throw new TypeError("fetch failed"); }, "Mất mạng — chưa gửi được, thử lại khi có mạng"],
    ];
    let so = 0;
    for (const [ten, tra, mong] of BANG) {
      const loiGoi: [string, string, unknown][] = [];
      const goi: Goi = async (m, p, b) => (loiGoi.push([m, p, b]), tra());
      const kq = await guiQuaySo(ID, goi);
      assert.equal(kq.ok ? kq.bao : kq.loi, mong, `dòng «${ten}»`);
      assert.deepEqual(loiGoi, [["POST", `/api/v1/leads/${ID}/phone-dial`, {}]], `dòng «${ten}»: lời gọi`);
      so++;
    }
    assert.equal(so, 6);
    assert.equal(BAO_QUAY_SO.daGui(2), "Đã gửi tới 2 thiết bị khác — chạm thông báo trên điện thoại để gọi");
  });

  it("gửi kèm điểm đăng ký của máy này khi có", async () => {
    const loiGoi: unknown[] = [];
    const goi: Goi = async (_m, _p, b) => (loiGoi.push(b), { status: 200, body: { devices: 2, otherDevices: 1 } });
    await guiQuaySo(ID, goi, "https://fcm.googleapis.com/fcm/send/mau");
    await guiQuaySo(ID, goi, null);
    assert.deepEqual(loiGoi, [{ endpoint: "https://fcm.googleapis.com/fcm/send/mau" }, {}]);
  });
});

describe("trang quay số", () => {
  it("200 có số → mở số một lần rồi mới đưa tới tel:", async () => {
    const tra = camKho();
    try {
      const thuTu: string[] = [];
      const goi = (async (u: string, init?: RequestInit) => {
        thuTu.push(`${init?.method} ${u}`);
        return new Response(JSON.stringify({ ownerPhone: "0900000011" }), { status: 200 });
      }) as typeof fetch;
      const kq = await goiChuNha(ID, goi, (u) => void thuTu.push(`tel ${u}`));
      assert.deepEqual(kq, { ok: true, so: "0900000011" });
      assert.deepEqual(thuTu, [`POST /api/v1/leads/${ID}/phone-reveal`, "tel tel:0900000011"], "tel trước mở số");
    } finally {
      tra();
    }
  });

  it("bảng bốn lỗi → câu báo của mở số, không đưa tới tel:", async () => {
    const BANG: [string, () => Promise<Response>, string][] = [
      ["403", async () => new Response("{}", { status: 403 }), LOI_MO_SO.khongCon],
      ["404", async () => new Response("{}", { status: 404 }), LOI_MO_SO.khongCon],
      ["401", async () => new Response("{}", { status: 401 }), LOI_MO_SO.hetPhien],
      ["mạng lỗi", async () => { throw new TypeError("fetch failed"); }, LOI_MO_SO.matMang],
    ];
    let so = 0;
    for (const [ten, tra, mong] of BANG) {
      let diToi = 0;
      const kq = await goiChuNha(ID, tra as unknown as typeof fetch, () => void diToi++);
      assert.deepEqual(kq, { ok: false, loi: mong }, `dòng «${ten}»`);
      assert.equal(diToi, 0, `dòng «${ten}»: đã đưa tới tel:`);
      so++;
    }
    assert.equal(so, 4);
  });

  it("mã lead của trang: nhận mã hợp khuôn, từ chối sai khuôn và rỗng", () => {
    assert.equal(docMaLead(ID), ID);
    assert.equal(docMaLead("khong-phai-ma"), null);
    assert.equal(docMaLead(""), null);
    assert.equal(docMaLead(undefined), null);
  });
});

describe("Tham chiếu §12 có dòng Gọi từ máy tính", () => {
  const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "..", "..", "..", "..");
  const muc12 = () => {
    const t = readFileSync(join(GOC, "docs/product/tham-chieu.md"), "utf8");
    return t.slice(t.indexOf("## 12."), t.indexOf("## 13."));
  };
  const dong = (cum: string) => muc12().split("\n").find((l) => l.startsWith("|") && l.includes(cum));
  it("có dòng và đủ ba cụm", () => {
    const d = dong("Gọi từ máy tính");
    assert.ok(d, "không có dòng «Gọi từ máy tính» ở §12");
    for (const cum of ["thông báo", "trang quay số", "tổng đài"]) assert.ok(d.includes(cum), `thiếu cụm «${cum}»`);
  });
  it("đối chứng dương: cùng hàm cắt mục tìm được dòng Mở số của lead", () => {
    assert.ok(dong("Mở số của lead"));
  });
});
