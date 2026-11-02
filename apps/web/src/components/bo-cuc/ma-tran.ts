// Hệ bố cục (ADR-0024 quyết định 2, 3, 5): bảy bố cục có tên, vùng của từng bố cục và bản điện thoại. Dữ liệu thuần —
// thành phần BoCuc, trang mẫu sống, test và bài quét khuôn cùng đọc một nguồn này, không chép bảng sang chỗ khác.

export const BO_CUC = [
  "tran",
  "danh-sach-chi-tiet",
  "doc",
  "ho-so",
  "bang-dieu-khien",
  "luong-nhieu-buoc",
  "dong-tin",
] as const;

export type KieuBoCuc = (typeof BO_CUC)[number];

/**
 * Vùng ở cấp trang mà bố cục xếp: đầu màn (dải ngoài khung), thân, cột phụ. Thanh công cụ và chân thuộc về khối ReUI
 * đặt trong thân (khối mang Frame của nó — ReUI, Verve); ngăn nổi (`NganNoi`) mở trên màn, không chiếm chỗ.
 */
export const VUNG = ["dau-man", "than", "cot-phu"] as const;

/** Vùng nằm trong khối của thân (ADR-0024 §3): bố cục không dựng, khối ReUI mang sẵn. */
export const VUNG_TRONG_KHOI = ["thanh-cong-cu", "chan"] as const;

export type Vung = (typeof VUNG)[number];

type ThongTin = {
  ten: string;
  mat_do: "day" | "thuong";
  khoi_nguon: string;
  vung: readonly Vung[];
  /** Bản điện thoại theo ADR-0024 §5. */
  dien_thoai: string;
};

export const THONG_TIN: Record<KieuBoCuc, ThongTin> = {
  tran: {
    ten: "Tràn",
    mat_do: "day",
    khoi_nguon: "solution-crm-3 (chờ quyết kiểu chặt cho filters)",
    vung: ["dau-man", "than"],
    dien_thoai: "thành thẻ",
  },
  "danh-sach-chi-tiet": {
    ten: "Danh sách – chi tiết",
    mat_do: "day",
    khoi_nguon: "sheet-9 (ngăn inset trượt phải) + hồ sơ solution-crm-4",
    vung: ["dau-man", "than", "cot-phu"],
    dien_thoai: "chi tiết mở ngăn từ đáy",
  },
  doc: {
    ten: "Đọc",
    mat_do: "thuong",
    khoi_nguon: "settings-3",
    vung: ["dau-man", "than"],
    dien_thoai: "giữ",
  },
  "ho-so": {
    ten: "Hồ sơ",
    mat_do: "thuong",
    khoi_nguon: "solution-crm-4 — một cột theo hồ sơ căn hàng 17 (khoi/solution-crm-4/ho-so.tsx)",
    vung: ["dau-man", "than"],
    dien_thoai: "giữ một cột",
  },
  "bang-dieu-khien": {
    ten: "Bảng điều khiển",
    mat_do: "thuong",
    khoi_nguon: "stats-7 + data-grid-grouping-2",
    vung: ["dau-man", "than"],
    dien_thoai: "không có trên điện thoại",
  },
  "luong-nhieu-buoc": {
    ten: "Luồng nhiều bước",
    mat_do: "thuong",
    khoi_nguon: "solution-crm-6",
    vung: ["dau-man", "than", "cot-phu"],
    dien_thoai: "ngăn toàn màn",
  },
  "dong-tin": {
    ten: "Dòng tin",
    mat_do: "thuong",
    khoi_nguon: "solution-crm-5",
    vung: ["dau-man", "than"],
    dien_thoai: "giữ",
  },
};

export const coVung = (kieu: KieuBoCuc, vung: Vung): boolean => THONG_TIN[kieu].vung.includes(vung);

/** Đầu màn: một nút chính, tối đa hai nút phụ, phần còn lại vào menu «…» (ADR-0024 §3). */
export const NUT_PHU_TOI_DA = 2;

export function chiaNut<T>(nut: readonly T[]): { chinh: T | null; phu: T[]; them: T[] } {
  const [chinh = null, ...con] = nut;
  return { chinh, phu: con.slice(0, NUT_PHU_TOI_DA), them: con.slice(NUT_PHU_TOI_DA) };
}
