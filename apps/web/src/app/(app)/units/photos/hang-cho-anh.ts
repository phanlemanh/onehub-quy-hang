// Hàng chờ ảnh chụp trên điện thoại (hàng 41 chup-anh-dien-thoai). Ảnh chụp xong vào hàng chờ ngay — người không phải đứng
// đợi; máy tải lên ở nền theo thứ tự chụp. Mất mạng hay hết phiên thì ảnh nằm chờ trong kho ảnh chờ của người chụp và tự tải
// khi có mạng lại, kể cả sau khi đóng mở app (Cổng Phạm vi 06/11, Hỏi-1). Mỗi ảnh mang mã tạo lúc chụp: gửi lại sau khi mất
// phản hồi không sinh ảnh thứ hai (máy chủ trả 409, máy đối chiếu danh sách). Máy chủ xác nhận thì bản trên máy bị xoá ngay.
// Tải đi đúng đường của mục Ảnh (`nguonApi`), nên quyền thêm ảnh và ẩn ngăn Nội bộ vẫn do API và luật theo dòng quyết.
// Hàng chờ KHÔNG đi qua bộ đồng bộ (ảnh là byte, luật khuôn KH-hs-anh-noi-bo) — chỉ mượn nhịp thử mạng và các chỗ xoá kho.
import type { Compartment } from "@quy-hang/core/photos";

import { taoNhip, type DongHo } from "@/lib/sync/mang";

import type { TepLoi, TepSanSang } from "./tai-len";

export type TrangThaiCho = "cho-mang" | "dang-tai" | "da-tai" | "loi";

export const NHAN_TRANG_THAI_CHO: Readonly<Record<TrangThaiCho, string>> = {
  "cho-mang": "Chờ mạng — tự tải khi có mạng",
  "dang-tai": "Đang tải lên…",
  "da-tai": "Đã tải lên",
  loi: "Không tải được — thử lại",
};

export type AnhCho = {
  /** Mã ảnh tạo lúc chụp — cũng là mã của dòng ảnh trên máy chủ. */
  key: string;
  toa: string;
  ma: string;
  ngan: Compartment;
  tep: TepSanSang;
  /** Đường xem bản nhẹ trên máy, trước khi máy chủ có ảnh. */
  xem: string;
  trangThai: TrangThaiCho;
};

/** Một ảnh chờ như nằm trong kho trên máy: đủ để dựng lại ảnh sau khi tải lại trang hay đóng mở app. */
export type BanGhiCho = {
  id: string;
  toa: string;
  ma: string;
  ngan: Compartment;
  /** Chỉ hai trạng thái sống qua lần mở app: đang tải dở thì mở lại là chờ. */
  trangThai: "cho-mang" | "loi";
  thuTu: number;
  ten: string;
  type: TepSanSang["type"];
  takenAt: string;
  width: number;
  height: number;
  file: Blob;
  thumb: Blob;
};

/** Kho ảnh chờ của MỘT người (bản IndexedDB: `kho-anh-cho.ts`; bài kiểm dùng bản giả cùng giao diện). */
export type KhoAnhCho = {
  tai(): Promise<BanGhiCho[]>;
  ghi(b: BanGhiCho): Promise<void>;
  xoa(id: string): Promise<void>;
};

/** Máy chủ không nhận lời gửi: mang mã trạng thái HTTP để hàng chờ biết chờ, thử lại hay đối chiếu. */
export class LoiGuiAnh extends Error {
  constructor(readonly status: number) {
    super(`ảnh: ${status}`);
  }
}

export type LoiGuiLoai = "mat-mang" | "het-phien" | "da-co" | "khong-nhan";

/**
 * Loại lỗi của một lời gửi: mất mạng (gửi lại ở nhịp sau) · hết phiên 401 (giữ chờ tới khi chính người ấy đăng nhập lại,
 * AC-4) · 409 mã đã có (đối chiếu danh sách) · máy chủ không nhận (người bấm «Thử lại»).
 */
export function phanLoaiLoi(e: unknown, onLine: boolean): LoiGuiLoai {
  if (!onLine || e instanceof TypeError) return "mat-mang";
  if (e instanceof LoiGuiAnh && e.status === 401) return "het-phien";
  if (e instanceof LoiGuiAnh && e.status === 409) return "da-co";
  return "khong-nhan";
}

