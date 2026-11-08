import assert from "node:assert/strict";
import { test } from "node:test";
import { checkTransition, STANDARD_STATUSES, type StandardStatus } from "./status";

const DU = { listPrice: 3_500_000_000, feeInclusion: "excluded", legalStatus: "pink_book", occupantType: "vacant", closePrice: 3_400_000_000, withdrawnReason: "unreachable" };

test("chuyển trạng thái: ma trận 36 cặp viết trước", () => {
  // Viết tay theo bảng AC-4 đã duyệt — không sinh từ TRANSITIONS. 1 = nhận, 0 = từ chối.
  const BANG: Record<StandardStatus, Record<StandardStatus, 0 | 1>> = {
    Incomplete: { Incomplete: 0, Active: 1, Pending: 0, Closed: 0, Hold: 1, Withdrawn: 1 },
    Active: { Incomplete: 0, Active: 0, Pending: 1, Closed: 1, Hold: 1, Withdrawn: 1 },
    Pending: { Incomplete: 0, Active: 1, Pending: 0, Closed: 1, Hold: 0, Withdrawn: 1 },
    Closed: { Incomplete: 0, Active: 0, Pending: 0, Closed: 0, Hold: 0, Withdrawn: 0 },
    Hold: { Incomplete: 0, Active: 1, Pending: 0, Closed: 0, Hold: 0, Withdrawn: 1 },
    Withdrawn: { Incomplete: 0, Active: 0, Pending: 0, Closed: 0, Hold: 0, Withdrawn: 0 },
  };
  let so = 0;
  let nhan = 0;
  for (const from of STANDARD_STATUSES) {
    for (const to of STANDARD_STATUSES) {
      const kq = checkTransition(from, to, DU);
      assert.equal(kq.ok, BANG[from][to] === 1, `cặp ${from} → ${to}: mong ${BANG[from][to] ? "nhận" : "từ chối"}`);
      if (!kq.ok) assert.equal(kq.kind, "invalid-transition", `${from} → ${to} phải từ chối vì bảng chuyển`);
      so++;
      if (kq.ok) nhan++;
    }
  }
  assert.equal(so, 36);
  assert.equal(nhan, 12);
});

test("không có trạng thái thứ bảy", () => {
  for (const la of ["Reserved", "Giữ chỗ", "Đã cọc", "active", "", null, 7]) {
    const kq = checkTransition("Active", la, DU);
    assert.equal(kq.ok, false, String(la));
    assert.equal(!kq.ok && kq.kind, "invalid-transition", String(la));
  }
});

test("điều kiện vào trạng thái", () => {
  // [tên ca, từ, tới, ngữ cảnh, điều thiếu mong]
  const CA: [string, StandardStatus, StandardStatus, object, string[]][] = [
    ["Closed thiếu giá chốt", "Active", "Closed", { ...DU, closePrice: null }, ["closePrice"]],
    ["Closed giá chốt bằng 0", "Pending", "Closed", { ...DU, closePrice: 0 }, ["closePrice"]],
    ["Closed có giá chốt", "Pending", "Closed", DU, []],
    ["Withdrawn thiếu lý do", "Active", "Withdrawn", { ...DU, withdrawnReason: null }, ["withdrawnReason"]],
    ["Withdrawn lý do ngoài ba lý do", "Active", "Withdrawn", { ...DU, withdrawnReason: "het-hung" }, ["withdrawnReason"]],
    ["Withdrawn lý do hợp lệ", "Hold", "Withdrawn", DU, []],
    ["Active thiếu giá", "Incomplete", "Active", { ...DU, listPrice: null }, ["listPrice"]],
    ["Active thiếu điều kiện phí", "Incomplete", "Active", { ...DU, feeInclusion: null }, ["feeInclusion"]],
    ["Active thiếu pháp lý", "Incomplete", "Active", { ...DU, legalStatus: "" }, ["legalStatus"]],
    ["Active thiếu tình trạng sử dụng", "Hold", "Active", { ...DU, occupantType: null }, ["occupantType"]],
    ["Active thiếu hết", "Incomplete", "Active", {}, ["listPrice", "feeInclusion", "legalStatus", "occupantType"]],
    ["Active đủ", "Incomplete", "Active", DU, []],
    ["Hold không cần gì", "Active", "Hold", {}, []],
  ];
  for (const [ten, from, to, ctx, mong] of CA) {
    const kq = checkTransition(from, to, ctx);
    const thay = kq.ok ? [] : kq.kind === "missing-requirement" ? kq.missing : [`(${kq.reason})`];
    assert.deepEqual(thay, mong, ten);
  }
});

