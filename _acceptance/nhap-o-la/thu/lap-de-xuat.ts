/**
 * Ghi đề xuất ô lạ ghi sẵn và số đo (hàng 69, AC-8). Đề xuất do tác tử context sạch lập: tác tử chỉ đọc lời nhắc
 * `LOI_NHAC_O_LA`, khuôn `KHUON_O_LA` và gói `dungGoiOLa` của bộ ô lạ, trả JSON — một tác tử chạy Opus 5.5, một chạy Haiku
 * 5.5. Đây là MÔ PHỎNG (không qua Claude API với đầu ra có khuôn); số qua API thật là điều kiện của phiên nghiệm thu (Hỏi-1).
 *
 * Dùng: node --import tsx _acceptance/nhap-o-la/thu/lap-de-xuat.ts <mô hình> <tệp đầu ra JSON>   — ghi một bộ đề xuất
 *       node --import tsx _acceptance/nhap-o-la/thu/lap-de-xuat.ts --so-do                     — tính lại so-do-o-la.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { bamJson } from "../../../packages/core/src/import/ai/goi";
import { bamLoiNhacOLa } from "../../../packages/core/src/import/ai/o-la";
import { chuanBi, MO_HINH_DO, tinhSoDoOLa } from "./do-o-la";

export type TepDeXuatOLa = { ten: string; moHinh: string; bamGoi: string; bamLoiNhac: string; lapBoi: string; ngay: string; dauRa: unknown };
export const DE_XUAT_DIR = new URL("../de-xuat-o-la/", import.meta.url);
export const SO_DO = new URL("../so-do-o-la.json", import.meta.url);
export const lapBoi = (moHinh: string) => `lập bởi tác tử context sạch (${moHinh})`;
export const docTep = (moHinh: string): TepDeXuatOLa => JSON.parse(readFileSync(new URL(`${moHinh}.json`, DE_XUAT_DIR), "utf8"));

export async function soDoTatCa() {
  const { goi } = chuanBi();
  const so = await Promise.all(MO_HINH_DO.map(async (m) => [m, await tinhSoDoOLa(goi, docTep(m).dauRa)] as const));
  return {
    ghi_chu: "Số đo ô lạ (hàng 69): đề xuất ghi sẵn do tác tử context sạch lập trên đúng gói và lời nhắc của mã — MÔ PHỎNG, không qua Claude API. Tính bằng _acceptance/nhap-o-la/thu/lap-de-xuat.ts --so-do.",
    mo_hinh: Object.fromEntries(so),
  };
}

if (process.argv[1]?.endsWith("lap-de-xuat.ts")) {
  const [a, b] = process.argv.slice(2);
  if (a === "--so-do") void soDoTatCa().then((x) => writeFileSync(SO_DO, `${JSON.stringify(x, null, 2)}\n`));
  else if (a && b) {
    const { goi } = chuanBi();
    void Promise.all([bamJson(goi), bamLoiNhacOLa()]).then(([bg, bl]) => {
      const tep: TepDeXuatOLa = { ten: "bo-o-la", moHinh: a, bamGoi: bg, bamLoiNhac: bl, lapBoi: lapBoi(a), ngay: new Date().toISOString().slice(0, 10), dauRa: JSON.parse(readFileSync(b, "utf8")) };
      writeFileSync(new URL(`${a}.json`, DE_XUAT_DIR), `${JSON.stringify(tep, null, 2)}\n`);
    });
  } else throw new Error("dùng: <mô hình> <tệp JSON> | --so-do");
}