export type GuiAnh = (o: { id: string; toa: string; ma: string; ngan: Compartment; tep: TepSanSang }) => Promise<void>;

/** Ngày trên máy (giờ địa phương) — ngày chụp của ảnh không có EXIF (AC-7). */
export const ngayTrenMay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const tuBanGhi = (b: BanGhiCho, xem: (blob: Blob) => string): AnhCho => ({
  key: b.id,
  toa: b.toa,
  ma: b.ma,
  ngan: b.ngan,
  tep: { ok: true, file: b.file instanceof File ? b.file : new File([b.file], b.ten, { type: b.type }), type: b.type, takenAt: b.takenAt, thumb: b.thumb, width: b.width, height: b.height },
  xem: xem(b.thumb),
  trangThai: b.trangThai,
});

export type HangChoDeps = {
  gui: GuiAnh;
  /** Máy chủ đã có ảnh mang mã này của căn chưa (sau 409). */
  daCo: (o: { toa: string; ma: string; id: string }) => Promise<boolean>;
  kho: KhoAnhCho;
  onLine: () => boolean;
  xem: (b: Blob) => string;
  /** Đồng hồ lúc chụp (bài kiểm truyền đồng hồ giả). */
  bayGio?: () => Date;
  taoMa?: () => string;
  /** Chỉ bài kiểm đổi — chiều đỏ của phân loại lỗi. */
  phanLoai?: typeof phanLoaiLoi;
};

