// Chọn tệp trước khi mẫu tải xong (hàng 66 nhap-hoan-tac, AC-11, E11 — Ngoài-5 của hàng 67). Lời hứa đọc mẫu điều khiển tay.
import assert from "node:assert/strict";
import { test } from "node:test";
import { planFromDictionary, readTable, taoMau, type CotMau, type Grid, type ImportContext, type PlanTarget } from "@quy-hang/core/import";
import { danhMucMau, HOM_NAY } from "../../../../../packages/core/test/import/sinh";
import { chayOng } from "./duong-ong";
import { daiBaoMau, DANG_TAI_MAU, ghepKhiCoMau, LOI_MAU, type MauDaNho } from "./cho-mau";
import type { LoiGoi } from "./goi-api";

const CTX: ImportContext = { today: HOM_NAY, catalog: danhMucMau() };
const LUOI: Grid = [["Toà", "Mã căn", "Giá", "Cột X"], ["Toà A", "A-01.01", "3 tỷ", "ghi chú riêng"]];

/** Mẫu sinh bằng đường thật: lần trước người đổi «Cột X» thành ghi chú nội bộ. */
function mauThat(): CotMau[] {
  const t = readTable(LUOI);
  const p = planFromDictionary(t);
  const doi = { ...p, columns: p.columns.map((c) => (c.column === "Cột X" ? { ...c, target: "privateRemarks" as PlanTarget, confidence: "high" as const } : c)) };
  return taoMau(doi, t.headers, { importId: "lan-1", at: "2026-11-01T00:00:00Z" });
}

function hua<T>() {
  let giai!: (v: T) => void;
  let tuChoi!: (e: unknown) => void;
  const p = new Promise<T>((a, b) => ((giai = a), (tuChoi = b)));
  return { p, giai, tuChoi };
}

test("màn nhập: chọn tệp trước khi mẫu tải xong", async () => {
  const mau = mauThat();
  const h = hua<CotMau[] | LoiGoi>();
  let trangThai: MauDaNho = { kind: "dang-tai" };
  let xong = false;
  const cho = ghepKhiCoMau(LUOI, CTX, h.p).then((r) => {
    xong = true;
    trangThai = r.mau;
    return r;
  });
  await Promise.resolve();
  assert.equal(daiBaoMau(trangThai, null)?.title, DANG_TAI_MAU, "đang chờ mẫu: báo Đang tải mẫu");
  assert.equal(xong, false, "chưa có kế hoạch khi mẫu còn treo");
  h.giai(mau);
  const r = await cho;
  assert.deepEqual(r.ong.plan, chayOng(LUOI, CTX, mau).plan, "kế hoạch bằng khi mẫu có sẵn trước lúc chọn tệp");
  assert.equal(daiBaoMau(r.mau, r.ong)?.title, "Ghép theo mẫu đã nhớ — 4/4 cột");

  const h2 = hua<CotMau[] | LoiGoi>();
  const cho2 = ghepKhiCoMau(LUOI, CTX, h2.p);
  h2.tuChoi(new Error("mất mạng"));
  const r2 = await cho2;
  assert.deepEqual(r2.ong.plan, planFromDictionary(readTable(LUOI)), "tải mẫu lỗi: ghép theo từ điển");
  assert.equal(daiBaoMau(r2.mau, r2.ong)?.title, LOI_MAU, "tải mẫu lỗi: báo rõ");
});
