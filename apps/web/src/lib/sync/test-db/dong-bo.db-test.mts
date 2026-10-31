// Bộ đồng bộ trên máy nói với API thật trên Postgres dãy (hàng 13: AC-1, AC-4..AC-7). Số chủ mẫu 0900 000 012.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { findSourceLeaks } from "@quy-hang/core/access";
import { taoBoDongBo, type BoDongBo } from "../dong-bo";
import { taoKhoBoNho, type LocalStore } from "../kho";
import { keoVe } from "../keo";
import { demSuKien, goiCua, H, nguoi, sanMoi, suKienMoi, taoCan, type Nguoi } from "./ha-tang.mjs";

after(H.cleanup);

const TEN = "[Tên chủ mẫu]";
const MAU = [TEN, "0900000012", "0900 000 012", "+84900000012", "3200000000"];
const CHU = { ownerName: TEN, ownerPhone: "0900 000 012", floorPrice: 3_200_000_000 };

let A: { companyId: string }, B: { companyId: string };
let X: Nguoi, Y: Nguoi, Z: Nguoi;

before(async () => {
  A = await sanMoi("A");
  B = await sanMoi("B");
  X = await nguoi("x", [
    { companyId: A.companyId, vai: ["listing_agent"] },
    { companyId: B.companyId, vai: ["listing_agent"] },
  ]);
  Y = await nguoi("y", [{ companyId: A.companyId, vai: ["buyer_agent"] }]);
  Z = await nguoi("z", [{ companyId: B.companyId, vai: ["buyer_agent"] }]);
});

/** Bộ đồng bộ của một người trên một máy; sàn đang làm theo `san.hien`. */
function boCua(n: Nguoi, companyId: string, kho: LocalStore = taoKhoBoNho(n.userId, new Map())) {
  const san = { hien: companyId };
  const c = goiCua(n, () => san.hien);
  const tao = () => taoBoDongBo({ goi: c.goi, kho, me: { userId: n.userId, roles: [] }, companyId: san.hien, nhip: false });
  return { ...c, kho, san, tao };
}

const giaHienTai = async (n: Nguoi, id: string) => (await n.goi("GET", `/api/v1/listings/${id}`)).body.listPrice as number;

test("kéo về: mỗi người đúng phần được thấy, không nguồn trên máy", async () => {
  const chiToi = await taoCan(X, false);
  const toanSan = await taoCan(X, true);
  for (const id of [chiToi, toanSan]) assert.equal((await X.goi("PUT", `/api/v1/listings/${id}/owner`, CHU)).status, 200);
  const cua: Record<string, BoDongBo> = {};
  for (const [ten, n, cid] of [["X", X, A.companyId], ["Y", Y, A.companyId], ["Z", Z, B.companyId]] as const) {
    cua[ten] = boCua(n, cid).tao();
    await cua[ten].khoiDong();
  }
  const co = (bd: BoDongBo, id: string) => bd.danhSach().some((l) => l.id === id);
  assert.deepEqual([co(cua.X!, chiToi), co(cua.X!, toanSan)], [true, true], "X");
  assert.deepEqual([co(cua.Y!, chiToi), co(cua.Y!, toanSan)], [false, true], "Y");
  assert.deepEqual([co(cua.Z!, chiToi), co(cua.Z!, toanSan)], [false, false], "Z");
  for (const [ten, bd] of Object.entries(cua)) assert.deepEqual(findSourceLeaks(bd.ngan(), MAU), [], `kho của ${ten} mang nguồn`);
  // Đối chứng dương cùng hàm quét: bản ghi cấy số chủ bị bắt, và kéo về từ chối ghi bản ghi mang khoá nguồn.
  assert.ok(findSourceLeaks({ listings: [{ id: "x", ownerPhone: "0900 000 012" }] }, MAU).includes("listings.0.ownerPhone"));
  const cay = async () => {
    const r = await X.goi("GET", "/api/v1/listings");
    return { status: r.status, body: (r.body as object[]).map((l) => ({ ...l, ownerPhone: "0900 000 012" })) };
  };
  await assert.rejects(keoVe(cay, cua.X!.ngan(), new Date().toISOString()), /mang nguồn/);
});

