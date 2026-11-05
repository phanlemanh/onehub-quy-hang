// Mã ảnh của máy khách ở lệnh thêm ảnh (hàng 41 chup-anh-dien-thoai, E5 · AC-4). Giao dịch giả giữ bảng ảnh theo mã, đủ
// các câu mà `uploadUrl`/`addPhoto` gửi; luật theo dòng thật ở bộ kiểm trên Postgres (test-db/photos.test.ts) — ở đây chỉ
// đo mã ảnh nào được ghi. Ma trận viết trước 4 ô: (bản Postgres · bản Storage) × (mã hợp lệ mới · mã sai khuôn).
import assert from "node:assert/strict";
import { test } from "node:test";
import type pg from "pg";
import { API_ERRORS } from "../errors";
import type { KhoAnh } from "./kho";
import { addPhoto, isRefusal, uploadUrl, type TepVao } from "./store";

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, ...new Array<number>(496).fill(7)]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...new Array<number>(56).fill(0)]);
const MA_KHACH = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const SAI_KHUON = "khong-phai-uuid";

/** Giao dịch giả: một bảng `unit_photos` theo mã; người xem luôn thấy nội bộ (quyền đo ở bộ kiểm Postgres). */
function txGia() {
  const dong = new Map<string, Record<string, unknown>>();
  const tx = {
    async query(sql: string, p: unknown[] = []) {
      if (sql.includes("can_see_unit_internal")) return { rows: [{ ok: true }], rowCount: 1 };
      if (sql.startsWith("select 1 from unit_photos where id")) return { rows: [], rowCount: dong.has(String(p[0])) ? 1 : 0 };
      if (sql.includes("max(display_order)")) return { rows: [{ n: dong.size }], rowCount: 1 };
      if (sql.startsWith("insert into unit_photos ")) {
        const id = String(p[10]);
        if (dong.has(id)) return { rows: [], rowCount: 0 };
        const d = { id, building_name: p[1], unit_number: p[2], compartment: p[3], display_order: p[4], is_cover: false, is_sample: false, taken_at: p[5], added_at: new Date(0), content_type: p[6], width: p[8], height: p[9] };
        dong.set(id, d);
        return { rows: [d], rowCount: 1 };
      }
      if (sql.startsWith("insert into unit_photo_events")) return { rows: [], rowCount: 1 };
      throw new Error(`câu lạ trong giao dịch giả: ${sql}`);
    },
  } as unknown as pg.PoolClient;
  return { tx, dong };
}

const khoPg: KhoAnh = { ten: "postgres", ghi: async () => {}, xoa: async () => {}, doc: async () => null };
const khoS3: KhoAnh = {
  ...khoPg,
  ten: "s3",
  taiThang: { kyLinkTaiLen: (_c, id) => `https://kho.test/${id}`, kiemBanGoc: async () => ({ dau: JPEG.subarray(0, 64), size: JPEG.length }), xoaGoc: async () => {} },
};

const chung = { toa: "[Toà mẫu]", ma: "A-06.01", ngan: "shareable" as const, takenAt: "2026-11-05", width: 2000, height: 1500, thumb: PNG };
type Ban = "postgres" | "storage";
type Them = typeof addPhoto;

/** Một ô: gửi ảnh theo đường của bản kho với mã của máy khách; trả mã đã ghi hay mã lỗi. */
async function chayO(ban: Ban, ma: string, them: Them): Promise<{ id: string } | { loi: string }> {
  const { tx } = txGia();
  if (ban === "postgres") {
    const r = await them(tx, khoPg, "c1", { ...chung, original: JPEG, photoId: ma });
    return isRefusal(r) ? { loi: r.error.code } : { id: r.anh.id };
  }
  const link = await uploadUrl(tx, khoS3, "c1", { toa: chung.toa, ma: chung.ma, contentType: "image/jpeg", byteSize: JPEG.length, photoId: ma });
  if (isRefusal(link)) return { loi: link.error.code };
  if (!link.truc_tiep) return { loi: "khong-tai-thang" };
  const r = await them(tx, khoS3, "c1", { ...chung, photoId: link.photoId });
  return isRefusal(r) ? { loi: r.error.code } : { id: r.anh.id };
}

