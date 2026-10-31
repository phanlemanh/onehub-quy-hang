// Mọi đường gửi mã chung một giới hạn, đường thừa bị đóng (hàng 55, hồ sơ dong-duong-gui-ma-thua — E1, E2, E3).
// Gọi thẳng bộ xử lý của better-auth trên Postgres thật.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { OTP_REQUEST_LIMIT, OTP_SEND_PATHS, OTP_TYPE_NOT_ALLOWED } from "../../src/auth/constants";
import { DUONG_DA_TAT } from "../../src/auth/duong-gui-ma.ca";
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
