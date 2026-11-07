// Tin soạn sẵn, ảnh kèm, thân lời gọi của màn Gửi (hàng 34: AC-3, AC-6). Bảng viết trước; dữ liệu dựng qua banRaNgoai.
import assert from "node:assert/strict";
import { test } from "node:test";
import { banRaNgoai, canMoi, type AnhRa, type CanNoiBo, type CanRaNgoai, type NguoiNhan } from "../redaction";
import { chonAnhChiaSe, CHO_LINK, ganLink, soanTin, thanKhachMoi, thanLanGui, TRAN_ANH_CHIA_SE } from "./tin";

const HOM_NAY = "2026-11-03";
const hai: CanNoiBo[] = [
  canMoi(),
  { ...canMoi(), buildingName: "Toà Mồi B", unitNumber: "Y-03.08", floor: 3, livingArea: 55, bedroomsTotal: 1, directionFaces: "Tây", listPrice: 950_000_000, feeInclusion: "included" },
];
const ban = (ds: CanNoiBo[], nguoiNhan: NguoiNhan) => ds.map((c) => banRaNgoai(c, { cua: "gui_link", nguoiNhan, today: HOM_NAY }));
const LINK = "https://quyhang.test/s/AbCdEfGhIjKl";

test("tin gửi: dựng từ bản ra", () => {
  const bang: { ten: string; tin: string; mong: string }[] = [
    {
      ten: "khách riêng hai căn",
      tin: ganLink(soanTin({ ban: ban(hai, "khach_rieng"), nguoiNhan: "khach_rieng", tenKhach: "[Tên]" }), LINK),
      mong: [
        "Chào anh/chị [Tên],",
        "Em gửi 2 căn đang bán:",
        "1. Toà Mồi A · Tầng cao — 74,5 m² · 2 PN · Đông Nam — 4,25 tỷ (không bao phí)",
        "2. Toà Mồi B · Tầng thấp — 55 m² · 1 PN · Tây — 950 triệu (bao phí)",
        `Xem ảnh và chi tiết: ${LINK}`,
      ].join("\n"),
    },
    {
      ten: "nhóm môi giới hai căn",
      tin: ganLink(soanTin({ ban: ban(hai, "nhom_moi_gioi"), nguoiNhan: "nhom_moi_gioi" }), LINK),
      mong: [
        "Gửi các anh chị trong nhóm,",
        "Em gửi 2 căn đang bán:",
        "1. Toà Mồi A · Z-97.53 — 74,5 m² · 2 PN · Đông Nam — 4,25 tỷ (không bao phí)",
        "2. Toà Mồi B · Y-03.08 — 55 m² · 1 PN · Tây — 950 triệu (bao phí)",
        `Xem ảnh và chi tiết: ${LINK}`,
      ].join("\n"),
    },
    {
      ten: "căn không giá",
      tin: ganLink(soanTin({ ban: ban([{ ...canMoi(), listPrice: null, feeInclusion: null }], "nhom_moi_gioi"), nguoiNhan: "nhom_moi_gioi" }), LINK),
      mong: ["Gửi các anh chị trong nhóm,", "Em gửi 1 căn đang bán:", "1. Toà Mồi A · Z-97.53 — 74,5 m² · 2 PN · Đông Nam — Giá liên hệ", `Xem ảnh và chi tiết: ${LINK}`].join("\n"),
    },
  ];
  assert.equal(bang.length, 3, "số dòng bảng viết trước");
  for (const d of bang) {
    assert.equal(d.tin, d.mong, `tin «${d.ten}»`);
    assert.equal(d.tin.split(LINK).length - 1, 1, `«${d.ten}»: link phải có đúng một lần`);
  }
  // Khách riêng không thấy mã căn; nhóm môi giới thấy (đối chứng dương).
  assert.ok(!bang[0]!.tin.includes("Z-97.53"), "tin khách riêng lộ mã căn");
  assert.ok(bang[1]!.tin.includes("Z-97.53"), "đối chứng: tin nhóm môi giới thiếu mã căn");
  // Người xoá chỗ link: link vẫn vào tin, đúng một lần.
  const xoa = soanTin({ ban: ban(hai, "nhom_moi_gioi"), nguoiNhan: "nhom_moi_gioi" }).replace(CHO_LINK, "");
  assert.equal(ganLink(xoa, LINK).split(LINK).length - 1, 1, "xoá chỗ link thì link vẫn phải vào tin");
});

test("tin gửi: trần ảnh", () => {
  assert.equal(TRAN_ANH_CHIA_SE, 10);
  const anh = (id: string): AnhRa => ({ id, label: "Ảnh", width: 10, height: 10 });
  const muoiHai: CanRaNgoai[] = Array.from({ length: 12 }, (_, i) => ({ photos: [anh(`c${i}-1`), anh(`c${i}-2`)] }));
  const chon = chonAnhChiaSe(muoiHai);
  assert.equal(chon.length, 10, "đúng 10 tệp");
  assert.deepEqual(
    chon.map((a) => a.id),
    Array.from({ length: 10 }, (_, i) => `c${i}-1`),
    "mỗi căn tối đa một ảnh, ảnh bìa, theo thứ tự gửi",
  );
  assert.deepEqual(chonAnhChiaSe([{ photos: [] }, {}]), [], "căn không ảnh thì không tệp");
  // Bản ra thật: ảnh đầu của căn mồi là ảnh ngăn gửi được, không ảnh nội bộ.
  const that = chonAnhChiaSe(ban([canMoi()], "khach_rieng"));
  assert.equal(that.length, 1);
  assert.ok(!that[0]!.id.includes("noi-bo"), "ảnh kèm là ảnh nội bộ");
});

