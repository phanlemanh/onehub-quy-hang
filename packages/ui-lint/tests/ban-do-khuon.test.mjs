// Bản đồ khuôn (hồ sơ ban-do-khuon-nhom-da-co, E1–E5). Ca «cây thật» đọc chính kho; mỗi ca đỏ chép bản đồ và
// apps/web/src thật sang thư mục tạm, kiểm bản sao lành ra 0 lỗi, 0 lệch, rồi phá ĐÚNG một chỗ và ghim thông điệp.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { docBanDo, kiemCay, KHOA_BAT_BUOC } from "../lib/ban-do.mjs";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(PKG, "..", "..");
const CLI = join(PKG, "ban-do-khuon.mjs");
const W = "apps/web/src";

function banSao() {
  const d = mkdtempSync(join(tmpdir(), "ban-do-"));
  for (const t of ["design/patterns", W]) cpSync(join(ROOT, t), join(d, t), { recursive: true });
  const lanh = docBanDo(d);
  const cay = kiemCay(d, lanh);
  assert.deepEqual(lanh.loi, [], "đối chứng dương: bản sao lành phải đọc 0 lỗi");
  assert.deepEqual(Object.values(cay).flatMap((r) => r.lech), [], "đối chứng dương: bản sao lành phải 0 lệch");
  return d;
}
const doc = (d, t) => readFileSync(join(d, t), "utf8");
function sua(d, t, cu, moi) {
  const s = doc(d, t);
  assert.ok(s.includes(cu), `bản sao ${t} không có đoạn cần phá: ${cu}`);
  writeFileSync(join(d, t), s.replace(cu, moi));
}
const lechCua = (d) => Object.values(kiemCay(d, docBanDo(d))).flatMap((r) => r.lech.map((l) => `${l.tep}: ${l.nhom} — ${l.dieu}`));
function voi(fn) {
  const d = banSao();
  try {
    fn(d);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}

const NHOM = ["bang-hang", "cai-dat-san", "cuoc-goi", "gui", "ho-so-can", "hom-nay-dau-chu", "hom-nay-truong-nhom", "lead-cua-toi", "o-nhan-lead", "toi", "trang-khach", "trang-mau", "trang-tam", "trang-thai", "xac-thuc"];
const TRANG_TAM = [
  "imports/new",
  "me",
  "shares",
  "team",
  "today",
  "viewings",
].map((p) => `${W}/app/(app)/${p}/page.tsx`);
const BANG = {
  "xac-thuc": { theoKhuon: ["login", "no-company", "select-company"].map((p) => `${W}/app/(auth)/${p}/page.tsx`), ngoaiLe: [] },
  "cai-dat-san": {
    theoKhuon: [`${W}/app/(app)/settings/users/page.tsx`],
    ngoaiLe: [`${W}/app/(app)/settings/[section]/page.tsx`, `${W}/app/(app)/settings/page.tsx`],
  },
  "o-nhan-lead": { theoKhuon: [`${W}/app/(app)/leads/new/page.tsx`, `${W}/app/(app)/proto/o-nhan-lead/page.tsx`], ngoaiLe: [] },
  // Lead của tôi (hàng 27): ba trang ba lối của ADR-0019, nhóm màn mới.
  "lead-cua-toi": { theoKhuon: [`${W}/app/(app)/leads/mine/page.tsx`], ngoaiLe: [`${W}/app/(app)/today/page.tsx`] },
  "trang-tam": {
    // Hàng 91: Cài đặt sàn vào vỏ — mục chưa dựng là trang tạm; trang chuyển hướng và Người dùng là ngoại lệ.
    // Hàng 38: Tôi rời trang tạm sang nhóm toi.
    // Hàng 43: /exports/new chỉ chuyển hướng về bảng hàng (hộp thoại Xuất bảng hàng), nằm ngoài vỏ (app) — rời nhóm.
    theoKhuon: [...TRANG_TAM.filter((t) => !t.includes("/today/") && !t.includes("/me/") && !t.includes("/exports/")), `${W}/app/(app)/settings/[section]/page.tsx`].sort(),
    ngoaiLe: [
      `${W}/app/(app)/inventory/page.tsx`,
      `${W}/app/(app)/inventory/views/[id]/page.tsx`,
      `${W}/app/(app)/leads/mine/page.tsx`,
      `${W}/app/(app)/leads/new/page.tsx`,
      `${W}/app/(app)/me/page.tsx`,
      `${W}/app/(app)/proto/anh-can-ba-ngan/page.tsx`,
      `${W}/app/(app)/proto/cot-ho-so-can/page.tsx`,
      `${W}/app/(app)/proto/hom-nay-dau-chu/page.tsx`,
      `${W}/app/(app)/proto/nhanh-tuc-thi/page.tsx`,
      `${W}/app/(app)/proto/o-nhan-lead/page.tsx`,
      `${W}/app/(app)/settings/page.tsx`,
      `${W}/app/(app)/settings/users/page.tsx`,
      `${W}/app/(app)/shares/new/page.tsx`,
      `${W}/app/(app)/today/page.tsx`,
      `${W}/app/(app)/units/[code]/page.tsx`,
      `${W}/app/(app)/units/call/dial/page.tsx`,
      `${W}/app/(app)/units/call/page.tsx`,
    ],
  },
  // Hàng 14: Bảng hàng rời trang tạm, nhóm màn mới (luật đợt 18).
  "bang-hang": { theoKhuon: [`${W}/app/(app)/inventory/page.tsx`, `${W}/app/(app)/inventory/views/[id]/page.tsx`], ngoaiLe: [] },
  // Hàng 17: Hồ sơ căn, nhóm màn mới — trang ba lối là màn mẫu tới khi màn thật rời trang tạm.
  "ho-so-can": { theoKhuon: [`${W}/app/(app)/proto/anh-can-ba-ngan/page.tsx`, `${W}/app/(app)/proto/cot-ho-so-can/page.tsx`, `${W}/app/(app)/units/[code]/page.tsx`], ngoaiLe: [] },
  // Hàng 22: Hôm nay của đầu chủ, nhóm màn mới — /today theo vai và trang ba lối của nó.
  "hom-nay-dau-chu": { theoKhuon: [`${W}/app/(app)/proto/hom-nay-dau-chu/page.tsx`, `${W}/app/(app)/today/page.tsx`], ngoaiLe: [] },
  // Hàng 42: Hôm nay của trưởng nhóm, nhóm màn mới — vùng dựng KhungTruongNhom; /today thuộc nhóm hom-nay-dau-chu.
  "hom-nay-truong-nhom": { theoKhuon: [`${W}/app/(app)/today/truong-nhom.tsx`], ngoaiLe: [`${W}/app/(app)/today/page.tsx`] },
  // Hàng 28: Chế độ cuộc gọi, nhóm màn mới — trang ba lối và màn thật /units/call.
  "cuoc-goi": { theoKhuon: [`${W}/app/(app)/units/call/dial/page.tsx`, `${W}/app/(app)/units/call/page.tsx`], ngoaiLe: [] },
  // Hàng 34: Gửi, nhóm màn mới — màn thật /shares/new (trang ba lối đã gỡ).
  gui: { theoKhuon: [`${W}/app/(app)/shares/new/page.tsx`], ngoaiLe: [] },
  // Hàng 38: Tôi, nhóm màn mới — màn thật /me và trang ba lối của nó.
  toi: { theoKhuon: [`${W}/app/(app)/me/page.tsx`], ngoaiLe: [] },
  // Hàng 35: Trang khách, nhóm màn mới — trang công khai /s/<mã>, ngoài (app).
  "trang-khach": { theoKhuon: [`${W}/app/s/[code]/page.tsx`], ngoaiLe: [] },
};
const NHAN_DIEN_TRANG_THAI = [
  ...TRANG_TAM.slice(0, 3),
  `${W}/app/(app)/layout.tsx`,
  // Hàng 91: chờ tải, lỗi, không thấy cấp nhóm (app).
  ...["error.tsx", "loading.tsx", "not-found.tsx"].map((p) => `${W}/app/(app)/${p}`),
  // Lead của tôi (hàng 27): màn, khuôn, vùng và nguồn thật.
  ...["khung.tsx", "lead-da-nhap.tsx", "nguon-that.tsx", "page.tsx"].map((p) => `${W}/app/(app)/leads/mine/${p}`),
  // Ô nhận lead (hàng 24) — nhóm o-nhan-lead, vẫn thuộc nhận diện của nhóm trạng thái.
  ...["khung.tsx", "nguon-that.tsx", "o-lead.tsx", "page.tsx"].map((p) => `${W}/app/(app)/leads/new/${p}`),
  ...TRANG_TAM.slice(3),
  // Bảng hàng (hàng 14): màn, khuôn và các thành phần của nó; trình sửa trên ô (hàng 15).
  // Hộp thoại Xuất bảng hàng (hàng 43).
  ...["bang-hang.tsx", "bulk/thanh.tsx", "cell-edit/tren-o.tsx", "hang-loc.tsx", "khung.tsx", "page.tsx", "phat-hang/hop-thoai.tsx", "thanh-cong-cu.tsx", "views/[id]/page.tsx"].map(
    (p) => `${W}/app/(app)/inventory/${p}`,
  ),
  // Bảng hàng thẻ trên điện thoại (hàng 32): bảng thẻ, ngăn lọc, thẻ căn.
  ...["cards/bang-the.tsx", "cards/ngan-loc.tsx", "cards/the-can.tsx"].map(
    (p) => `${W}/app/(app)/inventory/${p}`,
  ),
  // Trang thử ẩn của bộ đồng bộ (hàng 13) — ngoại lệ của trang tạm, vẫn thuộc nhận diện của nhóm trạng thái.
  ...["page.tsx", "trang-thu.tsx"].map((p) => `${W}/app/(app)/proto/nhanh-tuc-thi/${p}`),
  ...["page.tsx", "trang-mau.tsx"].map((p) => `${W}/app/(app)/proto/o-nhan-lead/${p}`),
  // Hồ sơ căn (hàng 17): trang ba lối và khuôn của nhóm; mục Ảnh và trang bấm được của nó (hàng 18).
  ...["mau-anh.tsx", "page.tsx"].map((p) => `${W}/app/(app)/proto/anh-can-ba-ngan/${p}`),
  ...["ba-loi.tsx", "page.tsx"].map((p) => `${W}/app/(app)/proto/cot-ho-so-can/${p}`),
  // Hôm nay của đầu chủ (hàng 22): trang ba lối, vùng đầu chủ và khuôn của /today.
  ...["ba-loi.tsx", "hang-doi.tsx", "page.tsx", "reui.tsx", "trong-kho.tsx", "ve-moi.tsx"].map((p) => `${W}/app/(app)/proto/hom-nay-dau-chu/${p}`),
  // Màn Gửi (hàng 34): khuôn, màn, trang khách xem trước.
  ...["khung.tsx", "man-gui.tsx", "page.tsx", "trang-khach.tsx"].map((p) => `${W}/app/(app)/shares/new/${p}`),
  // Chế độ cuộc gọi (hàng 28): trang ba lối và màn thật.
  ...["cuoc-goi.tsx", "dial/nut-quay-so.tsx", "dial/page.tsx", "dial/trang-quay-so.tsx", "khoi.tsx", "khung.tsx", "page.tsx", "push/ep-gia.tsx"].map((p) => `${W}/app/(app)/units/call/${p}`),
  // Thông báo lead (hàng 26): dải bật thông báo ở đầu /today; Hôm nay của trưởng nhóm (hàng 42).
  ...["dai-bat.tsx", "hom-nay-dau-chu.tsx", "khung.tsx", "truong-nhom.tsx"].map((p) => `${W}/app/(app)/today/${p}`),
  // Tôi (hàng 38): màn, khuôn, khối dựng, nguồn thật; khối báo máy bị báo ở đăng nhập.
  ...["khung.tsx", "man-toi.tsx", "toi-that.tsx"].map((p) => `${W}/app/(app)/me/${p}`),
  `${W}/app/(auth)/login/may-bi-bao.tsx`,
  ...["[code]/page.tsx", "ho-so/bang-co-ho-so.tsx", "ho-so/cot-ho-so.tsx", "ho-so/ho-so-toan-man.tsx", "ho-so/khung.tsx", "ho-so/nut-bao-sai.tsx", "ho-so/nut-hoi-dau-chu.tsx", "ho-so/o-ma-can.tsx", "photos/muc-anh-can.tsx", "photos/muc-anh.tsx", "photos/redact/trinh-che.tsx", "ready/nut-san-sang.tsx"].map((p) => `${W}/app/(app)/units/${p}`),
  ...["dang-xuat.tsx", "khung.tsx", "login/form.tsx", "login/page.tsx", "no-company/page.tsx", "select-company/danh-sach.tsx", "select-company/page.tsx"].map(
    (p) => `${W}/app/(auth)/${p}`,
  ),
  // Hàng 91: lỗi và không thấy ở gốc app; trang mẫu sống.
  ...["error.tsx", "global-error.tsx", "not-found.tsx"].map((p) => `${W}/app/${p}`),
  // Hàng 43: trang chuyển hướng /exports/new ngoài vỏ (app).
  `${W}/app/exports/new/page.tsx`,
  // Trang khách (hàng 35): khuôn, thẻ, chi tiết, nút Quan tâm, báo mở, trang.
  ...["bao-mo.tsx", "chi-tiet.tsx", "khung.tsx", "page.tsx", "quan-tam.tsx", "the-can.tsx", "trang.tsx"].map((p) => `${W}/app/s/[code]/${p}`),
  ...["man-mau.tsx", "page.tsx", "trang-mau.tsx", "xem/page.tsx"].map((p) => `${W}/app/mau/he-bo-cuc/${p}`),
  `${W}/app/layout.tsx`,
  `${W}/app/page.tsx`,
  ...["[section]/page.tsx", "khung.tsx", "page.tsx", "users/page.tsx", "users/quan-nguoi.tsx"].map((p) => `${W}/app/(app)/settings/${p}`),
  ...["account-menu", "app-shell", "app-shell-dong-bo", "company-switcher", "home-rail", "menu-tao", "mobile-shell", "notifications", "placeholder", "second-column", "shell-layout", "unit-jump"].map(
    (p) => `${W}/components/shell/${p}.tsx`,
  ),
];
const CHO_TRANG_THAI = [
  // Hàng 91: lỗi và không thấy cấp nhóm (app).
  `${W}/app/(app)/error.tsx`,
  // Bảng hàng (hàng 14): góc nhìn không có, lỗi tải, trống, lọc rỗng; khối báo điện thoại ở khuôn.
  ...Array(4).fill(`${W}/app/(app)/inventory/bang-hang.tsx`),
  // Bảng hàng thẻ (hàng 32): lỗi tải lần đầu, trống, lọc rỗng.
  ...Array(3).fill(`${W}/app/(app)/inventory/cards/bang-the.tsx`),
  `${W}/app/(app)/inventory/khung.tsx`,
  // Hộp thoại Xuất bảng hàng (hàng 43): «Cột không ra ngoài», lỗi dựng, đã chép/tải, chưa ghi, lỗi chép/tải.
  ...Array(5).fill(`${W}/app/(app)/inventory/phat-hang/hop-thoai.tsx`),
  // Lead của tôi (hàng 27): lỗi và trống của vùng Lead đã nhập.
  ...Array(2).fill(`${W}/app/(app)/leads/mine/lead-da-nhap.tsx`),
  ...Array(5).fill(`${W}/app/(app)/leads/new/o-lead.tsx`),
  `${W}/app/(app)/leads/new/page.tsx`,
  // Tôi (hàng 38): lỗi đọc danh sách máy.
  `${W}/app/(app)/me/man-toi.tsx`,
  `${W}/app/(app)/not-found.tsx`,
  // Hôm nay của đầu chủ (hàng 22): trống của trang ba lối; báo bộ đã lưu, báo bộ mặc định, lỗi tải lead, trống của vùng.
  `${W}/app/(app)/proto/hom-nay-dau-chu/hang-doi.tsx`,
  // Cài đặt sàn → Người dùng (vào vỏ ở hàng 91).
  `${W}/app/(app)/settings/users/page.tsx`,
  `${W}/app/(app)/settings/users/quan-nguoi.tsx`,
  `${W}/app/(app)/settings/users/quan-nguoi.tsx`,
  // Màn Gửi (hàng 34): đang tải, chưa chọn căn, không còn căn, lỗi tạo link, đã chép, đã tạo link; không có tab Gửi.
  ...Array(6).fill(`${W}/app/(app)/shares/new/man-gui.tsx`),
  `${W}/app/(app)/shares/new/page.tsx`,
  // Thông báo lead (hàng 26): dải bật — hướng dẫn cài iPhone, chưa cấu hình, không hỗ trợ, bật / lỗi bật.
  ...Array(4).fill(`${W}/app/(app)/today/dai-bat.tsx`),
  ...Array(4).fill(`${W}/app/(app)/today/hom-nay-dau-chu.tsx`),
  // Thông báo lead (hàng 26): lead từ thông báo không còn ở Hôm nay.
  `${W}/app/(app)/today/hom-nay-dau-chu.tsx`,
  // Mở hàng đợi từ cột thứ hai (va-he-bo-cuc): nhóm không có chỗ ở Hôm nay của đầu chủ; người không có vai Đầu chủ.
  `${W}/app/(app)/today/hom-nay-dau-chu.tsx`,
  // Hôm nay của trưởng nhóm (hàng 42): dòng «mở trên máy tính» của khuôn; mất mạng, lỗi tải hàng đợi.
  `${W}/app/(app)/today/khung.tsx`,
  `${W}/app/(app)/today/page.tsx`,
  ...Array(2).fill(`${W}/app/(app)/today/truong-nhom.tsx`),
  // Chế độ cuộc gọi (hàng 28): không thấy lead, lỗi tải lead.
  ...Array(2).fill(`${W}/app/(app)/units/call/cuoc-goi.tsx`),
  // Trang quay số (hàng 30): không thấy lead, lỗi tải lead.
  ...Array(2).fill(`${W}/app/(app)/units/call/dial/trang-quay-so.tsx`),
  // Chế độ ép giá (hàng 29): không thấy căn, đã ghi kết quả, máy chủ từ chối.
  ...Array(3).fill(`${W}/app/(app)/units/call/push/ep-gia.tsx`),
  // Hồ sơ căn (hàng 17): khung xương và «không có / nhiều căn» của cột, kết quả chia sẻ của báo sai; chờ tải lịch sử (hàng 33).
  ...["cot-ho-so.tsx", "cot-ho-so.tsx", "cot-ho-so.tsx", "cot-ho-so.tsx", "nut-bao-sai.tsx"].map((p) => `${W}/app/(app)/units/ho-so/${p}`),
  // Mục Ảnh (hàng 18): lỗi tải, trống của ngăn, thẻ Tự có từ mã (ngăn nội bộ khoá bỏ ở hàng 33 — không thẻ).
  ...Array(3).fill(`${W}/app/(app)/units/photos/muc-anh.tsx`),
  // Trình che vùng ảnh (hàng 19): ảnh không mở được, lưu lỗi.
  ...Array(2).fill(`${W}/app/(app)/units/photos/redact/trinh-che.tsx`),
  // «Sẵn sàng bán» (hàng 23): danh sách «Còn thiếu»; lời báo «Chưa gửi được» (va-san-sang-ban).
  `${W}/app/(app)/units/ready/nut-san-sang.tsx`,
  `${W}/app/(app)/units/ready/nut-san-sang.tsx`,
  // Máy bị báo mất (hàng 38): khối báo ở màn đăng nhập; hàng 93 thêm khối «chưa xoá được» khi xoá hỏng.
  ...Array(2).fill(`${W}/app/(auth)/login/may-bi-bao.tsx`),
  // Hàng 91: lỗi gốc app, lỗi toàn cục; rỗng · lỗi · ngoại tuyến của màn mẫu; không thấy gốc app.
  `${W}/app/error.tsx`,
  `${W}/app/global-error.tsx`,
  ...Array(3).fill(`${W}/app/mau/he-bo-cuc/man-mau.tsx`),
  `${W}/app/not-found.tsx`,
  // Trang khách (hàng 35): link không còn mở được.
  `${W}/app/s/[code]/trang.tsx`,
  `${W}/components/shell/notifications.tsx`,
  `${W}/components/shell/placeholder.tsx`,
];

describe("E1 — bản đồ thật: bốn tệp đủ khoá §11.3", () => {
  const b = docBanDo(ROOT);
  it("bốn nhóm, 0 lỗi đọc", () => {
    assert.deepEqual(b.loi, []);
    assert.deepEqual(b.nhom.map((g) => g.data.nhom).sort(), NHOM);
    for (const g of b.nhom) assert.equal(`${g.data.nhom}.md`, g.tep);
  });
  // Ma trận viết trước: 4 nhóm × 9 khoá, mỗi ô một assert kiểu.
  const KIEU = {
    nhom: (v) => typeof v === "string" && v.length > 0,
    doi_tuong: (v) => Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "string"),
    khuon: (v) => typeof v?.ten === "string" && typeof v?.nhap === "string",
    nhan_dien: (v) => Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "string"),
    mau_dang_chay: (v) => typeof v?.tep === "string" && typeof v?.duong === "string" && Array.isArray(v?.trang_thai) && v.trang_thai.length > 0,
    khe_bat_buoc: (v) => Array.isArray(v) && v.every((x) => typeof x === "string"),
    cam_ngoai_khuon: (v) => Array.isArray(v) && v.every((x) => typeof x === "string"),
    ngoai_le: (v) => Array.isArray(v) && v.every((x) => typeof x.tep === "string" && typeof x.ly_do === "string" && x.ly_do.trim().length > 0),
    luat: (v) => Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "string"),
  };
  assert.deepEqual(Object.keys(KIEU), KHOA_BAT_BUOC, "ma trận phủ đúng chín khoá của bộ đọc");
  for (const n of NHOM)
    for (const k of KHOA_BAT_BUOC)
      it(`${n} · ${k}`, () => {
        const g = b.nhom.find((x) => x.data.nhom === n);
        assert.ok(KIEU[k](g.data[k]), `${n}.${k} sai kiểu: ${JSON.stringify(g.data[k])}`);
      });
  it("đối chứng: bản sao mất một tệp nhóm thì danh sách nhóm thiếu đúng tên ấy", () =>
    voi((d) => {
      unlinkSync(join(d, "design/patterns/trang-tam.md"));
      assert.deepEqual(docBanDo(d).nhom.map((g) => g.data.nhom).sort(), ["bang-hang", "cai-dat-san", "cuoc-goi", "gui", "ho-so-can", "hom-nay-dau-chu", "hom-nay-truong-nhom", "lead-cua-toi", "o-nhan-lead", "toi", "trang-khach", "trang-mau", "trang-thai", "xac-thuc"]);
    }));
});

