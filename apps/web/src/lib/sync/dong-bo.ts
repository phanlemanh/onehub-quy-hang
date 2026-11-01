/**
 * Bộ đồng bộ của một người trên một máy (hàng 13). Mọi lần đọc trả từ bản đệm của kho, không lời gọi mạng; ghi vào kho
 * trước rồi gửi ở nền. Mỗi bước gửi hay kéo đọc lại kho ngay trước khi ghi và chỉ đổi đúng phần nó xử lý, nên thay đổi
 * người vừa sửa trong lúc đang gửi không bị đè, và hai tab chung một kho thấy cùng hàng đợi.
 *
 * Tự lành (hàng 61): lượt gửi hay kéo ghi nguyên nhân thật vào `lastAttempt`; kho trên máy lỗi thì giữ cờ trong bộ nhớ
 * (không ghi được vào kho), lượt dừng êm và lần ghi kho thành công kế tiếp xoá cờ.
 */
import type { EventType } from "@quy-hang/core/listing";
import { apTrenMay, type LoiTrenMay } from "./ap-tren-may";
import { locDanhSach, moHoSo, type BoLoc } from "./doc";
import { guiHangDoi } from "./gui";
import type { LocalStore } from "./kho";
import { keoLichSu, keoVe, LoiKeo } from "./keo";
import { dongHoThat, taoNhip, type DongHo } from "./mang";
import { suyChiBao } from "./trang-thai";
import { nganTrong, type Goi, type LanThu, type Me, type Ngan } from "./types";
import { boThayDoi, giuCuaToi, layBanMoi, suaLai } from "./xu-ly-can-xem";

export type BoDongBo = ReturnType<typeof taoBoDongBo>;

/** Kho trên máy (IndexedDB) ném lỗi khi đọc hay ghi. */
class LoiKho extends Error {}

