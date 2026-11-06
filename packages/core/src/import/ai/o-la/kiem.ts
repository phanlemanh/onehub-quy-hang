/**
 * Kiểm NGHĨA đề xuất ô lạ (hàng 69, ADR-0011 qđ 1 «mã kiểm»). Mỗi đề xuất sai chỉ bỏ đề xuất ấy, kèm lý do; gốc sai khuôn
 * thì không đề xuất nào. Một đề xuất qua kiểm khi:
 * - `id` có trong gói và chưa đề xuất; `ly_do` không rỗng;
 * - chữ đề xuất qua bộ chuẩn hoá MỘT CỬA (`normalizeValue`) của đúng trường, phép của cột, ra «giữ nguyên» hay «máy sửa»;
 * - ô giá dải: giá nằm trong [cận dưới, cận trên] của dải, đọc cận bằng cùng phép giá;
 * - ô giá về tay («thu về X»): đúng X kèm «chưa gồm phí» (luật 12: giá không bao phí là giá về tay), hoặc đúng giá bao phí
 *   nhỏ nhất cho về tay X theo tỉ lệ mặc định của sàn kèm «bao phí»;
 * - ô phí về tay: ra «chưa gồm phí».
 * Không đồng hồ: `today` đi vào từ ngoài.
 */
import { giaBaoPhiTuVeTay } from "../../../pricing/ve-tay";
import { fold } from "../../dictionaries";
import { normalizeValue } from "../../normalize";
import type { Outcome, Transform } from "../../transforms";
import type { GoiOLa, OLa } from "./goi";

export type DeXuatO = { id: string; giaTri: string; lyDo: string };
export type LoiDeXuatO = { id: string | null; lyDo: string };
export type KetQuaOLa = { deXuat: DeXuatO[]; loi: LoiDeXuatO[] };

const SAI_KHUON = "đầu ra sai khuôn";
const laDoiTuong = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

const VE_TAY = /(thu ve|ve tay)/;
const NOI_DAI = /\s*(?:-|–|—|~|đến|den)\s*/i;
const DUOI_DON_VI = /(tỷ|tỉ|ty|ti|triệu|trieu|tr)\s*$/i;

const doc = (truong: OLa["truong"], chu: string, phep: Transform | undefined, today: string): Outcome => normalizeValue(truong, chu, { today, transform: phep });
const so = (r: Outcome): number | null => ((r.mark === "keep" || r.mark === "fixed") && typeof r.value === "number" ? r.value : null);

/** Hai cận của một ô giá dải, đọc bằng phép của cột; cận thiếu đơn vị mượn đơn vị của cận kia. Không đọc được → null. */
export function docDai(o: Pick<OLa, "truong" | "giaTri" | "phep">, today: string): [number, number] | null {
  const phan = o.giaTri.split(NOI_DAI).map((x) => x.trim()).filter(Boolean);
  if (phan.length !== 2) return null;
  let [a, b] = phan as [string, string];
  const dvB = DUOI_DON_VI.exec(b)?.[1];
  const dvA = DUOI_DON_VI.exec(a)?.[1];
  if (dvB && !dvA) a = `${a} ${dvB}`;
  if (dvA && !dvB) b = `${b} ${dvA}`;
  const [x, y] = [so(doc(o.truong, a, o.phep, today)), so(doc(o.truong, b, o.phep, today))];
  if (x === null || y === null) return null;
  return x <= y ? [x, y] : [y, x];
}

/** Số về tay của ô «thu về X» (bỏ chữ «chủ», «thu về», «về tay», «nhận»), đọc bằng phép của cột. Không có số → null. */
export function docVeTay(o: Pick<OLa, "truong" | "giaTri" | "phep">, today: string): number | null {
  const con = o.giaTri.replace(/(chủ|chu|nhận|nhan|thu về|thu ve|về tay|ve tay|:)/gi, " ").replace(/\s+/g, " ").trim();
  return con ? so(doc(o.truong, con, o.phep, today)) : null;
}

/** Lý do loại một đề xuất cho ô `o`, hay null khi qua kiểm. */
export function lyDoLoai(o: OLa, giaTri: string, today: string): string | null {
  const r = doc(o.truong, giaTri, o.phep, today);
  if (r.mark !== "keep" && r.mark !== "fixed") return `«${giaTri}» không đọc được ở trường ${o.truong}`;
  const goc = fold(o.giaTri);
  if (o.truong === "listPrice") {
    const g = so(r);
    if (g === null) return `«${giaTri}» không ra một giá`;
    const phi = r.also?.feeInclusion;
    if (VE_TAY.test(goc)) {
      const veTay = docVeTay(o, today);
      if (veTay === null) return "không đọc được số về tay của ô";
      const dung = (g === veTay && phi === "excluded") || (g === giaBaoPhiTuVeTay(veTay) && phi === "included");
      return dung ? null : `«${giaTri}» lệch luật 12: về tay ${veTay} đồng là giá ấy chưa gồm phí, hay ${giaBaoPhiTuVeTay(veTay)} đồng bao phí`;
    }
    if (NOI_DAI.test(o.giaTri) && /\d/.test(o.giaTri)) {
      const dai = docDai(o, today);
      if (dai === null) return "không đọc được hai cận của dải";
      return g >= dai[0] && g <= dai[1] ? null : `«${giaTri}» ngoài dải ${dai[0]}–${dai[1]} đồng`;
    }
    return null;
  }
  if (o.truong === "feeInclusion" && VE_TAY.test(goc) && r.value !== "excluded") return `«${giaTri}» lệch luật 12: ô về tay là giá chưa gồm phí`;
  return null;
}

export function kiemDeXuatOLa(goi: GoiOLa, v: unknown, today: string): KetQuaOLa {
  if (!laDoiTuong(v) || Object.keys(v).some((k) => k !== "de_xuat") || !Array.isArray(v.de_xuat)) return { deXuat: [], loi: [{ id: null, lyDo: SAI_KHUON }] };
  const theoId = new Map(goi.o.map((o) => [o.id, o]));
  const daCo = new Set<string>();
  const deXuat: DeXuatO[] = [];
  const loi: LoiDeXuatO[] = [];
  for (const x of v.de_xuat) {
    if (!laDoiTuong(x) || Object.keys(x).some((k) => !["id", "gia_tri", "ly_do"].includes(k))) {
      loi.push({ id: null, lyDo: "mục đề xuất sai khuôn" });
      continue;
    }
    const id = typeof x.id === "string" ? x.id : null;
    const o = id ? theoId.get(id) : undefined;
    if (!id || !o) {
      loi.push({ id, lyDo: "mã ô không có trong gói" });
      continue;
    }
    if (daCo.has(id)) {
      loi.push({ id, lyDo: "ô đã có đề xuất" });
      continue;
    }
    const lyDo = typeof x.ly_do === "string" ? x.ly_do.trim() : "";
    if (!lyDo) {
      loi.push({ id, lyDo: "thiếu lý do" });
      continue;
    }
    const giaTri = typeof x.gia_tri === "string" ? x.gia_tri.normalize("NFC").trim() : "";
    const sai = giaTri ? lyDoLoai(o, giaTri, today) : "chữ đề xuất rỗng";
    if (sai) {
      loi.push({ id, lyDo: sai });
      continue;
    }
    daCo.add(id);
    deXuat.push({ id, giaTri, lyDo });
  }
  return { deXuat, loi };
}