describe("E2 — bộ đọc từ chối bản đồ sai khuôn, gọi tên tệp và trường", () => {
  const P = "design/patterns";
  const CA = [
    ["thiếu khoá", `${P}/xac-thuc.md`, "luat: [KH-xt-khong-vo, KH-xt-loi-gan-o]\n", "", "xac-thuc.md: luat: thiếu khoá"],
    ["ngoại lệ thiếu ly_do", `${P}/cai-dat-san.md`, 'ly_do: "Chỉ chuyển hướng sang mục đầu (Người dùng), không dựng màn nào."', 'ly_do: " "', "cai-dat-san.md: ngoai_le[0] thiếu ly_do"],
    ["khuon.nhap không có tệp", `${P}/cai-dat-san.md`, '"@/app/(app)/settings/khung"', '"@/app/(app)/settings/khong-co"', "cai-dat-san.md: khuon.nhap: «@/app/(app)/settings/khong-co» không có tệp"],
    ["khuôn không xuất ten", `${P}/cai-dat-san.md`, "ten: MucCaiDat", "ten: MucKhac", "cai-dat-san.md: khuon.ten: apps/web/src/app/(app)/settings/khung.tsx không xuất hàm «MucKhac»"],
    ["khe không phải tham số", `${P}/cai-dat-san.md`, "khe_bat_buoc: [title, children]", "khe_bat_buoc: [title, tieuDe]", "cai-dat-san.md: khe_bat_buoc: «tieuDe» không phải tham số của khuôn MucCaiDat"],
    [
      "màn mẫu không khớp nhan_dien",
      `${P}/cai-dat-san.md`,
      'tep: "apps/web/src/app/(app)/settings/users/page.tsx"',
      'tep: "apps/web/src/app/(auth)/login/page.tsx"',
      "cai-dat-san.md: mau_dang_chay.tep: «apps/web/src/app/(auth)/login/page.tsx» không khớp nhan_dien",
    ],
    ["khối cấm không có thật", `${P}/trang-thai.md`, "AlertTitle]", "AlertTitle, KhongCo]", "trang-thai.md: cam_ngoai_khuon: KhongCo không thành phần nào"],
    ["mã luật không có trong thân", `${P}/trang-thai.md`, "KH-ts-chua-co-kieu]", "KH-ts-chua-co-kieu, KH-khong-co]", "trang-thai.md: luat: mã «KH-khong-co» không có câu luật trong thân tệp"],
    ["dòng ngoài tập con", `${P}/trang-thai.md`, "doi_tuong: [trong, loi, bao]", "doi_tuong:\n  - trong", "trang-thai.md: dòng 4: ngoài tập con đọc được"],
    [
      "một tệp thuộc hai nhóm màn",
      `${P}/cai-dat-san.md`,
      ', { tep: "apps/web/src/app/(app)/settings/[section]/page.tsx", ly_do: "Mục chưa dựng (mục 45–50 của lộ trình) đi khuôn trang tạm; mỗi mục dựng thật thì có trang riêng dựng MucCaiDat." }',
      "",
      "tệp «apps/web/src/app/(app)/settings/[section]/page.tsx» thuộc hai nhóm",
    ],
  ];
  for (const [ten, tep, cu, moi, ghim] of CA)
    it(ten, () =>
      voi((d) => {
        sua(d, tep, cu, moi);
        const { loi } = docBanDo(d);
        assert.ok(
          loi.some((l) => l.includes(ghim)),
          `thiếu lỗi «${ghim}», có: ${JSON.stringify(loi)}`,
        );
      }));
});

