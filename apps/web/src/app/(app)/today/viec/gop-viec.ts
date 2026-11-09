/**
 * Gộp năm nguồn đọc thành một danh sách việc của Hôm nay (hồ sơ hom-nay-mot-danh-sach-viec). Thuần: không gọi mạng, không
 * đọc đồng hồ. Nguồn lỗi thành một mục báo, không bao giờ thành nhóm rỗng hay «không có việc».
 */
import { MOC_VIEC_DAU_KHACH_GIO, NHOM_VAI, type MaNhomVai, type TinDauKhach } from "@quy-hang/core/today";
import { nhanGiaTri, type TuVung } from "@quy-hang/core/labels";
import type { MyLeadView } from "@quy-hang/core/dedupe";

import type { DongLeadTruongNhom } from "../nguon";

export type Nguon<T> = { trang: "dang" | "ok" | "loi"; ds: readonly T[] };
export type MaNguon = "lead-giao" | "hang-doi" | "lead-cua-toi" | "tin";

export type DongVai =
  | { kind: "doi"; id: string; dong: DongLeadTruongNhom }
  | { kind: "tra-lai"; id: string; lead: MyLeadView }
  | { kind: "tin"; id: string; tin: TinDauKhach };

export type NhomDauChu<V> = { code: string; label: string; viec: readonly V[]; soQua: number };
export type NhomViec<V> = { ma: string; nhan: string; thuoc: "dau-chu" | "vai"; viec: readonly (V | DongVai)[]; soQua: number };
export type LoiNguon = { nguon: MaNguon; chu: string };

export type VaoGop<V> = {
  vai: readonly string[];
  bayGio: string;
  tv: TuVung | null;
  dauChu: readonly NhomDauChu<V>[];
  leadGiao: Pick<Nguon<unknown>, "trang">;
  hangDoi: Nguon<DongLeadTruongNhom>;
  leadCuaToi: Nguon<MyLeadView>;
  tin: Nguon<TinDauKhach>;
};

export type RaGop<V> = {
  dangTai: boolean;
  nhom: NhomViec<V>[];
  so: number;
  quaHan: number;
  loi: LoiNguon[];
  /** Số lead đã nhập cho dòng dẫn tới trang riêng; `null` khi không có vai Telesales hay chưa đọc được. */
  soLeadDaNhap: number | null;
};

const CHU_LOI: Record<MaNguon, string> = {
  "lead-giao": "Chưa tải được lead giao cho bạn",
  "hang-doi": "Chưa tải được lead quá hạn",
  "lead-cua-toi": "Chưa tải được lead bị trả lại",
  tin: "Chưa tải được tin của khách",
};

const MA_TIN: Record<TinDauKhach["kind"], MaNhomVai> = { reaction: "buyer_reaction", changed: "buyer_changed", new_match: "buyer_new_match" };

const idTin = (t: TinDauKhach) => `tin:${t.kind}:${t.at}:${t.kind === "new_match" ? t.listing.id : t.share.id}`;

/** Tin còn là việc: chưa quá mốc tự hết, tính từ mốc của tin. */
export function tinConViec(at: string, bayGio: string): boolean {
  return Date.parse(bayGio) - Date.parse(at) < MOC_VIEC_DAU_KHACH_GIO * 3_600_000;
}

export function gopViec<V>(v: VaoGop<V>): RaGop<V> {
  const co = (r: string) => v.vai.includes(r);
  const nhan = (ma: MaNhomVai) => nhanGiaTri(v.tv, "nhomViec", ma, NHOM_VAI.find((n) => n.code === ma)!.label);

  const loi: LoiNguon[] = [];
  const dangTai =
    (co("listing_agent") && v.leadGiao.trang === "dang") ||
    (co("team_lead") && v.hangDoi.trang === "dang") ||
    (co("telesales") && v.leadCuaToi.trang === "dang") ||
    (co("buyer_agent") && v.tin.trang === "dang");
  const baoLoi = (ma: MaNguon, cua: boolean, trang: string) => {
    if (cua && trang === "loi") loi.push({ nguon: ma, chu: CHU_LOI[ma] });
  };
  baoLoi("hang-doi", co("team_lead"), v.hangDoi.trang);
  baoLoi("lead-giao", co("listing_agent"), v.leadGiao.trang);
  baoLoi("lead-cua-toi", co("telesales"), v.leadCuaToi.trang);
  baoLoi("tin", co("buyer_agent"), v.tin.trang);

  const nhomVai = (ma: MaNhomVai, viec: DongVai[], soQua: number): NhomViec<V> => ({ ma, nhan: nhan(ma), thuoc: "vai", viec, soQua });
  const truocDauChu: NhomViec<V>[] = [];
  const sauDauChu: NhomViec<V>[] = [];

  if (co("team_lead") && v.hangDoi.trang === "ok") {
    const dong = (d: DongLeadTruongNhom): DongVai => ({ kind: "doi", id: `doi:${d.leadId}`, dong: d });
    const quaHan = v.hangDoi.ds.filter((d) => d.kind !== "unrouted");
    const chuaChia = v.hangDoi.ds.filter((d) => d.kind === "unrouted");
    if (quaHan.length) truocDauChu.push(nhomVai("lead_overdue", quaHan.map(dong), quaHan.length));
    if (chuaChia.length) truocDauChu.push(nhomVai("lead_unrouted", chuaChia.map(dong), 0));
  }
  if (co("telesales") && v.leadCuaToi.trang === "ok") {
    const tra = v.leadCuaToi.ds.filter((l) => l.stage === "returned").map((lead): DongVai => ({ kind: "tra-lai", id: `tra:${lead.id}`, lead }));
    if (tra.length) sauDauChu.push(nhomVai("lead_returned", tra, 0));
  }
  if (co("buyer_agent") && v.tin.trang === "ok") {
    const con = v.tin.ds.filter((t) => tinConViec(t.at, v.bayGio));
    for (const ma of ["buyer_reaction", "buyer_changed", "buyer_new_match"] as const) {
      const cua = con.filter((t) => MA_TIN[t.kind] === ma).map((tin): DongVai => ({ kind: "tin", id: idTin(tin), tin }));
      if (cua.length) sauDauChu.push(nhomVai(ma, cua, 0));
    }
  }

  // Bộ nhóm đầu chủ đứng thành một khối, giữ nguyên thứ tự của sàn (AC-2).
  const dauChu: NhomViec<V>[] = co("listing_agent")
    ? v.dauChu.filter((g) => g.viec.length > 0).map((g) => ({ ma: g.code, nhan: g.label, thuoc: "dau-chu", viec: g.viec, soQua: g.soQua }))
    : [];
  const nhom = [...truocDauChu, ...dauChu, ...sauDauChu];
  return {
    dangTai,
    nhom,
    so: nhom.reduce((s, g) => s + g.viec.length, 0),
    quaHan: nhom.reduce((s, g) => s + g.soQua, 0),
    loi,
    soLeadDaNhap: co("telesales") && v.leadCuaToi.trang === "ok" ? v.leadCuaToi.ds.length : null,
  };
}
