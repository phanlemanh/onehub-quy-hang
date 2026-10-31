// Đồng bộ tự lành (hàng 61): lỗi tạm thời của máy chủ không đẩy thao tác sang Cần xem, chỉ báo nói đúng nguyên nhân, kho
// lỗi không làm chết bộ đồng bộ, sửa tiếp căn đang Cần xem không kẹt và không đảo thứ tự. Máy chủ giả, kho bộ nhớ.
import assert from "node:assert/strict";
import { test } from "node:test";
import { checkTransition, foldListing } from "@quy-hang/core/listing";
import { taoBoDongBo } from "./dong-bo";
import { taoKhoBoNho, type LocalStore } from "./kho";
import { suyChiBao } from "./trang-thai";
import { nganTrong, type Ngan, type PendingOp } from "./types";
import { dongHoGia, mayChuGia, xa } from "./may-chu-gia.test-helpers";

const ME = { userId: "u-x", roles: ["listing_agent"] };
let ma = 0;
const taoMa = () => `tl-${++ma}`;
const gia = (ty: number) => ({ listPrice: ty * 1_000_000_000, feeInclusion: "excluded" });
const giaCuoi = (mc: ReturnType<typeof mayChuGia>, id: string) => foldListing(mc.can.get(id)!).listPrice;
/** listPrice của các sự kiện sau mốc `tu` của căn. */
const giaMoi = (mc: ReturnType<typeof mayChuGia>, id: string, tu: number) => mc.can.get(id)!.slice(tu).map((e) => e.payload.listPrice);

/** Kho bộ nhớ có công tắc lỗi khi ghi (và khi đọc). */
function khoCoCongTac(base: LocalStore) {
  let loiGhi = false;
  let loiDoc = false;
  const kho: LocalStore = {
    read: async (c) => {
      if (loiDoc) throw new Error("đọc kho hỏng");
      return base.read(c);
    },
    write: async (c, n) => {
      if (loiGhi) throw new Error("ghi kho hỏng");
      return base.write(c, n);
    },
    wipe: () => base.wipe(),
  };
  return { kho, datLoiGhi: (v: boolean) => void (loiGhi = v), datLoiDoc: (v: boolean) => void (loiDoc = v) };
}

function dung(o: { nhip?: boolean; dongHo?: ReturnType<typeof dongHoGia>; kho?: LocalStore } = {}) {
  const mc = mayChuGia({ userId: ME.userId });
  const bd = taoBoDongBo({ goi: mc.goi, kho: o.kho ?? taoKhoBoNho("u-x", new Map()), me: ME, companyId: "s", nhip: o.nhip ?? false, dongHo: o.dongHo, taoMa });
  return { mc, bd };
}

test("5xx: thao tác ở lại hàng đợi, căn khác vẫn lên, hồi thì tự gửi đúng thứ tự", async () => {
  const dh = dongHoGia();
  const { mc, bd } = dung({ nhip: true, dongHo: dh });
  mc.tao("h", "[Toà A]");
  mc.tao("k", "[Toà A]");
  await bd.khoiDong();
  mc.datMatMang(true);
  await bd.sua("h", "price_changed", gia(1));
  await bd.sua("h", "price_changed", gia(2));
  await bd.sua("k", "price_changed", gia(5));
  await bd.thuNgay();
  mc.datMatMang(false);
  mc.datMa("POST h", 503);
  const [h0, k0] = [mc.can.get("h")!.length, mc.can.get("k")!.length];
  await bd.thuNgay();
  assert.equal(mc.can.get("k")!.length, k0 + 1, "K phải lên dù H gặp 503");
  assert.equal(mc.can.get("h")!.length, h0, "H không lên khi máy chủ 503");
  assert.deepEqual(bd.canXem(), [], "H vào Cần xem với 503");
  assert.deepEqual(
    bd.ngan().queue.map((o) => [o.listingId, o.payload.listPrice]),
    [
      ["h", 1_000_000_000],
      ["h", 2_000_000_000],
    ],
  );
  assert.equal(bd.chiBao().nhan, "Máy chủ trục trặc · 2 thay đổi chờ gửi lại");
  mc.datMa("POST h", null);
  await dh.tien(15_000); // nhịp tự thử — không gọi thuNgay tay
  assert.deepEqual(giaMoi(mc, "h", h0), [1_000_000_000, 2_000_000_000], "hai sự kiện của H sai thứ tự");
  assert.equal(giaCuoi(mc, "h"), 2_000_000_000);
  assert.equal(bd.ngan().queue.length, 0);
  assert.match(bd.chiBao().nhan, /^Đã đồng bộ/);
  bd.dung();
});

