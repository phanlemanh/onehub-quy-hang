// Màn Cách gọi (hàng 45): thân lưu, lỗi từng ô, khoá Lưu (E3c); trang gọi chặn mục sàn (E9b).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { bangNhan, dungDongNhan, TU_VUNG_RONG } from "@quy-hang/core/labels";

import { coTheLuu, loiCuaO, oBanDau, oGiaTri, oTruong, thanLuu, traVeMacDinh } from "./cach-goi-thuan";

const DAY = dirname(fileURLToPath(import.meta.url));

test("màn cách gọi: thân lưu và khoá Lưu", () => {
  const bo = bangNhan(null);
  const o = { ...oBanDau(bo), [oTruong("feeInclusion")]: "Phí CN", [oGiaTri("feeInclusion", "included")]: "BP", [oTruong("legalStatus")]: "" };
  assert.deepEqual(thanLuu(bo, o), {
    fields: [{ field: "feeInclusion", label: "Phí CN" }],
    values: [{ field: "feeInclusion", value: "included", label: "BP" }],
  });
  assert.equal(coTheLuu(bo, o), true);
  // Ô chỉ khoảng trắng = rỗng: không gửi, không lỗi.
  const trang = { ...o, [oTruong("furnished")]: "   " };
  assert.deepEqual(thanLuu(bo, trang).fields.map((f) => f.field), ["feeInclusion"]);
  assert.equal(loiCuaO(bo, trang, oTruong("furnished")), null);
  // Số điện thoại, dài quá: lỗi gắn ô, Lưu khoá.
  const soDt = { ...o, [oTruong("legalStatus")]: "Gọi 0900 000 001" };
  assert.equal(loiCuaO(bo, soDt, oTruong("legalStatus")), "Chứa số điện thoại");
  assert.equal(coTheLuu(bo, soDt), false);
  const dai = { ...o, [oGiaTri("feeInclusion", "excluded")]: "x".repeat(41) };
  assert.equal(loiCuaO(bo, dai, oGiaTri("feeInclusion", "excluded")), "Dài hơn 40 ký tự");
  assert.equal(coTheLuu(bo, dai), false);
  // Nút «Trả về mặc định»: ô về rỗng, thân lưu không còn feeInclusion.
  const ve = traVeMacDinh(o, oTruong("feeInclusion"));
  assert.equal(ve[oTruong("feeInclusion")], "");
  assert.deepEqual(thanLuu(bo, ve).fields, []);
  // Gõ đúng chữ mặc định = mặc định: không gửi.
  assert.deepEqual(thanLuu(bo, { ...oBanDau(bo), [oTruong("feeInclusion")]: "Điều kiện phí", [oGiaTri("feeInclusion", "included")]: "Bao phí" }), { fields: [], values: [] });
});

test("màn cách gọi: ô ban đầu theo tên đã lưu", () => {
  const bo = bangNhan({ truong: { feeInclusion: "Phí CN" }, giaTri: { feeInclusion: { included: "BP" } } });
  const o = oBanDau(bo);
  assert.equal(o[oTruong("feeInclusion")], "Phí CN");
  assert.equal(o[oTruong("listPrice")], "");
  assert.equal(o[oGiaTri("feeInclusion", "included")], "BP");
  assert.equal(o[oGiaTri("feeInclusion", "excluded")], "");
});