export function taoHangCho(o: HangChoDeps) {
  const bayGio = o.bayGio ?? (() => new Date());
  const taoMa = o.taoMa ?? (() => crypto.randomUUID());
  const phanLoai = o.phanLoai ?? phanLoaiLoi;
  let ds: AnhCho[] = [];
  const banGhi = new Map<string, BanGhiCho>();
  let thuTu = 0;
  const nghe = new Set<() => void>();
  const daTai = new Map<string, number>();
  let dangChay: Promise<void> | null = null;
  let chayLai = false;
  // Đã dừng (đăng xuất): không gửi thêm, không ghi gì vào kho nữa — kho sắp bị xoá, ghi lại là tạo lại kho (AC-6).
  let daDung = false;
  // Kho trên máy hỏng (mở lỗi, hết chỗ, duyệt riêng tư): ảnh chỉ còn trong bộ nhớ — màn phải nói ra (AC-4).
  let khoLoi = false;
  // Ảnh mà lời gửi trước có thể đã tới máy chủ (mất phản hồi): lần sau đối chiếu danh sách trước khi gửi lại.
  const nghi = new Set<string>();
  // Mọi lệnh vào kho đi lần lượt: ảnh vừa chụp đã tải xong trước khi kịp ghi xuống thì lệnh xoá vẫn đứng sau lệnh ghi.
  let khoViec: Promise<unknown> = Promise.resolve();
  const vaoKho = (f: () => Promise<void>) => {
    if (daDung) return Promise.resolve();
    const p = khoViec.then(() => (daDung ? undefined : f()));
    khoViec = p.catch(() => {
      if (!khoLoi) {
        khoLoi = true;
        bao();
      }
    });
    return khoViec;
  };
  const bao = () => nghe.forEach((f) => f());
  const dat = (key: string, trangThai: TrangThaiCho) => {
    ds = ds.map((a) => (a.key === key ? { ...a, trangThai } : a));
    bao();
  };
  const ghiTrangThai = (key: string, trangThai: "cho-mang" | "loi") => {
    const b = banGhi.get(key);
    if (!b || b.trangThai === trangThai) return;
    const moi = { ...b, trangThai };
    banGhi.set(key, moi);
    void vaoKho(() => o.kho.ghi(moi));
  };
  const xongAnh = (a: AnhCho) => {
    const k = `${a.toa}|${a.ma}`;
    daTai.set(k, (daTai.get(k) ?? 0) + 1);
    banGhi.delete(a.key);
    // Máy chủ đã xác nhận: bản trên máy (cả ảnh Nội bộ) bị xoá ngay (AC-6).
    void vaoKho(() => o.kho.xoa(a.key));
    dat(a.key, "da-tai");
  };

  /** Một lượt: tải lần lượt theo thứ tự chụp; mất mạng hay hết phiên thì dừng cả lô, giữ nguyên hàng chờ. */
  async function motLuot(): Promise<void> {
    for (;;) {
      if (daDung) return;
      const a = ds.find((x) => x.trangThai === "cho-mang");
      if (!a || !o.onLine()) return;
      dat(a.key, "dang-tai");
      if (nghi.has(a.key)) {
        // Lời gửi trước mất phản hồi: máy chủ có thể đã ghi — hỏi danh sách trước, không gửi lại mù.
        const co = await o.daCo({ toa: a.toa, ma: a.ma, id: a.key }).catch(() => null);
        if (daDung) return;
        if (co === null) {
          dat(a.key, "cho-mang");
          return;
        }
        nghi.delete(a.key);
        if (co) {
          xongAnh(a);
          continue;
        }
      }
      try {
        await o.gui({ id: a.key, toa: a.toa, ma: a.ma, ngan: a.ngan, tep: a.tep });
        if (daDung) return;
        xongAnh(a);
      } catch (e) {
        if (daDung) return;
        const loai = phanLoai(e, o.onLine());
        if (loai === "da-co") {
          const co = await o.daCo({ toa: a.toa, ma: a.ma, id: a.key }).catch(() => null);
          if (co === true) xongAnh(a);
          else if (co === null) {
            dat(a.key, "cho-mang");
            return;
          } else {
            dat(a.key, "loi");
            ghiTrangThai(a.key, "loi");
          }
          continue;
        }
        if (loai === "mat-mang" || loai === "het-phien") {
          if (loai === "mat-mang") nghi.add(a.key);
          dat(a.key, "cho-mang");
          return;
        }
        // Máy chủ không nhận một ảnh: ảnh ấy chờ người thử lại, ảnh sau vẫn tải.
        dat(a.key, "loi");
        ghiTrangThai(a.key, "loi");
      }
    }
  }

  /** Đẩy hàng chờ; đang đẩy thì hẹn thêm một lượt và trả đúng lời hứa đang chạy. */
  function day(): Promise<void> {
    if (dangChay) {
      chayLai = true;
      return dangChay;
    }
    dangChay = (async () => {
      do {
        chayLai = false;
        await motLuot();
      } while (chayLai);
    })().finally(() => {
      dangChay = null;
    });
    return dangChay;
  }

  return {
    subscribe(f: () => void) {
      nghe.add(f);
      return () => {
        nghe.delete(f);
      };
    },
    anh: () => ds,
    /** Số ảnh của căn đã lên máy chủ — ảnh lớn và mục Ảnh đọc lại danh sách khi số này đổi (AC-8). */
    soDaTai: (toa: string, ma: string) => daTai.get(`${toa}|${ma}`) ?? 0,
    /** Còn ảnh chưa lên máy chủ (nhịp thử mạng 15 giây). */
    coCho: () => ds.some((a) => a.trangThai === "cho-mang"),
    /** Kho trên máy hỏng: ảnh chờ chỉ còn trong bộ nhớ, đóng app là mất. */
    khoLoi: () => khoLoi,
    /** Dựng lại hàng chờ từ kho của người (mở app, tải lại trang), rồi tải tiếp. Kho mở lỗi thì báo qua `khoLoi`. */
    async khoiDong() {
      let doc: BanGhiCho[];
      try {
        doc = await o.kho.tai();
      } catch {
        khoLoi = true;
        bao();
        return;
      }
      const tren = doc.sort((x, y) => x.thuTu - y.thuTu);
      const co = new Set(ds.map((a) => a.key));
      for (const b of tren) {
        banGhi.set(b.id, b);
        thuTu = Math.max(thuTu, b.thuTu + 1);
        if (!co.has(b.id)) ds = [...ds, tuBanGhi(b, o.xem)];
      }
      bao();
      await day();
    },
    /**
     * Ảnh vừa chụp: vào hàng chờ NGAY (trước mọi lời gọi mạng), mang mã và ngày chụp chốt lúc này, ngăn đang chọn lúc chụp.
     * Trả mã ảnh.
     */
    them(toa: string, ma: string, ngan: Compartment, tep: TepSanSang): string {
      const id = taoMa();
      const takenAt = tep.takenAt ?? ngayTrenMay(bayGio());
      const t: TepSanSang = { ...tep, takenAt };
      const b: BanGhiCho = { id, toa, ma, ngan, trangThai: "cho-mang", thuTu: thuTu++, ten: tep.file.name, type: tep.type, takenAt, width: tep.width, height: tep.height, file: tep.file, thumb: tep.thumb };
      banGhi.set(id, b);
      ds = [...ds, { key: id, toa, ma, ngan, tep: t, xem: o.xem(tep.thumb), trangThai: "cho-mang" }];
      bao();
      void vaoKho(() => o.kho.ghi(b));
      void day();
      return id;
    },
    thuLai(key: string) {
      dat(key, "cho-mang");
      ghiTrangThai(key, "cho-mang");
      void day();
    },
    day,
    /** Chờ lượt đang chạy xong, không mở lượt mới. */
    cho: () => dangChay ?? Promise.resolve(),
    /** Chờ mọi lệnh vào kho đã xong (bài kiểm, đăng xuất). */
    choKho: () => khoViec.then(() => {}),
    /** Đăng xuất: thôi gửi, thôi ghi kho; chờ lượt đang bay và lệnh kho đang dở xong rồi mới cho xoá kho. */
    async dung() {
      daDung = true;
      await (dangChay ?? Promise.resolve()).catch(() => {});
      await khoViec;
    },
  };
}

