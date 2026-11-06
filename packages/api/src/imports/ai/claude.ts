import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { bamGoi, bamJson, KHUON_DE_XUAT, KHUON_O_LA, LOI_NHAC, LOI_NHAC_O_LA, MO_HINH_O_LA, type GoiDeXuat, type GoiOLa } from "@quy-hang/core/import";

/**
 * Khách gọi Claude cho đường đề xuất (hàng 68, ADR-0011 quyết định 3–5). Gọi Messages API bằng `fetch` — không thêm gói
 * SDK (package-lock nằm ngoài ranh giới của hàng; dòng sổ S1). Một lần gọi, đầu ra theo khuôn JSON, lời nhắc cố định có
 * đệm, `fallbacks: "default"`. Khoá đọc từ `ANTHROPIC_API_KEY`; vắng khoá → không có khách (đường đề xuất trả tất định).
 * Khách tiêm được qua `ApiDeps.khachAi` — mọi test dùng khách giả, không gọi mạng.
 */
export const MO_HINH = "claude-opus-5-5";
export const TRAN_MS = 240_000;
/** Mô hình của đường ô lạ (hàng 69, Hỏi-1): Opus 5.5 tới khi phiên nghiệm thu có số qua API cho Haiku 5.5. */
export { MO_HINH_O_LA };

export type DungLuong = { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number };
export type TraLoiAi = { json: unknown; model: string; usage: DungLuong };
/** Ném `LoiAi` cho lỗi đã phân loại; lỗi khác coi là lỗi nhà cung cấp. */
export type KhachAi = (goi: GoiDeXuat, tin: AbortSignal) => Promise<TraLoiAi>;
/** Khách của đường ô lạ (hàng 69) — cùng luật ném lỗi. */
export type KhachOLa = (goi: GoiOLa, tin: AbortSignal) => Promise<TraLoiAi>;

export class LoiAi extends Error {
  constructor(
    readonly loai: "provider_error" | "invalid_output",
    message: string,
    readonly usage?: DungLuong,
    readonly model?: string,
  ) {
    super(message);
  }
}

type YeuCau = { model: string; schema: unknown; system: string; noiDung: unknown };

/** Một lần gọi Messages API: đầu ra theo khuôn JSON, lời nhắc cố định có đệm, `fallbacks: "default"`. */
async function goiClaude(khoa: string, f: typeof fetch, y: YeuCau, tin: AbortSignal): Promise<TraLoiAi> {
  const res = await f("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: tin,
    headers: {
      "x-api-key": khoa,
      "anthropic-version": "2026-10-21",
      "anthropic-beta": "server-side-fallback-2026-07-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: y.model,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium", format: { type: "json_schema", schema: y.schema } },
      fallbacks: "default",
      system: [{ type: "text", text: y.system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: JSON.stringify(y.noiDung) }],
    }),
  });
  if (!res.ok) throw new LoiAi("provider_error", `Claude ${res.status}`);
  const m = (await res.json()) as { model?: string; stop_reason?: string; usage?: DungLuong; content?: { type: string; text?: string }[] };
  const usage = m.usage ?? { input_tokens: 0, output_tokens: 0 };
  const model = m.model ?? y.model;
  if (m.stop_reason === "refusal") throw new LoiAi("provider_error", "Claude từ chối", usage, model);
  const text = m.content?.find((b) => b.type === "text")?.text;
  try {
    return { json: JSON.parse(text ?? ""), model, usage };
  } catch {
    throw new LoiAi("invalid_output", "đầu ra không phải JSON", usage, model);
  }
}

export function khachClaude(env: NodeJS.ProcessEnv = process.env, f: typeof fetch = fetch): KhachAi | null {
  const khoa = env.ANTHROPIC_API_KEY;
  if (!khoa) return null;
  return (goi, tin) => goiClaude(khoa, f, { model: MO_HINH, schema: KHUON_DE_XUAT, system: LOI_NHAC, noiDung: goi }, tin);
}

export function khachOLaClaude(env: NodeJS.ProcessEnv = process.env, f: typeof fetch = fetch): KhachOLa | null {
  const khoa = env.ANTHROPIC_API_KEY;
  if (!khoa) return null;
  return (goi, tin) => goiClaude(khoa, f, { model: MO_HINH_O_LA, schema: KHUON_O_LA, system: LOI_NHAC_O_LA, noiDung: goi }, tin);
}

