// «Báo sai thông tin căn» (hàng 17) — E6.
import assert from "node:assert/strict";
import { test } from "node:test";
import { SOURCE_KEYS } from "@quy-hang/core/listing";
import { chiaSe, coGui, noiDungBaoSai, type BaoSai } from "./bao-sai";

const BAO: BaoSai = { ma: "A-01.02", toa: "Toà A", khu: "[Mẫu] Khu", truong: "Diện tích", dangHien: "68,5 m²", dung: "70,2 m²", ghiChu: "Theo sổ hồng" };

test("báo sai thông tin căn", async () => {
  const t = noiDungBaoSai(BAO);
  for (const manh of ["A-01.02", "Toà A", "[Mẫu] Khu", "Diện tích", "68,5 m²", "70,2 m²", "Theo sổ hồng"]) assert.ok(t.includes(manh), `thiếu «${manh}» trong:\n${t}`);
  for (const k of SOURCE_KEYS) assert.ok(!t.includes(k), `có khoá nguồn ${k}`);
  // Đối chứng: căn có gắn số chủ giả — lời báo vẫn không chứa (dựng chỉ từ trường của danh mục và chữ người gõ).
  const coSoChu = { ...BAO, ownerPhone: "0900 000 001" } as BaoSai;
  assert.ok(!noiDungBaoSai(coSoChu).includes("0900"), "lời báo lộ số chủ");

  let fetchDem = 0;
  const fetchCu = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetchDem++;
    throw new Error("không được gọi mạng");
  }) as typeof fetch;
  try {
    const goi: string[] = [];
    const chep: string[] = [];
    const coShare = { share: async (d: { text: string }) => void goi.push(d.text), clipboard: { writeText: async (x: string) => void chep.push(x) } };
    assert.equal(await chiaSe(t, coShare), "chia-se");
    assert.deepEqual(goi, [t]);
    assert.equal(chep.length, 0, "có bảng chia sẻ thì không chép");
    const khongShare = { clipboard: { writeText: async (x: string) => void chep.push(x) } };
    assert.equal(await chiaSe(t, khongShare), "da-chep");
    assert.deepEqual(chep, [t]);
    assert.equal(fetchDem, 0, "báo sai phát sinh lời gọi mạng");
  } finally {
    globalThis.fetch = fetchCu;
  }

  assert.equal(coGui({ dung: "", ghiChu: "" }), false, "coGui: giá trị đúng rỗng");
  assert.equal(coGui({ dung: "   ", ghiChu: "" }), false, "coGui: toàn khoảng trắng");
  assert.equal(coGui({ dung: "70,2 m²", ghiChu: "" }), true, "coGui: có giá trị");
});
