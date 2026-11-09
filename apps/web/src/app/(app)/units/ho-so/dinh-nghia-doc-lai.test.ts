// Dòng định nghĩa đọc lại khi giá đồng bộ xong (va-dinh-nghia-doc-lai, Ngoài-3 hàng 49): E1, E2, E5, E6, E7, E8, E11. Trạng thái dựng
// bằng bộ đồng bộ thật trên máy chủ giả, qua chính `moHinhHoSo` của màn — không lắp tay trường giaChoGui.
import assert from "node:assert/strict";
import { test } from "node:test";
import { EVENT_TYPES, type EventType } from "@quy-hang/core/listing";
import type { DauPhi } from "@quy-hang/core/pricing";
import type { BoDongBo } from "@/lib/sync/dong-bo";
import { taoBoDongBo } from "@/lib/sync/dong-bo";
import { taoKhoBoNho } from "@/lib/sync/kho";
import { mayChuGia, xa } from "@/lib/sync/may-chu-gia.test-helpers";
import type { Goi, Ngan, PendingOp } from "@/lib/sync/types";
import { chuDong, docDau, khoaDoc, khoaGia, taoBoDocDau, vaoCua, type BoDocDau, type KetQuaDoc, type LanDoc, type VaoDong } from "./doc-dau";
import { dongDinhNghia } from "./dinh-nghia";
import { moHinhHoSo, type HoSoCo } from "./mo-hinh";

const ME = { userId: "u-x", roles: ["listing_agent"] };
const BA_KHOAN = ["personalIncomeTax", "registrationFee", "brokerageFee"];
const dau = (moiGioi: number): DauPhi => ({ includedItems: BA_KHOAN, rates: { personalIncomeTax: 200, registrationFee: 50, brokerageFee: moiGioi }, computedAt: "2026-11-06T03:00:00.000Z" }) as unknown as DauPhi;
const CU = dau(100);
const MOI = dau(200);
const G1 = 3_000_000_000;
const G2 = 3_200_000_000;
const G3 = 3_400_000_000;
const giaCua = (listPrice: number, feeInclusion = "included") => ({ listPrice, feeInclusion });
const v = (o: Partial<VaoDong> = {}): VaoDong => ({ listingId: "x", gia: G1, phi: "included", giaChoGui: false, keoLuc: "p1", ...o });
const co = (khoa: string, d: DauPhi | null = CU): LanDoc => ({ khoa, kq: "co", dau: d });
const hong = (khoa: string, keoLuc: string | null): LanDoc => ({ khoa, kq: "hong", keoLuc });

/** Lời đọc điều khiển được: lời nào treo tới khi bài kiểm trả. */
function loiDoc() {
  const treo: { id: string; tra: (k: KetQuaDoc) => void }[] = [];
  return { treo, doc: (id: string) => new Promise<KetQuaDoc>((tra) => treo.push({ id, tra })) };
}

function moHinh(bd: BoDongBo, id: string, ngan: Ngan = bd.ngan()): HoSoCo {
  const can = bd.danhSach().find((l) => l.id === id)!;
  const m = moHinhHoSo({ nguoi: ME.userId, vai: ME.roles, ds: bd.danhSach(), ngan, danhMuc: null, chon: { ma: "", toa: null, lan: id }, chuaMa: can, daKeo: {}, thieuCua: null, ngoaiTuyen: false, duong: () => "/x" });
  assert.equal(m.kind, "co");
  return m as HoSoCo;
}

/** Căn «x» bao phí giá G1, bộ đồng bộ đã kéo về. */
async function dung() {
  let ma = 0;
  const mc = mayChuGia({ userId: ME.userId });
  mc.tao("x", "[Toà A]");
  mc.tao("y", "[Toà A]");
  mc.nguoiKhacGhi("x", "price_changed", giaCua(G1));
  const bd = taoBoDongBo({ goi: mc.goi, kho: taoKhoBoNho(ME.userId, new Map()), me: ME, companyId: "s", nhip: false, taoMa: () => `op-${++ma}` });
  await bd.khoiDong();
  return { mc, bd };
}

// ——— AC-1: giá chờ gửi ———

