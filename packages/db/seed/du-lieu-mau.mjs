// Bộ dữ liệu mẫu của sàn thử (hàng 5): sinh tất định từ một hạt giống, không đồng hồ, không Math.random.
// Mọi bản ghi mang nhãn mẫu; tên người và sàn mở đầu «[Mẫu]»; số điện thoại dạng 0900 000 0xx; email thuộc miền
// mau.quy-hang.test (miền .test dành riêng, không gửi được thư). Danh mục đúng khuôn CatalogFeed của packages/connect.
// Kèm các hàm kiểm thuần trả danh sách lỗi có tên — bài kiểm dùng chúng cho cả vật lành lẫn bản sao bị phá.

export const NHAN = "Mẫu";
export const TIEN_TO_TEN = "[Mẫu]";
export const MIEN_EMAIL = "mau.quy-hang.test";
export const TEN_SAN = "[Mẫu] Sàn thử";
export const TIEN_TO_UPI = "urn:onehub:upi:mau:";
export const HAT_GIONG = 20261030;

/** Sáu trạng thái chuẩn của hàng (Tham chiếu §5, RESO StandardStatus); bốn trạng thái đầu là đang mở. */
export const TRANG_THAI = ["Incomplete", "Active", "Pending", "Hold", "Closed", "Withdrawn"];
export const TRANG_THAI_MO = ["Incomplete", "Active", "Pending", "Hold"];

const TOA = ["A", "B"];
const SO_TANG = 15;
const SO_TRUC = 6;
// Thuộc tính theo trục: diện tích (m²), phòng ngủ, hướng ban công.
const TRUC = [
  { dt: 54.2, pn: 1, huong: "Đông Nam" },
  { dt: 68.5, pn: 2, huong: "Đông Bắc" },
  { dt: 75.0, pn: 2, huong: "Tây Bắc" },
  { dt: 82.3, pn: 2, huong: "Tây Nam" },
  { dt: 96.8, pn: 3, huong: "Nam" },
  { dt: 110.4, pn: 3, huong: "Bắc" },
];
// Số hàng theo trạng thái, cộng 40.
const PHAN_BO = { Active: 14, Incomplete: 6, Pending: 5, Hold: 5, Closed: 5, Withdrawn: 5 };
const GHI_CHU = ["Chủ cần bán nhanh", "Có sổ hồng", "Xem nhà sau 18 giờ", "Nhà trống, có chìa", "Nội thất cơ bản", ""];

