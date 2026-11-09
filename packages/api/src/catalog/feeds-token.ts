import { parseCatalogFeed, type CatalogFeedError } from "@quy-hang/connect";
import { mayFlow } from "@quy-hang/core";
import type { Context } from "hono";
import type pg from "pg";
import type { ApiDeps } from "../app";
import { traToken, type TokenDaTra } from "../auth/token-may";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { demGoi, ghiGoi, toAgreement, type AgreementRow, type FeedHooks } from "./feeds-ghi";

/**
 * Đường token của cửa nhận danh mục (hàng 96, thiết kế §5). Sàn và thoả thuận lấy từ token, không từ cookie. Một giao dịch
 * gồm khoá dòng token, kiểm thoả thuận, ghi gói và dòng nhật ký `accepted`: ghi nhật ký lỗi thì gói không vào. Lời từ chối
 * và lỗi giữa chừng ghi nhật ký ở giao dịch riêng sau khi hoàn tác, vì dòng trong giao dịch bị hoàn tác sẽ mất. Token rõ và
 * băm không vào nhật ký, không vào `console`.
 */
const ROUTE = "/api/v1/catalog/feeds";

export type Outcome = "accepted" | "invalid_payload" | "wrong_connection" | "agreement_inactive" | "token_revoked" | "server_error";

/** Ném ra khỏi giao dịch để hoàn tác, rồi ghi một dòng nhật ký và trả mã lỗi của API. */
class TuChoi extends Error {
  constructor(
    readonly entry: ApiErrorEntry,
    readonly outcome: Outcome,
    readonly errors?: CatalogFeedError[],
  ) {
    super(entry.code);
  }
}

const THAN_KHONG_PHAI_JSON: CatalogFeedError = { path: [], message: "Thân gói không phải JSON." };

const maLoi = (e: unknown) => String((e as { code?: unknown }).code ?? "khong-ma");

async function chenNhatKy(tx: pg.PoolClient, t: TokenDaTra, status: number, outcome: Outcome) {
  await tx.query(
    `insert into machine_token_calls (company_id, token_id, agreement_id, method, route, http_status, outcome)
     values (app.current_company_id(), $1, $2, 'POST', $3, $4, $5)`,
    [t.tokenId, t.agreementId, ROUTE, status, outcome],
  );
}

/** Token do thoả thuận kết thúc mà thu hồi, và thoả thuận vẫn đang `ended`: máy bên kia cần biết thoả thuận đã tắt (AC-6). */
async function doThoaThuanKetThuc(pool: pg.Pool, t: TokenDaTra): Promise<boolean> {
  return withCompany(pool, { userId: "", companyId: t.companyId }, async (tx) => {
    const { rowCount } = await tx.query(
      `select 1 from machine_tokens m
         join agreements a on a.id = m.agreement_id and a.company_id = m.company_id
        where m.id = $1 and m.revoked_by = 'system:agreement-ended' and a.status = 'ended'`,
      [t.tokenId],
    );
    return (rowCount ?? 0) > 0;
  });
}