test("401: dừng cả lô, giữ hàng đợi, phiên hồi thì lên đủ", async () => {
  const { mc, bd } = dung();
  mc.tao("h", "[Toà A]");
  mc.tao("k", "[Toà A]");
  await bd.khoiDong();
  mc.datMatMang(true);
  await bd.sua("h", "price_changed", gia(1));
  await bd.sua("k", "price_changed", gia(5));
  await bd.sua("h", "price_changed", gia(2));
  await bd.thuNgay();
  mc.datMatMang(false);
  mc.datMa("* *", 401);
  mc.datMa("* ds", 401);
  const [h0, k0] = [mc.can.get("h")!.length, mc.can.get("k")!.length];
  const goi0 = mc.goiQua.length;
  await bd.thuNgay();
  assert.equal(mc.goiQua.slice(goi0).filter((g) => g.method === "POST").length, 1, "401 phải dừng cả lô sau lời gọi đầu");
  assert.equal(bd.ngan().queue.length, 3);
  assert.deepEqual(bd.canXem(), [], "401 thành Cần xem");
  assert.equal(bd.chiBao().nhan, "Hết phiên · đăng nhập lại để gửi 3 thay đổi");
  assert.equal(bd.ngan().lastAttempt, "phien");
  mc.datMa("* *", null);
  mc.datMa("* ds", null);
  await bd.thuNgay();
  assert.deepEqual(giaMoi(mc, "h", h0), [1_000_000_000, 2_000_000_000]);
  assert.deepEqual(giaMoi(mc, "k", k0), [5_000_000_000]);
  assert.equal(bd.ngan().queue.length, 0);
  assert.deepEqual(bd.canXem(), []);
  assert.match(bd.chiBao().nhan, /^Đã đồng bộ/);
});

test("đối chiếu gặp 401/503: thao tác ở lại, không thành căn không còn đọc được", async () => {
  for (const ma of [401, 503]) {
    const { mc, bd } = dung();
    mc.tao("h", "[Toà A]");
    await bd.khoiDong();
    mc.datMa("POST h", 409, { error: "version-conflict" });
    mc.datMa("GET h", ma);
    await bd.sua("h", "price_changed", gia(1));
    await bd.thuNgay();
    assert.equal(bd.ngan().queue.length, 1, `${ma} khi đối chiếu: thao tác phải ở lại`);
    assert.deepEqual(bd.canXem(), [], `${ma} khi đối chiếu thành Cần xem`);
  }
  // Đối chứng: lần đọc trả 404 thì vẫn là «căn không còn đọc được» như hàng 13.
  const { mc, bd } = dung();
  mc.tao("h", "[Toà A]");
  await bd.khoiDong();
  mc.datMa("POST h", 409, { error: "version-conflict" });
  mc.datMa("GET h", 404);
  await bd.sua("h", "price_changed", gia(1));
  await bd.thuNgay();
  assert.deepEqual(bd.canXem().map((r) => [r.kind, r.reason]), [["tu-choi", "căn không còn đọc được"]]);
});

