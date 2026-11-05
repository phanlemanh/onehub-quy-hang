// Tab Tôi (hàng 38: E1, E2, E3, E4, E5b) — ma trận viết trước, mỗi ma trận kèm chiều đỏ trên bản sao hỏng.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it, test } from "node:test";
import { fileURLToPath } from "node:url";
import { loaiMay, type LoaiMay } from "@quy-hang/core/thiet-bi";
import { dangXuatTrenMay } from "@/components/shell/dang-xuat-tren-may";
import type { TrangThaiThietBi } from "@/lib/push/dang-ky";
import { NHAN_THONG_BAO } from "@/lib/push/nhan";
import {
  canMatKhauHienTai,
  coNutBaoMat,
  dongThongBao,
  LOI_DA_BAO,
  NHAN_MAT_KHAU,
  NHOM_MAT_KHAU,
  nhomDong,
  nutMatKhau,
  phanLoaiCai,
  trangThaiDongMay,
  type MaNhom,
  type NhomDong,
  type TrangThaiCai,
  type TrangThaiMatKhau,
} from "./toi";

const DAY: MaNhom[] = ["ho-so", "san", "cai", "thong-bao", "may", "dang-xuat"];
const VAI = ["listing_agent", "buyer_agent", "team_lead", "telesales", "company_admin"];

function kiemNhom(f: (me: { companies: readonly unknown[] }) => NhomDong[]): string[] {
  const loi: string[] = [];
  for (const vai of VAI) {
    for (const thietBi of ["dien-thoai", "may-tinh"]) {
      for (const soSan of [1, 2]) {
        const ds = f({ companies: Array.from({ length: soSan }, (_, i) => ({ id: `s${i}`, roles: [vai], thietBi })) });
        const ma = ds.map((d) => d.ma);
        for (const m of DAY) if (!ma.includes(m)) loi.push(`${vai}/${thietBi}: thiếu nhóm ${m}`);
        if (ma.join() !== DAY.join() && ma.length === DAY.length) loi.push(`${vai}/${thietBi}: sai thứ tự`);
        if (ds.find((d) => d.ma === "san")?.doiSan !== soSan >= 2) loi.push(`${vai}/${thietBi}/${soSan} sàn: «Đổi sàn» sai`);
      }
    }
  }
  return loi;
}

test("E1 sáu nhóm theo thứ tự ở 5 vai × 2 thiết bị; «Đổi sàn» chỉ khi từ hai sàn", () => {
  assert.equal(VAI.length * 2, 10);
  assert.deepEqual(kiemNhom(nhomDong), []);
});

test("E1 chiều đỏ: bản sao bỏ nhóm «máy» thì ô đỏ nêu tên nhóm thiếu", () => {
  const hong = (me: { companies: readonly unknown[] }) => nhomDong(me).filter((d) => d.ma !== "may");
  assert.match(kiemNhom(hong).join(" | "), /thiếu nhóm may/);
});

test("E1 trang /me không còn nhập Placeholder", () => {
  const trang = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "page.tsx"), "utf8");
  assert.doesNotMatch(trang, /Placeholder/);
});

const CAI: [string, { daCai: boolean; coLoiMoi: boolean; ios: boolean }, TrangThaiCai][] = [
  ["đã cài trên iPhone", { daCai: true, coLoiMoi: false, ios: true }, "da-cai"],
  ["có lời mời cài", { daCai: false, coLoiMoi: true, ios: false }, "co-nut"],
  ["iPhone Safari chưa cài", { daCai: false, coLoiMoi: false, ios: true }, "ios-ba-buoc"],
  ["trình duyệt khác", { daCai: false, coLoiMoi: false, ios: false }, "khac"],
];
const kiemCai = (f: typeof phanLoaiCai) => CAI.filter(([, d, mong]) => f(d) !== mong).map(([ten]) => ten);

test("E2 bốn trạng thái cài, mỗi trạng thái một cách hiện", () => {
  assert.equal(CAI.length, 4);
  assert.deepEqual(kiemCai(phanLoaiCai), []);
});

