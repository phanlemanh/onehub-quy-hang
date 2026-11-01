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
    [0, undefined, ["realPhoto"]],
    [1, undefined, []],
    [1, 2, ["realPhoto"]],
    [2, 2, []],
    [5, 3, []],
  ];
  for (const [dem, toiThieu, mong] of BANG) {
    assert.deepEqual(missingFor("Active", { ...BON, realPhotoCount: dem, minRealPhotos: toiThieu }), mong, `ảnh ${dem}, tối thiểu ${toiThieu ?? "vắng"}`);
  }
  assert.deepEqual(
    missingFor("Active", { listPrice: null, feeInclusion: null, legalStatus: null, occupantType: null, realPhotoCount: 0 }),
    ["listPrice", "feeInclusion", "realPhoto", "legalStatus", "occupantType"],
    "thiếu cả năm theo thứ tự cố định",
  );
  // Vắng số đếm (Bảng hàng, Hỏi-2): điều ảnh không xét trên máy.
  assert.deepEqual(missingFor("Active", BON), []);
  for (const [to, them] of [["Pending", {}], ["Hold", {}], ["Withdrawn", { withdrawnReason: "unreachable" }], ["Closed", { closePrice: 3_400_000_000 }]] as const) {
    assert.ok(!missingFor(to, { ...BON, ...them, realPhotoCount: 0 }).includes("realPhoto"), `${to} không đòi ảnh`);
  }
  assert.deepEqual(checkTransition("Incomplete", "Active", { ...BON, realPhotoCount: 0 }), { ok: false, kind: "missing-requirement", missing: ["realPhoto"] });
});

test("đọc cấu hình số ảnh thật tối thiểu (hàng 23, E1)", async () => {
  const { docCauHinhSanSang, KHOA_ANH_THAT_TOI_THIEU } = await import("./san-sang");
  assert.deepEqual(docCauHinhSanSang([]), { minRealPhotos: 1, loi: null }, "vắng dòng");
  assert.deepEqual(docCauHinhSanSang([{ key: KHOA_ANH_THAT_TOI_THIEU, value: 3 }]), { minRealPhotos: 3, loi: null });
  assert.deepEqual(docCauHinhSanSang([{ key: "lead.routing_strategy", value: 3 }]), { minRealPhotos: 1, loi: null }, "khoá khác không tính");
  for (const v of [0, 21, 2.5, "2", null]) {
    const kq = docCauHinhSanSang([{ key: KHOA_ANH_THAT_TOI_THIEU, value: v }]);
    assert.equal(kq.minRealPhotos, 1, `giá trị ${JSON.stringify(v)} về mặc định`);
    assert.match(kq.loi ?? "", /listing\.ready_min_real_photos/, `giá trị ${JSON.stringify(v)} phải báo lỗi nêu khoá`);
  }
});
