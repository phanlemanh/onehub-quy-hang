// Thiết bị theo cạnh ngắn màn hình, mốc 768 (AC-5, Hỏi-2) và đầu `x-quy-hang-device` ở mọi lời gọi API của trình duyệt.
import assert from "node:assert/strict";
import { test } from "node:test";
import { goiFetch, taoGoiFetch } from "./goi-fetch";
import { thietBi } from "./thiet-bi";

test("thiết bị: cạnh ngắn màn hình, mốc 768", () => {
  // Ma trận viết trước (rộng × cao màn hình) — E5.
  const maTran: [number, number, "mobile" | "desktop"][] = [
    [390, 844, "mobile"],
    [844, 390, "mobile"], // điện thoại xoay ngang vẫn là điện thoại
    [767, 1024, "mobile"],
    [768, 1024, "desktop"],
    [1024, 768, "desktop"],
    [1440, 900, "desktop"],
  ];
  for (const [rong, cao, mong] of maTran) assert.equal(thietBi(rong, cao), mong, `${rong}×${cao} phải ra ${mong}`);
});

/** fetch giả: ghi đầu của từng lời gọi. */
function fetchGia() {
  const dau: { method: string; device: string | null }[] = [];
  const f = (async (_path: string, init?: RequestInit) => {
    dau.push({ method: String(init?.method), device: new Headers(init?.headers).get("x-quy-hang-device") });
    return new Response("{}", { status: 200 });
  }) as typeof fetch;
  return { f, dau };
}

/** Đặt màn hình giả cho máy đang chạy trong lúc `fn` chạy. */
async function voiManHinh(width: number, height: number, fn: () => Promise<void>) {
  const g = globalThis as { screen?: unknown };
  const cu = Object.getOwnPropertyDescriptor(g, "screen");
  Object.defineProperty(g, "screen", { value: { width, height }, configurable: true, writable: true });
  try {
    await fn();
  } finally {
    if (cu) Object.defineProperty(g, "screen", cu);
    else delete g.screen;
  }
}

test("thiết bị: hàm gọi API gửi đầu", async () => {
  // Hàm gọi tiêm fetch giả, đọc màn hình giả của máy lúc gọi.
  for (const [w, h, mong] of [
    [390, 844, "mobile"],
    [1440, 900, "desktop"],
  ] as const) {
    const { f, dau } = fetchGia();
    const goi = taoGoiFetch({ fetch: f });
    await voiManHinh(w, h, async () => {
      await goi("GET", "/api/v1/listings");
      await goi("POST", "/api/v1/listings/h/events", { type: "details_changed", payload: {}, expectedVersion: 1 });
    });
    assert.deepEqual(dau, [
      { method: "GET", device: mong },
      { method: "POST", device: mong },
    ], `${w}×${h}`);
  }
  // `goiFetch` xuất sẵn: fetch toàn cục, màn hình của máy.
  const { f, dau } = fetchGia();
  const fCu = globalThis.fetch;
  globalThis.fetch = f;
  try {
    await voiManHinh(390, 844, async () => {
      await goiFetch("GET", "/api/v1/listings");
      await goiFetch("POST", "/api/v1/listings/h/events", {});
    });
    await voiManHinh(1440, 900, async () => void (await goiFetch("POST", "/api/v1/listings/h/events", {})));
  } finally {
    globalThis.fetch = fCu;
  }
  assert.deepEqual(dau.map((d) => d.device), ["mobile", "mobile", "desktop"]);
  // Không màn hình (máy chủ, bài kiểm): máy tính.
  const k = fetchGia();
  await taoGoiFetch({ fetch: k.f })("GET", "/api/v1/listings");
  assert.equal(k.dau[0]!.device, "desktop");
});
