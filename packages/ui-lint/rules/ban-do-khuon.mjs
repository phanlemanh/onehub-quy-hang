// Cấm nhập khối cấm theo vùng của bản đồ khuôn (hồ sơ rang-giu-khuon, hàng 59): tệp thuộc một nhóm của
// design/patterns/ không được nhập tên nằm trong `cam_ngoai_khuon` của nhóm — so theo tên gốc, nên đổi tên lúc nhập
// không lách được. Bản đồ đọc lỗi thì mọi tệp nhận một lỗi nêu lỗi đọc.
import { nhomCuaTep, THU_MUC_BAN_DO } from "../lib/ban-do.mjs";
import { banDo, timGoc, tuongDoi } from "../lib/goc-kho.mjs";

export default {
  meta: {
    type: "problem",
    docs: { description: "Tệp thuộc một nhóm của bản đồ khuôn không nhập khối cấm của nhóm; dựng qua khuôn." },
    messages: {
      khoiCam:
        "«{{tep}}» thuộc nhóm {{nhom}}: không nhập {{khoi}} ngoài khuôn — dựng qua <{{khuon}}> ({{banDo}}).",
      banDoLoi: "Bản đồ khuôn đọc lỗi: {{loi}} — sửa {{thuMuc}} trước.",
    },
    schema: [],
  },
  create(context) {
    const goc = timGoc(context.filename);
    if (!goc) return {};
    const tep = tuongDoi(goc, context.filename);
    const bd = banDo(goc);
    if (bd.loi.length)
      return {
        Program(node) {
          const loi = bd.loi.length > 1 ? `${bd.loi[0]} (và ${bd.loi.length - 1} lỗi khác)` : bd.loi[0];
          context.report({ node, messageId: "banDoLoi", data: { loi, thuMuc: THU_MUC_BAN_DO } });
        },
      };
    // Nhóm màn trước nhóm phần tử: một dòng nhập chỉ báo một lần, theo nhóm đầu tiên cấm khối ấy.
    const nhom = nhomCuaTep(bd, tep).sort((a, b) => (a.donVi === "man" ? 0 : 1) - (b.donVi === "man" ? 0 : 1));
    if (!nhom.length) return {};
    return {
      ImportDeclaration(node) {
        for (const s of node.specifiers) {
          if (s.type !== "ImportSpecifier") continue;
          const khoi = s.imported.type === "Identifier" ? s.imported.name : s.imported.value;
          const g = nhom.find((x) => x.data.cam_ngoai_khuon.includes(khoi));
          if (g)
            context.report({
              node: s,
              messageId: "khoiCam",
              data: { tep, nhom: g.data.nhom, khoi, khuon: g.data.khuon.ten, banDo: `${THU_MUC_BAN_DO}/${g.tep}` },
            });
        }
      },
    };
  },
};
