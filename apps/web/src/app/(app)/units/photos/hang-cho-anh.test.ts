// Hàng chờ ảnh chụp trên điện thoại (hàng 41 chup-anh-dien-thoai: E2, E3, E4, E7, E8, E9). Hàng chờ thật chạy trên kho ảnh
// chờ giả (cùng giao diện với kho IndexedDB, đặt tên cơ sở dữ liệu bằng đúng hàm của kho thật) và máy chủ giả giữ bảng ảnh
// theo mã. Mỗi phép đo là một bộ so trả danh sách lệch trên ma trận viết trước; cặp hai chiều trên cùng dữ liệu: vật lành →
// [], bản sao hỏng → lời lệch ghim bằng deepEqual. Ảnh là byte viết bằng mã; dữ liệu mẫu, không dữ liệu cá nhân thật.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type { Compartment } from "@quy-hang/core/photos";
import { readFileSync } from "node:fs";
import { datTruocKhiXoaKho, tenCoSo, tenKhoAnhCho, xoaKhoCuaNguoi } from "@/lib/sync/kho-indexeddb";
import { xoaMayBiBao } from "@/lib/sync/may-bi-bao";
import { CHU_KY_CHO, type DongHo } from "@/lib/sync/mang";
import { CHU_KHONG_HANG_CHO, KhayChup, khongNhanTep, NutMoMay } from "../ho-so/dien-thoai/chup-anh";
import { anhDangTrinh, sauLoiDoc, type TrangThaiAnh } from "../ho-so/dien-thoai/anh-lon";
import {
  doiNgan,
  LoiGuiAnh,
  nhanAnhChup,
  noiNhip,
  phanLoaiLoi,
  taoHangCho,
  theoDoiDaTai,
  type BanGhiCho,
  type GuiAnh,
  type HangCho,
  type HangChoDeps,
  type KhoAnhCho,
  type NganChup,
  type TrangThaiCho,
} from "./hang-cho-anh";
import { chuanBiTep, type TepSanSang } from "./tai-len";

// ——— Đồ giả ———

const TOA = "[Mẫu] Toà A";
const MA = "A-01.02";
const MA_B = "A-01.03";
const JPEG = (n: number, seed: number) => new Uint8Array([0xff, 0xd8, 0xff, 0xe0, ...new Array<number>(n - 4).fill(seed)]) as Uint8Array<ArrayBuffer>;
const tep = (ten: string, takenAt: string | null = null, type: TepSanSang["type"] = "image/jpeg"): TepSanSang => ({
  ok: true,
  file: new File([JPEG(500, ten.length)], ten, { type }),
  type,
  takenAt,
  thumb: new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])]),
  width: 2000,
  height: 1500,
});

/** IndexedDB giả: cơ sở dữ liệu theo tên — tên đặt bằng đúng hàm của kho thật. */
function idbGia() {
  const db = new Map<string, Map<string, unknown>>();
  const kho = (userId: string): KhoAnhCho => {
    const ten = tenKhoAnhCho(userId);
    const ngan = () => db.get(ten) ?? (db.set(ten, new Map()), db.get(ten)!);
    return {
      tai: async () => [...(db.get(ten)?.values() ?? [])] as BanGhiCho[],
      ghi: async (b) => void ngan().set(b.id, b),
      xoa: async (id) => void db.get(ten)?.delete(id),
    };
  };
  const xoa = async (ten: string) => void db.delete(ten);
  return { db, kho, xoa };
}

type Kieu = "ok" | "mat-truoc" | "mat-phan-hoi" | number;
/** Máy chủ giả: một bảng ảnh theo mã; `che` quyết lời gửi thứ n đi thế nào. Mã đã có → 409. */
function mayChuGia(che: (lan: number, id: string) => Kieu = () => "ok") {
  const dong = new Map<string, { toa: string; ma: string; ngan: Compartment; takenAt: string | null }>();
  const gui: { id: string; ngan: Compartment; takenAt: string | null }[] = [];
  let lan = 0;
  const xung = { n: 0 };
  const g: GuiAnh = async (a) => {
    lan++;
    const k = che(lan, a.id);
    if (k === "mat-truoc") throw new TypeError("Failed to fetch");
    if (typeof k === "number") throw new LoiGuiAnh(k);
    if (dong.has(a.id)) {
      xung.n++;
      throw new LoiGuiAnh(409);
    }
    dong.set(a.id, { toa: a.toa, ma: a.ma, ngan: a.ngan, takenAt: a.tep.takenAt });
    gui.push({ id: a.id, ngan: a.ngan, takenAt: a.tep.takenAt });
    if (k === "mat-phan-hoi") throw new TypeError("Failed to fetch");
  };
  return { dong, gui, g, xung, daCo: async ({ id }: { id: string }) => dong.has(id) };
}

let dem = 0;
function hang(o: Partial<HangChoDeps> & { mang?: { on: boolean } } = {}) {
  const mang = o.mang ?? { on: true };
  const may = mayChuGia();
  const idb = idbGia();
  const h = taoHangCho({ gui: may.g, daCo: may.daCo, kho: idb.kho("u-chu"), onLine: () => mang.on, xem: () => "blob:xem", taoMa: () => `ma-${++dem}`, ...o });
  return { h, mang, may, idb };
}
const trangThai = (h: HangCho) => h.anh().map((a) => a.trangThai);
const xong = async (h: HangCho) => {
  await h.day();
  await h.choKho();
};

