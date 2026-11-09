// Hàng logo-onehub: tệp hình trùng bản OneHub CRM, hai chỗ gọi một nguồn, trang khách không nhận dấu hiệu.
// Mỗi phép đo là một hàm kiểm thuần trả danh sách lỗi; ca phá thử chạy CÙNG hàm trên vật bị phá, ghim thông điệp.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import manifest from "../app/manifest";

const WEB = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC = join(WEB, "src");

// Băm viết tay của bản CRM (~/dev/crm, commit 6adaf11e0): CI không có kho CRM nên không đọc được bản gốc.
const BAM_CRM: Record<string, string> = {
  "public/icons/onehub-mark.svg": "74163c9169c2afc44701f4fc0c80d3a1a61f8abd5164a10dca16039e88b48732",
  "src/app/favicon.ico": "401e90c6536b9106dd96298a4594888e9cc20ea9c4875a60cee3655277b8de0c",
  "public/icons/apple-touch-icon.png": "bee8be6f9e8710776a52103666509c98297b95a3246df2c522b6323edb51c458",
  "public/icons/icon-192.png": "6e5dad7b70657b71f07bfddfd4f9435f3a108fe1c2e98774158b1779273c43e5",
  "public/icons/icon-512.png": "6922530c0ac977abc5cf44abd7a29ab6dfe2c88979d2713edfb43de73d9ec5c4",
};

type Manifest = { name?: string; short_name?: string; icons?: readonly { src: string }[] };
type TepNguon = { duong: string; noiDung: string };

function kiemBam(docTep: (duong: string) => Buffer): string[] {
  return Object.entries(BAM_CRM).flatMap(([duong, bam]) =>
    createHash("sha256").update(docTep(duong)).digest("hex") === bam ? [] : [`lệch băm: ${duong}`],
  );
}

function kiemManifest(m: Manifest, coTep: (src: string) => boolean): string[] {
  const loi: string[] = [];
  if (m.name !== "Quỹ hàng" || m.short_name !== "Quỹ hàng") loi.push("tên cài lệch");
  for (const icon of m.icons ?? []) if (!coTep(icon.src)) loi.push(`thiếu tệp biểu tượng: ${icon.src}`);
  if (!m.icons?.length) loi.push("manifest không khai biểu tượng");
  return loi;
}

function kiemHaiChoGoi(choGoi: Record<string, string>, nguon: TepNguon[]): string[] {
  const loi: string[] = [];
  for (const [ten, ma] of Object.entries(choGoi)) {
    if (!ma.includes("<DauHieuOneHub")) loi.push(`không gọi DauHieuOneHub: ${ten}`);
    if (ma.includes("BoxesIcon")) loi.push(`còn ô hộp cũ: ${ten}`);
  }
  const lanKhai = nguon.reduce((n, t) => n + (t.noiDung.split("/icons/onehub-mark.svg").length - 1), 0);
  if (lanKhai !== 1) loi.push(`đường dẫn dấu hiệu khai ${lanKhai} lần`);
  return loi;
}

function kiemTrangKhach(nguon: TepNguon[]): string[] {
  return nguon.flatMap((t) => (/dau-hieu-onehub|onehub-mark/.test(t.noiDung) ? [`trang khách nhận dấu hiệu: ${t.duong}`] : []));
}

function duyet(goc: string): string[] {
  return readdirSync(goc).flatMap((ten) => {
    const p = join(goc, ten);
    return statSync(p).isDirectory() ? duyet(p) : /\.tsx?$/.test(ten) ? [p] : [];
  });
}

const docNguon = (goc: string): TepNguon[] => duyet(goc).map((p) => ({ duong: relative(WEB, p), noiDung: readFileSync(p, "utf8") }));
const docTepWeb = (duong: string): Buffer => readFileSync(join(WEB, duong));
const coTepCongKhai = (src: string): boolean => existsSync(join(WEB, "public", src));
const CHO_GOI = {
  "home-rail": readFileSync(join(SRC, "components/shell/home-rail.tsx"), "utf8"),
  khung: readFileSync(join(SRC, "app/(auth)/khung.tsx"), "utf8"),
};
const nguonGiaoDien = (): TepNguon[] => docNguon(SRC).filter((t) => !t.duong.endsWith(".test.ts"));

describe("logo-onehub", () => {
  it("AC-3 tệp hình trùng từng byte với CRM", () => {
    assert.deepEqual(kiemBam(docTepWeb), []);
    assert.deepEqual(kiemManifest(manifest(), coTepCongKhai), []);
  });

  it("AC-3 phá thử: đổi một byte, đổi tên cài", () => {
    const pha = (duong: string) => {
      const b = Buffer.from(docTepWeb(duong));
      if (duong.endsWith("icon-192.png")) b.writeUInt8(b.readUInt8(b.length - 1) ^ 1, b.length - 1);
      return b;
    };
    assert.deepEqual(kiemBam(pha), ["lệch băm: public/icons/icon-192.png"]);
    assert.deepEqual(kiemManifest({ ...manifest(), name: "OneHub" }, coTepCongKhai), ["tên cài lệch"]);
  });

  it("AC-5 hai chỗ gọi một nguồn", () => {
    assert.deepEqual(kiemHaiChoGoi(CHO_GOI, nguonGiaoDien()), []);
  });

  it("AC-5 phá thử: còn ô hộp, khai đường dẫn lần hai", () => {
    assert.deepEqual(kiemHaiChoGoi({ ...CHO_GOI, "home-rail": `${CHO_GOI["home-rail"]}\n<BoxesIcon />` }, nguonGiaoDien()), [
      "còn ô hộp cũ: home-rail",
    ]);
    assert.deepEqual(kiemHaiChoGoi(CHO_GOI, [...nguonGiaoDien(), { duong: "gia.tsx", noiDung: "/icons/onehub-mark.svg" }]), [
      "đường dẫn dấu hiệu khai 2 lần",
    ]);
  });

  it("AC-6 trang khách không nhận dấu hiệu", () => {
    const nguon = docNguon(join(SRC, "app/s"));
    assert.ok(nguon.length > 0, "không đọc được tệp nào của trang khách");
    assert.deepEqual(kiemTrangKhach(nguon), []);
  });

  it("AC-6 phá thử: tệp trang khách nhập dấu hiệu", () => {
    assert.deepEqual(kiemTrangKhach([{ duong: "gia.tsx", noiDung: 'import { DauHieuOneHub } from "@/components/dau-hieu-onehub";' }]), [
      "trang khách nhận dấu hiệu: gia.tsx",
    ]);
  });
});
