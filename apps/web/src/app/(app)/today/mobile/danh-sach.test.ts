// Hôm nay đầu chủ trên điện thoại (hàng 39: E1, E2, E5, E6, E7) — thẻ, ngăn và danh sách dựng thật bằng renderToStaticMarkup.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BO_NHOM_MAC_DINH } from "@quy-hang/core/today";
import type { MucHan, ViecDong } from "../viec-dong";
import type { MaViecDT, MucKetQua } from "./goi";
import { DanhSachDienThoai, KetQuaCuocGoi, LOI_CAN_MANG, NHAN_TRA_LAI, TheViec, ViecKhac, type NhomThe, type TheDong } from "./danh-sach";
import { bamViec, chonKetQua, dungNhomThe, noiThe, type HanhDongNoi } from "./hanh-dong";
import { HetViec } from "./het-viec";

const nhom = (code: string) => {
  const n = BO_NHOM_MAC_DINH.find((x) => x.code === code);
  if (!n) throw new Error(`thiếu nhóm ${code}`);
  return n;
};

function the(sua: Partial<TheDong> & { dong: ViecDong }): TheDong {
  return {
    id: "lead:l1",
    tren: "[Mẫu] Toà A · A-01",
    duoi: "Đã nhận · nhập 9:00 · 3,2 tỷ",
    han: null,
    coSo: true,
    ban: false,
    lam: () => ({ onClick: () => {} }),
    ghiKetQua: () => {},
    soCu: null,
    moSo: async () => ({ ok: true, so: "0900000091" }),
    daMo: () => {},
    ...sua,
  };
}
const dungThe = (t: TheDong, coMang = true) => renderToStaticMarkup(createElement(TheViec, { t, coMang, onGoi: () => {}, hoiTraLai: () => {} }));
const LEAD_DA_NHAN: ViecDong = { kind: "lead", nhom: nhom("new_lead"), stage: "accepted" };
const CAN_GIA: ViecDong = { kind: "can", nhom: nhom("price_adjustment") };

// E2 — thẻ hai tầng và màu hạn: 3 mốc × 2 loại = 6 ô.
const LOP_HAN: Record<MucHan, string | null> = { qua: "text-destructive", sap: "text-warning", thuong: null, khong: null };
function lechHan(dung: (t: TheDong) => string): string[] {
  const out: string[] = [];
  for (const muc of ["qua", "sap", "thuong"] as const) {
    for (const dong of [LEAD_DA_NHAN, CAN_GIA]) {
      const html = dung(the({ dong, han: { chu: "còn 12 phút", muc } }));
      const o = `${dong.kind}/${muc}`;
      if (!html.includes("[Mẫu] Toà A · A-01")) out.push(`${o}: thiếu dòng trên`);
      if (!html.includes("Đã nhận · nhập 9:00 · 3,2 tỷ")) out.push(`${o}: thiếu dòng dưới`);
      const lop = LOP_HAN[muc];
      const dongHan = html.match(/<span class="([^"]*)">còn 12 phút<\/span>/)?.[1] ?? null;
      if (dongHan === null) out.push(`${o}: thiếu dòng hạn`);
      else if (lop ? !dongHan.includes(lop) : /text-(destructive|warning)/.test(dongHan)) out.push(`${o}: màu hạn sai`);
    }
  }
  return out;
}

test("E2 thẻ hai tầng, màu hạn như máy tính (3 mốc × 2 loại dòng = 6 ô)", () => {
  assert.deepEqual(lechHan((t) => dungThe(t)), []);
});

test("E2 đối chứng đỏ: bản sao bỏ màu hạn → nêu mốc", () => {
  const boMau = (t: TheDong) => dungThe(t).replace(/ text-(destructive|warning)/g, "");
  const lech = lechHan(boMau);
  assert.ok(lech.includes("lead/qua: màu hạn sai") && lech.includes("can/sap: màu hạn sai"), lech.join("\n"));
});

