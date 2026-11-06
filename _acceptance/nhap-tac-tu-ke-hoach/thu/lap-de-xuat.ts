/**
 * Lập đề xuất ghi sẵn cho số đo AC-1 (hàng 68, Hỏi-1 «ghi sẵn», dòng sổ S1 «tác tử context sạch»).
 *
 *   node --import tsx thu/lap-de-xuat.ts --in <thư mục>     in ra <thư mục>: loi-nhac.txt và <tên file>.json (gói) cho mỗi
 *                                                          file có cột chưa ghép — đúng hai thứ máy chủ gửi Claude
 *   node --import tsx thu/lap-de-xuat.ts --ghi <thư mục>    đọc <tên file>.dau-ra.json do tác tử context sạch viết, ghi
 *                                                          de-xuat/<băm gói>.json kèm băm lời nhắc, băm gói, dấu «lập bởi»
 *
 * File không còn cột chưa ghép thì máy không gọi AI: tệp đề xuất ghi `dauRa: {de_xuat: []}` và «không gọi — không cột chưa
 * ghép». Tác tử context sạch chỉ nhận loi-nhac.txt và một tệp gói — không đọc kho, không thấy đáp án hay tiêu đề gốc.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { bamGoi, bamLoiNhac, cotChuaGhep, dungGoiDeXuat, LOI_NHAC } from "../../../packages/core/src/import";
import { chay } from "../../../packages/core/test/import/do";
import { danhMucMau, HOM_NAY, sinhBoThu } from "../../../packages/core/test/import/sinh";
import { sinhBoLa } from "./bo-la";

export const DE_XUAT_DIR = new URL("../de-xuat/", import.meta.url);
export const LAP_BOI = "lập bởi tác tử context sạch";
export const KHONG_GOI = "không gọi — không cột chưa ghép";
export type TepDeXuat = { ten: string; tieuDe: string[]; bamGoi: string; bamLoiNhac: string; lapBoi: string; ngay: string; dauRa: unknown };

export function boDo() {
  const ctx = { today: HOM_NAY, catalog: danhMucMau() };
  return [...sinhBoLa(), ...sinhBoThu()].map((t) => {
    const r = chay(t, ctx);
    return { t, r, goi: dungGoiDeXuat(r.profile.columns, r.plan) };
  });
}

async function main() {
  const [lenh, thuMuc] = process.argv.slice(2);
  if (!thuMuc || (lenh !== "--in" && lenh !== "--ghi")) throw new Error("dùng: lap-de-xuat.ts --in <thư mục> | --ghi <thư mục>");
  const bamLn = await bamLoiNhac();
  if (lenh === "--in") {
    mkdirSync(thuMuc, { recursive: true });
    writeFileSync(join(thuMuc, "loi-nhac.txt"), LOI_NHAC);
    for (const { t, goi } of boDo()) if (cotChuaGhep(goi).length) writeFileSync(join(thuMuc, `${t.ten}.json`), JSON.stringify(goi, null, 2));
    return;
  }
  mkdirSync(DE_XUAT_DIR, { recursive: true });
  const ngay = new Date().toISOString().slice(0, 10);
  for (const { t, goi } of boDo()) {
    const co = cotChuaGhep(goi).length > 0;
    const dauRa = co ? JSON.parse(readFileSync(join(thuMuc, `${t.ten}.dau-ra.json`), "utf8")) : { de_xuat: [] };
    const tep: TepDeXuat = { ten: t.ten, tieuDe: goi.cot.map((c) => c.tieuDe), bamGoi: await bamGoi(goi), bamLoiNhac: bamLn, lapBoi: co ? LAP_BOI : KHONG_GOI, ngay, dauRa };
    writeFileSync(new URL(`${tep.bamGoi}.json`, DE_XUAT_DIR), JSON.stringify(tep, null, 2) + "\n");
  }
}

if (process.argv[1]?.endsWith("lap-de-xuat.ts")) void main().catch((e) => { console.error(e); process.exit(1); });