test("tin gửi: thân lời gọi", () => {
  assert.deepEqual(thanKhachMoi({ ten: " [Tên] ", so: "0900 000 011", need: "purchase" }), {
    ok: true,
    than: { displayName: "[Tên]", phone: "0900000011", need: "purchase", criteria: {} },
  });
  const sai = thanKhachMoi({ ten: "[Tên]", so: "12", need: "purchase" });
  assert.equal(sai.ok, false);
  assert.deepEqual(sai.ok ? [] : sai.errors.map((e) => e.path), ["phone"], "số sai khuôn báo đúng trường");
  const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
  assert.deepEqual(thanLanGui({ nguoiNhan: "khach_rieng", prospectId: id(9), listingIds: [id(3), id(1)] }), {
    ok: true,
    than: { audience: "client", prospectId: id(9), listingIds: [id(3), id(1)] },
  });
  assert.deepEqual(thanLanGui({ nguoiNhan: "nhom_moi_gioi", prospectId: id(9), listingIds: [id(2)] }), {
    ok: true,
    than: { audience: "agents", prospectId: null, listingIds: [id(2)] },
  });
  assert.equal(thanLanGui({ nguoiNhan: "khach_rieng", prospectId: null, listingIds: [id(2)] }).ok, false, "khách riêng thiếu nhu cầu khách");
});

// E7 (hàng mau-bang-hang-va-bai, AC-7): tin soạn sẵn của màn Gửi mang lời mở đầu, lời kết của mẫu bài Zalo.
test("Gửi: tin theo mẫu Zalo", () => {
  const MAU = { dau: "Hàng mới tuần này 🎉", cuoi: "Cần thêm căn cứ nhắn em" };
  // [ca, tin dựng, các dòng mong đợi]
  const BANG: [string, string, string[]][] = [
    [
      "nhóm môi giới · có mẫu",
      soanTin({ ban: ban(hai, "nhom_moi_gioi"), nguoiNhan: "nhom_moi_gioi", mauZalo: MAU }),
      ["Gửi các anh chị trong nhóm,", "Hàng mới tuần này", "Em gửi 2 căn đang bán:", "1. Toà Mồi A · Z-97.53 — 74,5 m² · 2 PN · Đông Nam — 4,25 tỷ (không bao phí)", "2. Toà Mồi B · Y-03.08 — 55 m² · 1 PN · Tây — 950 triệu (bao phí)", `Xem ảnh và chi tiết: ${CHO_LINK}`, "Cần thêm căn cứ nhắn em"],
    ],
    [
      "khách riêng · có mẫu",
      soanTin({ ban: ban(hai, "khach_rieng"), nguoiNhan: "khach_rieng", tenKhach: "[Tên]", mauZalo: MAU }),
      ["Chào anh/chị [Tên],", "Hàng mới tuần này", "Em gửi 2 căn đang bán:", "1. Toà Mồi A · Tầng cao — 74,5 m² · 2 PN · Đông Nam — 4,25 tỷ (không bao phí)", "2. Toà Mồi B · Tầng thấp — 55 m² · 1 PN · Tây — 950 triệu (bao phí)", `Xem ảnh và chi tiết: ${CHO_LINK}`, "Cần thêm căn cứ nhắn em"],
    ],
    ["nhóm môi giới · không mẫu", soanTin({ ban: ban(hai, "nhom_moi_gioi"), nguoiNhan: "nhom_moi_gioi" }), soanTin({ ban: ban(hai, "nhom_moi_gioi"), nguoiNhan: "nhom_moi_gioi" }).split("\n")],
    ["khách riêng · mẫu rỗng", soanTin({ ban: ban(hai, "khach_rieng"), nguoiNhan: "khach_rieng", tenKhach: "[Tên]", mauZalo: { dau: "  ", cuoi: "" } }), soanTin({ ban: ban(hai, "khach_rieng"), nguoiNhan: "khach_rieng", tenKhach: "[Tên]" }).split("\n")],
  ];
  let dem = 0;
  for (const [ca, tin, dong] of BANG) {
    assert.equal(tin, dong.join("\n"), `tin lệch mẫu — ${ca}`);
    dem++;
  }
  assert.equal(dem, 4);
  const coMau = BANG[0]![1];
  assert.ok(coMau.indexOf(MAU.cuoi) > coMau.indexOf(CHO_LINK), "lời kết đứng trước link");
  const daGan = ganLink(coMau, LINK);
  assert.equal(daGan.split(LINK).length - 1, 1, "tin gửi đi phải có link đúng một lần");
});
