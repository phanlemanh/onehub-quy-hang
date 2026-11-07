// Đọc và ghi của trang khách `/s/<mã>` (hàng 35). Không phiên: tìm Lần gửi qua `app.share_by_code` (migration 031), rồi
// đọc căn TRONG PHIÊN CỦA NGƯỜI GỬI — luật theo dòng của mọi bảng căn vẫn áp như khi người ấy mở bảng hàng. Mọi dữ liệu
// ra dựng bằng `thanTrangKhach` của lõi (bản ra `banRaNgoai`, bất biến 4); không cột lớp `source` nào được đọc ở đây.
import { boTuVung, type DongNhan } from "@quy-hang/core/labels";
import { dongNhanCuaSan } from "../labels/store";
import type { ListingState } from "@quy-hang/core/listing";
import type { UnitPhoto } from "@quy-hang/core/photos";
import type { CanNoiBo } from "@quy-hang/core/redaction";
import { giaiCauHinh } from "@quy-hang/core/config";
import { thanTrangKhach, type CauHinhTrangMoiGioi, type LuuTrenLanGui, type ShareAudience, type ThanTrangKhach } from "@quy-hang/core/sharing";
import { canRead, type VisibilityFacts } from "@quy-hang/core/visibility";
import type pg from "pg";
import { withCompany } from "../db";
import { FACTS_SQL, STATE_COLUMNS, viewerOf } from "../listings/store";
import type { KhoAnh, KhoAnhVang } from "../photos/kho";
import { listPhotos, readPhoto } from "../photos/store";

export type LanGuiTheoMa = { companyId: string; shareId: string; senderUserId: string; audience: ShareAudience };

/** Lần gửi còn mở theo mã; mã sai, link tắt, người gửi rời sàn → null (Hỏi-5, Hỏi-6). */
export async function timLanGui(pool: pg.Pool, code: string): Promise<LanGuiTheoMa | null> {
  return withCompany(pool, { userId: "", companyId: null }, async (tx) => {
    const { rows } = await tx.query<{ company_id: string; share_id: string; sender_user_id: string; audience: ShareAudience; active: boolean }>(
      "select * from app.share_by_code($1)",
      [code],
    );
    const r = rows[0];
    return r && r.active ? { companyId: r.company_id, shareId: r.share_id, senderUserId: r.sender_user_id, audience: r.audience } : null;
  });
}

type DongCan = ListingState & {
  id: string;
  creatorUserId: string;
  statusesReached: string[];
  listingAgentUserId: string | null;
  companyName: string;
  livingArea: number | null;
  bedroomsTotal: number | null;
  directionFaces: string | null;
  propertyType: string | null;
  propertySubType: string | null;
  upi: string | null;
  stack: string | null;
  floor: number | null;
};