const O: { ban: Ban; ma: "mới" | "sai khuôn" }[] = [
  { ban: "postgres", ma: "mới" },
  { ban: "postgres", ma: "sai khuôn" },
  { ban: "storage", ma: "mới" },
  { ban: "storage", ma: "sai khuôn" },
];

/** Bộ so: mỗi ô lệch thành một lời «<bản> · mã <loại> · <điều thấy>». */
async function lech(them: Them): Promise<string[]> {
  const ra: string[] = [];
  for (const o of O) {
    const kq = await chayO(o.ban, o.ma === "mới" ? MA_KHACH : SAI_KHUON, them);
    if (o.ma === "mới") {
      if ("loi" in kq) ra.push(`${o.ban} · mã mới · bị từ chối ${kq.loi}`);
      else if (kq.id !== MA_KHACH) ra.push(`${o.ban} · mã mới · id khác mã khách`);
    } else if (!("loi" in kq) || kq.loi !== API_ERRORS.invalidPayload.code) {
      ra.push(`${o.ban} · mã sai khuôn · ${"loi" in kq ? kq.loi : "đã ghi"} · mong ${API_ERRORS.invalidPayload.code}`);
    }
  }
  return ra;
}

test("E5 mã ảnh của máy khách: ma trận 4 ô (Postgres · Storage) × (mã hợp lệ mới · mã sai khuôn)", async () => {
  assert.equal(O.length, 4);
  assert.deepEqual(await lech(addPhoto), []);
});

test("E5 xác nhận lần hai cùng mã trả 409 photo-already-confirmed, không ghi thêm — cả hai bản", async () => {
  // Bản Postgres: gửi lại cùng thân (mất phản hồi lần đầu).
  const pgTx = txGia();
  const t: TepVao = { ...chung, original: JPEG, photoId: MA_KHACH };
  const dau = await addPhoto(pgTx.tx, khoPg, "c1", t);
  assert.ok(!isRefusal(dau) && dau.anh.id === MA_KHACH);
  const lai = await addPhoto(pgTx.tx, khoPg, "c1", t);
  assert.ok(isRefusal(lai) && lai.error.code === API_ERRORS.photoAlreadyConfirmed.code);
  assert.equal(pgTx.dong.size, 1);
  // Bản Storage: xin link lại và xác nhận lại cùng mã đều trả 409.
  const s3Tx = txGia();
  await addPhoto(s3Tx.tx, khoS3, "c1", { ...chung, photoId: MA_KHACH });
  const link = await uploadUrl(s3Tx.tx, khoS3, "c1", { toa: chung.toa, ma: chung.ma, contentType: "image/jpeg", byteSize: JPEG.length, photoId: MA_KHACH });
  assert.ok(isRefusal(link) && link.error.code === API_ERRORS.photoAlreadyConfirmed.code);
  const xn = await addPhoto(s3Tx.tx, khoS3, "c1", { ...chung, photoId: MA_KHACH });
  assert.ok(isRefusal(xn) && xn.error.code === API_ERRORS.photoAlreadyConfirmed.code);
  assert.equal(s3Tx.dong.size, 1);
});

test("E5 chiều đỏ: bản sao bỏ qua photoId ở bản Postgres → bộ so nêu đúng ô", async () => {
  const boQua: Them = (tx, kho, c, t) => addPhoto(tx, kho, c, "original" in t ? { ...t, photoId: undefined } : t);
  assert.deepEqual(await lech(boQua), ["postgres · mã mới · id khác mã khách", "postgres · mã sai khuôn · đã ghi · mong invalid-payload"]);
});
