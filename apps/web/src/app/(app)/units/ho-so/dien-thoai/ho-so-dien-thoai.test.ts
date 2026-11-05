// Hồ sơ căn trên điện thoại (hồ sơ ho-so-dien-thoai-product-detail-5: E1–E6). Hai thân dựng thật bằng renderToStaticMarkup từ
// CÙNG mô hình (`moHinhHoSo`) mà `HoSoCan` dùng; rẽ khổ gọi đúng `chonThan` mà hồ sơ gọi. Mỗi phép đo là một bộ so trả danh
// sách lệch; ma trận viết trước; cặp hai chiều trên cùng dữ liệu: vật lành → [], bản sao hỏng → lời lệch ghim bằng deepEqual.
// Dữ liệu mẫu: [Mẫu] Toà A, A-01.02, số 0900 000 092 — không dữ liệu cá nhân thật.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type { CatalogData } from "@quy-hang/core";
import { lopPhuHoSo } from "@quy-hang/core/access";
import type { ListingEvent } from "@quy-hang/core/listing";
import type { UnitPhoto } from "@quy-hang/core/photos";
import type { LanThu, ListingView } from "@/lib/sync/types";
import { dinhDangGia } from "../../../inventory/cot";
import type { DanhSachAnh } from "../../photos/muc-anh";
import { chonThan, luc, moHinhHoSo, nutChinh, type ChoHoSo, type HoSoCo, type MoHinhHoSo, type NutChinh, type Than, type VaoHoSo } from "../mo-hinh";
import { ThanCot, type KheHoSo } from "../than-cot";
import { CHU_CHUA_ANH, type TrangThaiAnh } from "./anh-lon";
import { ThanDienThoai } from "./than-dien-thoai";

// ——— Dữ liệu mẫu ———

const TOA = "[Mẫu] Toà A";
const MA = "A-01.02";
const SO_CHU = "0900 000 092";
const TEN_CHU = "[Mẫu] Chủ nhà A";
const GIA_DAY = 2_900_000_000;

const DANH_MUC: CatalogData = {
  subdivisions: [
    {
      subdivisionKey: "khu-mau",
      subdivisionName: "[Mẫu] Khu A",
      complexName: null,
      buildings: [
        {
          buildingKey: "toa-a",
          buildingName: TOA,
          units: [
            { upi: "urn:mau:A-01.02", unitNumber: MA, stack: "02", floor: 1, livingArea: 68.5, bedroomsTotal: 2, directionFaces: "Đông Bắc", propertyType: "Residential", propertySubType: "Condominium" },
          ],
        },
      ],
    },
  ],
};

// Mồi nguồn đặt thẳng vào bản ghi: thân không được trình khoá nào ngoài khoá nó biết (bất biến 2, 4).
const HANG = {
  id: "hang-1",
  buildingName: TOA,
  unitNumber: MA,
  standardStatus: "Active",
  listPrice: 3_250_000_000,
  feeInclusion: "included",
  furnished: "Cơ bản",
  legalStatus: "Sổ hồng",
  financing: null,
  occupantType: "Đang trống",
  closePrice: null,
  closeDate: null,
  withdrawnReason: null,
  lastConfirmedAt: "2026-11-02T02:00:00Z",
  voided: false,
  version: 5,
  listAgentKey: "u-chu",
  freshness: { confirmed: true, ageDays: 3 },
  ownerPhone: SO_CHU,
  ownerName: TEN_CHU,
  floorPrice: GIA_DAY,
} as ListingView;
const CHUA_MA = { ...HANG, id: "hang-2", unitNumber: null, listAgentKey: "u-chu" } as ListingView;

const su = (seq: number, type: ListingEvent["type"], payload: Record<string, unknown>, luc_: string): ListingEvent => ({
  seq,
  type,
  payload,
  actorUserId: "u-chu",
  actorRoles: ["listing_agent"],
  confirmedWithOwner: type === "owner_confirmed",
  occurredAt: luc_,
});
const LICH_SU: ListingEvent[] = [
  su(1, "created", { buildingName: TOA, unitNumber: MA }, "2026-10-01T02:00:00Z"),
  su(2, "price_changed", { listPrice: 3_400_000_000 }, "2026-10-05T02:00:00Z"),
  su(3, "status_changed", { to: "Active" }, "2026-10-06T02:00:00Z"),
  su(4, "price_changed", { listPrice: 3_250_000_000 }, "2026-10-20T02:00:00Z"),
  su(5, "owner_confirmed", {}, "2026-11-02T02:00:00Z"),
];

