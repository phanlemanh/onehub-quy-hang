/**
 * Khuôn đầu ra của Claude (structured outputs, `output_config.format`) — đề xuất cho các cột chưa ghép. Khuôn ép HÌNH
 * của câu trả lời; `kiemDeXuat` vẫn kiểm NGHĨA (cột có được hỏi không, quy đổi có đúng giá trị đã gửi không…).
 */
import { STANDARD_FIELDS } from "../fields";
import { AREA_KINDS, DATE_ORDERS, PRICE_UNITS, TRANSFORM_NAMES } from "../transforms";

export const DICH_DE_XUAT = [...STANDARD_FIELDS, "keep_as_note"] as const;

export const KHUON_DE_XUAT = {
  type: "object",
  additionalProperties: false,
  required: ["de_xuat"],
  properties: {
    de_xuat: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["cot", "dich", "ly_do"],
        properties: {
          cot: { type: "integer", description: "Chỉ số cột trong gói (trường cot), chỉ cột chưa có dich." },
          dich: { type: "string", enum: [...DICH_DE_XUAT] },
          phep: {
            type: "object",
            additionalProperties: false,
            required: ["name"],
            properties: {
              name: { type: "string", enum: [...TRANSFORM_NAMES] },
              unit: { type: "string", enum: [...PRICE_UNITS] },
              order: { type: "string", enum: [...DATE_ORDERS] },
              kind: { type: "string", enum: [...AREA_KINDS] },
            },
          },
          quy_doi: {
            type: "array",
            description: "Giá trị nguyên văn (lấy đúng từ giaTri của cột) → giá trị chuẩn.",
            items: { type: "object", additionalProperties: false, required: ["tu", "den"], properties: { tu: { type: "string" }, den: { type: "string" } } },
          },
          ly_do: { type: "string", description: "Một câu tiếng Việt cho Đầu chủ: vì sao cột này là trường ấy." },
        },
      },
    },
  },
} as const;
