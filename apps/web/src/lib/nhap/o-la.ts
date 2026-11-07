import { dungGoiOLa, type DeXuatO, type GoiOLa, type ImportContext, type LoiDeXuatO, type OLa } from "@quy-hang/core/import";
import type { Ong } from "./duong-ong";
import type { AiMan } from "./de-xuat";
import { suaO, type TrangThaiNhap } from "./trang-thai";

/**
 * Ô lạ còn lại ở bước Xem trước (hàng 69, AC-4…AC-7): ô «Cần người» bộ chuẩn hoá không đọc được — chỉ ở cột danh mục, giá,
 * phí, trạng thái — gửi tới đường ô lạ dưới dạng gói của lõi; đề xuất về hiện dưới ô, người bấm «Dùng» (đúng đường gõ tay
 * `suaO`) hay gõ tay. Không có đường nào áp đề xuất khi người chưa chạm: hàm ở đây không bao giờ đổi `TrangThaiNhap` trừ
 * `dungDeXuat`. Hàm thuần — màn chỉ giữ trạng thái và vẽ.
 *
 * Nhớ theo ô đã hỏi (cột, trường, phép, chữ): qua lại Ghép cột – Xem trước chỉ gửi ô CHƯA hỏi, nên mỗi kế hoạch khác nhau
 * của lần nhập gửi một lần và dùng đề xuất xong không gửi lại.
 */
export type KetQuaGoiOLa = { cheDo: "ai"; deXuat: DeXuatO[]; loi: LoiDeXuatO[] } | { cheDo: "tat-dinh"; lyDo: string };
export type HoiOLa = (goi: GoiOLa) => Promise<KetQuaGoiOLa | { loi: string }>;
export type DeXuatHien = { giaTri: string; lyDo: string };

export type TrangThaiOLa = {
  /** Khoá ô đã gửi đi (dù có đề xuất hay không). */
  daHoi: ReadonlySet<string>;
  /** Khoá ô → đề xuất qua kiểm. */
  theoKhoa: ReadonlyMap<string, DeXuatHien>;
  /** Ô lưới (`dòng:cột`) đã dùng đề xuất hay đã sửa tay — đề xuất không hiện lại ở ô ấy. */
  daTat: ReadonlySet<string>;
  dangHoi: boolean;
  /** Dòng «Sửa tay lần này: …» khi không dùng được AI. */
  bao: string | null;
};
export const ttOLaDau = (): TrangThaiOLa => ({ daHoi: new Set(), theoKhoa: new Map(), daTat: new Set(), dangHoi: false, bao: null });

export const CHO_O_LA = "Máy đang xem các ô cần người…";
export const cauSuaTay = (lyDo: string) => `Sửa tay lần này: ${lyDo}`;
const LOI_MANG = "không gửi được tới máy chủ";

/** Khoá của một ô gói theo cột, trường, phép và chữ: đổi đích hay đơn vị của cột là ô mới. */
export const khoaO = (o: Pick<OLa, "cot" | "truong" | "phep" | "giaTri">) => `${o.cot}|${o.truong}|${JSON.stringify(o.phep ?? null)}|${o.giaTri}`;
const oLuoi = (source: number, cot: number) => `${source}:${cot}`;

/** Gói ô lạ của `ong` chỉ gồm ô chưa hỏi. */
export function goiChuaHoi(ong: Ong, tt: TrangThaiOLa): GoiOLa {
  const goi = dungGoiOLa(ong.profile, ong.plan, ong.dong);
  const o = goi.o.filter((x) => !tt.daHoi.has(khoaO(x))).map((x, i) => ({ ...x, id: `o${i + 1}` }));
  return { o };
}

/** Có nên hỏi máy không: sàn đã bật, còn trần, máy chủ sẵn sàng, và còn ô lạ chưa hỏi. */
export function canHoiOLa(ong: Ong, ai: AiMan | null, tt: TrangThaiOLa): boolean {
  if (!ai || ai === "loi" || !ai.bat || !ai.sanSang || !ai.conTran) return false;
  return goiChuaHoi(ong, tt).o.length > 0;
}

