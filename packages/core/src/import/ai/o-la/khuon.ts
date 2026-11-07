/** Khuôn đầu ra của Claude cho ô lạ (structured outputs). Khuôn ép HÌNH; `kiemDeXuatOLa` kiểm NGHĨA. */
export const KHUON_O_LA = {
  type: "object",
  additionalProperties: false,
  required: ["de_xuat"],
  properties: {
    de_xuat: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "gia_tri", "ly_do"],
        properties: {
          id: { type: "string", description: "Mã ô trong gói (trường id)." },
          gia_tri: { type: "string", description: "Chữ thay thế mà đầu chủ lẽ ra gõ vào ô, theo cách viết của cột." },
          ly_do: { type: "string", description: "Một câu tiếng Việt cho đầu chủ: vì sao đề xuất chữ ấy." },
        },
      },
    },
  },
} as const;