/** Căn của Lần gửi theo `position`, dựng thành `CanNoiBo` trong phiên người gửi; căn người gửi không còn đọc được thì bỏ. */
async function canCuaLanGui(tx: pg.PoolClient, s: LanGuiTheoMa, senderName: string): Promise<{ id: string; can: CanNoiBo }[]> {
  const cot = Object.entries(STATE_COLUMNS).map(
    ([k, col]) => `${col === "list_price" || col === "close_price" ? `l.${col}::float8` : col === "close_date" ? `l.${col}::text` : `l.${col}`} as "${k}"`,
  );
  const { rows } = await tx.query<DongCan>(
    `select l.id, ${cot.join(", ")},
            ${FACTS_SQL.creatorUserId} as "creatorUserId", ${FACTS_SQL.statusesReached} as "statusesReached",
            ${FACTS_SQL.listingAgentUserId} as "listingAgentUserId",
            co.name as "companyName",
            cu.living_area::float8 as "livingArea", cu.bedrooms_total as "bedroomsTotal", cu.direction_faces as "directionFaces",
            cu.property_type as "propertyType", cu.property_sub_type as "propertySubType", cu.upi, cu.stack, cu.floor
       from share_listings sl
       join listings l on l.company_id = sl.company_id and l.id = sl.listing_id
       join companies co on co.id = sl.company_id
       left join lateral (select c1.upi, c1.stack, c1.floor, c1.living_area, c1.bedrooms_total, c1.direction_faces, c1.property_type, c1.property_sub_type from catalog_units c1 where c1.building_name = l.building_name and app.unit_key(c1.unit_number) = app.unit_key(l.unit_number) order by c1.measured_at desc limit 1) cu on true
      where sl.company_id = $1 and sl.share_id = $2
      order by sl.position`,
    [s.companyId, s.shareId],
  );
  const nguoiXem = await viewerOf(tx, s.senderUserId);
  const ra: { id: string; can: CanNoiBo }[] = [];
  for (const r of rows) {
    const facts: VisibilityFacts = { creatorUserId: r.creatorUserId, statusesReached: r.statusesReached, listingAgentUserId: r.listingAgentUserId };
    if (!canRead(nguoiXem, facts)) continue;
    // Hàng lô, hàng ngoài khu (can-ngoai-khu) chưa ra trang khách: luật ẩn số nhà, mã lô theo loại hình là hàng 80 (bất biến 4).
    if (!r.buildingName) continue;
    const anh: UnitPhoto[] = r.unitNumber ? (await listPhotos(tx, r.buildingName, r.unitNumber)).anh.filter((a) => a.compartment === "shareable") : [];
    ra.push({ id: r.id, can: {
      buildingName: r.buildingName,
      livingArea: r.livingArea,
      bedroomsTotal: r.bedroomsTotal,
      directionFaces: r.directionFaces,
      propertyType: r.propertyType,
      propertySubType: r.propertySubType,
      unitNumber: r.unitNumber,
      upi: r.upi,
      stack: r.stack,
      floor: r.floor,
      // Danh mục chưa có số tầng toà: trang khách không có nấc tầng (như màn Gửi hàng 34).
      buildingFloorsTotal: null,
      // Căn đã gỡ khi hoàn tác lần nhập (hàng 66) ra trang khách như căn không còn: tình trạng «unavailable», không giá.
      standardStatus: r.voided ? "Withdrawn" : r.standardStatus,
      listPrice: r.listPrice,
      feeInclusion: r.feeInclusion,
      furnished: r.furnished,
      legalStatus: r.legalStatus,
      financing: r.financing,
      occupantType: r.occupantType,
      lastConfirmedAt: (r.lastConfirmedAt as unknown) instanceof Date ? (r.lastConfirmedAt as unknown as Date).toISOString() : (r.lastConfirmedAt ?? null),
      companyName: r.companyName,
      senderName,
      photos: anh,
      closePrice: r.closePrice,
      closeDate: r.closeDate,
      withdrawnReason: r.withdrawnReason,
      version: r.version,
      holderUserId: null,
      holderName: null,
      customFields: {},
      ownerName: null,
      ownerPhone: null,
      floorPrice: null,
      titleDeedPhoto: null,
      contacts: [],
    } });
  }
  return ra;
}

/** Tên người gửi — bảng danh tính chỉ đọc qua kết nối danh tính. */
async function tenNguoiGui(identityPool: pg.Pool, userId: string): Promise<string> {
  const { rows } = await identityPool.query<{ name: string | null }>('select name from identity."user" where id = $1', [userId]);
  return rows[0]?.name ?? "";
}

export type ThanRoute = ThanTrangKhach & { listingIds: string[] };

/**
 * Thân trang khách của một Lần gửi còn mở; `today` là `YYYY-MM-DD` UTC. `listingIds` (cùng thứ tự với `can`) là mã hàng để
 * trang báo «Quan tâm» đúng căn — chuỗi UUID không mang nghĩa, không thuộc lớp nguồn; mọi giá trị căn vẫn chỉ là bản ra.
 */
export async function docTrangKhach(nguon: Pick<NguonCongKhai, "docCan" | "docNhan" | "docMoiGioi">, s: LanGuiTheoMa, today: string): Promise<ThanRoute> {
  const ds = await nguon.docCan(s);
  // Cách gọi riêng của sàn gửi (hàng 45): lõi cắt về phần theo khoá ra của người nhận.
  const tuVung = boTuVung(nguon.docNhan ? await nguon.docNhan(s) : []).tuVung;
  // Trang nhóm môi giới (hàng 44): mức chia và định nghĩa phí lúc gửi, cùng cấu hình hiện tại của sàn gửi.
  const mg = s.audience === "agents" && nguon.docMoiGioi ? await nguon.docMoiGioi(s) : null;
  const than = thanTrangKhach({ can: ds.map((d) => d.can), audience: s.audience, today, tuVung, luuTrenLanGui: mg?.luu, cauHinhMoiGioi: mg?.san });
  return { ...than, listingIds: ds.map((d) => d.id) };
}

/** Mức chia, định nghĩa phí lúc gửi (048) và cấu hình trang môi giới của sàn — đọc trong phiên người gửi. */
export async function docMoiGioiCua(tx: pg.PoolClient, shareId: string): Promise<{ luu: LuuTrenLanGui; san: CauHinhTrangMoiGioi }> {
  const r = (
    await tx.query<{ muc: string | null; phi: string[] | null }>(
      "select commission_split_pct::text muc, fee_inclusion phi from shares where company_id = app.current_company_id() and id = $1",
      [shareId],
    )
  ).rows[0];
  const dong = (
    await tx.query<{ key: string; value: unknown }>(
      "select key, value from company_settings where company_id = app.current_company_id() and key = any($1)",
      [["broker_page.hide_commission_split", "fee.inclusion"]],
    )
  ).rows;
  const { cauHinh } = giaiCauHinh(dong);
  return {
    luu: { mucChia: r?.muc == null ? null : Number(r.muc), feeInclusion: r?.phi ?? null },
    san: { anMucChia: cauHinh["broker_page.hide_commission_split"] === true, feeInclusion: (cauHinh["fee.inclusion"] as string[] | undefined) ?? [] },
  };
}

