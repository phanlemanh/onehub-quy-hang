/**
 * Biết có mạng lại (AC-9, ADR-0006 việc 2): không dựa riêng sự kiện trình duyệt — thử định kỳ, thử khi quay lại trang;
 * một lời gọi thành công là có mạng. 15 giây khi có thao tác chờ hay lần cuối mất mạng, 30 giây khi yên.
 */
export const CHU_KY_CHO = 15_000;
export const CHU_KY_YEN = 30_000;

export type DongHo = {
  now(): number;
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(h: unknown): void;
};

export const dongHoThat: DongHo = {
  now: () => Date.now(),
  setTimeout: (fn, ms) => globalThis.setTimeout(fn, ms),
  clearTimeout: (h) => globalThis.clearTimeout(h as ReturnType<typeof setTimeout>),
};

export function taoNhip(o: { dongHo: DongHo; thu: () => Promise<void>; coCho: () => boolean }) {
  let hen: unknown = null;
  let dung = false;
  const lich = () => {
    if (dung) return;
    if (hen !== null) o.dongHo.clearTimeout(hen);
    hen = o.dongHo.setTimeout(chay, o.coCho() ? CHU_KY_CHO : CHU_KY_YEN);
  };
  function chay() {
    hen = null;
    void o.thu().finally(lich);
  }
  lich();
  return {
    /** Trang được quay lại, hay trình duyệt báo có mạng: thử ngay. */
    quayLaiTrang() {
      if (hen !== null) o.dongHo.clearTimeout(hen);
      chay();
    },
    /** Trạng thái vừa đổi (có thao tác chờ, hay mất mạng): hẹn lại theo chu kỳ mới. */
    henLai: lich,
    dung() {
      dung = true;
      if (hen !== null) o.dongHo.clearTimeout(hen);
    },
  };
}
