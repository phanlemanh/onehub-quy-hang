/**
 * Hồ sơ căn của lead (hàng 28, Hỏi-5): lead chưa có hồ sơ thì câu trả lời đầu tiên tạo hồ sơ qua đường tạo hàng từ lead
 * (`POST /api/v1/leads/<mã>/listing`), đúng một lần — lần ghi thứ hai trong lúc đang tạo chờ chung lời gọi ấy. 409 «lead
 * đã có hàng» thì đọc lại mã hồ sơ từ lead. Tạo lỗi thì trả lỗi, câu trả lời chưa ghi và lần sau thử lại.
 */
import type { Goi } from "@/lib/sync/types";

export type KetQuaHoSo = { ok: true; id: string; moi: boolean } | { ok: false; loi: string };

export function taoHoSoLead(goi: Goi, leadId: string, listingId: string | null) {
  let id = listingId;
  let dangBay: Promise<KetQuaHoSo> | null = null;
  const ma = encodeURIComponent(leadId);

  async function tao(): Promise<KetQuaHoSo> {
    try {
      const r = await goi("POST", `/api/v1/leads/${ma}/listing`);
      if (r.status === 201) {
        id = (r.body as { id: string }).id;
        return { ok: true, id, moi: true };
      }
      if (r.status === 409 && (r.body as { error?: string } | null)?.error === "lead-has-listing") {
        const l = await goi("GET", `/api/v1/leads/assigned/${ma}`);
        const co = l.status === 200 ? (l.body as { listingId?: string | null }).listingId : null;
        if (co) {
          id = co;
          return { ok: true, id, moi: false };
        }
      }
      return { ok: false, loi: "Chưa tạo được hồ sơ căn cho lead — câu trả lời chưa ghi, thử lại." };
    } catch {
      return { ok: false, loi: "Mất mạng — chưa tạo được hồ sơ căn, câu trả lời chưa ghi." };
    }
  }

  return {
    id: () => id,
    /** Mã hồ sơ của lead; chưa có thì tạo (một lần). */
    lay(): Promise<KetQuaHoSo> {
      if (id) return Promise.resolve({ ok: true, id, moi: false });
      dangBay ??= tao().finally(() => {
        dangBay = null;
      });
      return dangBay;
    },
  };
}