test("503 sau khi đã ghi: gửi lại không thành sự kiện thứ hai", async () => {
  const { mc, bd } = dung();
  mc.tao("h", "[Toà A]");
  await bd.khoiDong();
  const h0 = mc.can.get("h")!.length;
  mc.ghiRoi503LanToi();
  await bd.sua("h", "price_changed", gia(1));
  await bd.thuNgay();
  await bd.thuNgay();
  assert.equal(mc.can.get("h")!.length, h0 + 1, "gửi lại sau 503 thành sự kiện thứ hai");
  assert.equal(bd.ngan().queue.length, 0);
  assert.deepEqual(bd.canXem(), []);
});

test("4xx khác vẫn vào Cần xem như hàng 13", async () => {
  const lyDoLoi = checkTransition("Incomplete", "Closed", {});
  assert.equal(lyDoLoi.ok, false);
  const lyDo400 = lyDoLoi.ok ? "" : lyDoLoi.kind === "invalid-transition" ? lyDoLoi.reason : "";
  const bang: [number, unknown, [string, string | undefined]][] = [
    [400, { error: "invalid-transition", reason: lyDo400 }, ["tu-choi", lyDo400]],
    [403, { error: "listing-agent-required" }, ["tu-choi", "listing-agent-required"]],
    [404, { error: "not-found" }, ["tu-choi", "căn không còn đọc được"]],
    [409, { error: "version-conflict" }, ["dung-nhau", undefined]],
  ];
  for (const [ma, than, ky] of bang) {
    const { mc, bd } = dung();
    mc.tao("h", "[Toà A]");
    await bd.khoiDong();
    mc.datMa("POST h", ma, than);
    if (ma === 404) mc.datMa("GET h", 404);
    if (ma === 409) mc.nguoiKhacGhi("h", "price_changed", gia(9));
    await bd.sua("h", "price_changed", gia(1));
    await bd.thuNgay();
    assert.deepEqual(
      bd.canXem().map((r) => [r.kind, r.reason]),
      [ky],
      `mã ${ma} phải vào Cần xem`,
    );
    assert.equal(bd.ngan().queue.length, 0, `mã ${ma} bị giữ lại hàng đợi`);
  }
});

test("chỉ báo kéo về nói đúng nguyên nhân", async () => {
  const { mc, bd } = dung();
  mc.tao("h", "[Toà A]");
  mc.tao("k", "[Toà A]");
  await bd.khoiDong();
  const dau = bd.ngan().listings;
  const luot: [string, () => void, () => void, string][] = [
    ["ném lỗi", () => mc.datMatMang(true), () => mc.datMatMang(false), "Mất mạng · đang xem bản trên máy"],
    ["401", () => mc.datMa("GET ds", 401), () => mc.datMa("GET ds", null), "Hết phiên · đăng nhập lại để tải bản mới"],
    ["503", () => mc.datMa("GET ds", 503), () => mc.datMa("GET ds", null), "Máy chủ trục trặc · đang xem bản trên máy"],
    ["cấy nguồn", () => mc.datCayNguon(true), () => mc.datCayNguon(false), "Bản tải về bị từ chối · đang xem bản trên máy"],
    ["403", () => mc.datMa("GET ds", 403), () => mc.datMa("GET ds", null), "Bản tải về bị từ chối · đang xem bản trên máy"],
  ];
  for (const [ten, bat, tat, chu] of luot) {
    bat();
    await bd.thuNgay();
    assert.equal(bd.chiBao().nhan, chu, `lượt ${ten}`);
    assert.deepEqual(bd.ngan().listings, dau, `lượt ${ten}: danh sách trên máy đổi`);
    tat();
  }
  await bd.thuNgay();
  assert.match(bd.chiBao().nhan, /^Đã đồng bộ/);
});