test("kho tách theo sàn", async () => {
  const canB = await taoCan(X, true, B.companyId);
  const bo = boCua(X, A.companyId);
  const bd = bo.tao();
  await bd.khoiDong();
  const nganA = await bo.kho.read(A.companyId);
  bo.san.hien = B.companyId;
  await bd.doiSan(B.companyId);
  await bd.thuNgay();
  assert.deepEqual(await bo.kho.read(A.companyId), nganA, "ngăn sàn A phải giữ nguyên");
  const idsB = (await bo.kho.read(B.companyId)).listings!.map((l) => l.id);
  assert.ok(idsB.includes(canB));
  assert.ok(!idsB.some((id) => nganA.listings!.some((l) => l.id === id)), "ngăn sàn B lẫn căn của sàn A");
});

test("đổi sàn khi còn chờ: hàng đợi ở lại, về sàn thì lên", async () => {
  const ids = [await taoCan(X, true), await taoCan(X, true), await taoCan(X, true)];
  const canB = await taoCan(X, true, B.companyId);
  const bo = boCua(X, A.companyId);
  const bd = bo.tao();
  await bd.khoiDong();
  const truoc = await Promise.all(ids.map(demSuKien));
  bo.matMang(true);
  for (const [i, id] of ids.entries()) await bd.sua(id, "details_changed", { furnished: `f${i}` });
  await bd.thuNgay();
  bo.san.hien = B.companyId;
  await bd.doiSan(B.companyId);
  bo.matMang(false);
  await bd.thuNgay();
  await bd.sua(canB, "details_changed", { furnished: "o-B" });
  const bTruoc = await demSuKien(canB);
  await bd.thuNgay();
  assert.deepEqual(await Promise.all(ids.map(demSuKien)), truoc, "thao tác sàn A gửi khi đứng ở sàn B");
  assert.deepEqual(bd.canXem(), []);
  assert.equal(await demSuKien(canB), bTruoc + 1, "đối chứng: thao tác sàn B phải lên");
  bo.san.hien = A.companyId;
  await bd.doiSan(A.companyId);
  await bd.thuNgay();
  assert.deepEqual(await Promise.all(ids.map(demSuKien)), truoc.map((n) => n + 1));
  for (const [i, id] of ids.entries()) assert.deepEqual((await suKienMoi(id, truoc[i]!)).map((e) => e.payload), [{ furnished: `f${i}` }]);
  assert.equal((await bo.kho.read(A.companyId)).queue.length, 0);
});

test("mất mạng: 20 thay đổi trên năm căn lên đủ, đúng thứ tự", async () => {
  const ids: string[] = [];
  for (let i = 0; i < 5; i++) ids.push(await taoCan(X, true));
  const bo = boCua(X, A.companyId);
  let bd = bo.tao();
  await bd.khoiDong();
  const truoc = await Promise.all(ids.map(demSuKien));
  bo.matMang(true);
  // Kịch bản viết tay: mỗi căn 4 lần, xen kẽ giá và chi tiết.
  const KICH_BAN: [number, "price_changed" | "details_changed", Record<string, unknown>][] = [];
  for (let lan = 1; lan <= 4; lan++) {
    for (let c = 0; c < 5; c++) {
      KICH_BAN.push(lan % 2 === 1 ? [c, "price_changed", { listPrice: 3_500_000_000 + lan * 1_000_000, feeInclusion: "excluded" }] : [c, "details_changed", { furnished: `l${lan}` }]);
    }
  }
  for (const [k, [c, type, payload]] of KICH_BAN.entries()) {
    const r = await bd.sua(ids[c]!, type, payload);
    assert.ok(r.ok, JSON.stringify(r));
    if (k === 9) {
      await bd.thuNgay();
      bd = bo.tao(); // dựng lại từ cùng kho, như tải lại trang
      await bd.khoiDong();
    }
  }
  assert.deepEqual(await Promise.all(ids.map(demSuKien)), truoc, "mất mạng mà máy chủ đã đổi");
  bo.matMang(false);
  await bd.thuNgay();
  const sau = await Promise.all(ids.map(demSuKien));
  assert.equal(sau.reduce((t, n, i) => t + n - truoc[i]!, 0), 20);
  for (const [c, id] of ids.entries()) {
    const moi = await suKienMoi(id, truoc[c]!);
    assert.deepEqual(
      moi.map((e) => [e.type, e.payload]),
      KICH_BAN.filter(([cc]) => cc === c).map(([, type, payload]) => [type, payload]),
      `căn ${c}`,
    );
  }
  const n = await bo.kho.read(A.companyId);
  assert.equal(n.queue.length, 0);
  for (const id of ids) assert.equal(n.listings!.find((l) => l.id === id)!.version, (await X.goi("GET", `/api/v1/listings/${id}`)).body.version);
});

