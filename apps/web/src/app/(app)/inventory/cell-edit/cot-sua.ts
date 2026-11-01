/** Ba cột sửa được trên ô (hàng 15, luật 6: chỉ phần của lần rao; bốn phần chữ để hàng sau). Thuần — bài kiểm đọc được. */
import type { CotId } from "../cot";

export const COT_SUA: ReadonlySet<CotId> = new Set<CotId>(["listPrice", "feeInclusion", "standardStatus"]);
