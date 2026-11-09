import assert from "node:assert/strict";
import { test } from "node:test";
import type { KetQua } from "./dung";
import { bocUpi, DAU_NOI_DOI_CHUNG, DAU_NOI_SDT, DUONG_DUNG_TOA, DUONG_DUNG_UPI, maTranKhoa } from "./nen-thu.fixture";

const loiCua = (kq: KetQua<unknown>) => (kq.ok ? [] : kq.loi);

test("khoá máy cấp: ma trận số điện thoại bị hàm dựng chặn", () => {
  const sdt = maTranKhoa(DAU_NOI_SDT);
  const doiChung = maTranKhoa(DAU_NOI_DOI_CHUNG);
  assert.equal(sdt.length, 175);
  assert.equal(doiChung.length, sdt.length);
  const nhom = [
    { truong: "buildingKey", duong: DUONG_DUNG_TOA, boc: (k: string) => k },
    { truong: "upi", duong: DUONG_DUNG_UPI, boc: bocUpi },
  ];
  let chan = 0;
  let qua = 0;
  for (const { truong, duong, boc } of nhom) {
    for (const d of duong) {
      for (const [i, k] of sdt.entries()) {
        const kq = d.dung(boc(k));
        assert.equal(kq.ok, false, `${d.ten} · ${truong} · ${boc(k)}: phải từ chối`);
        const loi = loiCua(kq).find((l) => l.truong === truong);
        assert.ok(loi?.thongDiep.includes("dáng số điện thoại"), `${d.ten} · ${truong} · ${boc(k)}: ${JSON.stringify(loiCua(kq))}`);
        chan++;
        const tot = d.dung(boc(doiChung[i] ?? ""));
        assert.ok(tot.ok, `${d.ten} · ${truong} · đối chứng ${doiChung[i]}: ${JSON.stringify(loiCua(tot))}`);
        qua++;
      }
    }
  }
  assert.equal(chan, sdt.length * (DUONG_DUNG_TOA.length + DUONG_DUNG_UPI.length));
  assert.equal(chan, 875);
  assert.equal(qua, 875);
});
