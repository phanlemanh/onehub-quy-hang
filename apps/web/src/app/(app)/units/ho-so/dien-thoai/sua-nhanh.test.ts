// Đổi giá nhanh trên hồ sơ căn điện thoại (hàng 40 doi-gia-nhanh: E2, E3, E4, E5, E6). Ma trận viết trước, mỗi bộ so có
// chiều đỏ ghim lời lệch. Dữ liệu mẫu, không dữ liệu cá nhân thật.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { kiemDoiGia, LY_DO_DOI_GIA_DA_BAN, STANDARD_STATUSES, type StandardStatus } from "@quy-hang/core/listing";
import { taoBoDongBo } from "@/lib/sync/dong-bo";
import { taoGoiFetch } from "@/lib/sync/goi-fetch";
import { taoKhoBoNho } from "@/lib/sync/kho";
import { dongHoGia, mayChuGia } from "@/lib/sync/may-chu-gia.test-helpers";
import { dungLenhGia, homNay, type GhiFn, type HangSua, type Lenh } from "../../../inventory/cell-edit/lenh";
import { dongLichSu } from "../ho-so";
import { KhoiGiaSua } from "./ngan-sua-nhanh";
import { buocDoiGia, buocDoiTrangThai, cacNac, ghiLenh, khoaGia, type BuocLuu } from "./sua-nhanh";

const HANG: HangSua = { id: "hang-1", unitNumber: "A-01.02", listPrice: 3_000_000_000, feeInclusion: "included", standardStatus: "Active", statusLabel: null, legalStatus: "pink_book", occupantType: "vacant" };

// ——— E2 · AC-2: ngăn Đổi giá, 6 ca viết trước ———

type CaGia = { ten: string; chu: string; phi: "included" | "excluded" | null; mong: string };
const CA_GIA: CaGia[] = [
  { ten: "giá hợp lệ cùng phí", chu: "3,1 tỷ", phi: "included", mong: "ghi 3100000000 included" },
  { ten: "giá đọc không được", chu: "ba tỷ hơn", phi: "included", mong: "lỗi" },
  { ten: "thiếu điều kiện phí", chu: "3,1 tỷ", phi: null, mong: "lỗi" },
  { ten: "giá đổi 35%", chu: "4,05 tỷ", phi: "included", mong: "hỏi lại 35%" },
  { ten: "đổi điều kiện phí", chu: "3 tỷ", phi: "excluded", mong: "hỏi lại đổi phí" },
  { ten: "giá đổi 10% cùng phí", chu: "3,3 tỷ", phi: "included", mong: "ghi 3300000000 included" },
];
const tomTat = (b: BuocLuu): string => {
  if (b.kind === "loi") return "lỗi";
  if (b.kind === "hoi-lai") return b.doiPhi ? "hỏi lại đổi phí" : `hỏi lại ${b.phanTram}%`;
  const p = b.lenh.payload as { listPrice: number; feeInclusion: string };
  return `ghi ${p.listPrice} ${p.feeInclusion}`;
};
function lechGia(ham: typeof buocDoiGia): string[] {
  return CA_GIA.flatMap((c) => {
    const thuc = tomTat(ham(HANG, c.chu, c.phi));
    return thuc === c.mong ? [] : [`${c.ten}: ${thuc} · mong ${c.mong}`];
  });
}

test("E2 ngăn Đổi giá: 6 ca viết trước (ghi · lỗi · lỗi · hỏi lại · hỏi lại · ghi)", () => {
  assert.equal(CA_GIA.length, 6);
  assert.deepEqual(lechGia(buocDoiGia), []);
  // Lỗi mang chữ nói được trong ngăn.
  const loi = buocDoiGia(HANG, "3,1 tỷ", null);
  assert.ok(loi.kind === "loi" && loi.chu.includes("Bao phí"), "thiếu phí nói rõ phải chọn");
});

test("E2 chiều đỏ: bản sao bỏ bước hỏi lại → bộ so nêu đúng hai ca hỏi lại", () => {
  const boHoi: typeof buocDoiGia = (h, chu, phi) => {
    const kq = dungLenhGia(h, chu, phi);
    return kq.ok ? { kind: "ghi", lenh: kq.lenh } : { kind: "loi", chu: "loi" in kq ? kq.loi : "" };
  };
  assert.deepEqual(lechGia(boHoi), ["giá đổi 35%: ghi 4050000000 included · mong hỏi lại 35%", "đổi điều kiện phí: ghi 3000000000 excluded · mong hỏi lại đổi phí"]);
});