// ——— E2 · AC-2: ảnh vào đúng toà, mã và ngăn lúc chụp ———

type ODoi = { ngan: Compartment; doi: boolean };
const O_NGAN: readonly ODoi[] = [
  { ngan: "shareable", doi: false },
  { ngan: "shareable", doi: true },
  { ngan: "internal", doi: false },
  { ngan: "internal", doi: true },
];
const TEN_NGAN = { shareable: "Gửi được", internal: "Nội bộ" } as const;
const khac = (n: Compartment): Compartment => (n === "shareable" ? "internal" : "shareable");

/** Bộ so: mỗi ô chụp một ảnh lúc mất mạng, (có thể) đổi ngăn rồi mới có mạng; lời gửi phải mang toà, mã, ngăn lúc chụp. */
async function lechNgan(boc: (g: GuiAnh, dangChon: () => Compartment) => GuiAnh = (g) => g) {
  const ra: string[] = [];
  for (const o of O_NGAN) {
    let dangChon = o.ngan;
    const may = mayChuGia();
    const mang = { on: false };
    const h = taoHangCho({ gui: boc(may.g, () => dangChon), daCo: may.daCo, kho: idbGia().kho("u"), onLine: () => mang.on, xem: () => "", taoMa: () => `ma-${++dem}` });
    h.them(TOA, MA, dangChon, tep("a.jpg"));
    if (o.doi) dangChon = khac(dangChon);
    mang.on = true;
    await xong(h);
    const d = [...may.dong.values()][0];
    if (!d || d.toa !== TOA || d.ma !== MA || d.ngan !== o.ngan) ra.push(`${TEN_NGAN[o.ngan]} · ${o.doi ? "đổi ngăn" : "giữ ngăn"} · gửi ${d ? TEN_NGAN[d.ngan] : "không gì"}`);
  }
  return ra;
}

test("E2 ngăn lúc chụp: ma trận 4 ô (Gửi được · Nội bộ) × (đổi ngăn sau khi chụp: có · không)", async () => {
  assert.equal(O_NGAN.length, 4);
  assert.deepEqual(await lechNgan(), []);
});

test("E2 chiều đỏ: bản sao đọc ngăn đang chọn lúc gửi thay lúc chụp → bộ so nêu đúng ô", async () => {
  const lucGui = (g: GuiAnh, dangChon: () => Compartment): GuiAnh => (a) => g({ ...a, ngan: dangChon() });
  assert.deepEqual(await lechNgan(lucGui), ["Gửi được · đổi ngăn · gửi Nội bộ", "Nội bộ · đổi ngăn · gửi Gửi được"]);
});

const khay = (thayNoiBo: boolean, ngan: Compartment | null) =>
  renderToStaticMarkup(createElement(KhayChup, { ngan, thayNoiBo, matMang: false, ds: [], hong: [], onChon: () => {}, onThuLai: () => {} }));

test("E2 ngăn chụp dựng thật: nút Nội bộ chỉ khi API trả noiBo=thay (2 ô)", () => {
  const coNoiBo = (html: string) => html.includes('value="internal"') || html.includes(">Nội bộ<");
  assert.deepEqual([coNoiBo(khay(true, null)), coNoiBo(khay(false, null))], [true, false]);
  assert.ok(khay(false, null).includes("Gửi được"), "đối chứng dương: ngăn Gửi được luôn có");
});

/** Thuộc tính tắt của nút (không phải lớp `disabled:` của Tailwind). */
const TAT = /\sdisabled=""/;

/** Hai ô viết trước của ngăn mặc định (Hỏi-2 b): mở lần đầu · mở lần hai sau khi lần trước chọn Nội bộ rồi đóng. */
function lechMacDinh(doi: (s: NganChup, v: Parameters<typeof doiNgan>[1]) => NganChup = doiNgan) {
  const ra: string[] = [];
  const dau = doi({ mo: false, ngan: null }, { kind: "mo" });
  const hai = doi(doi(doi(dau, { kind: "chon", ngan: "internal" }), { kind: "dong" }), { kind: "mo" });
  for (const [ten, s] of [["mở lần đầu", dau], ["mở lần hai", hai]] as const) {
    const tat = TAT.test(renderToStaticMarkup(createElement(NutMoMay, { ngan: s.ngan, onMo: () => {} })));
    if (s.ngan !== null || !tat) ra.push(`${ten} · ${s.ngan ? TEN_NGAN[s.ngan] : "chưa chọn"}${tat ? "" : " · nút bật"} · mong chưa chọn`);
  }
  // Đối chứng dương: chọn rồi thì nút bật.
  const daChon = doi(dau, { kind: "chon", ngan: "shareable" });
  if (TAT.test(renderToStaticMarkup(createElement(NutMoMay, { ngan: daChon.ngan, onMo: () => {} })))) ra.push("đã chọn · nút tắt");
  return ra;
}

test("E2 ngăn mặc định (Hỏi-2 b): chưa chọn ngăn, «Mở máy ảnh» tắt — 2 ô viết trước", () => {
  assert.deepEqual(lechMacDinh(), []);
});