// E6 — mất mạng: «Gọi» tắt kèm lời; có mạng bật.
const nutGoi = (html: string) => html.match(/<button[^>]*>(?:(?!<\/button>).)*Gọi<\/button>/s)?.[0] ?? "";
/** Bộ so mất mạng: «Gọi» tắt kèm lời khi mất mạng, bật không lời khi có mạng. */
function lechMatMang(dung: (t: TheDong, coMang: boolean) => string): string[] {
  const out: string[] = [];
  const mat = dung(the({ dong: LEAD_DA_NHAN }), false);
  if (!/disabled=""/.test(nutGoi(mat))) out.push("mất mạng: «Gọi» còn bật");
  if (!mat.includes(LOI_CAN_MANG)) out.push("mất mạng: thiếu lời");
  const co = dung(the({ dong: LEAD_DA_NHAN }), true);
  if (!nutGoi(co)) out.push("có mạng: không có nút «Gọi»");
  if (/disabled=""/.test(nutGoi(co))) out.push("có mạng: «Gọi» tắt");
  if (co.includes(LOI_CAN_MANG)) out.push("có mạng: còn lời mất mạng");
  return out;
}
test("E6 mất mạng: «Gọi» tắt kèm «Cần mạng để mở số»; đối chứng dương có mạng: bật, không lời", () => {
  assert.deepEqual(lechMatMang(dungThe), []);
});
/**
 * Đường nối thật của màn (noiThe — cũng là đường của lưới máy tính qua noiViecCan/noiViecLead) với hàm ghi THEO DÕI có đúng mặt
 * hàm của màn: mỗi lời gọi ghi «hàm:dòng[:việc]». Bài kiểm không tự viết đường nối nào.
 */
type Can = { id: string; unitNumber: string | null };
type Lead = { id: string };
type DongNoi = { kind: "can"; can: Can } | { kind: "lead"; lead: Lead };
type HamNoi = typeof noiThe<Can, Lead>;
const CAN_C1: DongNoi = { kind: "can", can: { id: "c1", unitNumber: "A-01" } };
const CAN_CHUA_MA: DongNoi = { kind: "can", can: { id: "c2", unitNumber: null } };
const LEAD_L1: DongNoi = { kind: "lead", lead: { id: "l1" } };
const tenDong = (v: DongNoi) => (v.kind === "can" ? `căn ${v.can.id}` : `lead ${v.lead.id}`);
function noiTheoDoi(v: DongNoi, g: string[], noi: HamNoi = noiThe) {
  const hd: HanhDongNoi<Can, Lead> = {
    conGiuGia: (c) => void g.push(`conGiuGia:${c.id}`),
    moHoSo: (c) => void g.push(`moHoSo:${c.id}`),
    lead: (l, viec) => void g.push(`lead:${l.id}:${viec}`),
  };
  return noi(v, hd, { duongChuaMa: (id) => `/chua-ma/${id}`, diToi: (h) => void g.push(`di:${h}`) });
}

