/**
 * Chuẩn hoá phần chữ của địa chỉ (hàng 75, ADR-0016 quyết định 5): bỏ dấu, tên đường chuẩn hoá, số nhà chuẩn hoá — đường
 * hẻm viết thành dãy số từ đường chính vào — và khoá địa chỉ. Thuần, không gọi gì ra ngoài.
 */

/** Bỏ dấu tiếng Việt (đ → d), giữ hoa thường. */
export function boDau(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").normalize("NFC");
}

/** Dạng so sánh: bỏ dấu, chữ thường, dấu câu (trừ «/») thành khoảng trắng, gọn khoảng trắng. */
export function dangSo(s: string): string {
  return boDau(s)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}/]+/gu, " ")
    .replace(/\s*\/\s*/g, "/")
    .trim()
    .replace(/\s+/g, " ");
}

const TIEN_TO_DUONG = new Set(["duong", "pho", "d", "dg"]);

/** Tên đường chuẩn hoá cho khoá: bỏ dấu, chữ thường, bỏ «đường», «phố» ở đầu, gọn khoảng trắng. */
export function tenDuongChuan(tenDuong: string): string {
  const tu = dangSo(tenDuong).split(" ").filter(Boolean);
  if (tu.length > 1 && TIEN_TO_DUONG.has(tu[0]!)) tu.shift();
  return tu.join(" ");
}

/** Số nhà chuẩn: bỏ khoảng trắng, chữ cái hoa — `45 / 12 / 3a` → `45/12/3A`. */
export function soNhaChuan(soNha: string): string {
  return soNha.replace(/\s+/g, "").toUpperCase();
}

const SO = /^\d+[a-z]?$/i;
const DUONG_SO = /^\d+[a-z]?(?:\/\d+[a-z]?)*$/i;

export type TachSoNha = {
  /** Số nhà chuẩn, hay `null` khi chữ không có số nhà của nhà. */
  streetNumber: string | null;
  /** Phần còn lại sau khi bỏ số nhà — tên đường như người gõ, đã gọn khoảng trắng. */
  streetName: string;
  /** Chữ có hẻm, ngõ mà không có số nhà: đó là địa chỉ của hẻm, không phải của nhà. */
  hemKhongSo: boolean;
};

/**
 * Tách số nhà khỏi phần «số nhà + đường». Nhận: `45`, `45A`, `45/12/3` đứng đầu; «số 3 hẻm 45/12», «số 3 HXH 45/12»,
 * «số 3 hẻm xe hơi 45/12», «số 3 kiệt 45/12» → `45/12/3`; kiểu Hà Nội «số 3 ngách 12 ngõ 45» (thứ tự nào cũng được) →
 * `45/12/3` — ngõ (hay hẻm, kiệt), rồi ngách, rồi số.
 */
export function tachSoNha(phan: string): TachSoNha {
  const goc = phan.replace(/,/g, " ").replace(/\s*\/\s*/g, "/").trim().split(/\s+/).filter(Boolean);
  const so = goc.map((t) => dangSo(t));
  const dung = new Array<boolean>(goc.length).fill(false);
  let truoc: string | null = null;
  let soNha: string | null = null;
  let hem: string | null = null;
  let ngach: string | null = null;

  for (let i = 0; i < so.length; i++) {
    const t = so[i]!;
    const ke = so[i + 1];
    if ((t === "so" || t === "sn") && ke !== undefined && DUONG_SO.test(ke)) {
      soNha = goc[i + 1]!;
      dung[i] = dung[i + 1] = true;
      i++;
      continue;
    }
    if (t === "hem" || t === "hxh" || t === "kiet" || t === "ngo") {
      let j = i + 1;
      if (t === "hem" && so[j] === "xe" && so[j + 1] === "hoi") j += 2;
      const p = so[j];
      if (p !== undefined && DUONG_SO.test(p)) {
        hem = goc[j]!;
        for (let k = i; k <= j; k++) dung[k] = true;
        i = j;
        continue;
      }
    }
    if (t === "ngach" && ke !== undefined && SO.test(ke)) {
      ngach = goc[i + 1]!;
      dung[i] = dung[i + 1] = true;
      i++;
      continue;
    }
  }
  if (!dung[0] && so[0] !== undefined && DUONG_SO.test(so[0])) {
    truoc = goc[0]!;
    dung[0] = true;
  }

  let streetNumber: string | null = null;
  let hemKhongSo = false;
  if (truoc !== null) streetNumber = truoc;
  else if (soNha !== null) streetNumber = [hem, ngach, soNha].filter((x): x is string => x !== null).join("/");
  else if (hem !== null || ngach !== null) hemKhongSo = true;

  const streetName = goc
    .filter((_, i) => !dung[i])
    .join(" ")
    .trim();
  return { streetNumber: streetNumber === null ? null : soNhaChuan(streetNumber), streetName, hemKhongSo };
}

/** Khoá địa chỉ (ADR-0016 quyết định 5): mã tỉnh | mã xã | tên đường chuẩn hoá | số nhà chuẩn hoá. */
export function khoaDiaChi(maTinh: string, maXa: string, tenDuong: string, soNha: string): string {
  return [maTinh, maXa, tenDuongChuan(tenDuong), soNhaChuan(soNha)].join("|");
}
