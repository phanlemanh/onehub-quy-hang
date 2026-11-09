// Hôm nay của trưởng nhóm (hồ sơ hom-nay-truong-nhom, E8, E9). Mỗi ma trận viết trước, đếm bằng assert số; mỗi ca có
// chiều đỏ trên cùng fixture.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { giaiCauHinh } from "@quy-hang/core/config";
import { hangCuTheoNguoi, tongCanGoiLai } from "@quy-hang/core/today";

import { layHangDoiTruongNhom, type DongLeadTruongNhom } from "../today/nguon";
import {
  baO,
  baoLoiDoi,
  dongTheoNguoi,
  hangCuTrenMay,
  kyHieuDauChu,
  moTaMatMang,
  trangThaiTruongNhom,
  type CanTrenMay,
  type TrangThaiTruongNhom,
  type VaoTrangThai,
} from "./trang-thai";

const dong = (leadId: string, kind: DongLeadTruongNhom["kind"]): DongLeadTruongNhom => ({
  leadId,
  kind,
  buildingName: "[Toà A]",
  unitNumber: "A-01.01",
  agentUserId: kind === "unrouted" ? null : "u-a",
  dueAt: "2026-11-04T01:00:00Z",
});
const HANG_DOI = [dong("l1", "unrouted"), dong("l2", "accept_overdue"), dong("l3", "first_call_overdue")];
const VAO: VaoTrangThai = { dangTai: false, loiTai: false, matMang: false, hangDoi: HANG_DOI, loiGiao: {} };
const LOI_MAY_CHU = "Không giao được lead căn trùng.";

