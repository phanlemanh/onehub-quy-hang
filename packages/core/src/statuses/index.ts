/**
 * Trạng thái riêng của sàn (hàng 46, Tham chiếu §5 «sàn thêm nhãn, không thêm nghĩa», sổ điểm biến thiên #21): sàn thêm
 * nhãn như «Giữ chỗ», mỗi nhãn neo vào một trong sáu trạng thái chuẩn và nhận luật chuyển, màu, luật ra ngoài của trạng
 * thái đó — không có trạng thái thứ bảy. Định nghĩa nhãn nằm ở `company_settings` (khoá `labels.status.<mã>`, giá trị
 * `{label, anchor}`, gỡ = `null`); căn nhớ mã nhãn ở `listings.status_label`, đặt bằng `status_changed` mang khoá `label`.
 * Lõi không đọc cơ sở dữ liệu — người gọi đưa dòng `{ key, value }` của sàn vào.
 */
import { kiemChuNhan } from "../labels";
import { STANDARD_STATUSES, isStandardStatus, type StandardStatus } from "../listing/status";

/** Tiền tố khoá của họ nhãn trạng thái trong `company_settings`. */
export const KHOA_TRANG_THAI = "labels.status.";
/** Trần nhãn riêng còn sống mỗi trạng thái chuẩn (sổ #21, Hỏi-6). */
export const TRAN_NHAN_MOI_NEO = 3;
/** Khuôn mã nhãn — trùng check của migration (cột `listings.status_label` và khoá `labels.status.<mã>`). */
export const MA_NHAN_RE = /^[a-z][a-z0-9_]{0,31}$/;

/** Nhãn mặc định của sáu trạng thái chuẩn — một chỗ có tên cho mọi mặt (trước đây là `STATUS_LABEL` của Bảng hàng). */
export const NHAN_TRANG_THAI_MAC_DINH: Readonly<Record<StandardStatus, string>> = {
  Incomplete: "Chưa đủ để rao",
  Active: "Đang bán",
  Pending: "Đang giao dịch",
  Closed: "Đã bán",
  Hold: "Tạm ngừng",
  Withdrawn: "Ngừng hẳn",
};

/** Một nhãn riêng còn sống của sàn. */
export type NhanTrangThai = { ma: string; label: string; anchor: StandardStatus };

export const laMaNhan = (v: unknown): v is string => typeof v === "string" && MA_NHAN_RE.test(v);
export const khoaNhan = (ma: string) => `${KHOA_TRANG_THAI}${ma}`;

/** So chữ hai nhãn: bỏ hoa thường và dấu cách thừa, giữ dấu tiếng Việt («Giữ chỗ» khác «Giu cho»). */
export const chuSo = (s: string) => s.trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");

/** Mã máy dựng một lần lúc tạo nhãn: chữ bỏ dấu, chữ thường, `_`; trùng mã đã có thì thêm `_2`, `_3`… */
export function maNhanMoi(chu: string, daCo: readonly string[]): string {
  const goc =
    chu
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[đĐ]/g, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 28) || "nhan";
  const dau = /^[a-z]/.test(goc) ? goc : `n_${goc}`.slice(0, 28);
  if (!daCo.includes(dau)) return dau;
  for (let i = 2; ; i++) if (!daCo.includes(`${dau}_${i}`)) return `${dau}_${i}`;
}

/** Một nhãn màn gửi lên: `code` vắng = nhãn mới. */
export type NhanGui = { code?: string; label: string; anchor: string };

export type KetQuaKiemBo = { ok: true; nhan: NhanTrangThai[] } | { ok: false; loi: string };

/**
 * Kiểm CẢ bộ nhãn sàn sẽ có sau lượt lưu (đủ bộ: vắng một mã đang có là gỡ nó). `daCo` là bộ nhãn đang sống — để giữ mã
 * và chặn đổi neo (Hỏi-5). Lỗi mở đầu bằng khoá máy `labels.status.<mã|moi>`.
 */
