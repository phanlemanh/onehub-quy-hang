// Mục chia lead của Cài đặt sàn (hàng 48: E4, E5a, E7a, E8b; luat-chia-lead-cap-han-hong: E5) — ma trận viết trước, mỗi ma trận kèm chiều đỏ trên bản sao
// hỏng. Lý do lỗi lấy từ chính `kiemGiaTri` của lõi — bên viết lý do mà máy chủ trả (lối chung, hàng 82), không viết tay.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { giaiCauHinh, kiemGiaTri, SO_DIEM, type DiemSo } from "@quy-hang/core/config";

import {
  BAO_BO_NHOM_RIENG,
  cauHieuLuc,
  chuNguon,
  diemMan,
  ganLyDo,
  KHOA_MAN,
  ketQuaLuu,
  kiemBan,
  quetChuCam,
  thongBaoLuu,
  trangThaiMan,
  type BanCauHinh,
  type GiaTriMan,
  type KhoaMan,
} from "./luat";

const DIR = dirname(fileURLToPath(import.meta.url));
const MAC_DINH: GiaTriMan = {
  "lead_routing.strategy": "zone_round_robin",
  "lead_routing.accept_minutes": 15,
  "lead_routing.first_call_minutes": 30,
  "lead_routing.alert_to": "team_lead",
  "queue.call_back_after_days": 14,
  "queue.price_negotiation_after_days": 10,
};

test("luật chia lead: câu hiệu lực đọc từ sổ", () => {
  const cau = Object.fromEntries(KHOA_MAN.map((k) => [k, cauHieuLuc(diemMan(k))]));
  assert.deepEqual(cau, {
    "lead_routing.strategy": "Áp cho lead mới — lead đã chia giữ cách cũ",
    "lead_routing.accept_minutes": "Áp cho lead mới — lead đã chia giữ hạn cũ",
    "lead_routing.first_call_minutes": "Áp cho lead mới — lead đã chia giữ hạn cũ",
    "lead_routing.alert_to": "Áp ngay",
    "queue.call_back_after_days": "Áp ngay cho Hôm nay của mọi đầu chủ",
    "queue.price_negotiation_after_days": "Áp ngay cho Hôm nay của mọi đầu chủ",
  });
  // Chiều đỏ: bản sao sổ đổi hiệu lực của hạn nhận sang «tính lại» thì câu của khoá ấy đổi theo — câu không viết theo khoá.
  const saoSo: DiemSo[] = SO_DIEM.map((d) => (d.khoa === "lead_routing.accept_minutes" ? { ...d, hieuLuc: "tinh_lai" } : d));
  assert.equal(cauHieuLuc(diemMan("lead_routing.accept_minutes", saoSo)), "Áp ngay", "câu hiệu lực không đọc từ sổ");
});

