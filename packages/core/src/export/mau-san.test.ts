// Mẫu của sàn (hàng mau-bang-hang-va-bai): E2 (luật khuôn mẫu bảng), E5 (xuất theo mẫu sau luật ẩn), E6 (bài theo mẫu
// hai kênh), cộng khuôn mẫu bài và bộ đọc khoan dung. Bảng ca viết trước; đếm bằng số dòng bảng.
import assert from "node:assert/strict";
import { test } from "node:test";
import { CAU_HINH_MAC_DINH, canMoi } from "../redaction";
import { baiFacebook, baiZalo } from "./bai";
import { COT_BANG_HANG, cotRa, type CotBangHang } from "./cot";
import { MAU_XUAT, xuatBang } from "./index";
import { COT_MAU_DUOC, docMauBai, docMauBang, kiemMauBai, kiemMauBang, TRAN_MAU, type MauBang } from "./mau-san";

const ID = (i: number) => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`;
const mau = (i: number, ten: string, cot: string[]): MauBang => ({ id: ID(i), ten, cot: cot as CotBangHang[] });
const COT_NOI_BO = (Object.keys(COT_BANG_HANG) as CotBangHang[]).filter((k) => COT_BANG_HANG[k].khoa === null);
const ba = ["unitNumber", "listPrice", "livingArea"];

test("mẫu bảng: cột chọn được đọc từ COT_BANG_HANG", () => {
  assert.deepEqual([...COT_MAU_DUOC], (Object.keys(COT_BANG_HANG) as CotBangHang[]).filter((k) => COT_BANG_HANG[k].khoa !== null));
  assert.ok(COT_NOI_BO.length >= 6, "đối chứng: có cột nội bộ để chặn");
});

test("mẫu bảng: bảng luật khuôn", () => {
  // [ca, giá trị, phần khoá sai trong lý do]
  const BANG: [string, unknown, string][] = [
    ["tên trống", [mau(1, "  ", ba)], "export.templates[0].ten"],
    ["tên 61 ký tự", [mau(1, "a".repeat(61), ba)], "export.templates[0].ten"],
    ["trùng tên", [mau(1, "[Tên] A", ba), mau(2, " [tên] a ", ba)], "export.templates[1].ten"],
    ["không cột", [mau(1, "A", [])], "export.templates[0].cot"],
    ["16 cột", [mau(1, "A", [...COT_MAU_DUOC, ...COT_MAU_DUOC].slice(0, 16))], "export.templates[0].cot"],
    ["cột trùng", [mau(1, "A", ["listPrice", "listPrice"])], "export.templates[0].cot"],
    ["cột lạ", [mau(1, "A", ["foo"])], "export.templates[0].cot"],
    ...COT_NOI_BO.map((k): [string, unknown, string] => [`cột nội bộ ${k}`, [mau(1, "A", ["listPrice", k])], "export.templates[0].cot"]),
    ["21 mẫu", Array.from({ length: 21 }, (_, i) => mau(i, `M${i}`, ba)), "export.templates"],
    ["id không phải uuid", [{ id: "x", ten: "A", cot: ba }], "export.templates[0].id"],
    ["không phải mảng", { a: 1 }, "export.templates"],
  ];
  let dem = 0;
  for (const [ca, v, khoa] of BANG) {
    const kq = kiemMauBang(v);
    assert.equal(kq.ok, false, `ca «${ca}» lẽ ra bị từ chối`);
    if (!kq.ok) {
      assert.match(kq.lyDo, /^export\.templates/, `ca «${ca}»: lý do phải mở đầu bằng khoá`);
      assert.ok(kq.lyDo.startsWith(khoa), `ca «${ca}»: lý do «${kq.lyDo}» không nêu ${khoa}`);
      if (ca.startsWith("cột nội bộ")) assert.ok(kq.lyDo.includes(ca.slice("cột nội bộ ".length)), `cột nội bộ lọt: ${ca}`);
    }
    dem++;
  }
  assert.equal(dem, BANG.length);
  // Đối chứng dương: các biên vừa đủ.
  for (const v of [
    [mau(1, "A", ["listPrice"])],
    [mau(1, "a".repeat(TRAN_MAU.ten), COT_MAU_DUOC.slice(0, TRAN_MAU.soCot))],
    Array.from({ length: TRAN_MAU.soMau }, (_, i) => mau(i, `M${i}`, ba)),
    [],
  ]) {
    assert.equal(kiemMauBang(v).ok, true, `đối chứng dương: ${JSON.stringify(v).slice(0, 60)}`);
  }
});

test("mẫu bài: bảng luật khuôn", () => {
  const BANG: [string, unknown, string][] = [
    ["501 ký tự", { zalo: { dau: "a".repeat(501), cuoi: "" } }, "share.post_templates.zalo.dau"],
    ["kênh lạ", { tiktok: { dau: "a", cuoi: "" } }, "share.post_templates.tiktok"],
    ["không phải đối tượng", [1], "share.post_templates"],
    ["thiếu cuoi", { facebook: { dau: "a" } }, "share.post_templates.facebook.cuoi"],
  ];
  let dem = 0;
  for (const [ca, v, khoa] of BANG) {
    const kq = kiemMauBai(v);
    assert.equal(kq.ok, false, `ca «${ca}» lẽ ra bị từ chối`);
    if (!kq.ok) assert.ok(kq.lyDo.startsWith(khoa), `ca «${ca}»: lý do «${kq.lyDo}» không nêu ${khoa}`);
    dem++;
  }
  assert.equal(dem, BANG.length);
  assert.equal(kiemMauBai({ zalo: { dau: "a".repeat(500), cuoi: "" } }).ok, true, "đối chứng: 500 ký tự đúng biên");
  assert.equal(kiemMauBai({}).ok, true, "đối chứng: không kênh nào");
});

test("đọc khoan dung: dòng hỏng bị lọc, lỗi nêu khoá", () => {
  const { ds, loi } = docMauBang([mau(1, "A", ["listPrice", "holderName"]), mau(2, "B", ["closePrice"]), { rac: 1 }]);
  assert.deepEqual(ds, [mau(1, "A", ["listPrice"])], "chỉ còn cột ra ngoài được, mẫu không còn cột bị bỏ");
  assert.ok(loi.length >= 3 && loi.every((l) => l.startsWith("export.templates")), `lỗi: ${loi.join(" | ")}`);
  assert.deepEqual(docMauBang(null), { ds: [], loi: [] }, "chưa đặt thì rỗng, không lỗi");
  const bai = docMauBai({ zalo: { dau: "D", cuoi: "C" }, tiktok: { dau: "x", cuoi: "" } });
  assert.deepEqual(bai.mau, { zalo: { dau: "D", cuoi: "C" } });
  assert.ok(bai.loi.some((l) => l.startsWith("share.post_templates.tiktok")));
});

test("xuất theo mẫu: cột theo mẫu sau luật ẩn", () => {
  let dem = 0;
  for (const nguoiNhan of ["nhom_moi_gioi", "khach_rieng"] as const) {
    const mong = cotRa(ba as CotBangHang[], nguoiNhan, CAU_HINH_MAC_DINH).ra;
    for (const m of MAU_XUAT) {
      const ban = xuatBang([canMoi()], { mau: m.ma, nguoiNhan, cot: ba as CotBangHang[], today: "2026-11-07", tenSan: "[Tên sàn]" });
      assert.deepEqual(ban.cot, mong.map((c) => c.nhan), `${nguoiNhan} · ${m.ma}: nhãn cột lệch mẫu`);
      assert.deepEqual(ban.khoa, mong.map((c) => c.khoa), `${nguoiNhan} · ${m.ma}: khoá cột lệch mẫu`);
      dem++;
    }
  }
  assert.equal(dem, 2 * MAU_XUAT.length);
  const kr = xuatBang([canMoi()], { mau: "xlsx", nguoiNhan: "khach_rieng", cot: ba as CotBangHang[], today: "2026-11-07", tenSan: "[Tên sàn]" });
  assert.equal(kr.khoa[0], "floorBand", "khách riêng: mã căn thành nấc tầng");
});

test("bài theo mẫu: hai kênh", () => {
  const tuy = { nguoiNhan: "nhom_moi_gioi" as const, cot: ba as CotBangHang[], today: "2026-11-07", tenSan: "[Tên sàn]" };
  const bang = xuatBang([canMoi(), canMoi()], { ...tuy, mau: "xlsx" });
  const goc = { zalo: baiZalo(bang), facebook: baiFacebook(bang, tuy.tenSan) };
  const khoiFb = goc.facebook.split("\n\n").slice(1).join("\n\n");
  // [ca, lời, bài Zalo mong đợi, bài Facebook mong đợi]
  const BANG: [string, { dau: string; cuoi: string } | undefined, string, string][] = [
    ["có D và C", { dau: "Chào nhóm", cuoi: "Liên hệ em" }, `Chào nhóm\n${goc.zalo}\nLiên hệ em`, `[Tên sàn]\n\nChào nhóm\n\n${khoiFb}\n\nLiên hệ em`],
    ["chỉ D", { dau: "Chào nhóm", cuoi: "" }, `Chào nhóm\n${goc.zalo}`, `[Tên sàn]\n\nChào nhóm\n\n${khoiFb}`],
    ["chỉ C", { dau: "", cuoi: "Liên hệ em" }, `${goc.zalo}\nLiên hệ em`, `${goc.facebook}\n\nLiên hệ em`],
    ["không mẫu", undefined, goc.zalo, goc.facebook],
    ["D có biểu tượng", { dau: "Chào 🎉 nhóm", cuoi: "" }, `Chào nhóm\n${goc.zalo}`, `[Tên sàn]\n\nChào nhóm\n\n${khoiFb}`],
    ["C có biểu tượng", { dau: "", cuoi: "Liên hệ 🏠 em" }, `${goc.zalo}\nLiên hệ em`, `${goc.facebook}\n\nLiên hệ em`],
    ["D chỉ khoảng trắng", { dau: "   ", cuoi: "" }, goc.zalo, goc.facebook],
  ];
  let dem = 0;
  for (const [ca, loi, zalo, facebook] of BANG) {
    const z = xuatBang([canMoi(), canMoi()], { ...tuy, mau: "post_zalo", mauBai: loi ? { zalo: loi } : {} });
    assert.equal(z.bai, zalo, `Zalo · ${ca}`);
    dem++;
    const f = xuatBang([canMoi(), canMoi()], { ...tuy, mau: "post_facebook", mauBai: loi ? { facebook: loi } : {} });
    assert.equal(f.bai, facebook, `Facebook · ${ca}`);
    dem++;
  }
  assert.equal(dem, BANG.length * 2);
  // Mẫu của kênh này không lọt sang kênh kia.
  const cheo = xuatBang([canMoi()], { ...tuy, mau: "post_zalo", mauBai: { facebook: { dau: "FB", cuoi: "" } } });
  assert.ok(!cheo.bai!.includes("FB"), "lời Facebook lọt vào bài Zalo");
});
