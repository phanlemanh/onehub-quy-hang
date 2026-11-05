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

/**
 * Chữ (dạng so sánh) là tiền tố đường: «đường», «phố», «đ», «đg». Khi có chữ gốc, «d» trơn chỉ là tiền tố khi viết bằng chữ
 * «đ» hay có dấu chấm («Đ.», «đ», «D.») — chữ cái «D» đứng một mình là ký hiệu lô, khu, block («Lô D số 12»).
 */
export function laTienToDuong(t: string, goc?: string): boolean {
  if (!TIEN_TO_DUONG.has(t)) return false;
  if (t === "d" && goc !== undefined) return /^[đĐ]/.test(goc) || goc.endsWith(".");
  return true;
}

/** Số của đường số: một con số, có thể kèm một chữ cái — «5», «05», «5a». */
const SO_CUA_DUONG = /^\d+[a-z]?$/;
const boSoKhongDau = (n: string) => n.replace(/^0+(?=\d)/, "");

/**
 * Tên đường chuẩn hoá cho khoá: bỏ dấu, chữ thường, bỏ «đường», «phố» ở đầu, gọn khoảng trắng. Đường số (va-duong-so-n):
 * «số 5», «số5», «số 05» đều thành `so 5`, để mọi cách viết của một đường số cùng khoá. «Đường 5» (không chữ «số») giữ `5`.
 */
export function tenDuongChuan(tenDuong: string): string {
  let tu = dangSo(tenDuong)
    .split(" ")
    .filter(Boolean)
    .flatMap((t) => {
      const m = /^so(\d+[a-z]?)$/.exec(t);
      return m ? ["so", m[1]!] : [t];
    });
  if (tu.length > 1 && laTienToDuong(tu[0]!)) tu.shift();
  if (tu.length === 2 && tu[0] === "so" && SO_CUA_DUONG.test(tu[1]!)) tu = ["so", boSoKhongDau(tu[1]!)];
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
 * `45/12/3` — ngõ (hay hẻm, kiệt), rồi ngách, rồi số. «số» đứng ngay sau tiền tố đường là tên đường («12 Đường số 5» →
 * số nhà 12, đường «Đường số 5»), không phải dấu số nhà.
 */
export function tachSoNha(phan: string): TachSoNha {
  return tachSoNhaVoi(phan, laTienToDuong);
}

/**
 * Bộ tách với hàm nhận tiền tố đường truyền vào — `tachSoNha` dùng bộ tiền tố thật; hàm luôn sai cho lại đúng hành vi
 * trước khi vá «Đường số N» (bộ kiểm dùng để phá thử).
 */
export function tachSoNhaVoi(phan: string, laTienTo: (t: string, goc: string) => boolean): TachSoNha {
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
    const truocLaTienTo = i > 0 && laTienTo(so[i - 1]!, goc[i - 1]!);
    if ((t === "so" || t === "sn") && !truocLaTienTo && ke !== undefined && DUONG_SO.test(ke)) {
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
