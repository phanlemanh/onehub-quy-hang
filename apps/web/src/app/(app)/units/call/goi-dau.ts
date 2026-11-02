/**
 * Mốc gọi đầu trong chế độ cuộc gọi (hàng 28, Hỏi-6): nút «Đã gọi» (phím G) hay câu trả lời đầu tiên ở danh sách hỏi ghi
 * mốc đúng một lần — lead đã có mốc thì không gọi lại, hai lần liền nhau dùng chung một lời gọi đang bay. Máy chủ trả 409
 * thì giữ nấc cũ và nói lý do bằng chữ.
 */
import type { Goi } from "@/lib/sync/types";
import { chuLoiLead } from "../../today/ly-do";

export type KetQuaGoiDau = { ok: true; daGhi: boolean } | { ok: false; loi: string };

/** Lead đã có mốc gọi đầu: nấc Đã gọi hay Lên bảng. */
export const daCoMocGoiDau = (stage: string) => stage === "called" || stage === "on_board";

export function taoMocGoiDau(goi: Goi, leadId: string, daCo: boolean) {
  let co = daCo;
  let dangBay: Promise<KetQuaGoiDau> | null = null;

  async function ghi(): Promise<KetQuaGoiDau> {
    try {
      const r = await goi("POST", `/api/v1/leads/${encodeURIComponent(leadId)}/first-call`);
      if (r.status === 200) {
        co = true;
        return { ok: true, daGhi: true };
      }
      const ma = (r.body as { error?: string } | null)?.error ?? null;
      if (r.status === 409) return { ok: false, loi: chuLoiLead(ma) };
      if (r.status === 404) return { ok: false, loi: "Không còn thấy lead này." };
      if (r.status === 401) return { ok: false, loi: "Hết phiên đăng nhập — đăng nhập lại rồi thử." };
      return { ok: false, loi: "Chưa ghi được mốc gọi — thử lại." };
    } catch {
      return { ok: false, loi: "Mất mạng — chưa ghi được mốc gọi, thử lại khi có mạng." };
    }
  }

  return {
    daCo: () => co,
    /** Ghi mốc khi lead chưa có; đã có thì không gọi gì. */
    ghiNeuChua(): Promise<KetQuaGoiDau> {
      if (co) return Promise.resolve({ ok: true, daGhi: false });
      dangBay ??= ghi().finally(() => {
        dangBay = null;
      });
      return dangBay;
    },
  };
}