test("E2 chiều đỏ: xét iPhone trước «đã cài» thì ô «đã cài trên iPhone» đỏ", () => {
  const hong: typeof phanLoaiCai = (d) => (d.ios ? "ios-ba-buoc" : phanLoaiCai(d));
  assert.deepEqual(kiemCai(hong), ["đã cài trên iPhone"]);
});

const TB: TrangThaiThietBi[] = ["chua-bat", "da-bat", "loi-luu", "tu-choi", "ios-chua-cai", "khong-ho-tro", "chua-cau-hinh"];
function kiemThongBao(bang: Readonly<Record<string, string>>): string[] {
  return TB.filter((t) => {
    const d = dongThongBao(t);
    return !d || !bang[t] || d.nhan !== bang[t] || d.coNut !== (t === "chua-bat" || t === "loi-luu");
  });
}

test("E3 bảy trạng thái thông báo nói đúng chữ của bảng chung với dải bật; «chưa bật» có nút", () => {
  assert.equal(TB.length, 7);
  assert.deepEqual(kiemThongBao(NHAN_THONG_BAO), []);
  const daiBat = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../today/dai-bat.tsx"), "utf8");
  assert.match(daiBat, /NHAN_THONG_BAO/, "dải bật chép chữ thay vì dùng bảng chung");
});

test("E3 chiều đỏ: bảng chữ thiếu «loi-luu» thì ô đỏ nêu trạng thái", () => {
  const thieu = Object.fromEntries(Object.entries(NHAN_THONG_BAO).filter(([k]) => k !== "loi-luu"));
  assert.deepEqual(kiemThongBao(thieu), ["loi-luu"]);
});

function mayGia() {
  const kho = new Map<string, number>([
    ["u-x|s", 2],
    ["u-z|s", 1],
  ]);
  const goiQua: { url: string; body: string }[] = [];
  const goi = (async (url: string, init?: RequestInit) => {
    goiQua.push({ url, body: String(init?.body ?? "") });
    return new Response(null, { status: 200 });
  }) as typeof fetch;
  return { kho, goiQua, goi };
}

test("E4 đăng xuất ở tab Tôi: hỏi khi còn 2 thay đổi; «Ở lại» giữ kho, «Vẫn đăng xuất» xoá kho X rồi gửi sign-out kèm pushEndpoint", async () => {
  for (const [n, dongY] of [
    [0, true],
    [2, false],
    [2, true],
  ] as const) {
    const m = mayGia();
    const hoi: number[] = [];
    let ve = 0;
    const kq = await dangXuatTrenMay({
      dangXuat: async () => {
        if (n > 0) {
          hoi.push(n);
          if (!dongY) return false;
        }
        m.kho.delete("u-x|s");
        return true;
      },
      than: async () => JSON.stringify({ pushEndpoint: "https://fcm.googleapis.com/fcm/send/x" }),
      goi: m.goi,
      ve: () => void ve++,
    });
    assert.deepEqual(hoi, n > 0 ? [2] : []);
    if (!dongY) {
      assert.equal(kq, "o-lai");
      assert.equal(m.goiQua.length, 0, "ở lại mà vẫn gọi sign-out");
      assert.ok(m.kho.has("u-x|s"));
      continue;
    }
    assert.equal(kq, "xong");
    assert.ok(!m.kho.has("u-x|s"), "kho chưa xoá");
    assert.ok(m.kho.has("u-z|s"), "kho người khác bị xoá");
    assert.deepEqual(m.goiQua.map((g) => g.url), ["/api/v1/auth/sign-out"]);
    assert.match(m.goiQua[0]!.body, /pushEndpoint/);
    assert.equal(ve, 1);
  }
});

