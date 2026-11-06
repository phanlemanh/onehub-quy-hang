/** In từng cột của bộ lạ: tiêu đề · đích máy tất định · đích đáp án — để soi chỗ hụt nền. Chỉ đọc. */
import { chay } from "../../../packages/core/test/import/do";
import { danhMucMau, HOM_NAY } from "../../../packages/core/test/import/sinh";
import { sinhBoLa } from "./bo-la";
for (const t of sinhBoLa()) {
  const r = chay(t, { today: HOM_NAY, catalog: danhMucMau() });
  for (const [i, c] of r.plan.columns.entries()) if (c.target !== t.dapAn.targets[i]) console.log(t.ten, "|", c.column, "| máy:", c.target, c.confidence, "| đúng:", t.dapAn.targets[i]);
}
