// Bề rộng, chiều cao và lề của trang thuộc bố cục (hàng 91, ADR-0024): màn dưới app/(app)/ không tự đặt max-w-*, h-[…], w-[…],
// min-h-[…], và không đặt lề p-*/px-*/py-* trên phần tử gốc của trang. Màn dựng <BoCuc kieu="…">; số lấy từ token.
import { tepChiuLuat } from "../lib/vung-bo-cuc.mjs";
import { classStringVisitor } from "../lib/class-strings.mjs";

const CAM = /(?:^|[\s:])(max-w-[^\s]+|h-\[[^\]]+\]|w-\[[^\]]+\]|min-h-\[[^\]]+\])/g;
const LE = /(?:^|\s)(p[xy]?-[^\s]+)/;

function laGocTrang(node) {
  // Literal trong className của phần tử JSX đầu tiên mà một `return` của hàm export default trả về.
  let n = node.parent;
  while (n && n.type !== "JSXAttribute") n = n.parent;
  if (!n || n.name?.name !== "className") return false;
  const el = n.parent?.parent;
  let p = el?.parent;
  while (p && p.type === "ParenthesizedExpression") p = p.parent;
  if (!p || p.type !== "ReturnStatement") return false;
  let f = p.parent;
  while (f && !/Function/.test(f.type)) f = f.parent;
  return f?.parent?.type === "ExportDefaultDeclaration";
}

export default {
  meta: {
    type: "problem",
    docs: { description: "Màn không tự đặt bề rộng, chiều cao hay lề trang; dùng BoCuc và token bố cục." },
    messages: {
      kichThuoc: "«{{lop}}» đặt kích thước trang trong màn — bề rộng và chiều cao thuộc bố cục: dựng <BoCuc kieu=…>, số lấy từ token.",
      leGoc: "«{{lop}}» là lề ở gốc trang — lề thuộc bố cục (p-trang): dựng <BoCuc kieu=…>.",
    },
    schema: [],
  },
  create(context) {
    if (!tepChiuLuat(context, { trong: ["apps/web/src/app/(app)/"] })) return {};
    return classStringVisitor(context, (value, node) => {
      for (const m of value.matchAll(CAM)) context.report({ node, messageId: "kichThuoc", data: { lop: m[1] } });
      const le = LE.exec(value);
      if (le && laGocTrang(node)) context.report({ node, messageId: "leGoc", data: { lop: le[1] } });
    });
  },
};
