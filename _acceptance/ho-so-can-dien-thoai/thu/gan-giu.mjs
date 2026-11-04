// Bước dựng thêm cho S4 của hồ sơ ho-so-can-dien-thoai, chạy SAU «DỰNG B» (dung-b.mjs của bang-hang-dang-the). Sàn mẫu
// không có căn Toàn sàn nào có đầu chủ giữ, không căn nào có chủ nhà, nên E8 (đối chứng có mẫu nguồn), E9 (nút mang tên
// đầu chủ) và E10 (đầu chủ mở căn người khác giữ) không có căn để đo. Mọi bước qua API thật, không ghi thẳng DB:
//   - dau-chu-1 giữ A-04.06 (E9) và B-09.01 — Tạm ngưng, Toàn sàn, có chủ nhà mẫu và nút «Sẵn sàng bán» (E8 đối chứng);
//   - hai căn «Chỉ tôi» chưa đủ của dau-chu-1 rút khỏi rao (Đầu khách không mở được chúng, E8 phải chọn căn Toàn sàn);
//   - dau-chu-2 giữ mọi căn Toàn sàn còn lại, trừ A-08.03 để lại chưa ai giữ (E9 «căn chưa giữ»).
// Chạy lại được: bước đã ở đúng trạng thái thì bỏ qua.
//   node _acceptance/ho-so-can-dien-thoai/thu/gan-giu.mjs
import { cookieCua, URL_GOC } from "../../bang-hang-dang-the/thu/phien.mjs";

const DC1 = "dau-chu-1@mau.quy-hang.test";
const DC2 = "dau-chu-2@mau.quy-hang.test";
const TN = "truong-nhom@mau.quy-hang.test";
const CHU_MAU = { ownerName: "[Tên chủ mẫu]", ownerPhone: "0900 000 012", floorPrice: 3_200_000_000 };

const goi = async (email, duong, init = {}) => {
  const r = await fetch(`${URL_GOC}${duong}`, { ...init, headers: { "content-type": "application/json", origin: URL_GOC, cookie: (await cookieCua(email)).join("; "), ...init.headers } });
  if (!r.ok) throw new Error(`${duong}: ${r.status} ${await r.text()}`);
  return r.json();
};
const id1 = (await goi(DC1, "/api/v1/me")).user.id;
const id2 = (await goi(DC2, "/api/v1/me")).user.id;
const gan = async (l, userId) => {
  if (l.listAgentKey !== userId) await goi(TN, `/api/v1/listings/${l.id}/listing-agent`, { method: "PUT", body: JSON.stringify({ userId }) });
};
const doiTrangThai = async (email, l, payload) => {
  if (l.standardStatus === payload.to) return;
  await goi(email, `/api/v1/listings/${l.id}/events`, { method: "POST", body: JSON.stringify({ type: "status_changed", payload, expectedVersion: l.version }) });
};

const chung = await goi(TN, "/api/v1/listings");
const can = (ma) => chung.find((l) => l.unitNumber === ma) ?? (() => { throw new Error(`không thấy ${ma}`); })();
await gan(can("A-04.06"), id1);
const x = can("B-09.01");
await gan(x, id1);
await goi(DC1, `/api/v1/listings/${x.id}/owner`, { method: "PUT", body: JSON.stringify(CHU_MAU) });
for (const l of await goi(DC1, "/api/v1/listings")) {
  if (l.listAgentKey === id1 && l.visibility === "Private" && l.standardStatus === "Incomplete") await doiTrangThai(DC1, l, { to: "Withdrawn", withdrawnReason: "unreachable" });
}
let n2 = 0;
for (const l of chung) {
  if (["A-04.06", "B-09.01", "A-08.03"].includes(l.unitNumber)) continue;
  await gan(l, id2);
  n2++;
}
const giu = (await goi(DC1, "/api/v1/listings")).filter((l) => l.listAgentKey === id1).map((l) => `${l.unitNumber} ${l.standardStatus} ${l.visibility}`);
console.log(`dau-chu-1 giữ: ${giu.join(" · ")}`);
console.log(`dau-chu-2 giữ ${n2} căn Toàn sàn; A-08.03 chưa ai giữ`);
console.log(`đầu khách thấy A-04.06: ${JSON.stringify(await goi("dau-khach@mau.quy-hang.test", `/api/v1/listings/${can("A-04.06").id}/owner`))}`);