test("E4 chiều đỏ: gửi sign-out trước khi xoá kho, mạng lỗi thì kho còn", async () => {
  const m = mayGia();
  const hong = async () => {
    await m.goi("/api/v1/auth/sign-out").then(() => Promise.reject(new Error("mất mạng")));
    m.kho.delete("u-x|s");
  };
  await hong().catch(() => undefined);
  assert.ok(m.kho.has("u-x|s"), "kho chưa xoá");
  const tot = mayGia();
  await dangXuatTrenMay({
    dangXuat: async () => (tot.kho.delete("u-x|s"), true),
    than: async () => "{}",
    goi: (async () => {
      throw new Error("mất mạng");
    }) as typeof fetch,
    ve: () => {},
  });
  assert.ok(!tot.kho.has("u-x|s"), "mạng lỗi giữ kho của đường thật");
});

type CaMay = [string, Parameters<typeof trangThaiDongMay>[0], string, boolean];
const MAY: CaMay[] = [
  ["k = 1", { dang: "san", soMay: 1 }, "mot-may", false],
  ["k = 3", { dang: "san", soMay: 3 }, "nhieu-may", true],
  ["đang báo mất", { dang: "bao", soMay: 3 }, "dang-bao", true],
  ["báo mất xong", { dang: "xong", soMay: 1, daThu: 2 }, "da-bao", false],
  ["lỗi đọc", { dang: "loi", soMay: 0 }, "loi", false],
];
const kiemMay = (f: typeof trangThaiDongMay) =>
  MAY.filter(([, s, loai, nut]) => {
    const t = f(s);
    return t.loai !== loai || coNutBaoMat(t) !== nut;
  }).map(([ten]) => ten);

test("E5b năm trạng thái dòng máy; nút «Báo mất máy» chỉ khi từ hai máy; lời sau khi báo", () => {
  assert.equal(MAY.length, 5);
  assert.deepEqual(kiemMay(trangThaiDongMay), []);
  assert.equal(LOI_DA_BAO(2), "Đã đăng xuất 2 máy khác");
});

test("E5b chiều đỏ: bản sao hiện nút khi k = 1", () => {
  const hong: typeof trangThaiDongMay = (s) => (s.dang === "san" ? { loai: "nhieu-may", co: s.soMay } : trangThaiDongMay(s));
  assert.ok(kiemMay(hong).includes("k = 1"));
});

test("E5b loại máy của sáu chuỗi mẫu", () => {
  const MAU: [string, LoaiMay][] = [
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1", "iphone"],
    ["Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) Safari/604.1", "iphone"],
    ["Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/130.0.0.0 Mobile Safari/537.36", "android"],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/130.0.0.0 Safari/537.36", "may-tinh"],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Edg/130.0.0.0", "may-tinh"],
    ["curl/8.4.0", "khac"],
  ];
  for (const [ua, mong] of MAU) assert.equal(loaiMay(ua), mong, ua);
});

// dang-nhap-mat-khau (E20): dòng «Mật khẩu» nằm trong nhóm «Hồ sơ» (Hỏi-6), sáu nhóm giữ thứ tự cũ.
describe("dòng Mật khẩu", () => {
  it("nằm trong nhóm Hồ sơ, sáu nhóm giữ thứ tự", () => {
    assert.deepEqual(
      nhomDong({ companies: [1] }).map((n) => n.ma),
      ["ho-so", "san", "cai", "thong-bao", "may", "dang-xuat"],
    );
    assert.equal(NHOM_MAT_KHAU, "ho-so");
  });
  it("chữ và nút theo ba trạng thái", () => {
    const bang: [TrangThaiMatKhau, string, string, boolean][] = [
      ["khong", "Chưa đặt", "Đặt mật khẩu", false],
      ["co", "Đã đặt", "Đổi mật khẩu", true],
      ["vo-hieu", "Đã khoá — đặt mật khẩu mới", "Đặt mật khẩu", false],
    ];
    for (const [t, nhan, nut, hienTai] of bang) {
      assert.equal(NHAN_MAT_KHAU[t], nhan, t);
      assert.equal(nutMatKhau(t), nut, t);
      assert.equal(canMatKhauHienTai(t), hienTai, t);
    }
  });
});
