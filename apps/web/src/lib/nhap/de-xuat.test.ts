// «Xử lý bằng AI» ở đường ống màn Nhập Excel (hàng 68: E7, E8b, E10). Đường đề xuất là hàm giả trả đề xuất dựng từ đáp án
// của file lạ — bài này đo luồng chờ duyệt, dự phòng và nhập lại cùng mẫu, không đo độ đúng của mô hình (đó là E1).
import assert from "node:assert/strict";
import { test } from "node:test";
import { isStandardField, khoaMau, taoMau, type GoiDeXuat, type ImportContext } from "@quy-hang/core/import";
import { sinhBoLa } from "../../../../../_acceptance/nhap-tac-tu-ke-hoach/thu/bo-la";
import { danhMucMau, HOM_NAY } from "../../../../../packages/core/test/import/sinh";
import { chayOng, doiDich } from "./duong-ong";
import { canHoi, cauTatDinh, coTheTiepGhepAi, dongY, dongYHet, hoiDeXuat, khiDoiDich, laKetQuaCu, sangXemTruoc, type HoiDeXuat, type KetQuaGoiDeXuat, type TrangThaiAi } from "./de-xuat";

const CTX: ImportContext = { today: HOM_NAY, catalog: danhMucMau() };
const AI_BAT: TrangThaiAi = { bat: true, tamNgung: false, sanSang: true, conTran: true, tranThangUsd: 10, daDungUsd: null, laQuanTri: false };
const tep = (ten: string) => sinhBoLa().find((t) => t.ten === ten)!;

/** Đường đề xuất giả: đề xuất đáp án cho `soCot` cột chưa ghép đầu tiên; đếm lần gọi. */
function hoiGia(ten: string, soCot = Infinity) {
  const dem = { n: 0 };
  const da = tep(ten).dapAn.targets;
  const hoi: HoiDeXuat = async (goi: GoiDeXuat) => {
    dem.n++;
    const chua = goi.cot.filter((c) => !c.dich).slice(0, soCot);
    const deXuat = chua.filter((c) => isStandardField(da[c.cot]) || da[c.cot] === "keep_as_note").map((c) => ({ cot: c.cot, target: da[c.cot]!, lyDo: `Tiêu đề «${c.tieuDe}»` }));
    return { cheDo: "ai", deXuat, loi: [] } satisfies KetQuaGoiDeXuat;
  };
  return { hoi, dem };
}

test("đề xuất chờ duyệt khoá Tiếp", async () => {
  const ong0 = chayOng(tep("la-a-dong-nghia").grid!, CTX);
  assert.ok(canHoi(ong0, AI_BAT));
  const { hoi } = hoiGia("la-a-dong-nghia", 3);
  const { ong, tt } = await hoiDeXuat(ong0, hoi, 1);
  assert.equal(tt.choDuyet.length, 3, "ba cột chờ duyệt");
  const truoc = ong.plan.columns.map((c) => c.target);
  let ghi = 0;
  const xemThu = async () => ++ghi;
  assert.deepEqual(coTheTiepGhepAi(ong, tt), { ok: false, thongDiep: "Còn 3 cột máy đề xuất chưa duyệt" });
  assert.equal(await sangXemTruoc(ong, tt, xemThu), null);
  const t1 = dongY(tt, tt.choDuyet[0]!);
  assert.equal(t1.choDuyet.length, 2);
  const cot = t1.choDuyet[0]!;
  const ong2 = doiDich(ong, cot, "privateRemarks", CTX);
  const t2 = khiDoiDich(t1, cot);
  assert.equal(t2.choDuyet.length, 1);
  assert.equal(ong2.plan.columns[cot]!.reason, "người chọn ở bước ghép cột");
  assert.equal(await sangXemTruoc(ong2, t2, xemThu), null);
  assert.equal(ghi, 0, "ghi khi còn đề xuất chờ duyệt");
  const t3 = dongYHet(t2);
  assert.deepEqual(t3.choDuyet, []);
  assert.equal(coTheTiepGhepAi(ong2, t3).ok, true);
  assert.deepEqual(ong.plan.columns.map((c) => c.target), truoc, "đồng ý không đổi đích");
  assert.equal(await sangXemTruoc(ong2, t3, xemThu), 1);
});

test("màn khi AI không dùng được", async () => {
  const ong0 = chayOng(tep("la-a-dong-nghia").grid!, CTX);
  const LY_DO = ["Sàn chưa bật Xử lý bằng AI", "Xử lý bằng AI đang tạm ngừng", "AI chưa sẵn sàng trên máy chủ", "Hết trần AI tháng này", "AI đang lỗi, thử lại sau", "AI trả lời quá lâu"];
  for (const lyDo of LY_DO) {
    const { ong, tt } = await hoiDeXuat(ong0, async () => ({ cheDo: "tat-dinh", lyDo }), 1);
    assert.deepEqual(ong.plan, ong0.plan, `${lyDo}: kế hoạch nền giữ nguyên`);
    assert.equal(tt.baoTatDinh, `Chưa dùng được AI: ${lyDo} — ghép tay các cột còn lại`);
    assert.deepEqual(tt.choDuyet, []);
  }
  const mang = await hoiDeXuat(ong0, async () => ({ loi: "x" }), 1);
  assert.equal(mang.tt.baoTatDinh, cauTatDinh("không gửi được tới máy chủ"));
  for (const ai of [null, { ...AI_BAT, bat: false }, { ...AI_BAT, sanSang: false }, { ...AI_BAT, conTran: false }]) assert.equal(canHoi(ong0, ai), false, JSON.stringify(ai));
});

test("nhập lại cùng mẫu không gọi AI", async () => {
  const t = tep("la-b-viet-tat");
  const { hoi, dem } = hoiGia("la-b-viet-tat");
  const lan1 = await hoiDeXuat(chayOng(t.grid!, CTX), hoi, 1);
  assert.equal(dem.n, 1);
  const mau = taoMau(lan1.ong.plan, lan1.ong.table.headers, { importId: "imp-1", at: "2026-11-05T00:00:00Z" });
  const lan2 = chayOng(t.grid!, CTX, mau);
  // Cột có khoá mẫu ghép theo mẫu; cột «#» (số thứ tự, không có khoá mẫu) vẫn được máy bỏ có lý do — không cột nào chưa ghép.
  lan2.plan.columns.forEach((c, i) => {
    if (khoaMau(lan2.table.headers[i]!)) assert.ok(c.reason.startsWith("theo mẫu"), `cột «${c.column}» không theo mẫu: ${c.target} ${c.confidence} ${c.reason}`);
    assert.notEqual(c.confidence, "low", `cột «${c.column}» chưa ghép`);
  });
  assert.equal(canHoi(lan2, AI_BAT), false, "còn cột chưa ghép");
  await hoiDeXuat(lan2, hoi, 2);
  assert.equal(dem.n, 1, "nhập lại cùng mẫu mà vẫn gọi AI");
  const s = JSON.stringify(mau);
  const trung = t.dapAn.camLo.filter((x) => s.includes(x));
  assert.deepEqual(trung, [], `mẫu chứa chuỗi cấm ${JSON.stringify(trung)}`);
});

test("đổi tệp giữa chừng bỏ kết quả cũ", async () => {
  const ong0 = chayOng(tep("la-a-tieng-anh").grid!, CTX);
  const { tt } = await hoiDeXuat(ong0, hoiGia("la-a-tieng-anh").hoi, 1);
  assert.equal(laKetQuaCu(2, tt), true, "kết quả của tệp cũ (phiên 1) được nhận ở phiên 2");
  assert.equal(laKetQuaCu(1, tt), false);
});