describe("E3 — nhóm đơn vị màn: mọi màn hiện có dựng khuôn ở gốc", () => {
  it("cây thật: 0 lệch, danh sách tệp mỗi nhóm khớp bảng viết trước", () => {
    const cay = kiemCay(ROOT, docBanDo(ROOT));
    for (const [n, mong] of Object.entries(BANG)) {
      assert.deepEqual(cay[n].lech, [], `${n} có lệch`);
      assert.deepEqual({ theoKhuon: cay[n].theoKhuon, ngoaiLe: cay[n].ngoaiLe }, mong, n);
    }
  });
  const USERS = `${W}/app/(app)/settings/users/page.tsx`;
  it("Người dùng tự dựng <main min-h-svh> như trước hàng này → lệch nêu main", () =>
    voi((d) => {
      sua(d, USERS, "return (\n    <MucCaiDat", 'return (\n    <main className="flex min-h-svh justify-center bg-background p-4">\n    <MucCaiDat');
      sua(d, USERS, "</MucCaiDat>\n  );", "</MucCaiDat>\n    </main>\n  );");
      assert.deepEqual(lechCua(d), [`${USERS}: cai-dat-san — gốc là <main>, phải là <MucCaiDat> (khuôn của nhóm cai-dat-san)`]);
    }));
  it("Người dùng trả <Frame> ở gốc → lệch nêu tệp, nhóm, khuôn", () =>
    voi((d) => {
      sua(d, USERS, 'import { TrangThai } from "@/components/trang-thai";', 'import { TrangThai } from "@/components/trang-thai";\nimport { Frame } from "@/components/reui/frame";');
      sua(d, USERS, '<MucCaiDat title="Người dùng" description={`Người của sàn ${me.activeCompany.name}`} khoi>', "<Frame>");
      sua(d, USERS, "</MucCaiDat>", "</Frame>");
      assert.deepEqual(lechCua(d), [`${USERS}: cai-dat-san — gốc là <Frame>, phải là <MucCaiDat> (khuôn của nhóm cai-dat-san)`]);
    }));
  it("lệnh trả có điều kiện: nhánh <main min-h-svh> của `a ? b : c` → lệch dù nhánh kia đúng khuôn", () =>
    voi((d) => {
      sua(d, USERS, "return (\n    <MucCaiDat", 'return cookie === "y" ? (\n    <main className="min-h-svh">x</main>\n  ) : (\n    <MucCaiDat');
      assert.deepEqual(lechCua(d), [`${USERS}: cai-dat-san — gốc là <main>, phải là <MucCaiDat> (khuôn của nhóm cai-dat-san)`]);
    }));
  it("lệnh trả `a && <Frame/>` ở gốc → lệch nêu Frame", () =>
    voi((d) => {
      sua(d, USERS, 'if (!me) redirect("/login");', 'if (!me) redirect("/login");\n  if (cookie === "y") return cookie && <Frame />;');
      sua(d, USERS, 'import { TrangThai } from "@/components/trang-thai";', 'import { TrangThai } from "@/components/trang-thai";\nimport { Frame } from "@/components/reui/frame";');
      assert.deepEqual(lechCua(d), [`${USERS}: cai-dat-san — gốc là <Frame>, phải là <MucCaiDat> (khuôn của nhóm cai-dat-san)`]);
    }));
  it("Đăng nhập nhập Khung cùng tên từ tệp khác → lệch nói tệp nhập sai", () =>
    voi((d) => {
      writeFileSync(join(d, W, "app/(auth)/login/khung-gia.tsx"), "export function Khung({ title, children }: { title: string; children: unknown }) {\n  return null;\n}\n");
      sua(d, `${W}/app/(auth)/login/page.tsx`, 'import { Khung } from "../khung";', 'import { Khung } from "./khung-gia";');
      assert.deepEqual(lechCua(d), [
        `${W}/app/(auth)/login/page.tsx: xac-thuc — nhập Khung từ «./khung-gia», không phải tệp khuôn ${W}/app/(auth)/khung.tsx`,
      ]);
    }));
  it("Chưa gắn sàn bỏ khe title → lệch nói khe", () =>
    voi((d) => {
      sua(d, `${W}/app/(auth)/no-company/page.tsx`, '<Khung title="Chưa thuộc sàn nào">', "<Khung>");
      assert.deepEqual(lechCua(d), [`${W}/app/(auth)/no-company/page.tsx: xac-thuc — <Khung> thiếu khe «title»`]);
    }));
});

