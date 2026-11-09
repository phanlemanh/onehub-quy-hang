// Ô lạ còn lại trên Postgres dãy (hàng 69: AC-2, AC-5, AC-7, AC-9 — E2, E5b, E7, E9). Khách AI trong mọi ca là khách giả
// tiêm qua `deps.khachOLa` — không ca nào gọi mạng. Dữ liệu mẫu: `0900 000 0xx`.
import type { GoiOLa } from "@quy-hang/core/import";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApi } from "../../src/app";
import type { KhachOLa } from "../../src/imports/ai/claude";
import { MO_HINH_O_LA } from "../../src/imports/ai/claude";
import { tinhTien } from "../../src/imports/ai/gia";
import { LY_DO } from "../../src/imports/ai/routes";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";
import { TRUONG_MA, vetSoTrongSo } from "./vet-so-trong-so";

after(async () => {
  await appPool.query("delete from agreements where company_id in (select id from companies where name like $1)", [`%${RUN}%`]);
  await cleanup();
});

const { auth, sent } = makeAuth();
const SO_MAU = "0900 000 011";
const PHEP_TY = { name: "price", params: { unit: "ty" } };
const GOI: GoiOLa = {
  o: [
    { id: "o1", cot: 2, tieuDe: "Giá (tỷ)", truong: "listPrice", giaTri: "4.6–4.8 tỷ", lyDoMa: "«ô»: dải giá — cần người chọn một giá", phep: PHEP_TY as never },
    { id: "o2", cot: 2, tieuDe: "Giá (tỷ)", truong: "listPrice", giaTri: "thu về 4.2", lyDoMa: "«ô»: giá về tay chủ — cần người quy ra giá chào (luật 12)", phep: PHEP_TY as never },
    { id: "o3", cot: 3, tieuDe: "Tình trạng", truong: "standardStatus", giaTri: "đang đàm phán", lyDoMa: "«ô» không phải trạng thái đã biết" },
  ],
};
const DAU_RA = {
  de_xuat: [
    { id: "o1", gia_tri: "4,8 tỷ", ly_do: "Chọn cận trên của dải làm giá chào." },
    { id: "o2", gia_tri: "4,2 tỷ KBP", ly_do: "Chủ thu về 4,2 tỷ: giá chưa gồm phí là giá về tay." },
    { id: "o3", gia_tri: "Đang giao dịch", ly_do: "Đang đàm phán là đã có khách." },
  ],
};

