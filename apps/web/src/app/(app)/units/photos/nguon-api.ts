// Nguồn ảnh của mục Ảnh nối API `/api/v1/units/photos` (hàng 18). Gọi thẳng API, không qua bộ đồng bộ, không giữ gì
// trên máy; ảnh mở qua đường của API (API kiểm quyền rồi trả byte hay chuyển tới link ký 60 giây).
import type { Compartment } from "@quy-hang/core/photos";
import { LoiGuiAnh } from "./hang-cho-anh";
import type { DanhSachAnh, NguonAnh, SuaAnh } from "./muc-anh";
import type { TepSanSang } from "./tai-len";

const BASE = "/api/v1/units/photos";

export function nguonApi(toa: string, ma: string, f: typeof fetch = fetch): NguonAnh {
  const ok = async (r: Response) => {
    if (!r.ok) throw new LoiGuiAnh(r.status);
    return r;
  };
  return {
    async danhSach() {
      const r = await ok(await f(`${BASE}?toa=${encodeURIComponent(toa)}&ma=${encodeURIComponent(ma)}`, { cache: "no-store" }));
      return (await r.json()) as DanhSachAnh;
    },
    // `photoId`: mã ảnh tạo lúc chụp (hàng 41) — máy chủ dùng làm mã dòng ảnh ở cả hai bản kho, gửi lại không trùng.
    async them(tep: TepSanSang, ngan: Compartment, photoId?: string) {
      // Bản Storage: bản gốc đi thẳng lên kho bằng link ký (không qua giới hạn thân yêu cầu của hàm Vercel), rồi xác nhận
      // bằng mã ảnh; bản Postgres (truc_tiep false): bản gốc đi trong thân như cũ.
      const r = await ok(await f(`${BASE}/upload-url`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ toa, ma, contentType: tep.type, byteSize: tep.file.size, ...(photoId ? { photoId } : {}) }) }));
      const link = (await r.json()) as { truc_tiep: boolean; photoId?: string; url?: string };
      const fd = new FormData();
      fd.set("toa", toa);
      fd.set("ma", ma);
      fd.set("compartment", ngan);
      fd.set("width", String(tep.width));
      fd.set("height", String(tep.height));
      if (tep.takenAt) fd.set("takenAt", tep.takenAt);
      if (link.truc_tiep && link.url && link.photoId) {
        await ok(await f(link.url, { method: "PUT", headers: { "content-type": tep.type }, body: tep.file }));
        fd.set("photoId", link.photoId);
      } else {
        fd.set("original", tep.file, tep.file.name);
        if (photoId) fd.set("photoId", photoId);
      }
      fd.set("thumb", tep.thumb, "thumb");
      await ok(await f(BASE, { method: "POST", body: fd }));
    },
    async sua(id: string, s: SuaAnh) {
      await ok(await f(`${BASE}/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(s) }));
    },
    async xoa(id: string) {
      await ok(await f(`${BASE}/${id}`, { method: "DELETE" }));
    },
    urlAnh: (id, bien) => `${BASE}/${id}/${bien}`,
  };
}