export type AnhCongKhai = { kind: "byte"; bytes: Buffer; type: string } | { kind: "link"; url: string } | "khong-co" | "chua-cau-hinh";

/**
 * Nguồn dữ liệu của ba route công khai. Bản thật đọc cơ sở dữ liệu; bài rò rỉ của rào route (Ngoài-8 hàng 35) truyền nguồn
 * mang căn mồi để chạy đúng handler của route trên app — thân vẫn dựng bằng `thanTrangKhach` trong `docTrangKhach`.
 */
export type NguonCongKhai = {
  timLanGui(code: string): Promise<LanGuiTheoMa | null>;
  /** Căn nội bộ của Lần gửi theo thứ tự gửi, kèm mã hàng — chỉ đi vào `thanTrangKhach`, không trả thẳng ra ngoài. */
  docCan(s: LanGuiTheoMa): Promise<{ id: string; can: CanNoiBo }[]>;
  /** Dòng cách gọi riêng của sàn gửi (hàng 45) — chỉ đi vào `thanTrangKhach`, lõi cắt về phần ra ngoài. Vắng = chưa đặt. */
  docNhan?(s: LanGuiTheoMa): Promise<DongNhan[]>;
  /** Hàng 44: mức chia, định nghĩa phí lúc gửi và cấu hình trang môi giới của sàn gửi — chỉ đi vào `thanTrangKhach`. */
  docMoiGioi?(s: LanGuiTheoMa): Promise<{ luu: LuuTrenLanGui; san: CauHinhTrangMoiGioi }>;
  ghiSuKien(code: string, type: string, listingId: string | null, visitor: string): Promise<GhiSuKien>;
  /** Byte một ảnh của Lần gửi; route chỉ gọi với id đã có trong bản ra. */
  docAnh(s: LanGuiTheoMa, photoId: string): Promise<AnhCongKhai>;
};

export function nguonThat(deps: { appPool: pg.Pool; identityPool: pg.Pool }, kho: KhoAnh | KhoAnhVang): NguonCongKhai {
  const tx = <T>(s: LanGuiTheoMa, f: (c: pg.PoolClient) => Promise<T>) => withCompany(deps.appPool, { userId: s.senderUserId, companyId: s.companyId }, f);
  return {
    timLanGui: (code) => timLanGui(deps.appPool, code),
    async docCan(s) {
      const ten = await tenNguoiGui(deps.identityPool, s.senderUserId);
      return tx(s, (c) => canCuaLanGui(c, s, ten));
    },
    docNhan: (s) => tx(s, dongNhanCuaSan),
    docMoiGioi: (s) => tx(s, (c) => docMoiGioiCua(c, s.shareId)),
    ghiSuKien: (code, type, listingId, visitor) => ghiSuKien(deps.appPool, code, type, listingId, visitor),
    async docAnh(s, id) {
      if (kho.ten === "vang") return "chua-cau-hinh";
      const k = kho;
      const kq = await tx(s, (c) => readPhoto(c, k, s.companyId, id, "original"));
      if ("error" in kq || kq.noiBo || !kq.doc) return "khong-co";
      return kq.doc.kind === "link" ? { kind: "link", url: kq.doc.url } : { kind: "byte", bytes: kq.doc.bytes, type: kq.type };
    },
  };
}

export type GhiSuKien = { inserted: boolean } | { loi: "khong-co" | "khong-ghi-duoc" | "than-sai" };

/** Ghi một sự kiện qua `app.record_share_event` — chặn trùng, kiểm căn và Lần gửi ở cơ sở dữ liệu. */
export async function ghiSuKien(pool: pg.Pool, code: string, type: string, listingId: string | null, visitor: string): Promise<GhiSuKien> {
  try {
    return await withCompany(pool, { userId: "", companyId: null }, async (tx) => {
      const { rows } = await tx.query<{ r: boolean }>("select app.record_share_event($1, $2, $3, $4) as r", [code, type, listingId, visitor]);
      return { inserted: rows[0]!.r };
    });
  } catch (e) {
    const ma = (e as { code?: string }).code;
    if (ma === "P0002") return { loi: "khong-co" };
    if (ma === "23514" || ma === "23503") return { loi: "khong-ghi-duoc" };
    if (ma === "22023" || ma === "23514" || ma === "22P02") return { loi: "than-sai" };
    throw e;
  }
}
