// Hôm nay đầu chủ trên điện thoại (hàng 39: E1, E3, E4, E5) — phần thuần, mỗi bộ so kèm chiều đỏ trên bản sao hỏng.
import assert from "node:assert/strict";
import { test } from "node:test";

import { BO_NHOM_MAC_DINH } from "@quy-hang/core/today";
import type { KetQuaMoSo } from "../mo-so";
import { viecCuaDong, type ViecDong } from "../viec-dong";
import { chayGoi, docNganMo, ghiNganMo, goiCoKhoa, ketQuaCua, laDienThoai, nutDienThoai, taoKhoaGoi, xoaNganMo, type MaViecDT } from "./goi";
import { moSoChu } from "./mo-so-chu";

const nhom = (code: string) => {
  const n = BO_NHOM_MAC_DINH.find((x) => x.code === code);
  if (!n) throw new Error(`thiếu nhóm ${code}`);
  return n;
};

// E1 — rẽ khổ: ma trận viết trước 5 khổ.
test("E1 rẽ khổ: dưới 768 là điện thoại, từ 768 là lưới (5 khổ)", () => {
  const ma: [number, boolean][] = [
    [375, true],
    [390, true],
    [767, true],
    [768, false],
    [1440, false],
  ];
  assert.deepEqual(
    ma.filter(([r, mong]) => laDienThoai(r) !== mong).map(([r]) => r),
    [],
  );
  assert.equal(ma.length, 5);
});

// E3 — bảng nút: 6 loại dòng × có số / không số = 12 ô viết trước.
const LOAI: [string, ViecDong][] = [
  ["lead mới", { kind: "lead", nhom: nhom("new_lead"), stage: "sent" }],
  ["lead đã nhận chưa gọi", { kind: "lead", nhom: nhom("new_lead"), stage: "accepted" }],
  ["căn nên gọi điều chỉnh giá", { kind: "can", nhom: nhom("price_adjustment") }],
  ["căn cần gọi lại", { kind: "can", nhom: nhom("call_back") }],
  ["căn thiếu thông tin", { kind: "can", nhom: nhom("missing_info") }],
  ["căn mới đổi", { kind: "can", nhom: nhom("recent_change") }],
];
const MONG_CHINH: Record<string, [MaViecDT | null, MaViecDT | null]> = {
  // [có số, không số]
  "lead mới": ["nhan", "nhan"],
  "lead đã nhận chưa gọi": ["goi", "da-goi"],
  "căn nên gọi điều chỉnh giá": ["goi", "con-giu-gia"],
  "căn cần gọi lại": ["goi", "con-giu-gia"],
  "căn thiếu thông tin": ["doi-gia-trang-thai", "doi-gia-trang-thai"],
  "căn mới đổi": ["con-giu-gia", "con-giu-gia"],
};

type HamNut = typeof nutDienThoai;
function lechNut(ham: HamNut): string[] {
  const out: string[] = [];
  for (const [ten, v] of LOAI) {
    for (const [i, coSo] of [true, false].entries()) {
      const { chinh, phu } = ham(v, coSo);
      const mong = MONG_CHINH[ten]?.[i] ?? null;
      if (chinh !== mong) out.push(`${ten}/${coSo ? "có số" : "không số"}: nút ${chinh} ≠ ${mong}`);
      // Bộ việc của thẻ = bộ việc máy tính («Mở số» thay bằng «Gọi» khi có số).
      const mayTinh = viecCuaDong(v).filter((m) => m !== "mo-so");
      const mong2 = new Set<string>([...mayTinh, ...(coSo ? ["goi"] : [])]);
      const co = new Set<string>([chinh, ...phu].filter((x): x is MaViecDT => x !== null));
      if ([...mong2].sort().join() !== [...co].sort().join()) out.push(`${ten}/${coSo ? "có số" : "không số"}: bộ việc lệch`);
    }
  }
  return out;
}

test("E3 nút mép phải và bộ việc ⋯: 6 loại dòng × có/không số = 12 ô", () => {
  assert.equal(LOAI.length * 2, 12);
  assert.deepEqual(lechNut(nutDienThoai), []);
});

