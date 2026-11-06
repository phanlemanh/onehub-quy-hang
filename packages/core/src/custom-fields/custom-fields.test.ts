// Trường riêng (hàng 47): máy dò trùng nghĩa (E2), kiểm bộ trường (E3), lớp (E6b), không vào thoả thuận (E7b).
// Mỗi bảng viết trước; số assert đếm bằng số dòng.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { CONNECTION_KINDS, mayFlow, type Agreement } from "../agreements";
import type { ContactType } from "../contacts";
import { CEILING } from "../data-classes";
import type { TuVung } from "../labels";
import { LOP_TRUONG } from "../redaction/lop-truong";
import {
  doTrungNghia,
  kiemTruongRieng,
  lopTruongRieng,
  maTruongMoi,
  type DoiTuong,
  type TruongGui,
  type TruongRieng,
} from ".";

test("máy dò trùng nghĩa", () => {
  const tv: TuVung = { truong: { feeInclusion: "Phí sang tay" }, giaTri: {} };
  const BANG: [string, DoiTuong, string | null][] = [
    ["Hướng", "listing", "directionFaces"],
    ["Toà nhà", "listing", "buildingName"],
    ["Phí CN", "listing", "feeInclusion"],
    ["  HƯỚNG  ", "listing", "directionFaces"],
    ["Phí sang tay", "listing", "feeInclusion"],
    ["Diện tích", "listing", "livingArea"],
    ["Căn góc", "listing", null],
    ["Nội thất bàn giao", "listing", null],
    ["Số điện thoại", "contact", "phone"],
    ["Họ tên", "contact", "fullName"],
    ["Người mua", "contact", "contactTypes"],
    ["Nguồn khách", "contact", null],
  ];
  let dem = 0;
  for (const [ten, dt, mong] of BANG) {
    assert.equal(doTrungNghia(ten, dt, { tuVung: tv })?.truong ?? null, mong, `${dt} «${ten}»`);
    dem++;
  }
  assert.equal(dem, BANG.length);
});

const bo = (gui: TruongGui[], daCo: TruongRieng[] = []) => kiemTruongRieng(gui, daCo);
const loi = (gui: TruongGui[], daCo: TruongRieng[] = []) => {
  const kq = bo(gui, daCo);
  return kq.ok ? "" : kq.loi;
};
const ok = (gui: TruongGui[], daCo: TruongRieng[] = []) => bo(gui, daCo).ok;
const truongBool = (label: string, target: DoiTuong = "listing", contactTypes?: string[]): TruongGui => ({ target, kind: "bool", label, options: [], ...(contactTypes ? { contactTypes } : {}) });
const lc = (n: number) => Array.from({ length: n }, (_, i) => ({ label: `Lựa chọn ${i + 1}` }));

