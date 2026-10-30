// Ngưỡng của bài thử lưới — Manh Phan ký ở Cổng Phạm vi 30/10 (Hỏi-1 của hồ sơ bai-thu-luoi-5000-dong).
// Hàm thuần: không đọc tệp, không gọi trình duyệt — do.mjs và do-lai.mjs đều so số qua đây.
export const NGUONG = {
  cuonP95: 33.4, // ms giữa hai khung hình — 30 khung/giây
  khungCham: 50, // ms — khung giật thấy được
  tiLeChamToiDa: 0.01,
  goP95: 50, // ms từ event.timeStamp của phím tới khung kế
  danMs: 1000, // ms từ phím dán tới khung có lô dán
  rongP95: 17.5, // ms — trang rỗng cùng giảm tốc: máy rảnh
  benchToiDa: 1.2, // lần so với mốc bài đo JS của máy
};

export function phanVi(mang, p) {
  if (!mang.length) return Number.NaN;
  const s = [...mang].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)];
}

export function trungVi(mang) {
  return phanVi(mang, 50);
}

/** Khoảng cách giữa các mốc khung hình → p95 và tỉ lệ khung chậm. */
export function thuocCuon(khung) {
  const kc = [];
  for (let i = 1; i < khung.length; i++) kc.push(khung[i] - khung[i - 1]);
  return {
    so_khung: kc.length,
    p95: phanVi(kc, 95),
    ti_le_cham: kc.length ? kc.filter((x) => x > NGUONG.khungCham).length / kc.length : 1,
  };
}

/** Một lượt hợp lệ khi máy rảnh: trang rỗng mượt và bài đo JS không chậm hơn mốc quá 1,2 lần. */
export function hieuChuanHopLe({ rongP95, benchMs, mocBenchMs }) {
  const ly_do = [];
  if (!(rongP95 <= NGUONG.rongP95)) ly_do.push(`trang rỗng p95 ${rongP95} ms > ${NGUONG.rongP95}`);
  if (!(benchMs <= mocBenchMs * NGUONG.benchToiDa)) ly_do.push(`bài đo JS ${benchMs} ms > ${NGUONG.benchToiDa}× mốc ${mocBenchMs}`);
  return { hop_le: ly_do.length === 0, ly_do };
}

/** So một bộ số với ngưỡng: { dat, truot: [tên thước…], chi_tiet }. */
export function danhGia({ cuon, go, dan }) {
  const truot = [];
  const chi_tiet = [];
  if (!(cuon?.p95 <= NGUONG.cuonP95) || !(cuon?.ti_le_cham <= NGUONG.tiLeChamToiDa) || cuon?.toi_cuoi !== true) {
    truot.push("cuon");
    chi_tiet.push(`cuon: p95 ${cuon?.p95} ms (≤ ${NGUONG.cuonP95}), khung chậm ${cuon?.ti_le_cham} (≤ ${NGUONG.tiLeChamToiDa}), tới dòng 5.000 ${cuon?.toi_cuoi}`);
  }
  if (!(go?.p95 <= NGUONG.goP95) || go?.gia_tri_dung !== true) {
    truot.push("go");
    chi_tiet.push(`go: p95 ${go?.p95} ms (≤ ${NGUONG.goP95}), giá trị đúng ${go?.gia_tri_dung}`);
  }
  if (!(dan?.ms <= NGUONG.danMs) || dan?.o_mau_dung !== true) {
    truot.push("dan");
    chi_tiet.push(`dan: ${dan?.ms} ms (≤ ${NGUONG.danMs}), ô mẫu đúng ${dan?.o_mau_dung}`);
  }
  return { dat: truot.length === 0, truot, chi_tiet };
}

/** Kết luận cả bài thử: thoát 0 khi bản chậm trượt và (ReUI đạt, hoặc ReUI trượt và Glide đã đo). */
export function ketLuan({ reui, glide, cham, chamPhim }) {
  const loi = [];
  if (!reui) loi.push("thiếu số đo ReUI");
  if (cham?.dat !== false || !["cuon", "go", "dan"].every((t) => cham?.truot?.includes(t))) loi.push("đối chứng đỏ ?cham=1 không trượt đủ ba thước");
  if (!chamPhim?.truot?.includes("go")) loi.push("đối chứng đỏ ?cham=phim không làm thước gõ trượt");
  if (reui && !reui.dat && !glide) loi.push("ReUI trượt mà chưa đo Glide");
  const chon = reui?.dat ? "reui" : glide?.dat ? "glide" : null;
  return { ok: loi.length === 0, chon, loi };
}
