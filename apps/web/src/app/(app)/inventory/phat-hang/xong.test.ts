// E8b (hàng 43, AC-8) — xong một lần xuất: việc của người trước, ghi lần xuất sau; ghi hỏng thì bài, file vẫn có kèm
// «Chưa ghi được lần xuất», không thử lại; việc hỏng thì không ghi. E4 (phần web, AC-4): «Chép bài» gọi bộ nhớ tạm đúng
// một lần với đúng bài, mạng chỉ là ghi lần xuất. Chiều đỏ: bản sao ghi trước khi chép → lần xuất ghi oan.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { BanXuat } from "@quy-hang/core/export";
import { CHUA_GHI, DA_CHEP, daTai, DUONG_GHI, lamXuat, xongLanXuat, type KetQuaXong, type MoiTruong } from "./xong";

const DAY = dirname(fileURLToPath(import.meta.url));
const TODAY = "2026-11-04";

const BAN_BAI: BanXuat = {
  mau: "post_zalo",
  nguoiNhan: "nhom_moi_gioi",
  soCan: 3,
  cot: ["Toà", "Giá"],
  khoa: ["buildingName", "listPrice"],
  dong: [
    ["[Mẫu] A", "3 tỷ"],
    ["[Mẫu] A", "4 tỷ"],
    ["[Mẫu] B", "5 tỷ"],
  ],
  boQua: [],
  bai: "[Mẫu] A · 3 tỷ\n[Mẫu] A · 4 tỷ\n[Mẫu] B · 5 tỷ",
};
const BAN_TEP: BanXuat = { ...BAN_BAI, mau: "xlsx", nguoiNhan: "khach_rieng", bai: undefined };

type Gia = { mt: MoiTruong; chep: string[]; mang: { url: string; than: unknown }[]; tai: string[] };

function moiTruongGia(o: { chepHong?: boolean; taiHong?: boolean; ghi?: "ok" | "loi" | "mat-mang" } = {}): Gia {
  const g: Gia = { chep: [], mang: [], tai: [], mt: undefined as unknown as MoiTruong };
  g.mt = {
    clipboard: {
      writeText: async (s) => {
        if (o.chepHong) throw new Error("bộ nhớ tạm bị chặn");
        g.chep.push(s);
      },
    },
    fetch: async (url, init) => {
      g.mang.push({ url, than: JSON.parse(String(init.body)) });
      if (o.ghi === "mat-mang") throw new TypeError("Failed to fetch");
      return new Response(o.ghi === "loi" ? '{"error":"x"}' : '{"id":"1"}', { status: o.ghi === "loi" ? 500 : 201 });
    },
    dungTep: async () => {
      if (o.taiHong) throw new Error("không dựng được tệp");
      return new Blob(["x"]);
    },
    taiVe: (_tep, ten) => {
      g.tai.push(ten);
    },
  };
  return g;
}

test("E8b ghi thành công — «Đã chép bài», ghi đúng một lần với mẫu, người nhận, số căn", async () => {
  const g = moiTruongGia({ ghi: "ok" });
  assert.deepEqual(await lamXuat(BAN_BAI, TODAY, g.mt), { ok: true, thongBao: DA_CHEP, chuaGhi: null });
  assert.deepEqual(g.mang, [{ url: DUONG_GHI, than: { format: "post_zalo", recipient: "nhom_moi_gioi", listingCount: 3 } }]);
});

test("E8b tải file thành công — «Đã tải bang-hang-<ngày>.xlsx», ghi đúng một lần", async () => {
  const g = moiTruongGia({ ghi: "ok" });
  assert.deepEqual(await lamXuat(BAN_TEP, TODAY, g.mt), { ok: true, thongBao: daTai("bang-hang-2026-11-04.xlsx"), chuaGhi: null });
  assert.equal(daTai("bang-hang-2026-11-04.xlsx"), "Đã tải bang-hang-2026-11-04.xlsx");
  assert.deepEqual(g.tai, ["bang-hang-2026-11-04.xlsx"]);
  assert.deepEqual(g.mang, [{ url: DUONG_GHI, than: { format: "xlsx", recipient: "khach_rieng", listingCount: 3 } }]);
});