test("luật chia lead: kiểm ô trước khi lưu", () => {
  const ca: [string, Partial<GiaTriMan>, KhoaMan, string][] = [
    ["hạn nhận 0", { "lead_routing.accept_minutes": 0 }, "lead_routing.accept_minutes", "Số nguyên từ 1 tới 1440 phút"],
    ["hạn nhận 1441", { "lead_routing.accept_minutes": 1441 }, "lead_routing.accept_minutes", "Số nguyên từ 1 tới 1440 phút"],
    ["hạn nhận 15.5", { "lead_routing.accept_minutes": 15.5 }, "lead_routing.accept_minutes", "Số nguyên từ 1 tới 1440 phút"],
    ["hạn nhận trống", { "lead_routing.accept_minutes": null }, "lead_routing.accept_minutes", "Số nguyên từ 1 tới 1440 phút"],
    ["hạn gọi 10 khi hạn nhận 15", { "lead_routing.first_call_minutes": 10 }, "lead_routing.first_call_minutes", "Không nhỏ hơn hạn nhận lead (15 phút)"],
    ["hạn nhận 40 khi hạn gọi 30", { "lead_routing.accept_minutes": 40 }, "lead_routing.first_call_minutes", "Không nhỏ hơn hạn nhận lead (40 phút)"],
    ["gọi lại 6", { "queue.call_back_after_days": 6 }, "queue.call_back_after_days", "Số nguyên từ 7 tới 30 ngày"],
    ["gọi lại 31", { "queue.call_back_after_days": 31 }, "queue.call_back_after_days", "Số nguyên từ 7 tới 30 ngày"],
    ["ép giá 15", { "queue.price_negotiation_after_days": 15 }, "queue.price_negotiation_after_days", "Số nguyên từ 7 tới 14 ngày"],
    ["cách chia lạ", { "lead_routing.strategy": "ngau_nhien" }, "lead_routing.strategy", "Chọn một trong danh sách"],
  ];
  for (const [ten, doi, dong, cau] of ca) {
    const kq = kiemBan(MAC_DINH, { ...MAC_DINH, ...doi });
    assert.deepEqual(kq.loi, { [dong]: cau }, ten);
    assert.equal(kq.guiDuoc, false, `${ten}: Lưu phải khoá`);
  }
  // Bộ đúng: đổi ba khoá trong khoảng — không lỗi, Lưu bật, thân chỉ mang khoá đã đổi.
  const dung = kiemBan(MAC_DINH, { ...MAC_DINH, "lead_routing.accept_minutes": 25, "lead_routing.first_call_minutes": 40, "lead_routing.strategy": "open_pool" });
  assert.deepEqual(dung.loi, {});
  assert.equal(dung.guiDuoc, true);
  assert.deepEqual(dung.than, { "lead_routing.strategy": "open_pool", "lead_routing.accept_minutes": 25, "lead_routing.first_call_minutes": 40 });
  // Chưa đổi gì: không gửi.
  assert.deepEqual(kiemBan(MAC_DINH, { ...MAC_DINH }), { doi: [], loi: {}, than: {}, guiDuoc: false });

  // Chiều đỏ: bộ kiểm bỏ ràng buộc chéo (cheo = false) thì hạn gọi 10 lọt — phép đo bắt được đúng lớp lỗi ấy.
  const khongCheo = kiemGiaTri("lead_routing.first_call_minutes", 10, MAC_DINH, SO_DIEM, false);
  assert.equal(khongCheo.ok, true, "đối chứng: bỏ kiểm cặp thì hạn gọi 10 hợp lệ");
  assert.notDeepEqual(kiemBan(MAC_DINH, { ...MAC_DINH, "lead_routing.first_call_minutes": 10 }).loi, {}, "hạn gọi nhỏ hơn hạn nhận vẫn lưu");
});

test("luật chia lead: lý do 400 về đúng dòng", () => {
  // Lý do do chính bên viết của máy chủ sinh (store.ts gọi kiemGiaTri với cấu hình sau khi ghép).
  const cap = kiemGiaTri("lead_routing.first_call_minutes", 10, MAC_DINH);
  const goiLai = kiemGiaTri("queue.call_back_after_days", 6, MAC_DINH);
  const nhanQuaDai = kiemGiaTri("lead_routing.accept_minutes", 40, MAC_DINH);
  assert.ok(!cap.ok && !goiLai.ok && !nhanQuaDai.ok);
  assert.equal(ganLyDo(cap.loi), "lead_routing.first_call_minutes");
  assert.equal(ganLyDo(goiLai.loi), "queue.call_back_after_days");
  assert.equal(ganLyDo(nhanQuaDai.loi), "lead_routing.first_call_minutes", "cặp trái luật nêu khoá hạn gọi trước");
  // Lý do không mở đầu bằng khoá nào của màn → báo chung.
  assert.equal(ganLyDo("thân phải là đối tượng khoá → giá trị"), null);
  assert.equal(ganLyDo("labels.field.unitNumber: cần chữ"), null);
  // Chiều đỏ: một khoá cùng tiền tố nhưng khác khoá không được gắn nhầm.
  assert.equal(ganLyDo("lead_routing.accept_minutes_x: lạ"), null, "gắn nhầm khoá cùng tiền tố");
});

