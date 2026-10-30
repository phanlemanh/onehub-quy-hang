// Danh tính bằng mã email (AC-1, AC-2). Gọi thẳng bộ xử lý của better-auth trên Postgres thật.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { OTP_REQUEST_LIMIT, OTP_REQUEST_WINDOW_MIN } from "../src/auth/constants";
import { authPost, cleanup, cookieOf, identityPool, mail, makeAuth, openCompany, RUN } from "./helpers";

after(cleanup);

const sendCode = (auth: ReturnType<typeof makeAuth>["auth"], email: string) =>
  authPost(auth, "/email-otp/send-verification-otp", { email, type: "sign-in" });
const signIn = (auth: ReturnType<typeof makeAuth>["auth"], email: string, otp: string) =>
  authPost(auth, "/sign-in/email-otp", { email, otp });

test("xin mã: email có tài khoản nhận đúng một mã 6 chữ số", async () => {
  const { auth, sent } = makeAuth();
  const email = mail("co-tk");
  await openCompany(`[Sàn ${RUN} 1]`, email);
  const res = await sendCode(auth, email);
  assert.equal(res.status, 200);
  assert.equal(sent.length, 1, `bộ gửi nhận ${sent.length} mã`);
  assert.match(sent[0]!.otp, /^\d{6}$/);
  assert.equal(sent[0]!.email, email);
});

test("xin mã: email lạ không nhận mã nào", async () => {
  const { auth, sent } = makeAuth();
  const res = await sendCode(auth, mail("la"));
  assert.equal(res.status, 200);
  assert.equal(sent.length, 0, "email lạ nhận được mã");
});

test("xin mã: trả lời như nhau dù email có tài khoản hay chưa", async () => {
  const { auth } = makeAuth();
  const known = mail("so-1");
  await openCompany(`[Sàn ${RUN} 2]`, known);
  const a = await sendCode(auth, known);
  const b = await sendCode(auth, mail("so-2"));
  assert.equal(a.status, b.status);
  assert.equal(await a.text(), await b.text());
});

test("xin mã: lần thứ sáu trong 15 phút trả 429, lần thứ năm vẫn nhận mã", async () => {
  assert.equal(OTP_REQUEST_LIMIT, 5, "hợp đồng ghim 5 lần");
  assert.equal(OTP_REQUEST_WINDOW_MIN, 15, "hợp đồng ghim 15 phút");
  const { auth, sent } = makeAuth();
  const email = mail("nhieu");
  await openCompany(`[Sàn ${RUN} 3]`, email);
  for (let i = 1; i <= OTP_REQUEST_LIMIT; i++) assert.equal((await sendCode(auth, email)).status, 200, `lần ${i}`);
  assert.equal(sent.length, OTP_REQUEST_LIMIT, "lần thứ năm phải vẫn nhận mã");
  const sixth = await sendCode(auth, email);
  assert.equal(sixth.status, 429);
  assert.equal(sent.length, OTP_REQUEST_LIMIT, "lần thứ sáu vẫn gửi mã");
});

test("nhập mã: đúng mã mở phiên", async () => {
  const { auth, sent } = makeAuth();
  const email = mail("dung");
  await openCompany(`[Sàn ${RUN} 4]`, email);
  await sendCode(auth, email);
  const res = await signIn(auth, email, sent[0]!.otp);
  assert.equal(res.status, 200);
  const cookie = cookieOf(res);
  assert.match(cookie, /qh\.session_token=/);
  const session = await auth.api.getSession({ headers: new Headers({ cookie }) });
  assert.equal(session?.user.email, email);
});

test("nhập mã: sai mã không mở phiên", async () => {
  const { auth, sent } = makeAuth();
  const email = mail("sai");
  await openCompany(`[Sàn ${RUN} 5]`, email);
  await sendCode(auth, email);
  const wrong = sent[0]!.otp === "000000" ? "111111" : "000000";
  const res = await signIn(auth, email, wrong);
  assert.notEqual(res.status, 200);
  assert.doesNotMatch(cookieOf(res), /session_token=/);
});

test("nhập mã: mã quá hạn không mở phiên", async () => {
  const { auth, sent } = makeAuth();
  const email = mail("het-han");
  await openCompany(`[Sàn ${RUN} 6]`, email);
  await sendCode(auth, email);
  // Thay đồng hồ giả: đẩy hạn của mã về quá khứ bằng kết nối chủ.
  const upd = await identityPool.query(
    `update identity.verification set "expiresAt" = now() - interval '1 second' where identifier like $1`,
    [`%${email}%`],
  );
  assert.equal(upd.rowCount, 1);
  const res = await signIn(auth, email, sent[0]!.otp);
  assert.notEqual(res.status, 200);
  assert.doesNotMatch(cookieOf(res), /session_token=/);
});

test("nhập mã: lần thứ tư sau ba lần sai không mở phiên dù đúng mã", async () => {
  const { auth, sent } = makeAuth();
  const email = mail("ba-lan");
  await openCompany(`[Sàn ${RUN} 7]`, email);
  await sendCode(auth, email);
  const otp = sent[0]!.otp;
  const wrong = otp === "000000" ? "111111" : "000000";
  for (let i = 0; i < 3; i++) await signIn(auth, email, wrong);
  const res = await signIn(auth, email, otp);
  assert.notEqual(res.status, 200);
  assert.doesNotMatch(cookieOf(res), /session_token=/);
});
