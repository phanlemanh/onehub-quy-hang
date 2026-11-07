// Màn Gửi theo mẫu bài Zalo của sàn (hàng mau-bang-hang-va-bai, E7c): ma trận (có mẫu · không mẫu · đọc mẫu lỗi) × (nhóm
// môi giới · khách riêng) so cả tin soạn sẵn; đổi mẫu rồi dựng lại thì theo bản mới; ô tin sửa được.
import assert from "node:assert/strict";
import { test } from "node:test";
import { banRaNgoai, canMoi, type NguoiNhan } from "@quy-hang/core/redaction";
import { CHO_LINK, soanTin } from "@quy-hang/core/sharing";
import { mauZaloTu, tinDangDung, tinMacDinh } from "./gui";

const HOM_NAY = "2026-11-07";
const MAU = { dau: "Hàng mới tuần này", cuoi: "Cần thêm căn cứ nhắn em" };
const ban = (nguoiNhan: NguoiNhan) => [banRaNgoai(canMoi(), { cua: "gui_link", nguoiNhan, today: HOM_NAY })];

test("Gửi: ma trận mẫu Zalo × người nhận", () => {
  const DOC: [string, unknown][] = [
    ["có mẫu", { templates: { zalo: MAU } }],
    ["không mẫu", { templates: {} }],
    ["đọc mẫu lỗi", null],
  ];
  let dem = 0;
  for (const [ca, than] of DOC) {
    const mauZalo = mauZaloTu(than);
    for (const nguoiNhan of ["nhom_moi_gioi", "khach_rieng"] as const) {
      const tenKhach = nguoiNhan === "khach_rieng" ? "[Tên]" : null;
      const tin = tinMacDinh({ ban: ban(nguoiNhan), nguoiNhan, tenKhach, mauZalo });
      const cu = soanTin({ ban: ban(nguoiNhan), nguoiNhan, tenKhach });
      if (ca === "có mẫu") {
        const dong = cu.split("\n");
        const mong = [dong[0], MAU.dau, ...dong.slice(1), MAU.cuoi].join("\n");
        assert.equal(tin, mong, `màn Gửi không theo mẫu Zalo — ${ca} · ${nguoiNhan}`);
      } else assert.equal(tin, cu, `tin phải như cũ — ${ca} · ${nguoiNhan}`);
      dem++;
    }
  }
  assert.equal(dem, 6);
  assert.equal(tinMacDinh({ ban: ban("khach_rieng"), nguoiNhan: null, tenKhach: null, mauZalo: MAU }), "", "chưa chọn người nhận thì tin rỗng");
});

test("Gửi: đổi mẫu rồi dựng lại thì theo bản mới; ô tin sửa được", () => {
  const truoc = tinMacDinh({ ban: ban("nhom_moi_gioi"), nguoiNhan: "nhom_moi_gioi", tenKhach: null, mauZalo: mauZaloTu({ templates: { zalo: MAU } }) });
  const sau = tinMacDinh({ ban: ban("nhom_moi_gioi"), nguoiNhan: "nhom_moi_gioi", tenKhach: null, mauZalo: mauZaloTu({ templates: { zalo: { dau: "Lời mới", cuoi: "" } } }) });
  assert.ok(truoc.includes(MAU.dau) && sau.includes("Lời mới") && !sau.includes(MAU.dau), "màn Gửi giữ mẫu cũ");
  // Ô tin: người gửi gõ thêm chữ → tin dùng là bản đã sửa, vẫn có chỗ link.
  const sua = { khoa: "k1", tin: `${truoc}\nThêm một dòng` };
  const dung = tinDangDung(sua, "k1", truoc);
  assert.ok(dung.endsWith("Thêm một dòng") && dung.includes(CHO_LINK), "ô tin không nhận chữ đã sửa");
  assert.equal(tinDangDung(sua, "k2", truoc), truoc, "đối chứng: đổi bộ thì về tin soạn sẵn");
});
