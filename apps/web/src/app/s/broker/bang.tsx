// Trang nhóm môi giới (hàng 44): đầu trang (định nghĩa phí, mức chia) và bảng chỉ đọc theo `than.cot`, `than.dong` của lõi —
// mọi chữ là bản ra của luật ẩn (KH-tk-ban-ra). Căn đã cọc, tạm ngưng hay không còn giữ chỗ thì dòng mờ (KH-tk-song).
// Bảng là Table của shadcn/ui (thang dùng lại bậc 5): bộ ≤ 30 căn, chỉ đọc — không cần lưới ảo hoá của Bảng hàng.
import { cauDinhNghiaPhi, cauMucChia } from "@quy-hang/core/sharing";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ThanTrang } from "../[code]/doc";
import { BaoMo } from "../[code]/bao-mo";
import { CHU_MG } from "./chu";
import { NutTai } from "./nut-tai";

/** Một link, hai cách hiện (Hỏi-5): thân của Lần gửi nhóm môi giới ra bảng này, khách riêng ra trang thẻ. */
export const laTrangMoiGioi = (than: ThanTrang | null): than is ThanTrang => than?.nguoiNhan === "nhom_moi_gioi";

/** Căn còn bán thì dòng đậm; còn lại mờ. */
export const dongMo = (than: ThanTrang, i: number) => than.can[i]?.availability !== "available";

export function BangMoiGioi({ code, than }: { code: string; than: ThanTrang }) {
  const cot = than.cot ?? [];
  const dong = than.dong ?? [];
  return (
    <>
      <BaoMo code={code} />
      <section className="flex flex-col gap-3 px-4 py-3">
        <div className="text-muted-foreground flex flex-col gap-1 text-sm">
          {than.dinhNghiaPhi ? <p>{cauDinhNghiaPhi(than.dinhNghiaPhi)}</p> : null}
          {than.mucChia !== undefined ? <p className="text-foreground font-medium">{cauMucChia(than.mucChia)}</p> : null}
        </div>
        <NutTai than={than} code={code} />
        <p className="text-muted-foreground text-xs sm:hidden">{CHU_MG.cuonNgang}</p>
        <Table>
          <TableHeader>
            <TableRow>
              {cot.map((c) => (
                <TableHead key={c.khoa}>{c.nhan}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dong.map((d, i) => (
              <TableRow key={i} data-mo={dongMo(than, i) || undefined} className={dongMo(than, i) ? "text-muted-foreground" : undefined}>
                {d.map((o, j) => (
                  <TableCell key={j}>{o}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </>
  );
}
