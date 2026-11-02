// Ảnh chuẩn của hệ bố cục (hàng 91, ADR-0024 quyết định 8): mỗi bố cục ba khổ sáng và khổ 1440 tối, chụp từ trang mẫu
// sống; `ke.json` ghi địa chỉ, khổ, giao diện, commit của từng tấm; danh mục của skill có một dòng cho mỗi bố cục.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { kieuBoCuc } from "./ban-do.mjs";

export const THU_MUC_ANH_CHUAN = "design/anh-chuan";
export const KHO_ANH_CHUAN = [1440, 1024, 375];
const CATALOG = ".agents/skills/quy-hang-ui/catalog.md";

/** Bề rộng PNG đọc từ khối IHDR (byte 16–19); không phải PNG thì null. */
export function beRongPng(buf) {
  if (buf.length < 24 || buf.toString("ascii", 1, 4) !== "PNG" || buf.toString("ascii", 12, 16) !== "IHDR") return null;
  return buf.readUInt32BE(16);
}

/** Danh sách tấm phải có: 7 bố cục × 3 khổ sáng, rồi 7 tấm 1440 tối. */
export function anhPhaiCo(root) {
  const ma = kieuBoCuc(root);
  return [
    ...ma.flatMap((b) => KHO_ANH_CHUAN.map((kho) => ({ tep: `${b}-${kho}.png`, boCuc: b, kho, giaoDien: "sang" }))),
    ...ma.map((b) => ({ tep: `${b}-1440-toi.png`, boCuc: b, kho: 1440, giaoDien: "toi" })),
  ];
}

/** @returns {{ loi: string[], sang: number, toi: number, ke: number }} */
export function kiemAnhChuan(root) {
  const loi = [];
  const d = join(root, THU_MUC_ANH_CHUAN);
  const phai = anhPhaiCo(root);
  if (phai.length !== 28) loi.push(`ảnh chuẩn: bảng bố cục có ${phai.length / 4} mã, phải là 7`);
  const co = existsSync(d) ? readdirSync(d).filter((f) => f.endsWith(".png")) : [];
  for (const a of phai) {
    if (!co.includes(a.tep)) {
      loi.push(`ảnh chuẩn thiếu: ${THU_MUC_ANH_CHUAN}/${a.tep}`);
      continue;
    }
    const rong = beRongPng(readFileSync(join(d, a.tep)));
    if (rong !== a.kho) loi.push(`ảnh chuẩn ${a.tep}: bề rộng ${rong ?? "không đọc được"}, phải là ${a.kho}`);
  }
  for (const f of co) if (!phai.some((a) => a.tep === f)) loi.push(`ảnh chuẩn lạ: ${THU_MUC_ANH_CHUAN}/${f}`);

  let ke = [];
  try {
    ke = JSON.parse(readFileSync(join(d, "ke.json"), "utf8"));
  } catch {
    loi.push(`ảnh chuẩn: không đọc được ${THU_MUC_ANH_CHUAN}/ke.json`);
  }
  if (!Array.isArray(ke)) ke = [];
  if (ke.length !== phai.length) loi.push(`ke.json: ${ke.length} dòng, phải là ${phai.length}`);
  for (const a of phai) {
    const dong = ke.filter((k) => k?.tep === a.tep);
    if (dong.length !== 1) {
      loi.push(`ke.json: ${a.tep} có ${dong.length} dòng, phải là 1`);
      continue;
    }
    const k = dong[0];
    const diaChi = `/mau/he-bo-cuc/xem?bo-cuc=${a.boCuc}&trang-thai=mac-dinh`;
    if (k.dia_chi !== diaChi) loi.push(`ke.json: ${a.tep} địa chỉ «${k.dia_chi}», phải là «${diaChi}»`);
    if (k.kho !== a.kho) loi.push(`ke.json: ${a.tep} khổ ${k.kho}, phải là ${a.kho}`);
    if (k.giao_dien !== a.giaoDien) loi.push(`ke.json: ${a.tep} giao diện ${k.giao_dien}, phải là ${a.giaoDien}`);
    if (!/^[0-9a-f]{40}$/.test(k.commit ?? "")) loi.push(`ke.json: ${a.tep} thiếu commit`);
  }

  const catalog = existsSync(join(root, CATALOG)) ? readFileSync(join(root, CATALOG), "utf8") : "";
  const muc = catalog.split("## Ảnh chuẩn của bố cục")[1]?.split(/\n## /)[0];
  if (muc === undefined) loi.push("catalog.md: thiếu mục «Ảnh chuẩn của bố cục»");
  else
    for (const b of kieuBoCuc(root))
      if (!muc.split("\n").some((l) => l.startsWith("|") && l.includes(`\`${b}\``) && l.includes(`${THU_MUC_ANH_CHUAN}/${b}-1440.png`)))
        loi.push(`catalog.md: mục ảnh chuẩn thiếu dòng của bố cục ${b}`);

  return { loi, sang: phai.filter((a) => a.giaoDien === "sang" && co.includes(a.tep)).length, toi: phai.filter((a) => a.giaoDien === "toi" && co.includes(a.tep)).length, ke: ke.length };
}
