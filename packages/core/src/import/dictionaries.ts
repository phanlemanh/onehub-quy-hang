/**
 * Từ điển giá trị dựng sẵn của sản phẩm (Kiến trúc «Nhập dữ liệu» §12): cách gọi hay gặp → giá trị chuẩn. Đây là MẶC ĐỊNH;
 * từ điển của sàn đi qua ngữ cảnh (`companyAliases`) và thắng mặc định — bảng lưu và màn duyệt ở hàng 67, 70.
 */
import { FEE_INCLUSIONS } from "../listing/events";
import { STANDARD_STATUSES, type StandardStatus } from "../listing/status";
import type { StandardField } from "./fields";

/** So chữ: NFC, bỏ dấu, `đ→d`, chữ thường, gộp khoảng trắng. Phép so duy nhất của mọi từ điển nhập. */
export function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Một dòng từ điển của sàn: giá trị nguyên văn của sàn → giá trị chuẩn của một trường (bảng `company_value_aliases`). */
export type CompanyAlias = { field: StandardField; raw: string; value: string };

function bang(ds: Record<string, readonly string[]>): ReadonlyMap<string, string> {
  const m = new Map<string, string>();
  for (const [chuan, cach] of Object.entries(ds)) for (const c of cach) m.set(fold(c), chuan);
  return m;
}

/** Nhãn đủ và nhãn tắt của Tham chiếu §5, cộng cách gọi hay gặp trong file của sàn. */
export const STATUS_ALIASES = bang({
  Incomplete: ["Chưa đủ để rao", "Chưa đủ", "chưa đủ tin"],
  Active: ["Đang bán", "đang rao", "còn", "còn hàng", "mở bán"],
  Pending: ["Đang giao dịch", "Đang GD", "GD", "cọc", "đã cọc", "đặt cọc"],
  Closed: ["Đã bán", "đã chốt", "chốt", "bán rồi"],
  Hold: ["Tạm ngừng", "tạm dừng", "tạm hoãn"],
  Withdrawn: ["Ngừng hẳn", "Ngừng", "dừng bán", "không bán nữa"],
} satisfies Record<StandardStatus, readonly string[]>);

/** `included` = giá chào đã gồm phí (bao phí); `excluded` = chưa gồm (Tham chiếu luật 7). */
export const FEE_ALIASES = bang({
  included: ["BP", "bao phí", "Đã gồm phí", "gồm phí", "bao sang tên", "bao thuế phí"],
  excluded: ["KBP", "không bao phí", "Chưa gồm phí", "chưa phí", "chưa bao phí", "không gồm phí"],
} satisfies Record<(typeof FEE_INCLUSIONS)[number], readonly string[]>);

const HUONG_DON: Readonly<Record<string, string>> = { d: "Đông", t: "Tây", n: "Nam", b: "Bắc", dong: "Đông", tay: "Tây", nam: "Nam", bac: "Bắc" };
/** Tám hướng chuẩn — cách viết của danh mục (hàng 5): hướng ngang đứng trước hướng dọc. */
export const DIRECTIONS = ["Đông", "Tây", "Nam", "Bắc", "Đông Nam", "Đông Bắc", "Tây Nam", "Tây Bắc"] as const;

/** «ĐN», «Đ-N», «dong nam», «Đông Nam», «TB» → hướng chuẩn; không đọc được → null. */
export function readDirection(raw: string): string | null {
  const s = fold(raw).replace(/[-/.,_]/g, " ").trim();
  if (!s) return null;
  let phan = s.split(" ").filter(Boolean);
  if (phan.length === 1 && /^[dtnb]{1,2}$/.test(phan[0]!)) phan = [...phan[0]!];
  const ten = phan.map((p) => HUONG_DON[p]);
  if (ten.some((t) => t === undefined)) return null;
  const ket = ten.join(" ");
  return (DIRECTIONS as readonly string[]).includes(ket) ? ket : null;
}

/** Tra từ điển của sàn trước, rồi từ điển dựng sẵn. */
export function lookupAlias(
  field: StandardField,
  raw: string,
  builtIn: ReadonlyMap<string, string> | null,
  company: readonly CompanyAlias[] = [],
): string | null {
  const k = fold(raw);
  const cuaSan = company.find((a) => a.field === field && fold(a.raw) === k);
  if (cuaSan) return cuaSan.value;
  return builtIn?.get(k) ?? null;
}

export const isStatus = (v: string): v is StandardStatus => (STANDARD_STATUSES as readonly string[]).includes(v);
