// Tin «xoá máy» ở service worker (hàng 38: E11). Nạp đúng tệp public/sw.js thật vào ngữ cảnh giả — không chép lại mã của
// nó — với IndexedDB giả có kho của người bị báo X và của người khác Z.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const SW = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../public/sw.js"), "utf8");

function mayGia(tenKho: string[]) {
  const kho = new Set(tenKho);
  const thongBao: { title: string; tag?: string }[] = [];
  let daHuy = 0;
  const idb = {
    deleteDatabase(ten: string) {
      const r: { onsuccess?: () => void; onerror?: () => void; onblocked?: () => void } = {};
      queueMicrotask(() => {
        kho.delete(ten);
        r.onsuccess?.();
      });
      return r;
    },
  };
  const pushManager = { getSubscription: async () => ({ unsubscribe: async () => void daHuy++ }) };
  const registration = {
    pushManager,
    showNotification: async (title: string, o: { tag?: string }) => void thongBao.push({ title, tag: o.tag }),
  };
  return { kho, thongBao, idb, registration, daHuy: () => daHuy };
}

/** Nạp sw.js thật; trả bộ nghe sự kiện và hàm thuần xử lý tin xoá. */
function napSw(m: ReturnType<typeof mayGia>, boNhanhXoa = false) {
  const nghe: Record<string, (e: unknown) => void> = {};
  const ma = boNhanhXoa ? SW.replace('if (p.tag === "xoa-may")', "if (false)") : SW;
  const ctx = vm.createContext({
    URL,
    self: { registration: m.registration, indexedDB: m.idb, addEventListener: (t: string, f: (e: unknown) => void) => (nghe[t] = f), location: { origin: "https://q.test" } },
  });
  vm.runInContext(ma, ctx);
  return nghe;
}

/** Gửi một tin đẩy vào bộ nghe `push`, chờ `waitUntil`. */
async function day(nghe: Record<string, (e: unknown) => void>, p: unknown) {
  let cho: Promise<unknown> = Promise.resolve();
  nghe.push!({ data: { json: () => p }, waitUntil: (x: Promise<unknown>) => void (cho = x) });
  await cho;
}

const TIN_XOA = { title: "Quỹ hàng", body: "Quỹ hàng đã đăng xuất trên máy này", url: "/login?bi-bao-mat=1&u=u-x", tag: "xoa-may" };
const TIN_LEAD = { title: "Lead mới", body: "[Toà A] · Bán", url: "/today?lead=l1", tag: "lead-l1" };

/** Thước của E11 — trả lỗi nêu vế hỏng. */
async function kiemE11(boNhanhXoa = false): Promise<string[]> {
  const loi: string[] = [];
  const m = mayGia(["quy-hang-sync:u-x", "quy-hang-sync:u-z"]);
  const nghe = napSw(m, boNhanhXoa);
  await day(nghe, TIN_XOA);
  if (m.kho.has("quy-hang-sync:u-x")) loi.push("kho X còn sau tin xoá");
  if (!m.kho.has("quy-hang-sync:u-z")) loi.push("kho người khác bị xoá");
  if (m.thongBao.length !== 1 || m.thongBao[0]!.title !== "Quỹ hàng") loi.push("không hiện đúng một thông báo");
  if (m.daHuy() !== 1) loi.push("đăng ký đẩy chưa huỷ");

  const m2 = mayGia(["quy-hang-sync:u-x"]);
  await day(napSw(m2, boNhanhXoa), TIN_LEAD);
  if (!m2.kho.has("quy-hang-sync:u-x")) loi.push("tin lead thường xoá kho");
  if (m2.thongBao.length !== 1 || m2.thongBao[0]!.tag !== "lead-l1") loi.push("tin lead thường không hiện như cũ");
  return loi;
}

test("E11 tin xoa-may: xoá kho của X, giữ kho Z, hiện một thông báo; tin lead thường như cũ", async () => {
  assert.deepEqual(await kiemE11(), []);
});

test("E11 chiều đỏ: bản sao bỏ nhánh xoa-may thì kho X còn", async () => {
  assert.ok((await kiemE11(true)).includes("kho X còn sau tin xoá"));
});