/** Ma trận viết trước của cổng chờ gửi: mọi lần đọc đang giữ đều không làm máy đọc hay hiện dòng. */
function maTranChoGui(kd: typeof khoaDoc, cd: typeof chuDong) {
  const vao = v({ giaChoGui: true });
  const k = khoaGia(vao);
  for (const [ten, giu] of [["chưa có", null], ["có dấu của đúng giá ấy", co(k)], ["kết quả null", co(k, null)], ["hỏng", hong(k, "p0")]] as const) {
    assert.equal(kd(vao, giu), null, `ca «giá chờ gửi» · ${ten}: không được đọc`);
    assert.equal(cd(vao, giu), null, `ca «giá chờ gửi» · ${ten}: không được có dòng`);
  }
}

test("va-dinh-nghia E1: giá chờ gửi thì không đọc, không dòng", async () => {
  maTranChoGui(khoaDoc, chuDong);
  // Đối chứng đỏ: bản giả bỏ cổng chờ gửi.
  assert.throws(() => maTranChoGui((x, g) => khoaDoc({ ...x, giaChoGui: false }, g), chuDong), /ca «giá chờ gửi» · chưa có: không được đọc/);
  assert.throws(() => maTranChoGui(khoaDoc, (x, g) => chuDong({ ...x, giaChoGui: false }, g)), /ca «giá chờ gửi» · có dấu của đúng giá ấy: không được có dòng/);

  const { mc, bd } = await dung();
  mc.datMatMang(true);
  await bd.sua("x", "price_changed", giaCua(G2));
  await bd.thuNgay();
  const m = moHinh(bd, "x");
  assert.equal(m.giaChoGui, true, "ngăn thật có thao tác đổi giá chờ gửi");
  assert.equal(m.can.listPrice, G2, "giá mới vẫn hiện");
  assert.equal(khoaDoc(vaoCua(m), null), null);
  // Đối chứng dương: hết chờ thì đọc được.
  mc.datMatMang(false);
  await bd.thuNgay();
  const sau = vaoCua(moHinh(bd, "x"));
  assert.equal(sau.giaChoGui, false);
  assert.equal(khoaDoc(sau, null), khoaGia(sau));
});

// ——— AC-2: giá lên máy chủ ———

test("va-dinh-nghia E2: có mạng lại thì đúng một lần đọc, dòng mang dấu mới", async () => {
  const { mc, bd } = await dung();
  const l = loiDoc();
  const bo = taoBoDocDau(l.doc);
  // Như màn: mỗi lần bộ đồng bộ báo đổi là một lần dựng lại.
  const ve = () => bo.vao(vaoCua(moHinh(bd, "x")));
  bd.dangKy(ve);
  ve();
  assert.equal(l.treo.length, 1, "lần đọc đầu");
  l.treo[0]!.tra({ kq: "co", dau: CU });
  await xa();
  assert.match(bo.chu(vaoCua(moHinh(bd, "x")))!, /Môi giới 1%/);

  mc.datMatMang(true);
  await bd.sua("x", "price_changed", giaCua(G2));
  await bd.thuNgay();
  assert.equal(l.treo.length, 1, "lúc chờ gửi không đọc thêm");
  assert.equal(bo.chu(vaoCua(moHinh(bd, "x"))), null, "lúc chờ gửi không có dòng");

  mc.datMatMang(false);
  await bd.thuNgay();
  assert.equal(l.treo.length, 2, "hết chờ thì đúng một lần đọc, kể cả khi lần kéo xong báo đổi thêm");
  l.treo[1]!.tra({ kq: "co", dau: MOI });
  await xa();
  const chu = bo.chu(vaoCua(moHinh(bd, "x")))!;
  assert.match(chu, /Môi giới 2%/);
  assert.equal(chu, dongDinhNghia(G2, MOI));
});

type MoBo = (doc: (id: string) => Promise<KetQuaDoc>) => BoDocDau;

/** Đổi đi rồi đổi về đúng giá cũ với dấu giữ từ trước: phải đọc lại. */
async function caDoiDiDoiVe(moBo: MoBo) {
  const l = loiDoc();
  const bo = moBo(l.doc);
  bo.vao(v());
  l.treo[0]!.tra({ kq: "co", dau: CU });
  await xa();
  bo.vao(v({ gia: G2, giaChoGui: true }));
  bo.vao(v({ gia: G1, giaChoGui: true }));
  bo.vao(v());
  assert.equal(l.treo.length, 2, "ca «đổi đi đổi về»: phải đọc lại");
  l.treo[1]!.tra({ kq: "co", dau: MOI });
  await xa();
  assert.match(bo.chu(v())!, /Môi giới 2%/, "ca «đổi đi đổi về»: dòng mang dấu mới");
}

