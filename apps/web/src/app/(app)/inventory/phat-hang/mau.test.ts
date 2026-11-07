// Hộp Xuất theo mẫu của sàn (hàng mau-bang-hang-va-bai): E5b (ô «Cột theo», xem trước, đọc lỗi), E5c (năm kiểu xuất),
// E8b (mẫu đọc một lần lúc mở hộp). Dòng bảng hàng dựng từ căn mồi qua đúng đường của trang (`banXuatTuDong`).
import assert from "node:assert/strict";
import { test } from "node:test";
import { baiFacebook, baiZalo, bocBai, ghiXlsx, MAU_XUAT, type CotBangHang, type MauBang, type MauXuat } from "@quy-hang/core/export";
import { canMoi } from "@quy-hang/core/redaction";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { docTep } from "@/lib/nhap/doc-tep";
import { banXuatTuDong } from "./chuyen-dong";
import { CotTheo, tuyChonXuat, type MoXuat } from "./hop-thoai";
import { readFileSync } from "node:fs";
import { docMauXuat, moHopVoiMau } from "../mau-xuat-san";
import { CAU_LOI_MAU, cotCuaMau, GOC_NHIN, luaChonCotTheo, type MauXuatSan } from "./mau";
import { dongMoi, MOI_COT, TODAY } from "./moi-xuat.test-helpers";
import { chuDeVe } from "./ve-anh";

