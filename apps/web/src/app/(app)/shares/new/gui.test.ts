// Màn Gửi, phần thuần (hàng 34: AC-3, AC-7, AC-8, AC-9). Mạng, bảng chia sẻ, bộ nhớ tạm là bản giả ghi lời gọi.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { StandardStatus } from "@quy-hang/core/listing";
import type { AnhRa, CanRaNgoai } from "@quy-hang/core/redaction";
import type { ListingView } from "@/lib/sync/types";
import { khoaTin, LOI_TAO_LINK, LY_DO_KHONG_CO, NHAC_XAC_NHAN, nutGui, phanLoaiCan, taoBoGui, tinDangDung, type BangChiaSe, type GoiApi, type KetGui } from "./gui";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const PID = id(900);
const CODE = "AbCdEfGhIjKl";
const GOC = "https://quyhang.test";
const anh = (n: string): AnhRa => ({ id: n, label: "Ảnh", width: 10, height: 10 });
const ban = (k: number): CanRaNgoai[] => Array.from({ length: k }, (_, i) => ({ buildingName: "Toà A", photos: [anh(`a${i}`)] }));
const TIN = "Chào anh/chị [Tên],\nXem ảnh và chi tiết: [link]";

type Loi = { method: string; path: string; body: unknown };
function mayChu(o: { status?: number; cho?: Promise<void>; nem?: boolean } = {}) {
  const loi: Loi[] = [];
  const goi: GoiApi = async (method, path, body) => {
    loi.push({ method, path, body });
    if (o.cho) await o.cho;
    if (o.nem) throw new TypeError("mất mạng");
    if (path === "/api/v1/prospects") return { status: o.status ?? 201, body: { id: PID } };
    return { status: o.status ?? 201, body: { code: CODE } };
  };
  return { loi, goi };
}
const layAnh = async (a: AnhRa, ten: string) => new File([a.id], ten, { type: "image/jpeg" });