/**
 * Khách giả cho chỗ thử trên máy dev (ba ca nhìn màn của hàng 68): đọc đề xuất ghi sẵn trong thư mục `QH_AI_GIA` — tệp
 * `<băm gói>.json`, không có thì tệp mang đúng bộ tiêu đề của gói (tệp xlsx đọc ở trình duyệt có thể khác kiểu ô với lưới
 * dựng trong bộ thử). Chỉ bật khi `QH_AI_GIA` có VÀ `NODE_ENV` khác `production` — bản thật không bao giờ trả đề xuất ghi
 * sẵn. Tệp cờ trong thư mục: `.loi` → ném lỗi nhà cung cấp (ca «AI lỗi»), `.cham` (số mili giây) → chờ rồi mới trả.
 */
export function khachGia(env: NodeJS.ProcessEnv = process.env): KhachAi | null {
  const thuMuc = env.QH_AI_GIA;
  if (!thuMuc || env.NODE_ENV === "production") return null;
  return async (goi, tin) => {
    const cham = await readFile(join(thuMuc, ".cham"), "utf8").then(Number).catch(() => 0);
    if (cham > 0) await new Promise((r, j) => { const h = setTimeout(r, cham); tin.addEventListener("abort", () => (clearTimeout(h), j(tin.reason))); });
    if (await readFile(join(thuMuc, ".loi")).then(() => true, () => false)) throw new LoiAi("provider_error", "khách giả ở chế độ lỗi");
    const tieuDe = JSON.stringify(goi.cot.map((c) => c.tieuDe));
    let tep: { dauRa: unknown; tieuDe?: string[] } | null = await readFile(join(thuMuc, `${await bamGoi(goi)}.json`), "utf8").then(JSON.parse, () => null);
    if (!tep)
      for (const f of (await readdir(thuMuc)).filter((x) => x.endsWith(".json"))) {
        const t = JSON.parse(await readFile(join(thuMuc, f), "utf8")) as { dauRa: unknown; tieuDe?: string[] };
        if (JSON.stringify(t.tieuDe) === tieuDe) tep = t;
      }
    if (!tep) throw new LoiAi("provider_error", "khách giả không có đề xuất cho gói này");
    return { json: tep.dauRa, model: `${MO_HINH} (ghi sẵn)`, usage: { input_tokens: 0, output_tokens: 0 } };
  };
}

/** Khách mặc định khi `deps` không tiêm: khách giả của chỗ thử (dev) rồi tới Claude thật; không có gì → null. */
export const khachMacDinh = (env: NodeJS.ProcessEnv = process.env): KhachAi | null => khachGia(env) ?? khachClaude(env);

/**
 * Khách giả của đường ô lạ cho chỗ thử trên máy dev (hàng 69): đọc `QH_AI_GIA/o-la/<băm gói>.json` (khoá `dauRa`), không có
 * thì tệp đầu tiên trong thư mục ấy có khoá `theoChu` — bảng chữ ô → đề xuất, dựng đầu ra cho đúng các ô của gói. Cùng tệp
 * cờ `.loi`, `.cham` với khách giả của đề xuất cột. Không bao giờ bật ở `production`.
 */
export function khachOLaGia(env: NodeJS.ProcessEnv = process.env): KhachOLa | null {
  const thuMuc = env.QH_AI_GIA;
  if (!thuMuc || env.NODE_ENV === "production") return null;
  return async (goi, tin) => {
    const cham = await readFile(join(thuMuc, ".cham"), "utf8").then(Number).catch(() => 0);
    if (cham > 0) await new Promise((r, j) => { const h = setTimeout(r, cham); tin.addEventListener("abort", () => (clearTimeout(h), j(tin.reason))); });
    if (await readFile(join(thuMuc, ".loi")).then(() => true, () => false)) throw new LoiAi("provider_error", "khách giả ở chế độ lỗi");
    const tm = join(thuMuc, "o-la");
    const tep = await readFile(join(tm, `${await bamJson(goi)}.json`), "utf8").then(JSON.parse, () => null);
    if (tep) return { json: tep.dauRa, model: `${MO_HINH_O_LA} (ghi sẵn)`, usage: { input_tokens: 0, output_tokens: 0 } };
    for (const f of (await readdir(tm).catch(() => [])).filter((x) => x.endsWith(".json"))) {
      const t = JSON.parse(await readFile(join(tm, f), "utf8")) as { theoChu?: Record<string, { gia_tri: string; ly_do: string }> };
      if (!t.theoChu) continue;
      const de_xuat = goi.o.filter((o) => Object.hasOwn(t.theoChu!, o.giaTri)).map((o) => ({ id: o.id, ...t.theoChu![o.giaTri]! }));
      return { json: { de_xuat }, model: `${MO_HINH_O_LA} (ghi sẵn)`, usage: { input_tokens: 0, output_tokens: 0 } };
    }
    throw new LoiAi("provider_error", "khách giả không có đề xuất cho gói ô lạ này");
  };
}

export const khachOLaMacDinh = (env: NodeJS.ProcessEnv = process.env): KhachOLa | null => khachOLaGia(env) ?? khachOLaClaude(env);