/** Bộ so chạm việc (9 ô viết trước): mỗi việc chạm đi đúng hàm của màn — «Còn · giữ giá» ghi xác nhận, «Gọi» gọi một chạm, «Trả lại» hỏi lại. */
type HamBam = typeof bamViec;
function lechBam(ham: HamBam, noi: HamNoi = noiThe): string[] {
  const MONG: [DongNoi, MaViecDT, string][] = [
    [CAN_C1, "con-giu-gia", "conGiuGia:c1"],
    [CAN_C1, "doi-gia-trang-thai", "moHoSo:c1"],
    [CAN_CHUA_MA, "doi-gia-trang-thai", "di:/chua-ma/c2"],
    [CAN_C1, "ghi-cuoc-goi", "di:/units/call?hang=c1"],
    [LEAD_L1, "nhan", "lead:l1:accept"],
    [LEAD_L1, "da-goi", "lead:l1:first_call"],
    [LEAD_L1, "goi", "goi"],
    [LEAD_L1, "tra-lai", "hoi"],
    [LEAD_L1, "ghi-cuoc-goi", "di:/units/call?lead=l1"],
  ];
  const out: string[] = [];
  for (const [v, m, mong] of MONG) {
    const g: string[] = [];
    const n = noiTheoDoi(v, g, noi);
    ham(m, { lam: n.lam, goi: () => void g.push("goi"), hoiTraLai: () => void g.push("hoi"), diToi: (h) => void g.push(`di:${h}`) });
    if (g.join() !== mong) out.push(`${tenDong(v)} · ${m}: ${g.join() || "không gọi gì"}`);
  }
  return out;
}
test("E6 chạm việc (9 ô viết trước) qua đường nối thật: «Còn · giữ giá» ghi xác nhận của căn, «Gọi» gọi một chạm, «Trả lại» hỏi lại", () => {
  assert.deepEqual(lechBam(bamViec), []);
});
test("E6 đối chứng đỏ: đường nối nhầm «Còn · giữ giá» sang mở hồ sơ → bộ so nêu ô", () => {
  const gia: HamNoi = (v, hd, d) => {
    const n = noiThe(v, hd, d);
    return { ...n, lam: (m) => n.lam(m === "con-giu-gia" ? "doi-gia-trang-thai" : m) };
  };
  assert.deepEqual(lechBam(bamViec, gia), ["căn c1 · con-giu-gia: moHoSo:c1"]);
});
test("E6 «Còn · giữ giá» không tắt khi mất mạng (ghi trên máy rồi gửi sau)", () => {
  const html = dungThe(the({ dong: { kind: "can", nhom: nhom("recent_change") } }), false);
  const nut = html.match(/<button[^>]*>Còn · giữ giá<\/button>/)?.[0] ?? "";
  assert.ok(nut, "có nút Còn · giữ giá");
  assert.doesNotMatch(nut, /disabled=""/);
});
test("E6 đối chứng đỏ: bản sao «Trả lại» ghi luôn không hỏi → bộ so nêu việc", () => {
  const gia: HamBam = (m, d) => (m === "tra-lai" ? void d.lam("tra-lai").onClick?.() : bamViec(m, d));
  assert.deepEqual(lechBam(gia), ["lead l1 · tra-lai: lead:l1:return"]);
});

test("E6 đối chứng đỏ: bản sao bỏ cờ mất mạng → bộ so nêu «Gọi» còn bật", () => {
  assert.deepEqual(lechMatMang((t) => dungThe(t, true)), ["mất mạng: «Gọi» còn bật", "mất mạng: thiếu lời"]);
});

// E5 — thân ngăn kết quả dựng thật: đúng bộ nút; chọn bằng hàm, theo dõi lời gọi.
const dongKetQua = (html: string) => [...html.matchAll(/data-ket-qua="([^"]+)"/g)].map((m) => m[1]);
test("E5 ngăn kết quả: lead · lead không trả lại · căn — đúng bộ dòng theo thứ tự, dòng chạm vai nút kín bề ngang", () => {
  const xong = () => {};
  const dung = (dong: ViecDong) => renderToStaticMarkup(createElement(KetQuaCuocGoi, { hoiTraLai: () => {}, t: the({ dong }), xong }));
  assert.deepEqual(dongKetQua(dung(LEAD_DA_NHAN)), ["da-goi", "tra-lai", "khong-nghe"]);
  const khongTra = { ...nhom("new_lead"), actions: ["accept", "first_call"] } as never;
  assert.deepEqual(dongKetQua(dung({ kind: "lead", nhom: khongTra, stage: "accepted" })), ["da-goi", "khong-nghe"]);
  const html = dung(CAN_GIA);
  assert.deepEqual(dongKetQua(html), ["con-giu-gia", "doi-gia-trang-thai", "khong-nghe"]);
  assert.equal((html.match(/role="button"/g) ?? []).length, 3);
  assert.ok(!/<button/.test(html), "dòng chạm là Item vai nút, không nút trần");
  // Kín bề ngang: dòng nằm trong nhóm xếp dọc (flex-col) nên giãn đủ bề ngang ngăn.
  assert.match(html, /<div[^>]*class="[^"]*flex-col[^"]*"[^>]*aria-label="Kết quả cuộc gọi"|<div[^>]*aria-label="Kết quả cuộc gọi"[^>]*class="[^"]*flex-col/);
  assert.ok(renderToStaticMarkup(createElement(KetQuaCuocGoi, { hoiTraLai: () => {}, t: the({ dong: LEAD_DA_NHAN }), xong })).includes(NHAN_TRA_LAI), "Trả lại kèm lý do như máy tính");
});

