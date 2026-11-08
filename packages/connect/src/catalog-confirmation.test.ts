import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dungBaoSai, dungKhungToa, dungThuocTinhCan } from "@quy-hang/core/confirmation";
import { z } from "zod";
import { dauBaoSai, dauKhungToa, dauThuocTinhCan, nguCanhMau } from "../../core/src/confirmation/nen-thu.fixture";
import { CATALOG_CONFIRMATION_SCHEMA_VERSION, CatalogConfirmation, parseCatalogConfirmation } from "./catalog-confirmation";

const TEP_VI_DU = fileURLToPath(new URL("./catalog-confirmation.example.json", import.meta.url));

/** Ba sự kiện mẫu dựng bằng hàm của lõi trên danh mục mẫu, khoá bên nhận thử cố định — nguồn của tệp ví dụ. */
export function suKienMau(): Record<string, unknown>[] {
  const nc = nguCanhMau();
  const ra = [dungKhungToa(dauKhungToa(), nc), dungThuocTinhCan(dauThuocTinhCan(), nc), dungBaoSai(dauBaoSai(), nc)];
  return ra.map((kq) => {
    if (!kq.ok) throw new Error(JSON.stringify(kq.loi));
    return kq.suKien as unknown as Record<string, unknown>;
  });
}

/** Đi hết cây zod, gọi `tham` ở mỗi nút kèm đường (khoá object; `[]` cho phần tử mảng, `|n` cho nhánh hợp). */
function diCay(s: z.ZodTypeAny, duong: string[], tham: (s: z.ZodTypeAny, duong: string[]) => void): void {
  tham(s, duong);
  if (s instanceof z.ZodEffects) diCay(s.innerType(), duong, tham);
  else if (s instanceof z.ZodDiscriminatedUnion) [...s.options.values()].forEach((o: z.ZodTypeAny) => diCay(o, duong, tham));
  else if (s instanceof z.ZodUnion) (s.options as z.ZodTypeAny[]).forEach((o, i) => diCay(o, [...duong, `|${i}`], tham));
  else if (s instanceof z.ZodObject) for (const [k, v] of Object.entries(s.shape)) diCay(v as z.ZodTypeAny, [...duong, k], tham);
  else if (s instanceof z.ZodArray) diCay(s.element, [...duong, "[]"], tham);
  else if (s instanceof z.ZodNullable || s instanceof z.ZodOptional) diCay(s.unwrap(), duong, tham);
}

/** Mọi ZodString không có kiểm regex nào, kèm đường. */
function chuoiThieuMau(s: z.ZodTypeAny): { tong: number; thieu: string[] } {
  let tong = 0;
  const thieu: string[] = [];
  diCay(s, [], (n, duong) => {
    if (n instanceof z.ZodString) {
      tong++;
      if (!n._def.checks.some((c) => c.kind === "regex")) thieu.push(duong.join(".") || "(gốc)");
    }
  });
  return { tong, thieu };
}

/** Mọi ZodObject kèm đường và chế độ khoá lạ. */
function cacDoiTuong(s: z.ZodTypeAny): { duong: string[]; eventType: string; strict: boolean }[] {
  const ra: { duong: string[]; eventType: string; strict: boolean }[] = [];
  diCay(s, [], (n, duong) => {
    if (n instanceof z.ZodObject) {
      const et = n.shape["eventType"];
      ra.push({ duong, eventType: et instanceof z.ZodLiteral ? String(et.value) : "?", strict: n._def.unknownKeys === "strict" });
    }
  });
  return ra;
}

/** Mọi tên khoá object ở mọi cấp. */
function moiKhoa(s: z.ZodTypeAny): Set<string> {
  const ra = new Set<string>();
  diCay(s, [], (n) => {
    if (n instanceof z.ZodObject) for (const k of Object.keys(n.shape)) ra.add(k);
  });
  return ra;
}

test("khuôn v1: ba sự kiện của lõi đọc được", () => {
  assert.equal(CATALOG_CONFIRMATION_SCHEMA_VERSION, 1);
  const ba = suKienMau();
  assert.deepEqual(ba.map((e) => e["eventType"]), ["building_frame", "unit_attributes", "correction"]);
  for (const e of ba) {
    const r = parseCatalogConfirmation(e);
    assert.ok(r.ok, JSON.stringify(!r.ok && r.errors));
    if (r.ok) assert.deepEqual(r.event, e);
  }
});

test("tệp ví dụ trùng đầu ra hàm dựng", () => {
  assert.equal(readFileSync(TEP_VI_DU, "utf8"), JSON.stringify(suKienMau(), null, 2) + "\n");
});

test("phiên bản và loại sự kiện sai bị từ chối", () => {
  const [mau] = suKienMau();
  const maTran: [Record<string, unknown>, string][] = [
    [{ ...mau, schemaVersion: 0 }, "schemaVersion"],
    [{ ...mau, schemaVersion: 2 }, "schemaVersion"],
    [Object.fromEntries(Object.entries(mau ?? {}).filter(([k]) => k !== "schemaVersion")), "schemaVersion"],
    [{ ...mau, eventType: "listing_status" }, "eventType"],
  ];
  let dem = 0;
  for (const [e, duong] of maTran) {
    const r = parseCatalogConfirmation(e);
    assert.equal(r.ok, false, `${duong}: phải từ chối`);
    assert.ok(!r.ok && r.errors.some((x) => x.path.join(".") === duong), JSON.stringify(!r.ok && r.errors));
    dem++;
  }
  assert.equal(dem, 4);
});