test("luật chia lead: câu báo sau khi lưu theo hiệu lực", () => {
  assert.equal(thongBaoLuu(["lead_routing.accept_minutes", "lead_routing.strategy"]), "Đã lưu · áp cho lead mới từ bây giờ");
  assert.equal(thongBaoLuu(["queue.call_back_after_days"]), "Đã lưu");
  assert.equal(thongBaoLuu(["lead_routing.alert_to", "queue.price_negotiation_after_days"]), "Đã lưu");
  assert.ok(!thongBaoLuu(["queue.call_back_after_days"]).includes("lead mới"), "ngưỡng hàng đợi mà báo áp cho lead mới");
});

test("luật chia lead: ba trạng thái đặc biệt", () => {
  const ban = (errors: string[] = []): BanCauHinh => ({ items: [], errors });
  const rieng = trangThaiMan(ban(), { source: "company" });
  assert.deepEqual(rieng, { kind: "san-sang", khoaKhoa: ["queue.call_back_after_days", "queue.price_negotiation_after_days"], baoBoNhom: BAO_BO_NHOM_RIENG, baoDongHong: null });
  assert.equal(BAO_BO_NHOM_RIENG, "Sàn đang dùng bộ nhóm Hôm nay riêng — ngưỡng đặt trong bộ ấy");
  assert.deepEqual(trangThaiMan(ban(), { source: "default" }), { kind: "san-sang", khoaKhoa: [], baoBoNhom: null, baoDongHong: null });
  // Lỗi lấy từ bộ giải của lõi — chính bên viết `errors` của lối chung — trên cặp hạn trái luật có từ trước (60/30).
  const loiThat = giaiCauHinh([
    { key: "lead_routing.accept_minutes", value: 60 },
    { key: "lead_routing.first_call_minutes", value: 30 },
  ]).loi;
  assert.ok(loiThat.length > 0, "bộ giải phải báo cặp trái luật");
  const hong = trangThaiMan(ban(loiThat), { source: "default" });
  assert.ok(hong.kind === "san-sang" && hong.baoDongHong?.includes("Hạn gọi lần đầu") && hong.baoDongHong.includes("Hạn nhận lead") && hong.baoDongHong.includes("mặc định"), JSON.stringify(hong));
  assert.deepEqual(trangThaiMan(null, null), { kind: "loi-tai" });
  // Chiều đỏ: hàm trạng thái bỏ qua nguồn bộ nhóm thì hai ngưỡng không khoá.
  const boQua = trangThaiMan(ban(), null);
  assert.ok(boQua.kind === "san-sang" && boQua.khoaKhoa.length === 0, "đối chứng: không biết bộ nhóm thì không khoá");
  assert.notDeepEqual(rieng, boQua, "ngưỡng lưu mà không áp");
});

test("luật chia lead: chữ nguồn của dòng", () => {
  const ten = new Map([["u1", "[Tên] Quản trị"]]);
  const dong = (updatedBy: string | null) => ({ key: "lead_routing.accept_minutes", value: 20, source: "company" as const, updatedBy, updatedAt: "2026-11-05T10:00:00.000Z" });
  assert.equal(chuNguon(dong("u1"), ten), "Đã đổi · [Tên] Quản trị · 05/11");
  assert.equal(chuNguon(dong("u-roi"), ten), "Đã đổi · Đã rời sàn · 05/11");
  assert.equal(chuNguon({ ...dong(null), source: "default" }, ten), "Mặc định");
  assert.equal(chuNguon(undefined, ten), "Mặc định");
  // Không đọc được danh bạ: không kết luận «Đã rời sàn», chỉ ghi ngày.
  assert.equal(chuNguon(dong("u1"), null), "Đã đổi · 05/11");
});

