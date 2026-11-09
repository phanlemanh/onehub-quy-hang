import { buildCatalogIndex, type CatalogData } from "@quy-hang/core";
import type pg from "pg";
import type { ApiDeps } from "../app";
import { withCompany } from "../db";
import { SAMPLE_CATALOG } from "./sample";

/**
 * Nguồn danh mục duy nhất của bốn nơi đọc (hàng 99, ADR-0015): gõ mã, cả danh mục, Nhập Excel, «chỉ biết toà». Đọc vùng
 * dùng chung; vùng chưa có khu nào thì dùng gói mẫu (Hỏi-1, chủ kho duyệt 09/11), có một khu là tắt hẳn gói mẫu cho mọi sàn.
 *
 * Mỗi lần đọc hỏi dấu phiên bản của hai bảng, dấu đổi mới dựng lại, nên gói vừa nạp ở máy chủ khác thấy ngay ở lần đọc kế.
 * Đọc lỗi: đang giữ bản thật thì trả bản ấy; chưa giữ thì ném, vì lỗi tạm mà rơi về gói mẫu thì người dùng thấy dữ liệu mẫu
 * như thật. Danh mục là lớp đọc chung của mọi sàn, nên một nguồn giữ một bản, không theo sàn.
 */
export type BanDanhMuc = { catalog: CatalogData; index: ReturnType<typeof buildCatalogIndex> };

export interface NguonDanhMuc {
  doc(): Promise<BanDanhMuc>;
  /** Số lần đã dựng bản từ vùng — để bài kiểm chứng bản giữ được dùng lại. */
  soLanDung(): number;
}

/** Cách đọc hai bảng. Tách ra để bài kiểm thay được bằng bộ đọc giả, kể cả bộ đọc ném lỗi. */
export interface BoDocVung {
  dau(): Promise<{ soKhu: number; chuoi: string }>;
  docCa(): Promise<CatalogData>;
}

/** Mã lỗi khi chưa giữ bản thật mà không đọc được vùng. */
export const LOI_DOC_DANH_MUC = { code: "catalog-unavailable", status: 500 } as const;

const banTu = (catalog: CatalogData): BanDanhMuc => ({ catalog, index: buildCatalogIndex(catalog) });
const BAN_MAU = banTu(SAMPLE_CATALOG);

export function taoNguon(bo: BoDocVung): NguonDanhMuc {
  let giu: { dau: string; ban: BanDanhMuc } | null = null;
  let dung = 0;
  return {
    soLanDung: () => dung,
    async doc() {
      try {
        const d = await bo.dau();
        if (d.soKhu === 0) {
          giu = null;
          return BAN_MAU;
        }
        if (giu?.dau === d.chuoi) return giu.ban;
        const ban = banTu(await bo.docCa());
        dung += 1;
        giu = { dau: d.chuoi, ban };
        return ban;
      } catch (e) {
        console.error("[danh-muc] không đọc được vùng dùng chung", e);
        if (giu) return giu.ban;
        throw e;
      }
    },
  };
}

/** Vùng là dữ liệu chung, không theo sàn: đọc bằng vai API, không đặt sàn nào. */
const KHONG_SAN = { userId: "", companyId: null };

type DongCan = {
  upi: string;
  subdivision_key: string;
  building_key: string;
  building_name: string;
  unit_number: string;
  stack: string | null;
  floor: number | null;
  living_area: string | null;
  bedrooms_total: number | null;
  direction_faces: string | null;
  property_type: string;
  property_sub_type: string;
};

type Toa = { buildingKey: string; buildingName: string; units: CatalogData["subdivisions"][number]["buildings"][number]["units"][number][] };

function boDocPostgres(pool: pg.Pool): BoDocVung {
  return {
    dau: () =>
      withCompany(pool, KHONG_SAN, async (tx) => {
        // Thêm tổng mốc thời gian: hai lần nạp chồng nhau, lần bắt đầu trước mà xong sau thì `max` và `count` đều không đổi.
        const { rows } = await tx.query<{ so_khu: number; chuoi: string }>(
          `select k.n::int as so_khu, concat_ws('|', k.n, k.m, k.t, c.n, c.m, c.t) as chuoi
           from (select count(*) n, max(updated_at)::text m, sum(extract(epoch from updated_at))::text t from catalog_subdivisions) k,
                (select count(*) n, max(updated_at)::text m, sum(extract(epoch from updated_at))::text t from catalog_units) c`,
        );
        return { soKhu: rows[0]!.so_khu, chuoi: rows[0]!.chuoi };
      }),
    docCa: () =>
      withCompany(pool, KHONG_SAN, async (tx) => {
        const khu = await tx.query<{ subdivision_key: string; subdivision_name: string; complex_name: string | null }>(
          "select subdivision_key, subdivision_name, complex_name from catalog_subdivisions order by subdivision_key",
        );
        const can = await tx.query<DongCan>(
          `select upi, subdivision_key, building_key, building_name, unit_number, stack, floor, living_area, bedrooms_total,
                  direction_faces, property_type, property_sub_type
           from catalog_units order by subdivision_key, building_key, unit_number, upi`,
        );
        const theoKhu = new Map<string, Map<string, Toa>>();
        for (const r of can.rows) {
          const toaCuaKhu = theoKhu.get(r.subdivision_key) ?? new Map<string, Toa>();
          theoKhu.set(r.subdivision_key, toaCuaKhu);
          const toa = toaCuaKhu.get(r.building_key) ?? { buildingKey: r.building_key, buildingName: r.building_name, units: [] };
          toaCuaKhu.set(r.building_key, toa);
          toa.units.push({
            upi: r.upi,
            unitNumber: r.unit_number,
            stack: r.stack,
            floor: r.floor,
            livingArea: r.living_area === null ? null : Number(r.living_area),
            bedroomsTotal: r.bedrooms_total,
            directionFaces: r.direction_faces,
            propertyType: r.property_type,
            propertySubType: r.property_sub_type,
          });
        }
        return {
          subdivisions: khu.rows.map((k) => ({
            subdivisionKey: k.subdivision_key,
            subdivisionName: k.subdivision_name,
            complexName: k.complex_name,
            buildings: [...(theoKhu.get(k.subdivision_key)?.values() ?? [])],
          })),
        };
      }),
  };
}

export const taoNguonDanhMuc = (pool: pg.Pool): NguonDanhMuc => taoNguon(boDocPostgres(pool));

/** Danh mục cố định — bài kiểm truyền thẳng một bộ dữ liệu, không qua cơ sở dữ liệu. */
export function nguonCoDinh(catalog: CatalogData): NguonDanhMuc {
  const ban = banTu(catalog);
  return { doc: async () => ban, soLanDung: () => 0 };
}

/** Nguồn của một đường đọc: tham số của bài kiểm nếu có, không thì nguồn chung của API. */
export function nguonCua(deps: Pick<ApiDeps, "appPool" | "nguonDanhMuc">, catalog?: CatalogData | NguonDanhMuc): NguonDanhMuc {
  if (!catalog) return deps.nguonDanhMuc ?? taoNguonDanhMuc(deps.appPool);
  return "doc" in catalog ? catalog : nguonCoDinh(catalog);
}

/** Tên toà của danh mục, không trùng, theo thứ tự chữ — chọn «chỉ biết toà» của lead. */
export const tenToa = (catalog: CatalogData): string[] =>
  [...new Set(catalog.subdivisions.flatMap((p) => p.buildings.map((b) => b.buildingName)))].sort();
