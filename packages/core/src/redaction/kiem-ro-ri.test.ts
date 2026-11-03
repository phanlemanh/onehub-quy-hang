// E8 (hàng 31) — bộ quét văn bản bắt mồi ở mọi dạng mã hoá. Ma trận viết tay: 16 dạng × (có mồi, bỏ mồi). Văn bản mẫu
// là HTML có script, thuộc tính, chú thích như mã nguồn một trang; mồi đặt vào đúng chỗ dạng ấy hay gặp.
import assert from "node:assert/strict";
import { test } from "node:test";
import { timRoRi, type DangMaHoa, type GiaTriMoi, type RoRi } from ".";

const TEN = "[Tên] Chủ nhà mồi Ửng";
const TEN_AMP = "[Tên] Ửng & Đức";
const SO = "0900000073";
const TIEN = 9_876_543_211;

const trang = (o: { script?: string; thuocTinh?: string; chuThich?: string; than?: string }) =>
  `<!doctype html><html><head><script>self.__D=${o.script ?? "{}"}</script></head>` +
  `<body data-x="${o.thuocTinh ?? ""}"><!-- ${o.chuThich ?? ""} --><p>Tầng 12 · 2 PN · 74,5 m²</p><p>${o.than ?? ""}</p></body></html>`;

const thapPhan = (s: string) => [...s].map((c) => `&#${c.codePointAt(0)};`).join("");
const thapLucPhan = (s: string) => [...s].map((c) => `&#x${c.codePointAt(0)!.toString(16)};`).join("");
const jsonUnicode = (s: string) => [...s].map((c) => (c.charCodeAt(0) > 127 ? `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}` : c)).join("");

type O = { dang: DangMaHoa; moi: GiaTriMoi; vanBan: string; boMoi: string };
const chu = (giaTri: string): GiaTriMoi => ({ truong: "ownerName", giaTri, kieu: "chu" });
const so: GiaTriMoi = { truong: "ownerPhone", giaTri: SO, kieu: "so_dien_thoai" };
const tien: GiaTriMoi = { truong: "floorPrice", giaTri: TIEN, kieu: "so_tien" };

const MA_TRAN: O[] = [
  { dang: "nguyen_van", moi: chu(TEN), vanBan: trang({ than: TEN }), boMoi: trang({}) },
  { dang: "html_thap_phan", moi: chu(TEN), vanBan: trang({ thuocTinh: thapPhan(TEN) }), boMoi: trang({}) },
  { dang: "html_thap_luc_phan", moi: chu(TEN), vanBan: trang({ thuocTinh: thapLucPhan(TEN) }), boMoi: trang({}) },
  { dang: "html_co_ten", moi: chu(TEN_AMP), vanBan: trang({ than: TEN_AMP.replace("&", "&amp;") }), boMoi: trang({}) },
  { dang: "json_unicode", moi: chu(TEN), vanBan: trang({ script: `{"n":"${jsonUnicode(TEN)}"}` }), boMoi: trang({}) },
  { dang: "url", moi: chu(TEN), vanBan: trang({ thuocTinh: `/s/abc?ten=${encodeURIComponent(TEN)}` }), boMoi: trang({}) },
  { dang: "nfd", moi: chu(TEN), vanBan: trang({ chuThich: TEN.normalize("NFD") }), boMoi: trang({}) },
  { dang: "nfc", moi: chu(TEN.normalize("NFD")), vanBan: trang({ chuThich: TEN }), boMoi: trang({}) },
  { dang: "hoa_thuong", moi: chu(TEN), vanBan: trang({ than: TEN.toLocaleUpperCase("vi") }), boMoi: trang({}) },
  { dang: "so_lien", moi: so, vanBan: trang({ than: "0900000073" }), boMoi: trang({}) },
  { dang: "so_cach", moi: so, vanBan: trang({ than: "Gọi 0900 000 073" }), boMoi: trang({}) },
  { dang: "so_cham", moi: so, vanBan: trang({ than: "0900.000.073" }), boMoi: trang({}) },
  { dang: "so_gach", moi: so, vanBan: trang({ thuocTinh: "tel:0900-000-073" }), boMoi: trang({}) },
  { dang: "so_cong_84", moi: so, vanBan: trang({ than: "+84 900 000 073" }), boMoi: trang({}) },
  { dang: "so_84", moi: so, vanBan: trang({ script: '{"p":"84900000073"}' }), boMoi: trang({}) },
  { dang: "so_tien_ngan", moi: tien, vanBan: trang({ than: "Giá đáy 9.876.543.211 đ" }), boMoi: trang({}) },
];

/** Thước của E8 — trả lỗi nêu dạng; bộ quét thật → []. */
function kiemMaTran(tim: (vanBan: string, moi: readonly GiaTriMoi[]) => RoRi[]): string[] {
  const loi: string[] = [];
  for (const o of MA_TRAN) {
    const co = tim(o.vanBan, [o.moi]);
    if (co.length !== 1 || co[0]!.dang !== o.dang || co[0]!.truong !== o.moi.truong) {
      loi.push(`${o.dang}: có mồi → ${JSON.stringify(co)}`);
    }
    const khong = tim(o.boMoi, [o.moi]);
    if (khong.length !== 0) loi.push(`${o.dang}: bỏ mồi → ${JSON.stringify(khong)}`);
  }
  return loi;
}

test("E8 quét văn bản mọi dạng — 16 dạng × (có mồi, bỏ mồi)", () => {
  assert.equal(MA_TRAN.length, 16);
  assert.deepEqual(kiemMaTran(timRoRi), []);
});

test("E8 số ngắn không là mồi — văn bản có «12» không trúng", () => {
  assert.deepEqual(timRoRi(trang({ than: "Tầng 12, 2 PN" }), [so, tien, chu(TEN)]), []);
});

test("E8 chiều đỏ — bộ quét không giải thực thể HTML, bộ quét không đổi +84", () => {
  const khongGiaiThucThe = (t: string, m: readonly GiaTriMoi[]) => timRoRi(t.replace(/&#\d+;?/g, ""), m);
  assert.match(kiemMaTran(khongGiaiThucThe).join(" | "), /html_thap_phan: có mồi/);
  const khongDoi84 = (t: string, m: readonly GiaTriMoi[]) => timRoRi(t, m).filter((r) => r.dang !== "so_cong_84");
  assert.match(kiemMaTran(khongDoi84).join(" | "), /so_cong_84: có mồi/);
});
