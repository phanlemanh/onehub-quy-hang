// Service worker của Quỹ hàng (hàng 26, ADR-0025): nhận thông báo lead và mở đúng lead khi chạm. Không cache trang hay
// dữ liệu — bộ đồng bộ giữ dữ liệu trên máy (ADR-0006). Nội dung thông báo dựng ở lõi, đúng bốn khoá title, body, url, tag.

/**
 * Bấm thông báo: cửa sổ Quỹ hàng đang mở (cùng gốc) thì đưa lên trước và chuyển tới đúng đường; không có thì mở cửa sổ
 * mới. Hàm thuần trên `clients` được đưa vào — bài kiểm gọi thẳng nó (apps/web/src/app/(app)/today/mo-lead.test.ts).
 */
async function xuLyBamThongBao(url, clientsApi, origin) {
  const dich = new URL(url, origin);
  if (dich.origin !== origin) return "bo-qua";
  const ds = await clientsApi.matchAll({ type: "window", includeUncontrolled: true });
  const cua = ds.find((c) => new URL(c.url).origin === origin);
  if (cua) {
    await cua.focus();
    if (cua.url !== dich.href && typeof cua.navigate === "function") await cua.navigate(dich.href);
    return "dua-len";
  }
  await clientsApi.openWindow(dich.href);
  return "mo-moi";
}

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let p = null;
  try {
    p = event.data ? event.data.json() : null;
  } catch {
    p = null;
  }
  if (!p || typeof p.title !== "string") return;
  event.waitUntil(
    self.registration.showNotification(p.title, {
      body: typeof p.body === "string" ? p.body : "",
      tag: typeof p.tag === "string" ? p.tag : undefined,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: typeof p.url === "string" ? p.url : "/today" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/today";
  event.waitUntil(xuLyBamThongBao(url, self.clients, self.location.origin));
});