const anh = (id: string, compartment: UnitPhoto["compartment"], displayOrder: number): UnitPhoto => ({
  id,
  buildingName: TOA,
  unitNumber: MA,
  compartment,
  displayOrder,
  isCover: displayOrder === 0 && compartment === "shareable",
  isSample: false,
  takenAt: "2026-10-01",
  addedAt: "2026-10-01T02:00:00Z",
  contentType: "image/jpeg",
  width: 1600,
  height: 1200,
});
// Ảnh sổ của ngăn Nội bộ mang mồi số chủ trong mã ảnh: ngăn ấy lộ ra là mồi lộ ra. Cùng một danh sách cho mọi vai — để đo
// đúng cờ của lõi, không đo việc API đã bỏ ngăn.
const ANH: DanhSachAnh = { anh: [anh("anh-phong-khach", "shareable", 0), anh("anh-bep", "shareable", 1), anh("anh-ban-cong", "shareable", 2), anh("anh-so-0900000092", "internal", 0)], noiBo: "thay", suaDuoc: true };
const CO_ANH: TrangThaiAnh = { kind: "co", ds: ANH };
const urlAnh = (id: string) => `/api/v1/units/photos/${id}/original`;

type Vai = "khach" | "chu" | "truong";
const NGUOI: Record<Vai, { nguoi: string; vai: string[] }> = {
  khach: { nguoi: "u-khach", vai: ["buyer_agent"] },
  chu: { nguoi: "u-chu", vai: ["listing_agent"] },
  truong: { nguoi: "u-truong", vai: ["team_lead"] },
};
const TEN_VAI: Record<Vai, string> = { khach: "không thấy nguồn", chu: "thấy nguồn giữ căn", truong: "thấy nguồn không giữ" };
type Cho = Extract<ChoHoSo, "toan-man" | "bang-the">;
const TEN_CHO: Record<Cho, string> = { "toan-man": "toàn màn", "bang-the": "trong Bảng hàng thẻ" };

const duong = (c: { ma: string; toa: string | null; lan: string | null }) => `/inventory?${new URLSearchParams({ unit: c.ma, ...(c.toa ? { toa: c.toa } : {}), ...(c.lan ? { lan: c.lan } : {}) })}`;

function vao(vai: Vai, cho: Cho, sua: Omit<Partial<VaoHoSo>, "ngan"> & { ngan?: Partial<VaoHoSo["ngan"]> } = {}): VaoHoSo {
  const { ngan, ...con } = sua;
  return {
    ...NGUOI[vai],
    ds: [HANG, CHUA_MA],
    ngan: { listings: [HANG, CHUA_MA], history: { "hang-1": LICH_SU }, lastAttempt: "ok" as LanThu, lastPullAt: "2026-11-05T02:12:00Z", ...ngan },
    danhMuc: DANH_MUC,
    chon: { ma: MA, toa: TOA, lan: null },
    daKeo: { "hang-1": true },
    thieuCua: null,
    ngoaiTuyen: false,
    dongHref: cho === "bang-the" ? "/inventory" : undefined,
    duong,
    ...con,
  };
}

const KHE: KheHoSo = { sanSang: createElement("span", { "data-khe": "san-sang" }), oMa: createElement("span", { "data-khe": "o-ma" }, "Ô gắn mã căn") };
const HD = { thuNgay: () => {}, taiLichSu: () => {} };
type DungThan = (m: MoHinhHoSo, anh?: TrangThaiAnh) => string;
const dungCot: DungThan = (m) => renderToStaticMarkup(createElement(ThanCot, { m, khe: KHE, hd: HD }));
const dungDT: DungThan = (m, a = CO_ANH) => renderToStaticMarkup(createElement(ThanDienThoai, { m, khe: KHE, hd: HD, anh: a, urlAnh }));
const coCan = (m: MoHinhHoSo): HoSoCo => {
  assert.equal(m.kind, "co");
  return m as HoSoCo;
};