describe("E4 — nhóm trạng thái: mọi chỗ trình trống · lỗi · báo đi qua TrangThai", () => {
  const QN = `${W}/app/(app)/settings/users/quan-nguoi.tsx`;
  it("cây thật: 0 lệch, nhan_dien và năm chỗ khớp bảng viết trước", () => {
    const r = kiemCay(ROOT, docBanDo(ROOT))["trang-thai"];
    assert.deepEqual(r.lech, []);
    assert.deepEqual(r.nhanDien, [...NHAN_DIEN_TRANG_THAI].sort());
    assert.deepEqual(r.theoKhuon.map((c) => c.replace(/:\d+$/, "")), CHO_TRANG_THAI);
  });
  it("dòng lỗi cũ <p role=\"alert\" className=\"text-sm text-destructive\"> của Người dùng → lệch", () =>
    voi((d) => {
      sua(d, QN, '<TrangThai kind="error" title={loiSua} />', '<p role="alert" className="text-sm text-destructive">\n                {loiSua}\n              </p>');
      const l = lechCua(d);
      assert.equal(l.length, 1, JSON.stringify(l));
      assert.match(l[0], /quan-nguoi\.tsx: trang-thai — dòng \d+: thẻ <p> trần mang role="alert" — dựng qua <TrangThai>/);
    }));
  it("<Empty> dùng thẳng ngoài khuôn ở chuông → lệch nêu Empty", () =>
    voi((d) => {
      const N = `${W}/components/shell/notifications.tsx`;
      sua(d, N, 'import { TrangThai } from "@/components/trang-thai";', 'import { TrangThai } from "@/components/trang-thai";\nimport { Empty } from "@/components/ui/empty";');
      sua(d, N, '          className="flex-1"\n        />', '          className="flex-1"\n        />\n        <Empty />');
      const l = lechCua(d);
      assert.equal(l.length, 1, JSON.stringify(l));
      assert.match(l[0], /notifications\.tsx: trang-thai — dòng \d+: <Empty> dùng ngoài khuôn — dựng qua <TrangThai>/);
    }));
  it("TrangThai thiếu kind → lệch nêu khe", () =>
    voi((d) => {
      sua(d, `${W}/components/shell/placeholder.tsx`, '          kind="empty"\n', "");
      const l = lechCua(d);
      assert.equal(l.length, 1, JSON.stringify(l));
      assert.match(l[0], /placeholder\.tsx: trang-thai — dòng \d+: <TrangThai> thiếu khe «kind»/);
    }));
  it("phải im: FieldError role=alert, CommandEmpty, tệp ngoài nhan_dien", () =>
    voi((d) => {
      assert.match(doc(d, `${W}/app/(auth)/login/form.tsx`), /<FieldError role="alert">/);
      assert.match(doc(d, `${W}/components/shell/unit-jump.tsx`), /<CommandEmpty/);
      writeFileSync(join(d, W, "lib/ngoai-nhom.tsx"), 'export function X() {\n  return <p role="alert">ngoài nhóm</p>;\n}\n');
      assert.deepEqual(lechCua(d), []);
    }));
});

