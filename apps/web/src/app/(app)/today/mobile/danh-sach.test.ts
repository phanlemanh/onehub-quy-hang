// Hôm nay đầu chủ trên điện thoại (hàng 39: E1, E2, E5, E6, E7) — thẻ, ngăn và danh sách dựng thật bằng renderToStaticMarkup.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BO_NHOM_MAC_DINH } from "@quy-hang/core/today";
import type { MucHan, ViecDong } from "../viec-dong";
import { DanhSachDienThoai, KetQuaCuocGoi, LOI_CAN_MANG, TheViec, ViecKhac, type NhomThe, type TheDong } from "./danh-sach";

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
const dungThe = (t: TheDong, coMang = true) => renderToStaticMarkup(createElement(TheViec, { t, coMang, onGoi: () => {} }));
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
test("E6 «Còn · giữ giá» trên thẻ gọi hàm ghi của dòng cả khi mất mạng (nút không tắt)", () => {
  const html = dungThe(the({ dong: { kind: "can", nhom: nhom("recent_change") } }), false);
  const nut = html.match(/<button[^>]*>Còn · giữ giá<\/button>/)?.[0] ?? "";
  assert.ok(nut, "có nút Còn · giữ giá");
  assert.doesNotMatch(nut, /disabled=""/);
});
test("E6 đối chứng đỏ: bản sao bỏ cờ mất mạng → bộ so nêu «Gọi» còn bật", () => {
  assert.deepEqual(lechMatMang((t) => dungThe(t, true)), ["mất mạng: «Gọi» còn bật", "mất mạng: thiếu lời"]);
});

// E5 — thân ngăn kết quả dựng thật: đúng bộ nút, «Không nghe máy» không ghi.
const dongKetQua = (html: string) => [...html.matchAll(/data-ket-qua="([^"]+)"/g)].map((m) => m[1]);
test("E5 ngăn kết quả: lead · lead không trả lại · căn — đúng bộ dòng theo thứ tự, dòng kín bề ngang", () => {
  const xong = () => {};
  assert.deepEqual(dongKetQua(renderToStaticMarkup(createElement(KetQuaCuocGoi, { t: the({ dong: LEAD_DA_NHAN }), xong }))), ["da-goi", "tra-lai", "khong-nghe"]);
  const khongTra = { ...nhom("new_lead"), actions: ["accept", "first_call"] } as never;
  assert.deepEqual(dongKetQua(renderToStaticMarkup(createElement(KetQuaCuocGoi, { t: the({ dong: { kind: "lead", nhom: khongTra, stage: "accepted" } }), xong }))), ["da-goi", "khong-nghe"]);
  const html = renderToStaticMarkup(createElement(KetQuaCuocGoi, { t: the({ dong: CAN_GIA }), xong }));
  assert.deepEqual(dongKetQua(html), ["con-giu-gia", "doi-gia-trang-thai", "khong-nghe"]);
  assert.match(html, /role="button"/);
  assert.ok(!/<button/.test(html), "dòng chạm là Item vai nút, không nút trần");
});

// E1 — danh sách thẻ dựng thật: thứ tự nhóm, không lưới.
const NHOM5: NhomThe[] = ["new_lead", "price_adjustment", "call_back", "missing_info", "recent_change"].map((ma) => ({
  ma,
  nhan: nhom(ma).label,
  badge: "primary-light",
  the: [the({ id: `x:${ma}`, dong: ma === "new_lead" ? LEAD_DA_NHAN : { kind: "can", nhom: nhom(ma) } })],
}));
const dungDs = (nhomThe: readonly NhomThe[], trangThai: "dang" | "loi" | "co" = "co") =>
  renderToStaticMarkup(createElement(DanhSachDienThoai, { trangThai, nhom: nhomThe, coMang: true, onThuLai: () => {}, trong: createElement("p", null, "TRONG"), kho: null }));
const thuTuNhom = (html: string) => [...html.matchAll(/data-nhom-the="([^"]+)"/g)].map((m) => m[1]);

test("E1 danh sách thẻ: 5 nhóm đúng thứ tự của bộ nhóm, không có lưới", () => {
  const html = dungDs(NHOM5);
  assert.deepEqual(thuTuNhom(html), NHOM5.map((g) => g.ma));
  assert.ok(!/<table|role="grid"|data-slot="data-grid/.test(html), "không dựng lưới");
  assert.equal((html.match(/data-the-viec=/g) ?? []).length, 5);
});
test("E1 đối chứng đỏ: bản sao đảo hai nhóm → bộ so nêu nhóm lệch", () => {
  const dao = [NHOM5[1], NHOM5[0], ...NHOM5.slice(2)] as NhomThe[];
  const lech = thuTuNhom(dungDs(dao)).filter((ma, i) => ma !== NHOM5[i]?.ma);
  assert.deepEqual(lech, ["price_adjustment", "new_lead"]);
});

// E7 — ba trạng thái.
test("E7 trạng thái: đang tải → khung chờ; trống → nội dung trống; lỗi → «Thử lại»; có việc → không trạng thái nào", () => {
  assert.match(dungDs([], "dang"), /data-cho-tai-kieu="tran"/);
  assert.match(dungDs([], "co"), /TRONG/);
  assert.match(dungDs([], "loi"), /Thử lại/);
  const co = dungDs(NHOM5);
  assert.ok(!/data-cho-tai-kieu|TRONG|Thử lại/.test(co));
});

// ⋯ — việc còn lại cùng bộ với máy tính.
test("⋯ dựng việc còn lại: lead đã nhận có số → Đã gọi · Ghi cuộc gọi · Trả lại", () => {
  const html = renderToStaticMarkup(createElement(ViecKhac, { t: the({ dong: LEAD_DA_NHAN }), coMang: true, onGoi: () => {}, xong: () => {} }));
  assert.deepEqual([...html.matchAll(/data-viec="([^"]+)"/g)].map((m) => m[1]), ["da-goi", "ghi-cuoc-goi", "tra-lai"]);
});