test("màn cách gọi: trang gọi chặn mục sàn", () => {
  const chanTruocApi = (nguon: string) => {
    const chan = nguon.indexOf("chanMucSan(");
    const api = nguon.indexOf("/api/v1/company/");
    return chan > 0 && api > chan;
  };
  // Đối chứng dương: trang Người dùng chặn trước khi đọc API.
  assert.equal(chanTruocApi(readFileSync(join(DAY, "..", "users", "page.tsx"), "utf8")), true);
  const trang = readFileSync(join(DAY, "page.tsx"), "utf8");
  assert.equal(chanTruocApi(trang), true, "settings/labels/page.tsx phải gọi chanMucSan trước khi đọc API");
  // Chiều đỏ trên bản sao: bỏ dòng chặn thì phép đo đỏ.
  assert.equal(chanTruocApi(trang.replace(/chanMucSan\(/g, "boChan(")), false);
});

// ---- Chặn trùng tên giá trị (hàng chan-trung-ten-gia-tri: E3, E5) ----
const PHI_IN = oGiaTri("feeInclusion", "included");
const PHI_EX = oGiaTri("feeInclusion", "excluded");
const LD_DOI = oGiaTri("withdrawnReason", "owner_changed_mind");
const LD_MAT = oGiaTri("withdrawnReason", "unreachable");

test("màn cách gọi: trùng tên ở ô đang sửa", () => {
  const bo = bangNhan(TU_VUNG_RONG);
  const o0 = oBanDau(bo);
  // (a) ô «Không bao phí» gõ tên của anh em, viết khác dạng chuẩn.
  const a = { ...o0, [PHI_EX]: "bao   phí" };
  assert.equal(loiCuaO(bo, a, PHI_EX), "Trùng tên của «Bao phí»");
  assert.equal(loiCuaO(bo, a, PHI_IN), null, "ô anh em trống không lỗi");
  assert.equal(coTheLuu(bo, a), false);
  // (b) hai ô cùng chữ lạ: mỗi ô nêu đúng anh em của nó.
  const b = { ...o0, [LD_DOI]: "Mất liên lạc", [LD_MAT]: "Mất liên lạc" };
  assert.equal(loiCuaO(bo, b, LD_DOI), "Trùng tên của «Không liên lạc được»");
  assert.equal(loiCuaO(bo, b, LD_MAT), "Trùng tên của «Chủ đổi ý»");
  // (c) sửa hết trùng thì mở.
  const c = { ...a, [PHI_EX]: "Phí ngoài" };
  assert.equal(loiCuaO(bo, c, PHI_EX), null);
  assert.equal(coTheLuu(bo, c), true);
  // (d) mở màn từ tên đã lưu đang trùng (dữ liệu trước luật): báo và khoá ngay, chưa gõ gì.
  const boCu = bangNhan({ truong: {}, giaTri: { feeInclusion: { excluded: "Bao phí" } } });
  const oCu = oBanDau(boCu);
  assert.equal(loiCuaO(boCu, oCu, PHI_EX), "Trùng tên của «Bao phí»");
  assert.equal(coTheLuu(boCu, oCu), false);
  const boLanh = bangNhan({ truong: {}, giaTri: { feeInclusion: { excluded: "Phí ngoài" } } });
  assert.equal(loiCuaO(boLanh, oBanDau(boLanh), PHI_EX), null, "đối chứng: tên đã lưu không trùng");
  assert.equal(coTheLuu(boLanh, oBanDau(boLanh)), true);
});

test("màn cách gọi: màn và máy chủ cùng luật trùng tên", () => {
  const bo = bangNhan(TU_VUNG_RONG);
  const o0 = oBanDau(bo);
  const BANG: [string, Record<string, string>][] = [
    ["riêng–mặc định", { [PHI_EX]: "Bao phí" }],
    ["riêng–riêng", { [LD_DOI]: "Mất liên lạc", [LD_MAT]: "mất liên LẠC" }],
    ["hoa thường", { [PHI_IN]: "KHÔNG  bao phí" }],
    ["đổi chéo", { [PHI_IN]: "Không bao phí", [PHI_EX]: "Bao phí" }],
    ["khác tập", { [LD_MAT]: "Bao phí" }],
    ["không trùng", { [PHI_EX]: "Phí ngoài", [LD_MAT]: "Mất liên lạc" }],
    ["đúng mặc định của chính nó", { [PHI_IN]: "bao phí" }],
  ];
  let dem = 0;
  for (const [ten, them] of BANG) {
    const o = { ...o0, ...them };
    assert.equal(coTheLuu(bo, o), dungDongNhan(thanLuu(bo, o)).ok, `${ten}: màn và máy chủ lệch`);
    dem++;
  }
  assert.equal(dem, BANG.length);
  assert.deepEqual(BANG.map(([, t]) => coTheLuu(bo, { ...o0, ...t })), [false, false, false, false, true, true, true]);
});
