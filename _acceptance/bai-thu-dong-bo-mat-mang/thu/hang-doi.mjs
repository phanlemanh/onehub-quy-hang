// Hàng đợi ghi phía máy — thuần, chạy cả trong trình duyệt (trang /thu) lẫn Node (bài kiểm).
// Mỗi thao tác mang op_id (khoá chống trùng) và client_seq tăng dần; chỉ rời hàng đợi khi máy chủ xác nhận.

const XONG = new Set(['da-ap', 'da-ap-truoc', 'bi-tu-choi']);

const taoMa = () =>
  globalThis.crypto?.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16));

/**
 * @param {{ clientId: string, gui: (ops: object[]) => Promise<{ket_qua: object[]}>,
 *           luu?: (trangThai: object) => void, nap?: () => object|null, gio?: () => string }} tuyChon
 */
export function taoHangDoi({ clientId, gui, luu = () => {}, nap = () => null, gio = () => new Date().toISOString() }) {
  const cu = nap();
  const tt = cu ?? { clientId, seqKe: 0, cho: [] };
  const ghi = () => luu(JSON.parse(JSON.stringify(tt)));

  return {
    them(listingId, price) {
      tt.seqKe += 1;
      const op = { op_id: taoMa(), client_seq: tt.seqKe, listing_id: listingId, price, tao_luc: gio() };
      tt.cho.push(op);
      ghi();
      return op;
    },
    soCho: () => tt.cho.length,
    cho: () => tt.cho.map((o) => ({ ...o })),
    clientId: () => tt.clientId,
    /** Đẩy mọi thao tác chờ theo thứ tự; lỗi mạng thì giữ nguyên hàng đợi và ném lại lỗi. */
    async day() {
      if (tt.cho.length === 0) return { ket_qua: [] };
      const lo = [...tt.cho].sort((a, b) => a.client_seq - b.client_seq);
      const tl = await gui(lo);
      const daXong = new Set(tl.ket_qua.filter((k) => XONG.has(k.trang_thai)).map((k) => k.op_id));
      tt.cho = tt.cho.filter((o) => !daXong.has(o.op_id));
      ghi();
      return tl;
    },
  };
}

/** Kiểm một lô đã áp: server seq tăng theo client_seq, không thiếu client_seq nào trong dải. */
export function kiemThuTu(ketQua) {
  const da = ketQua.filter((k) => k.trang_thai === 'da-ap').sort((a, b) => a.client_seq - b.client_seq);
  for (let i = 1; i < da.length; i++) {
    if (!(da[i].seq > da[i - 1].seq)) throw new Error('sai thứ tự');
    if (da[i].client_seq !== da[i - 1].client_seq + 1) throw new Error('thiếu thao tác');
  }
  return da.length;
}
