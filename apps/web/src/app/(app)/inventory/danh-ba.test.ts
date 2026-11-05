// Ngoài-10 hàng 105 (hàng 48, E10a): đọc danh bạ hỏng không bị nuốt — phần đọc thuần trả `loi` cho máy chủ lỗi, mất mạng hay
// thân sai khuôn; thử lại với lối đã lành đọc được. Không có hẹn giờ nào trong tệp (không tự thử lại theo nhịp). Chiều đỏ
// cùng ca: bản nuốt lỗi (trả `xong` rỗng như lối cũ) cho ca 500 ra khác `loi`.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { docDanhBa, type KetQuaDocDanhBa } from "./danh-ba";

const DIR = dirname(fileURLToPath(import.meta.url));
type Goi = typeof fetch;
const traVe = (status: number, than: unknown): Goi => (async () => new Response(JSON.stringify(than), { status })) as Goi;

describe("danh bạ thành viên", () => {
  it("danh bạ: đọc hỏng báo lỗi, thử lại đọc lại", async () => {
    let soLan = 0;
    let lanh = false;
    const goi: Goi = (async (...a: Parameters<Goi>) => {
      soLan++;
      if (!lanh) throw new TypeError("Failed to fetch");
      return traVe(200, [{ id: "u-1", name: "[Tên] Đầu chủ một" }])(...a);
    }) as Goi;

    // Ma trận viết trước: (lối) → kết quả.
    assert.deepEqual(await docDanhBa(traVe(500, { error: "x" })), { kind: "loi" });
    assert.deepEqual(await docDanhBa(traVe(503, null)), { kind: "loi" });
    assert.deepEqual(await docDanhBa(traVe(200, { khong: "phai mang" })), { kind: "loi" });
    assert.deepEqual(await docDanhBa(goi), { kind: "loi" }, "mất mạng phải là loi");
    assert.equal(soLan, 1);
    // Thử lại khi lối đã lành: đọc được, số lần gọi tăng đúng 1.
    lanh = true;
    assert.deepEqual(await docDanhBa(goi), { kind: "xong", ds: [{ id: "u-1", name: "[Tên] Đầu chủ một" }] });
    assert.equal(soLan, 2);

    // Không tự thử lại theo nhịp: tệp hook không đặt hẹn giờ nào.
    const nguon = readFileSync(join(DIR, "danh-ba.ts"), "utf8");
    assert.doesNotMatch(nguon, /setTimeout|setInterval/, "hook danh bạ tự thử lại theo nhịp");

    // Chiều đỏ cùng ca: bản nuốt lỗi như lối cũ (lỗi thì im, không báo) cho ca 500 ra khác `loi`.
    const nuotLoi = async (g: Goi): Promise<KetQuaDocDanhBa> => {
      try {
        const r = await g("/api/v1/company/member-names");
        return r.ok ? { kind: "xong", ds: (await r.json()) as never } : { kind: "xong", ds: [] };
      } catch {
        return { kind: "xong", ds: [] };
      }
    };
    assert.notDeepEqual(await nuotLoi(traVe(500, {})), { kind: "loi" }, "đối chứng: bản nuốt lỗi không báo loi");
    assert.deepEqual(await docDanhBa(traVe(500, {})), { kind: "loi" }, "lỗi đọc danh bạ bị nuốt");
  });
});