test("va-dinh-nghia E2: đổi đi rồi đổi về vẫn đọc lại", async () => {
  await caDoiDiDoiVe(taoBoDocDau);
  // Đối chứng đỏ: bản giả giữ dấu qua lúc chờ gửi.
  const giaGiuDau: MoBo = (doc) => {
    const bo = taoBoDocDau(doc);
    return { ...bo, vao: (x) => (x.giaChoGui ? undefined : bo.vao(x)) };
  };
  await assert.rejects(caDoiDiDoiVe(giaGiuDau), /ca «đổi đi đổi về»: phải đọc lại/);
});

test("va-dinh-nghia E2: phản hồi về muộn bị bỏ", async () => {
  const l = loiDoc();
  const bo = taoBoDocDau(l.doc);
  bo.vao(v());
  bo.vao(v({ giaChoGui: true }));
  bo.vao(v());
  assert.equal(l.treo.length, 2, "lần đọc mới sau khi hết chờ");
  l.treo[1]!.tra({ kq: "co", dau: MOI });
  await xa();
  l.treo[0]!.tra({ kq: "co", dau: CU });
  await xa();
  assert.match(bo.chu(v())!, /Môi giới 2%/, "phản hồi cũ không đè dấu mới");
});

test("va-dinh-nghia E2: lần kéo định kỳ không đọc chồng lúc lần đọc đầu đang bay; gọi hai lần chỉ một lời đọc", async () => {
  const l = loiDoc();
  const bo = taoBoDocDau(l.doc);
  bo.vao(v());
  bo.vao(v());
  bo.vao(v({ keoLuc: "p2" }));
  assert.equal(l.treo.length, 1);
});

// ——— AC-3: đọc hỏng ———

function maTranHong(kd: typeof khoaDoc) {
  const k = khoaGia(v());
  assert.equal(kd(v(), hong(k, "p1")), null, "ca «hỏng, chưa có lần kéo mới»");
  const moi = kd(v({ keoLuc: "p2" }), hong(k, "p1"));
  assert.ok(moi && moi !== k, "ca «hỏng, có lần kéo mới»: phải có khoá mới");
  assert.equal(kd(v({ keoLuc: "p2" }), hong(k, "p2")), null, "ca «hỏng lần nữa ở lần kéo mới»");
  assert.equal(kd(v({ keoLuc: "p2" }), co(k, null)), null, "ca «kết quả null là cuối»");
  assert.equal(kd(v({ keoLuc: "p2" }), co(k)), null, "ca «có dấu là cuối»");
}

test("va-dinh-nghia E5: đọc hỏng thử lại ở lần kéo mới, không đọc dồn", async () => {
  maTranHong(khoaDoc);
  // Đối chứng đỏ: bản giả thử lại không cần lần kéo mới.
  const giaThuLai: typeof khoaDoc = (x, g) => (g?.kq === "hong" ? `${g.khoa}@luon` : khoaDoc(x, g));
  assert.throws(() => maTranHong(giaThuLai), /ca «hỏng, chưa có lần kéo mới»/);

  const l = loiDoc();
  const bo = taoBoDocDau(l.doc);
  bo.vao(v());
  l.treo[0]!.tra({ kq: "hong" });
  await xa();
  assert.equal(bo.chu(v()), null, "đọc hỏng thì không có dòng");
  bo.vao(v());
  assert.equal(l.treo.length, 1, "chưa có lần kéo mới thì không đọc");
  bo.vao(v({ keoLuc: "p2" }));
  assert.equal(l.treo.length, 2, "lần kéo mới thì đúng một lời đọc");
  l.treo[1]!.tra({ kq: "co", dau: CU });
  await xa();
  assert.match(bo.chu(v({ keoLuc: "p2" }))!, /Môi giới 1%/);
});

