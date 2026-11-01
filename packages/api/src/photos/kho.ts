import type pg from "pg";
import { cauHinhS3, duongDoiTuong, khoS3, LOI_THIEU_KHOA } from "./kho-s3";

/**
 * Kho byte ảnh (hàng 18, ADR-0014). Bản thật: Supabase Storage riêng tư (`kho-s3.ts`, đủ ba biến khoá). Máy dev,
 * CI, lượt chấm: bảng `unit_photo_files` dưới luật theo dòng. Bản thật thiếu khoá thì mục ảnh trả 503 với mã lỗi rõ —
 * không dựng sập cả API. Mọi lời gọi chạy SAU khi dòng ảnh đã đọc được bằng vai quy_hang_app trong cùng giao dịch.
 */
export type BienThe = "original" | "thumb";
export type DocAnh = { kind: "byte"; bytes: Buffer } | { kind: "link"; url: string } | null;
export type KhoAnh = {
  ten: "postgres" | "s3";
  ghi(tx: pg.PoolClient, companyId: string, photoId: string, bien: BienThe, bytes: Buffer, type: string): Promise<void>;
  xoa(tx: pg.PoolClient, companyId: string, photoId: string): Promise<void>;
  doc(tx: pg.PoolClient, companyId: string, photoId: string, bien: BienThe): Promise<DocAnh>;
  /** Kho có tải thẳng (bản Storage): link PUT cho bản gốc, đọc đầu bản gốc đã tải, xoá bản gốc sai. Bản Postgres không có. */
  taiThang?: {
    kyLinkTaiLen(companyId: string, photoId: string): string;
    kiemBanGoc(companyId: string, photoId: string): Promise<{ dau: Buffer; size: number } | null>;
    xoaGoc(companyId: string, photoId: string): Promise<void>;
  };
};
export type KhoAnhVang = { ten: "vang"; lyDo: string };

/** Link đọc ảnh sống 60 giây (AC-6). */
export const GIAY_LINK = 60;

export const khoPostgres: KhoAnh = {
  ten: "postgres",
  async ghi(tx, companyId, photoId, bien, bytes) {
    await tx.query("insert into unit_photo_files (company_id, photo_id, variant, content) values ($1, $2, $3, $4)", [companyId, photoId, bien, bytes]);
  },
  async xoa(tx, companyId, photoId) {
    await tx.query("delete from unit_photo_files where company_id = $1 and photo_id = $2", [companyId, photoId]);
  },
  async doc(tx, companyId, photoId, bien) {
    const { rows } = await tx.query<{ content: Buffer }>(
      "select content from unit_photo_files where company_id = $1 and photo_id = $2 and variant = $3",
      [companyId, photoId, bien],
    );
    return rows[0] ? { kind: "byte", bytes: rows[0].content } : null;
  },
};

export function khoTuS3(s3: ReturnType<typeof khoS3>): KhoAnh {
  return {
    ten: "s3",
    async ghi(_tx, companyId, photoId, bien, bytes, type) {
      await s3.ghi(duongDoiTuong(companyId, photoId, bien), bytes, type);
    },
    async xoa(_tx, companyId, photoId) {
      for (const b of ["original", "thumb"] as const) await s3.xoa(duongDoiTuong(companyId, photoId, b));
    },
    async doc(_tx, companyId, photoId, bien) {
      return { kind: "link", url: s3.link(duongDoiTuong(companyId, photoId, bien), GIAY_LINK) };
    },
    // Mọi đường đối tượng dựng từ mã sàn của phiên — không thể chạm đối tượng của sàn khác.
    taiThang: {
      kyLinkTaiLen: (companyId, photoId) => s3.linkTaiLen(duongDoiTuong(companyId, photoId, "original"), GIAY_LINK),
      kiemBanGoc: (companyId, photoId) => s3.docDau(duongDoiTuong(companyId, photoId, "original")),
      xoaGoc: (companyId, photoId) => s3.xoa(duongDoiTuong(companyId, photoId, "original")),
    },
  };
}

/** Chọn kho theo môi trường: đủ khoá → Storage; không khoá ngoài bản thật → Postgres; bản thật không khoá → vắng. */
export function chonKhoAnh(env: NodeJS.ProcessEnv = process.env, f: typeof fetch = fetch): KhoAnh | KhoAnhVang {
  let cfg;
  try {
    cfg = cauHinhS3(env);
  } catch (e) {
    return { ten: "vang", lyDo: (e as Error).message };
  }
  if (cfg) return khoTuS3(khoS3(cfg, f));
  if (env.NODE_ENV === "production") return { ten: "vang", lyDo: LOI_THIEU_KHOA };
  return khoPostgres;
}
