// Hôm nay đầu chủ trên điện thoại (hàng 39: E1, E2, E5, E6, E7) — thẻ, ngăn và danh sách dựng thật bằng renderToStaticMarkup.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BO_NHOM_MAC_DINH } from "@quy-hang/core/today";
import type { MucHan, ViecDong } from "../viec-dong";
import type { MaViecDT, MucKetQua } from "./goi";
import { DanhSachDienThoai, KetQuaCuocGoi, LOI_CAN_MANG, NHAN_TRA_LAI, TheViec, ViecKhac, type NhomThe, type TheDong } from "./danh-sach";
import { bamViec, chonKetQua, dungNhomThe } from "./hanh-dong";
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
/** Bộ so chạm việc: mỗi việc chạm đi đúng đường của máy tính — «Còn · giữ giá» gọi hàm ghi của dòng (ghi trên máy, không chờ mạng). */
type HamBam = typeof bamViec;
function lechBam(ham: HamBam): string[] {
  const out: string[] = [];
  const MONG: [MaViecDT, string][] = [
    ["con-giu-gia", "lam:con-giu-gia"],
    ["da-goi", "lam:da-goi"],
    ["goi", "goi"],
    ["tra-lai", "hoi"],
    ["ghi-cuoc-goi", "di:/units/call?lead=l1"],
  ];
  for (const [m, mong] of MONG) {
    const g: string[] = [];
    ham(m, {
      lam: (x) => (x === "ghi-cuoc-goi" ? { href: "/units/call?lead=l1" } : { onClick: () => void g.push(`lam:${x}`) }),
      goi: () => void g.push("goi"),
      hoiTraLai: () => void g.push("hoi"),
      diToi: (h) => void g.push(`di:${h}`),
    });
    if (g.join() !== mong) out.push(`${m}: ${g.join() || "không gọi gì"}`);
  }
  return out;
}
test("E6 chạm việc (5 việc viết trước): «Còn · giữ giá» gọi hàm ghi của dòng, «Gọi» gọi một chạm, «Trả lại» hỏi lại", () => {
  assert.deepEqual(lechBam(bamViec), []);
});
test("E6 «Còn · giữ giá» không tắt khi mất mạng (ghi trên máy rồi gửi sau)", () => {
  const html = dungThe(the({ dong: { kind: "can", nhom: nhom("recent_change") } }), false);
  const nut = html.match(/<button[^>]*>Còn · giữ giá<\/button>/)?.[0] ?? "";
  assert.ok(nut, "có nút Còn · giữ giá");
  assert.doesNotMatch(nut, /disabled=""/);
});
test("E6 đối chứng đỏ: bản sao «Trả lại» ghi luôn không hỏi → bộ so nêu việc", () => {
  const gia: HamBam = (m, d) => (m === "tra-lai" ? void d.lam("tra-lai").onClick?.() : bamViec(m, d));
  assert.deepEqual(lechBam(gia), ["tra-lai: lam:tra-lai"]);
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

/** Bộ so chọn kết quả: ma trận 5 kết quả viết trước → lời gọi mong (đóng ngăn trước, rồi ghi / hỏi / không gì). */
type HamChon = typeof chonKetQua;
function lechChon(ham: HamChon): string[] {
  const MONG: [MucKetQua, string][] = [
    ["khong-nghe", "xong"],
    ["da-goi", "xong,ghi:da-goi"],
    ["con-giu-gia", "xong,ghi:con-giu-gia"],
    ["doi-gia-trang-thai", "xong,ghi:doi-gia-trang-thai"],
    ["tra-lai", "xong,hoi"],
  ];
  const out: string[] = [];
  for (const [m, mong] of MONG) {
    const g: string[] = [];
    ham(m, { ghiKetQua: (x) => void g.push(`ghi:${x}`), hoiTraLai: () => void g.push("hoi"), xong: () => void g.push("xong") });
    if (g.join() !== mong) out.push(`${m}: ${g.join()}`);
  }
  return out;
}
test("E5 chọn kết quả (5 dòng viết trước): «Không nghe máy» không ghi gì, «Trả lại» hỏi lại, việc khác ghi đúng hàm", () => {
  assert.deepEqual(lechChon(chonKetQua), []);
});
test("E5 đối chứng đỏ: bản sao «Không nghe máy» ghi «Đã gọi» → bộ so nêu dòng", () => {
  const gia: HamChon = (m, d) => (m === "khong-nghe" ? (d.xong(), d.ghiKetQua("da-goi")) : chonKetQua(m, d));
  assert.deepEqual(lechChon(gia), ["khong-nghe: xong,ghi:da-goi"]);
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
  assert.equal(NHOM_LUOI.length, 5);
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
