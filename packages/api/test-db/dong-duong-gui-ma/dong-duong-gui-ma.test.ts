// Mọi đường gửi mã chung một giới hạn, đường thừa bị đóng (hàng 55, hồ sơ dong-duong-gui-ma-thua — E1, E2, E3).
// Gọi thẳng bộ xử lý của better-auth trên Postgres thật.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { OTP_REQUEST_LIMIT, OTP_SEND_PATHS, OTP_TYPE_NOT_ALLOWED, PASSWORD_WRAPPED_PATHS } from "../../src/auth/constants";
import { DUONG_DA_TAT } from "../../src/auth/duong-gui-ma.ca";
import { BANG_LOI, DUONG_LOI_DA_TAT } from "../../src/auth/duong-mat-khau.ca";
import { OTP_RATE_LIMITED } from "../../src/errors";
import { authPost, cleanup, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

after(cleanup);

const demXinMa = async (email: string) =>
  Number((await identityPool.query<{ n: string }>("select count(*) as n from identity.otp_requests where email = $1", [email])).rows[0]!.n);
const maLoi = async (res: Response) => ((await res.json()) as { code?: string }).code;

test("mọi đường gửi mã còn phục vụ: lần thứ sáu trả 429, không gửi", async () => {
  let so = 0;
  for (const [i, path] of OTP_SEND_PATHS.entries()) {
    const { auth, sent } = makeAuth();
    const email = mail(`gioi-han-${i}`);
    await openCompany(`[Sàn ${RUN} G${i}]`, email);
    for (let k = 1; k <= OTP_REQUEST_LIMIT; k++) assert.equal((await authPost(auth, path, { email, type: "sign-in" })).status, 200, `${path} lần ${k}`);
    assert.equal(sent.length, OTP_REQUEST_LIMIT, `${path}: lần thứ năm phải vẫn nhận mã`);
    const sau = await authPost(auth, path, { email, type: "sign-in" });
    assert.deepEqual([sau.status, await maLoi(sau)], [429, OTP_RATE_LIMITED], `${path}: lần 6 phải 429`);
    assert.equal(sent.length, OTP_REQUEST_LIMIT, `${path}: lần 6 vẫn gửi mã`);
    so++;
  }
  assert.equal(so, OTP_SEND_PATHS.length, "số đường đã thử phải bằng OTP_SEND_PATHS");
});

test("kiểu mã khác đăng nhập: 400, không gửi, không đếm", async () => {
  const { auth, sent } = makeAuth();
  const email = mail("kieu-khac");
  await openCompany(`[Sàn ${RUN} K]`, email);
  const KIEU = ["email-verification", "forget-password"];
  let so = 0;
  for (const type of KIEU) {
    for (let k = 1; k <= 3; k++) {
      const res = await authPost(auth, "/email-otp/send-verification-otp", { email, type });
      assert.deepEqual([res.status, await maLoi(res)], [400, OTP_TYPE_NOT_ALLOWED], `kiểu ${type} lần ${k}`);
      so++;
    }
  }
  assert.equal(so, KIEU.length * 3, "số lần gọi phải bằng ma trận viết trước");
  assert.equal(sent.length, 0, "kiểu mã khác đăng nhập vẫn gửi mã");
  assert.equal(await demXinMa(email), 0, "kiểu mã khác đăng nhập vẫn đốt lượt xin mã");
  // Đối chứng dương cùng email: mã đăng nhập vẫn đủ 5 lần rồi 429.
  for (let k = 1; k <= OTP_REQUEST_LIMIT; k++) {
    assert.equal((await authPost(auth, "/email-otp/send-verification-otp", { email, type: "sign-in" })).status, 200, `đăng nhập lần ${k}`);
  }
  assert.equal(sent.length, OTP_REQUEST_LIMIT, "mã đăng nhập phải nhận đủ 5");
  assert.equal((await authPost(auth, "/email-otp/send-verification-otp", { email, type: "sign-in" })).status, 429, "đăng nhập lần 6");
});

test("đường quên mật khẩu và đổi email: 404, không gửi, không đếm", async () => {
  const { auth, sent } = makeAuth();
  const email = mail("duong-tat");
  await openCompany(`[Sàn ${RUN} T]`, email);
  assert.equal(DUONG_DA_TAT.length, 5, "bảng xếp loại phải có năm đường «đã tắt»");
  const truoc = await demXinMa(email);
  let so = 0;
  for (const path of DUONG_DA_TAT) {
    for (let k = 1; k <= 10; k++) {
      const res = await authPost(auth, path, { email, otp: "000000", password: "x".repeat(12), newEmail: mail("moi") });
      assert.equal(res.status, 404, `${path} lần ${k} trả ${res.status}`);
      so++;
    }
  }
  assert.equal(so, DUONG_DA_TAT.length * 10, "số lần gọi phải bằng năm đường × 10");
  assert.equal(sent.length, 0, "đường đã tắt vẫn gửi mã");
  assert.equal(await demXinMa(email), truoc, "đường đã tắt vẫn đốt lượt xin mã");
  // Đối chứng dương cùng email: đường xin mã chính vẫn sống và còn lượt.
  assert.equal((await authPost(auth, "/email-otp/send-verification-otp", { email, type: "sign-in" })).status, 200);
  assert.equal(sent.length, 1, "đường xin mã chính phải vẫn gửi mã");
});

// Hàng dang-nhap-mat-khau (E9): bật mật khẩu ở thư viện mở cả họ đường lõi; đường «đã tắt» của bảng lõi trả 404 trước
// bộ xử lý, và đường đăng nhập mật khẩu gọi thẳng thư viện (lọt khỏi đường bọc) cũng 404.
// Đếm người chỉ trên email của ca (hàng va-dong-duong-gui-ma-song-song): cơ sở dữ liệu của lượt chấm dùng chung, tiến
// trình khác tạo người cùng lúc thì đếm cả bảng sẽ lệch. emailMoi chưa ai đăng ký — đường đăng ký lỡ mở lại sẽ tạo người
// mang đúng email ấy (email đã mở sàn thì thư viện từ chối vì trùng, không chứng được gì).
test("đường lõi mật khẩu đóng", async () => {
  const { auth, sent } = makeAuth();
  const email = mail("loi-tat");
  const emailMoi = mail("loi-tat-moi");
  assert.equal(emailMoi, emailMoi.trim().toLowerCase(), "email thử chưa ở dạng chuẩn");
  await openCompany(`[Sàn ${RUN} L]`, email);
  const demSai = async () =>
    Number((await identityPool.query<{ n: string }>("select count(*) as n from identity.password_failures where email = $1", [email])).rows[0]!.n);
  const demNguoi = async () =>
    Number(
      (await identityPool.query<{ n: string }>(`select count(*) as n from identity."user" where email = any($1)`, [[email, emailMoi]])).rows[0]!.n,
    );
  const truocMa = await demXinMa(email);
  const truocSai = await demSai();
  const truocNguoi = await demNguoi();
  const duong = [...DUONG_LOI_DA_TAT.map((p) => p.replace(":token", "ma-thu")), ...PASSWORD_WRAPPED_PATHS];
  let so = 0;
  for (const path of duong) {
    for (let k = 1; k <= 10; k++) {
      const res = await authPost(auth, path, { email, password: "mưa rơi trên mái", newPassword: "mưa rơi trên mái 2", currentPassword: "x".repeat(12), name: "[Tên]", token: "ma-thu" });
      assert.equal(res.status, 404, `${path} lần ${k} trả ${res.status}`);
      so++;
    }
  }
  assert.equal(so, duong.length * 10, "số lần gọi phải bằng số đường × 10");
  for (let k = 1; k <= 10; k++) {
    const res = await authPost(auth, BANG_LOI.signUpEmail[0]!, { email: emailMoi, password: "mưa rơi trên mái", name: "[Tên]" });
    assert.equal(res.status, 404, `đăng ký email mới lần ${k} trả ${res.status}`);
  }
  assert.equal(sent.length, 0, "đường lõi đã tắt vẫn gửi thư");
  assert.equal(await demXinMa(email), truocMa, "đường lõi đã tắt đốt lượt xin mã");
  assert.equal(await demSai(), truocSai, "đường lõi đã tắt đếm thử sai");
  const sauNguoi = await demNguoi();
  assert.equal(sauNguoi, truocNguoi, "đường đăng ký tạo người");
  // Đối chứng dương: đường xin mã chính vẫn sống.
  assert.equal((await authPost(auth, "/email-otp/send-verification-otp", { email, type: "sign-in" })).status, 200);
});
