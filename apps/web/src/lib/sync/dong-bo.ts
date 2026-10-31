/**
 * Bộ đồng bộ của một người trên một máy (hàng 13). Mọi lần đọc trả từ bản đệm của kho, không lời gọi mạng; ghi vào kho
 * trước rồi gửi ở nền. Mỗi bước gửi hay kéo đọc lại kho ngay trước khi ghi và chỉ đổi đúng phần nó xử lý, nên thay đổi
 * người vừa sửa trong lúc đang gửi không bị đè, và hai tab chung một kho thấy cùng hàng đợi.
 */
import type { EventType } from "@quy-hang/core/listing";
import { apTrenMay } from "./ap-tren-may";
import { locDanhSach, moHoSo, type BoLoc } from "./doc";
import { guiHangDoi } from "./gui";
import type { LocalStore } from "./kho";
import { keoLichSu, keoVe } from "./keo";
import { dongHoThat, taoNhip, type DongHo } from "./mang";
import { suyChiBao } from "./trang-thai";
import { nganTrong, type Goi, type Me, type Ngan } from "./types";
import { boThayDoi, giuCuaToi, layBanMoi, suaLai } from "./xu-ly-can-xem";

export type BoDongBo = ReturnType<typeof taoBoDongBo>;

export function taoBoDongBo(o: { goi: Goi; kho: LocalStore; me: Me; companyId: string; dongHo?: DongHo; taoMa?: () => string; nhip?: boolean }) {
  const dongHo = o.dongHo ?? dongHoThat;
  const taoMa = o.taoMa ?? (() => crypto.randomUUID());
  let companyId = o.companyId;
  let dem: Ngan = nganTrong();
  let dangGui = 0;
  let dangChay: Promise<void> | null = null;
  const nghe = new Set<() => void>();
  const bao = () => nghe.forEach((f) => f());
  const nay = () => new Date(dongHo.now()).toISOString();

  async function doc(cid = companyId) {
    const n = await o.kho.read(cid);
    if (cid === companyId) dem = n;
    return n;
  }
  async function ghi(cid: string, n: Ngan) {
    await o.kho.write(cid, n);
    if (cid === companyId) {
      dem = n;
      bao();
    }
  }
  /** Sửa ngăn mới nhất trong kho bằng `f` — đọc lại ngay trước khi ghi. */
  async function doi(cid: string, f: (n: Ngan) => Ngan) {
    await ghi(cid, f(await o.kho.read(cid)));
  }

  async function mot() {
    const cid = companyId; // một lô thuộc đúng sàn lúc bắt đầu, kể cả khi người đổi sàn giữa chừng
    const dau = await doc(cid);
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
      if (kq.mang) return;
    }
    try {
      const keo = await keoVe(o.goi, await o.kho.read(cid), nay());
      await doi(cid, (n) => ({ ...n, listings: keo.listings, history: { ...keo.history, ...pick(n.history, keo) }, lastPullAt: keo.lastPullAt, lastAttempt: "ok" }));
    } catch {
      await doi(cid, (n) => ({ ...n, lastAttempt: "mang" }));
    }
  }
  const pick = (h: Ngan["history"], keo: Ngan) => Object.fromEntries(Object.entries(h).filter(([id]) => keo.listings?.some((l) => l.id === id)));

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

  const nhip = o.nhip === false ? null : taoNhip({ dongHo, thu: thuNgay, coCho: () => dem.queue.length > 0 || dem.lastAttempt === "mang" });

  return {
    /** Nạp kho lên bản đệm và thử gửi/kéo ngay. */
    async khoiDong() {
      await doc();
      bao();
      await thuNgay();
    },
    async sua(listingId: string, type: EventType, payload: Record<string, unknown>) {
      const n = await o.kho.read(companyId);
      const kq = apTrenMay(n, listingId, type, payload, nay(), taoMa());
      if (!kq.ok) return kq;
      await doi(companyId, (m) => ({ ...m, queue: [...m.queue, kq.op], nextSeq: Math.max(m.nextSeq, kq.op.clientSeq + 1) }));
      void thuNgay();
      return kq;
    },
    danhSach: (loc?: BoLoc) => locDanhSach(dem, loc),
    hoSo(id: string) {
      const h = moHoSo(dem, id);
      // Mở hồ sơ không chờ mạng; lịch sử kéo ở nền để lần sau có sẵn.
      void (async () => {
        try {
          const cid = companyId;
          const m = await keoLichSu(o.goi, await o.kho.read(cid), id);
          await doi(cid, (n) => ({ ...n, history: { ...n.history, [id]: m.history[id] ?? [] }, listings: m.listings }));
        } catch {
          /* mất mạng: hồ sơ vẫn đọc từ kho */
        }
      })();
      return h;
    },
    chiBao: () => suyChiBao(dem, dangGui),
    canXem: () => dem.review,
    ngan: () => dem,
    async giuCuaToi(id: string) {
      await doi(companyId, (n) => giuCuaToi(n, id));
      void thuNgay();
    },
    layBanMoi: (id: string) => doi(companyId, (n) => layBanMoi(n, id)),
    boThayDoi: (id: string) => doi(companyId, (n) => boThayDoi(n, id)),
    async suaLai(id: string) {
      let nhap: Record<string, unknown> = {};
      await doi(companyId, (n) => {
        const r = suaLai(n, id);
        nhap = r.nhap;
        return r.ngan;
      });
      return nhap;
    },
    thuNgay,
    quayLaiTrang: () => nhip?.quayLaiTrang(),
    async doiSan(cid: string) {
      companyId = cid;
      await doc();
      bao();
      void thuNgay();
    },
    dangKy(f: () => void) {
      nghe.add(f);
      return () => nghe.delete(f);
    },
    dung: () => nhip?.dung(),
  };
}