export type HangCho = ReturnType<typeof taoHangCho>;

export type KetQuaChup = { ten: string; loi: string | null };

/**
 * Nhận các tệp máy ảnh trả về: luật lõi kiểm từng tệp (`chuanBiTep`); tệp hỏng hay quá cỡ không vào hàng chờ và trả lý do
 * của lõi; tệp lành vào hàng chờ với ngăn đang chọn lúc chụp.
 */
export async function nhanAnhChup(
  files: readonly File[],
  o: { chuanBi: (f: File) => Promise<TepSanSang | TepLoi>; them: (tep: TepSanSang) => void },
): Promise<KetQuaChup[]> {
  const ra: KetQuaChup[] = [];
  for (const f of files) {
    const tep = await o.chuanBi(f);
    if (!tep.ok) {
      ra.push({ ten: f.name, loi: tep.lyDo });
      continue;
    }
    o.them(tep);
    ra.push({ ten: f.name, loi: null });
  }
  return ra;
}

/** Nghe số ảnh đã tải của một căn: tăng thì gọi đọc lại danh sách đúng một lần (AC-8). Trả hàm thôi nghe. */
export function theoDoiDaTai(hang: Pick<HangCho, "subscribe" | "soDaTai">, toa: string, ma: string, docLai: () => void): () => void {
  let truoc = hang.soDaTai(toa, ma);
  return hang.subscribe(() => {
    const n = hang.soDaTai(toa, ma);
    if (n > truoc) {
      truoc = n;
      docLai();
    }
  });
}

/** Ngăn chụp khi mở: theo Cổng Phạm vi 06/11 (Hỏi-2 b) KHÔNG đặt mặc định — người phải chạm chọn mới mở được máy ảnh. */
export type NganChup = { mo: boolean; ngan: Compartment | null };
export type ViecNgan = { kind: "mo" } | { kind: "dong" } | { kind: "chon"; ngan: Compartment };

export function doiNgan(s: NganChup, v: ViecNgan): NganChup {
  if (v.kind === "mo") return { mo: true, ngan: null };
  if (v.kind === "dong") return { ...s, mo: false };
  return { ...s, ngan: v.ngan };
}

/**
 * Nhịp thử mạng của hàng chờ (AC-4): mượn `taoNhip` của bộ đồng bộ — 15 giây khi còn ảnh chờ, 30 giây khi yên. Có ảnh mới
 * vào chờ (hay hết ảnh chờ) thì hẹn lại theo chu kỳ mới ngay, không đợi hết chu kỳ yên đang chạy.
 */
export function noiNhip(hang: Pick<HangCho, "subscribe" | "coCho" | "day">, dongHo: DongHo) {
  const nhip = taoNhip({ dongHo, thu: hang.day, coCho: hang.coCho });
  let truoc = hang.coCho();
  const thoi = hang.subscribe(() => {
    const n = hang.coCho();
    if (n !== truoc) {
      truoc = n;
      nhip.henLai();
    }
  });
  return {
    quayLaiTrang: nhip.quayLaiTrang,
    dung() {
      thoi();
      nhip.dung();
    },
  };
}