test("mọi đối tượng của khuôn là strict", () => {
  const ds = cacDoiTuong(CatalogConfirmation);
  assert.equal(ds.length, 3, JSON.stringify(ds));
  for (const d of ds) assert.ok(d.strict, `${d.eventType} ${d.duong.join(".")}: không strict`);
});

test("không bao giờ có: khuôn từ chối khoá chèn ở mọi cấp", () => {
  const KHOA = ["ownerName", "ownerPhone", "floorPrice", "titleDeedPhoto", "closePrice", "standardStatus"];
  const theoLoai = new Map(suKienMau().map((e) => [e["eventType"] as string, e]));
  const capDo = cacDoiTuong(CatalogConfirmation);
  let dem = 0;
  for (const cap of capDo) {
    const mau = theoLoai.get(cap.eventType);
    assert.ok(mau, cap.eventType);
    assert.ok(parseCatalogConfirmation(mau).ok, `${cap.eventType}: đối chứng dương`);
    for (const k of KHOA) {
      // Mọi cấp hiện là gốc của từng loại (đường rỗng); cấp lồng sau này cũng đi qua đây vì danh sách rút từ cây.
      const chen = structuredClone(mau) as Record<string, unknown>;
      let dich: Record<string, unknown> = chen;
      for (const p of cap.duong) dich = dich[p] as Record<string, unknown>;
      dich[k] = "[Mồi]";
      const r = parseCatalogConfirmation(chen);
      assert.equal(r.ok, false, `${cap.eventType} · ${k}: phải từ chối`);
      assert.ok(
        !r.ok && r.errors.some((x) => x.path.join(".") === cap.duong.join(".") && x.message.includes(k)),
        `${cap.eventType} · ${k}: ${JSON.stringify(!r.ok && r.errors)}`,
      );
      dem++;
    }
  }
  assert.equal(dem, KHOA.length * capDo.length);
});

test("không chữ tự do: mọi chuỗi của khuôn có mẫu hoặc tập đóng", () => {
  const { tong, thieu } = chuoiThieuMau(CatalogConfirmation);
  assert.equal(tong, 19, "số chuỗi đếm được (4 vỏ × 3 + trục khung toà + 3 thuộc tính căn + 3 báo sai)");
  assert.deepEqual(thieu, []);
  // Đối chứng âm cùng hàm đếm.
  const thu = z.object({ a: z.string().regex(/^x$/), ghiChu: z.string() }).strict();
  assert.deepEqual(chuoiThieuMau(thu).thieu, ["ghiChu"]);
});

test("không chữ tự do: khuôn từ chối", () => {
  const [khung, can, baoSai] = suKienMau();
  const maTran: [Record<string, unknown>, string][] = [
    [{ ...can, unitNumber: "gọi chủ nhé" }, "unitNumber"],
    [{ ...can, unitNumber: "0900000071" }, "unitNumber"],
    [{ ...can, directionFaces: "Đông Nam view hồ" }, "directionFaces"],
    [{ ...khung, stacks: ["01", "TRUC-MOI-53"] }, "stacks.1"],
    [{ ...baoSai, field: "unitNumber", correctValue: "A 01 gọi lại" }, "correctValue"],
  ];
  let dem = 0;
  for (const [e, duong] of maTran) {
    const r = parseCatalogConfirmation(e);
    assert.equal(r.ok, false, `${duong}: phải từ chối`);
    assert.ok(!r.ok && r.errors.some((x) => x.path.join(".") === duong), `${duong}: ${JSON.stringify(!r.ok && r.errors)}`);
    dem++;
  }
  assert.equal(dem, 5);
});

test("không trỏ hàng, mốc thô", () => {
  const CAM = ["listingId", "listingKey", "contactId", "leadId", "listPrice", "closePrice", "standardStatus", "mlsStatus", "shareId"];
  const khoa = moiKhoa(CatalogConfirmation);
  assert.deepEqual(CAM.filter((k) => khoa.has(k)), []);
  const VO = ["schemaVersion", "officeKey", "memberKey", "observedOn", "buildingKey", "eventType"];
  const GOC: Record<string, string[]> = {
    building_frame: [...VO, "storiesTotal", "skippedFloors", "stacks"],
    unit_attributes: [...VO, "upi", "unitNumber", "livingArea", "bedroomsTotal", "directionFaces", "floor", "stack"],
    correction: [...VO, "upi", "field", "correctValue"],
  };
  for (const o of [...CatalogConfirmation.innerType().options.values()]) {
    const et = String((o.shape.eventType as z.ZodLiteral<string>).value);
    assert.deepEqual(Object.keys(o.shape).sort(), [...(GOC[et] ?? [])].sort(), et);
  }
  const ba = suKienMau();
  for (const e of ba) assert.equal(e["observedOn"], "2026-11-08");
  const maTran = ["2026-11-08T09:15:00Z", "2026-11-08 09:15", "08/11/2026"];
  let dem = 0;
  for (const v of maTran) {
    const r = parseCatalogConfirmation({ ...ba[0], observedOn: v });
    assert.ok(!r.ok && r.errors.some((x) => x.path.join(".") === "observedOn"), v);
    dem++;
  }
  assert.equal(dem, 3);
});