describe("hôm nay trưởng nhóm", () => {
  it("hôm nay trưởng nhóm: sáu trạng thái", async () => {
    // Ma trận viết trước: sáu trạng thái × (chữ, cờ nút giao).
    const MA_TRAN: [TrangThaiTruongNhom, VaoTrangThai, string, boolean][] = [
      ["dang-tai", { ...VAO, dangTai: true, hangDoi: null }, "Đang tải", false],
      ["mac-dinh", VAO, "Lead quá hạn và ngoại lệ", true],
      ["trong", { ...VAO, hangDoi: [] }, "Không lead nào quá hạn", true],
      ["loi", { ...VAO, loiTai: true, hangDoi: null }, "Không tải được lead quá hạn", true],
      ["mat-mang", { ...VAO, matMang: true }, "Đang mất mạng", false],
      ["giao-loi", { ...VAO, loiGiao: { l2: LOI_MAY_CHU } }, LOI_MAY_CHU, true],
    ];
    let so = 0;
    for (const [mong, vao, chu, choGiao] of MA_TRAN) {
      const ra = trangThaiTruongNhom(vao);
      assert.equal(ra.trangThai, mong, `trạng thái ${mong}`);
      assert.equal(ra.chu, chu, `chữ của ${mong}`);
      so++;
      assert.equal(ra.choGiao, choGiao, `nút giao của ${mong}`);
      so++;
    }
    assert.equal(so, 6 * 2);

    // Ba ô số trên cùng hàng đợi: một quá hạn nhận + một quá hạn gọi, một chưa chia được.
    assert.deepEqual(baO(HANG_DOI), { leadQuaHan: 2, ngoaiLe: 1 });

    // Chiều đỏ: nguồn trả lỗi mạng (lời gọi ném) → mat-mang, không mac-dinh; số giữ lần đọc cuối.
    const matMang = (async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    const kq = await layHangDoiTruongNhom(matMang);
    assert.deepEqual(kq, { ok: false, mang: true });
    const ra = trangThaiTruongNhom({ ...VAO, matMang: !kq.ok && kq.mang });
    assert.equal(ra.trangThai, "mat-mang");
    assert.notEqual(ra.trangThai, "mac-dinh");
    assert.equal(ra.choGiao, false);
    // Máy chủ trả 500 (không phải mất mạng) → loi.
    const hong = (async () => new Response(null, { status: 500 })) as unknown as typeof fetch;
    const kq500 = await layHangDoiTruongNhom(hong);
    assert.deepEqual(kq500, { ok: false, mang: false });
    assert.equal(trangThaiTruongNhom({ ...VAO, loiTai: true, hangDoi: null }).trangThai, "loi");
  });

  it("ô Hàng cũ bằng tổng cần gọi lại", () => {
    const HOM_NAY = "2026-11-04";
    const N13 = "2026-10-22T03:00:00Z"; // 13 ngày trước
    const N14 = "2026-10-21T03:00:00Z"; // 14 ngày trước
    const N20 = "2026-10-15T03:00:00Z"; // 20 ngày trước
    // Bảng tám căn mở (chín dòng, hai đã đóng) của E4 — ba người giữ và một căn chưa có người giữ.
    const BANG: CanTrenMay[] = [
      { listAgentKey: "u-a", standardStatus: "Active", lastConfirmedAt: N13 },
      { listAgentKey: "u-a", standardStatus: "Active", lastConfirmedAt: N14 },
      { listAgentKey: "u-a", standardStatus: "Pending", lastConfirmedAt: N20 },
      { listAgentKey: "u-a", standardStatus: "Closed", lastConfirmedAt: N20 },
      { listAgentKey: "u-b", standardStatus: "Active", lastConfirmedAt: null },
      { listAgentKey: "u-b", standardStatus: "Withdrawn", lastConfirmedAt: N14 },
      { listAgentKey: "u-b", standardStatus: "Active", lastConfirmedAt: N13 },
      { listAgentKey: "u-c", standardStatus: "Pending", lastConfirmedAt: N14 },
      { listAgentKey: null, standardStatus: "Active", lastConfirmedAt: N20 },
    ];
    const cau20 = giaiCauHinh([{ key: "queue.call_back_after_days", value: 20 }]);
    assert.deepEqual(cau20.loi, []);

    const macDinh = hangCuTrenMay(BANG, HOM_NAY);
    // Ô = tổng canGoiLai mọi dòng, kể cả «Chưa có người giữ»: 2 + 1 + 1 + 1.
    assert.equal(macDinh.hangCu, macDinh.dong.reduce((t, d) => t + d.canGoiLai, 0));
    assert.equal(macDinh.hangCu, 5);
    assert.equal(macDinh.hangCu, tongCanGoiLai(hangCuTheoNguoi(BANG.map((c) => ({ ...c, listAgentKey: c.listAgentKey ?? null, lastConfirmedAt: c.lastConfirmedAt ?? null })), HOM_NAY)));
    assert.equal(macDinh.dong.at(-1)?.userId, null);
    assert.equal(macDinh.dong.at(-1)?.canGoiLai, 1);

    // Cấu hình 20 ngày: số ô đổi đúng như tổng mới.
    const ngay20 = hangCuTrenMay(BANG, HOM_NAY, cau20.cauHinh);
    assert.equal(ngay20.hangCu, 3);
    assert.equal(ngay20.hangCu, ngay20.dong.reduce((t, d) => t + d.canGoiLai, 0));

    // Chiều đỏ: căn «Chỉ tôi» không tính (dòng «Chỉ tính căn toàn sàn»).
    const coRieng = hangCuTrenMay([...BANG, { listAgentKey: "u-a", standardStatus: "Active", lastConfirmedAt: null, visibility: "Private" }], HOM_NAY);
    assert.equal(coRieng.hangCu, 5);

    // Tên người giữ khớp danh sách đầu chủ theo mã; người ngoài danh sách hiện chữ thay, không hiện mã.
    const ten = dongTheoNguoi(macDinh.dong, [{ userId: "u-a", displayName: "[Đầu chủ A]", onLeave: true, openLeads: 2 }]).map((d) => [d.ten, d.nghi]);
    assert.deepEqual(ten, [
      ["[Đầu chủ A]", true],
      ["Chưa rõ tên", false],
      ["Chưa rõ tên", false],
      ["Chưa có người giữ", false],
    ]);
  });

});


describe("Đội chịu lỗi từng phần (hom-nay-chiu-loi-tung-phan)", () => {
  it("một báo lỗi của Đội", () => {
    assert.equal(baoLoiDoi({ hangDoi: false, dauChu: false }), null);
    assert.equal(baoLoiDoi({ hangDoi: true, dauChu: false }), "Không tải được lead quá hạn");
    assert.equal(baoLoiDoi({ hangDoi: false, dauChu: true }), "Không tải được tên đầu chủ");
    assert.equal(baoLoiDoi({ hangDoi: true, dauChu: true }), "Không tải được lead quá hạn");
  });
  it("kyHieuDauChu", () => {
    assert.equal(kyHieuDauChu("Người Thử"), "TH");
    assert.equal(kyHieuDauChu("Chưa rõ tên"), "—");
    assert.equal(kyHieuDauChu(""), "—");
  });
  it("câu mất mạng", () => {
    const co = moTaMatMang([]);
    const chua = moTaMatMang(null);
    assert.equal(co, "Số là lần đọc cuối.");
    assert.equal(chua, "Máy sẽ tự đọc lại khi có mạng.");
    for (const cau of [co, chua]) assert.ok(!cau.includes("giao lại"), cau);
  });
});
