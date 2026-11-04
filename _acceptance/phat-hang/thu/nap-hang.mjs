// Nạp hàng mẫu cho chỗ thử Xuất bảng hàng (hàng 43) trên máy dev dãy H (dựng trước bằng dung-h.mjs): hàng của hai đầu
// chủ mẫu theo packages/db/seed/mau/du-lieu-mau.json, nạp QUA API (đường ghi duy nhất); mỗi hàng có chủ nhà mẫu ở lớp
// nguồn (tên «[Mẫu] …», số 0900 000 0xx, giá đáy) để E7b dò rò rỉ. Chạy lại không nạp trùng. Khuôn lấy từ
// _acceptance/cot-ho-so-can/thu/dung-h.mjs.
//   node _acceptance/phat-hang/thu/nap-hang.mjs
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DUNG = path.join(GOC, "_acceptance/phat-hang/thu/dung-h.mjs");
const URL_GOC = "http://localhost:3494";
const MIEN = "mau.quy-hang.test";

const cookieCua = (email) =>
  JSON.parse(execFileSync("node", [DUNG, "--phien", email], { cwd: GOC }).toString())
    .cookie.map((c) => `${c.name}=${c.value}`)
    .join("; ");

async function goi(cookie, method, p, body) {
  const r = await fetch(`${URL_GOC}${p}`, {
    method,
    headers: { "content-type": "application/json", origin: URL_GOC, cookie },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const than = await r.json().catch(() => null);
  if (r.status >= 300) throw new Error(`${method} ${p} → ${r.status} ${JSON.stringify(than)}`);
  return than;
}

const mau = JSON.parse(readFileSync(path.join(GOC, "packages/db/seed/mau/du-lieu-mau.json"), "utf8"));
const toaCua = new Map();
for (const p of mau.danhMuc.subdivisions) for (const b of p.buildings) for (const u of b.units) toaCua.set(u.unitNumber, b.buildingName);
const chuNha = new Map(mau.chuNha.map((c) => [c.ma, c]));
const PHI = { bao_phi: "included", khong_bao_phi: "excluded" };

// Vào Đang bán cần một ảnh thật của căn — PNG 1×1 vào ngăn Gửi được bằng phiên trưởng nhóm.
const PNG_1X1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
async function taiAnhThat(ckTruongNhom, toa, ma) {
  const f = new FormData();
  for (const [k, v] of Object.entries({ toa, ma, compartment: "shareable", width: "1", height: "1" })) f.set(k, v);
  f.set("original", new File([PNG_1X1], "mau.png", { type: "image/png" }));
  f.set("thumb", new File([PNG_1X1], "mau-nhe.png", { type: "image/png" }));
  const r = await fetch(`${URL_GOC}/api/v1/units/photos`, { method: "POST", headers: { origin: URL_GOC, cookie: ckTruongNhom }, body: f });
  if (r.status !== 201) throw new Error(`tải ảnh thật ${toa} ${ma} → ${r.status} ${await r.text()}`);
}

async function napMot(ck, ckTruongNhom, h, i) {
  const toa = toaCua.get(h.maCan);
  const l = await goi(ck, "POST", "/api/v1/listings", { buildingName: toa, unitNumber: h.maCan });
  let v = l.version;
  const s = async (type, payload) => {
    v = (await goi(ck, "POST", `/api/v1/listings/${l.id}/events`, { type, payload, expectedVersion: v })).version;
  };
  const cn = chuNha.get(h.chuNha);
  await goi(ck, "PUT", `/api/v1/listings/${l.id}/owner`, {
    ownerName: cn?.ten ?? "[Mẫu] Chủ nhà",
    ownerPhone: cn?.soDienThoai ?? `0900 000 0${10 + i}`,
    floorPrice: Math.round((h.gia * 0.9) / 1_000_000) * 1_000_000,
  });
  if (h.trangThai !== "Withdrawn" || i % 2) await s("price_changed", { listPrice: h.gia, feeInclusion: PHI[h.dieuKienPhi] ?? "excluded" });
  const lenBan = ["Active", "Pending", "Closed"].includes(h.trangThai) || (h.trangThai === "Hold" && i % 2 === 0);
  if (lenBan) {
    await s("details_changed", { legalStatus: "[Mẫu] Sổ hồng", occupantType: i % 3 ? "[Mẫu] Để trống" : "[Mẫu] Chủ đang ở" });
    await taiAnhThat(ckTruongNhom, toa, h.maCan);
    await s("status_changed", { to: "Active" });
  }
  if (h.trangThai === "Pending") await s("status_changed", { to: "Pending" });
  if (h.trangThai === "Closed") await s("status_changed", { to: "Closed", closePrice: h.gia, closeDate: "2026-10-20" });
  if (h.trangThai === "Hold") await s("status_changed", { to: "Hold" });
  if (h.trangThai === "Withdrawn") await s("status_changed", { to: "Withdrawn", withdrawnReason: "unreachable" });
  if (i % 3 === 0 && h.trangThai !== "Closed" && h.trangThai !== "Withdrawn") await s("owner_confirmed", {});
}

const ckTruongNhom = cookieCua(`truong-nhom@${MIEN}`);
let so = 0;
for (const n of ["dau-chu-1", "dau-chu-2"]) {
  const ck = cookieCua(`${n}@${MIEN}`);
  const co = new Set((await goi(ck, "GET", "/api/v1/listings")).map((l) => `${l.buildingName}|${l.unitNumber}`));
  for (const [i, h] of mau.hang.filter((x) => x.dauChu === n).entries()) {
    if (co.has(`${toaCua.get(h.maCan)}|${h.maCan}`)) continue;
    await napMot(ck, ckTruongNhom, h, i);
    so++;
  }
}
console.log(JSON.stringify({ daNap: so }));