test("E3 đối chứng đỏ: bản sao luôn đặt «Gọi» làm nút chính → nêu loại dòng", () => {
  const gia: HamNut = (v, coSo) => {
    const r = nutDienThoai(v, coSo);
    if (!coSo || r.chinh === "goi") return r;
    const phu: MaViecDT[] = [...(r.chinh ? [r.chinh] : []), ...r.phu.filter((m) => m !== "goi")];
    return { chinh: "goi", phu };
  };
  const lech = lechNut(gia);
  assert.ok(lech.some((x) => x.startsWith("lead mới/có số: nút goi")), lech.join("\n"));
  assert.ok(lech.some((x) => x.startsWith("căn mới đổi/có số: nút goi")), lech.join("\n"));
});

// E4 — gọi một chạm.
type Ghi = string[];
const traVe = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

test("E4 gọi một chạm: mở số → tel: đúng số → mở ngăn; lần sau cùng dòng dùng lại số", async () => {
  const g: Ghi = [];
  let goiMay = 0;
  const so: string[] = [];
  const d = {
    moSo: async (): Promise<KetQuaMoSo> => (goiMay++, g.push("mo-so"), { ok: true, so: "0900 000 091" }),
    daMo: (s: string) => void so.push(s),
    moTel: (h: string) => void g.push(`tel:${h}`),
    moNgan: () => void g.push("ngan"),
  };
  const r1 = await chayGoi({ ...d, soCu: null });
  assert.deepEqual(r1, { ok: true, so: "0900 000 091" });
  assert.deepEqual(g, ["mo-so", "tel:tel:0900000091", "ngan"]);
  const r2 = await chayGoi({ ...d, soCu: so[0] ?? null });
  assert.equal(r2.ok, true);
  assert.equal(goiMay, 1, "chạm lại cùng dòng không mở số lần hai");
});

test("E4 mở số lỗi → không mở tel:, không mở ngăn, trả lời lỗi", async () => {
  const g: Ghi = [];
  const r = await chayGoi({
    soCu: null,
    moSo: async () => ({ ok: false, loi: "Lead này không còn của bạn." }),
    daMo: () => g.push("da-mo"),
    moTel: () => g.push("tel"),
    moNgan: () => g.push("ngan"),
  });
  assert.deepEqual(r, { ok: false, loi: "Lead này không còn của bạn." });
  assert.deepEqual(g, []);
});

/** Bộ so thứ tự: lần đầu mở số → tel: đúng số → mở ngăn; số lỗi thì không tel:, không ngăn. Chạy trên bản thật và bản sao. */
async function lechThuTu(ham: typeof chayGoi): Promise<string[]> {
  const out: string[] = [];
  const g: Ghi = [];
  const ghi = { daMo: () => {}, moTel: (h: string) => void g.push(h), moNgan: () => void g.push("ngan") };
  await ham({ ...ghi, soCu: null, moSo: async () => (g.push("mo-so"), { ok: true, so: "0900000091" }) });
  if (g.join(" → ") !== "mo-so → tel:0900000091 → ngan") out.push(`thứ tự ${g.join(" → ")}`);
  g.length = 0;
  await ham({ ...ghi, soCu: null, moSo: async () => (g.push("mo-so"), { ok: false, loi: "x" }) });
  if (g.join(" → ") !== "mo-so") out.push(`mở số lỗi: ${g.join(" → ")}`);
  return out;
}
test("E4 bộ so thứ tự trên bản thật: không lệch", async () => {
  assert.deepEqual(await lechThuTu(chayGoi), []);
});
test("E4 đối chứng đỏ: bản sao mở tel: trước khi mở số → bộ so nêu thứ tự", async () => {
  const saiThuTu: typeof chayGoi = async (d) => {
    d.moTel("tel:0900000091");
    const kq = await d.moSo();
    d.moNgan();
    return kq.ok ? { ok: true, so: kq.so } : kq;
  };
  assert.deepEqual(await lechThuTu(saiThuTu), ["thứ tự tel:0900000091 → mo-so → ngan", "mở số lỗi: tel:0900000091 → mo-so → ngan"]);
});

