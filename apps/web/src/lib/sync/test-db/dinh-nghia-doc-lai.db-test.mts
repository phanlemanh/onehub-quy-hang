// Dòng định nghĩa đọc lại khi giá đồng bộ xong, trên API thật và Postgres (va-dinh-nghia-doc-lai E3, E5b, E7b): bộ đồng bộ thật, lớp đọc
// thật, mô hình của màn. Cần DATABASE_URL tới Postgres dãy. Tên `[Tên]`.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { docDau, khoaDoc, khoaGia, taoBoDocDau, vaoCua, chuDong, type LanDoc } from "../../../app/(app)/units/ho-so/doc-dau";
import { dongDinhNghia } from "../../../app/(app)/units/ho-so/dinh-nghia";
import { moHinhHoSo, type HoSoCo } from "../../../app/(app)/units/ho-so/mo-hinh";
import { taoBoDongBo, type BoDongBo } from "../dong-bo";
import { taoKhoBoNho } from "../kho";
import type { Goi } from "../types";
import { goiCua, H, nguoi, sanMoi, taoCan, type Nguoi } from "./ha-tang.mjs";

after(H.cleanup);

const G1 = 3_000_000_000;
const G2 = 3_200_000_000;
const G3 = 3_400_000_000;
let A: { companyId: string };
let X: Nguoi;
let QT: Nguoi;

before(async () => {
  A = await sanMoi("dn");
  X = await nguoi("dn-x", [{ companyId: A.companyId, vai: ["listing_agent"] }]);
  QT = await nguoi("dn-qt", [{ companyId: A.companyId, vai: ["company_admin"] }]);
});

async function datGia(id: string, listPrice: number, feeInclusion = "included") {
  const g = await X.goi("GET", `/api/v1/listings/${id}`);
  const r = await X.goi("POST", `/api/v1/listings/${id}/events`, { type: "price_changed", payload: { listPrice, feeInclusion }, expectedVersion: g.body.version });
  assert.equal(r.status, 200, JSON.stringify(r.body));
}
const datMoiGioi = async (pct: number) => assert.equal((await QT.goi("PATCH", "/api/v1/company/settings", { "fee.brokerage_pct": pct })).status, 200);
const moiGioiMayChu = async (id: string) => ((await X.goi("GET", `/api/v1/listings/${id}/fee-basis`)).body as { rates: { brokerageFee: number } }).rates.brokerageFee;

function moHinh(bd: BoDongBo, id: string): HoSoCo {
  const can = bd.danhSach().find((l) => l.id === id)!;
  const m = moHinhHoSo({ nguoi: X.userId, vai: ["listing_agent"], ds: bd.danhSach(), ngan: bd.ngan(), danhMuc: null, chon: { ma: "", toa: null, lan: id }, chuaMa: can, daKeo: {}, thieuCua: null, ngoaiTuyen: false, duong: () => "/x" });
  assert.equal(m.kind, "co");
  return m as HoSoCo;
}
function boCua() {
  const c = goiCua(X, () => A.companyId);
  const bd = taoBoDongBo({ goi: c.goi, kho: taoKhoBoNho(X.userId, new Map()), me: { userId: X.userId, roles: ["listing_agent"] }, companyId: A.companyId, nhip: false });
  return { c, bd };
}
const xa = () => new Promise((r) => setTimeout(r, 30));

test("dòng định nghĩa E3: giá gửi xong thì đọc được dấu mới trên API thật", async () => {
  await datMoiGioi(1);
  const id = await taoCan(X, false);
  await datGia(id, G1);
  const { c, bd } = boCua();
  await bd.khoiDong();
  assert.equal(await moiGioiMayChu(id), 100, "giá 1 mang môi giới 1%");
  await datMoiGioi(2);
  c.matMang(true);
  await bd.sua(id, "price_changed", { listPrice: G2, feeInclusion: "included" });
  await bd.thuNgay();
  const cho = vaoCua(moHinh(bd, id));
  assert.equal(cho.gia, G2);
  assert.equal(cho.giaChoGui, true);
  assert.equal(khoaDoc(cho, null), null, "lúc chờ gửi không đọc");
  assert.equal(await moiGioiMayChu(id), 100, "đối chứng: máy chủ chưa có dấu mới lúc giá còn chờ gửi");
  c.matMang(false);
  await bd.thuNgay();
  const sau = vaoCua(moHinh(bd, id));
  assert.equal(sau.giaChoGui, false);
  assert.equal(khoaDoc(sau, null), khoaGia(sau), "hết chờ thì đọc");
  const kq = await docDau(c.goi, id);
  assert.equal(kq.kq, "co");
  const dau = kq.kq === "co" ? kq.dau : null;
  assert.equal((dau as unknown as { rates: { brokerageFee: number } }).rates.brokerageFee, 200, "dấu mới mang môi giới 2%");
  const giu: LanDoc = { khoa: khoaGia(sau), kq: "co", dau };
  const chu = chuDong(sau, giu)!;
  assert.match(chu, /Môi giới 2%/);
  assert.equal(chu, dongDinhNghia(G2, dau));
  bd.dung();
  await datMoiGioi(1);
});