export function kiemNhanTrangThai(gui: readonly NhanGui[], daCo: readonly NhanTrangThai[] = []): KetQuaKiemBo {
  if (!Array.isArray(gui)) return { ok: false, loi: `${KHOA_TRANG_THAI}*: cần danh sách nhãn` };
  const ra: NhanTrangThai[] = [];
  const maDung = new Set<string>(daCo.map((n) => n.ma));
  for (const g of gui) {
    const khoa = `${KHOA_TRANG_THAI}${typeof g?.code === "string" && g.code ? g.code : "moi"}`;
    if (!g || typeof g !== "object") return { ok: false, loi: `${khoa}: cần {label, anchor}` };
    if (g.anchor === undefined || g.anchor === null || g.anchor === "") return { ok: false, loi: `${khoa}: thiếu trạng thái chuẩn để neo` };
    if (!isStandardStatus(g.anchor)) return { ok: false, loi: `${khoa}: neo «${String(g.anchor)}» không thuộc ${STANDARD_STATUSES.join(", ")}` };
    const chu = kiemChuNhan(khoa, g.label);
    if (!chu.ok) return chu;
    let ma: string;
    if (g.code !== undefined && g.code !== null && g.code !== "") {
      const cu = daCo.find((n) => n.ma === g.code);
      if (!cu) return { ok: false, loi: `${khoa}: mã không có trong bộ nhãn của sàn` };
      if (cu.anchor !== g.anchor) return { ok: false, loi: `${khoa}: không đổi được neo của nhãn đã tạo — gỡ rồi tạo nhãn mới` };
      if (ra.some((n) => n.ma === cu.ma)) return { ok: false, loi: `${khoa}: nhãn gửi hai lần` };
      ma = cu.ma;
    } else {
      ma = maNhanMoi(chu.nhan, [...maDung]);
      maDung.add(ma);
    }
    ra.push({ ma, label: chu.nhan, anchor: g.anchor });
  }
  for (const s of STANDARD_STATUSES) {
    const so = ra.filter((n) => n.anchor === s).length;
    if (so > TRAN_NHAN_MOI_NEO) return { ok: false, loi: `${KHOA_TRANG_THAI}${s}: tối đa ${TRAN_NHAN_MOI_NEO} nhãn riêng mỗi trạng thái (đang ${so})` };
  }
  // Hai nghĩa không hiện cùng một chữ (bài học Ngoài-1/3 hàng 45): không trùng nhãn mặc định hay nhãn riêng khác.
  for (const n of ra) {
    const khoa = khoaNhan(n.ma);
    const mac = STANDARD_STATUSES.find((s) => chuSo(NHAN_TRANG_THAI_MAC_DINH[s]) === chuSo(n.label));
    if (mac) return { ok: false, loi: `${khoa}: trùng tên trạng thái «${NHAN_TRANG_THAI_MAC_DINH[mac]}»` };
    const kia = ra.find((m) => m !== n && chuSo(m.label) === chuSo(n.label));
    if (kia) return { ok: false, loi: `${khoa}: trùng tên nhãn «${kia.label}»` };
  }
  return { ok: true, nhan: ra };
}

/** Dòng `company_settings` của sàn → bộ nhãn còn sống. Dòng hỏng, `null` (đã gỡ), khoá lạ bị bỏ qua, không ném. */
export function boNhanTrangThai(dong: readonly { key: string; value: unknown }[]): NhanTrangThai[] {
  const ra: NhanTrangThai[] = [];
  for (const d of dong) {
    if (typeof d?.key !== "string" || !d.key.startsWith(KHOA_TRANG_THAI)) continue;
    const ma = d.key.slice(KHOA_TRANG_THAI.length);
    if (!laMaNhan(ma)) continue;
    const v = d.value as { label?: unknown; anchor?: unknown } | null;
    if (!v || typeof v !== "object" || typeof v.label !== "string" || !v.label.trim() || !isStandardStatus(v.anchor)) continue;
    ra.push({ ma, label: v.label, anchor: v.anchor });
  }
  return ra.sort((a, b) => STANDARD_STATUSES.indexOf(a.anchor) - STANDARD_STATUSES.indexOf(b.anchor) || a.ma.localeCompare(b.ma));
}