test("E4 chạm «Gọi» hai lần khi số chưa về: máy chủ chỉ mở số một lần", async () => {
  let goiMay = 0;
  let tra: (v: KetQuaMoSo) => void = () => {};
  const khoa = taoKhoaGoi();
  const d = { soCu: null, moSo: () => (goiMay++, new Promise<KetQuaMoSo>((r) => (tra = r))), daMo: () => {}, moTel: () => {}, moNgan: () => {} };
  const lan1 = goiCoKhoa(khoa, "lead:l1", d);
  const lan2 = await goiCoKhoa(khoa, "lead:l1", d);
  assert.equal(lan2, null, "lần chạm thứ hai bị bỏ qua");
  tra({ ok: true, so: "0900000091" });
  assert.equal((await lan1)?.ok, true);
  assert.equal(goiMay, 1);
  assert.equal(khoa.dang("lead:l1"), false, "xong thì nhả khoá");
});
test("E4 đối chứng đỏ: không khoá thì hai chạm mở số hai lần", async () => {
  let goiMay = 0;
  const d = { soCu: null, moSo: async (): Promise<KetQuaMoSo> => (goiMay++, { ok: true, so: "0900000091" }), daMo: () => {}, moTel: () => {}, moNgan: () => {} };
  await Promise.all([chayGoi(d), chayGoi(d)]);
  assert.equal(goiMay, 2);
});

test("E4 mở số chủ của căn: POST đúng lối mở số chủ, đọc ownerPhone; 404 → lời chưa có số", async () => {
  const goi: string[] = [];
  const f = (async (u: string | URL | Request, init?: RequestInit) => {
    goi.push(`${init?.method} ${String(u)}`);
    return traVe({ ownerPhone: "0900000092" });
  }) as typeof fetch;
  assert.deepEqual(await moSoChu("can-1", f), { ok: true, so: "0900000092" });
  assert.deepEqual(goi, ["POST /api/v1/listings/can-1/owner/phone-reveal"]);
  const r = await moSoChu("can-2", (async () => traVe({ code: "not-found" }, 404)) as typeof fetch);
  assert.equal(r.ok, false);
});

// E5 — bộ kết quả của ngăn và nhớ ngăn qua lần tải lại.
test("E5 bộ kết quả: lead có trả lại · căn → đúng thứ tự, luôn kết bằng «Không nghe máy»", () => {
  assert.deepEqual(ketQuaCua({ kind: "lead", nhom: nhom("new_lead"), stage: "accepted" }), ["da-goi", "tra-lai", "khong-nghe"]);
  const leadKhongTra = { ...nhom("new_lead"), actions: ["accept", "first_call"] as const };
  assert.deepEqual(ketQuaCua({ kind: "lead", nhom: leadKhongTra as never, stage: "accepted" }), ["da-goi", "khong-nghe"]);
  assert.deepEqual(ketQuaCua({ kind: "can", nhom: nhom("price_adjustment") }), ["con-giu-gia", "doi-gia-trang-thai", "khong-nghe"]);
});

test("E5 nhớ ngăn: ghi khi chạm Gọi, đọc lại sau khi dựng lại, xoá khi chọn kết quả; kho hỏng không làm vỡ", () => {
  const m = new Map<string, string>();
  const kho = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
  ghiNganMo(kho, "lead:l1");
  assert.equal(docNganMo(kho), "lead:l1", "giả tải lại: đọc lại đúng dòng");
  xoaNganMo(kho);
  assert.equal(docNganMo(kho), null);
  const hong = { getItem: () => { throw new Error("x"); }, setItem: () => { throw new Error("x"); }, removeItem: () => { throw new Error("x"); } };
  ghiNganMo(hong, "a");
  assert.equal(docNganMo(hong), null);
  assert.equal(docNganMo(null), null);
});