test("E2 chiều đỏ: bản sao nhớ ngăn lần trước → bộ so nêu ô mở lần hai", () => {
  const nho = (s: NganChup, v: Parameters<typeof doiNgan>[1]): NganChup => (v.kind === "mo" ? { ...s, mo: true } : doiNgan(s, v));
  assert.deepEqual(lechMacDinh(nho), ["mở lần hai · Nội bộ · nút bật · mong chưa chọn"]);
});

// ——— E3 · AC-3: vào hàng chờ ngay, tải nền theo thứ tự, bốn trạng thái ———

test("E3 ảnh vào danh sách trước khi lời gửi nào xong; ba ảnh tải đúng thứ tự chụp", async () => {
  let mo!: () => void;
  const chan = new Promise<void>((r) => (mo = r));
  const may = mayChuGia();
  const { h } = hang({ gui: async (a) => (await chan, may.g(a)) });
  h.them(TOA, MA, "shareable", tep("1.jpg"));
  h.them(TOA, MA, "shareable", tep("2.jpg"));
  h.them(TOA, MA, "internal", tep("3.jpg"));
  assert.equal(h.anh().length, 3, "ảnh có trong danh sách ngay sau them()");
  assert.ok(trangThai(h).every((t) => t === "cho-mang" || t === "dang-tai"));
  assert.equal(may.gui.length, 0, "chưa lời gửi nào xong");
  mo();
  await xong(h);
  assert.deepEqual(may.gui.map((g) => g.id), h.anh().map((a) => a.key));
  assert.deepEqual(trangThai(h), ["da-tai", "da-tai", "da-tai"]);
});

type OChuyen = { ten: string; mong: TrangThaiCho[] };
/** Năm ô chuyển trạng thái viết trước. Mỗi ô chụp đủ ảnh rồi đọc trạng thái cuối. */
async function lechChuyen(boc: () => (g: GuiAnh) => GuiAnh = () => (g) => g) {
  const ra: string[] = [];
  const chay = async (ten: string, che: (lan: number) => Kieu, n: number, sau?: (h: HangCho) => Promise<void>) => {
    const may = mayChuGia((lan) => che(lan));
    const { h } = hang({ gui: boc()(may.g), daCo: may.daCo });
    for (let i = 0; i < n; i++) h.them(TOA, MA, "shareable", tep(`${i}.jpg`));
    await xong(h);
    if (sau) await sau(h);
    return { ten, thay: trangThai(h) };
  };
  const ca: (OChuyen & { thay: TrangThaiCho[] })[] = [
    { mong: ["da-tai"], ...(await chay("thành công", () => "ok", 1)) },
    { mong: ["loi"], ...(await chay("máy chủ 403", () => 403, 1)) },
    { mong: ["cho-mang"], ...(await chay("ném TypeError", () => "mat-truoc", 1)) },
    {
      mong: ["da-tai"],
      ...(await chay("loi + thuLai", (lan) => (lan === 1 ? 403 : "ok"), 1, async (h) => {
        h.thuLai(h.anh()[0]!.key);
        await xong(h);
      })),
    },
    { mong: ["da-tai", "loi", "da-tai"], ...(await chay("ảnh 2 lỗi", (lan) => (lan === 2 ? 403 : "ok"), 3)) },
  ];
  for (const c of ca) {
    c.mong.forEach((m, i) => {
      if (c.thay[i] !== m) ra.push(`${c.ten} · ảnh ${i + 1} · ${c.thay[i]} · mong ${m}`);
    });
  }
  return { ra, so: ca.length };
}

test("E3 chuyển trạng thái: ma trận 5 ô viết trước", async () => {
  const { ra, so } = await lechChuyen();
  assert.equal(so, 5);
  assert.deepEqual(ra, []);
});

test("E3 chiều đỏ: bản sao dừng cả lô khi một ảnh 403 → bộ so nêu ảnh 3", async () => {
  // Bản sao: gặp 403 thì coi cả lô hỏng — mọi lời gửi sau đó không đi (như mất mạng).
  const dungCaLo = () => {
    let hong = false;
    return (g: GuiAnh): GuiAnh => async (a) => {
      if (hong) throw new TypeError("lô đã dừng");
      try {
        await g(a);
      } catch (e) {
        if (e instanceof LoiGuiAnh && e.status === 403) hong = true;
        throw e;
      }
    };
  };
  const { ra } = await lechChuyen(dungCaLo);
  assert.deepEqual(ra, ["loi + thuLai · ảnh 1 · cho-mang · mong da-tai", "ảnh 2 lỗi · ảnh 3 · cho-mang · mong da-tai"]);
});

test("E3 tệp không phải ảnh hay quá 10 MB không vào hàng chờ và trả lý do của lõi", async () => {
  const vao: string[] = [];
  const veGia = async () => ({ thumb: new Blob([new Uint8Array([1])]), width: 10, height: 10 });
  const lon = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0]), new Uint8Array(10 * 1024 * 1024 + 1)], "lon.jpg", { type: "image/jpeg" });
  const kq = await nhanAnhChup([new File([new TextEncoder().encode("chữ")], "ghi-chu.txt"), lon, new File([JPEG(500, 1)], "lanh.jpg", { type: "image/jpeg" })], {
    chuanBi: (f) => chuanBiTep(f, veGia),
    them: (t) => void vao.push(t.file.name),
  });
  assert.deepEqual(kq, [
    { ten: "ghi-chu.txt", loi: "Không phải ảnh" },
    { ten: "lon.jpg", loi: "Ảnh quá 10 MB" },
    { ten: "lanh.jpg", loi: null },
  ]);
  assert.deepEqual(vao, ["lanh.jpg"]);
});