test("va-dinh-nghia E5: phân loại trả lời của lớp đọc", async () => {
  const goi = (status: number, body: unknown): Goi => async () => ({ status, body });
  assert.deepEqual(await docDau(goi(200, CU), "x"), { kq: "co", dau: CU });
  assert.deepEqual(await docDau(goi(200, null), "x"), { kq: "co", dau: null });
  assert.deepEqual(await docDau(goi(404, { error: "not-found" }), "x"), { kq: "co", dau: null });
  assert.deepEqual(await docDau(goi(500, null), "x"), { kq: "hong" });
  assert.deepEqual(await docDau(goi(503, null), "x"), { kq: "hong" });
  assert.deepEqual(
    await docDau(async () => {
      throw new Error("mất mạng");
    }, "x"),
    { kq: "hong" },
  );
});

// ——— AC-4: thao tác khác giá ———

/** Viết trước theo từng loại; thêm loại sự kiện mới là đỏ kiểu và đỏ bài tới khi được xếp. */
const CHAN_DOC: Record<EventType, boolean> = { created: false, details_changed: false, price_changed: true, status_changed: false, owner_confirmed: false, unit_number_assigned: false, voided: false, custom_changed: false };

test("va-dinh-nghia E6: chỉ đổi giá của chính căn mới chặn đọc", async () => {
  assert.deepEqual(Object.keys(CHAN_DOC).sort(), [...EVENT_TYPES].sort(), "bảng phải đủ mọi loại sự kiện của lõi");
  const { bd } = await dung();
  const op = (listingId: string, type: EventType) => ({ opId: "o", listingId, type, payload: {}, expectedVersion: 1, clientSeq: 1, createdAt: "2026-11-09T00:00:00.000Z" }) satisfies PendingOp;
  for (const type of EVENT_TYPES) {
    assert.equal(moHinh(bd, "x", { ...bd.ngan(), queue: [op("x", type)] }).giaChoGui, CHAN_DOC[type], `loại ${type} của chính căn`);
    assert.equal(moHinh(bd, "x", { ...bd.ngan(), queue: [op("y", type)] }).giaChoGui, false, `loại ${type} của căn khác`);
  }

  const l = loiDoc();
  const bo = taoBoDocDau(l.doc);
  const ve = () => bo.vao(vaoCua(moHinh(bd, "x")));
  ve();
  l.treo[0]!.tra({ kq: "co", dau: CU });
  await xa();
  const truoc = bo.chu(vaoCua(moHinh(bd, "x")));
  assert.ok(truoc);
  await bd.sua("x", "details_changed", { furnished: "full" });
  ve();
  assert.equal(l.treo.length, 1, "sửa khác giá không đọc lại");
  assert.equal(bo.chu(vaoCua(moHinh(bd, "x"))), truoc, "dòng giữ nguyên");
});

// ——— AC-5: giá bị từ chối ———

test("va-dinh-nghia E7: giá bị từ chối thì dòng theo giá máy chủ", async () => {
  const { mc, bd } = await dung();
  mc.nguoiKhacGhi("x", "price_changed", giaCua(G3));
  await bd.sua("x", "price_changed", giaCua(G2));
  await bd.thuNgay();
  assert.ok(bd.canXem().some((r) => r.listingId === "x"), "căn về Cần xem");
  assert.equal(bd.ngan().queue.length, 0);
  const vao = vaoCua(moHinh(bd, "x"));
  assert.equal(vao.gia, G3, "giá trên máy về giá máy chủ");
  assert.equal(vao.giaChoGui, false);
  assert.equal(khoaDoc(vao, null), khoaGia(vao));
});

// ——— AC-6, AC-7 ———

test("va-dinh-nghia E8: không bao phí, chưa có giá thì không đọc, không dòng", () => {
  for (const [ten, vao] of [["không bao phí", v({ phi: "excluded" })], ["chưa có điều kiện phí", v({ phi: null })], ["chưa có giá", v({ gia: null })]] as const) {
    assert.equal(khoaDoc(vao, null), null, ten);
    assert.equal(chuDong(vao, co(khoaGia(vao))), null, ten);
  }
  assert.equal(khoaDoc(v(), null), khoaGia(v()), "đối chứng dương: bao phí có giá thì đọc");
});

test("va-dinh-nghia E11: chữ dòng đúng chữ của dongDinhNghia", () => {
  assert.equal(chuDong(v(), co(khoaGia(v()))), dongDinhNghia(G1, CU));
  assert.equal(chuDong(v(), co(khoaGia(v()), null)), null, "kết quả null thì không có dòng");
  assert.equal(chuDong(v({ gia: G2 }), co(khoaGia(v()))), null, "lần đọc của giá khác thì không có dòng");
});