// ——— E1 — rẽ khổ: 5 khổ × 2 chỗ = 10 ô viết trước ———

type HamThan = (w: { innerWidth: number }, cho: ChoHoSo) => Than;
const MA_TRAN_KHO: [number, Cho, Than][] = [
  [375, "toan-man", "dien-thoai"],
  [375, "bang-the", "dien-thoai"],
  [390, "toan-man", "dien-thoai"],
  [390, "bang-the", "dien-thoai"],
  [767, "toan-man", "dien-thoai"],
  [767, "bang-the", "dien-thoai"],
  [768, "toan-man", "cot"],
  [768, "bang-the", "cot"],
  [1440, "toan-man", "cot"],
  [1440, "bang-the", "cot"],
];
function lechKho(ham: HamThan): string[] {
  const out: string[] = [];
  for (const [w, cho, mong] of MA_TRAN_KHO) {
    const than = ham({ innerWidth: w }, cho);
    if (than !== mong) out.push(`${w}px · ${TEN_CHO[cho]}: ${than}`);
  }
  // Hai chỗ chỉ có trên máy tính giữ thân cột ở mọi khổ.
  for (const cho of ["canh-bang", "cot-hom-nay"] as const) for (const w of [375, 1440]) if (ham({ innerWidth: w }, cho) !== "cot") out.push(`${w}px · ${cho}: không phải thân cột`);
  return out;
}

test("E1 rẽ khổ qua hàm khổ của kho: 5 khổ × 2 chỗ chọn đúng thân", () => {
  assert.equal(MA_TRAN_KHO.length, 10);
  assert.deepEqual(lechKho(chonThan), []);
  // Hồ sơ gọi đúng hàm này, nghe đổi khổ bằng ngheKho của Hôm nay điện thoại, không viết mốc riêng.
  const ma = readFileSync(fileURLToPath(new URL("../cot-ho-so.tsx", import.meta.url)), "utf8");
  assert.match(ma, /chonThan\(window, cho\)/);
  assert.match(ma, /ngheKho\(window, f\)/);
  assert.doesNotMatch(ma, /\b(767|768|1024)\b/, "cot-ho-so.tsx không được mang mốc khổ riêng");
});

test("E1 chiều đỏ: bản sao hàm chọn thân dùng mốc 1024 → bộ so nêu đúng ô 768px", () => {
  const sai: HamThan = (w, cho) => (cho === "canh-bang" || cho === "cot-hom-nay" ? "cot" : w.innerWidth < 1024 ? "dien-thoai" : "cot");
  assert.deepEqual(lechKho(sai), ["768px · toàn màn: dien-thoai", "768px · trong Bảng hàng thẻ: dien-thoai"]);
});

// ——— E2 — thứ tự khối, thông số, ảnh có điểm dừng ———

const khoiCua = (html: string) => [...html.matchAll(/data-khoi="([^"]+)"/g)].map((x) => x[1]!);
function lechThuTu(html: string): string[] {
  const k = khoiCua(html);
  const dau = ["anh", "ten", "gia"];
  const out: string[] = [];
  dau.forEach((mong, i) => {
    if (k[i] !== mong) out.push(`vị trí ${i + 1}: ${k[i] ?? "thiếu"} (cần ${mong})`);
  });
  const sau = k.slice(3);
  if (sau.length === 0) out.push("không có mục nào sau hộp giá");
  sau.forEach((x, i) => {
    if (x !== "muc") out.push(`vị trí ${i + 4}: ${x} (cần muc)`);
  });
  return out;
}
const thongSoCua = (html: string) => {
  const dl = html.match(/<dl[^>]*data-muc="thong-so"[^>]*>(.*?)<\/dl>/s)?.[1] ?? "";
  return [...dl.matchAll(/<dt[^>]*>(.*?)<\/dt><dd[^>]*>(.*?)<\/dd>/g)].map((x) => [x[1], x[2]]);
};