test("kiểm bộ trường", () => {
  const daCo = (() => {
    const kq = bo([truongBool("Căn góc"), { target: "listing", kind: "single_select", label: "Nội thất bàn giao", options: [{ label: "Cơ bản" }, { label: "Đầy đủ" }, { label: "Thô" }] }]);
    assert.ok(kq.ok);
    return kq.bo;
  })();
  const giuCu = daCo.map((t) => ({ code: t.code, target: t.target, kind: t.kind, label: t.label, options: t.options })) as TruongGui[];
  const sua = (code: string, f: (t: TruongGui) => TruongGui) => giuCu.map((t) => (t.code === code ? f(t) : t));
  const hai_muoi = Array.from({ length: 20 }, (_, i) => truongBool(`Trường ${i + 1}`, i % 2 ? "listing" : "contact", i % 2 ? undefined : ["Buyer"]));
  const BANG: [string, () => string | boolean, string | boolean][] = [
    ["tên rỗng", () => /chữ rỗng/.test(loi([truongBool("   ")])), true],
    ["tên 41 ký tự", () => /dài hơn 40/.test(loi([truongBool("a".repeat(41))])), true],
    ["tên 40 ký tự có khoảng trắng hai đầu", () => {
      const kq = bo([truongBool(`  ${"Căn".padEnd(40, "x")}  `)]);
      return kq.ok && kq.bo[0]!.label === "Căn".padEnd(40, "x");
    }, true],
    ["số điện thoại", () => /số điện thoại/.test(loi([truongBool("Gọi 0900 000 001")])), true],
    ["email", () => /email/.test(loi([truongBool("[Tên]@vidu.vn")])), true],
    ["kind text", () => /kind/.test(loi([{ target: "listing", kind: "text", label: "Ghi chú căn" }])), true],
    ["chọn một không lựa chọn", () => /ít nhất một lựa chọn/.test(loi([{ target: "listing", kind: "single_select", label: "Mức", options: [] }])), true],
    ["31 lựa chọn", () => /tối đa 30/.test(loi([{ target: "listing", kind: "single_select", label: "Mức", options: lc(31) }])), true],
    ["30 lựa chọn", () => ok([{ target: "listing", kind: "single_select", label: "Mức", options: lc(30) }]), true],
    ["hai lựa chọn trùng chữ", () => /trùng chữ/.test(loi([{ target: "listing", kind: "single_select", label: "Mức", options: [{ label: "Thô" }, { label: "thô" }] }])), true],
    ["hai trường hàng trùng tên", () => /trùng tên/.test(loi([truongBool("Căn góc"), truongBool("căn  góc")])), true],
    ["cùng tên khác đối tượng", () => ok([truongBool("Căn góc"), truongBool("Căn góc", "contact", ["Buyer"])]), true],
    ["liên hệ không loại", () => /ít nhất một loại/.test(loi([truongBool("Nguồn khách", "contact", [])])), true],
    ["21 trường còn sống", () => /tối đa 20/.test(loi([...hai_muoi, truongBool("Trường 21")])), true],
    ["20 còn sống + 5 đã bỏ", () => {
      const kq = bo(hai_muoi);
      assert.ok(kq.ok);
      const bo5 = Array.from({ length: 5 }, (_, i) => ({ ...kq.bo[i]!, archived: true }));
      const conLai = kq.bo.slice(5).map((t) => ({ code: t.code, target: t.target, contactTypes: t.contactTypes, kind: t.kind, label: t.label, options: [] }));
      return ok([...conLai, ...Array.from({ length: 5 }, (_, i) => truongBool(`Mới ${i + 1}`))], [...bo5, ...kq.bo.slice(5)]);
    }, true],
    ["đổi kind", () => /kind không đổi/.test(loi(sua("can_goc", (t) => ({ ...t, kind: "single_select", options: [{ label: "Có" }] })), daCo)), true],
    ["đổi target", () => /target không đổi/.test(loi(sua("can_goc", (t) => ({ ...t, target: "contact", contactTypes: ["Buyer"] })), daCo)), true],
    ["đổi contactTypes", () => {
      const lh = bo([truongBool("Nguồn", "contact", ["Buyer"])]);
      assert.ok(lh.ok);
      return /contactTypes không đổi/.test(loi([{ code: lh.bo[0]!.code, target: "contact", contactTypes: ["Buyer", "Tenant"], kind: "bool", label: "Nguồn", options: [] }], lh.bo));
    }, true],
    ["bỏ lựa chọn tho", () => /không gỡ được/.test(loi(sua("noi_that_ban_giao", (t) => ({ ...t, options: t.options!.filter((o) => o.code !== "tho") })), daCo)), true],
    ["đổi chữ lựa chọn tho", () => ok(sua("noi_that_ban_giao", (t) => ({ ...t, options: t.options!.map((o) => (o.code === "tho" ? { ...o, label: "Thô (bàn giao)" } : o)) })), daCo), true],
    ["thêm lựa chọn", () => ok(sua("noi_that_ban_giao", (t) => ({ ...t, options: [...t.options!, { label: "Cao cấp" }] })), daCo), true],
    ["đổi tên sang trùng nghĩa", () => /trung-nghia/.test(loi(sua("can_goc", (t) => ({ ...t, label: "Hướng" })), daCo)), true],
  ];
  let dem = 0;
  for (const [ten, chay, mong] of BANG) {
    assert.equal(chay(), mong, ten);
    dem++;
  }
  assert.equal(dem, BANG.length);
  assert.equal(maTruongMoi("Căn góc", []), "can_goc");
  assert.equal(maTruongMoi("Căn góc", ["can_goc"]), "can_goc_2");
  // Mã của trường đã bỏ không dùng lại.
  const daBo = daCo.map((t) => (t.code === "can_goc" ? { ...t, archived: true } : t));
  const kq = bo([...sua("can_goc", (t) => t).filter((t) => t.code !== "can_goc"), truongBool("Căn góc")], daBo);
  assert.ok(kq.ok && kq.bo.some((t) => t.code === "can_goc_2" && !t.archived), "trường mới cùng tên phải mang mã mới");
});

test("lớp của trường riêng", () => {
  const MA_TRAN = JSON.parse(readFileSync(new URL("./ma-tran-lop.json", import.meta.url), "utf8")) as { target: DoiTuong; contactTypes: ContactType[]; lop: string }[];
  assert.equal(MA_TRAN.length, 8);
  let dem = 0;
  for (const d of MA_TRAN) {
    assert.equal(lopTruongRieng(d.target, d.contactTypes), d.lop, `${d.target} ${JSON.stringify(d.contactTypes)}`);
    dem++;
  }
  assert.equal(dem, 8);
});

test("trường riêng không vào thoả thuận", () => {
  const at = new Date("2026-11-06T00:00:00Z");
  let dem = 0;
  for (const kind of CONNECTION_KINDS) {
    const a: Agreement = {
      id: "x", companyId: "c", kind, direction: "outbound", counterparty: "[Bên kia]",
      dataClasses: ["custom_field", "catalog"], validFrom: new Date("2026-01-01"), validUntil: null, status: "active", approvedBy: "[Tên]", specialTerms: false,
    };
    assert.equal(mayFlow(a, "custom_field", { at }).ok, false, `${kind}: custom_field ra ngoài`);
    assert.equal(mayFlow(a, "source", { at }).ok, false, `${kind}: source ra ngoài`);
    assert.equal(mayFlow(a, "catalog", { at }).ok, true, `${kind}: đối chứng catalog`);
    dem++;
  }
  assert.equal(dem, CONNECTION_KINDS.length);
  assert.equal(LOP_TRUONG.contacts, "source");
  assert.equal(LOP_TRUONG.customFields, "custom_field");
  for (const lop of ["custom_field", "source"] as const) assert.ok(!["external", "by_agreement"].includes(CEILING[lop]), `${lop} có trần ra ngoài`);
});