const ID = (i: number) => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`;
const BA: CotBangHang[] = ["unitNumber", "listPrice", "livingArea"];
const MAU: MauBang[] = [
  { id: ID(1), ten: "[Tên] gửi đội", cot: BA },
  { id: ID(2), ten: "[Tên] gửi khách", cot: ["livingArea"] },
];
const LOI = { dau: "Chào nhóm", cuoi: "Gọi em" };
const SAN: MauXuatSan = { mauBang: MAU, mauBai: { zalo: LOI, facebook: LOI } };
const mo = (mauSan?: MauXuatSan): MoXuat => ({ dong: [dongMoi(canMoi())], cot: MOI_COT, today: TODAY, tenSan: "[Tên sàn]", tenNguoiGui: "", mauSan });
const ban = (m: MoXuat, mauSan: MauXuatSan, cotTheo: string | null, mau: MauXuat, nguoiNhan: "nhom_moi_gioi" | "khach_rieng" = "nhom_moi_gioi") =>
  banXuatTuDong(m.dong, { ...tuyChonXuat(m, mauSan, cotTheo), mau, nguoiNhan, tuVung: m.tuVung });

test("Cột theo: góc nhìn rồi các mẫu theo thứ tự của sàn", () => {
  assert.deepEqual(luaChonCotTheo(SAN).map((l) => l.nhan), [GOC_NHIN, "[Tên] gửi đội", "[Tên] gửi khách"]);
  const html = renderToStaticMarkup(h(CotTheo, { mauSan: SAN, chon: null, onChon: () => {} }));
  assert.ok(html.includes(GOC_NHIN) && !html.includes(CAU_LOI_MAU));
});

test("Cột theo: xem trước theo mẫu sau luật ẩn", () => {
  const m = mo(SAN);
  const theoMau = ban(m, SAN, ID(1), "xlsx");
  assert.deepEqual(theoMau.cot, ["Mã căn", "Giá", "Diện tích"], "xem trước không theo mẫu");
  const khach = ban(m, SAN, ID(1), "xlsx", "khach_rieng");
  assert.equal(khach.khoa[0], "floorBand", "khách riêng: mã căn thành nấc tầng");
  // Đối chứng: góc nhìn đang mở giữ cột góc nhìn.
  assert.ok(ban(m, SAN, null, "xlsx").cot.length > 3, "góc nhìn đang mở phải giữ cột của góc nhìn");
  assert.equal(cotCuaMau(SAN, ID(99)), undefined, "mẫu không còn → theo góc nhìn");
});

test("Cột theo: đọc mẫu lỗi chỉ còn góc nhìn, kèm câu báo", async () => {
  const loi = await docMauXuat(async () => ({ status: 500, body: null }));
  assert.deepEqual(loi, { mauBang: null, mauBai: {} });
  assert.deepEqual(luaChonCotTheo(loi).map((l) => l.nhan), [GOC_NHIN]);
  const html = renderToStaticMarkup(h(CotTheo, { mauSan: loi, chon: null, onChon: () => {} }));
  assert.ok(html.includes(CAU_LOI_MAU), "thiếu câu báo đọc mẫu lỗi");
  const doc = await docMauXuat(async (d) => ({ status: 200, body: { templates: d.endsWith("export") ? MAU : { zalo: LOI } } }));
  assert.deepEqual(doc, { mauBang: MAU, mauBai: { zalo: LOI } });
});

test("năm kiểu xuất theo mẫu", async () => {
  const m = mo(SAN);
  let dem = 0;
  for (const kieu of MAU_XUAT.map((x) => x.ma)) {
    const b = ban(m, SAN, ID(1), kieu);
    if (kieu === "xlsx") {
      const doc = await docTep("bang.xlsx", ghiXlsx(b));
      assert.ok(!("loi" in doc), "không đọc lại được tệp Excel");
      assert.deepEqual(doc.grid[0]!.map((o) => String(o)), ["Mã căn", "Giá", "Diện tích"], "Excel giữ cột góc nhìn");
    } else if (kieu === "pdf" || kieu === "png") {
      assert.deepEqual(chuDeVe(b).slice(0, 3), ["Mã căn", "Giá", "Diện tích"], `${kieu}: tiêu đề cột lệch mẫu`);
    } else {
      const mong = kieu === "post_zalo" ? bocBai(baiZalo(b), LOI) : baiFacebook(b, "[Tên sàn]", LOI);
      assert.equal(b.bai, mong, `${kieu}: bài không mang lời của mẫu`);
      assert.ok(b.bai!.includes(LOI.dau) && b.bai!.includes(LOI.cuoi));
    }
    dem++;
  }
  assert.equal(dem, 5);
});

test("hộp đang mở giữ bộ mẫu lúc mở", async () => {
  // Máy chủ giả: đếm lời gọi, trả bộ mẫu hiện hành — đổi được giữa chừng.
  let bo: MauBang[] = MAU;
  const goi: string[] = [];
  const mayChu = async (duong: string) => {
    goi.push(duong);
    return { status: 200, body: { templates: duong.endsWith("export") ? bo : {} } };
  };
  const coDinh = { dong: [dongMoi(canMoi())], cot: MOI_COT, today: TODAY, tenSan: "[Tên sàn]", tenNguoiGui: "" };
  const luc = await moHopVoiMau(coDinh, mayChu);
  assert.deepEqual(goi, ["/api/v1/company/templates/export", "/api/v1/company/templates/posts"], "mở hộp phải đọc mẫu đúng một lần");
  // Quản trị đổi mẫu khi hộp đang mở: bản hộp đang giữ không đổi theo.
  bo = [{ ...MAU[0]!, cot: ["livingArea"] }];
  assert.deepEqual(ban(luc, luc.mauSan, ID(1), "xlsx").cot, ["Mã căn", "Giá", "Diện tích"], "hộp đang mở đổi theo mẫu mới");
  assert.equal(goi.length, 2, "hộp đang mở lại gọi đọc mẫu");
  const moLai = await moHopVoiMau(coDinh, mayChu);
  assert.deepEqual(ban(moLai, moLai.mauSan, ID(1), "xlsx").cot, ["Diện tích"], "mở lại phải theo bộ mới");
  // Hộp không tự đọc mẫu: mã nguồn hộp không gọi bộ đọc hay đường mẫu.
  const ma = readFileSync(new URL("./hop-thoai.tsx", import.meta.url), "utf8");
  assert.ok(!/docMauXuat|moHopVoiMau|\/templates\//.test(ma), "hộp Xuất tự đọc mẫu thay vì nhận bản lúc mở");
});