/** Sàn bật AI mà không hỏi được (thiếu khoá, hết trần, không đọc được trạng thái) và có ô lạ — một dòng lý do. */
export function lyDoKhongHoiOLa(ong: Ong, ai: AiMan | null): string | null {
  if (!ai || dungGoiOLa(ong.profile, ong.plan, ong.dong).o.length === 0) return null;
  if (ai === "loi") return cauSuaTay("không đọc được trạng thái AI");
  if (!ai.bat) return null;
  if (!ai.sanSang) return cauSuaTay("AI chưa sẵn sàng trên máy chủ");
  if (!ai.conTran) return cauSuaTay("Hết trần AI tháng này");
  return null;
}

/** Hỏi đường ô lạ cho các ô chưa hỏi của `ong`. Không ném: lỗi bất kỳ thành dòng «Sửa tay lần này». */
export async function hoiOLa(ong: Ong, hoi: HoiOLa, tt: TrangThaiOLa): Promise<TrangThaiOLa> {
  const goi = goiChuaHoi(ong, tt);
  if (goi.o.length === 0) return { ...tt, dangHoi: false };
  const daHoi = new Set(tt.daHoi);
  for (const o of goi.o) daHoi.add(khoaO(o));
  const xong = (patch: Partial<TrangThaiOLa>): TrangThaiOLa => ({ ...tt, daHoi, dangHoi: false, ...patch });
  try {
    const kq = await hoi(goi);
    if (!kq || typeof kq !== "object" || !("cheDo" in kq)) return xong({ bao: cauSuaTay(LOI_MANG) });
    if (kq.cheDo === "tat-dinh") return xong({ bao: cauSuaTay(kq.lyDo) });
    const theoId = new Map(goi.o.map((o) => [o.id, o]));
    const theoKhoa = new Map(tt.theoKhoa);
    for (const d of kq.deXuat) {
      const o = theoId.get(d.id);
      if (o) theoKhoa.set(khoaO(o), { giaTri: d.giaTri, lyDo: d.lyDo });
    }
    return xong({ theoKhoa, bao: null });
  } catch {
    return xong({ bao: cauSuaTay(LOI_MANG) });
  }
}

/** Đề xuất đang hiện ở ô lưới (dòng `source`, cột `cot`), hay null. Chỉ ô còn «Cần người» do bộ chuẩn hoá quyết. */
export function deXuatCuaO(ong: Ong, tt: TrangThaiOLa, source: number, cot: number): DeXuatHien | null {
  if (tt.daTat.has(oLuoi(source, cot))) return null;
  const cell = ong.dong.find((d) => d.source === source)?.cells[cot];
  if (!cell || cell.mark !== "needs_person" || cell.by !== "normalize") return null;
  const col = ong.plan.columns[cot];
  if (!col) return null;
  const giaTri = cell.raw === null ? "" : String(cell.raw).normalize("NFC").replace(/\s+/g, " ").trim();
  return tt.theoKhoa.get(khoaO({ cot, truong: col.target as OLa["truong"], phep: col.transform, giaTri })) ?? null;
}

/** «Dùng» một chạm: đúng đường gõ tay (`suaO`) với chữ đề xuất; ô ấy thôi hiện đề xuất. */
export function dungDeXuat(s: TrangThaiNhap, tt: TrangThaiOLa, source: number, cot: number, ctx: ImportContext): { s: TrangThaiNhap; tt: TrangThaiOLa } {
  if (!s.ong) return { s, tt };
  const dx = deXuatCuaO(s.ong, tt, source, cot);
  if (!dx) return { s, tt };
  return { s: suaO(s, source, cot, dx.giaTri, ctx), tt: tatO(tt, source, cot) };
}

/** Người gõ tay vào ô: đề xuất của ô ấy tắt hẳn. */
export const tatO = (tt: TrangThaiOLa, source: number, cot: number): TrangThaiOLa => ({ ...tt, daTat: new Set(tt.daTat).add(oLuoi(source, cot)) });
