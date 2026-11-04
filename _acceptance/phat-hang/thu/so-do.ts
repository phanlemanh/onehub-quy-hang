// Số đo «Số lần xuất bảng hàng» (hàng 43, E8c) trên các lần xuất đọc từ bảng exports: đọc mảng {createdAt} ở stdin, gọi
// đúng hàm đếm của lõi (`soLanXuat`, mã sheet_publishes) cho kỳ phủ trọn các lần ấy (lần đầu tới sau lần cuối một phút).
//   echo '[{"createdAt":"…"}]' | node --import tsx _acceptance/phat-hang/thu/so-do.ts
import { readFileSync } from "node:fs";
import { soLanXuat } from "../../../packages/core/src/metrics/index.ts";

const lanXuat = JSON.parse(readFileSync(0, "utf8")) as { createdAt: string }[];
const moc = lanXuat.map((l) => Date.parse(l.createdAt)).sort((x, y) => x - y);
const tu = moc[0] ?? Date.now();
const den = (moc.at(-1) ?? Date.now()) + 60_000;
console.log(JSON.stringify({ tu: new Date(tu).toISOString(), den: new Date(den).toISOString(), sheet_publishes: soLanXuat(lanXuat, { tu, den }) }));
