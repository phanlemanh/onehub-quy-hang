// Đăng ký nhận thông báo lead trên thiết bị này (hàng 26, ADR-0025). Service worker ở gốc (`/sw.js`); khoá công khai do
// máy chủ tự sinh; đăng ký lưu qua `/api/v1/me/push-subscriptions`. Phân loại thiết bị là hàm thuần — dải bật đọc nó.

/** Trạng thái của dải bật trên thiết bị này. */
export type TrangThaiThietBi =
  | "dang-kiem"
  | "chua-bat"
  | "da-bat"
  /** Trình duyệt đã bật mà máy chủ chưa lưu được đăng ký (va-thong-bao-lead) — dải vẫn hiện và báo. */
  | "loi-luu"
  | "tu-choi"
  | "ios-chua-cai"
  | "khong-ho-tro"
  | "chua-cau-hinh";

export type DuKienThietBi = {
  coServiceWorker: boolean;
  coPush: boolean;
  /** iPhone, iPad (kể cả iPad báo mình là Mac). */
  ios: boolean;
  /** Đang chạy từ màn hình chính (đã cài). */
  daCai: boolean;
  quyen: NotificationPermission | "khong-co";
  daDangKy: boolean;
  /** Máy chủ dựng được khoá — null khi chưa hỏi. */
  cauHinh: boolean | null;
  /** Lần lưu đăng ký lên máy chủ thành công không — null khi chưa thử. */
  daLuu?: boolean | null;
};

/**
 * Thứ tự quyết: iPhone chưa cài → hướng dẫn cài; không hỗ trợ; từ chối; đã bật (lưu hỏng thì «loi-luu»); máy chủ chưa cấu
 * hình; chưa bật.
 */
export function phanLoai(d: DuKienThietBi): Exclude<TrangThaiThietBi, "dang-kiem"> {
  if (d.ios && !d.daCai) return "ios-chua-cai";
  if (!d.coServiceWorker || !d.coPush || d.quyen === "khong-co") return "khong-ho-tro";
  if (d.quyen === "denied") return "tu-choi";
  if (d.daDangKy && d.quyen === "granted") return d.daLuu === false ? "loi-luu" : "da-bat";
  if (d.cauHinh === false) return "chua-cau-hinh";
  return "chua-bat";
}

const DUONG = "/api/v1/me/push-subscriptions";

function laIos(): boolean {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function daCai(): boolean {
  return (navigator as Navigator & { standalone?: boolean }).standalone === true || window.matchMedia("(display-mode: standalone)").matches;
}

async function dangKySw(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return null;
  }
}

/** Khoá công khai của máy chủ; null khi máy chủ chưa dựng được khoá (503) hay lỗi mạng. */
async function khoaCongKhai(): Promise<string | null> {
  try {
    const r = await fetch("/api/v1/push/public-key", { cache: "no-store" });
    return r.ok ? ((await r.json()) as { publicKey: string }).publicKey : null;
  } catch {
    return null;
  }
}

/** Đọc trạng thái thiết bị: đăng ký service worker ở gốc, xem quyền và đăng ký hiện có, hỏi máy chủ có khoá chưa. */
export async function docTrangThai(): Promise<Exclude<TrangThaiThietBi, "dang-kiem">> {
  const coSw = "serviceWorker" in navigator;
  const coPush = typeof window !== "undefined" && "PushManager" in window;
  const reg = await dangKySw();
  const sub = reg && coPush ? await reg.pushManager.getSubscription().catch(() => null) : null;
  const quyen: DuKienThietBi["quyen"] = "Notification" in window ? Notification.permission : "khong-co";
  const coBan: DuKienThietBi = { coServiceWorker: coSw, coPush, ios: laIos(), daCai: daCai(), quyen, daDangKy: Boolean(sub), cauHinh: null };
  const truoc = phanLoai(coBan);
  if (truoc !== "chua-bat") {
    // Đã bật trên trình duyệt: gửi lại cho máy chủ (bật lại không thêm dòng) — đăng ký có thể mất ở máy chủ khi đổi sàn.
    // Lưu hỏng thì dải vẫn hiện và báo (va-thong-bao-lead).
    if (truoc === "da-bat" && sub) return phanLoai({ ...coBan, daLuu: await luu(sub) });
    return truoc;
  }
  return phanLoai({ ...coBan, cauHinh: (await khoaCongKhai()) !== null });
}

/** Lưu đăng ký lên máy chủ: true chỉ khi máy chủ trả 2xx; mất mạng, 4xx, 5xx đều là false, không ném. */
export async function luu(sub: Pick<PushSubscription, "toJSON">, goi: typeof fetch = fetch): Promise<boolean> {
  try {
    const r = await goi(DUONG, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sub.toJSON()) });
    return r.ok;
  } catch {
    return false;
  }
}

/** Bấm «Bật thông báo»: xin quyền, đăng ký với dịch vụ đẩy bằng khoá công khai, lưu ở máy chủ. Trả trạng thái mới. */
export async function batThongBao(): Promise<Exclude<TrangThaiThietBi, "dang-kiem"> | "loi"> {
  const khoa = await khoaCongKhai();
  if (!khoa) return "chua-cau-hinh";
  const quyen = await Notification.requestPermission();
  if (quyen !== "granted") return quyen === "denied" ? "tu-choi" : "chua-bat";
  const reg = await dangKySw();
  if (!reg) return "khong-ho-tro";
  try {
    await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: khoaBytes(khoa) }));
    return (await luu(sub)) ? "da-bat" : "loi";
  } catch {
    return "loi";
  }
}

function khoaBytes(b64url: string): Uint8Array<ArrayBuffer> {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(b64url.length / 4) * 4, "=");
  const s = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(s.length));
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

/**
 * Thân yêu cầu đăng xuất: mang endpoint của thiết bị đang bật để máy chủ gỡ đăng ký trước khi xoá phiên, và huỷ đăng ký
 * trên trình duyệt — người đăng nhập sau trên máy này tự bật lại nếu muốn. Không đọc được thì thân rỗng, vẫn đăng xuất.
 */
export async function thanDangXuat(): Promise<string> {
  try {
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration("/") : undefined;
    const sub = reg ? await reg.pushManager.getSubscription() : null;
    if (!sub) return "{}";
    const pushEndpoint = sub.endpoint;
    await sub.unsubscribe().catch(() => false);
    return JSON.stringify({ pushEndpoint });
  } catch {
    return "{}";
  }
}

/** Huỷ đăng ký đẩy trên trình duyệt này, không gọi máy chủ (máy bị báo mất, hàng 38: máy chủ đã gỡ đăng ký). */
export async function huyDangKyTrenMay(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  if (sub) await sub.unsubscribe().catch(() => false);
}
