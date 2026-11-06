// Kiểm đề xuất từng cột (hàng 68, AC-6, E6). Gói dựng bằng mã thật từ file lạ la-a-dong-nghia (bộ lạ của hàng 68); hai cột
// được sửa lớp tạm trên bản sao của gói để có cột mang giá trị và cột lớp nguồn — mọi khoá khác do `dungGoiDeXuat` sinh.
import assert from "node:assert/strict";
import { test } from "node:test";
import { sinhBoLa } from "../../../../../_acceptance/nhap-tac-tu-ke-hoach/thu/bo-la";
import { classifyColumns } from "../classify";
import { readTable } from "../grid";
import { planFromDictionary, validatePlan } from "../plan";
import { buildProfile } from "../profile";
import { dungGoiDeXuat, type GoiDeXuat } from "./goi";
import { gopDeXuat, kiemDeXuat, LY_DO_MAY_DE_XUAT } from "./kiem";

function dung() {
  const t = sinhBoLa().find((x) => x.ten === "la-a-dong-nghia")!;
  const table = readTable(t.grid!);
  const plan = planFromDictionary(table);
  const goi = dungGoiDeXuat(buildProfile(table, classifyColumns(table)).columns, plan);
  // Bản sao: cột 5 (giá) như bộ phân loại đã nhận ra lớp hàng chia sẻ được và gửi giá trị; cột 8 như lớp nguồn.
  const goi2: GoiDeXuat = structuredClone(goi);
  goi2.cot[5] = { ...goi2.cot[5]!, lop: "shareable_listing", giaTri: ["4.65", "5.1"] };
  goi2.cot[8] = { ...goi2.cot[8]!, lop: "source" };
  return { table, plan, goi, goi2 };
}
const LD = "tiêu đề và hình dạng cho thấy";

test("kiểm đề xuất từng cột", () => {
  const { table, plan, goi, goi2 } = dung();
  assert.deepEqual(goi.cot.filter((c) => !c.dich).map((c) => c.cot), [1, 2, 3, 5, 8, 10, 11, 12], "cột chưa ghép của la-a-dong-nghia");
  // Ma trận viết tay tám ca lỗi + một đề xuất đúng cùng lô.
  const CA: [string, Record<string, unknown>, number | null, RegExp][] = [
    ["khoá lạ", { cot: 1, dich: "buildingName", ly_do: LD, them: 1 }, 1, /khoá lạ/],
    ["đích ngoài trường chuẩn", { cot: 2, dich: "ownerEmail", ly_do: LD }, 2, /đích ngoài trường chuẩn/],
    ["cột đã ghép", { cot: 0, dich: "unitNumber", ly_do: LD }, 0, /đã ghép/],
    ["cột không có trong gói", { cot: 99, dich: "floor", ly_do: LD }, 99, /không có trong gói/],
    ["quy đổi cho cột lớp nguồn (không gửi giá trị)", { cot: 8, dich: "ownerName", ly_do: LD, quy_doi: [{ tu: "x", den: "y" }] }, 8, /không gửi giá trị/],
    ["quy đổi với giá trị không gửi", { cot: 5, dich: "listPrice", ly_do: LD, quy_doi: [{ tu: "9.99", den: "9.99" }] }, 5, /không có trong gói/],
    ["phép ngoài thực đơn", { cot: 3, dich: "bedroomsTotal", ly_do: LD, phep: { name: "regex" } }, 3, /ngoài thực đơn/],
    ["lý do rỗng", { cot: 10, dich: "listAgentName", ly_do: "  " }, 10, /thiếu lý do/],
  ];
  const dung1 = { cot: 12, dich: "keep_as_note", ly_do: "Cột chỉ có một giá trị lặp lại" };
  const kq = kiemDeXuat(goi2, { de_xuat: [...CA.map((c) => c[1]), dung1] });
  for (const [ten, , cot, re] of CA) {
    const l = kq.loi.find((x) => x.cot === cot);
    assert.ok(l && re.test(l.lyDo), `ca «${ten}»: cần lỗi ${re} ở cột ${cot}, có ${JSON.stringify(kq.loi)}`);
  }
  assert.deepEqual(kq.deXuat.map((d) => d.cot), [12], "đề xuất đúng cùng lô vẫn được giữ");
  const gop = gopDeXuat(table, plan, kq);
  // Cột chưa ghép bị bỏ: ở lại «Giữ làm ghi chú», độ tin thấp, có câu hỏi nêu vì sao; cột đã ghép giữ đích cũ.
  for (const cot of [1, 2, 3, 5, 8, 10]) {
    assert.equal(gop.columns[cot]!.target, "keep_as_note", `cột ${cot} về ghi chú`);
    assert.equal(gop.columns[cot]!.confidence, "low", `cột ${cot} độ tin thấp`);
    assert.ok(gop.questions.some((q) => q.includes(`«${table.headers[cot]}»: máy không đề xuất được`)), `câu hỏi cho cột ${cot}`);
  }
  assert.deepEqual(gop.columns[0], plan.columns[0], "cột đã ghép giữ nguyên");
  assert.ok(gop.columns[12]!.reason.startsWith(`${LY_DO_MAY_DE_XUAT}: `) && gop.columns[12]!.reason.includes(dung1.ly_do), "lý do mang tiền tố và lý do gốc");
  assert.deepEqual(validatePlan(gop, table), [], "kế hoạch gộp qua validatePlan");
});

test("kiểm đề xuất: trùng đích hạ về ghi chú, đúng thì gộp", () => {
  const { table, plan, goi } = dung();
  const kq = kiemDeXuat(goi, {
    de_xuat: [
      { cot: 5, dich: "listPrice", ly_do: "Tiêu đề «Giá niêm yết (tỷ)» là giá chào", phep: { name: "price", unit: "ty" } },
      { cot: 2, dich: "listPrice", ly_do: LD },
      { cot: 8, dich: "ownerPhone", ly_do: LD },
      { cot: 1, dich: "buildingName", ly_do: "Khối nhà là toà" },
    ],
  });
  assert.match(kq.loi.find((l) => l.cot === 2)?.lyDo ?? "", /trùng đích với cột «Giá niêm yết \(tỷ\)»/, "hai đề xuất cùng đích");
  assert.match(kq.loi.find((l) => l.cot === 8)?.lyDo ?? "", /trùng đích với cột «ĐT liên lạc»/, "trùng đích với cột đã ghép");
  const gop = gopDeXuat(table, plan, kq);
  assert.equal(gop.columns[5]!.target, "listPrice");
  assert.deepEqual(gop.columns[5]!.transform, { name: "price", params: { unit: "ty" } });
  assert.equal(gop.columns[1]!.target, "buildingName");
  assert.ok(gop.columns[1]!.transform, "phép thiếu thì lõi chọn");
  assert.equal(gop.columns[2]!.target, "keep_as_note");
  assert.ok(!gop.questions.includes("Cột «Khối nhà» là gì?"), "câu hỏi cũ của cột đã đề xuất được bỏ");
  assert.deepEqual(validatePlan(gop, table), []);
});

test("kiểm đề xuất: đầu ra sai khuôn ở gốc thì không cột nào", () => {
  const { goi } = dung();
  for (const v of [{ de_xuat: [], them: 1 }, { de_xuat: "x" }, null, "chữ", []]) {
    const kq = kiemDeXuat(goi, v);
    assert.deepEqual(kq.deXuat, [], JSON.stringify(v));
    assert.equal(kq.loi[0]?.cot, null);
    assert.match(kq.loi[0]!.lyDo, /sai khuôn/);
  }
});