test("E2 thân điện thoại: ảnh → tên → giá → các mục; thông số Diện tích · Phòng ngủ · Hướng; ảnh lướt ngang có điểm dừng", () => {
  const html = dungDT(moHinhHoSo(vao("khach", "toan-man")));
  assert.deepEqual(lechThuTu(html), []);
  assert.deepEqual(khoiCua(html), ["anh", "ten", "gia", "muc", "muc", "muc", "muc", "muc"]);
  assert.deepEqual(thongSoCua(html), [
    ["Diện tích", "68,5 m²"],
    ["Phòng ngủ", "2"],
    ["Hướng", "Đông Bắc"],
  ]);
  const khung = html.match(/<div class="([^"]*)" aria-label="Ảnh căn, lướt ngang" data-khoi="anh">/)?.[1] ?? "";
  for (const lop of ["snap-x", "snap-mandatory", "overflow-x-auto"]) assert.ok(khung.split(" ").includes(lop), `khung ảnh thiếu ${lop}`);
  const o = [...html.matchAll(/<figure class="([^"]*)"/g)].map((x) => x[1]!.split(" "));
  assert.equal(o.length, 3, "ba ảnh Gửi được, mỗi ảnh một ô");
  for (const l of o) for (const lop of ["snap-center", "w-full", "shrink-0"]) assert.ok(l.includes(lop), `ô ảnh thiếu ${lop}`);
  assert.match(html, /<h2[^>]*>A-01\.02 · \[Mẫu\] Toà A<\/h2>/);
  assert.match(html, /3,25 tỷ/);
  assert.match(html, /Xác nhận 3 ngày trước/);
});

test("E2 chiều đỏ: bản sao đặt hộp giá trước ảnh → bộ so nêu vị trí lệch", () => {
  const html = dungDT(moHinhHoSo(vao("khach", "toan-man")));
  const dao = html.replace('data-khoi="anh"', "data-khoi=\"__\"").replace('data-khoi="gia"', 'data-khoi="anh"').replace('data-khoi="__"', 'data-khoi="gia"');
  assert.deepEqual(lechThuTu(dao), ["vị trí 1: gia (cần anh)", "vị trí 3: anh (cần gia)"]);
});

// ——— E3 — không mất mục: 10 mục × 3 vai × 2 chỗ = 60 ô viết trước ———

