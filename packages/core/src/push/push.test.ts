// Nội dung thông báo lead (hồ sơ thong-bao-lead, E4 và vế tài liệu của E9). Mỗi bảng viết trước, đếm bằng assert số.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PUSH_CLAIM_HOLD_MS, PUSH_PAYLOAD_KEYS, PUSH_SEND, laDichVuDay, noiDungLead, noiDungLoiBao, noiDungQuaySo, type PushPayload } from "./index";

/** Lead mẫu mang đủ thứ không được ra thông báo: số chủ, tên chủ, giá, mã căn. */
const LEAD_MAU = {
  leadId: "00000000-0000-4000-8000-0000000000d1",
  buildingName: "[Toà A]",
  need: "sale" as const,
  ownerPhone: "0900000011",
  ownerName: "[Tên chủ mẫu]",
  listPrice: 3_250_000_000,
  unitNumber: "A-12.05",
};

/** Máy dò những thứ không được ra thông báo — mỗi máy một tên để ca đỏ nêu khoá. */
const MAY_DO: Record<string, (s: string) => boolean> = {
  "chín chữ số": (s) => /\d[\d .]{7,}\d/.test(s.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, "")),
  "tên chủ": (s) => s.includes(LEAD_MAU.ownerName),
  giá: (s) => s.includes(String(LEAD_MAU.listPrice)) || /\d+(,\d+)?\s*(tỷ|triệu)/i.test(s),
  "mã căn": (s) => s.includes(LEAD_MAU.unitNumber),
};

const lot = (p: PushPayload) => Object.entries(MAY_DO).filter(([, bat]) => bat(JSON.stringify(p))).map(([ten]) => ten);

describe("nội dung quay số", () => {
  it("bốn khoá theo thứ tự, «Gọi chủ nhà» · «<Toà> · <nhu cầu>», mở trang quay số; không lọt thứ gì của lớp nguồn", () => {
    const BANG = [
      { need: "sale", body: "[Toà A] · Bán" },
      { need: "lease", body: "[Toà A] · Cho thuê" },
      { need: "sale_or_lease", body: "[Toà A] · Cả hai" },
    ] as const;
    let dem = 0;
    for (const dong of BANG) {
      // Ép kiểu đưa cả lead mẫu (số, tên chủ, giá, mã căn) — lõi chỉ được nhặt toà, nhu cầu, mã.
      const p = noiDungQuaySo({ ...LEAD_MAU, need: dong.need } as Parameters<typeof noiDungQuaySo>[0]);
      assert.deepEqual(Object.keys(p), [...PUSH_PAYLOAD_KEYS], `khoá của nhu cầu ${dong.need}`);
      assert.deepEqual(lot(p), [], `nhu cầu ${dong.need} lọt: ${lot(p).join(", ")}`);
      assert.equal(p.title, "Gọi chủ nhà");
      assert.equal(p.body, dong.body, `thân của nhu cầu ${dong.need}`);
      assert.equal(p.url, `/units/call/dial?lead=${LEAD_MAU.leadId}`);
      assert.equal(p.tag, `quay-so:${LEAD_MAU.leadId}`);
      dem++;
    }
    assert.equal(dem, 3);
    // Mã lạ được mã hoá trong url (lõi không tin bên gọi đã kiểm khuôn).
    assert.equal(noiDungQuaySo({ leadId: "a b&c", buildingName: "[Toà A]", need: "sale" }).url, "/units/call/dial?lead=a%20b%26c");
  });
});

describe("nội dung thông báo lead", () => {
  it("chỉ bốn khoá, thân «<Toà> · <nhu cầu>» cho ba nhu cầu, không lọt thứ gì của lớp nguồn", () => {
    const BANG = [
      { need: "sale", body: "[Toà A] · Bán" },
      { need: "lease", body: "[Toà A] · Cho thuê" },
      { need: "sale_or_lease", body: "[Toà A] · Cả hai" },
    ] as const;
    let dem = 0;
    for (const dong of BANG) {
      // Bên gọi đưa cả lead mẫu — lõi chỉ được nhặt toà, nhu cầu, mã.
      const p = noiDungLead({ ...LEAD_MAU, need: dong.need });
      assert.deepEqual(lot(p), [], `nhu cầu ${dong.need} lọt: ${lot(p).join(", ")}`);
      assert.deepEqual(Object.keys(p), [...PUSH_PAYLOAD_KEYS], `khoá của nhu cầu ${dong.need}`);
      assert.equal(p.title, "Lead mới");
      assert.equal(p.body, dong.body, `thân của nhu cầu ${dong.need}`);
      assert.equal(p.url, `/today?lead=${LEAD_MAU.leadId}`);
      assert.equal(p.tag, `lead:${LEAD_MAU.leadId}`);
      dem++;
    }
    assert.equal(dem, BANG.length);
    assert.equal(dem, 3);
  });

  it("đối chứng dương: cùng máy dò bắt chuỗi cài sẵn của từng loại", () => {
    const cai: Record<string, string> = {
      "chín chữ số": "0900 000 011",
      "tên chủ": LEAD_MAU.ownerName,
      giá: "3,25 tỷ",
      "mã căn": LEAD_MAU.unitNumber,
    };
    let dem = 0;
    for (const [ten, chuoi] of Object.entries(cai)) {
      const p: PushPayload = { title: "Lead mới", body: `[Toà A] · ${chuoi}`, url: "/today", tag: "x" };
      assert.ok(lot(p).includes(ten), `máy dò «${ten}» không bắt chuỗi cài sẵn`);
      dem++;
    }
    assert.equal(dem, Object.keys(MAY_DO).length);
  });

  it("lời báo trưởng nhóm: bốn khoá, loại lời báo và toà, mở Hôm nay", () => {
    const BANG = [
      { kind: "unrouted", title: "Lead chưa chia được" },
      { kind: "accept_overdue", title: "Lead quá hạn nhận" },
      { kind: "first_call_overdue", title: "Lead quá hạn gọi lần đầu" },
    ] as const;
    let dem = 0;
    for (const dong of BANG) {
      const p = noiDungLoiBao({ ...LEAD_MAU, kind: dong.kind });
      assert.deepEqual(Object.keys(p), [...PUSH_PAYLOAD_KEYS]);
      assert.deepEqual(p, { title: dong.title, body: "[Toà A]", url: "/today", tag: `alert:${dong.kind}:${LEAD_MAU.leadId}` });
      assert.deepEqual(lot(p), [], `lời báo ${dong.kind} lọt: ${lot(p).join(", ")}`);
      dem++;
    }
    assert.equal(dem, 3);
  });
});

