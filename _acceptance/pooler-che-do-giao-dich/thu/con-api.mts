// pooler-che-do-giao-dich E3, E4: tiến trình con nạp getApi THẬT của apps/web (một bộ bể như một phiên bản hàm) với
// DATABASE_URL trỏ pooler, rồi gọi API bằng getApi().request(...).
//   node --import tsx con-api.mts dang-nhap <email>   xin mã → đọc mã của bộ gửi máy dev → nhập mã → /me, Hôm nay, Bảng
//                                                     hàng, tên thành viên; in «KQ <json>»
//   node --import tsx con-api.mts ban <số>            đọc COOKIE_A, COOKIE_B ở env; in «san-sang», chờ một dòng stdin, rồi
//                                                     bắn <số> yêu cầu Bảng hàng đồng thời, xen kẽ A/B; in «KQ <json>»
import { createInterface } from "node:readline";

import { getApi } from "../../../apps/web/src/lib/api";

const GOC = process.env.BETTER_AUTH_URL ?? "http://localhost:3499";
const [lenh, doiSo] = process.argv.slice(2);

// Bộ gửi mã của máy dev in «[ma-dang-nhap] <email> <mã>» — giữ lại dòng ấy để đọc mã, vẫn in như thường.
const ma = new Map<string, string>();
const inGoc = console.log.bind(console);
console.log = (...a: unknown[]) => {
  const m = /^\[ma-dang-nhap\] (\S+) (\d+)/.exec(a.map(String).join(" "));
  if (m) ma.set(m[1]!, m[2]!);
  inGoc(...a);
};

const goi = (duong: string, init: RequestInit = {}) =>
  getApi().request(`${GOC}${duong}`, { ...init, headers: { origin: GOC, "content-type": "application/json", ...(init.headers ?? {}) } });

async function dangNhap(email: string) {
  const buoc: Record<string, number> = {};
  const xin = await goi("/api/v1/auth/email-otp/send-verification-otp", { method: "POST", body: JSON.stringify({ email, type: "sign-in" }) });
  buoc.xinMa = xin.status;
  const otp = ma.get(email);
  if (!otp) throw new Error(`dang-nhap: không thấy mã của ${email} (xin mã trả ${xin.status}: ${await xin.text()})`);
  const vao = await goi("/api/v1/auth/sign-in/email-otp", { method: "POST", body: JSON.stringify({ email, otp }) });
  buoc.nhapMa = vao.status;
  const cookie = vao.headers
    .getSetCookie()
    .map((c) => c.split(";")[0]!)
    .filter((c) => c.startsWith("qh.session_token="))
    .join("; ");
  if (!cookie) throw new Error(`dang-nhap: nhập mã không trả cookie phiên (${vao.status}: ${await vao.text()})`);
  const h = { headers: { cookie } };
  const me = await goi("/api/v1/me", h);
  buoc.me = me.status;
  const meBody = (await me.json()) as { user?: { email?: string }; activeCompany?: { name?: string } | null };
  const homNay = await goi("/api/v1/leads/assigned", h);
  buoc.homNay = homNay.status;
  const bang = await goi("/api/v1/listings", h);
  buoc.bangHang = bang.status;
  const can = bang.status === 200 ? ((await bang.json()) as unknown[]).length : -1;
  const ten = await goi("/api/v1/company/member-names", h);
  buoc.tenThanhVien = ten.status;
  return { buoc, email: meBody.user?.email, san: meBody.activeCompany?.name, can };
}

async function ban(so: number) {
  const ck = [process.env.COOKIE_A ?? "", process.env.COOKIE_B ?? ""];
  getApi(); // dựng bể trước tín hiệu — như phiên bản hàm đã ấm
  inGoc("san-sang");
  await new Promise<void>((r) => createInterface({ input: process.stdin }).once("line", () => r()));
  return Promise.all(
    Array.from({ length: so }, async (_, i) => {
      const san = i % 2 === 0 ? "A" : "B";
      const r = await goi("/api/v1/listings", { headers: { cookie: ck[i % 2]! } });
      const ids = r.status === 200 ? ((await r.json()) as { id: string }[]).map((x) => x.id).sort() : [];
      return { i, san, status: r.status, ids };
    }),
  );
}

/** Tạo một căn qua API bằng phiên COOKIE_A — căn mẫu cho sàn thứ hai của E4. */
async function tao(toa: string) {
  const r = await goi("/api/v1/listings", {
    method: "POST",
    headers: { cookie: process.env.COOKIE_A ?? "" },
    body: JSON.stringify({ buildingName: toa, unitNumber: "01" }),
  });
  const b = (await r.json()) as { id?: string; error?: string };
  return { status: r.status, id: b.id ?? null, loi: b.error ?? null };
}

try {
  const kq =
    lenh === "dang-nhap" ? await dangNhap(doiSo ?? "") : lenh === "ban" ? await ban(Number(doiSo ?? 4)) : lenh === "tao" ? await tao(doiSo ?? "") : null;
  if (kq === null) {
    console.error("dùng: con-api.mts dang-nhap <email> | ban <số>");
    process.exit(2);
  }
  inGoc(`KQ ${JSON.stringify(kq)}`);
  process.exit(0);
} catch (e) {
  console.error(`con-api: ${(e as Error).message}`);
  process.exit(1);
}