describe("E5 — lệnh ban-do-khuon.mjs", () => {
  const chay = (root, ...a) => spawnSync(process.execPath, [CLI, "--root", root, ...a], { encoding: "utf8" });
  it("cây thật: mã 0, bốn dòng tóm tắt khớp số của bộ kiểm", () => {
    const r = chay(ROOT);
    assert.equal(r.status, 0, r.stderr);
    const dong = r.stdout.trim().split("\n");
    assert.deepEqual(dong, [
      "bang-hang: 2 tệp theo khuôn · 0 ngoại lệ · 0 lệch",
      "cai-dat-san: 1 tệp theo khuôn · 2 ngoại lệ · 0 lệch",
      "cuoc-goi: 2 tệp theo khuôn · 0 ngoại lệ · 0 lệch",
      "gui: 1 tệp theo khuôn · 0 ngoại lệ · 0 lệch",
      "ho-so-can: 3 tệp theo khuôn · 0 ngoại lệ · 0 lệch",
      "hom-nay-dau-chu: 2 tệp theo khuôn · 0 ngoại lệ · 0 lệch",
      "hom-nay-truong-nhom: 1 tệp theo khuôn · 1 ngoại lệ · 0 lệch",
      "lead-cua-toi: 1 tệp theo khuôn · 1 ngoại lệ · 0 lệch",
      "o-nhan-lead: 2 tệp theo khuôn · 0 ngoại lệ · 0 lệch",
      "toi: 1 tệp theo khuôn · 0 ngoại lệ · 0 lệch",
      "trang-khach: 1 tệp theo khuôn · 0 ngoại lệ · 0 lệch",
      "trang-mau: 2 tệp theo khuôn · 0 ngoại lệ · 0 lệch",
      "trang-tam: 5 tệp theo khuôn · 17 ngoại lệ · 0 lệch",
      "trang-thai: 79 chỗ theo khuôn · 0 ngoại lệ · 0 lệch",
      "xac-thuc: 3 tệp theo khuôn · 0 ngoại lệ · 0 lệch",
    ]);
    const j = JSON.parse(chay(ROOT, "--json").stdout);
    assert.deepEqual(
      Object.entries(j.nhom).map(([n, v]) => `${n}: ${v.theo_khuon} ${v.don_vi === "phan-tu" ? "chỗ" : "tệp"} theo khuôn · ${v.ngoai_le} ngoại lệ · ${v.lech} lệch`),
      dong,
    );
    assert.deepEqual(j.loi_doc, []);
  });
  it("bản sao có một lệch: mã 1, một dòng «tệp: nhóm — điều lệch»", () =>
    voi((d) => {
      sua(d, `${W}/app/(auth)/no-company/page.tsx`, '<Khung title="Chưa thuộc sàn nào">', "<Khung>");
      const r = chay(d);
      assert.equal(r.status, 1);
      assert.equal(r.stderr.trim(), `${W}/app/(auth)/no-company/page.tsx: xac-thuc — <Khung> thiếu khe «title»`);
      assert.match(r.stdout, /^xac-thuc: 2 tệp theo khuôn · 0 ngoại lệ · 1 lệch$/m);
      const j = JSON.parse(chay(d, "--json").stdout);
      assert.equal(j.nhom["xac-thuc"].lech, 1);
      assert.equal(j.lech.length, 1);
    }));
});