// ——— E4 · AC-4: mất mạng không mất ảnh, gửi lại không trùng, hết phiên giữ chờ ———

/** Đồng hồ giả của nhịp thử mạng. */
function dongHoGia() {
  let bay = 0;
  let hen: { luc: number; fn: () => void; id: number }[] = [];
  let id = 0;
  const d: DongHo = {
    now: () => bay,
    setTimeout: (fn, ms) => (hen.push({ luc: bay + ms, fn, id: ++id }), id),
    clearTimeout: (h) => void (hen = hen.filter((x) => x.id !== h)),
  };
  const toi = (ms: number) => {
    bay += ms;
    const den = hen.filter((x) => x.luc <= bay);
    hen = hen.filter((x) => x.luc > bay);
    den.forEach((x) => x.fn());
  };
  return { d, toi };
}

type OMang = "mất trước khi chụp" | "mất giữa lúc tải" | "mất phản hồi" | "có lại bằng online" | "có lại bằng nhịp 15 giây";
const O_MANG: readonly OMang[] = ["mất trước khi chụp", "mất giữa lúc tải", "mất phản hồi", "có lại bằng online", "có lại bằng nhịp 15 giây"];

async function lechMang(boc: (g: GuiAnh) => GuiAnh = (g) => g, boKichHoat = false) {
  const ra: string[] = [];
  for (const o of O_MANG) {
    const mang = { on: o !== "mất giữa lúc tải" && o !== "mất phản hồi" ? false : true };
    const may = mayChuGia((lan) => {
      if (o === "mất giữa lúc tải" && lan === 2) {
        mang.on = false;
        return "mat-truoc";
      }
      if (o === "mất phản hồi" && lan === 1) return "mat-phan-hoi";
      return "ok";
    });
    const { h } = hang({ gui: boc(may.g), daCo: may.daCo, mang });
    const gio = dongHoGia();
    const nhip = noiNhip(h, gio.d);
    for (let i = 0; i < 3; i++) h.them(TOA, MA, "shareable", tep(`${i}.jpg`));
    await xong(h);
    mang.on = true;
    // Hai ô «có lại»: CHỈ cơ chế của ô kích hoạt lượt gửi — sau đó chờ lượt đang chạy, không tự mở lượt mới.
    if (o === "có lại bằng online") {
      if (!boKichHoat) nhip.quayLaiTrang();
      await h.cho();
      await h.choKho();
    } else if (o === "có lại bằng nhịp 15 giây") {
      if (!boKichHoat) gio.toi(CHU_KY_CHO);
      await h.cho();
      await h.choKho();
    } else {
      await h.day();
      await xong(h);
    }
    nhip.dung();
    const theoMa = new Set(may.gui.map((g) => g.id));
    if (may.gui.length !== 3 || theoMa.size !== 3) ra.push(`${o} · ${may.gui.length} dòng · mong 3`);
    if (trangThai(h).some((t) => t !== "da-tai")) ra.push(`${o} · ${trangThai(h).join(",")} · mong da-tai`);
    // Gửi lại sau khi mất phản hồi: hỏi danh sách trước, không gửi lại mù nên máy chủ không phải trả 409.
    if (may.xung.n) ra.push(`${o} · ${may.xung.n} lời đáp 409 · mong 0`);
  }
  return ra;
}

test("E4 mạng: ma trận 5 ô × 3 ảnh — máy chủ có đúng 3 ảnh, mỗi mã một dòng", async () => {
  assert.equal(O_MANG.length, 5);
  assert.deepEqual(await lechMang(), []);
});

test("E4 đối chứng: bỏ sự kiện online và nhịp 15 giây → đúng hai ô «có lại» không tải được ảnh nào", async () => {
  assert.deepEqual(await lechMang((g) => g, true), [
    "có lại bằng online · 0 dòng · mong 3",
    "có lại bằng online · cho-mang,cho-mang,cho-mang · mong da-tai",
    "có lại bằng nhịp 15 giây · 0 dòng · mong 3",
    "có lại bằng nhịp 15 giây · cho-mang,cho-mang,cho-mang · mong da-tai",
  ]);
});

test("E4 gửi lại sau tải lại trang: mất phản hồi rồi mở lại app, hỏi danh sách trước khi gửi → đủ 3 dòng, không trùng, không lời 409", async () => {
  const idb = idbGia();
  const may = mayChuGia((lan) => (lan === 1 ? "mat-phan-hoi" : "ok"));
  const mang = { on: true };
  const dung = () => taoHangCho({ gui: may.g, daCo: may.daCo, kho: idb.kho("u-chu"), onLine: () => mang.on, xem: () => "", taoMa: () => `ma-${++dem}` });
  mang.on = false;
  const truoc = dung();
  for (let i = 0; i < 3; i++) truoc.them(TOA, MA, "shareable", tep(`${i}.jpg`));
  await xong(truoc);
  mang.on = true;
  await truoc.day();
  await truoc.dung();
  // Mở lại app: ảnh đầu (máy chủ đã ghi, mất phản hồi) vẫn nằm trong kho.
  const sau = dung();
  await sau.khoiDong();
  await xong(sau);
  assert.deepEqual(trangThai(sau).filter((t) => t !== "da-tai"), []);
  assert.equal(may.dong.size, 3);
  assert.equal(may.xung.n, 0, "ảnh dựng lại từ kho hỏi danh sách trước, máy chủ không phải trả 409");
  assert.equal((await idb.kho("u-chu").tai()).length, 0);
});

