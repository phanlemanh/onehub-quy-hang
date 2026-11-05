/**
 * Cách đọc mã lô thấp tầng của một khu (hàng 74, ADR-0016 quyết định 3). Cách đọc là dữ liệu như `UNIT_CODE_RULES` của
 * hàng 9: thêm khu là thêm một dòng ở `LOT_CODE_RULES`, không đổi hàm đọc. Mã lô = dãy · lô, như `LK1-02`.
 */
export type LotCodeRule = {
  subdivisionKey: string;
  /** Mẫu mã đưa cho người gõ khi chuỗi không đọc được. */
  example: string;
  /** Biểu thức chính quy (không neo) cho phần dãy, trên chuỗi đã chữ hoa, bỏ dấu. */
  blockPattern: string;
  /** Số chữ số của lô trong mã chuẩn. */
  lotWidth: number;
  /** Mẫu dựng mã chuẩn: `{d}` dãy, `{l}` lô đủ `lotWidth` chữ số. */
  template: string;
};

/** Khu thấp tầng mẫu của hàng 73: dãy hai chữ cái một chữ số (LK1, SH1, BT1, DN1), lô hai chữ số, mã `LK1-02`. */
export const LOT_CODE_RULES: readonly LotCodeRule[] = [
  { subdivisionKey: "mau-khu-thap-tang", example: "LK1-01", blockPattern: "[A-Z]{2}\\d", lotWidth: 2, template: "{d}-{l}" },
];

export type LotCodeParts = { block: string; lot: string; unitNumber: string };

/** Chuẩn hoá chữ gõ: NFKC, bỏ dấu (Đ → D), chữ hoa, gọn khoảng trắng. */
export function normalizeLotInput(input: string): string {
  return input
    .normalize("NFKC")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ");
}

const SEP = "[-._/\\s]";

/**
 * Đọc chữ gõ theo cách đọc của khu. Bỏ chữ «lô», «dãy», «mã»; nhận dãy rồi lô (có dấu phân cách thì lô được thiếu số 0
 * đầu, viết liền thì lô đúng `lotWidth` chữ số) hoặc lô rồi dãy («lô 6 dãy BT1»). Mẫu neo hai đầu: «LK1-02A», «LK1-020»
 * không đọc được. Không đọc được → `null`.
 */
export function readLotCode(rule: LotCodeRule, input: string): LotCodeParts | null {
  const s = normalizeLotInput(input)
    .replace(/(^|\s)(LO|DAY|MA)(?=\s|$)/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  if (!s) return null;
  const b = `(${rule.blockPattern})`;
  const w = rule.lotWidth;
  const dayLo = new RegExp(`^${b}${SEP}+(\\d{1,${w}})$`);
  const lien = new RegExp(`^${b}(\\d{${w}})$`);
  const loDay = new RegExp(`^(\\d{1,${w}})${SEP}+${b}$`);
  let block: string | undefined;
  let lot: string | undefined;
  const m1 = dayLo.exec(s) ?? lien.exec(s);
  if (m1) {
    block = m1[1];
    lot = m1[2];
  } else {
    const m2 = loDay.exec(s);
    if (m2) {
      lot = m2[1];
      block = m2[2];
    }
  }
  if (block === undefined || lot === undefined) return null;
  const lo = lot.padStart(w, "0");
  return { block, lot: lo, unitNumber: rule.template.replace("{d}", block).replace("{l}", lo) };
}

export type LotRuleMismatch = { unitNumber: string; field: "unreadable" | "unitNumber" | "block"; expected: string; actual: string };

/** Đối chiếu cách đọc với danh mục của khu: mã danh mục đọc được, mã chuẩn bằng mã danh mục, dãy bằng dãy chứa lô. */
export function checkLotRuleAgainstSubdivision(
  rule: LotCodeRule,
  subdivision: { blocks?: readonly { blockKey: string; units: readonly { unitNumber: string }[] }[] },
): LotRuleMismatch[] {
  const out: LotRuleMismatch[] = [];
  for (const blk of subdivision.blocks ?? []) {
    for (const u of blk.units) {
      const parts = readLotCode(rule, u.unitNumber);
      if (!parts) {
        out.push({ unitNumber: u.unitNumber, field: "unreadable", expected: rule.example, actual: u.unitNumber });
        continue;
      }
      if (parts.unitNumber !== u.unitNumber) out.push({ unitNumber: u.unitNumber, field: "unitNumber", expected: u.unitNumber, actual: parts.unitNumber });
      if (parts.block !== blk.blockKey) out.push({ unitNumber: u.unitNumber, field: "block", expected: blk.blockKey, actual: parts.block });
    }
  }
  return out;
}