/** mulberry32: bộ sinh số giả ngẫu nhiên 32 bit, đủ cho dữ liệu mẫu. */
function boSinh(hat) {
  let a = hat >>> 0;
  const so = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const nguyen = (n) => Math.floor(so() * n);
  const tron = (ds) => {
    const b = [...ds];
    for (let i = b.length - 1; i > 0; i--) {
      const j = nguyen(i + 1);
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  };
  return { nguyen, tron };
}

const hai = (n) => String(n).padStart(2, "0");
const soMau = (n) => `0900 000 ${String(n).padStart(3, "0")}`;
export const maCan = (toa, tang, truc) => `${toa}-${hai(tang)}.${hai(truc)}`;

/** @param {{ hatGiong?: number }} [p] */
export function sinhDuLieuMau({ hatGiong = HAT_GIONG } = {}) {
  const r = boSinh(hatGiong);

  const nguoi = [
    { khoa: "telesales", ten: "[Mẫu] Telesales", vai: ["telesales"], khu: [] },
    { khoa: "dau-chu-1", ten: "[Mẫu] Đầu chủ 1", vai: ["listing_agent"], khu: ["Toà A"] },
    { khoa: "dau-chu-2", ten: "[Mẫu] Đầu chủ 2", vai: ["listing_agent"], khu: ["Toà B"] },
    { khoa: "dau-khach", ten: "[Mẫu] Đầu khách", vai: ["buyer_agent"], khu: [] },
    { khoa: "truong-nhom", ten: "[Mẫu] Trưởng nhóm", vai: ["team_lead"], khu: [] },
    { khoa: "quan-tri", ten: "[Mẫu] Quản trị sàn", vai: ["company_admin"], khu: [] },
  ].map((n) => ({ ...n, email: `${n.khoa}@${MIEN_EMAIL}`, nhan: NHAN }));

  const khu = TOA.map((t) => ({ ten: `Toà ${t}`, toa: t, nhan: NHAN }));

  // Căn không mang được khoá nhãn (khuôn danh mục strict): nhãn của căn là tiền tố UPI urn:onehub:upi:mau:.
  const danhMuc = {
    schemaVersion: 1,
    provider: "[Mẫu] Nguồn danh mục thử",
    measuredAt: "2026-10-30T00:00:00+07:00",
    subdivisions: [
      {
        subdivisionKey: "mau-du-an-thu",
        subdivisionName: "[Mẫu] Dự án căn hộ thử",
        complexName: null,
        buildings: TOA.map((toa) => ({
          buildingKey: toa,
          buildingName: `Toà ${toa}`,
          units: Array.from({ length: SO_TANG * SO_TRUC }, (_, i) => {
            const tang = Math.floor(i / SO_TRUC) + 1;
            const truc = (i % SO_TRUC) + 1;
            const ma = maCan(toa, tang, truc);
            const t = TRUC[truc - 1];
            return {
              upi: `${TIEN_TO_UPI}${ma}`,
              unitNumber: ma,
              stack: hai(truc),
              floor: tang,
              livingArea: t.dt,
              bedroomsTotal: t.pn,
              directionFaces: t.huong,
              propertyType: "Residential",
              propertySubType: "Condominium",
            };
          }),
        })),
      },
    ],
  };
  const moiCan = danhMuc.subdivisions[0].buildings.flatMap((b) => b.units);

  // 40 căn khác nhau; 30 chủ nhà, mười chủ đầu có hai căn. Đầu chủ theo toà của căn đầu tiên của chủ —
  // một chủ nhiều căn thì một đầu chủ (Tham chiếu §4).
  const canChon = r.tron(moiCan).slice(0, 40);
  const chuNha = Array.from({ length: 30 }, (_, i) => ({
    ma: `CN-${hai(i + 1)}`,
    ten: `[Mẫu] Chủ nhà ${hai(i + 1)}`,
    soDienThoai: soMau(i + 1),
    dauChu: "",
    nhan: NHAN,
  }));
  const chuCuaCan = canChon.map((_, i) => chuNha[i < 30 ? i : i - 30]);
  canChon.forEach((can, i) => {
    const chu = chuCuaCan[i];
    if (!chu.dauChu) chu.dauChu = can.unitNumber.startsWith("A-") ? "dau-chu-1" : "dau-chu-2";
  });

  const trangThai = r.tron(Object.entries(PHAN_BO).flatMap(([t, n]) => Array(n).fill(t)));
  const hang = canChon
    .map((can, i) => {
      const giaM2 = 45 + r.nguyen(31); // triệu đồng mỗi m²
      const gia = Math.round((can.livingArea * giaM2) / 10) * 10 * 1_000_000;
      return {
        ma: "",
        maCan: can.unitNumber,
        upi: can.upi,
        trangThai: trangThai[i],
        gia,
        dieuKienPhi: r.nguyen(2) === 0 ? "bao_phi" : "khong_bao_phi",
        dauChu: chuCuaCan[i].dauChu,
        chuNha: chuCuaCan[i].ma,
        ghiChu: GHI_CHU[r.nguyen(GHI_CHU.length)],
        nhan: NHAN,
      };
    })
    .sort((a, b) => (a.maCan < b.maCan ? -1 : 1))
    .map((h, i) => ({ ...h, ma: `H-${hai(i + 1)}` }));

  // 12 lead. Ca trùng để thử kiểm trùng sau này: lead 01 trên căn đã có hàng mở, lead 02 mang số của chủ nhà đã có.
  const hangMo = hang.find((h) => TRANG_THAI_MO.includes(h.trangThai));
  const lead = Array.from({ length: 12 }, (_, i) => {
    const toa = TOA[r.nguyen(2)];
    const biet = r.nguyen(2) === 0;
    return {
      ma: `L-${hai(i + 1)}`,
      ten: `[Mẫu] Chủ nhà mới ${hai(i + 1)}`,
      soDienThoai: soMau(31 + i),
      toa,
      maCan: biet ? maCan(toa, 1 + r.nguyen(SO_TANG), 1 + r.nguyen(SO_TRUC)) : null,
      ghiChu: biet ? "Gọi qua tổng đài, đã biết căn" : "Mới biết toà",
      nhan: NHAN,
    };
  });
  lead[0] = { ...lead[0], toa: hangMo.maCan[0], maCan: hangMo.maCan, ghiChu: "Trùng căn đang có hàng mở" };
  lead[1] = { ...lead[1], soDienThoai: chuNha[0].soDienThoai, ghiChu: "Trùng số chủ nhà đã có" };

  return {
    phienBan: 1,
    hatGiong,
    nhan: NHAN,
    san: { ten: TEN_SAN, nhan: NHAN },
    nguoi,
    khu,
    danhMuc,
    chuNha,
    hang,
    lead,
  };
}

// ——— Hàm kiểm ————————————————————————————————————————————————————————————————————————————————

const SO_DUNG_MAU = /^0900 000 0\d\d$/;
// Bộ quét số theo danh sách cho phép: sau chuẩn hoá NFKC (chữ số toàn khổ thành chữ số thường, khoảng trắng không
// ngắt thành khoảng trắng), bỏ các chỗ được phép có chữ số — số mẫu đúng dạng, mốc giờ ISO, mã căn — rồi đếm mọi
// chữ số còn lại của chuỗi. Còn từ 9 chữ số trở lên thì đỏ: số điện thoại nào cũng có ít nhất 9 chữ số, viết cách
// nào cũng vậy, nên bộ quét không phải đoán dấu nối.
const SO_MAU = /(?<!\p{Nd})0900 000 0\d\d(?!\p{Nd})/gu;
const CHO_PHEP = [
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})/g, // mốc giờ ISO
  /(?<![\p{L}\p{Nd}])[A-Z]-\d{2}\.\d{2}(?!\p{Nd})/gu, // mã căn A-12.05
];
const NGUONG_CHU_SO = 9;
const EMAIL = /[^\s@<>"',;()]+@[^\s@<>"',;()]+/g;

/**
 * Quét một chuỗi tìm dữ liệu thật. Số: ngoài số mẫu 0900 000 0xx và các mã cho phép, chuỗi còn từ 9 chữ số trở lên
 * thì bị bắt. Email phải thuộc miền mẫu.
 * @returns {{ loi: string[], so: number, email: number }}
 */
export function quetChuoi(chuoi, noi = "") {
  const loi = [];
  const goc = String(chuoi).normalize("NFKC");
  let con = goc;
  const so = [...con.matchAll(SO_MAU)].length;
  con = con.replace(SO_MAU, " ");
  for (const re of CHO_PHEP) con = con.replace(re, " ");
  const chuSo = con.match(/\p{Nd}/gu)?.length ?? 0;
  if (chuSo >= NGUONG_CHU_SO) loi.push(`số không đúng dạng mẫu: ${noi} «${String(chuoi).slice(0, 80)}» (${chuSo} chữ số ngoài số mẫu)`);
  let email = 0;
  for (const m of goc.matchAll(EMAIL)) {
    email++;
    if (!m[0].toLowerCase().endsWith(`@${MIEN_EMAIL}`)) loi.push(`email không thuộc miền mẫu: ${noi} «${m[0]}»`);
  }
  return { loi, so, email };
}

/** Ô số ở cột điện thoại: số điện thoại phải là chuỗi dạng mẫu, không bao giờ là ô số. */
export const kiemOSoDienThoai = (gt, noi = "") =>
  typeof gt === "number" ? [`số không đúng dạng mẫu: ${noi} ô số ${gt}`] : [];

function* moiChuoi(gt, duong = "") {
  if (typeof gt === "string") yield [duong, gt];
  else if (Array.isArray(gt)) for (const [i, x] of gt.entries()) yield* moiChuoi(x, `${duong}[${i}]`);
  else if (gt && typeof gt === "object") for (const [k, x] of Object.entries(gt)) yield* moiChuoi(x, `${duong}.${k}`);
}

/**
 * Không dữ liệu thật trong bộ dữ liệu: quét mọi chuỗi; trường điện thoại đúng dạng; tên người và sàn mở đầu «[Mẫu]».
 * @returns {{ loi: string[], dem: { so: number, email: number, ten: number } }}
 */
export function kiemDuLieuThat(d) {
  const loi = [];
  const dem = { so: 0, email: 0, ten: 0 };
  for (const [duong, s] of moiChuoi(d)) {
    const q = quetChuoi(s, duong);
    loi.push(...q.loi);
    dem.so += q.so;
    dem.email += q.email;
  }
  for (const [loai, ds] of [["chủ nhà", d.chuNha], ["lead", d.lead]]) {
    for (const x of ds) if (!SO_DUNG_MAU.test(x.soDienThoai)) loi.push(`số không đúng dạng mẫu: ${loai} ${x.ma}`);
  }
  const ten = [["sàn", d.san], ...d.nguoi.map((x) => ["người", x]), ...d.chuNha.map((x) => ["chủ nhà", x]), ...d.lead.map((x) => ["lead", x])];
  for (const [loai, x] of ten) {
    dem.ten++;
    if (!String(x.ten).startsWith(TIEN_TO_TEN)) loi.push(`tên không mang nhãn mẫu: ${loai} «${x.ten}»`);
  }
  return { loi, dem };
}

/**
 * Nhãn theo từng loại bản ghi của bộ dữ liệu. Căn: tiền tố UPI mẫu (khuôn danh mục không có khoá nhãn).
 * @returns {{ loi: string[], dem: Record<string, { tong: number, nhan: number }> }}
 */
export function kiemNhan(d) {
  const loai = {
    sàn: [[d.san], (x) => x.nhan === NHAN && x.ten.startsWith(TIEN_TO_TEN)],
    người: [d.nguoi, (x) => x.nhan === NHAN],
    căn: [d.danhMuc.subdivisions.flatMap((p) => p.buildings.flatMap((b) => b.units)), (x) => x.upi.startsWith(TIEN_TO_UPI)],
    "chủ nhà": [d.chuNha, (x) => x.nhan === NHAN],
    hàng: [d.hang, (x) => x.nhan === NHAN],
    lead: [d.lead, (x) => x.nhan === NHAN],
  };
  return demNhan(Object.fromEntries(Object.entries(loai).map(([k, [ds, co]]) => [k, ds.map(co)])));
}

/** @param {Record<string, boolean[]>} theoLoai */
export function demNhan(theoLoai) {
  const loi = [];
  const dem = {};
  for (const [k, ds] of Object.entries(theoLoai)) {
    dem[k] = { tong: ds.length, nhan: ds.filter(Boolean).length };
    if (ds.length === 0) loi.push(`không có bản ghi: ${k}`);
    else if (dem[k].nhan !== ds.length) loi.push(`thiếu nhãn mẫu: ${k}`);
  }
  return { loi, dem };
}

/**
 * Danh mục: khuôn CatalogFeed nhận; mã căn duy nhất; toà, tầng, trục đọc từ mã căn khớp thuộc tính của căn.
 * @param {{ safeParse: (x: unknown) => { success: boolean, error?: unknown } }} CatalogFeed
 */
export function kiemKhuonDanhMuc(danhMuc, CatalogFeed) {
  const loi = [];
  const kq = CatalogFeed.safeParse(danhMuc);
  if (!kq.success) loi.push(`khuôn danh mục từ chối: ${String(kq.error).slice(0, 200)}`);
  const thay = new Set();
  let tong = 0;
  for (const p of danhMuc.subdivisions ?? [])
    for (const b of p.buildings ?? [])
      for (const u of b.units ?? []) {
        tong++;
        if (thay.has(u.unitNumber)) loi.push(`mã căn trùng: ${u.unitNumber}`);
        thay.add(u.unitNumber);
        const m = /^([A-Z])-(\d{2})\.(\d{2})$/.exec(u.unitNumber);
        if (!m || m[1] !== b.buildingKey || Number(m[2]) !== u.floor || m[3] !== u.stack)
          loi.push(`mã căn lệch thuộc tính: ${u.unitNumber}`);
      }
  return { loi, tong, duyNhat: thay.size };
}

/** Luật Tham chiếu §4, §5 trên hàng, chủ nhà, lead. */
export function kiemLuatThamChieu(d) {
  const loi = [];
  const tap = new Set(d.hang.map((h) => h.trangThai));
  for (const t of TRANG_THAI) if (!tap.has(t)) loi.push(`thiếu trạng thái: ${t}`);
  for (const t of tap) if (!TRANG_THAI.includes(t)) loi.push(`trạng thái lạ: ${t}`);
  const moTheoCan = new Map();
  for (const h of d.hang.filter((x) => TRANG_THAI_MO.includes(x.trangThai)))
    moTheoCan.set(h.maCan, (moTheoCan.get(h.maCan) ?? 0) + 1);
  for (const [can, n] of moTheoCan) if (n > 1) loi.push(`căn có hai hàng mở: ${can}`);
  const dauChuTheoChu = new Map();
  for (const h of d.hang) dauChuTheoChu.set(h.chuNha, new Set([...(dauChuTheoChu.get(h.chuNha) ?? []), h.dauChu]));
  for (const [chu, s] of dauChuTheoChu) if (s.size > 1) loi.push(`một chủ hai đầu chủ: ${chu}`);
  if (!d.lead.some((l) => l.maCan && moTheoCan.has(l.maCan))) loi.push("thiếu lead trên căn đã có hàng mở");
  const soChu = new Set(d.chuNha.map((c) => c.soDienThoai));
  if (!d.lead.some((l) => soChu.has(l.soDienThoai))) loi.push("thiếu lead mang số của chủ nhà đã có");
  return { loi };
}