/** Nhãn riêng neo vào một trạng thái chuẩn, theo thứ tự đã lưu. */
export const nhanCuaNeo = (nhan: readonly NhanTrangThai[], s: StandardStatus) => nhan.filter((n) => n.anchor === s);

/**
 * Chữ hiện của một căn: nhãn riêng khi mã còn sống VÀ neo đúng trạng thái của căn; không thì nhãn mặc định (mã đã gỡ hay
 * lệch neo không làm căn mất chữ). `macDinh` cho mặt có chữ dựng sẵn riêng.
 */
export function nhanCuaCan(
  nhan: readonly NhanTrangThai[] | null | undefined,
  status: StandardStatus,
  statusLabel: string | null | undefined,
  macDinh: string = NHAN_TRANG_THAI_MAC_DINH[status],
): string {
  if (!statusLabel || !nhan) return macDinh;
  const n = nhan.find((x) => x.ma === statusLabel);
  return n && n.anchor === status ? n.label : macDinh;
}

/** Lệnh đổi trạng thái mang nhãn: kết quả kiểm nhãn và có phải đổi nhãn tại chỗ (cùng trạng thái) hay không. */
export type KetQuaNhanSuKien = { ok: true; doiNhanTaiCho: boolean } | { ok: false; loi: string };

/**
 * Kiểm phần nhãn của `status_changed`: `label` (mã) phải còn sống trong bộ nhãn của sàn và neo đúng `to`. `to` bằng trạng
 * thái hiện tại là ĐỔI NHÃN TẠI CHỖ — được khi nhãn khác nhãn đang mang (bảng chuyển không xét); cùng nhãn thì không có gì
 * để đổi. `to` khác trạng thái hiện tại thì người gọi vẫn chạy `checkTransition`.
 */
export function kiemNhanSuKien(
  nhan: readonly NhanTrangThai[],
  hienTai: { standardStatus: StandardStatus; statusLabel?: string | null },
  payload: { to: unknown; label?: unknown },
): KetQuaNhanSuKien {
  const co = Object.hasOwn(payload, "label") && payload.label !== undefined;
  const label = co ? (payload.label as string | null) : null;
  if (label !== null) {
    if (!laMaNhan(label)) return { ok: false, loi: `label: «${String(label)}» không phải mã nhãn` };
    const n = nhan.find((x) => x.ma === label);
    if (!n) return { ok: false, loi: `label: «${label}» không có trong bộ nhãn của sàn` };
    if (n.anchor !== payload.to) return { ok: false, loi: `label: «${label}» neo vào ${n.anchor}, không phải ${String(payload.to)}` };
  }
  if (payload.to !== hienTai.standardStatus) return { ok: true, doiNhanTaiCho: false };
  if (!co) return { ok: true, doiNhanTaiCho: false };
  if ((hienTai.statusLabel ?? null) === label) return { ok: false, loi: "label: căn đã mang nhãn này" };
  return { ok: true, doiNhanTaiCho: true };
}

/**
 * Thân API (`GET /company/statuses` hay phần `statuses` của `GET /company/labels`) → bộ nhãn của lõi. Một hàm cho mọi màn
 * đọc thân ấy (Bảng hàng, Hôm nay): khuôn API là `code`, lõi là `ma`. Thân hỏng hay vắng → bộ rỗng (chữ mặc định).
 */