const MUC = ["muc-du", "thuoc-tinh", "chu-khoa", "bao-sai", "lan-rao", "cac-lan-rao", "lich-su", "anh", "mo-toan-man", "dong-ho-so"] as const;
type Muc = (typeof MUC)[number];
const TEN_MUC: Record<Muc, string> = {
  "muc-du": "mức đủ",
  "thuoc-tinh": "thuộc tính",
  "chu-khoa": "chữ khoá",
  "bao-sai": "báo sai",
  "lan-rao": "lần rao",
  "cac-lan-rao": "các lần rao",
  "lich-su": "lịch sử",
  anh: "ảnh",
  "mo-toan-man": "mở toàn màn",
  "dong-ho-so": "đóng hồ sơ",
};
// Bảng viết trước: mục ấy CÓ (1) hay KHÔNG (0) ở thân cột hôm nay, theo thứ tự MUC.
const BANG: Record<Cho, Record<Vai, readonly (0 | 1)[]>> = {
  "toan-man": {
    khach: [1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    chu: [1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    truong: [1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  },
  "bang-the": {
    khach: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    chu: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    truong: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
};
const mucCua = (html: string) => new Set([...html.matchAll(/data-muc="([^"]+)"/g)].map((x) => x[1]!));

function lechMuc(dungDienThoai: (m: MoHinhHoSo, cho: Cho) => string): { lech: string[]; soCo: number } {
  const lech: string[] = [];
  let soCo = 0;
  let o = 0;
  for (const cho of ["toan-man", "bang-the"] as const)
    for (const vai of ["khach", "chu", "truong"] as const) {
      const m = moHinhHoSo(vao(vai, cho));
      const cot = mucCua(dungCot(m));
      const dt = mucCua(dungDienThoai(m, cho));
      MUC.forEach((muc, i) => {
        o++;
        const mong = BANG[cho][vai][i] === 1;
        const ten = `${TEN_CHO[cho]} · ${TEN_VAI[vai]} · ${TEN_MUC[muc]}`;
        // Đối chứng dương: thân cột dựng thật đúng như bảng.
        if (cot.has(muc) !== mong) lech.push(`${ten}: thân cột ${cot.has(muc) ? "có" : "không có"}`);
        if (mong) soCo++;
        if (dt.has(muc) !== mong) lech.push(ten);
      });
    }
  assert.equal(o, 60, "ma trận phải đủ 60 ô");
  return { lech, soCo };
}

test("E3 không mất mục: 60 ô viết trước, thân cột đúng bảng (đối chứng dương), thân điện thoại đúng mục ấy", () => {
  const { lech, soCo } = lechMuc((m) => dungDT(m));
  assert.deepEqual(lech, []);
  assert.equal(soCo, 54, "tập mục CÓ không rỗng");
});

test("E3 căn chưa có mã: hai thân có ô gắn mã, không chữ khoá, không nút chính", () => {
  for (const dung of [dungCot, dungDT]) {
    const m = moHinhHoSo(vao("chu", "bang-the", { chon: { ma: "", toa: null, lan: "hang-2" }, chuaMa: CHUA_MA }));
    const html = dung(m, { kind: "chua-ma" });
    const muc = mucCua(html);
    assert.ok(muc.has("o-ma") && html.includes('data-khe="o-ma"'), "có ô gắn mã");
    assert.ok(!muc.has("chu-khoa") && !muc.has("mo-toan-man"));
    assert.ok(!/data-slot="(hoi-dau-chu|ghi-cuoc-goi)"/.test(html), "căn chưa mã không có nút chính");
  }
});

test("E3 chiều đỏ: bản sao thân điện thoại bỏ «Đóng hồ sơ» ở chỗ Bảng hàng thẻ → bộ so nêu đúng ô", () => {
  const boDong = (m: MoHinhHoSo, cho: Cho) => dungDT(cho === "bang-the" && m.kind === "co" ? { ...m, dongHref: null } : m);
  assert.deepEqual(lechMuc(boDong).lech, [
    "trong Bảng hàng thẻ · không thấy nguồn · đóng hồ sơ",
    "trong Bảng hàng thẻ · thấy nguồn giữ căn · đóng hồ sơ",
    "trong Bảng hàng thẻ · thấy nguồn không giữ · đóng hồ sơ",
  ]);
});

// ——— E4 — người không thấy nguồn: không Nội bộ, không ổ khoá, không mồi ———

const MOI = ["Nội bộ", "lucide-lock", SO_CHU, SO_CHU.replace(/ /g, ""), TEN_CHU, dinhDangGia(GIA_DAY), "Giá đáy", "giá đáy"];
const moiLo = (html: string) => MOI.filter((x) => html.includes(x));

test("E4 đầu khách: cờ từ lopPhuHoSo thật, thân điện thoại không Nội bộ, ổ khoá, số chủ, tên chủ, giá đáy", () => {
  const m = coCan(moHinhHoSo(vao("khach", "toan-man")));
  assert.deepEqual(m.co, lopPhuHoSo({ userId: "u-khach", roles: ["buyer_agent"] }, "u-chu"));
  assert.equal(m.co.noiBo, false);
  assert.deepEqual(moiLo(dungDT(m)), []);
  // Đối chứng dương: cùng dữ liệu cho người thấy nguồn thì có ngăn Nội bộ (và ổ khoá).
  const chu = coCan(moHinhHoSo(vao("chu", "toan-man")));
  assert.equal(chu.co.noiBo, true);
  const htmlChu = dungDT(chu);
  assert.ok(htmlChu.includes("Nội bộ") && htmlChu.includes("lucide-lock"), "người giữ căn thấy ngăn Nội bộ");
});

test("E4 đối chứng dương của bộ dò: bản sao thân trình thẳng trường nguồn của căn mẫu → bộ dò bắt đủ số chủ, tên chủ, giá đáy", () => {
  // Cùng căn mẫu, cùng vai đầu khách: bản sao hỏng chèn nguyên văn ba trường nguồn (như một đường đọc chưa qua luật ẩn).
  const m = coCan(moHinhHoSo(vao("khach", "toan-man")));
  const ro = (html: string) => `${html}<p>${SO_CHU}</p><p>${TEN_CHU}</p><p>Giá đáy ${dinhDangGia(GIA_DAY)}</p>`;
  assert.deepEqual(moiLo(ro(dungDT(m))), [SO_CHU, TEN_CHU, dinhDangGia(GIA_DAY), "Giá đáy"]);
});

test("E4 chiều đỏ: bản sao bỏ qua cờ noiBo → bộ so nêu mồi lộ ra", () => {
  const m = coCan(moHinhHoSo(vao("khach", "toan-man")));
  assert.deepEqual(moiLo(dungDT({ ...m, co: { ...m.co, noiBo: true } })), ["Nội bộ", "lucide-lock", "0900000092"]);
});

// ——— E5 — nút chính dính đáy: 4 ca viết trước ———

type HamNut = typeof nutChinh;
type CaNut = { ten: string; vai: Vai; chuaMa: boolean; mong: NutChinh };
const CA_NUT: CaNut[] = [
  { ten: "không thấy nguồn", vai: "khach", chuaMa: false, mong: { kind: "hoi-dau-chu" } },
  { ten: "thấy nguồn giữ căn", vai: "chu", chuaMa: false, mong: { kind: "ghi-cuoc-goi", href: "/units/call?hang=hang-1" } },
  { ten: "thấy nguồn không giữ", vai: "truong", chuaMa: false, mong: { kind: "ghi-cuoc-goi", href: "/units/call?hang=hang-1" } },
  { ten: "căn chưa có mã", vai: "khach", chuaMa: true, mong: null },
];
function lechNut(ham: HamNut): string[] {
  const out: string[] = [];
  for (const c of CA_NUT) {
    const m = coCan(moHinhHoSo(vao(c.vai, "toan-man", c.chuaMa ? { chon: { ma: "", toa: null, lan: "hang-2" }, chuaMa: CHUA_MA } : {})));
    const nut = ham({ co: m.co, chuaMa: m.chuaMa !== null, canId: m.can.id });
    if (JSON.stringify(nut) !== JSON.stringify(c.mong)) out.push(`${c.ten}: ${nut ? nut.kind : "không nút"}`);
  }
  return out;
}

test("E5 nút chính theo cờ (4 ca viết trước): hỏi đầu chủ · ghi cuộc gọi · ghi cuộc gọi · không nút", () => {
  assert.deepEqual(lechNut(nutChinh), []);
});

test("E5 nút dựng thật: đúng một nút dính đáy, kín bề ngang, cao 44 px; hỏi đầu chủ chỉ mở bảng chia sẻ", () => {
  const nutCua = (html: string) => [...html.matchAll(/<div class="([^"]*)" data-slot="(hoi-dau-chu|ghi-cuoc-goi)">(.*?)<\/div>/gs)];
  for (const c of CA_NUT) {
    const m = moHinhHoSo(vao(c.vai, "toan-man", c.chuaMa ? { chon: { ma: "", toa: null, lan: "hang-2" }, chuaMa: CHUA_MA } : {}));
    const ds = nutCua(dungDT(m, c.chuaMa ? { kind: "chua-ma" } : CO_ANH));
    assert.equal(ds.length, c.mong ? 1 : 0, c.ten);
    if (!c.mong) continue;
    const [, lopKhung, slot, trong] = ds[0]!;
    assert.equal(slot, c.mong.kind, c.ten);
    for (const lop of ["sticky", "bottom-0"]) assert.ok(lopKhung!.split(" ").includes(lop), `${c.ten}: khung thiếu ${lop}`);
    const lopNut = trong!.match(/class="([^"]*)"/)?.[1]?.split(" ") ?? [];
    for (const lop of ["w-full", "h-11"]) assert.ok(lopNut.includes(lop), `${c.ten}: nút thiếu ${lop}`);
    if (c.mong.kind === "ghi-cuoc-goi") assert.match(trong!, /href="\/units\/call\?hang=hang-1"[^>]*>.*Ghi cuộc gọi/s);
    else assert.ok(!/href=/.test(trong!) && /Hỏi đầu chủ/.test(trong!), "nút hỏi là nút, không phải liên kết gửi");
  }
  // Nút hỏi chỉ mở bảng chia sẻ hay chép (bất biến 3): mã nút không gọi mạng khi chạm.
  const ma = readFileSync(fileURLToPath(new URL("../nut-hoi-dau-chu.tsx", import.meta.url)), "utf8");
  const cham = ma.slice(ma.indexOf("const cham"), ma.indexOf("return (", ma.indexOf("const cham")));
  assert.match(cham, /moHoi\(/);
  assert.doesNotMatch(cham, /fetch\(/);
});

test("E5 chiều đỏ: bản sao luôn trả «Ghi cuộc gọi» → ô nêu vai", () => {
  const sai: HamNut = (o) => ({ kind: "ghi-cuoc-goi", href: `/units/call?hang=${o.canId}` });
  assert.deepEqual(lechNut(sai), ["không thấy nguồn: ghi-cuoc-goi", "căn chưa có mã: ghi-cuoc-goi"]);
});

// ——— E6 — năm trạng thái viết trước + đối chứng ———

type CaTrangThai = { ten: string; m: MoHinhHoSo; anh?: TrangThaiAnh; dau: (html: string) => boolean };
const LUC_DONG_BO = "2026-11-05T02:12:00Z";
const CA_TRANG_THAI: CaTrangThai[] = [
  { ten: "đang tải", m: moHinhHoSo(vao("khach", "toan-man", { ngan: { listings: null, lastAttempt: null } })), dau: (h) => /role="status" aria-busy="true"/.test(h) && h.includes('data-cho-tai="ho-so-dien-thoai"') },
  {
    ten: "không thấy",
    m: moHinhHoSo(vao("khach", "toan-man", { chon: { ma: "Z-99.99", toa: null, lan: null } })),
    dau: (h) => h.includes("Không thấy căn") && /href="\/inventory"[^>]*>Về Bảng hàng/.test(h),
  },
  { ten: "lỗi", m: moHinhHoSo(vao("khach", "toan-man", { ngan: { listings: null, lastAttempt: "may-chu" } })), dau: (h) => /role="alert"/.test(h) && /<button[^>]*>Thử lại<\/button>/.test(h) },
  {
    ten: "mất mạng",
    m: moHinhHoSo(vao("khach", "toan-man", { ngan: { lastAttempt: "mang" }, ngoaiTuyen: true })),
    dau: (h) => h.includes(`Đang xem bản trên máy · đồng bộ ${luc(LUC_DONG_BO)}`) && h.includes('data-khoi="gia"') && h.includes("3,25 tỷ"),
  },
  {
    ten: "chưa ảnh",
    m: moHinhHoSo(vao("khach", "toan-man")),
    anh: { kind: "co", ds: { anh: [], noiBo: "an", suaDuoc: false } },
    dau: (h) => new RegExp(`data-khoi="anh"><div[^>]*data-anh="trong"><svg[^>]*>.*?</svg><span[^>]*>${CHU_CHUA_ANH}</span>`, "s").test(h),
  },
];
function lechTrangThai(dung: DungThan): string[] {
  const out: string[] = [];
  for (const c of CA_TRANG_THAI) if (!c.dau(dung(c.m, c.anh))) out.push(c.ten);
  // Đối chứng: có dữ liệu, có ảnh, có mạng → không trạng thái nào.
  const lanh = dung(moHinhHoSo(vao("khach", "toan-man")));
  for (const c of CA_TRANG_THAI) if (c.dau(lanh)) out.push(`có dữ liệu mà mang dấu «${c.ten}»`);
  return out;
}

test("E6 năm trạng thái của thân điện thoại: đang tải · không thấy · lỗi · mất mạng · chưa ảnh; đối chứng có dữ liệu", () => {
  assert.equal(CA_TRANG_THAI.length, 5);
  assert.deepEqual(lechTrangThai(dungDT), []);
});

test("E6 chiều đỏ: bản sao trả khung rỗng khi lỗi → ô nêu trạng thái", () => {
  const rong: DungThan = (m, a) => (m.kind === "loi" ? renderToStaticMarkup(createElement("div")) : dungDT(m, a));
  assert.deepEqual(lechTrangThai(rong), ["lỗi"]);
});
