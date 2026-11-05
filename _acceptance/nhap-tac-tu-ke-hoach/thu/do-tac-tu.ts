/**
 * Số đo có tác tử (hàng 68, AC-1, E1): trên bộ file lạ và bộ thử hàng 64, dựng gói như trình duyệt, cho qua quét lại của
 * máy chủ, nạp đề xuất ghi sẵn cho đúng gói (băm khớp), kiểm và gộp bằng lõi, coi người đồng ý mọi đề xuất (ca xấu nhất
 * cho lỗi lọt), áp kế hoạch, tính bốn số đo bằng `do.ts` của hàng 64. Ghi `so-do-tac-tu.json`:
 *   node --import tsx _acceptance/nhap-tac-tu-ke-hoach/thu/do-tac-tu.ts --ghi
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { applyPlan, bamGoi, gopDeXuat, kiemDeXuat, quetGoi } from "../../../packages/core/src/import";
import { doTep, type SoDo, type TiSo } from "../../../packages/core/test/import/do";
import { danhMucMau, HOM_NAY } from "../../../packages/core/test/import/sinh";
import { boDo, DE_XUAT_DIR, type TepDeXuat } from "./lap-de-xuat";

export type SoDoTacTu = { ghi_chu: string; hom_nay: string; tep: Record<string, SoDo>; cong_la: SoDo };
export const SO_DO_URL = new URL("../so-do-tac-tu.json", import.meta.url);

export function docDeXuat(): Map<string, TepDeXuat> {
  const m = new Map<string, TepDeXuat>();
  for (const f of readdirSync(DE_XUAT_DIR)) if (f.endsWith(".json")) {
    const t = JSON.parse(readFileSync(new URL(f, DE_XUAT_DIR), "utf8")) as TepDeXuat;
    m.set(t.bamGoi, t);
  }
  return m;
}

const cong = (a: TiSo, b: TiSo): TiSo => ({ tu: a.tu + b.tu, mau: a.mau + b.mau });

export async function tinhSoDoTacTu(): Promise<SoDoTacTu> {
  const ctx = { today: HOM_NAY, catalog: danhMucMau() };
  const deXuat = docDeXuat();
  const tep: Record<string, SoDo> = {};
  let la: SoDo | null = null;
  for (const { t, r, goi } of boDo()) {
    if (quetGoi(goi).length) throw new Error(`${t.ten}: gói bị máy chủ chặn — đường thật sẽ không gọi Claude`);
    const bam = await bamGoi(goi);
    const dx = deXuat.get(bam);
    if (!dx) throw new Error(`${t.ten}: gói đổi — ghi lại đề xuất (không có de-xuat/${bam}.json)`);
    const plan = gopDeXuat(r.table, r.plan, kiemDeXuat(goi, dx.dauRa));
    const s = doTep(t, { ...r, plan, applied: applyPlan(r.table, plan, ctx) });
    tep[t.ten] = s;
    if (t.ten.startsWith("la-"))
      la = la ? { ghepCot: cong(la.ghepCot, s.ghepCot), loiDuocSua: cong(la.loiDuocSua, s.loiDuocSua), loiLot: cong(la.loiLot, s.loiLot), hoiNguoi: cong(la.hoiNguoi, s.hoiNguoi), roNguon: cong(la.roNguon, s.roNguon) } : s;
  }
  return {
    ghi_chu: "Số đo có tác tử (hàng 68): đề xuất ghi sẵn do tác tử context sạch lập trên đúng gói đã che và lời nhắc của mã, người đồng ý mọi đề xuất. Tính bằng _acceptance/nhap-tac-tu-ke-hoach/thu/do-tac-tu.ts.",
    hom_nay: HOM_NAY,
    tep,
    cong_la: la!,
  };
}

if (process.argv[1]?.endsWith("do-tac-tu.ts") && process.argv.includes("--ghi"))
  void tinhSoDoTacTu()
    .then((s) => writeFileSync(SO_DO_URL, JSON.stringify(s, null, 2) + "\n"))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