test("kho lỗi: sửa trả lỗi kho, chỉ báo nói lỗi kho, kho hồi thì về bình thường", async () => {
  const kc = khoCoCongTac(taoKhoBoNho("u-x", new Map()));
  const { mc, bd } = dung({ kho: kc.kho });
  mc.tao("h", "[Toà A]");
  await bd.khoiDong();
  assert.doesNotMatch(bd.chiBao().nhan, /Lỗi kho/, "kho lành mà hiện lỗi kho");
  kc.datLoiGhi(true);
  const kq = await bd.sua("h", "price_changed", gia(1)).catch((e: unknown) => assert.fail(`sua ném lỗi kho: ${String(e)}`));
  assert.deepEqual(kq, { ok: false, loi: { kind: "kho" } });
  assert.equal(bd.chiBao().nhan, "Lỗi kho trên máy · thay đổi chưa lưu được");
  await bd.thuNgay(); // phải resolve
  kc.datLoiGhi(false);
  const h0 = mc.can.get("h")!.length;
  const lai = await bd.sua("h", "price_changed", gia(1));
  assert.equal(lai.ok, true);
  await bd.thuNgay();
  assert.equal(mc.can.get("h")!.length, h0 + 1);
  assert.match(bd.chiBao().nhan, /^Đã đồng bộ/);
});

test("kho lỗi giữa lượt nhịp: nhịp sống, kho hồi thì tự lên", async () => {
  let tuChoi = 0;
  const dem = () => void tuChoi++;
  process.on("unhandledRejection", dem);
  try {
    const dh = dongHoGia();
    const kc = khoCoCongTac(taoKhoBoNho("u-x", new Map()));
    const { mc, bd } = dung({ nhip: true, dongHo: dh, kho: kc.kho });
    mc.tao("h", "[Toà A]");
    await bd.khoiDong();
    mc.datMatMang(true);
    await bd.sua("h", "price_changed", gia(1));
    await xa();
    mc.datMatMang(false);
    const h0 = mc.can.get("h")!.length;
    kc.datLoiGhi(true);
    await dh.tien(15_000);
    await xa();
    assert.equal(tuChoi, 0, "lượt nhịp ném lỗi kho ra ngoài");
    assert.match(bd.chiBao().nhan, /^Lỗi kho trên máy · /);
    kc.datLoiGhi(false);
    await dh.tien(15_000);
    assert.equal(mc.can.get("h")!.length, h0 + 1, "không lên sau khi kho hồi");
    assert.match(bd.chiBao().nhan, /^Đã đồng bộ/);
    bd.dung();
  } finally {
    process.off("unhandledRejection", dem);
  }
});

/** Căn H vào Cần xem đụng nhau: tôi sửa giá 2 tỷ lúc mất mạng, người khác sửa trước. */
async function dungCanXem(kieu: "dung-nhau" | "tu-choi") {
  const { mc, bd } = dung();
  mc.tao("h", "[Toà A]");
  await bd.khoiDong();
  mc.datMatMang(true);
  await bd.sua("h", "price_changed", gia(2));
  await bd.thuNgay();
  mc.datMatMang(false);
  if (kieu === "dung-nhau") mc.nguoiKhacGhi("h", "price_changed", gia(9));
  else mc.datMa("POST h", 403, { error: "listing-agent-required" });
  await bd.thuNgay();
  if (kieu === "tu-choi") mc.datMa("POST h", null);
  assert.deepEqual(bd.canXem().map((r) => r.kind), [kieu]);
  return { mc, bd };
}

test("Cần xem sửa tiếp rồi Giữ của tôi: cũ trước mới sau, giá cuối là lần sau cùng", async () => {
  const { mc, bd } = await dungCanXem("dung-nhau");
  const truoc = mc.can.get("h")!.length;
  const kq = await bd.sua("h", "price_changed", gia(3));
  assert.equal(kq.ok, true);
  await bd.thuNgay();
  assert.equal(mc.can.get("h")!.length, truoc, "thao tác 3 tỷ lên trước khi chọn lối");
  await bd.giuCuaToi("h");
  await bd.thuNgay();
  assert.deepEqual(giaMoi(mc, "h", truoc), [2_000_000_000, 3_000_000_000], "giá cuối 2 tỷ — thứ tự đảo");
  assert.equal(giaCuoi(mc, "h"), 3_000_000_000);
  assert.deepEqual(bd.canXem(), []);
  assert.equal(bd.ngan().queue.length, 0);
});

