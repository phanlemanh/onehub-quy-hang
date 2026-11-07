// Mở đúng hàng đợi từ cột thứ hai (hồ sơ va-he-bo-cuc, E1–E5, E11). Mỗi ma trận viết trước, đếm bằng assert số; mỗi phép
// so có chiều đỏ trên cùng fixture với thông điệp ghim. Danh sách mục cột rút từ chính second-column.tsx.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { BO_NHOM_MAC_DINH, chiaNhom, kiemBoNhom, type BoNhom, type DuKienCan } from "@quy-hang/core/today";

import { TODAY_ITEMS } from "@/components/shell/second-column";

import { moNhom } from "./mo-lead";
import { baoChiDauChu, baoNgoaiDauChu, baoNhomTrong, docNhomThamSo, KHONG_CO_NHOM, mucDangChon, timNhom } from "./mo-nhom";

const MA = ["new_lead", "price_adjustment", "call_back", "missing_info", "add_photos", "recent_change"] as const;
const NHAN: Record<(typeof MA)[number], string> = {
  new_lead: "Lead mới",
  price_adjustment: "Nên gọi điều chỉnh giá",
  call_back: "Cần gọi lại",
  missing_info: "Thiếu thông tin",
  add_photos: "Bổ sung ảnh",
  recent_change: "Mới đổi",
};
const hien = (...ma: string[]) => ma.map((code) => ({ nhom: { code } }));

describe("mo-nhom: chỗ của nhóm (E1)", () => {
  type O = { ten: string; ma: string; dangHien: ReturnType<typeof hien> | null; mong: ReturnType<typeof timNhom> };
  // Ma trận viết trước: sáu mã × {đang tải, có việc, không việc}.
  const O: O[] = MA.flatMap((ma) => [
    { ten: `${ma} đang tải`, ma, dangHien: null, mong: null },
    { ten: `${ma} có việc`, ma, dangHien: hien(ma, "zz_khac"), mong: { nhom: ma, dong: `nhom:${ma}` } },
    { ten: `${ma} không việc`, ma, dangHien: hien("zz_khac"), mong: { bao: baoNhomTrong(NHAN[ma]) } },
  ]);
  const lech = (o: O, mong = o.mong) => {
    const co = timNhom({ bo: BO_NHOM_MAC_DINH, dangHien: o.dangHien, ma: o.ma });
    return JSON.stringify(co) === JSON.stringify(mong) ? null : `ô «${o.ten}»: ra ${JSON.stringify(co)}, mong ${JSON.stringify(mong)}`;
  };

  it("18 ô, mỗi ô đúng kết quả mong", () => {
    let dem = 0;
    for (const o of O) {
      assert.equal(lech(o), null);
      dem++;
    }
    assert.equal(dem, 18);
  });

  it("có việc: moNhom mở đúng khoá nhóm mà giữ khoá khác", () => {
    const truoc = { "nhom:call_back": false, "nhom:missing_info": true };
    assert.deepEqual(moNhom(truoc, "call_back"), { "nhom:call_back": true, "nhom:missing_info": true });
    assert.equal(moNhom(true, "call_back"), true, "«mở hết» giữ nguyên");
  });

  it("chiều đỏ: ô «price_adjustment có việc» mong dòng nhom:call_back; ô «đang tải» mong chữ báo", () => {
    const o = O.find((x) => x.ten === "price_adjustment có việc")!;
    assert.match(lech(o, { nhom: "price_adjustment", dong: "nhom:call_back" }) ?? "", /ô «price_adjustment có việc»/);
    const t = O.find((x) => x.ten === "call_back đang tải")!;
    assert.match(lech(t, { bao: baoNhomTrong(NHAN.call_back) }) ?? "", /ô «call_back đang tải»/);
  });
});

