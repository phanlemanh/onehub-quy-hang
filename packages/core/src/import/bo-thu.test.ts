import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { bang, doTep, SO_NEN_URL, tinhSoNen, type ChayTep } from "../../test/import/do";
import { DICH_MAU_A, DICH_MAU_B, docDuLieuMau, ngayDung, sinhBoThu, type TepThu } from "../../test/import/sinh";
import { detectPersonal } from "./detect";
import { readTable } from "./grid";
import { planFromDictionary, validatePlan } from "./plan";
import type { AppliedCell } from "./apply";

test("ghép mẫu: mau-a 13/13, mau-b 16/16", () => {
  const boThu = sinhBoThu();
  for (const [ten, dich, n] of [["mau-a", DICH_MAU_A, 13], ["mau-b", DICH_MAU_B, 16]] as const) {
    const b = readTable(boThu.find((t) => t.ten === ten)!.grid!);
    assert.equal(b.headerRow, 0, `${ten}: dòng tiêu đề`);
    const k = planFromDictionary(b);
    assert.equal(k.columns.length, n, `${ten}: số cột`);
    k.columns.forEach((c, i) => assert.equal(c.target, dich[i], `${ten}: cột «${c.column}» ra ${c.target}, cần ${dich[i]}`));
    assert.ok(k.columns.every((c) => c.target), `${ten}: mọi cột có đích`);
    assert.deepEqual(k.columns.filter((c) => c.target === "ignore_with_reason").map((c) => c.column), ten === "mau-b" ? ["STT"] : []);
    assert.deepEqual(validatePlan(k, b), [], `${ten}: kế hoạch qua khuôn`);
  }
});

test("bộ thử: sinh hai lần cùng byte", () => {
  const hex = (ts: TepThu[]) => JSON.stringify(ts.map((t) => ({ ...t, bytes: t.bytes ? Buffer.from(t.bytes).toString("hex") : undefined })));
  assert.equal(hex(sinhBoThu()), hex(sinhBoThu()));
});

test("bộ thử: đáp án đủ và theo dữ liệu mẫu", () => {
  const d = docDuLieuMau();
  const can = new Map(d.danhMuc.subdivisions.flatMap((p) => p.buildings.flatMap((b) => b.units.map((u) => [u.unitNumber, { ...u, toa: b.buildingName, duAn: p.subdivisionName }]))));
  const chu = new Map(d.chuNha.map((c) => [c.ma, c]));
  const nguoi = new Map(d.nguoi.map((n) => [n.khoa, n.ten]));
  // Bảng ghép tay «đích → cách lấy từ dữ liệu mẫu», độc lập với bảng của bộ sinh.
  const LAY: Record<string, (i: number) => unknown> = {
    unitNumber: (i) => d.hang[i]!.maCan,
    buildingName: (i) => can.get(d.hang[i]!.maCan)!.toa,
    subdivisionName: (i) => can.get(d.hang[i]!.maCan)!.duAn,
    floor: (i) => can.get(d.hang[i]!.maCan)!.floor,
    livingArea: (i) => can.get(d.hang[i]!.maCan)!.livingArea,
    bedroomsTotal: (i) => can.get(d.hang[i]!.maCan)!.bedroomsTotal,
    directionFaces: (i) => can.get(d.hang[i]!.maCan)!.directionFaces,
    listPrice: (i) => d.hang[i]!.gia,
    feeInclusion: (i) => (d.hang[i]!.dieuKienPhi === "bao_phi" ? "included" : "excluded"),
    standardStatus: (i) => d.hang[i]!.trangThai,
    ownerName: (i) => chu.get(d.hang[i]!.chuNha)!.ten,
    ownerPhone: (i) => chu.get(d.hang[i]!.chuNha)!.soDienThoai.replace(/\s/g, ""),
    listAgentName: (i) => nguoi.get(d.hang[i]!.dauChu),
    confirmedDate: (i) => ngayDung(i),
  };
  for (const t of sinhBoThu()) {
    const da = t.dapAn;
    assert.ok(Number.isInteger(da.headerRow), `${t.ten}: headerRow`);
    assert.ok(da.targets.length > 0 && da.targets.every(Boolean), `${t.ten}: đích mọi cột`);
    assert.equal(da.dung.length, d.hang.length, `${t.ten}: đáp án mọi dòng`);
    let dem = 0;
    let canSo = 0;
    da.targets.forEach((dich, cot) => {
      const lay = LAY[dich];
      if (!lay) return;
      canSo += d.hang.length;
      da.dung.forEach((dong, i) => {
        assert.ok(bang(dong[cot] as never, lay(i) as never), `${t.ten} dòng ${i} cột ${cot} (${dich}): đáp án ${String(dong[cot])}, dữ liệu mẫu ${String(lay(i))}`);
        dem++;
      });
    });
    assert.equal(dem, canSo, `${t.ten}: số lần so`);
    for (const l of da.loiCay) assert.ok(Number.isInteger(l.dong) && Number.isInteger(l.cot) && l.nhan && ("value" in l || l.ask === true), `${t.ten}: nhãn lỗi cấy`);
  }
});