test("Cần xem sửa tiếp rồi Lấy bản mới / Bỏ thay đổi / Sửa lại: lần sửa sau cùng lên, không kẹt", async () => {
  const luot: ["dung-nhau" | "tu-choi", "layBanMoi" | "boThayDoi" | "suaLai"][] = [
    ["dung-nhau", "layBanMoi"],
    ["tu-choi", "boThayDoi"],
    ["tu-choi", "suaLai"],
  ];
  for (const [kieu, loi] of luot) {
    const { mc, bd } = await dungCanXem(kieu);
    const truoc = mc.can.get("h")!.length;
    await bd.sua("h", "price_changed", gia(3));
    await bd[loi]("h");
    await bd.thuNgay();
    assert.deepEqual(giaMoi(mc, "h", truoc), [3_000_000_000], `${loi}: lần sửa tiếp không lên đúng một lần`);
    assert.equal(giaCuoi(mc, "h"), 3_000_000_000, `${loi}: giá cuối sai`);
    assert.equal(bd.ngan().queue.length, 0, `${loi}: thao tác kẹt trong hàng đợi`);
    assert.deepEqual(bd.canXem(), [], `${loi}: căn quay lại Cần xem`);
    await bd.thuNgay();
    assert.equal(mc.can.get("h")!.length, truoc + 1, `${loi}: lượt sau còn gửi thêm`);
  }
});

test("suyChiBao: bảng chữ theo thứ tự ưu tiên", () => {
  const luc = "2026-10-31T03:42:00.000Z";
  const op = (i: number): PendingOp => ({ opId: `o${i}`, listingId: "a", type: "price_changed", payload: {}, expectedVersion: 1, clientSeq: i, createdAt: luc });
  const n = (o: Partial<Ngan>): Ngan => ({ ...nganTrong(), listings: [], lastPullAt: luc, ...o });
  const xem = { listingId: "a", kind: "dung-nhau" as const, mine: [op(9)] };
  const bang: [string, Ngan, number, boolean, string][] = [
    ["Cần xem thắng lỗi kho", n({ review: [xem], lastAttempt: "phien" }), 0, true, "1 căn cần xem"],
    ["lỗi kho thắng đang gửi", n({ queue: [op(1)] }), 1, true, "Lỗi kho trên máy · thay đổi chưa lưu được"],
    ["đang gửi", n({ queue: [op(1)], lastAttempt: "may-chu" }), 1, false, "Đang gửi 1 thay đổi"],
    ["mất mạng, 2 chờ", n({ queue: [op(1), op(2)], lastAttempt: "mang" }), 0, false, "Mất mạng · 2 thay đổi chờ gửi"],
    ["mất mạng, 0 chờ", n({ lastAttempt: "mang" }), 0, false, "Mất mạng · đang xem bản trên máy"],
    ["hết phiên, 2 chờ", n({ queue: [op(1), op(2)], lastAttempt: "phien" }), 0, false, "Hết phiên · đăng nhập lại để gửi 2 thay đổi"],
    ["hết phiên, 0 chờ", n({ lastAttempt: "phien" }), 0, false, "Hết phiên · đăng nhập lại để tải bản mới"],
    ["máy chủ trục trặc, 2 chờ", n({ queue: [op(1), op(2)], lastAttempt: "may-chu" }), 0, false, "Máy chủ trục trặc · 2 thay đổi chờ gửi lại"],
    ["máy chủ trục trặc, 0 chờ", n({ lastAttempt: "may-chu" }), 0, false, "Máy chủ trục trặc · đang xem bản trên máy"],
    ["bị từ chối", n({ lastAttempt: "tu-choi" }), 0, false, "Bản tải về bị từ chối · đang xem bản trên máy"],
  ];
  for (const [ten, ngan, dangGui, loiKho, chu] of bang) assert.equal(suyChiBao(ngan, dangGui, loiKho).nhan, chu, ten);
});
