/**
 * Sổ sửa mẫu file của sàn (hàng 50 mau-nhap-va-bai): Quản trị sàn sửa hay xoá một cột đã nhớ. Mẫu đọc ra = gộp cột rút
 * từ các lần nhập đã ghi (`taoMau`, mốc là lúc MỞ lần nhập) với các dòng sổ sửa (mốc là lúc sửa); mỗi khoá tiêu đề giữ mục
 * mới nhất — mục mới nhất là «xoá» thì khoá vắng khỏi mẫu. Lần nhập mở trước một lần sửa, ghi sau đó, vẫn thua bản sửa: kế
 * hoạch của nó lập trên mẫu cũ (thiết kế §2).
 */
import { detectPersonal } from "../detect";
import { isStandardField } from "../fields";
import type { PlanTarget } from "../plan";
import { FIELD_TRANSFORM, TRANSFORM_NAMES, TRANSFORM_PARAMS, type Transform } from "../transforms";
import { TRUONG_CACH_GOI, type CotMau } from "./mau";

/** Một dòng của sổ sửa (bảng `import_templates`). */
export type DongSuaMau = {
  id: string;
  headerKey: string;
  action: "set" | "delete";
  target?: PlanTarget;
  transform?: Transform;
  valueMap?: Record<string, string>;
  editedBy: string;
  at: string;
};

/** Cột của mẫu sau khi gộp: cột rút từ lần nhập, hay bản sửa (mang `sua`; `importId` rỗng). */
export type CotMauDaSua = CotMau & { sua?: { id: string; editedBy: string } };

/** Gộp: mỗi khoá giữ mục mới nhất theo mốc; cùng mốc thì bản sửa thắng lần nhập. Kết quả sắp theo khoá. */
export function apSuaMau(danXuat: readonly CotMau[], sua: readonly DongSuaMau[]): CotMauDaSua[] {
  type Muc = { at: string; uuTien: number; cot: CotMauDaSua | null };
  const moi = new Map<string, Muc>();
  const xet = (k: string, m: Muc) => {
    const cu = moi.get(k);
    if (!cu || m.at > cu.at || (m.at === cu.at && m.uuTien > cu.uuTien)) moi.set(k, m);
  };
  for (const c of danXuat) xet(c.headerKey, { at: c.at, uuTien: 0, cot: c });
  for (const d of sua) {
    if (d.action === "delete") {
      xet(d.headerKey, { at: d.at, uuTien: 1, cot: null });
      continue;
    }
    const cot: CotMauDaSua = { headerKey: d.headerKey, target: d.target!, importId: "", at: d.at, sua: { id: d.id, editedBy: d.editedBy } };
    if (d.transform !== undefined) cot.transform = d.transform;
    if (d.valueMap !== undefined) cot.valueMap = { ...d.valueMap };
    xet(d.headerKey, { at: d.at, uuTien: 1, cot });
  }
  return [...moi.values()]
    .map((m) => m.cot)
    .filter((c): c is CotMauDaSua => c !== null)
    .sort((a, b) => a.headerKey.localeCompare(b.headerKey));
}

/** Một bản sửa người gửi: đích, phép biến đổi, bảng quy đổi. */
export type BanSuaMau = { target: unknown; transform?: unknown; valueMap?: unknown };

const laDoiTuong = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const QUY_DOI_TOI_DA = 200;

/** Lý do bản sửa trái luật — rỗng là hợp lệ. Cùng luật bộ nhớ hàng 67: bảng quy đổi chỉ ở trường giá trị đóng, không lớp nguồn. */
export function kiemSuaMau(b: BanSuaMau): string[] {
  const out: string[] = [];
  const t = b.target;
  const tOk = isStandardField(t) || t === "keep_as_note" || t === "ignore_with_reason" || (typeof t === "string" && /^custom:\S.{0,59}$/.test(t));
  if (!tOk) return ["đích lạ — chọn một trường của sàn"];
  if (b.transform !== undefined) {
    const p = b.transform;
    if (!laDoiTuong(p) || typeof p.name !== "string" || !(TRANSFORM_NAMES as readonly string[]).includes(p.name)) out.push("phép biến đổi ngoài thực đơn");
    else {
      const cho = TRANSFORM_PARAMS[p.name as Transform["name"]];
      const params = p.params ?? {};
      if (!laDoiTuong(params)) out.push("tham số của phép biến đổi phải là một đối tượng");
      else
        for (const [k, v] of Object.entries(params)) {
          const nhan = Object.hasOwn(cho, k) ? cho[k] : undefined;
          if (!nhan || typeof v !== "string" || !nhan.includes(v)) out.push(`tham số «${k}» của phép biến đổi không hợp lệ`);
        }
      const mong = isStandardField(t) ? FIELD_TRANSFORM[t].name : "text";
      if (p.name !== mong) out.push(`phép biến đổi không hợp với trường đích — cần «${mong}»`);
    }
  }
  if (b.valueMap !== undefined) {
    const v = b.valueMap;
    if (!(isStandardField(t) && TRUONG_CACH_GOI.includes(t))) out.push("quy đổi giá trị chỉ dùng cho Trạng thái, Điều kiện phí, Hướng, Toà, Dự án");
    else if (!laDoiTuong(v) || !Object.entries(v).every(([k, x]) => k.trim() !== "" && typeof x === "string" && x.trim() !== ""))
      out.push("quy đổi cần dạng chữ → chữ, không ô trống");
    else if (Object.keys(v).length > QUY_DOI_TOI_DA) out.push(`quy đổi tối đa ${QUY_DOI_TOI_DA} giá trị`);
    else if (Object.entries(v).some(([k, x]) => detectPersonal(k) !== null || detectPersonal(x as string) !== null))
      out.push("quy đổi có số điện thoại, email hay số giấy tờ — không lưu vào mẫu");
  }
  return out;
}