test("E4 kho trên máy hỏng thì hàng chờ nói ra (khoLoi), ngăn chụp báo ảnh chỉ còn trong bộ nhớ", async () => {
  const hong: KhoAnhCho = { tai: async () => Promise.reject(new Error("QuotaExceededError")), ghi: async () => Promise.reject(new Error("QuotaExceededError")), xoa: async () => {} };
  const mo = taoHangCho({ gui: mayChuGia().g, daCo: async () => false, kho: hong, onLine: () => false, xem: () => "" });
  await mo.khoiDong();
  assert.equal(mo.khoLoi(), true, "mở kho lỗi");
  const ghi = taoHangCho({ gui: mayChuGia().g, daCo: async () => false, kho: { ...idbGia().kho("u"), ghi: hong.ghi }, onLine: () => false, xem: () => "" });
  ghi.them(TOA, MA, "shareable", tep("a.jpg"));
  await ghi.choKho();
  assert.equal(ghi.khoLoi(), true, "ghi kho lỗi");
  const lanh = taoHangCho({ gui: mayChuGia().g, daCo: async () => false, kho: idbGia().kho("u"), onLine: () => false, xem: () => "" });
  lanh.them(TOA, MA, "shareable", tep("a.jpg"));
  await lanh.choKho();
  assert.equal(lanh.khoLoi(), false, "đối chứng: kho lành không báo");
  const html = renderToStaticMarkup(createElement(KhayChup, { ngan: null, thayNoiBo: false, matMang: true, khoLoi: true, ds: [], hong: [], onChon: () => {}, onThuLai: () => {} }));
  assert.match(html, /data-trang-thai="kho-loi"/);
  assert.doesNotMatch(renderToStaticMarkup(createElement(KhayChup, { ngan: null, thayNoiBo: false, matMang: true, ds: [], hong: [], onChon: () => {}, onThuLai: () => {} })), /kho-loi/);
});

test("E4 chiều đỏ: bản sao tạo mã mới mỗi lần gửi → bộ so nêu ô mất phản hồi", async () => {
  let n = 0;
  const maMoi = (g: GuiAnh): GuiAnh => (a) => g({ ...a, id: `${a.id}-gui-${++n}` });
  assert.deepEqual(await lechMang(maMoi), ["mất phản hồi · 4 dòng · mong 3"]);
});

test("E4 tải lại trang: dựng lại hàng chờ từ kho giữ đủ 3 ảnh chờ, rồi tải đủ", async () => {
  const idb = idbGia();
  const may = mayChuGia();
  const mang = { on: false };
  const dung = () => taoHangCho({ gui: may.g, daCo: may.daCo, kho: idb.kho("u-chu"), onLine: () => mang.on, xem: () => "", taoMa: () => `ma-${++dem}` });
  const truoc = dung();
  for (let i = 0; i < 3; i++) truoc.them(TOA, MA, i === 2 ? "internal" : "shareable", tep(`${i}.jpg`));
  await xong(truoc);
  const sau = dung();
  await sau.khoiDong();
  assert.deepEqual(trangThai(sau), ["cho-mang", "cho-mang", "cho-mang"]);
  assert.deepEqual(sau.anh().map((a) => a.ngan), ["shareable", "shareable", "internal"]);
  mang.on = true;
  await xong(sau);
  assert.equal(may.dong.size, 3);
});

/** Hai ô phiên viết trước: máy chủ trả 401 · cùng người đăng nhập lại. */
async function lechPhien(phanLoai: typeof phanLoaiLoi = phanLoaiLoi) {
  const ra: string[] = [];
  let het = true;
  const may = mayChuGia(() => (het ? 401 : "ok"));
  const { h, idb } = hang({ gui: may.g, daCo: may.daCo, phanLoai });
  for (let i = 0; i < 3; i++) h.them(TOA, MA, "shareable", tep(`${i}.jpg`));
  await xong(h);
  const tren = await idb.kho("u-chu").tai();
  if (tren.length !== 3 || tren.some((b) => b.trangThai !== "cho-mang")) ra.push(`401 · kho ${tren.map((b) => b.trangThai).join(",") || "rỗng"} · mong cho-mang×3`);
  for (const t of trangThai(h)) if (t !== "cho-mang") ra.push(`401 · ${t} · mong cho-mang`);
  het = false;
  for (const a of h.anh()) if (a.trangThai === "loi") h.thuLai(a.key);
  await xong(h);
  if (may.dong.size !== 3) ra.push(`đăng nhập lại · ${may.dong.size} dòng · mong 3`);
  return [...new Set(ra)];
}

test("E4 hết phiên 401: kho giữ đủ 3 ảnh chờ, không ảnh nào lỗi hay bị xoá; đăng nhập lại thì đủ 3 dòng", async () => {
  assert.deepEqual(await lechPhien(), []);
});

