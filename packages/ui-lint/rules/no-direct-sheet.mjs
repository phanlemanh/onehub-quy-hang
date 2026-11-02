// Ngăn nổi của hệ bố cục (hàng 91, ADR-0024 §3): Sheet và Drawer chỉ gọi trong NganNoi — máy tính ngăn bên, điện thoại
// ngăn từ đáy, một chỗ giữ luật.
import { tepChiuLuat } from "../lib/vung-bo-cuc.mjs";

// Ngăn thông báo của vỏ là chuyển thể NotificationsDrawer của khối app-shell-8 — vỏ, không phải màn; giữ cấu trúc khối.
const CHO = ["apps/web/src/components/bo-cuc/ngan-noi.tsx", "apps/web/src/components/shell/notifications.tsx"];
const TEN = new Set(["Sheet", "Drawer"]);

export default {
  meta: {
    type: "problem",
    docs: { description: "Không nhập Sheet hay Drawer ngoài NganNoi." },
    messages: { ngan: "Nhập {{ten}} ngoài ngăn nổi — dùng <NganNoi> (components/bo-cuc/ngan-noi.tsx)." },
    schema: [],
  },
  create(context) {
    if (!tepChiuLuat(context, { trong: ["apps/web/src/app/", "apps/web/src/components/"], cho: CHO })) return {};
    return {
      ImportDeclaration(node) {
        const nguon = node.source.value;
        const ten = /\/(sheet|drawer)$/.exec(nguon)?.[1] ?? node.specifiers.map((s) => s.imported?.name).find((n) => TEN.has(n));
        if (ten) context.report({ node, messageId: "ngan", data: { ten: ten === "sheet" ? "Sheet" : ten === "drawer" ? "Drawer" : ten } });
      },
    };
  },
};