test("gửi lại sau khi mất phản hồi không thành sự kiện thứ hai", async () => {
  const bo = boCua(X, A.companyId);
  const bd = bo.tao();
  const [h, coc, ban, khac] = [await taoCan(X, true), await taoCan(X, true), await taoCan(X, true), await taoCan(X, true)];
  await bd.khoiDong();
  for (const [id, type, payload] of [
    [h, "details_changed", { furnished: "full" }],
    [coc, "status_changed", { to: "Pending" }],
    [ban, "status_changed", { to: "Closed", closePrice: 3_400_000_000 }],
  ] as const) {
    const truoc = await demSuKien(id);
    await bd.sua(id, type, payload);
    bo.matPhanHoiLanToi();
    await bd.thuNgay(); // máy chủ ghi, phản hồi mất
    assert.equal(bd.ngan().queue.length, 1, `${type}: thao tác phải còn chờ`);
    await bd.thuNgay(); // gửi lại
    assert.equal(await demSuKien(id), truoc + 1, `${type}: phải đúng +1`);
    assert.equal(bd.ngan().queue.length, 0);
    assert.deepEqual(bd.canXem(), []);
  }
  // Đối chứng: cùng nội dung do người khác ghi trước không được nhận là của mình.
  bo.matMang(true);
  await bd.sua(khac, "details_changed", { furnished: "basic" });
  const v = (await Y.goi("GET", `/api/v1/listings/${khac}`)).body.version;
  assert.equal((await Y.goi("POST", `/api/v1/listings/${khac}/events`, { type: "details_changed", payload: { furnished: "basic" }, expectedVersion: v })).status, 200);
  bo.matMang(false);
  await bd.thuNgay();
  assert.deepEqual(bd.canXem().map((r) => [r.listingId, r.kind]), [[khac, "dung-nhau"]]);
});

test("đụng nhau: căn thành cần xem, căn khác vẫn lên", async () => {
  const [hh, kk, h2] = [await taoCan(X, true), await taoCan(X, true), await taoCan(X, true)];
  const bo = boCua(X, A.companyId);
  const bd = bo.tao();
  await bd.khoiDong();
  bo.matMang(true);
  await bd.sua(hh, "price_changed", { listPrice: 3_600_000_000, feeInclusion: "excluded" });
  await bd.sua(kk, "price_changed", { listPrice: 3_700_000_000, feeInclusion: "excluded" });
  await bd.sua(h2, "price_changed", { listPrice: 3_800_000_000, feeInclusion: "excluded" });
  for (const [id, gia] of [[hh, 3_550_000_000], [h2, 3_560_000_000]] as const) {
    const v = (await Y.goi("GET", `/api/v1/listings/${id}`)).body.version;
    assert.equal((await Y.goi("POST", `/api/v1/listings/${id}/events`, { type: "price_changed", payload: { listPrice: gia, feeInclusion: "excluded" }, expectedVersion: v })).status, 200);
  }
  const [hT, kT] = [await demSuKien(hh), await demSuKien(kk)];
  bo.matMang(false);
  await bd.thuNgay();
  assert.equal(await demSuKien(kk), kT + 1, "K phải lên");
  assert.equal(await demSuKien(hh), hT, "H không được ghi đè");
  const xemH = bd.canXem().find((r) => r.listingId === hh)!;
  assert.equal(xemH.kind, "dung-nhau");
  assert.equal(xemH.server!.value.listPrice, 3_550_000_000);
  assert.equal(xemH.server!.byUserId, Y.userId);
  assert.equal(xemH.mine[0]!.payload.listPrice, 3_600_000_000);
  await bd.giuCuaToi(hh);
  await bd.thuNgay();
  const cuoiH = (await suKienMoi(hh, 0)).slice(-2);
  assert.deepEqual(cuoiH.map((e) => e.actor_user_id), [Y.userId, X.userId], "sự kiện của X phải sau của Y");
  await bd.layBanMoi(h2);
  assert.ok(!bd.ngan().queue.some((o) => o.listingId === h2));
  assert.equal(bd.danhSach().find((l) => l.id === h2)!.listPrice, await giaHienTai(X, h2));
});