describe("mo-nhom: mục cột sáng (E2)", () => {
  // Ma trận viết trước: chuỗi tham số → tập href mong được chọn.
  const O: [string, string, string[]][] = [
    ...MA.map((ma): [string, string, string[]] => [ma, `nhom=${ma}`, [`/today?nhom=${ma}`]]),
    ["rỗng", "", []],
    ["sai khuôn", "nhom=Price_adjustment", []],
    ["mã lạ", "nhom=nhom_la", []],
    ["có lead", "lead=7c9e6679-7425-40de-944b-e07fc1f90ae7&nhom=call_back", []],
  ];
  const lech = (ten: string, qs: string, mong: string[], items = TODAY_ITEMS) => {
    const co = items.map((m) => m.href).filter((h) => h === mucDangChon(items, "/today", qs));
    return JSON.stringify(co) === JSON.stringify(mong) ? null : `ô «${ten}»: chọn ${JSON.stringify(co)}, mong ${JSON.stringify(mong)}`;
  };
  const loiHref = (items: readonly { label: string; href: string }[]) =>
    items.filter((m) => !/^\/today\?nhom=[a-z][a-z0-9_]{1,39}$/.test(m.href) || m.href.includes("#")).map((m) => `mục «${m.label}» trỏ ${m.href}`);

  it("10 ô, mỗi ô đúng tập mục chọn", () => {
    let dem = 0;
    for (const [ten, qs, mong] of O) {
      assert.equal(lech(ten, qs, mong), null);
      dem++;
    }
    assert.equal(dem, 10);
  });

  it("mỗi mục Hôm nay của cột trỏ /today?nhom=<mã của chính nó>, không mục nào trỏ #", () => {
    assert.deepEqual(TODAY_ITEMS.map((m) => m.href), MA.map((ma) => `/today?nhom=${ma}`));
    assert.deepEqual(loiHref(TODAY_ITEMS), []);
  });

  it("đường dẫn khác /today thì không mục nào sáng", () => assert.equal(mucDangChon(TODAY_ITEMS, "/inventory", "nhom=call_back"), null));

  it("chiều đỏ: một mục đổi về /today#call_back thì phép so href đỏ, nêu nhãn mục", () => {
    const hong = TODAY_ITEMS.map((m) => (m.label === "Cần gọi lại" ? { ...m, href: "/today#call_back" } : m));
    assert.deepEqual(loiHref(hong), ["mục «Cần gọi lại» trỏ /today#call_back"]);
    assert.match(lech("call_back", "nhom=call_back", ["/today?nhom=call_back"], hong) ?? "", /ô «call_back»/);
  });
});

describe("mo-nhom: tham số (E3)", () => {
  // Ma trận viết trước: chuỗi vào → mã đọc được (null = bỏ qua).
  const O: [string, string | null][] = [
    ["", null],
    ["Price_adjustment", null],
    ["gía", null],
    ["a", null],
    ["x".repeat(41), null],
    ["call-back", null],
    ["price_adjustment", "price_adjustment"],
    ["nhom_la", "nhom_la"],
  ];
  const lech = (vao: string, mong: string | null) => {
    const co = docNhomThamSo(new URLSearchParams({ nhom: vao }));
    return co === mong ? null : `chuỗi vào ${JSON.stringify(vao)}: ra ${JSON.stringify(co)}, mong ${JSON.stringify(mong)}`;
  };
  /** Lõi có nhận mã này làm code của một nhóm không — chạy kiemBoNhom trên bộ mặc định đổi code nhóm đầu. */
  const loiNhan = (ma: string) => !kiemBoNhom(BO_NHOM_MAC_DINH.map((n, i) => (i === 0 ? { ...n, code: ma } : n))).some((l) => l.includes("code phải"));

  it("8 ô, khớp mong và khớp khuôn mã của lõi", () => {
    let dem = 0;
    for (const [vao, mong] of O) {
      assert.equal(lech(vao, mong), null);
      assert.equal(mong !== null, loiNhan(vao), `chuỗi vào ${JSON.stringify(vao)}: bộ đọc và lõi lệch nhau`);
      dem++;
    }
    assert.equal(dem, 8);
    assert.equal(docNhomThamSo(""), null, "vắng tham số");
  });

  it("mã đúng khuôn mà không có trong bộ nhóm, hay nhóm sàn tắt → chữ báo không có", () => {
    assert.deepEqual(timNhom({ bo: BO_NHOM_MAC_DINH, dangHien: hien("call_back"), ma: "nhom_la" }), { bao: KHONG_CO_NHOM });
    const tat: BoNhom = BO_NHOM_MAC_DINH.map((n) => (n.code === "missing_info" ? { ...n, enabled: false } : n));
    assert.deepEqual(timNhom({ bo: tat, dangHien: hien("call_back"), ma: "missing_info" }), { bao: KHONG_CO_NHOM });
  });

  it("chiều đỏ: ô mong null mà đổi thành mã thì đỏ, nêu chuỗi vào", () => assert.match(lech("call-back", "call-back") ?? "", /chuỗi vào "call-back"/));
});

describe("mo-nhom: lead thắng (E4)", () => {
  const LEAD = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
  const docBoLuatLead = (qs: string) => {
    const v = new URLSearchParams(qs).get("nhom");
    return v && /^[a-z][a-z0-9_]{1,39}$/.test(v) ? v : null;
  };
  const lech = (doc: (qs: string) => string | null) =>
    doc(`lead=${LEAD}&nhom=price_adjustment`) === null && doc("nhom=price_adjustment") === "price_adjustment" ? null : "lead thắng: tham số nhom không bị bỏ qua khi có lead";

  it("có lead thì nhóm cần mở là null; chỉ nhom thì đọc được mã", () => assert.equal(lech(docNhomThamSo), null));
  it("chiều đỏ: bản bỏ luật lead-thắng thì đỏ", () => assert.match(lech(docBoLuatLead) ?? "", /lead thắng/));
});

