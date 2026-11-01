// Nguồn ảnh của mục Ảnh nối API `/api/v1/units/photos` (hàng 18). Gọi thẳng API, không qua bộ đồng bộ, không giữ gì
// trên máy; ảnh mở qua đường của API (API kiểm quyền rồi trả byte hay chuyển tới link ký 60 giây).
import type { Compartment } from "@quy-hang/core/photos";
import type { DanhSachAnh, NguonAnh, SuaAnh } from "./muc-anh";
import type { TepSanSang } from "./tai-len";

const BASE = "/api/v1/units/photos";

export function nguonApi(toa: string, ma: string, f: typeof fetch = fetch): NguonAnh {
  const ok = async (r: Response) => {
    if (!r.ok) throw new Error(`ảnh: ${r.status}`);
    return r;
  };
  return {
    async danhSach() {
      const r = await ok(await f(`${BASE}?toa=${encodeURIComponent(toa)}&ma=${encodeURIComponent(ma)}`, { cache: "no-store" }));
      return (await r.json()) as DanhSachAnh;
    },
    async them(tep: TepSanSang, ngan: Compartment) {
      const fd = new FormData();
      fd.set("toa", toa);
      fd.set("ma", ma);
      fd.set("compartment", ngan);
      fd.set("width", String(tep.width));
      fd.set("height", String(tep.height));
      if (tep.takenAt) fd.set("takenAt", tep.takenAt);
      fd.set("original", tep.file, tep.file.name);
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