test("máy chủ từ chối: cần xem kèm lý do", async () => {
  const [rut, chiToiY] = [await taoCan(X, true), await taoCan(Y, false)];
  const bo = boCua(X, A.companyId);
  const bd = bo.tao();
  await bd.khoiDong();
  bo.matMang(true);
  const opDau = bd.ngan().queue.length;
  await bd.sua(rut, "status_changed", { to: "Closed", closePrice: 3_300_000_000 });
  // Thao tác cấy vào hàng đợi cho căn «Chỉ tôi» của Y (kho cũ trên máy) — máy chủ trả 404.
  const n = await bo.kho.read(A.companyId);
  await bo.kho.write(A.companyId, {
    ...n,
    queue: [...n.queue, { opId: "op-cay", listingId: chiToiY, type: "details_changed", payload: { furnished: "x" }, expectedVersion: 1, clientSeq: n.nextSeq, createdAt: new Date().toISOString() }],
    nextSeq: n.nextSeq + 1,
  });
  // Y rút căn khỏi bán (Withdrawn, trạng thái cuối) trước khi X có mạng: Đã bán của X thành không hợp lệ (400).
  const v = (await Y.goi("GET", `/api/v1/listings/${rut}`)).body.version;
  assert.equal((await Y.goi("POST", `/api/v1/listings/${rut}/events`, { type: "status_changed", payload: { to: "Withdrawn", withdrawnReason: "owner_changed_mind" }, expectedVersion: v })).status, 200);
  const truoc = opDau + 2;
  bo.matMang(false);
  await bd.khoiDong();
  const xem = bd.canXem();
  assert.deepEqual(xem.map((r) => [r.listingId, r.kind]).sort(), [[chiToiY, "tu-choi"], [rut, "tu-choi"]].sort());
  assert.equal(xem.find((r) => r.listingId === chiToiY)!.reason, "căn không còn đọc được");
  assert.match(xem.find((r) => r.listingId === rut)!.reason!, /Withdrawn không chuyển sang Closed/);
  const trongXem = xem.reduce((t, r) => t + r.mine.length, 0);
  assert.equal(bd.ngan().queue.length + trongXem, truoc - opDau, "không thao tác nào mất câm");
  assert.equal(trongXem, 2);
});

