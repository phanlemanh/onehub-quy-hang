/**
 * Trang khách (hàng 34, xem trước; hàng 35 dựng `/s/<mã>` trên cùng thành phần) — dựng CHỈ từ bản ra (`CanRaNgoai` của
 * `banRaNgoai`), không nhận hàng nội bộ: kiểu của prop là chốt bất biến 4. Họ card như mọi trang khách.
 */
import type { CanRaNgoai, NguoiNhan } from "@quy-hang/core/redaction";
import { giaTin, tenCanRa, thongSoRa } from "@quy-hang/core/sharing";
import { ImageIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PHI: Readonly<Record<string, string>> = { included: "Bao phí", excluded: "Không bao phí" };

/** Đường ảnh của một ảnh bản ra — xem trước đi qua API có kiểm quyền; trang công khai (hàng 35) truyền đường của nó. */
export type DuongAnh = (id: string) => string;

export function TrangKhach({ ban, nguoiNhan, duongAnh }: { ban: readonly CanRaNgoai[]; nguoiNhan: NguoiNhan; duongAnh?: DuongAnh }) {
  const dau = ban[0];
  const tu = [dau?.companyName, dau?.senderName].filter(Boolean).join(" · ");
  return (
    <div className="flex flex-col gap-4" data-trang-khach={nguoiNhan}>
      <div className="flex flex-col gap-1">
        {tu ? <p className="text-muted-foreground text-xs">{tu} gửi</p> : null}
        <h2 className="text-foreground text-lg font-semibold tracking-tight">{ban.length} căn đang bán</h2>
      </div>
      {ban.map((b, i) => {
        const bia = b.photos?.[0];
        return (
          <Card key={i} size="sm">
            <CardContent>
              <div className="bg-muted relative aspect-video overflow-hidden rounded-md">
                {bia && duongAnh ? (
                  // eslint-disable-next-line @next/next/no-img-element -- byte qua API có kiểm quyền, không qua bộ tối ưu ảnh của Next
                  <img src={duongAnh(bia.id)} alt={bia.label} loading="lazy" className="absolute inset-0 size-full object-cover" />
                ) : (
                  <ImageIcon aria-hidden="true" className="text-muted-foreground absolute inset-0 m-auto size-6" />
                )}
              </div>
            </CardContent>
            <CardHeader>
              <CardTitle>{tenCanRa(b)}</CardTitle>
              <CardDescription>{thongSoRa(b)}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-baseline justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-foreground text-base font-semibold tabular-nums">{giaTin(b.listPrice)}</span>
                {b.feeInclusion ? <span className="text-muted-foreground text-xs">{PHI[b.feeInclusion] ?? b.feeInclusion}</span> : null}
              </div>
              {b.confirmedAgeDays != null ? (
                <span className="text-muted-foreground text-xs">Giá xác nhận {b.confirmedAgeDays === 0 ? "hôm nay" : `${b.confirmedAgeDays} ngày trước`}</span>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
