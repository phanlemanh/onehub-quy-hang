import assert from "node:assert/strict";
import { test } from "node:test";
import { dungThuocTinhCan } from "./dung";
import { dauThuocTinhCan, khoaThu, nguCanhMau } from "./nen-thu.fixture";

const SAN_1 = "00000000-0000-4000-8000-0000000c0b11";
const SAN_2 = "00000000-0000-4000-8000-0000000c0b12";
const NGUOI_1 = "nguoi-mau-11";

function ma(khoaBenNhan: Uint8Array | undefined, companyId: string, userId: string) {
  const kq = dungThuocTinhCan(dauThuocTinhCan(), nguCanhMau({ khoaBenNhan, companyId, userId }));
  return kq;
}

test("mã mờ theo bên nhận", () => {
  const K1 = khoaThu(1);
  const K2 = khoaThu(2);
  const a = ma(K1, SAN_1, NGUOI_1);
  const b = ma(K1, SAN_1, NGUOI_1);
  const c = ma(K2, SAN_1, NGUOI_1);
  const d = ma(K1, SAN_2, NGUOI_1);
  for (const kq of [a, b, c, d]) assert.ok(kq.ok);
  if (!a.ok || !b.ok || !c.ok || !d.ok) return;
  assert.equal(a.suKien.officeKey, b.suKien.officeKey, "cùng sàn, cùng bên nhận: cùng mã sàn");
  assert.equal(a.suKien.memberKey, b.suKien.memberKey, "cùng người, cùng bên nhận: cùng mã người");
  assert.notEqual(a.suKien.officeKey, c.suKien.officeKey, "bên nhận khác: mã sàn khác");
  assert.notEqual(a.suKien.memberKey, c.suKien.memberKey, "bên nhận khác: mã người khác");
  assert.notEqual(a.suKien.officeKey, d.suKien.officeKey, "sàn khác: mã sàn khác");
  for (const kq of [a, c, d]) {
    for (const m of [kq.suKien.officeKey, kq.suKien.memberKey]) {
      assert.match(m, /^[A-Za-z0-9_-]{43}$/);
      assert.ok(!m.includes(SAN_1) && !m.includes(SAN_2) && !m.includes(NGUOI_1), "không chứa mã gốc");
    }
  }
  // Tách miền: mã sàn khác mã người khi hai mã gốc trùng nhau.
  const trung = ma(K1, "cung-mot-ma", "cung-mot-ma");
  assert.ok(trung.ok);
  if (trung.ok) assert.notEqual(trung.suKien.officeKey, trung.suKien.memberKey);

  const maTran: (Uint8Array | undefined)[] = [undefined, new Uint8Array(0), khoaThu(3, 31)];
  let dem = 0;
  for (const k of maTran) {
    const kq = ma(k, SAN_1, NGUOI_1);
    assert.equal(kq.ok, false, `khoá ${k?.length ?? "vắng"} byte: phải từ chối`);
    assert.ok(!kq.ok && kq.loi.some((l) => l.truong === "khoaBenNhan"));
    dem++;
  }
  assert.equal(dem, 3);
  assert.ok(ma(khoaThu(3, 32), SAN_1, NGUOI_1).ok, "đối chứng: 32 byte dựng được");
});