export function nhanTuBang(than: { statuses?: readonly unknown[] } | null | undefined): NhanTrangThai[] {
  const ra: NhanTrangThai[] = [];
  for (const s of than?.statuses ?? []) {
    const d = s as { status?: unknown; labels?: readonly unknown[] } | null;
    if (!d || !isStandardStatus(d.status) || !Array.isArray(d.labels)) continue;
    for (const l of d.labels) {
      const x = l as { code?: unknown; label?: unknown } | null;
      if (x && laMaNhan(x.code) && typeof x.label === "string" && x.label.trim()) ra.push({ ma: x.code, label: x.label, anchor: d.status });
    }
  }
  return ra;
}

/** Giá trị một dòng `labels.status.<mã>` của `company_settings`. */
export type GiaTriNhan = { label: string; anchor: StandardStatus };
/** Một dòng `company_settings` của họ nhãn trạng thái; `value: null` = đã gỡ. */
export type DongTrangThai = { key: string; value: GiaTriNhan | null };

/** Bộ nhãn đã kiểm (`kiemNhanTrangThai`) → dòng sẽ có trong `company_settings`, mỗi nhãn một dòng. */
export function dongNhanTrangThai(nhan: readonly NhanTrangThai[]): { key: string; value: GiaTriNhan }[] {
  return nhan.map((n) => ({ key: khoaNhan(n.ma), value: { label: n.label, anchor: n.anchor } }));
}

/** Chuỗi hoá bền với thứ tự khoá: jsonb trả khoá theo thứ tự của nó, thân gửi theo thứ tự của màn (như hàng 45). */
function chuoiSap(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(chuoiSap).join(",")}]`;
  if (v !== null && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${chuoiSap(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v) ?? "null";
}

/**
 * Dòng cần ghi để bảng đang lưu (`daLuu`) thành bộ mới (`moi`): mã mới hay đổi chữ → dòng mới; mã đang sống (giá trị khác
 * `null`) mà vắng trong bộ mới → `null` (gỡ — nhật ký vẫn có vết); mã giữ nguyên → không ghi (không thổi phồng nhật ký).
 * Dòng ngoài họ `labels.status.*` của `daLuu` không đụng tới.
 */
export function doiNhanTrangThai(daLuu: readonly { key: string; value: unknown }[], moi: readonly NhanTrangThai[]): DongTrangThai[] {
  const cu = new Map<string, string>();
  for (const d of daLuu) {
    if (typeof d?.key !== "string" || !d.key.startsWith(KHOA_TRANG_THAI) || !laMaNhan(d.key.slice(KHOA_TRANG_THAI.length))) continue;
    cu.set(d.key, chuoiSap(d.value ?? null));
  }
  const ra: DongTrangThai[] = [];
  const coMoi = new Set<string>();
  for (const r of dongNhanTrangThai(moi)) {
    coMoi.add(r.key);
    if (cu.get(r.key) !== chuoiSap(r.value)) ra.push(r);
  }
  for (const [key, v] of cu) if (!coMoi.has(key) && v !== "null") ra.push({ key, value: null });
  return ra;
}

/** Một dòng của thân `GET /api/v1/company/statuses`: trạng thái chuẩn, nhãn mặc định, nhãn riêng kèm số căn đang mang. */
export type DongBangTrangThai = { status: StandardStatus; default: string; labels: { code: string; label: string; inUse: number }[] };

/**
 * Thân `GET /api/v1/company/statuses`: sáu dòng theo thứ tự chuẩn, mỗi dòng các nhãn riêng neo vào nó (khuôn `code`, đọc
 * ngược bằng `nhanTuBang`). `inUse` theo mã — người gọi đếm căn trong sàn; mã vắng là 0.
 */
export function bangTrangThai(nhan: readonly NhanTrangThai[], inUse: Readonly<Record<string, number>>): { statuses: DongBangTrangThai[] } {
  return {
    statuses: STANDARD_STATUSES.map((s) => ({
      status: s,
      default: NHAN_TRANG_THAI_MAC_DINH[s],
      labels: nhanCuaNeo(nhan, s).map((n) => ({ code: n.ma, label: n.label, inUse: Object.hasOwn(inUse, n.ma) ? (inUse[n.ma] ?? 0) : 0 })),
    })),
  };
}