test("E4 chiều đỏ: bản sao coi 401 là lỗi → bộ so nêu ô 401", async () => {
  const coiLoi: typeof phanLoaiLoi = (e, on) => (e instanceof LoiGuiAnh && e.status === 401 ? "khong-nhan" : phanLoaiLoi(e, on));
  assert.deepEqual(await lechPhien(coiLoi), ["401 · kho loi,loi,loi · mong cho-mang×3", "401 · loi · mong cho-mang"]);
});

// ——— E7 · AC-6: bản trên máy xoá khi xác nhận, đăng xuất hay máy bị báo mất; kho theo người ———

type OXoa = { ngan: Compartment; viec: "xác nhận" | "đăng xuất" };
const O_XOA: readonly OXoa[] = [
  { ngan: "shareable", viec: "xác nhận" },
  { ngan: "internal", viec: "xác nhận" },
  { ngan: "shareable", viec: "đăng xuất" },
  { ngan: "internal", viec: "đăng xuất" },
];

async function lechXoa(bocKho: (k: KhoAnhCho, ngan: Compartment) => KhoAnhCho = (k) => k) {
  const ra: string[] = [];
  for (const o of O_XOA) {
    const idb = idbGia();
    idb.db.set(tenCoSo("u-chu"), new Map([["c1", { listings: [] }]]));
    const mang = { on: o.viec === "xác nhận" };
    const may = mayChuGia();
    const h = taoHangCho({ gui: may.g, daCo: may.daCo, kho: bocKho(idb.kho("u-chu"), o.ngan), onLine: () => mang.on, xem: () => "", taoMa: () => `ma-${++dem}` });
    h.them(TOA, MA, o.ngan, tep("so-do.jpg"));
    await xong(h);
    if (o.viec === "đăng xuất") await xoaKhoCuaNguoi("u-chu", idb.xoa);
    const con = (await idb.kho("u-chu").tai()).length;
    if (con) ra.push(`${TEN_NGAN[o.ngan]} · ${o.viec} · còn trên máy`);
    if (o.viec === "đăng xuất" && idb.db.has(tenCoSo("u-chu"))) ra.push(`${TEN_NGAN[o.ngan]} · đăng xuất · kho đồng bộ còn`);
    if (o.viec === "xác nhận" && may.dong.size !== 1) ra.push(`${TEN_NGAN[o.ngan]} · xác nhận · máy chủ ${may.dong.size} dòng`);
  }
  return ra;
}

test("E7 xoá bản trên máy: ma trận 4 ô (Gửi được · Nội bộ) × (xác nhận · đăng xuất / máy bị báo mất)", async () => {
  assert.equal(O_XOA.length, 4);
  assert.deepEqual(await lechXoa(), []);
});

test("E7 chiều đỏ: bản sao giữ ảnh Nội bộ sau xác nhận → bộ so nêu đúng ô", async () => {
  const giuNoiBo = (k: KhoAnhCho, ngan: Compartment): KhoAnhCho => ({ ...k, xoa: async (id) => (ngan === "internal" ? undefined : k.xoa(id)) });
  assert.deepEqual(await lechXoa(giuNoiBo), ["Nội bộ · xác nhận · còn trên máy"]);
});

test("E7 đăng xuất giữa lúc đang tải: lượt đang bay không ghi lại kho đã xoá (cả ảnh Nội bộ)", async () => {
  // Bộ dò: sau khi xoá kho, kho của người không được xuất hiện lại.
  const chay = async (dungTruoc: boolean) => {
    const idb = idbGia();
    let mo!: () => void;
    const chan = new Promise<void>((r) => (mo = r));
    const h = taoHangCho({ gui: async () => (await chan, Promise.reject(new LoiGuiAnh(403))), daCo: async () => false, kho: idb.kho("u-chu"), onLine: () => true, xem: () => "", taoMa: () => `ma-${++dem}` });
    h.them(TOA, MA, "internal", tep("so.jpg"));
    h.them(TOA, MA, "shareable", tep("a.jpg"));
    await h.choKho();
    const dung = dungTruoc ? h.dung() : Promise.resolve();
    if (!dungTruoc) await xoaKhoCuaNguoi("u-chu", idb.xoa);
    mo();
    await dung;
    if (dungTruoc) await xoaKhoCuaNguoi("u-chu", idb.xoa);
    await h.cho();
    await h.choKho();
    return idb.db.has(tenKhoAnhCho("u-chu"));
  };
  assert.equal(await chay(true), false, "dừng hàng chờ rồi xoá: kho không sống lại");
  assert.equal(await chay(false), true, "đối chứng dương của bộ dò: xoá mà không dừng hàng chờ thì lượt đang bay tạo lại kho");
});

// Bảng viết trước: MỌI lối xoá kho của người trên máy. Mỗi lối chạy qua hàm thật của nó; hàng chờ dừng nhờ việc đăng ký ở
// `xoaKhoCuaNguoi`, không nhờ thứ tự do bài kiểm tự đặt.
const LOI_XOA: readonly { ten: string; xoa: (u: string, x: (ten: string) => Promise<void>) => Promise<void> }[] = [
  { ten: "đăng xuất trong vỏ · màn chọn sàn", xoa: (u, x) => xoaKhoCuaNguoi(u, x) },
  { ten: "máy bị báo mất", xoa: (u, x) => xoaMayBiBao(u, { xoaKho: (v) => xoaKhoCuaNguoi(v, x), huyDay: async () => {} }) },
];

