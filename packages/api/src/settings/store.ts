import { giaiCauHinh, kiemGiaTri, SO_DIEM, timDiem, type DiemSo } from "@quy-hang/core/config";
import type pg from "pg";
import { rolesOf } from "../routing/store";

/**
 * Cấu hình theo sàn qua lối chung (hàng 82, ADR-0018 quyết định 3): đọc mọi điểm giá trị đơn đã mở của sổ, đổi một hay
 * nhiều điểm nguyên khối. Khuôn, khoảng, vai và ràng buộc chéo ở lõi (`@quy-hang/core/config`); nhật ký do trigger của
 * migration 026 ghi — lối này chỉ ghi bản hiện hành.
 */

/** Điểm lối chung đọc và đổi: giá trị đơn (không bảng riêng), không họ khoá, đã mở. */
export const laDiemChung = (d: DiemSo) => d.kieu.loai !== "map" && !d.khoa.includes("<") && d.tinhTrang === "mo";
export const DIEM_CHUNG: readonly DiemSo[] = SO_DIEM.filter(laDiemChung);

export type SettingRow = { key: string; value: unknown; source: "default" | "company"; updatedBy: string | null; updatedAt: string | null };
export type SettingsView = { items: SettingRow[]; errors: string[] };
export type SettingsRefusal = { refusal: "invalid"; reason: string } | { refusal: "forbidden" };

type DongSan = { key: string; value: unknown; updated_by: string; updated_at: Date };

async function dongCuaSan(tx: pg.PoolClient): Promise<DongSan[]> {
  return (
    await tx.query<DongSan>(
      "select key, value, updated_by, updated_at from company_settings where company_id = app.current_company_id() order by key",
    )
  ).rows;
}

export async function readCompanySettings(tx: pg.PoolClient): Promise<SettingsView> {
  const dong = await dongCuaSan(tx);
  const { cauHinh, loi } = giaiCauHinh(dong);
  const items = DIEM_CHUNG.map((d): SettingRow => {
    const r = dong.find((x) => x.key === d.khoa);
    // Dòng hỏng hay cặp trái luật đã về mặc định ở bộ giải: hiện nguồn «mặc định», lỗi nằm ở `errors`.
    const cuaSan = r !== undefined && JSON.stringify(r.value) === JSON.stringify(cauHinh[d.khoa]);
    return {
      key: d.khoa,
      value: cauHinh[d.khoa],
      source: cuaSan ? "company" : "default",
      updatedBy: cuaSan ? r.updated_by : null,
      updatedAt: cuaSan ? r.updated_at.toISOString() : null,
    };
  });
  return { items, errors: loi };
}

/** Đổi nguyên khối: một khoá sai thì không khoá nào được ghi. */
export async function writeCompanySettings(tx: pg.PoolClient, input: unknown): Promise<SettingsView | SettingsRefusal> {
  if (input === null || typeof input !== "object" || Array.isArray(input)) return { refusal: "invalid", reason: "thân phải là đối tượng khoá → giá trị" };
  const vao = Object.entries(input as Record<string, unknown>);
  if (vao.length === 0) return { refusal: "invalid", reason: "không có khoá nào để đổi" };
  for (const [khoa] of vao) {
    const d = timDiem(khoa);
    if (!d) return { refusal: "invalid", reason: `${khoa}: không có trong sổ điểm biến thiên` };
    if (d.kieu.loai === "map" || d.khoa.includes("<")) return { refusal: "invalid", reason: `${khoa}: có bảng hay lối riêng, không đổi qua lối chung` };
    if (d.tinhTrang !== "mo") return { refusal: "invalid", reason: `${khoa}: điểm chưa mở` };
  }
  const vai = await rolesOf(tx);
  if (!vao.every(([khoa]) => timDiem(khoa)!.aiDoi.some((r) => vai.includes(r)))) return { refusal: "forbidden" };

  // Cùng khoá với lối chia lead (hàng 25): hai lối không giẫm nhau khi đổi cặp hạn.
  await tx.query("select pg_advisory_xact_lock(hashtext('lead_routing:' || app.current_company_id()::text))");
  const dong = await dongCuaSan(tx);
  const { cauHinh } = giaiCauHinh(dong);
  const sau: Record<string, unknown> = { ...cauHinh, ...Object.fromEntries(vao) };
  for (const [khoa, giaTri] of vao) {
    const kq = kiemGiaTri(khoa, giaTri, sau);
    if (!kq.ok) return { refusal: "invalid", reason: kq.loi };
  }
  // Cặp `khongNhoHon` đang hỏng (bộ giải đã đưa về mặc định): lưu một nửa thì ghi thêm nửa kia bằng giá trị đang áp — đúng
  // giá trị vừa dùng để kiểm và đúng giá trị màn đang hiện — để bảng khớp cặp đã kiểm, không để lại nửa hỏng cũ
  // (luat-chia-lead-cap-han-hong, Hỏi-1 chủ kho duyệt 06/11). Cặp lành thì nửa kia đã lưu bằng đúng giá trị đang áp: không ghi.
  const ghi = new Map(vao);
  for (const [khoa] of vao) {
    const d = timDiem(khoa)!;
    const ban = [d.khongNhoHon, ...SO_DIEM.filter((x) => x.khongNhoHon === khoa).map((x) => x.khoa)].filter((k): k is string => !!k);
    for (const k of ban) {
      if (ghi.has(k)) continue;
      const luu = dong.find((r) => r.key === k);
      if (luu && JSON.stringify(luu.value) !== JSON.stringify(cauHinh[k])) ghi.set(k, cauHinh[k]);
    }
  }
  for (const [khoa, giaTri] of ghi) {
    await tx.query(
      `insert into company_settings (company_id, key, value, updated_by, data_class)
       values (app.current_company_id(), $1, $2::jsonb, app.current_user_id(), $3)
       on conflict (company_id, key) do update
         set value = excluded.value, updated_by = excluded.updated_by, updated_at = now(), data_class = excluded.data_class`,
      [khoa, JSON.stringify(giaTri), timDiem(khoa)!.lop],
    );
  }
  return readCompanySettings(tx);
}