test("bộ thử: chỉ dữ liệu mẫu", () => {
  let so = 0;
  for (const t of sinhBoThu()) {
    const cells = t.grid ? t.grid.flat() : [new TextDecoder("windows-1258").decode(t.bytes!)];
    for (const c of cells) {
      if (typeof c !== "string") continue;
      for (const m of c.matchAll(/(?<!\d)(?:\+?84|0)[\s.\-()]*[1-9](?:[\s.\-()]*\d){8}(?!\d)/g)) {
        const n = m[0].replace(/\D/g, "").replace(/^84/, "0");
        assert.match(n, /^0900000\d{3}$/, `${t.ten}: số «${m[0]}» không phải số mẫu`);
        so++;
      }
    }
    const da = t.dapAn;
    da.targets.forEach((dich, cot) => {
      if (dich !== "ownerName" && dich !== "listAgentName") return;
      for (const dong of da.dung) if (dong[cot] !== null) assert.match(String(dong[cot]), /^\[Mẫu\]/, `${t.ten}: tên «${String(dong[cot])}»`);
    });
  }
  assert.ok(so > 0, "phải thấy số mẫu để kiểm");
  assert.equal(detectPersonal("0900 000 012"), "phone");
});

test("bộ thử: bộ sinh không nhập mã đang kiểm", () => {
  const thuMuc = new URL("../../test/import/", import.meta.url);
  const tep = readdirSync(thuMuc).filter((f) => f.endsWith(".ts"));
  assert.ok(tep.length > 0);
  for (const f of ["sinh.ts", "doc-xlsx.ts"]) {
    const chu = readFileSync(new URL(f, thuMuc), "utf8");
    for (const m of chu.matchAll(/^import\s+(type\s+)?[^;]*?from\s+"([^"]+)"/gms)) {
      if (m[2]!.includes("src/import")) assert.ok(m[1], `${f}: nhập «${m[2]}» không chỉ kiểu`);
    }
  }
});

test("số nền: tệp đã commit bằng lần tính lại", () => {
  const daGhi = JSON.parse(readFileSync(SO_NEN_URL, "utf8"));
  const moi = tinhSoNen();
  assert.deepEqual(daGhi, moi, "so-nen.json cũ — chạy lại: node --import tsx packages/core/test/import/ghi-so-nen.ts");
  for (const [ten, s] of Object.entries(moi.tep)) {
    for (const k of ["ghepCot", "loiDuocSua", "loiLot", "hoiNguoi", "roNguon"] as const) assert.ok(Number.isInteger(s[k].tu) && Number.isInteger(s[k].mau), `${ten}.${k}`);
    assert.equal(s.roNguon.tu, 0, `${ten}: rò nguồn`);
  }
  for (const ten of ["mau-a", "mau-b"]) assert.equal(moi.tep[ten]!.ghepCot.tu, moi.tep[ten]!.ghepCot.mau, `${ten}: ghép 100%`);
});

test("số nền: định nghĩa số đo trên bảng nhỏ viết tay", () => {
  // Ba dòng, hai cột (Mã căn, Giá); đáp án và đầu ra viết tay — tính tay: ghép 1/2, sửa 2/3, lọt 1/5, hỏi 1/6.
  const o = (mark: AppliedCell["mark"], value?: number | string): AppliedCell => ({ column: "", target: "unitNumber", raw: null, mark, value, by: "normalize" });
  const t: TepThu = {
    ten: "nho",
    dapAn: {
      headerRow: 0,
      targets: ["unitNumber", "listPrice"],
      dong: [1, 2, 3],
      dung: [["A-01.01", 1e9], ["A-01.02", 2e9], ["A-01.03", 3e9]],
      loiCay: [
        { dong: 0, cot: 0, nhan: "sửa đúng", value: "A-01.01" },
        { dong: 1, cot: 1, nhan: "hỏi người", ask: true },
        { dong: 2, cot: 1, nhan: "lọt", value: 3e9 },
      ],
      camLo: ["0900000001"],
    },
  };
  const r = {
    plan: { headerRow: 0, columns: [{ column: "", target: "unitNumber", confidence: "high", reason: "x" }, { column: "", target: "keep_as_note", confidence: "low", reason: "x" }], questions: [] },
    profile: { columns: [] },
    applied: { rows: [{ source: 1, cells: [o("fixed", "A-01.01"), o("keep", 1e9)], extra: {} }, { source: 2, cells: [o("keep", "A-01.02"), o("needs_person")], extra: {} }, { source: 3, cells: [o("keep", "A-01.03"), o("keep", 9e9)], extra: {} }] },
    table: { headerRow: 0, headerRows: 1, headers: [], rows: [], skipped: [] },
  } as unknown as ChayTep;
  assert.deepEqual(doTep(t, r), { ghepCot: { tu: 1, mau: 2 }, loiDuocSua: { tu: 2, mau: 3 }, loiLot: { tu: 1, mau: 5 }, hoiNguoi: { tu: 1, mau: 6 }, roNguon: { tu: 0, mau: 1 } });
});