/** Bộ so chọn kết quả (5 ô viết trước) qua đường nối thật: đóng ngăn trước, rồi ghi đúng hàm của màn / hỏi / không gì. */
type HamChon = typeof chonKetQua;
function lechChon(ham: HamChon, noi: HamNoi = noiThe): string[] {
  const MONG: [DongNoi, MucKetQua, string][] = [
    [LEAD_L1, "khong-nghe", "xong"],
    [LEAD_L1, "da-goi", "xong,lead:l1:first_call"],
    [CAN_C1, "con-giu-gia", "xong,conGiuGia:c1"],
    [CAN_C1, "doi-gia-trang-thai", "xong,moHoSo:c1"],
    [LEAD_L1, "tra-lai", "xong,hoi"],
  ];
  const out: string[] = [];
  for (const [v, m, mong] of MONG) {
    const g: string[] = [];
    const n = noiTheoDoi(v, g, noi);
    ham(m, { ghiKetQua: n.ghiKetQua, hoiTraLai: () => void g.push("hoi"), xong: () => void g.push("xong") });
    if (g.join() !== mong) out.push(`${tenDong(v)} · ${m}: ${g.join()}`);
  }
  return out;
}
test("E5 chọn kết quả (5 ô viết trước): «Không nghe máy» không ghi gì, «Trả lại» hỏi lại, việc khác ghi đúng hàm của màn", () => {
  assert.deepEqual(lechChon(chonKetQua), []);
});
test("E5 «Trả lại» sau khi xác nhận ghi lead trả về (return) qua đường nối thật", () => {
  const g: string[] = [];
  noiTheoDoi(LEAD_L1, g).ghiKetQua("tra-lai");
  assert.deepEqual(g, ["lead:l1:return"]);
});
test("E5 đối chứng đỏ: bản sao «Không nghe máy» ghi «Đã gọi» → bộ so nêu dòng", () => {
  const gia: HamChon = (m, d) => (m === "khong-nghe" ? (d.xong(), d.ghiKetQua("da-goi")) : chonKetQua(m, d));
  assert.deepEqual(lechChon(gia), ["lead l1 · khong-nghe: xong,lead:l1:first_call"]);
});
test("E5 đối chứng đỏ: đường nối nhầm «Đã gọi» sang «Nhận» → bộ so nêu dòng", () => {
  const gia: HamNoi = (v, hd, d) => {
    const n = noiThe(v, hd, d);
    return { ...n, ghiKetQua: (m) => n.ghiKetQua(m === "da-goi" ? "nhan" : m) };
  };
  assert.deepEqual(lechChon(chonKetQua, gia), ["lead l1 · da-goi: xong,lead:l1:accept"]);
});

