/**
 * Cách đọc mã căn của một dự án (hàng 9). Cách đọc là dữ liệu: thêm dự án là thêm một dòng ở `UNIT_CODE_RULES`, không
 * đổi hàm đọc. Mã viết liền như `A1206` chỉ tách được tầng và trục khi biết bề rộng trục của dự án.
 */
export type UnitCodeRule = {
  projectKey: string;
  /** Mẫu mã đưa cho người gõ khi chuỗi không đọc được. */
  example: string;
  /** Biểu thức chính quy (không neo) cho phần toà, trên chuỗi đã chữ hoa. */
  buildingPattern: string;
  floorWidth: number;
  stackWidth: number;
  /** Mẫu dựng mã chuẩn: `{b}` toà, `{f}` tầng đủ `floorWidth`, `{s}` trục đủ `stackWidth` chữ số. */
  template: string;
};

/** Dự án mẫu của hàng 5: Toà A/B, 15 tầng × 6 trục, mã `A-12.06`. Dự án thật thêm dòng khi nạp danh mục thật. */
export const UNIT_CODE_RULES: readonly UnitCodeRule[] = [
  { projectKey: "mau-du-an-thu", example: "A-12.06", buildingPattern: "[A-Z]", floorWidth: 2, stackWidth: 2, template: "{b}-{f}.{s}" },
];

export type UnitCodeParts = {
  building: string;
  floor: number;
  /** Trục đủ `stackWidth` chữ số, như danh mục ghi. */
  stack: string;
  /** Mã chuẩn dựng theo `template`. */
  unitNumber: string;
};

/** Chuẩn hoá chuỗi gõ: NFKC, bỏ khoảng trắng hai đầu, chữ hoa. */
export function normalizeCode(input: string): string {
  return input.normalize("NFKC").trim().toUpperCase();
}

const SEP = "[-._/\\s]";

/**
 * Đọc chuỗi gõ theo cách đọc của dự án. Giữa các phần nhận `-` `.` `/` `_`, khoảng trắng hoặc không có gì; có dấu phân
 * cách giữa tầng và trục thì hai phần được thiếu số 0 đầu (`a 12 6`); viết liền thì trục đúng `stackWidth` chữ số.
 * Không đọc được → null.
 */
export function readUnitCode(rule: UnitCodeRule, input: string): UnitCodeParts | null {
  const s = normalizeCode(input);
  if (!s) return null;
  const b = `(${rule.buildingPattern})`;
  const coDau = new RegExp(`^${b}${SEP}*(\\d{1,${rule.floorWidth}})${SEP}+(\\d{1,${rule.stackWidth}})$`);
  const lien = new RegExp(`^${b}${SEP}*(\\d{1,${rule.floorWidth}})(\\d{${rule.stackWidth}})$`);
  const m = coDau.exec(s) ?? lien.exec(s);
  if (!m) return null;
  const [, building, f, st] = m as unknown as [string, string, string, string];
  const floor = Number(f);
  const stack = st.padStart(rule.stackWidth, "0");
  const unitNumber = rule.template
    .replace("{b}", building)
    .replace("{f}", String(floor).padStart(rule.floorWidth, "0"))
    .replace("{s}", stack);
  return { building, floor, stack, unitNumber };
}
