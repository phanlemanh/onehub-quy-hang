// Mở đúng lead từ thông báo (hồ sơ thong-bao-lead, E6). Mỗi bảng viết trước, đếm bằng assert số. Bộ xử lý bấm thông báo
// nạp từ đúng tệp service worker thật (public/sw.js) vào một ngữ cảnh giả — không chép lại mã của nó.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

import { noiDungLead } from "@quy-hang/core/push";

import { docLeadThamSo, KHONG_CON_LEAD, moNhom, timLead } from "./mo-lead";

const MA = "0b6f1c2e-3d4a-4e5f-8a9b-0c1d2e3f4a5b";

describe("mở lead: đọc ?lead= từ URL", () => {
  it("bảng bốn dạng tham số", () => {
    const BANG: [string, string, string | null][] = [
      ["có mã hợp lệ", `lead=${MA}`, MA],
      ["mã rỗng", "lead=", null],
      ["mã sai khuôn", "lead=lead:abc' or 1=1", null],
      ["không có tham số", "unit=A-01", null],
    ];
    let so = 0;
    for (const [ten, qs, mong] of BANG) {
      assert.equal(docLeadThamSo(qs), mong, `dòng «${ten}»`);
      so++;
    }
    assert.equal(so, 4);
  });
});

describe("mở lead: chọn nhóm và dòng", () => {
  const DS = [
    { nhom: { code: "price_adjustment" }, viec: [{ id: "can:1" }, { id: "can:2" }] },
    { nhom: { code: "new_lead" }, viec: [{ id: "lead:khac" }, { id: `lead:${MA}` }] },
  ];
  it("lead có trong danh sách → nhóm của nó và dòng lead:<id>", () => {
    assert.deepEqual(timLead(DS, MA), { nhom: "new_lead", dong: `lead:${MA}` });
  });
  it("lead không còn → chữ «không còn»", () => {
    assert.deepEqual(timLead(DS, "9b6f1c2e-3d4a-4e5f-8a9b-0c1d2e3f4a5b"), { khongCon: KHONG_CON_LEAD });
    assert.equal(KHONG_CON_LEAD, "Lead này không còn ở Hôm nay của bạn");
  });
  it("mở nhóm đang gập, giữ «mở hết»", () => {
    assert.deepEqual(moNhom({ "nhom:new_lead": false, "nhom:call_back": true }, "new_lead"), { "nhom:new_lead": true, "nhom:call_back": true });
    assert.equal(moNhom(true, "new_lead"), true);
  });
});

describe("service worker: bấm thông báo", () => {
  const GOC = "https://quyhang.example.test";
  const SW = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../../public/sw.js"), "utf8");

  /** Nạp sw.js thật với `self` giả (kèm `clients` và `registration` khi cần); trả bộ nghe sự kiện và hàm thuần. */
  function napSw(clients?: unknown, registration?: unknown) {
    const nghe: Record<string, (e: unknown) => void> = {};
    const ctx = vm.createContext({
      URL,
      self: { clients, registration, addEventListener: (ten: string, f: (e: unknown) => void) => (nghe[ten] = f), location: { origin: GOC } },
    });
    vm.runInContext(SW, ctx);
    return { nghe, xuLy: ctx.xuLyBamThongBao as (url: string, clients: unknown, origin: string) => Promise<string> };
  }

  type CuaGia = { url: string; focus: () => Promise<void>; navigate: (u: string) => Promise<void> };
  function clientsGia(cuaSo: string[]) {
    const nhat: string[] = [];
    const ds: CuaGia[] = cuaSo.map((url) => ({
      url,
      focus: async () => void nhat.push(`focus ${url}`),
      navigate: async (u: string) => void nhat.push(`navigate ${u}`),
    }));
    return { nhat, api: { matchAll: async () => ds, openWindow: async (u: string) => void nhat.push(`open ${u}`) } };
  }

  it("bảng hai dòng: có cửa sổ cùng gốc → đưa lên và chuyển tới đúng url; không có → mở cửa sổ mới", async () => {
    const { xuLy } = napSw();
    const dich = `${GOC}/today?lead=${MA}`;
    const BANG: [string, string[], string, string[]][] = [
      ["có cửa sổ cùng gốc", ["https://khac.example.test/", `${GOC}/inventory`], "dua-len", [`focus ${GOC}/inventory`, `navigate ${dich}`]],
      ["không có cửa sổ", [], "mo-moi", [`open ${dich}`]],
    ];
    let so = 0;
    for (const [ten, cuaSo, mongKq, mongNhat] of BANG) {
      const c = clientsGia(cuaSo);
      assert.equal(await xuLy(`/today?lead=${MA}`, c.api, GOC), mongKq, `dòng «${ten}»`);
      assert.deepEqual(c.nhat, mongNhat, `dòng «${ten}»`);
      so++;
    }
    assert.equal(so, 2);
  });

  it("trọn vòng: nội dung lõi dựng → bộ nghe push hiện thông báo → chạm thông báo mở đúng lead", async () => {
    // Nội dung do lõi dựng (cùng hàm máy chủ dùng), không dựng tay khuôn bên đọc.
    const noiDung = noiDungLead({ leadId: MA, buildingName: "[Toà A]", need: "sale" });
    const hien: { title: string; options: { body: string; tag: string; data: { url: string } } }[] = [];
    const c = clientsGia([]);
    const { nghe } = napSw(c.api, { showNotification: async (title: string, options: never) => void hien.push({ title, options }) });
    assert.deepEqual(Object.keys(nghe).sort(), ["activate", "install", "notificationclick", "push"]);
    let cho: Promise<unknown> | null = null;
    nghe.push!({ data: { json: () => JSON.parse(JSON.stringify(noiDung)) }, waitUntil: (p: Promise<unknown>) => void (cho = p) });
    await cho;
    assert.equal(hien.length, 1, "bộ nghe push không hiện thông báo");
    assert.deepEqual([hien[0]!.title, hien[0]!.options.body, hien[0]!.options.tag], [noiDung.title, noiDung.body, noiDung.tag]);
    // Chạm đúng thông báo vừa hiện: data do chính bộ nghe push ghi.
    let dong = false;
    cho = null;
    nghe.notificationclick!({
      notification: { data: hien[0]!.options.data, close: () => void (dong = true) },
      waitUntil: (p: Promise<unknown>) => void (cho = p),
    });
    await cho;
    assert.ok(dong, "thông báo không đóng");
    assert.deepEqual(c.nhat, [`open ${GOC}/today?lead=${MA}`], "chạm thông báo không mở đúng lead");
  });
});