// ——— E3 · AC-3: căn Đã bán không đổi giá ———

const DA_BAN: HangSua = { ...HANG, standardStatus: "Closed" };

/** Đi đúng đường của ngăn: bước «Lưu» rồi ghi khi bước cho ghi. Trả số lời gọi bộ đồng bộ. */
async function soLoiGoi(buoc: typeof buocDoiGia, hang: HangSua): Promise<number> {
  let goi = 0;
  const sua: GhiFn = async () => (goi++, { ok: true, op: { expectedVersion: 1 } });
  const b = buoc(hang, "3,2 tỷ", "included");
  if (b.kind !== "loi") await ghiLenh(sua, hang, b.lenh, 1);
  return goi;
}

test("E3 căn Đã bán: khối Giá không mở sửa, nói lý do; lối ghi bị chặn trước khi gọi bộ đồng bộ", async () => {
  assert.equal(khoaGia(DA_BAN), LY_DO_DOI_GIA_DA_BAN);
  const html = renderToStaticMarkup(createElement(KhoiGiaSua, { hang: DA_BAN, suaHang: true, khoa: khoaGia(DA_BAN), children: createElement("span", null, "3 tỷ") }));
  assert.ok(html.includes("Căn đã bán không đổi giá — giá chốt đã ghi"));
  assert.ok(!html.includes('data-nut="doi-gia"'), "không có lối mở sửa");
  const b = buocDoiGia(DA_BAN, "3,2 tỷ", "included");
  assert.deepEqual(b, { kind: "loi", chu: LY_DO_DOI_GIA_DA_BAN });
  assert.equal(await soLoiGoi(buocDoiGia, DA_BAN), 0);
  // Đối chứng dương: căn Đang bán có lối sửa và đúng một lời gọi.
  const htmlMo = renderToStaticMarkup(createElement(KhoiGiaSua, { hang: HANG, suaHang: true, khoa: khoaGia(HANG), children: createElement("span", null, "3 tỷ") }));
  assert.ok(htmlMo.includes('data-nut="doi-gia"'));
  assert.equal(await soLoiGoi(buocDoiGia, HANG), 1);
  // Người không được sửa: không lối nào.
  const htmlKhong = renderToStaticMarkup(createElement(KhoiGiaSua, { hang: HANG, suaHang: false, khoa: null, children: createElement("span", null, "3 tỷ") }));
  assert.ok(!htmlKhong.includes('data-nut="doi-gia"'));
});

test("E3 chiều đỏ: bản sao bỏ kiemDoiGia → bộ so nêu «Đã bán · có lời gọi ghi»", async () => {
  const boKhoa: typeof buocDoiGia = (h, chu, phi) => buocDoiGia({ ...h, standardStatus: "Active" }, chu, phi);
  const lech = (await soLoiGoi(boKhoa, DA_BAN)) > 0 ? ["Đã bán · có lời gọi ghi"] : [];
  assert.deepEqual(lech, ["Đã bán · có lời gọi ghi"]);
  assert.equal(kiemDoiGia(DA_BAN), "price-locked-closed");
});

// ——— E4 · AC-4: ngăn Đổi trạng thái ———

test("E4 danh sách nấc: 6 trạng thái xuất phát × có · không cờ Sẵn sàng bán — không cờ thì không có Đang bán", () => {
  let o = 0;
  for (const tu of STANDARD_STATUSES)
    for (const sanSang of [true, false]) {
      o++;
      const ds = cacNac({ ...HANG, standardStatus: tu }, undefined, sanSang);
      if (!sanSang) assert.ok(!ds.some((lc) => lc.to === "Active"), `${tu} · không cờ · có Đang bán`);
    }
  assert.equal(o, 12);
  // Đối chứng dương: từ Tạm giữ có cờ thì có Đang bán.
  assert.ok(cacNac({ ...HANG, standardStatus: "Hold" }, undefined, true).some((lc) => lc.to === "Active"));
});