test("luật chia lead: chữ màn theo từ vựng", () => {
  // luat.ts là chỗ khai danh sách chữ cấm (bộ quét) nên không tự quét chính nó.
  const tep = readdirSync(DIR).filter((f) => /\.tsx?$/.test(f) && !f.endsWith(".test.ts") && f !== "luat.ts");
  assert.ok(tep.includes("luat-chia-lead.tsx") && tep.includes("page.tsx"), `thiếu tệp màn: ${tep.join(", ")}`);
  const vet = tep.flatMap((f) => quetChuCam(f, readFileSync(join(DIR, f), "utf8")));
  assert.deepEqual(vet, []);
  const man = readFileSync(join(DIR, "luat-chia-lead.tsx"), "utf8");
  assert.match(man, /ROUTING_STRATEGY_NHAN/, "nhãn cách chia phải nhập từ lõi");
  assert.match(man, /ALERT_AUDIENCE_NHAN/, "nhãn người đọc lời báo phải nhập từ lõi");
  assert.doesNotMatch(man, /"Kho chung"|"Trưởng nhóm chia tay"|"Lần lượt toàn sàn"/, "nhãn cách chia viết trong màn");
  // Chiều đỏ: chuỗi mẫu chứa chữ cấm thì hàm quét trả đúng tệp và chữ.
  assert.deepEqual(quetChuCam("mau.tsx", 'const t = "Cảnh báo quá hạn";'), [{ tep: "mau.tsx", chu: "Cảnh báo" }]);
  assert.deepEqual(quetChuCam("mau.tsx", "<span>Luật chia</span>"), [{ tep: "mau.tsx", chu: "Luật chia" }]);
});

test("luật chia lead: kết quả lưu", () => {
  // Lỗi lấy từ bộ giải của lõi — chính bên viết `errors` của lối chung — trên dòng hạn gọi 10 có từ trước (luat-chia-lead-cap-han-hong).
  const loiThat = giaiCauHinh([{ key: "lead_routing.first_call_minutes", value: 10 }]).loi;
  assert.ok(loiThat.some((e) => e.startsWith("lead_routing.first_call_minutes")), `bộ giải phải báo cặp — ${loiThat.join(" | ")}`);
  const ban = (errors: string[]): BanCauHinh => ({ items: [], errors });
  const maTran: [string, KhoaMan[], string[], "ok" | "loi", string][] = [
    ["còn lỗi ở khoá vừa đổi", ["lead_routing.first_call_minutes"], loiThat, "loi", "Hạn gọi lần đầu"],
    ["không lỗi, có điểm hiệu lực mới", ["lead_routing.accept_minutes"], [], "ok", "Đã lưu · áp cho lead mới từ bây giờ"],
    ["không lỗi, chỉ ngưỡng hàng đợi", ["queue.call_back_after_days"], [], "ok", "Đã lưu"],
    ["lỗi cũ ở khoá không đổi", ["queue.call_back_after_days"], loiThat, "ok", "Đã lưu"],
  ];
  for (const [ten, doi, errors, kind, chu] of maTran) {
    const kq = ketQuaLuu(doi, ban(errors));
    assert.equal(kq.kind, kind, ten);
    assert.ok(kind === "ok" ? kq.cau === chu : kq.cau.includes(chu) && kq.cau.includes("chưa áp") && !kq.cau.startsWith("Đã lưu"), `${ten}: ${kq.cau}`);
  }
  // Chiều đỏ: bản sao bỏ qua `errors` thì ca còn lỗi ra «Đã lưu».
  const boQua = (doi: KhoaMan[]) => ({ kind: "ok" as const, cau: thongBaoLuu(doi) });
  assert.notDeepEqual(ketQuaLuu(["lead_routing.first_call_minutes"], ban(loiThat)), boQua(["lead_routing.first_call_minutes"]), "báo Đã lưu khi dòng vừa lưu chưa áp");
});
