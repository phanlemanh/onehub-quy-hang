// Mảnh dùng chung của hai thân hồ sơ căn (thân cột, thân điện thoại): mục có tiêu đề, cặp nhãn – giá trị, đổi URL tại chỗ.
import type { MouseEvent, ReactNode } from "react";

export const TIEU_MUC = "text-xs font-medium uppercase tracking-wide text-muted-foreground";

const hai = (n: number) => String(n).padStart(2, "0");
/** «02/10/2026». */
export const ngay = (iso: string) => {
  const d = new Date(iso);
  return `${hai(d.getDate())}/${hai(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/** Thuộc tính căn và phần lần rao là chữ khoá (KH-hs-khoa-thuoc-tinh): cặp nhãn – giá trị, không ô sửa. */
export function CapGiaTri({ ds, muc }: { ds: [string, string][]; muc?: string }) {
  return (
    <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm" data-muc={muc}>
      {ds.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Muc({ tieuDe, phai, id, muc, khoi, children }: { tieuDe: string; phai?: ReactNode; id?: string; muc?: string; khoi?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 p-4" aria-label={tieuDe} id={id} data-muc={muc} data-khoi={khoi}>
      <div className="flex min-h-8 items-center justify-between gap-2">
        <h3 className={TIEU_MUC}>{tieuDe}</h3>
        {phai}
      </div>
      {children}
    </section>
  );
}

/**
 * Đổi căn, lần rao, toà hay đóng cột chỉ đổi tham số URL — không điều hướng của Next (nó gọi máy chủ dựng lại trang, mất
 * mạng thì ra trang lỗi của trình duyệt). `useSearchParams` theo kịp `history.replaceState`.
 */
export const doiUrl = (href: string) => (e: MouseEvent) => {
  e.preventDefault();
  window.history.replaceState(null, "", href);
};