test("E8b ghi trả lỗi hay mất mạng — bài vẫn chép, file vẫn tải, kèm «Chưa ghi được lần xuất», không thử lại", async () => {
  for (const ghi of ["loi", "mat-mang"] as const) {
    const g = moiTruongGia({ ghi });
    assert.deepEqual(await lamXuat(BAN_BAI, TODAY, g.mt), { ok: true, thongBao: DA_CHEP, chuaGhi: CHUA_GHI }, ghi);
    assert.deepEqual(g.chep, [BAN_BAI.bai], ghi);
    assert.equal(g.mang.length, 1, `${ghi}: không thử lại`);
    const t = moiTruongGia({ ghi });
    assert.deepEqual(await lamXuat(BAN_TEP, TODAY, t.mt), { ok: true, thongBao: daTai("bang-hang-2026-11-04.xlsx"), chuaGhi: CHUA_GHI }, ghi);
    assert.deepEqual(t.tai, ["bang-hang-2026-11-04.xlsx"], ghi);
    assert.equal(t.mang.length, 1, `${ghi}: không thử lại`);
  }
  assert.equal(CHUA_GHI, "Chưa ghi được lần xuất");
});

test("E8b chép hay tải hỏng → không ghi lần xuất", async () => {
  const c = moiTruongGia({ chepHong: true, ghi: "ok" });
  assert.equal((await lamXuat(BAN_BAI, TODAY, c.mt)).ok, false);
  assert.equal(c.mang.length, 0);
  const t = moiTruongGia({ taiHong: true, ghi: "ok" });
  assert.equal((await lamXuat(BAN_TEP, TODAY, t.mt)).ok, false);
  assert.equal(t.mang.length, 0);
});

test("E8b chiều đỏ — bản sao ghi trước khi chép → ca «chép hỏng» đỏ nêu lần xuất ghi oan", async () => {
  const ghiTruoc: typeof xongLanXuat = async ({ hanhDong, ghi, thongBao, loi }) => {
    await ghi().catch(() => null);
    try {
      await hanhDong();
      return { ok: true, thongBao, chuaGhi: null };
    } catch {
      return { ok: false, loi };
    }
  };
  async function caChepHong(ham: typeof xongLanXuat): Promise<string | null> {
    let soGhi = 0;
    const kq: KetQuaXong = await ham({
      hanhDong: async () => {
        throw new Error("bộ nhớ tạm bị chặn");
      },
      ghi: async () => {
        soGhi++;
        return new Response("{}", { status: 201 });
      },
      thongBao: DA_CHEP,
      loi: "Chưa chép được bài",
    });
    return !kq.ok && soGhi > 0 ? `lần xuất ghi oan (${soGhi} lần) dù chép hỏng` : null;
  }
  assert.equal(await caChepHong(xongLanXuat), null);
  assert.match((await caChepHong(ghiTruoc)) ?? "", /lần xuất ghi oan/);
});

test("E4 web — «Chép bài» gọi bộ nhớ tạm đúng một lần với đúng bài; mạng chỉ tới /api/v1/exports", async () => {
  const g = moiTruongGia({ ghi: "ok" });
  await lamXuat(BAN_BAI, TODAY, g.mt);
  assert.deepEqual(g.chep, [BAN_BAI.bai]);
  assert.deepEqual(
    g.mang.map((m) => m.url),
    ["/api/v1/exports"],
  );
  // Nguồn của hộp thoại: lời gọi mạng duy nhất là `fetch` trong xong.ts / hop-thoai.tsx, không địa chỉ nào khác.
  for (const ten of readdirSync(DAY).filter((t) => /\.tsx?$/.test(t) && !/\.test\.tsx?$/.test(t))) {
    const nguon = readFileSync(join(DAY, ten), "utf8");
    assert.doesNotMatch(nguon, /https?:\/\//, `${ten}: không địa chỉ mạng ngoài`);
    assert.doesNotMatch(nguon, /XMLHttpRequest|sendBeacon|WebSocket|EventSource/, `${ten}: không kênh mạng khác`);
    const apis = [...nguon.matchAll(/["'`](\/api\/[^"'`]*)["'`]/g)].map((m) => m[1]);
    assert.ok(apis.every((a) => a === DUONG_GHI), `${ten}: chỉ ${DUONG_GHI}, gặp ${apis.join(", ")}`);
  }
});