export async function nhanBangToken(c: Context, token: string, { appPool }: ApiDeps, hooks: FeedHooks): Promise<Response> {
  const ctxLoi = (l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 403);
  const tokenHong = () => {
    c.header("WWW-Authenticate", 'Bearer error="invalid_token"');
    return ctxLoi(API_ERRORS.invalidMachineToken);
  };
  const baoLoi = (e: unknown) => {
    console.error("token máy: lỗi khi nhận gói", maLoi(e));
    return ctxLoi(API_ERRORS.internalError);
  };
  /** Ghi nhật ký của lời từ chối hay lỗi; ghi lỗi thì vẫn trả mã từ chối. */
  const ghiRieng = async (t: TokenDaTra, status: number, outcome: Outcome) => {
    try {
      await hooks.truocGhiNhatKy?.(outcome);
      await withCompany(appPool, { userId: "", companyId: t.companyId }, (tx) => chenNhatKy(tx, t, status, outcome));
    } catch (e) {
      console.error("token máy: không ghi được nhật ký từ chối", maLoi(e));
    }
  };

  let t: TokenDaTra | null = null;
  try {
    t = await traToken(appPool, token);
    if (!t) return tokenHong();
    await hooks.sauKhiTraToken?.();
    if (t.revoked) {
      if (await doThoaThuanKetThuc(appPool, t)) {
        await ghiRieng(t, API_ERRORS.agreementInactive.status, "agreement_inactive");
        return ctxLoi(API_ERRORS.agreementInactive);
      }
      await ghiRieng(t, API_ERRORS.invalidMachineToken.status, "token_revoked");
      return tokenHong();
    }
  } catch (e) {
    // Đã nhận ra token thì lỗi giữa chừng cũng có một dòng; chưa nhận ra thì không biết của sàn nào.
    if (t) await ghiRieng(t, API_ERRORS.internalError.status, "server_error");
    return baoLoi(e);
  }
  const daTra = t;

  // Đọc thân ngoài giao dịch, giữ kết quả: sai khuôn chỉ được trả sau khi đã kiểm phạm vi và thoả thuận.
  let raw: unknown;
  let thanHong = false;
  try {
    raw = await c.req.json();
  } catch {
    thanHong = true;
  }
  const parsed = thanHong ? { ok: false as const, errors: [THAN_KHONG_PHAI_JSON] } : parseCatalogFeed(raw);

  try {
    const { feed, ketQua } = await withCompany(appPool, { userId: "", companyId: daTra.companyId }, async (tx) => {
      // Khoá dòng: thu hồi phải chờ lần ghi đang chạy xong, lời kế nhận 401. 0 dòng là token vừa bị thu hồi sau bước tra.
      const khoa = await tx.query("select 1 from machine_tokens where id = $1 and revoked_at is null for share", [daTra.tokenId]);
      if ((khoa.rowCount ?? 0) === 0) throw new TuChoi(API_ERRORS.invalidMachineToken, "token_revoked");

      const at = (await tx.query<{ now: Date }>("select now() as now")).rows[0]!.now;
      // Luật theo dòng cho bên kia đọc thoả thuận hợp tác: lọc `company_id` để chỉ thấy thoả thuận của chính sàn trên token.
      const { rows } = await tx.query<AgreementRow>(
        `select id, company_id, kind, direction, counterparty, data_classes, valid_from, valid_until, status, approved_by,
                special_terms
         from agreements where id = $1 and company_id = app.current_company_id()`,
        [daTra.agreementId],
      );
      const dong = rows[0];
      if (!dong) throw new TuChoi(API_ERRORS.agreementInactive, "agreement_inactive");
      const a = toAgreement(dong);
      if (a.kind !== "catalog_source" || a.direction !== "inbound") throw new TuChoi(API_ERRORS.tokenScope, "wrong_connection");

      const duocTin = (
        await tx.query<{ t: boolean }>(
          "select exists (select 1 from catalog_trusted_companies where company_id = app.current_company_id()) as t",
        )
      ).rows[0]?.t;
      if (!duocTin || !mayFlow(a, "catalog", { at, kind: "catalog_source", direction: "inbound" }).ok) {
        throw new TuChoi(API_ERRORS.agreementInactive, "agreement_inactive");
      }
      if (!parsed.ok) throw new TuChoi(API_ERRORS.invalidFeed, "invalid_payload", parsed.errors);

      await hooks.truocKhiGhi?.();
      const ketQua = await ghiGoi(tx, parsed.feed, a.id);
      await hooks.truocGhiNhatKy?.("accepted");
      await chenNhatKy(tx, daTra, 200, "accepted");
      return { feed: parsed.feed, ketQua };
    });
    return c.json({ ...demGoi(feed), ...ketQua }, 200);
  } catch (e) {
    if (e instanceof TuChoi) {
      await ghiRieng(daTra, e.entry.status, e.outcome);
      if (e.outcome === "token_revoked") return tokenHong();
      if (e.errors) return c.json({ error: e.entry.code, errors: e.errors }, e.entry.status as 422);
      return ctxLoi(e.entry);
    }
    // Luật theo dòng từ chối câu ghi: thoả thuận hết hiệu lực giữa lúc kiểm và lúc ghi.
    if ((e as { code?: string }).code === "42501") {
      await ghiRieng(daTra, API_ERRORS.agreementInactive.status, "agreement_inactive");
      return ctxLoi(API_ERRORS.agreementInactive);
    }
    await ghiRieng(daTra, API_ERRORS.internalError.status, "server_error");
    return baoLoi(e);
  }
}
