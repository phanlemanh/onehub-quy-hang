/** Đọc một nguồn của Hôm nay, tự thử lại một lần trước khi báo lỗi (AC-9). `null` nghĩa là đọc hỏng. */
export const CHO_THU_LAI_MS = 2_000;

const ngu = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function docCoThuLai<T>(doc: () => Promise<T | null>, cho: (ms: number) => Promise<void> = ngu): Promise<T | null> {
  const lan1 = await doc();
  if (lan1 !== null) return lan1;
  await cho(CHO_THU_LAI_MS);
  return doc();
}

/** Mảng từ một lời gọi JSON; mã lỗi, mất mạng, thân hỏng đều là `null`, không phải danh sách rỗng. */
export async function docMang<T>(url: string, chon: (j: unknown) => unknown = (j) => j, f: typeof fetch = fetch): Promise<T[] | null> {
  const r = await f(url, { cache: "no-store", credentials: "same-origin" }).catch(() => null);
  if (!r?.ok) return null;
  const ket = chon(await r.json().catch(() => null));
  return Array.isArray(ket) ? (ket as T[]) : null;
}

/** Các nguồn đang lỗi cần đọc lại khi mạng trở lại. */
export function nguonCanDocLai<K extends string>(trang: Readonly<Record<K, "dang" | "ok" | "loi">>): K[] {
  return (Object.keys(trang) as K[]).filter((k) => trang[k] === "loi");
}