describe("thông báo lead: tài liệu khớp", () => {
  // Gốc kho suy từ vị trí tệp này: packages/core/src/push → bốn cấp lên.
  const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");

  it("Tham chiếu §12 nhắc «thông báo lead»; ADR-0025 nhắc Web Push, lớp nguồn, không ai cầm khoá", () => {
    const thamChieu = readFileSync(join(GOC, "docs/product/tham-chieu.md"), "utf8");
    const dau = thamChieu.search(/^## 12\./m);
    assert.ok(dau >= 0, "Tham chiếu không có mục §12");
    const sau = thamChieu.slice(dau + 1).search(/^## /m);
    const s12 = sau < 0 ? thamChieu.slice(dau) : thamChieu.slice(dau, dau + 1 + sau);
    assert.match(s12, /thông báo lead/i, "Tham chiếu §12 thiếu «thông báo lead»");
    const adr = readdirSync(join(GOC, "docs/adr")).filter((f) => f.startsWith("0025-"));
    assert.equal(adr.length, 1, "cần đúng một tệp docs/adr/0025-*.md");
    const chu = readFileSync(join(GOC, "docs/adr", adr[0]!), "utf8");
    let dem = 0;
    for (const cum of ["Web Push", "lớp nguồn", "không ai cầm khoá"]) {
      assert.ok(chu.toLowerCase().includes(cum.toLowerCase()), `ADR-0025 thiếu «${cum}»`);
      dem++;
    }
    assert.equal(dem, 3);
  });
});

// AC-1 hồ sơ va-thong-bao-lead: chỉ địa chỉ của dịch vụ đẩy đã biết. Bảng viết trước, mỗi ô một assert.
const CHAP_NHAN = [
  "https://fcm.googleapis.com/fcm/send/x",
  "https://fcm.googleapis.com/wp/x",
  "https://updates.push.services.mozilla.com/wpush/v2/x",
  "https://web.push.apple.com/x",
  "https://wns2-par02p.notify.windows.com/w/?token=x",
  "https://FCM.GOOGLEAPIS.COM/x",
  "https://fcm.googleapis.com:443/x",
];
const TU_CHOI = [
  "http://fcm.googleapis.com/x",
  "https://push.example.test/x",
  "https://fcm.googleapis.com.evil.test/x",
  "https://evilfcm.googleapis.com/x",
  "https://notify.windows.com/x",
  "https://evil-notify.windows.com/x",
  "https://fcm.googleapis.com@evil.test/x",
  "https://u:p@fcm.googleapis.com/x",
  "https://fcm.googleapis.com:8443/x",
  "https://169.254.169.254/x",
  "https://localhost/x",
  "https://[::1]/x",
  "",
  "không phải địa chỉ",
];

describe("AC-1 địa chỉ của dịch vụ đẩy đã biết", () => {
  for (const d of CHAP_NHAN) it(`AC-1 chấp nhận ${d}`, () => assert.equal(laDichVuDay(d), true, `ô ${d}`));
  for (const d of TU_CHOI) it(`AC-1 từ chối «${d}»`, () => assert.equal(laDichVuDay(d), false, `ô «${d}»`));
  it("AC-1 đối chứng đỏ: hàm giả chỉ xét tiền tố https bị gọi tên ở ô lách", () => {
    const gia = (d: string) => d.startsWith("https://");
    const lot = TU_CHOI.filter((d) => gia(d) !== laDichVuDay(d));
    assert.ok(lot.includes("https://push.example.test/x") && lot.includes("https://fcm.googleapis.com.evil.test/x"), `ô lọt: ${lot.join(", ")}`);
  });
  it("AC-5 mọi ngân sách gửi cộng một lần gửi nhỏ hơn giữ chỗ một phút (migration 018)", () => {
    assert.equal(PUSH_CLAIM_HOLD_MS, 60_000);
    assert.ok(PUSH_SEND.deliverBudgetMs + PUSH_SEND.timeoutMs < PUSH_CLAIM_HOLD_MS, "lối giao");
    assert.ok(PUSH_SEND.tickBudgetMs + PUSH_SEND.timeoutMs < PUSH_CLAIM_HOLD_MS, "nhịp chia");
  });
});
