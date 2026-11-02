// Phạm vi chung của ba luật ESLint của hệ bố cục (hàng 91): tệp dưới apps/web/src, trừ chỗ được phép (bố cục, trạng thái,
// thành phần cài nguyên bản — cấu hình ESLint đã bỏ) và vùng của màn còn ngoại lệ có hạn.
import { trongVung, vungMienHan } from "./bo-cuc.mjs";
import { banDo, timGoc, tuongDoi } from "./goc-kho.mjs";

/** Trả đường tương đối gốc kho của tệp nếu luật áp cho nó, hay null. `cho` là danh sách tiền tố được phép. */
export function tepChiuLuat(context, { trong, cho = [] }) {
  const goc = timGoc(context.filename);
  if (!goc) return null;
  const tep = tuongDoi(goc, context.filename);
  if (!trong.some((t) => tep.startsWith(t))) return null;
  if (cho.some((c) => tep === c || tep.startsWith(c))) return null;
  const bd = banDo(goc);
  if (!bd.loi.length && trongVung(vungMienHan(bd), tep)) return null;
  return tep;
}