test("dòng định nghĩa E5b: lớp đọc trên API thật xếp đúng nhánh, đọc hỏng thử lại ở lần kéo mới", async () => {
  const id = await taoCan(X, false);
  await datGia(id, G1);
  const koPhi = await taoCan(X, false);
  await datGia(koPhi, G1, "excluded");
  const { c, bd } = boCua();
  const co = await docDau(c.goi, id);
  assert.equal(co.kq, "co");
  assert.ok(co.kq === "co" && co.dau, "200 có dấu");
  assert.deepEqual(await docDau(c.goi, koPhi), { kq: "co", dau: null }, "200 null là kết quả cuối");
  assert.deepEqual(await docDau(c.goi, randomUUID()), { kq: "co", dau: null }, "404 là kết quả cuối");
  const tra500: Goi = async () => ({ status: 500, body: null });
  assert.deepEqual(await docDau(tra500, id), { kq: "hong" }, "500 là hỏng");
  c.matMang(true);
  assert.deepEqual(await docDau(c.goi, id), { kq: "hong" }, "mất mạng là hỏng");
  c.matMang(false);

  await bd.khoiDong();
  let soLoi = 0;
  c.matMang(true);
  const bo = taoBoDocDau((x) => (soLoi++, docDau(c.goi, x)));
  const vao = vaoCua(moHinh(bd, id));
  bo.vao(vao);
  await xa();
  assert.equal(soLoi, 1);
  assert.equal(bo.chu(vao), null, "đọc hỏng thì không có dòng");
  bo.vao(vao);
  await xa();
  assert.equal(soLoi, 1, "chưa có lần kéo mới thì không đọc");
  c.matMang(false);
  await bd.thuNgay();
  const moi = vaoCua(moHinh(bd, id));
  assert.notEqual(moi.keoLuc, vao.keoLuc, "có lần kéo mới");
  bo.vao(moi);
  await xa();
  assert.equal(soLoi, 2, "lần kéo mới thì đúng một lời đọc");
  assert.match(bo.chu(moi)!, /Tính theo định nghĩa ngày/);
  bd.dung();
});

test("dòng định nghĩa E7b: giá bị máy chủ từ chối, không bước nào đọc theo giá ấy", async () => {
  const id = await taoCan(X, false);
  await datGia(id, G1);
  const { bd } = boCua();
  await bd.khoiDong();
  await datGia(id, G3); // người khác đổi trước, máy chưa kéo
  const buoc: { gia: number | null; cho: boolean; khoa: string | null }[] = [];
  bd.dangKy(() => {
    const v = vaoCua(moHinh(bd, id));
    buoc.push({ gia: v.gia, cho: v.giaChoGui, khoa: khoaDoc(v, null) });
  });
  await bd.sua(id, "price_changed", { listPrice: G2, feeInclusion: "included" });
  await bd.thuNgay();
  assert.ok(buoc.some((b) => b.gia === G2 && b.cho), "có bước giá chờ gửi");
  const sai = buoc.filter((b) => b.gia === G2 && !b.cho);
  assert.deepEqual(sai, [], "không bước nào hết chờ mà còn giá bị từ chối");
  assert.ok(buoc.filter((b) => b.gia === G2).every((b) => b.khoa === null), "không đọc theo giá bị từ chối");
  assert.ok(bd.canXem().some((r) => r.listingId === id), "căn về Cần xem");
  assert.equal(bd.ngan().queue.length, 0);
  const cuoi = vaoCua(moHinh(bd, id));
  assert.equal(cuoi.gia, G3, "giá trên máy về giá máy chủ");
  assert.equal(khoaDoc(cuoi, null), khoaGia(cuoi));
  bd.dung();
});