function khachGia(tl: (n: number) => Promise<unknown> | unknown = () => DAU_RA, usage = { input_tokens: 1000, output_tokens: 200 }) {
  const dem = { n: 0 };
  const khach: KhachOLa = async () => {
    dem.n++;
    return { json: await tl(dem.n), model: MO_HINH_O_LA, usage };
  };
  return { khach, dem };
}
const appVoi = (khachOLa: KhachOLa | null) => createApi({ appPool, identityPool, auth, khachOLa, khachAi: null });
const APP = appVoi(khachGia().khach);
const send = (app: ReturnType<typeof createApi>, method: string, path: string, body: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

async function login(email: string): Promise<string> {
  const before = sent.length;
  await send(APP, "POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send(APP, "POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

async function sanMoi(ten: string) {
  const k = `ola-${ten.toLowerCase()}`;
  const s = await openCompany(`[Sàn ${RUN} ${ten}]`, mail(`${k}-qt`));
  const email = mail(`${k}-dc`);
  const userId = await createLoneUser(email);
  await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, ["listing_agent"]]);
  return {
    companyId: s.companyId as string,
    dauChuId: userId,
    quanTri: `${await login(mail(`${k}-qt`))}; qh_san=${s.companyId}`,
    dauChu: `${await login(email)}; qh_san=${s.companyId}`,
  };
}
type San = Awaited<ReturnType<typeof sanMoi>>;
const bat = (s: San, b = true) => send(APP, "PUT", "/api/v1/imports/ai/agreement", { bat: b }, s.quanTri);
const dongAi = async (companyId: string) =>
  (await appPool.query<{ result: string; t: string; model: string; input_tokens: number; output_tokens: number; cost_usd: string; blocked_kinds: string[] | null }>(
    "select *, row_to_json(a)::text t from ai_usage a where company_id = $1 order by created_at", [companyId],
  )).rows;
const oLa = async (app: ReturnType<typeof createApi>, goi: unknown, cookie: string) => {
  const r = await send(app, "POST", "/api/v1/imports/ai/cells", goi, cookie);
  return { status: r.status, body: (await r.json().catch(() => null)) as Record<string, unknown> | null };
};

test("ô lạ: cửa máy chủ trước khi gửi", async () => {
  const s = await sanMoi("E2");
  assert.equal((await bat(s)).status, 204);
  const { khach, dem } = khachGia();
  const app = appVoi(khach);
  assert.equal((await oLa(app, { ...GOI, la: 1 }, s.dauChu)).status, 400, "khoá lạ ở gốc");
  assert.equal((await oLa(app, { o: [{ ...GOI.o[0], truong: "ownerPhone" }] }, s.dauChu)).status, 400, "ô của trường lớp nguồn");
  assert.equal((await oLa(app, { o: Array.from({ length: 301 }, (_, i) => ({ ...GOI.o[2], id: `o${i + 1}` })) }, s.dauChu)).status, 400, "301 ô");
  assert.equal((await oLa(app, { o: [{ ...GOI.o[0], phep: { name: "regex" } }] }, s.dauChu)).status, 400, "phép ngoài thực đơn");
  assert.equal((await oLa(app, { o: [{ ...GOI.o[0], phep: { name: "price" } }] }, s.dauChu)).status, 400, "giá thiếu đơn vị");
  assert.equal((await oLa(app, { o: [{ ...GOI.o[0], phep: { name: "price", params: { unit: "ty", ghiChu: "0900 000 011" } } }] }, s.dauChu)).status, 400, "khoá lạ trong tham số phép");
  assert.equal(dem.n, 0, "gói sai khuôn mà khách AI bị gọi");

  const coSo = { o: [{ ...GOI.o[2], giaTri: "chủ đang đàm phán 0900 000 011" }] };
  const r = await oLa(app, coSo, s.dauChu);
  assert.equal(r.status, 200);
  assert.equal(r.body?.cheDo, "tat-dinh");
  assert.match(String(r.body?.lyDo), /dữ liệu cá nhân/);
  assert.equal(dem.n, 0, "khách AI bị gọi với gói có dữ liệu cá nhân");
  const d = await dongAi(s.companyId);
  assert.deepEqual(d.map((x) => x.result), ["blocked_pii"]);
  assert.ok(d[0]!.blocked_kinds?.includes("phone"), "blocked_kinds có phone");
  const vet = vetSoTrongSo(d[0]!.t, SO_MAU, s.dauChuId);
  assert.equal(vet, null, `sổ chứa chuỗi số ở trường ${vet?.truong}`);

  assert.equal((await oLa(app, GOI, s.dauChu)).body?.cheDo, "ai");
  assert.equal(dem.n, 1, "gói sạch gọi đúng một lần");
});

// Phép kiểm cũ: tìm chuỗi trên toàn văn dòng. Giữ ở đây để chứng minh mẫu âm thật sự kích được lỗi đỏ ngẫu nhiên.
const phepCuBaoDo = (t: string) => t.includes("0900") || t.includes("011");
const ghiDongSo = async (s: San, cot: Record<string, unknown>) => {
  const tron: Record<string, unknown> = { company_id: s.companyId, user_id: s.dauChuId, model: MO_HINH_O_LA, result: "blocked_pii", ...cot };
  const ten = Object.keys(tron);
  const r = await appPool.query<{ t: string }>(
    `insert into ai_usage as a (${ten.join(", ")}) values (${ten.map((_, i) => `$${i + 1}`).join(", ")}) returning row_to_json(a)::text t`,
    Object.values(tron),
  );
  return r.rows[0]!.t;
};

test("phép kiểm sổ: đỏ khi số lọt vào, không bắt nhầm mã máy", async () => {
  const s = await sanMoi("E2b");
  const sach = await ghiDongSo(s, {
    id: "00000000-0000-4000-8000-000000000011",
    created_at: "2026-11-09T09:00:00.011+00:00",
    cost_usd: 0.011,
    duration_ms: 1011,
    input_tokens: 3011,
  });
  assert.ok(phepCuBaoDo(sach), "mẫu âm phải làm phép kiểm cũ báo đỏ — thiếu thì ca này vô nghĩa");
  assert.equal(vetSoTrongSo(sach, SO_MAU, s.dauChuId), null, "bắt nhầm mã máy hay giờ ghi");

  const LOT = (ten: string, cot: Record<string, unknown>, truong: string, dang: string) => [ten, cot, truong, dang] as const;
  const CA = [
    LOT("có khoảng trắng", { model: "0900 000 011" }, "model", "day-du"),
    LOT("liền", { model: "0900000011" }, "model", "day-du"),
    LOT("dấu chấm", { model: "0900.000.011" }, "model", "day-du"),
    LOT("gạch nối", { model: "0900-000-011" }, "model", "day-du"),
    LOT("đầu +84", { model: "+84 900 000 011" }, "model", "day-du"),
    LOT("đầu 84", { model: "84900000011" }, "model", "day-du"),
    LOT("chỉ đuôi", { model: "đuôi 011" }, "model", "mot-phan"),
    LOT("đuôi viết rời", { model: "đuôi 0 1 1" }, "model", "mot-phan"),
    LOT("chỉ đầu số", { model: "đầu 0900" }, "model", "mot-phan"),
    LOT("mã người là số", { user_id: "0900000011" }, "user_id", "day-du"),
    LOT("mã người mang đuôi", { user_id: "u-011" }, "user_id", "mot-phan"),
    LOT("trường số đủ số", { duration_ms: 900000011 }, "duration_ms", "day-du"),
  ];
  assert.equal(CA.length, 12, "bảng ca viết trước có đúng 12 phần tử");
  for (const [ten, cot, truong, dang] of CA) {
    assert.deepEqual(vetSoTrongSo(await ghiDongSo(s, cot), SO_MAU, s.dauChuId), { truong, dang }, `không bắt được: ${ten}`);
  }
});

test("phép kiểm sổ: mọi cột của dòng thật", async () => {
  const s = await sanMoi("E2c");
  const dong = JSON.parse(await ghiDongSo(s, { blocked_kinds: ["phone"] })) as Record<string, unknown>;
  const cotMa = Object.keys(TRUONG_MA);
  // Cột thường trước, cột máy sau, để mỗi kiểu phá dừng ở đúng loại cột của nó. `cot_moi` đại diện cho cột thêm vào sổ sau này.
  const COT = [...Object.keys(dong).filter((k) => !cotMa.includes(k)), "cot_moi", ...cotMa];
  assert.ok(COT.includes("model") && COT.includes("blocked_kinds"), "ma trận phải rút từ dòng sổ thật");
  const CA: [string, unknown, "day-du" | "mot-phan"][] = [];
  for (const cot of COT) {
    CA.push([cot, "0900 000 011", "day-du"], [cot, "đuôi 011", "mot-phan"], [cot, ["0900 000 011"], "day-du"]);
    if (typeof dong[cot] === "number") CA.push([cot, 900000011, "day-du"]);
  }
  const soCotSo = COT.filter((c) => typeof dong[c] === "number").length;
  assert.equal(CA.length, COT.length * 3 + soCotSo, "số phần tử ma trận");
  let dem = 0;
  for (const [cot, giaTri, dang] of CA) {
    const vet = vetSoTrongSo(JSON.stringify({ ...dong, [cot]: giaTri }), SO_MAU, s.dauChuId);
    assert.deepEqual(vet, { truong: cot, dang }, `không bắt được ở ma trận cột: ${cot} — ${JSON.stringify(giaTri)}`);
    dem++;
  }
  assert.equal(dem, CA.length, "số assert bằng số phần tử ma trận");
});

test("phép kiểm sổ không đỏ trên mã máy ngẫu nhiên", async () => {
  const s = await sanMoi("E2d");
  // Postgres tự sinh `id` và in giờ ghi theo dạng thật: cắt số 0 cuối phần lẻ, có dòng không phần lẻ.
  const { rows } = await appPool.query<{ t: string }>(
    `insert into ai_usage as a (company_id, user_id, model, result, blocked_kinds, cost_usd, duration_ms, created_at)
     select $1::uuid, $2::text, $3::text, 'blocked_pii', '{phone}', round(random()::numeric, 6), (random() * 5000)::int,
            timestamptz '2026-01-01' + (random() * 26000000)::int * interval '1 second' +
            case i % 4 when 0 then interval '0' when 1 then (random() * 999)::int * interval '1 millisecond'
                 when 2 then (random() * 99)::int * interval '10 millisecond' else random() * interval '1 second' end
     from generate_series(1, 20000) i
     returning row_to_json(a)::text t`,
    [s.companyId, s.dauChuId, MO_HINH_O_LA],
  );
  assert.equal(rows.length, 20000, "đủ hai vạn dòng");
  assert.ok(rows.some((r) => /T\d{2}:\d{2}:\d{2}\+/.test(r.t)), "có dòng giờ ghi không phần lẻ");
  assert.ok(rows.some((r) => /\.\d{1,5}\+/.test(r.t)), "có dòng giờ ghi ít hơn sáu chữ số lẻ");
  assert.ok(rows.filter((r) => phepCuBaoDo(r.t)).length > 0, "phép kiểm cũ phải đỏ ít nhất một dòng — thiếu thì ca này vô nghĩa");
  const nham = rows.filter((r) => vetSoTrongSo(r.t, SO_MAU, s.dauChuId) !== null);
  assert.equal(nham.length, 0, `bắt nhầm dòng ngẫu nhiên: ${nham[0]?.t}`);
});

test("ô lạ không ghi gì", async () => {
  const s = await sanMoi("E5");
  await bat(s);
  const dem = async () => {
    const r = await appPool.query<{ a: string; b: string; c: string; d: string; e: string }>(
      `select (select count(*) from imports where company_id = $1) a, (select count(*) from listings where company_id = $1) b,
              (select count(*) from listing_events where company_id = $1) c, (select count(*) from catalog_units) d,
              (select count(*) from ai_usage where company_id = $1) e`,
      [s.companyId],
    );
    return r.rows[0]!;
  };
  const truoc = await dem();
  const r = await oLa(appVoi(khachGia().khach), GOI, s.dauChu);
  assert.equal(r.body?.cheDo, "ai");
  assert.equal((r.body?.deXuat as unknown[]).length, 3, "ba đề xuất qua kiểm");
  const sau = await dem();
  for (const k of ["a", "b", "c", "d"] as const) assert.equal(sau[k], truoc[k], `bảng ${k} đổi sau lời gọi ô lạ`);
  assert.equal(Number(sau.e) - Number(truoc.e), 1, "ai_usage tăng đúng 1");
});

test("ô lạ: không AI vẫn nhập", async () => {
  const quaGio = () => {
    const e = new Error("quá giờ");
    e.name = "TimeoutError";
    throw e;
  };
  // Ma trận viết tay bảy ca: [tên, chuẩn bị sàn, khách, lý do, kết quả sổ mong đợi (null = không dòng)].
  const CA: [string, (s: San) => unknown, KhachOLa | null, string, string | null][] = [
    ["chưa có thoả thuận", async () => {}, khachGia().khach, LY_DO.chuaBat, null],
    ["thoả thuận tạm ngừng", async (s) => { await bat(s); await bat(s, false); }, khachGia().khach, LY_DO.tamNgung, null],
    ["thiếu khoá", (s) => bat(s), null, LY_DO.thieuKhoa, null],
    [
      "đã dùng bằng trần tháng",
      async (s) => {
        await bat(s);
        await appPool.query("insert into ai_usage (company_id, user_id, model, cost_usd, result) values ($1, 'u-mau', 'claude-opus-5-5', 10, 'ok')", [s.companyId]);
      },
      khachGia().khach,
      LY_DO.hetTran,
      "ok",
    ],
    ["nhà cung cấp lỗi", (s) => bat(s), khachGia(() => { throw new Error("mạng hỏng"); }).khach, LY_DO.loi, "provider_error"],
    ["quá 240 giây", (s) => bat(s), khachGia(quaGio).khach, LY_DO.quaGio, "timeout"],
    ["đầu ra sai khuôn", (s) => bat(s), khachGia(() => ({ goi_y: [] })).khach, LY_DO.saiKhuon, "invalid_output"],
  ];
  let so = 1;
  for (const [ten, chuan, khach, lyDo, ketQua] of CA) {
    const s = await sanMoi(`E7-${so++}`);
    await chuan(s);
    const r = await oLa(appVoi(khach), GOI, s.dauChu);
    assert.deepEqual([r.status, r.body], [200, { cheDo: "tat-dinh", lyDo }], ten);
    // Ca trần: dòng 'ok' là dòng mẫu đã chèn — lời gọi không thêm dòng nào.
    assert.deepEqual((await dongAi(s.companyId)).map((x) => x.result), ketQua ? [ketQua] : [], `${ten}: sổ ai_usage`);
  }
});

test("ô lạ vào sổ chi phí", async () => {
  const s = await sanMoi("E9");
  await bat(s);
  const { khach, dem } = khachGia();
  const app = appVoi(khach);
  assert.equal((await oLa(app, GOI, s.dauChu)).body?.cheDo, "ai");
  const d = (await dongAi(s.companyId))[0]!;
  assert.deepEqual([d.model, d.input_tokens, d.output_tokens, d.result], [MO_HINH_O_LA, 1000, 200, "ok"]);
  assert.equal(Number(d.cost_usd), tinhTien({ input_tokens: 1000, output_tokens: 200 }, MO_HINH_O_LA), "tiền theo bảng giá của mô hình");
  // Trần chung với đề xuất cột: một dòng đề xuất cột đưa tổng bằng trần → ô lạ không gọi.
  await appPool.query("insert into ai_usage (company_id, user_id, model, cost_usd, result) values ($1, 'u-mau', 'claude-opus-5-5', $2, 'ok')", [s.companyId, 10 - Number(d.cost_usd)]);
  assert.deepEqual((await oLa(app, GOI, s.dauChu)).body, { cheDo: "tat-dinh", lyDo: LY_DO.hetTran });
  assert.equal(dem.n, 1, "hết trần mà vẫn gọi");
});
