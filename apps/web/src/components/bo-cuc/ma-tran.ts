// Hệ bố cục (ADR-0024 quyết định 2, 3, 5): bảy bố cục có tên, vùng của từng bố cục và bản điện thoại. Dữ liệu thuần —
// thành phần BoCuc, trang mẫu sống, test và bài quét khuôn cùng đọc một nguồn này, không chép bảng sang chỗ khác.

export const BO_CUC = [
  "tran",
  "danh-sach-chi-tiet",
  "doc",
  "ho-so-hai-cot",
  "bang-dieu-khien",
  "luong-nhieu-buoc",
  "dong-tin",
] as const;

export type KieuBoCuc = (typeof BO_CUC)[number];

/** Năm vùng nằm trong khung màn; ngăn nổi (`NganNoi`) là vùng thứ sáu, mở trên màn chứ không chiếm chỗ trong khung. */
export const VUNG = ["dau-man", "thanh-cong-cu", "than", "cot-phu", "chan"] as const;

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
    khoi_nguon: "data-grid-editing-6",
    vung: ["dau-man", "thanh-cong-cu", "than", "chan"],
    dien_thoai: "thành thẻ",
  },
  "danh-sach-chi-tiet": {
    ten: "Danh sách – chi tiết",
    mat_do: "day",
    khoi_nguon: "resizable theo c-resizable-9",
    vung: ["dau-man", "thanh-cong-cu", "than", "cot-phu", "chan"],
    dien_thoai: "hai màn chồng",
  },
  doc: {
    ten: "Đọc",
    mat_do: "thuong",
    khoi_nguon: "settings-3",
    vung: ["dau-man", "than", "chan"],
    dien_thoai: "giữ",
  },
  "ho-so-hai-cot": {
    ten: "Hồ sơ hai cột",
    mat_do: "thuong",
    khoi_nguon: "solution-crm-4",
    vung: ["dau-man", "than", "cot-phu"],
    dien_thoai: "một cột, nút dính đáy",
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
    vung: ["dau-man", "than", "cot-phu", "chan"],
    dien_thoai: "ngăn toàn màn",
  },
  "dong-tin": {
    ten: "Dòng tin",
    mat_do: "thuong",
    khoi_nguon: "solution-crm-5",
    vung: ["dau-man", "thanh-cong-cu", "than"],
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