test("điều ảnh thật vào Đang bán (hàng 23, E1)", async () => {
  const { missingFor } = await import("./status");
  const BON = { listPrice: 3_500_000_000, feeInclusion: "excluded", legalStatus: "pink_book", occupantType: "vacant" };
  // [realPhotoCount, minRealPhotos, mong] — viết tay, không sinh từ hàm.
  const BANG: [number, number | undefined, string[]][] = [
    [0, 1, ["realPhoto"]],
    [1, 1, []],
    [1, 2, ["realPhoto"]],
    [2, 2, []],
    [5, 3, []],
  ];
  for (const [dem, toiThieu, mong] of BANG) {
    assert.deepEqual(missingFor("Active", { ...BON, realPhotoCount: dem, minRealPhotos: toiThieu }), mong, `ảnh ${dem}, tối thiểu ${toiThieu ?? "vắng"}`);
  }
  assert.deepEqual(
    missingFor("Active", { listPrice: null, feeInclusion: null, legalStatus: null, occupantType: null, realPhotoCount: 0, minRealPhotos: 1 }),
    ["listPrice", "feeInclusion", "realPhoto", "legalStatus", "occupantType"],
    "thiếu cả năm theo thứ tự cố định",
  );
  // Vắng số đếm (Bảng hàng, Hỏi-2): điều ảnh không xét trên máy.
  assert.deepEqual(missingFor("Active", BON), []);
  for (const [to, them] of [["Pending", {}], ["Hold", {}], ["Withdrawn", { withdrawnReason: "unreachable" }], ["Closed", { closePrice: 3_400_000_000 }]] as const) {
    assert.ok(!missingFor(to, { ...BON, ...them, realPhotoCount: 0, minRealPhotos: 1 }).includes("realPhoto"), `${to} không đòi ảnh`);
  }
  assert.deepEqual(checkTransition("Incomplete", "Active", { ...BON, realPhotoCount: 0, minRealPhotos: 1 }), { ok: false, kind: "missing-requirement", missing: ["realPhoto"] });
  // Mã căn (giám sát «C»): hàng chưa có mã chỉ báo «mã căn», không báo thêm ảnh; có mã thì như trên; khoá vắng thì không xét.
  assert.deepEqual(missingFor("Active", { ...BON, unitNumber: null, realPhotoCount: 0, minRealPhotos: 1 }), ["unitNumber"], "chưa có mã căn");
  assert.deepEqual(missingFor("Active", { ...BON, unitNumber: "", realPhotoCount: 0, minRealPhotos: 1 }), ["unitNumber"], "mã căn rỗng");
  assert.deepEqual(missingFor("Active", { ...BON, unitNumber: "A-0601", realPhotoCount: 0, minRealPhotos: 1 }), ["realPhoto"], "có mã, chưa ảnh");
  assert.deepEqual(missingFor("Active", { ...BON, unitNumber: "A-0601", realPhotoCount: 1 }), [], "có mã, có ảnh");
});

test("số ảnh thật tối thiểu mặc định 0 (anh-khong-chan-ban, E1)", async () => {
  const { missingFor, MAC_DINH_ANH_THAT_TOI_THIEU } = await import("./status");
  const { SO_DIEM } = await import("../config/so");
  const { KHOANG_ANH_THAT_TOI_THIEU } = await import("./san-sang");
  assert.equal(MAC_DINH_ANH_THAT_TOI_THIEU, 0, "mặc định 0 — thiếu ảnh không chặn bán");
  const d = SO_DIEM.find((x) => x.khoa === "listing.ready_min_real_photos")!;
  assert.deepEqual([d.macDinh, (d.kieu as { min: number }).min, (d.kieu as { max: number }).max], [0, 0, 20], "sổ điểm 33: 0–20, mặc định 0");
  assert.deepEqual([KHOANG_ANH_THAT_TOI_THIEU.min, KHOANG_ANH_THAT_TOI_THIEU.max], [0, 20], "bản sao khoảng ở lõi");
  const DU = { listPrice: 3_500_000_000, feeInclusion: "excluded", legalStatus: "pink_book", occupantType: "vacant", unitNumber: "A-0601" };
  // Ma trận viết trước: [tối thiểu, số ảnh, mong].
  const BANG: [number | undefined, number, string[]][] = [
    [undefined, 0, []],
    [0, 0, []],
    [1, 0, ["realPhoto"]],
    [1, 1, []],
    [2, 1, ["realPhoto"]],
    [2, 2, []],
    [20, 19, ["realPhoto"]],
    [20, 20, []],
  ];
  for (const [toiThieu, dem, mong] of BANG) {
    assert.deepEqual(missingFor("Active", { ...DU, realPhotoCount: dem, minRealPhotos: toiThieu }), mong, `tối thiểu ${toiThieu ?? "vắng"}, ảnh ${dem}: cần ${JSON.stringify(mong)}`);
  }
});

