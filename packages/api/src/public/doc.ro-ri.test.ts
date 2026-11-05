// Bài rò rỉ của route công khai trang khách (hàng 35: AC-8, luật đợt 39; Ngoài-8 hàng 35 làm lại ở hàng 36: AC-10). Mỗi bài
// khai bằng `khaiBaiRoRi` và GỌI route trên app API thật với nguồn mồi mang `canMoi()` — thân trả là đúng thân route dựng
// (`docTrangKhach` → `thanTrangKhach` của lõi), quét bằng `timRoRi` cho mọi người nhận. Bài thuần ở cuối tệp phủ thêm mọi
// cấu hình ra của sàn trên cùng hàm dựng thân.
import assert from "node:assert/strict";
import { test } from "node:test";
import { CAU_HINH_MAC_DINH, CAU_HINH_TAT_CA, canMoi, giaTriMoi, NGUOI_NHAN, timRoRi, type NguoiNhan } from "@quy-hang/core/redaction";
import { SU_KIEN_LAN_GUI, thanTrangKhach } from "@quy-hang/core/sharing";
import { baiDaKhai, khaiBaiRoRi, timRouteThieuKiem } from "./rao-route";
import { dungAppThu } from "./ro-ri-app";
import type { NguonCongKhai } from "./store";

const HOM_NAY = "2026-11-04";
const AUDIENCE = { khach_rieng: "client", nhom_moi_gioi: "agents" } as const;
const MA = "ma-thu-ro-ri";
const ID_CAN = "00000000-0000-4000-8000-000000000036";

/** Nguồn mồi: một Lần gửi một căn `canMoi()`; ghi lại id ảnh route xin đọc. */
function nguonMoi(nguoiNhan: NguoiNhan, anhDaDoc: string[] = []): NguonCongKhai {
  const can = canMoi();
  return {
    timLanGui: async (code) => (code === MA ? { companyId: "san-moi", shareId: "lan-gui-moi", senderUserId: "nguoi-gui-moi", audience: AUDIENCE[nguoiNhan] } : null),
    docCan: async () => [{ id: ID_CAN, can }],
    ghiSuKien: async () => ({ inserted: true }),
    docAnh: async (_s, id) => {
      anhDaDoc.push(id);
      return { kind: "byte", bytes: Buffer.from(`anh-${id}`), type: "image/jpeg" };
    },
  };
}

function roRi(than: string, nguoiNhan: NguoiNhan): string[] {
  const can = canMoi();
  const loi = timRoRi(than, giaTriMoi(can, nguoiNhan, CAU_HINH_MAC_DINH)).map((r) => `${nguoiNhan}: rò ${r.truong} (${r.dang})`);
  for (const a of can.photos) if (a.compartment === "internal" && than.includes(a.id)) loi.push(`${nguoiNhan}: ảnh nội bộ ${a.id}`);
  return loi;
}

khaiBaiRoRi("GET", "/api/v1/public/shares/:code", async (moApp) => {
  for (const nguoiNhan of NGUOI_NHAN) {
    const res = await moApp(nguonMoi(nguoiNhan))(`/api/v1/public/shares/${MA}`);
    assert.equal(res.status, 200, `${nguoiNhan}: route đọc trả ${res.status}`);
    const than = await res.text();
    assert.ok(than.includes(ID_CAN), "đối chứng: thân là thân route dựng từ căn mồi");
    assert.deepEqual(roRi(than, nguoiNhan), []);
    // Đối chứng dương: chèn một giá trị nội bộ của căn mồi vào thân thì máy dò bắt.
    assert.ok(roRi(than.replace(/}$/, `,"lo":${JSON.stringify(canMoi().ownerPhone)}}`), nguoiNhan).length > 0, "đối chứng: máy dò không bắt số chủ nhà");
  }
});