// E1 — danh sách thẻ dựng từ đúng mảng nhóm của lưới máy tính (dungNhomThe), thứ tự là thứ tự bộ nhóm của sàn.
const NHOM_LUOI = BO_NHOM_MAC_DINH.filter((n) => n.enabled).map((n) => ({
  nhom: n,
  viec: [n.subject === "lead" ? LEAD_DA_NHAN : ({ kind: "can", nhom: n } as ViecDong)],
}));
const theCua = (v: ViecDong) => the({ id: `x:${v.nhom.code}`, dong: v });
const dungDs = (nhomThe: readonly NhomThe[], trangThai: "dang" | "loi" | "co" = "co", trong: ReactNode = createElement(HetViec)) =>
  renderToStaticMarkup(createElement(DanhSachDienThoai, { trangThai, nhom: nhomThe, coMang: true, onThuLai: () => {}, trong, kho: null }));
const thuTuNhom = (html: string) => [...html.matchAll(/data-nhom-the="([^"]+)"/g)].map((m) => m[1]);
type HamDung = typeof dungNhomThe<{ kind: string } & ViecDong, TheDong, "primary-light">;
function lechThuTuNhom(ham: HamDung): string[] {
  const html = dungDs(ham(NHOM_LUOI, theCua, () => "primary-light") as NhomThe[]);
  const mong = NHOM_LUOI.map((g) => g.nhom.code);
  const co = thuTuNhom(html);
  const out = co.flatMap((ma, i) => (ma === mong[i] ? [] : [`vị trí ${i + 1}: ${ma} ≠ ${mong[i]}`]));
  if (/<table|data-slot="data-grid/.test(html)) out.push("có lưới");
  if ((html.match(/data-the-viec=/g) ?? []).length !== mong.length) out.push("số thẻ lệch");
  return out;
}
test("E1 danh sách thẻ: nhóm đúng thứ tự bộ nhóm như lưới máy tính, mỗi việc một thẻ, không có lưới", () => {
  assert.equal(NHOM_LUOI.length, 6);
  assert.deepEqual(lechThuTuNhom(dungNhomThe), []);
});
test("E1 đối chứng đỏ: bản sao xếp nhóm theo tên → bộ so nêu vị trí lệch", () => {
  const gia: HamDung = (n, t, b) => dungNhomThe([...n].sort((a, c) => a.nhom.label.localeCompare(c.nhom.label, "vi")), t, b);
  assert.ok(lechThuTuNhom(gia).length > 0);
});

// E7 — ba trạng thái.
test("E7 trạng thái: đang tải → khung chờ Tràn; trống → «Hôm nay không còn việc» với đúng một hành động; lỗi → «Thử lại»", () => {
  assert.match(dungDs([], "dang"), /data-cho-tai-kieu="tran"/);
  const trong = dungDs([], "co");
  assert.ok(trong.includes("Hôm nay không còn việc"));
  assert.equal((trong.match(/<a |<button/g) ?? []).length, 1, "đúng một hành động");
  assert.match(trong, /href="\/inventory"/);
  assert.match(dungDs([], "loi"), /Thử lại/);
  const co = dungDs(dungNhomThe(NHOM_LUOI, theCua, () => "primary-light") as NhomThe[]);
  assert.ok(!/data-cho-tai-kieu|Hôm nay không còn việc|Thử lại/.test(co), "đối chứng: có việc thì không trạng thái nào");
});

// ⋯ — việc còn lại cùng bộ với máy tính.
test("⋯ dựng việc còn lại: lead đã nhận có số → Đã gọi · Ghi cuộc gọi · Trả lại", () => {
  const html = renderToStaticMarkup(createElement(ViecKhac, { t: the({ dong: LEAD_DA_NHAN }), coMang: true, onGoi: () => {}, hoiTraLai: () => {}, xong: () => {} }));
  assert.deepEqual([...html.matchAll(/data-viec="([^"]+)"/g)].map((m) => m[1]), ["da-goi", "ghi-cuoc-goi", "tra-lai"]);
  assert.ok(html.includes(NHAN_TRA_LAI), "Trả lại kèm lý do như máy tính");
});