async function lechLoiXoa(dangKy: boolean): Promise<string[]> {
  const ra: string[] = [];
  for (const l of LOI_XOA) {
    const idb = idbGia();
    let mo!: () => void;
    const chan = new Promise<void>((r) => (mo = r));
    const h = taoHangCho({ gui: async () => (await chan, Promise.reject(new LoiGuiAnh(403))), daCo: async () => false, kho: idb.kho("u-chu"), onLine: () => true, xem: () => "", taoMa: () => `ma-${++dem}` });
    datTruocKhiXoaKho(dangKy ? async (u) => (u === "u-chu" ? h.dung() : undefined) : async () => {});
    h.them(TOA, MA, "internal", tep("so.jpg"));
    await h.choKho();
    const xoa = l.xoa("u-chu", idb.xoa);
    mo();
    await xoa;
    await h.cho();
    await h.choKho();
    if (idb.db.has(tenKhoAnhCho("u-chu"))) ra.push(`${l.ten} · kho ảnh chờ sống lại`);
  }
  datTruocKhiXoaKho(async () => {});
  return ra;
}

test("E7 mọi lối xoá kho dừng hàng chờ trước: lượt đang bay không tạo lại kho (cả ảnh Nội bộ)", async () => {
  assert.deepEqual(await lechLoiXoa(true), []);
});

test("E7 chiều đỏ: không đăng ký việc dừng trước khi xoá → bộ so nêu đúng hai lối", async () => {
  assert.deepEqual(await lechLoiXoa(false), ["đăng xuất trong vỏ · màn chọn sàn · kho ảnh chờ sống lại", "máy bị báo mất · kho ảnh chờ sống lại"]);
});