test("từ chối: Bỏ thay đổi trả căn về thường", async () => {
  const [rut, chiToiY] = [await taoCan(X, true), await taoCan(Y, false)];
  const bo = boCua(X, A.companyId);
  const bd = bo.tao();
  await bd.khoiDong();
  bo.matMang(true);
  await bd.sua(rut, "status_changed", { to: "Closed", closePrice: 3_300_000_000 });
  const n = await bo.kho.read(A.companyId);
  await bo.kho.write(A.companyId, {
    ...n,
    queue: [...n.queue, { opId: "op-cay-2", listingId: chiToiY, type: "details_changed", payload: { furnished: "x" }, expectedVersion: 1, clientSeq: n.nextSeq, createdAt: new Date().toISOString() }],
    nextSeq: n.nextSeq + 1,
  });
  const v = (await Y.goi("GET", `/api/v1/listings/${rut}`)).body.version;
  await Y.goi("POST", `/api/v1/listings/${rut}/events`, { type: "status_changed", payload: { to: "Withdrawn", withdrawnReason: "owner_changed_mind" }, expectedVersion: v });
  bo.matMang(false);
  await bd.khoiDong();
  assert.equal(bd.canXem().length, 2);
  // 404: Bỏ thay đổi.
  await bd.boThayDoi(chiToiY);
  assert.deepEqual(bd.canXem().map((r) => r.listingId), [rut]);
  assert.ok(!bd.ngan().queue.some((o) => o.listingId === chiToiY));
  // 400: Sửa lại trả giá trị của tôi; kiểm lại bằng lõi cho cùng lý do.
  const nhap = await bd.suaLai(rut);
  assert.deepEqual(nhap, { to: "Closed", closePrice: 3_300_000_000 });
  const lai = await bd.sua(rut, "status_changed", nhap);
  assert.ok(!lai.ok);
  assert.deepEqual(lai.loi, { kind: "invalid-transition", reason: "Withdrawn không chuyển sang Closed" });
  assert.deepEqual(bd.canXem(), []);
  assert.notEqual(bd.chiBao().loai, "xem");
});

test("Đã cọc của người khác thắng thay đổi chờ của tôi", async () => {
  for (const [to, them, kind] of [
    ["Pending", {}, "da-coc"],
    ["Closed", { closePrice: 3_400_000_000 }, "da-ban"],
  ] as const) {
    const hh = await taoCan(X, true);
    const bo = boCua(X, A.companyId);
    const bd = bo.tao();
    await bd.khoiDong();
    bo.matMang(true);
    await bd.sua(hh, "price_changed", { listPrice: 3_900_000_000, feeInclusion: "excluded" });
    const v = (await Y.goi("GET", `/api/v1/listings/${hh}`)).body.version;
    assert.equal((await Y.goi("POST", `/api/v1/listings/${hh}/events`, { type: "status_changed", payload: { to, ...them }, expectedVersion: v })).status, 200);
    const truoc = await demSuKien(hh);
    bo.matMang(false);
    await bd.thuNgay();
    assert.equal(await demSuKien(hh), truoc, `${to}: giá của X không được lên`);
    assert.ok(!(await suKienMoi(hh, v)).some((e) => e.type === "price_changed" && e.actor_user_id === X.userId));
    assert.deepEqual(bd.canXem().map((r) => [r.listingId, r.kind]), [[hh, kind]]);
  }
});

test("Đã cọc của tôi lên dù phiên bản lệch", async () => {
  for (const [to, them] of [
    ["Pending", {}],
    ["Closed", { closePrice: 3_400_000_000 }],
  ] as const) {
    const hh = await taoCan(X, true);
    const bo = boCua(X, A.companyId);
    const bd = bo.tao();
    await bd.khoiDong();
    bo.matMang(true);
    assert.ok((await bd.sua(hh, "status_changed", { to, ...them })).ok);
    const v = (await Y.goi("GET", `/api/v1/listings/${hh}`)).body.version;
    assert.equal((await Y.goi("POST", `/api/v1/listings/${hh}/events`, { type: "price_changed", payload: { listPrice: 3_450_000_000, feeInclusion: "excluded" }, expectedVersion: v })).status, 200);
    bo.matMang(false);
    await bd.thuNgay();
    const s = (await X.goi("GET", `/api/v1/listings/${hh}`)).body;
    assert.equal(s.standardStatus, to);
    assert.ok((await suKienMoi(hh, 0)).some((e) => e.type === "status_changed" && e.payload.to === to && e.actor_user_id === X.userId));
    assert.deepEqual(bd.canXem(), []);
  }
});