khaiBaiRoRi("POST", "/api/v1/public/shares/:code/events", async (moApp) => {
  for (const nguoiNhan of NGUOI_NHAN) {
    const res = await moApp(nguonMoi(nguoiNhan))(`/api/v1/public/shares/${MA}/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: SU_KIEN_LAN_GUI.quanTam, visitor: "may-thu-ro-ri-01", listingId: ID_CAN }),
    });
    assert.equal(res.status, 201, `${nguoiNhan}: route ghi trả ${res.status}`);
    assert.deepEqual(roRi(await res.text(), nguoiNhan), []);
  }
});

khaiBaiRoRi("GET", "/api/v1/public/shares/:code/photos/:photoId", async (moApp) => {
  const can = canMoi();
  for (const nguoiNhan of NGUOI_NHAN) {
    const daDoc: string[] = [];
    const goi = moApp(nguonMoi(nguoiNhan, daDoc));
    for (const a of can.photos) {
      const res = await goi(`/api/v1/public/shares/${MA}/photos/${a.id}`);
      const than = await res.text();
      if (a.compartment === "internal") assert.equal(res.status, 404, `${nguoiNhan}: ảnh nội bộ ${a.id} trả ${res.status}`);
      else assert.equal(res.status, 200, `${nguoiNhan}: ảnh gửi được ${a.id} trả ${res.status}`);
      assert.deepEqual(roRi(than, nguoiNhan).filter((l) => !l.includes(`ảnh nội bộ`)), []);
    }
    const noiBo = can.photos.filter((a) => a.compartment === "internal").map((a) => a.id);
    assert.deepEqual(daDoc.filter((id) => noiBo.includes(id)), [], `${nguoiNhan}: route xin byte ảnh nội bộ`);
  }
});

test("rò rỉ: route công khai trên app — mọi bài khai chạy xanh và gọi đúng route", async () => {
  assert.ok(baiDaKhai().length >= 3);
  assert.deepEqual(await timRouteThieuKiem(dungAppThu(), dungAppThu), []);
});

test("rò rỉ: hàm dựng thân của route đọc, mọi người nhận × mọi cấu hình", () => {
  const can = canMoi();
  const noiBo = can.photos.filter((a) => a.compartment === "internal").map((a) => a.id);
  assert.ok(noiBo.length > 0, "đối chứng: căn mồi có ảnh nội bộ");
  let o = 0;
  const loi: string[] = [];
  for (const nguoiNhan of NGUOI_NHAN) {
    for (const cauHinh of CAU_HINH_TAT_CA) {
      const than = JSON.stringify(thanTrangKhach({ can: [can], audience: AUDIENCE[nguoiNhan], today: HOM_NAY, cauHinh }));
      for (const r of timRoRi(than, giaTriMoi(can, nguoiNhan, cauHinh))) loi.push(`${nguoiNhan}/${JSON.stringify(cauHinh)}: rò ${r.truong} (${r.dang})`);
      for (const id of noiBo) if (than.includes(id)) loi.push(`${nguoiNhan}/${JSON.stringify(cauHinh)}: ảnh nội bộ ${id}`);
      o++;
    }
  }
  assert.equal(o, NGUOI_NHAN.length * CAU_HINH_TAT_CA.length, "số tổ hợp");
  assert.deepEqual(loi, []);
});

test("rò rỉ: từ vựng ra ngoài không mang nhãn nội bộ", async () => {
  for (const nguoiNhan of NGUOI_NHAN) {
    const nguon: NguonCongKhai = {
      ...nguonMoi(nguoiNhan),
      docNhan: async () => [
        { key: "labels.field.legalStatus", value: "Sổ" },
        { key: "labels.field.withdrawnReason", value: "MOI-LYDO-TRUONG" },
        { key: "labels.field.closePrice", value: "MOI-GIA-CHOT" },
        { key: "labels.value.withdrawnReason", value: { unreachable: "MOI-LYDO" } },
        { key: "labels.value.feeInclusion", value: { included: "BP" } },
      ],
    };
    const res = await dungAppThu(nguon).request(`http://localhost/api/v1/public/shares/${MA}`);
    assert.equal(res.status, 200);
    const than = await res.text();
    for (const moi of ["MOI-LYDO", "MOI-GIA-CHOT"]) assert.ok(!than.includes(moi), `${nguoiNhan}: rò ${moi}`);
    // Đối chứng dương: nhãn của trường thuộc khoá ra có mặt.
    const t = JSON.parse(than) as { tuVung: { truong: Record<string, string>; giaTri: Record<string, Record<string, string>> } };
    assert.equal(t.tuVung.truong.legalStatus, "Sổ", `${nguoiNhan}: thiếu nhãn Pháp lý`);
    assert.equal(t.tuVung.giaTri.feeInclusion?.included, "BP", `${nguoiNhan}: thiếu tên giá trị phí`);
    assert.deepEqual(roRi(than, nguoiNhan), []);
  }
});