export function taoBoDongBo(o: { goi: Goi; kho: LocalStore; me: Me; companyId: string; dongHo?: DongHo; taoMa?: () => string; nhip?: boolean }) {
  const dongHo = o.dongHo ?? dongHoThat;
  const taoMa = o.taoMa ?? (() => crypto.randomUUID());
  let companyId = o.companyId;
  let dem: Ngan = nganTrong();
  let dangGui = 0;
  let dangChay: Promise<void> | null = null;
  /** Đã khép hẳn (đăng xuất): không ghi gì vào kho nữa, kể cả lượt đang bay. */
  let khep = false;
  let phienBan = 0;
  let nhip: ReturnType<typeof taoNhip> | null = null;
  /** Lần đọc hay ghi kho gần nhất lỗi — chỉ báo «Lỗi kho trên máy». */
  let loiKho = false;
  const nghe = new Set<() => void>();
  const bao = () => {
    phienBan++;
    nghe.forEach((f) => f());
  };
  const nay = () => new Date(dongHo.now()).toISOString();

  /** Bọc một lần chạm kho: lỗi thành `LoiKho` và bật cờ. */
  async function quaKho<T>(p: () => Promise<T>): Promise<T> {
    try {
      return await p();
    } catch {
      if (!loiKho) {
        loiKho = true;
        bao();
      }
      throw new LoiKho();
    }
  }
  const docKho = (cid: string) => quaKho(() => o.kho.read(cid));
  async function doc(cid = companyId) {
    const n = await docKho(cid);
    if (cid === companyId) dem = n;
    return n;
  }
  async function ghi(cid: string, n: Ngan) {
    if (khep) return;
    await quaKho(() => o.kho.write(cid, n));
    loiKho = false;
    if (cid === companyId) {
      dem = n;
      bao();
    }
  }
  /** Sửa ngăn mới nhất trong kho bằng `f` — đọc lại ngay trước khi ghi. */
  async function doi(cid: string, f: (n: Ngan) => Ngan) {
    if (khep) return;
    await ghi(cid, f(await docKho(cid)));
  }
  /** Lối của người trên kho: kho lỗi thì chỉ báo đã nói, không ném ra nút bấm. */
  async function em(p: Promise<unknown>) {
    try {
      await p;
    } catch (e) {
      if (!(e instanceof LoiKho)) throw e;
    }
  }

  async function mot() {
    try {
      await motLuot();
    } catch (e) {
      if (!(e instanceof LoiKho)) throw e;
    }
  }

  async function motLuot() {
    const cid = companyId; // một lô thuộc đúng sàn lúc bắt đầu, kể cả khi người đổi sàn giữa chừng
    const dau = await doc(cid);
    let lanGui: LanThu = "ok";
    if (dau.queue.length > 0) {
      if (cid === companyId) {
        dangGui = dau.queue.length;
        bao();
      }
      const kq = await guiHangDoi(o.goi, dau, o.me);
      const xuLy = new Set(dau.queue.filter((x) => !kq.ngan.queue.some((y) => y.opId === x.opId)).map((x) => x.opId));
      const reviewMoi = kq.ngan.review.filter((r) => !dau.review.some((d) => d.listingId === r.listingId));
      await doi(cid, (n) => ({
        ...n,
        queue: n.queue.filter((x) => !xuLy.has(x.opId)),
        review: [...n.review, ...reviewMoi],
        listings: kq.ngan.listings,
        history: { ...n.history, ...kq.ngan.history },
        lastAttempt: kq.ngan.lastAttempt,
      }));
      if (cid === companyId) dangGui = 0;
      // Mất mạng hay hết phiên: lần kéo cũng sẽ hỏng như vậy — dừng, chỉ báo giữ nguyên nhân của lượt gửi.
      if (kq.lan === "mang" || kq.lan === "phien") return;
      lanGui = kq.lan;
      // Căn vừa gửi mà đã có lịch sử trên máy: kéo lại lịch sử để hồ sơ thấy đúng các sự kiện vừa lên.
      const daGuiCan = new Set(dau.queue.filter((x) => xuLy.has(x.opId)).map((x) => x.listingId));
      for (const id of daGuiCan) if (dau.history[id]) await taiLichSuCua(cid, id);
    }
    let keo: Ngan;
    try {
      keo = await keoVe(o.goi, await docKho(cid), nay());
    } catch (e) {
      if (e instanceof LoiKho) throw e;
      const lan: LanThu = e instanceof LoiKeo ? e.lan : "mang";
      await doi(cid, (n) => ({ ...n, lastAttempt: lan }));
      return;
    }
    // Kéo được mà một căn vẫn đang gặp 5xx khi gửi: chỉ báo giữ «máy chủ trục trặc» tới khi căn ấy lên.
    await doi(cid, (n) => ({ ...n, listings: keo.listings, history: { ...keo.history, ...pick(n.history, keo) }, lastPullAt: keo.lastPullAt, lastAttempt: lanGui }));
  }
  const pick = (h: Ngan["history"], keo: Ngan) => Object.fromEntries(Object.entries(h).filter(([id]) => keo.listings?.some((l) => l.id === id)));

  async function taiLichSuCua(cid: string, id: string) {
    try {
      const m = await keoLichSu(o.goi, await docKho(cid), id);
      const moi = m.listings?.find((l) => l.id === id);
      await doi(cid, (n) => ({
        ...n,
        history: { ...n.history, [id]: m.history[id] ?? [] },
        listings: moi ? (n.listings ?? []).map((l) => (l.id === id ? moi : l)) : n.listings,
      }));
    } catch {
      /* mất mạng hay lỗi kéo: giữ bản trên máy */
    }
  }

  /** Gửi rồi kéo ngay; lần gọi chồng lên lần đang chạy thì đợi lần ấy. */
  function thuNgay(): Promise<void> {
    dangChay ??= mot().finally(() => {
      dangChay = null;
      dangGui = 0;
      nhip?.henLai();
      bao();
    });
    return dangChay;
  }

  async function guiSauLuotDangBay() {
    await dangChay?.catch(() => undefined);
    await thuNgay();
  }

  /** Nhịp thử chạy từ `khoiDong` tới `dung`; dừng rồi khởi động lại được (React chạy hiệu ứng hai lần ở bản dev). */
  function batNhip() {
    if (o.nhip === false || nhip || khep) return;
    nhip = taoNhip({ dongHo, thu: thuNgay, coCho: () => dem.queue.length > 0 || (dem.lastAttempt !== null && dem.lastAttempt !== "ok") || loiKho });
  }

  return {
    /** Nạp kho lên bản đệm và thử gửi/kéo ngay. */
    /** Nạp kho lên bản đệm — không lời gọi mạng. */
    async napKho() {
      await em(doc());
      bao();
    },
    /** Nạp kho, bật nhịp và thử gửi/kéo ngay. */
    async khoiDong() {
      batNhip();
      await em(doc());
      bao();
      await thuNgay();
    },
    async sua(listingId: string, type: EventType, payload: Record<string, unknown>, coSo?: number): Promise<ReturnType<typeof apTrenMay> | { ok: false; loi: LoiTrenMay }> {
      try {
        const n = await docKho(companyId);
        const kq = apTrenMay(n, listingId, type, payload, nay(), taoMa(), coSo);
        if (!kq.ok) return kq;
        await doi(companyId, (m) => ({ ...m, queue: [...m.queue, kq.op], nextSeq: Math.max(m.nextSeq, kq.op.clientSeq + 1) }));
        void thuNgay();
        return kq;
      } catch (e) {
        if (e instanceof LoiKho) return { ok: false, loi: { kind: "kho" } };
        throw e;
      }
    },
    danhSach: (loc?: BoLoc) => locDanhSach(dem, loc),
    /** Mở hồ sơ: đọc từ bản đệm, không lời gọi mạng. */
    hoSo: (id: string) => moHoSo(dem, id),
    /** Kéo lịch sử một căn ở nền để lần mở sau có sẵn; mất mạng thì thôi, hồ sơ vẫn đọc từ kho. */
    taiLichSu: (id: string) => taiLichSuCua(companyId, id),
    chiBao: () => suyChiBao(dem, dangGui, loiKho),
    canXem: () => dem.review,
    ngan: () => dem,
    // Mỗi lối xếp lại thao tác giữ của căn (xu-ly-can-xem.ts) rồi gửi bằng một lượt MỚI: lượt đang bay đã đọc kho trước
    // khi người chọn, nên không mang thao tác vừa xếp lại (hàng 61 — không chờ tới nhịp sau).
    async giuCuaToi(id: string) {
      await em(doi(companyId, (n) => giuCuaToi(n, id)));
      await guiSauLuotDangBay();
    },
    async layBanMoi(id: string) {
      await em(doi(companyId, (n) => layBanMoi(n, id)));
      await guiSauLuotDangBay();
    },
    async boThayDoi(id: string) {
      await em(doi(companyId, (n) => boThayDoi(n, id)));
      await guiSauLuotDangBay();
    },
    async suaLai(id: string) {
      let nhap: Record<string, unknown> = {};
      await em(
        doi(companyId, (n) => {
          const r = suaLai(n, id);
          nhap = r.nhap;
          return r.ngan;
        }),
      );
      await guiSauLuotDangBay();
      return nhap;
    },
    thuNgay,
    quayLaiTrang: () => nhip?.quayLaiTrang(),
    async doiSan(cid: string) {
      companyId = cid;
      await em(doc());
      bao();
      void thuNgay();
    },
    phienBan: () => phienBan,
    /** Đăng xuất: khép hẳn — không lượt nào ghi vào kho nữa — và chờ lượt đang bay xong, rồi mới xoá kho. */
    async dongHan() {
      khep = true;
      nhip?.dung();
      nhip = null;
      await dangChay?.catch(() => undefined);
    },
    dangKy(f: () => void) {
      nghe.add(f);
      return () => nghe.delete(f);
    },
    dung() {
      nhip?.dung();
      nhip = null;
    },
  };
}