type CaTt = { ten: string; tu: StandardStatus; to: StandardStatus; them: Parameters<typeof buocDoiTrangThai>[2]; hang?: Partial<HangSua>; mong: string };
const CA_TT: CaTt[] = [
  { ten: "Đã cọc hợp lệ", tu: "Active", to: "Pending", them: {}, mong: "ghi Pending" },
  { ten: "Đã bán thiếu giá chốt", tu: "Active", to: "Closed", them: { ngayBan: "2026-11-08" }, mong: "lỗi" },
  { ten: "Đã bán có giá chốt thiếu ngày", tu: "Active", to: "Closed", them: { giaChot: "3 tỷ", ngayBan: "" }, mong: `ghi Closed 3000000000 ${homNay()}` },
  { ten: "Đã bán đủ", tu: "Pending", to: "Closed", them: { giaChot: "2,9 tỷ", ngayBan: "2026-11-07" }, mong: "ghi Closed 2900000000 2026-11-07" },
  { ten: "Ngừng bán thiếu lý do", tu: "Active", to: "Withdrawn", them: {}, mong: "lỗi" },
  { ten: "Đang bán thiếu điều kiện", tu: "Incomplete", to: "Active", them: {}, hang: { legalStatus: null }, mong: "lỗi" },
];
const tomTatTt = (b: BuocLuu): string => {
  if (b.kind !== "ghi") return "lỗi";
  const p = b.lenh.payload as { to: string; closePrice?: number; closeDate?: string };
  return ["ghi", p.to, p.closePrice, p.closeDate].filter((x) => x !== undefined).join(" ");
};
function lechTt(ham: typeof buocDoiTrangThai): string[] {
  return CA_TT.flatMap((c) => {
    const hang = { ...HANG, standardStatus: c.tu, ...c.hang };
    const thuc = tomTatTt(ham(hang, { to: c.to, label: null, chu: c.to }, c.them, true));
    return thuc === c.mong ? [] : [`${c.ten}: ${thuc} · mong ${c.mong}`];
  });
}

test("E4 ghi trạng thái: 6 ca viết trước, lỗi mang lý do của lõi", () => {
  assert.equal(CA_TT.length, 6);
  assert.deepEqual(lechTt(buocDoiTrangThai), []);
  const loi = buocDoiTrangThai({ ...HANG, standardStatus: "Incomplete", legalStatus: null }, { to: "Active", label: null, chu: "Đang bán" }, {}, true);
  assert.ok(loi.kind === "loi" && loi.chu.startsWith("Chưa lên Đang bán được: thiếu"), "lý do của lõi");
});

test("E4 chiều đỏ: bản sao bỏ kiểm phần kèm của Đã bán → bộ so nêu «Đã bán thiếu giá chốt»", () => {
  const boKem: typeof buocDoiTrangThai = (h, lc, them, s) =>
    lc.to === "Closed" && !them.giaChot ? { kind: "ghi", lenh: { type: "status_changed", payload: { to: "Closed", closeDate: them.ngayBan } } } : buocDoiTrangThai(h, lc, them, s);
  assert.deepEqual(lechTt(boKem), ["Đã bán thiếu giá chốt: ghi Closed 2026-11-08 · mong lỗi"]);
});

// ——— E5 · AC-5: ghi qua bộ đồng bộ thật (máy chủ giả) ———

const ME = { userId: "u-chu", roles: ["listing_agent"] };
function dung() {
  const mc = mayChuGia({ userId: ME.userId });
  const bd = taoBoDongBo({ goi: mc.goi, kho: taoKhoBoNho("u-chu", new Map()), me: ME, companyId: "s", nhip: false, dongHo: dongHoGia(), taoMa: (() => { let i = 0; return () => `op-${++i}`; })(), thietBi: () => "mobile" });
  return { mc, bd };
}
const giaMoi = (bd: ReturnType<typeof dung>["bd"]): Lenh => {
  const h = bd.danhSach().find((l) => l.id === "x")!;
  const b = buocDoiGia({ ...h, statusLabel: h.statusLabel ?? null } as HangSua, "1,2 tỷ", "included");
  assert.equal(b.kind, "ghi");
  return (b as Extract<BuocLuu, { kind: "ghi" }>).lenh;
};

