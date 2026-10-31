// Bộ gửi Resend (ADR-0009): đúng địa chỉ, đúng người nhận, có mã; lỗi gửi không lặng và không lộ mã.
import assert from "node:assert/strict";
import { test } from "node:test";
import { otpEmail, resendSender } from "./sender";

test("thư mã: tiêu đề và thân có mã, hạn 5 phút", () => {
  const m = otpEmail("123456");
  assert.match(m.subject, /123456/);
  assert.match(m.text, /123456/);
  assert.match(m.text, /5 phút/);
});

test("resend: gửi một thư tới đúng người, đúng người gửi, khoá ở header", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const fake = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response("{}", { status: 200 });
  }) as typeof fetch;
  await resendSender({ apiKey: "re_test", from: "Quỹ hàng <no-reply@example.test>", fetch: fake })({
    email: "a@example.test",
    otp: "654321",
  });
  assert.equal(calls.length, 1);
  const [call] = calls as [{ url: string; init: RequestInit }];
  assert.equal(call.url, "https://api.resend.com/emails");
  assert.equal((call.init.headers as Record<string, string>).authorization, "Bearer re_test");
  const body = JSON.parse(String(call.init.body));
  assert.deepEqual(body.to, ["a@example.test"]);
  assert.equal(body.from, "Quỹ hàng <no-reply@example.test>");
  assert.match(body.text, /654321/);
});

test("resend: lỗi gửi ném ra, thông báo không chứa mã", async () => {
  const fake = (async () => new Response("bad", { status: 403 })) as typeof fetch;
  const send = resendSender({ apiKey: "re_test", from: "x@example.test", fetch: fake });
  await assert.rejects(send({ email: "a@example.test", otp: "999888" }), (e: Error) => {
    assert.match(e.message, /Resend 403/);
    assert.doesNotMatch(e.message, /999888/);
    return true;
  });
});