test("đọc cấu hình số ảnh thật tối thiểu (hàng 23, E1; anh-khong-chan-ban: mặc định 0)", async () => {
  const { docCauHinhSanSang, KHOA_ANH_THAT_TOI_THIEU } = await import("./san-sang");
  assert.deepEqual(docCauHinhSanSang([]), { minRealPhotos: 0, loi: null }, "vắng dòng");
  assert.deepEqual(docCauHinhSanSang([{ key: KHOA_ANH_THAT_TOI_THIEU, value: 3 }]), { minRealPhotos: 3, loi: null });
  assert.deepEqual(docCauHinhSanSang([{ key: KHOA_ANH_THAT_TOI_THIEU, value: 2 }]), { minRealPhotos: 2, loi: null });
  assert.deepEqual(docCauHinhSanSang([{ key: KHOA_ANH_THAT_TOI_THIEU, value: 0 }]), { minRealPhotos: 0, loi: null }, "0 hợp lệ");
  assert.deepEqual(docCauHinhSanSang([{ key: "lead.routing_strategy", value: 3 }]), { minRealPhotos: 0, loi: null }, "khoá khác không tính");
  for (const v of [-1, 21, 1.5, 2.5, "2", null]) {
    const kq = docCauHinhSanSang([{ key: KHOA_ANH_THAT_TOI_THIEU, value: v }]);
    assert.equal(kq.minRealPhotos, 0, `giá trị ${JSON.stringify(v)} về mặc định`);
    assert.match(kq.loi ?? "", /listing\.ready_min_real_photos/, `giá trị ${JSON.stringify(v)} phải báo lỗi nêu khoá`);
  }
});

test("cửa nhập bỏ pháp lý, tình trạng sử dụng (can-nhap-len-bang-chung E1)", async () => {
  const { missingFor, checkTransition, MIEN_O_CUA_NHAP } = await import("./status");
  const goc = { unitNumber: "T-01.01", listPrice: 3_200_000_000, feeInclusion: "included", realPhotoCount: 0, minRealPhotos: 0 };
  // Ma trận viết trước: pháp lý {có, thiếu} × tình trạng sử dụng {có, thiếu}.
  const MA_TRAN: [string | null, string | null, string[]][] = [
    ["pink_book", "vacant", []],
    ["pink_book", null, ["occupantType"]],
    [null, "vacant", ["legalStatus"]],
    [null, null, ["legalStatus", "occupantType"]],
  ];
  for (const [legalStatus, occupantType, khongCua] of MA_TRAN) {
    const ctx = { ...goc, legalStatus, occupantType };
    assert.deepEqual(missingFor("Active", { ...ctx, cuaVao: "nhap" }), [], `cửa nhập, pháp lý ${legalStatus}, tình trạng ${occupantType}`);
    assert.deepEqual(missingFor("Active", ctx), khongCua, `không cửa vào, pháp lý ${legalStatus}, tình trạng ${occupantType}`);
  }
  const nhap = { ...goc, legalStatus: null, occupantType: null, cuaVao: "nhap" as const };
  assert.ok(missingFor("Active", { ...nhap, listPrice: null }).includes("listPrice"), "cửa nhập vẫn đòi giá");
  assert.ok(missingFor("Active", { ...nhap, feeInclusion: null }).includes("feeInclusion"), "cửa nhập vẫn đòi điều kiện phí");
  assert.ok(missingFor("Active", { ...nhap, unitNumber: null }).includes("unitNumber"), "cửa nhập vẫn đòi mã căn");
  assert.ok(missingFor("Active", { ...nhap, minRealPhotos: 1 }).includes("realPhoto"), "cửa nhập vẫn đòi ảnh theo tối thiểu");
  assert.equal(checkTransition("Incomplete", "Active", nhap).ok, true, "Chưa đủ để rao → Đang bán ở cửa nhập");
  assert.deepEqual([...MIEN_O_CUA_NHAP], ["legalStatus", "occupantType"]);
});