test("E7 lối xoá kho trong mã: mọi chỗ xoá kho của người đi qua xoaKhoCuaNguoi, hàng chờ đăng ký việc dừng ở đó", () => {
  const doc = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
  for (const p of ["../../../../lib/sync/react.tsx", "../../../(auth)/dang-xuat.tsx", "../../../../lib/sync/may-bi-bao.ts"]) {
    const s = doc(p);
    assert.match(s, /xoaKhoCuaNguoi/, p);
    assert.doesNotMatch(s, /deleteDatabase/, p);
  }
  assert.match(doc("./hang-cho-may.ts"), /datTruocKhiXoaKho\(/);
});

test("E7 kho theo người: kho của A dựng bằng mã người B trả rỗng; kho đồng bộ không có khoá ảnh; 401 không xoá kho", async () => {
  const idb = idbGia();
  const dongBo = new Map([["c1", { listings: [], queue: [] }]]);
  idb.db.set(tenCoSo("u-a"), dongBo);
  const may = mayChuGia(() => 401);
  const a = taoHangCho({ gui: may.g, daCo: may.daCo, kho: idb.kho("u-a"), onLine: () => true, xem: () => "", taoMa: () => `ma-${++dem}` });
  for (let i = 0; i < 3; i++) a.them(TOA, MA, i ? "internal" : "shareable", tep(`${i}.jpg`));
  await xong(a);
  assert.equal((await idb.kho("u-a").tai()).length, 3, "đối chứng dương: kho của A còn 3 ảnh sau 401");
  const b = taoHangCho({ gui: may.g, daCo: may.daCo, kho: idb.kho("u-b"), onLine: () => true, xem: () => "" });
  await b.khoiDong();
  assert.deepEqual(b.anh(), []);
  assert.deepEqual([...dongBo.keys()], ["c1"]);
  assert.deepEqual(Object.keys(dongBo.get("c1")!), ["listings", "queue"]);
  // Xoá kho của A không đụng kho của người khác trên máy.
  await b.them(TOA, MA, "shareable", tep("b.jpg"));
  await b.choKho();
  await xoaKhoCuaNguoi("u-a", idb.xoa);
  assert.equal((await idb.kho("u-b").tai()).length, 1);
});

// ——— E8 · AC-7: ngày chụp là ngày trong tệp, vắng thì ngày lúc chụp trên máy ———

type ONgay = { ten: string; takenAt: string | null; type: TepSanSang["type"]; chup: Date; gui: Date; mong: string };
const O_NGAY: readonly ONgay[] = [
  { ten: "EXIF", takenAt: "2026-11-01", type: "image/jpeg", chup: new Date(2026, 10, 5, 10, 0), gui: new Date(2026, 10, 5, 10, 1), mong: "2026-11-01" },
  { ten: "không EXIF", takenAt: null, type: "image/jpeg", chup: new Date(2026, 10, 5, 23, 50), gui: new Date(2026, 10, 6, 7, 0), mong: "2026-11-05" },
  { ten: "PNG không EXIF", takenAt: null, type: "image/png", chup: new Date(2026, 10, 4, 9, 30), gui: new Date(2026, 10, 6, 7, 0), mong: "2026-11-04" },
];

async function lechNgay(boc: (g: GuiAnh, bayGio: () => Date) => GuiAnh = (g) => g) {
  const ra: string[] = [];
  for (const o of O_NGAY) {
    let bay = o.chup;
    const mang = { on: false };
    const may = mayChuGia();
    const h = taoHangCho({ gui: boc(may.g, () => bay), daCo: may.daCo, kho: idbGia().kho("u"), onLine: () => mang.on, xem: () => "", bayGio: () => bay, taoMa: () => `ma-${++dem}` });
    h.them(TOA, MA, "shareable", tep("a", o.takenAt, o.type));
    bay = o.gui;
    mang.on = true;
    await xong(h);
    const thay = may.gui[0]?.takenAt;
    if (thay !== o.mong) ra.push(`${o.ten} · ${thay} · mong ${o.mong}`);
  }
  return ra;
}

test("E8 ngày chụp: ma trận 3 ô với đồng hồ giả", async () => {
  assert.deepEqual(await lechNgay(), []);
});

test("E8 chiều đỏ: bản sao lấy ngày lúc gửi → bộ so nêu ô không EXIF", async () => {
  const lucGui = (g: GuiAnh, bayGio: () => Date): GuiAnh => (a) => {
    const d = bayGio();
    const ngay = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return g({ ...a, tep: { ...a.tep, takenAt: a.tep.takenAt === "2026-11-01" ? a.tep.takenAt : ngay } });
  };
  assert.deepEqual(await lechNgay(lucGui), ["không EXIF · 2026-11-06 · mong 2026-11-05", "PNG không EXIF · 2026-11-06 · mong 2026-11-04"]);
});

// ——— E9 · AC-8: ảnh lớn và mục Ảnh đọc lại khi ảnh của căn đã tải ———

async function lechDocLai(nghe: (h: HangCho) => Pick<HangCho, "subscribe" | "soDaTai"> = (h) => h) {
  const { h } = hang();
  const lan = { A: 0, B: 0 };
  // Hai chỗ đọc của căn A (ảnh lớn, mục Ảnh) và một của căn B.
  const thoi = [theoDoiDaTai(nghe(h), TOA, MA, () => lan.A++), theoDoiDaTai(nghe(h), TOA, MA_B, () => lan.B++)];
  h.them(TOA, MA, "shareable", tep("a.jpg"));
  await xong(h);
  thoi.forEach((f) => f());
  const ra: string[] = [];
  if (lan.A !== 1) ra.push(`căn A · ${lan.A} lần đọc lại · mong 1`);
  if (lan.B !== 0) ra.push(`căn B · ${lan.B} lần đọc lại · mong 0`);
  return ra;
}

test("E9 đọc lại: căn A đọc lại đúng một lần khi ảnh của A đã tải, căn B không", async () => {
  assert.deepEqual(await lechDocLai(), []);
});

test("E9 chiều đỏ: bản sao không nghe số đã tải → bộ so nêu căn A", async () => {
  const diec = (h: HangCho) => ({ subscribe: () => () => {}, soDaTai: h.soDaTai });
  assert.deepEqual(await lechDocLai(diec), ["căn A · 0 lần đọc lại · mong 1"]);
});

test("E9 đọc lại lỗi giữ danh sách cũ (nút «Chụp ảnh» không mất); lần đọc đầu lỗi thì báo lỗi", () => {
  const khoa = `${TOA}|${MA}`;
  const cu = { khoa, anh: { kind: "co", ds: { anh: [], noiBo: "thay", suaDuoc: true } } as TrangThaiAnh };
  const lech = (f: typeof sauLoiDoc) => {
    const ra: string[] = [];
    if (f(cu, khoa, false) !== cu) ra.push("đọc lại lỗi · mất danh sách cũ");
    if (f(null, khoa, true).anh.kind !== "loi") ra.push("đọc đầu lỗi · không báo lỗi");
    if (f({ ...cu, khoa: "khac|X" }, khoa, false).anh.kind !== "loi") ra.push("đổi căn · giữ nhầm căn khác");
    return ra;
  };
  assert.deepEqual(lech(sauLoiDoc), []);
  assert.deepEqual(lech((_c, k, m) => ({ khoa: k, anh: { kind: "loi", matMang: m } })), ["đọc lại lỗi · mất danh sách cũ"]);
});

test("E3 không có hàng chờ: mọi tệp máy ảnh trả đều báo lý do, không tệp nào bị bỏ im lặng", () => {
  const files = [new File([JPEG(500, 1)], "a.jpg"), new File([JPEG(500, 2)], "b.jpg")];
  assert.deepEqual(khongNhanTep(files), [
    { ten: "a.jpg", loi: CHU_KHONG_HANG_CHO },
    { ten: "b.jpg", loi: CHU_KHONG_HANG_CHO },
  ]);
});

test("E9 trong lúc đọc lại khung lớn vẫn trình ảnh cũ, không về «Đang tải ảnh…»", () => {
  const cu: TrangThaiAnh = { kind: "co", ds: { anh: [], noiBo: "thay", suaDuoc: true } };
  const khoa = `${TOA}|${MA}`;
  assert.deepEqual(anhDangTrinh({ khoa, anh: cu }, khoa, MA), cu);
  assert.deepEqual(anhDangTrinh(null, khoa, MA), { kind: "dang-tai" }, "đối chứng: lần đầu chưa có thì đang tải");
});
