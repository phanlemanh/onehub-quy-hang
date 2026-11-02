// Chờ tải theo hình của bố cục (hàng 91, ADR-0024 §4): Skeleton chỉ dựng trong ChoTai của hệ bố cục — màn không ghép
// khung xương tay.
import { tepChiuLuat } from "../lib/vung-bo-cuc.mjs";

const CHO = ["apps/web/src/components/bo-cuc/", "apps/web/src/components/trang-thai.tsx"];

export default {
  meta: {
    type: "problem",
    docs: { description: "Không nhập Skeleton ngoài ChoTai; chờ tải theo hình bố cục." },
    messages: { skeleton: "Nhập Skeleton ngoài khuôn chờ tải — dùng <BoCuc trangThai=\"cho-tai\"> hay <ChoTai kieu=…> (components/bo-cuc)." },
    schema: [],
  },
  create(context) {
    if (!tepChiuLuat(context, { trong: ["apps/web/src/app/", "apps/web/src/components/"], cho: CHO })) return {};
    return {
      ImportDeclaration(node) {
        if (/\/skeleton$/.test(node.source.value) || node.specifiers.some((s) => s.imported?.name === "Skeleton"))
          context.report({ node, messageId: "skeleton" });
      },
    };
  },
};