describe("mo-nhom: không đầu chủ (E5)", () => {
  type Vai = "chỉ telesales" | "chỉ trưởng nhóm" | "đầu chủ kiêm telesales";
  /** Dòng báo màn Hôm nay hiện ở đầu khung: chỉ cho người không có vai Đầu chủ (page.tsx). */
  const baoTheoVai = (vai: Vai, ma: string) => (vai === "đầu chủ kiêm telesales" ? null : baoNgoaiDauChu(ma, BO_NHOM_MAC_DINH));
  const VAI: Vai[] = ["chỉ telesales", "chỉ trưởng nhóm", "đầu chủ kiêm telesales"];
  // Ma trận viết trước: vai × {sáu mã, mã lạ, sai khuôn}.
  const O: [Vai, string, string | null][] = VAI.flatMap((vai) => [
    ...MA.map((ma): [Vai, string, string | null] => [vai, ma, vai === "đầu chủ kiêm telesales" ? null : baoChiDauChu(NHAN[ma])]),
    [vai, "nhom_la", vai === "đầu chủ kiêm telesales" ? null : KHONG_CO_NHOM],
    [vai, "Sai-Khuon", null],
  ]);
  const lech = (vai: Vai, ma: string, mong: string | null) => {
    const co = baoTheoVai(vai, ma);
    return co === mong ? null : `vai «${vai}», mã ${ma}: ra ${JSON.stringify(co)}, mong ${JSON.stringify(mong)}`;
  };

  it("24 ô, mỗi ô đúng chữ báo", () => {
    let dem = 0;
    for (const [vai, ma, mong] of O) {
      assert.equal(lech(vai, ma, mong), null);
      dem++;
    }
    assert.equal(dem, 24);
    assert.equal(baoNgoaiDauChu(null, BO_NHOM_MAC_DINH), null, "vắng tham số");
  });

  it("chiều đỏ: nhãn mong của một mã đổi sang nhãn nhóm khác; ô hai vai mong chữ báo không-đầu-chủ", () => {
    assert.match(lech("chỉ telesales", "call_back", baoChiDauChu(NHAN.new_lead)) ?? "", /mã call_back/);
    assert.match(lech("đầu chủ kiêm telesales", "new_lead", baoChiDauChu(NHAN.new_lead)) ?? "", /vai «đầu chủ kiêm telesales»/);
  });
});

describe("mo-nhom: nhóm trống rồi sang nhóm có việc (E11)", () => {
  const TOI = "u-toi";
  const BAY_GIO = "2026-11-02T03:00:00Z";
  const truoc = (n: number) => new Date(Date.parse(BAY_GIO) - n * 864e5).toISOString();
  // Một căn mình giữ, xác nhận và đổi giá gần đây, thiếu pháp lý → chỉ vào nhóm «Thiếu thông tin».
  const can: DuKienCan = {
    standardStatus: "Active",
    listAgentKey: TOI,
    lastConfirmedAt: truoc(1),
    priceChangeTimestamp: truoc(1),
    lastPriceChange: { at: truoc(1), byUserId: TOI, byRoles: ["listing_agent"], from: 3_200_000_000, to: 3_100_000_000 },
    lastStatusChange: { at: truoc(30), byUserId: TOI, byRoles: ["listing_agent"], from: "Incomplete", to: "Active" },
    missing: ["legalStatus"],
    propertySubType: "Condominium",
  };
  const dangHien = chiaNhom(BO_NHOM_MAC_DINH, [can], TOI, BAY_GIO).filter((g) => g.cans.length > 0);
  const bao = (ma: string) => {
    const kq = timNhom({ bo: BO_NHOM_MAC_DINH, dangHien, ma });
    return kq && "bao" in kq ? kq.bao : null;
  };

  it("lưới chỉ hiện «Thiếu thông tin»; mã nhóm trống → đúng một chữ báo; sang nhóm có việc → không báo, chọn dòng nhóm", () => {
    assert.deepEqual(dangHien.map((g) => g.nhom.code), ["missing_info"]);
    assert.equal(bao("call_back"), baoNhomTrong(NHAN.call_back), "mã call_back: nhóm trống phải có chữ báo");
    assert.equal(bao("missing_info"), null, "mã missing_info: nhóm có việc không được báo");
    assert.deepEqual(timNhom({ bo: BO_NHOM_MAC_DINH, dangHien, ma: "missing_info" }), { nhom: "missing_info", dong: "nhom:missing_info" });
  });

  it("chiều đỏ: mong không chữ báo cho mã nhóm trống thì đỏ, nêu mã", () => {
    const lech = (ma: string, mong: string | null) => (bao(ma) === mong ? null : `mã ${ma}: ra ${JSON.stringify(bao(ma))}, mong ${JSON.stringify(mong)}`);
    assert.match(lech("call_back", null) ?? "", /mã call_back/);
  });
});