async function lechDongBo(ghiQua: "hang-doi" | "thang"): Promise<string[]> {
  const ra: string[] = [];
  // Có mạng: đúng một sự kiện.
  {
    const { mc, bd } = dung();
    mc.tao("x", "[Toà A]");
    await bd.khoiDong();
    const r = await ghiLenh(bd.sua as GhiFn, { id: "x", unitNumber: "x-01" }, giaMoi(bd), undefined);
    await bd.thuNgay();
    const n = mc.lenhNhan.filter((l) => l.listingId === "x" && l.body.type === "price_changed").length;
    if (!r.ok || n !== 1) ra.push(`có mạng · ${n} sự kiện`);
  }
  // Mất mạng lúc lưu: chờ trên máy, có mạng lại gửi đúng một lần.
  {
    const { mc, bd } = dung();
    mc.tao("x", "[Toà A]");
    await bd.khoiDong();
    mc.datMatMang(true);
    const lenh = giaMoi(bd);
    if (ghiQua === "hang-doi") await ghiLenh(bd.sua as GhiFn, { id: "x", unitNumber: "x-01" }, lenh, undefined);
    else await mc.goi("POST", "/api/v1/listings/x/events", { type: lenh.type, payload: lenh.payload }).catch(() => null);
    await bd.thuNgay();
    mc.datMatMang(false);
    await bd.thuNgay();
    await bd.thuNgay();
    const n = mc.lenhNhan.filter((l) => l.listingId === "x" && l.body.type === "price_changed").length;
    if (n !== 1) ra.push(`mất mạng · ${n} sự kiện`);
  }
  // Máy chủ từ chối về sau: căn vào Cần xem.
  {
    const { mc, bd } = dung();
    mc.tao("x", "[Toà A]");
    await bd.khoiDong();
    mc.datMa("POST x", 400, { error: "invalid-transition", reason: "không chuyển được" });
    await ghiLenh(bd.sua as GhiFn, { id: "x", unitNumber: "x-01" }, giaMoi(bd), undefined);
    await bd.thuNgay();
    if (!bd.canXem()) ra.push("máy chủ từ chối · không vào Cần xem");
  }
  return ra;
}

test("E5 ghi qua bộ đồng bộ: có mạng 1 sự kiện · mất mạng chờ rồi gửi đúng 1 lần · máy chủ từ chối thì vào Cần xem", async () => {
  assert.deepEqual(await lechDongBo("hang-doi"), []);
});

test("E5 chiều đỏ: bản sao gửi thẳng không qua hàng đợi → bộ so nêu ô mất mạng", async () => {
  const lech = await lechDongBo("thang");
  assert.deepEqual(lech.filter((x) => x.startsWith("mất mạng")), ["mất mạng · 0 sự kiện"]);
});

test("E5 thiết bị: lời gửi của bộ đồng bộ mang đầu x-quy-hang-device = mobile trên điện thoại", async () => {
  const dau: string[] = [];
  const f = (async (_u: string, init?: RequestInit) => {
    dau.push(String((init?.headers as Record<string, string>)["x-quy-hang-device"]));
    return new Response("{}", { status: 200 });
  }) as typeof fetch;
  await taoGoiFetch({ fetch: f, thietBi: () => "mobile" })("POST", "/api/v1/listings/x/events", {});
  await taoGoiFetch({ fetch: f, thietBi: () => "desktop" })("POST", "/api/v1/listings/x/events", {});
  assert.deepEqual(dau, ["mobile", "desktop"], "đối chứng: máy tính mang desktop");
});

// ——— E6 · AC-6: hiện lại sau lần ghi ———

test("E6 sau lần ghi: hồ sơ có giá và trạng thái mới; Lịch sử có dòng «Đổi giá» và «Đổi trạng thái» kèm người làm và giờ", async () => {
  const { mc, bd } = dung();
  mc.tao("x", "[Toà A]");
  await bd.khoiDong();
  const truoc = bd.danhSach().find((l) => l.id === "x")!;
  assert.equal(truoc.listPrice, null, "đối chứng: trước lần ghi chưa có giá");
  await ghiLenh(bd.sua as GhiFn, { id: "x", unitNumber: "x-01" }, giaMoi(bd), undefined);
  await bd.thuNgay();
  const sau = bd.danhSach().find((l) => l.id === "x")!;
  assert.equal(sau.listPrice, 1_200_000_000);
  // Lịch sử dựng từ sự kiện máy chủ đã nhận (đọc lại từ máy chủ giả, không viết tay).
  const ev = mc.can.get("x")!;
  const coGia = ev.find((e) => e.type === "price_changed")!;
  const dongGia = dongLichSu(ev, ME.userId).find((d) => d.viec === "Đổi giá");
  assert.ok(dongGia, "có dòng Đổi giá");
  assert.ok(dongGia!.nguoi.length > 0 && dongGia!.luc.length > 0, "kèm người làm và giờ");
  assert.ok(coGia.occurredAt);
  const st = mc.can.get("x")!;
  st.push({ seq: st.length + 1, type: "status_changed", payload: { to: "Hold" }, actorUserId: ME.userId, actorRoles: ["listing_agent"], confirmedWithOwner: true, occurredAt: new Date().toISOString() });
  const dongTt = dongLichSu(st, ME.userId).find((d) => d.viec === "Đổi trạng thái");
  assert.ok(dongTt, "có dòng Đổi trạng thái");
});