describe("màn Gửi", () => {
  it("gửi: khách mới tạo nhu cầu rồi chọn", async () => {
    const m = mayChu();
    const bo = taoBoGui({ goi: m.goi, goc: GOC, layAnh });
    const kq = await bo.khachMoi({ ten: "[Tên]", so: "0900 000 011", need: "purchase" });
    assert.equal(m.loi.length, 1, "đúng một lời gọi");
    assert.deepEqual(m.loi[0], { method: "POST", path: "/api/v1/prospects", body: { displayName: "[Tên]", phone: "0900000011", need: "purchase", criteria: {} } });
    assert.deepEqual(kq, { ok: true, id: PID, ten: "[Tên]" }, "người nhận sau đó phải là id trả về");

    const sai = await bo.khachMoi({ ten: "[Tên]", so: "12", need: "purchase" });
    assert.equal(m.loi.length, 1, "số sai khuôn vẫn gọi mạng");
    assert.deepEqual(sai.ok ? null : Object.keys(sai.loi), ["so"], "báo lỗi đúng trường số");
  });

  it("gửi: một Lần gửi rồi một bảng chia sẻ", async () => {
    const thuTu: string[] = [];
    const m = mayChu();
    const goi: GoiApi = async (...a) => {
      thuTu.push("tao");
      return m.goi(...a);
    };
    const chia: { text: string; files?: File[]; url?: string }[] = [];
    const bang: BangChiaSe = {
      share: async (d) => {
        thuTu.push("share");
        chia.push(d);
      },
      canShare: () => true,
    };
    const bo = taoBoGui({ goi, goc: GOC, bang, layAnh });
    const ds = [id(3), id(1), id(2)];
    const kq = await bo.gui({ nguoiNhan: "khach_rieng", prospectId: PID, listingIds: ds, tin: TIN, ban: ban(12) });
    assert.deepEqual(kq, { kieu: "da-mo-bang", code: CODE });
    assert.deepEqual(thuTu, ["tao", "share"], "thứ tự lời gọi: tạo Lần gửi rồi mới mở bảng chia sẻ");
    assert.equal(m.loi.length, 1, "tổng lời gọi mạng ngoài ảnh");
    assert.deepEqual(m.loi[0], { method: "POST", path: "/api/v1/shares", body: { audience: "client", prospectId: PID, listingIds: ds } });
    assert.equal(chia.length, 1, "đúng một lần mở bảng chia sẻ");
    assert.ok(chia[0]!.text.includes(`/s/${CODE}`), "tin thiếu link");
    assert.ok(!("url" in chia[0]!), "gói có trường url");
    assert.ok((chia[0]!.files?.length ?? 0) <= 10 && (chia[0]!.files?.length ?? 0) > 0, `số tệp ${chia[0]!.files?.length}`);

    const m2 = mayChu();
    await taoBoGui({ goi: m2.goi, goc: GOC, bang, layAnh }).gui({ nguoiNhan: "nhom_moi_gioi", prospectId: PID, listingIds: [id(4)], tin: TIN, ban: ban(1) });
    assert.deepEqual(m2.loi[0]!.body, { audience: "agents", prospectId: null, listingIds: [id(4)] });
  });

  it("gửi: dự phòng khi không có bảng chia sẻ", async () => {
    const abort = Object.assign(new Error("huỷ"), { name: "AbortError" });
    const bang: { ten: string; bang: BangChiaSe | null; chep: ((t: string) => Promise<void>) | null; mong: KetGui["kieu"]; tep?: boolean }[] = [
      { ten: "không bảng, chép được", bang: null, chep: async () => {}, mong: "da-chep" },
      { ten: "không bảng, chép lỗi", bang: null, chep: async () => Promise.reject(new Error("không quyền")), mong: "hien-tin" },
      { ten: "máy không nhận tệp", bang: { share: async () => {}, canShare: () => false }, chep: null, mong: "da-mo-bang", tep: false },
      { ten: "người huỷ bảng", bang: { share: async () => Promise.reject(abort), canShare: () => true }, chep: null, mong: "huy" },
    ];
    assert.equal(bang.length, 4, "số dòng bảng viết trước");
    for (const d of bang) {
      const m = mayChu();
      const nhan: string[] = [];
      const chia: { files?: File[] }[] = [];
      const b = d.bang && {
        share: async (x: { text: string; files?: File[] }) => {
          chia.push(x);
          return d.bang!.share(x);
        },
        canShare: d.bang.canShare,
      };
      const chep = d.chep && (async (t: string) => (nhan.push(t), d.chep!(t)));
      const kq = await taoBoGui({ goi: m.goi, goc: GOC, bang: b, chep, layAnh }).gui({ nguoiNhan: "nhom_moi_gioi", prospectId: null, listingIds: [id(1)], tin: TIN, ban: ban(2) });
      assert.equal(kq.kieu, d.mong, `«${d.ten}»: kết cục`);
      assert.equal(m.loi.length, 1, `«${d.ten}»: Lần gửi phải tạo đúng một lần`);
      if (d.mong === "da-chep") assert.deepEqual(nhan, [`Chào anh/chị [Tên],\nXem ảnh và chi tiết: ${GOC}/s/${CODE}`], "bộ nhớ tạm nhận đúng tin");
      if (d.mong === "hien-tin") assert.ok("text" in kq && kq.text.includes(`/s/${CODE}`), "hiện tin có link để chép tay");
      if (d.tep === false) assert.equal(chia[0]!.files, undefined, "máy không nhận tệp thì chỉ gửi tin");
    }
  });

  it("gửi: căn gửi được và nhắc", () => {
    const HOM_NAY = "2026-11-03";
    const l = (n: number, s: StandardStatus, xacNhan: string | null): ListingView =>
      ({ id: id(n), buildingName: "Toà A", unitNumber: `A-${n}`, standardStatus: s, lastConfirmedAt: xacNhan }) as ListingView;
    const kho = new Map(
      [l(1, "Active", "2026-10-31T09:00:00Z"), l(2, "Active", "2026-10-19T09:00:00Z"), l(3, "Active", null), l(4, "Pending", "2026-11-01"), l(5, "Closed", "2026-11-01")].map((x) => [x.id, x]),
    );
    const bang: [string, string, string][] = [
      ["Active xác nhận 3 ngày", id(1), "gửi"],
      ["Active 15 ngày", id(2), `gửi · ${NHAC_XAC_NHAN}`],
      ["Active chưa từng xác nhận", id(3), `gửi · ${NHAC_XAC_NHAN}`],
      ["Pending", id(4), "loại · Đang giao dịch — không gửi mới được"],
      ["Closed", id(5), "loại · Đã bán"],
      ["id không có trên máy", id(6), `loại · ${LY_DO_KHONG_CO}`],
    ];
    assert.equal(bang.length, 6, "số dòng bảng viết trước");
    const kq = phanLoaiCan(
      bang.map((d) => d[1]),
      (x) => kho.get(x),
      HOM_NAY,
    );
    const thay = new Map([...kq.gui.map((g) => [g.id, `gửi${g.nhac ? ` · ${NHAC_XAC_NHAN}` : ""}`] as const), ...kq.loai.map((g) => [g.id, `loại · ${g.lyDo}`] as const)]);
    assert.deepEqual(
      bang.map(([ten, x]) => [ten, thay.get(x)]),
      bang.map(([ten, , m]) => [ten, m]),
    );
    assert.deepEqual(
      kq.gui.map((g) => g.id),
      [id(1), id(2), id(3)],
      "giữ thứ tự chọn",
    );
  });

  it("gửi: khi nào nút Gửi mở", async () => {
    const du = { mang: true, nguoiNhan: "khach_rieng" as const, khachId: PID, soCan: 2, dangTao: false };
    const bang: [string, Parameters<typeof nutGui>[0], { mo: boolean; chu: string }][] = [
      ["mất mạng", { ...du, mang: false }, { mo: false, chu: "Gửi cần mạng" }],
      ["chưa người nhận", { ...du, nguoiNhan: null, khachId: null }, { mo: false, chu: "Chọn người nhận" }],
      ["khách riêng chưa chọn khách", { ...du, khachId: null }, { mo: false, chu: "Chọn người nhận" }],
      ["danh sách rỗng", { ...du, soCan: 0 }, { mo: false, chu: "Không còn căn gửi được" }],
      ["đủ", du, { mo: true, chu: "Gửi" }],
    ];
    assert.equal(bang.length, 5, "số dòng bảng viết trước");
    assert.deepEqual(
      bang.map(([ten, t]) => [ten, nutGui(t)]),
      bang.map(([ten, , m]) => [ten, m]),
    );
    // Màn chỉ gọi bộ điều phối khi nút mở: dòng tắt không gọi mạng, dòng đủ gọi đúng một lần.
    for (const [ten, t] of bang) {
      const m = mayChu();
      const bo = taoBoGui({ goi: m.goi, goc: GOC, bang: { share: async () => {} }, layAnh });
      if (nutGui(t).mo) await bo.gui({ nguoiNhan: "khach_rieng", prospectId: PID, listingIds: [id(1)], tin: TIN, ban: ban(1) });
      assert.equal(m.loi.length, nutGui(t).mo ? 1 : 0, `«${ten}»: số lời gọi`);
    }
  });

  it("gửi: tin sửa tay bỏ khi đổi người nhận, khách hay căn", () => {
    const TU_DONG = "tin dựng từ bản ra";
    const goc = khoaTin("nhom_moi_gioi", null, [id(1), id(2)]);
    const sua = { khoa: goc, tin: "Gửi nhóm — Toà · Z-97.53 (đã sửa)" };
    const bang: [string, string, string][] = [
      ["không đổi gì", goc, sua.tin],
      ["đổi sang khách riêng", khoaTin("khach_rieng", PID, [id(1), id(2)]), TU_DONG],
      ["đổi khách", khoaTin("nhom_moi_gioi", PID, [id(1), id(2)]), TU_DONG],
      ["bỏ một căn", khoaTin("nhom_moi_gioi", null, [id(1)]), TU_DONG],
      ["đổi thứ tự căn", khoaTin("nhom_moi_gioi", null, [id(2), id(1)]), TU_DONG],
    ];
    assert.equal(bang.length, 5, "số dòng bảng viết trước");
    assert.deepEqual(
      bang.map(([ten, k]) => [ten, tinDangDung(sua, k, TU_DONG)]),
      bang.map(([ten, , m]) => [ten, m]),
    );
    assert.equal(tinDangDung(null, goc, TU_DONG), TU_DONG, "chưa sửa thì tin tự soạn");
  });

  it("gửi: bấm hai lần và lỗi máy chủ", async () => {
    let tha!: () => void;
    const m = mayChu({ cho: new Promise<void>((r) => (tha = r)) });
    const bo = taoBoGui({ goi: m.goi, goc: GOC, bang: { share: async () => {} }, layAnh });
    const vao = { nguoiNhan: "khach_rieng" as const, prospectId: PID, listingIds: [id(1)], tin: TIN, ban: ban(1) };
    const lan1 = bo.gui(vao);
    assert.equal(bo.dangTao(), true);
    const lan2 = await bo.gui(vao);
    tha();
    await lan1;
    assert.deepEqual(lan2, { kieu: "bo-qua" });
    assert.equal(m.loi.filter((x) => x.path === "/api/v1/shares").length, 1, "bấm hai lần tạo hai Lần gửi");

    const m500 = mayChu({ status: 500 });
    const truoc = structuredClone(vao);
    const kq = await taoBoGui({ goi: m500.goi, goc: GOC, bang: { share: async () => {} }, layAnh }).gui(vao);
    assert.deepEqual(kq, { kieu: "loi", chu: LOI_TAO_LINK });
    assert.equal(LOI_TAO_LINK, "Chưa tạo được link — thử lại");
    assert.deepEqual(vao, truoc, "người nhận, căn, tin phải giữ nguyên");
    const mMang = mayChu({ nem: true });
    assert.deepEqual(await taoBoGui({ goi: mMang.goi, goc: GOC, layAnh }).gui(vao), { kieu: "loi", chu: LOI_TAO_LINK });
  });
});
