"use client";

// Ảnh lớn đầu hồ sơ căn trên điện thoại — lối ReUI `product-detail-5`, dùng lại bản của trang khách (`app/s/[code]/chi-tiet.tsx`):
// mỗi lúc một ảnh kín bề ngang, lướt ngang bằng cuộn có điểm dừng. Danh sách đọc đúng đường của mục Ảnh (`units/photos/`,
// `nguonApi` — API quyết ngăn nào trả, KH-hs-anh-noi-bo); ảnh Nội bộ chỉ trình khi cờ của lõi cho (`lopPhuHoSo().noiBo`)
// và API đã trả ngăn ấy.
import type { CoHoSo } from "@quy-hang/core/access";
import { nhanAnh, sapXep, type UnitPhoto } from "@quy-hang/core/photos";
import { ImageIcon, Lock } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/reui/badge";
import type { DanhSachAnh } from "../../photos/muc-anh";
import { nguonApi } from "../../photos/nguon-api";

export type TrangThaiAnh = { kind: "dang-tai" } | { kind: "loi"; matMang: boolean } | { kind: "co"; ds: DanhSachAnh } | { kind: "chua-ma" };

export const CHU_CHUA_ANH = "Chưa có ảnh";

/** Ảnh trình ở khung lớn: ngăn Gửi được (ảnh bìa đầu), rồi Nội bộ khi cờ và API cùng cho. */
export function anhKhungLon(ds: DanhSachAnh, co: Pick<CoHoSo, "noiBo">): UnitPhoto[] {
  const gui = sapXep(ds.anh, "shareable");
  return co.noiBo && ds.noiBo === "thay" ? [...gui, ...sapXep(ds.anh, "internal")] : gui;
}

function KhungTrong({ chu }: { chu: string }) {
  return (
    <div className="flex aspect-[4/3] w-full shrink-0 flex-col items-center justify-center gap-1 rounded-lg bg-muted" data-anh="trong">
      <ImageIcon aria-hidden="true" className="size-6 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{chu}</span>
    </div>
  );
}

export function AnhLon({ anh, co, urlAnh }: { anh: TrangThaiAnh; co: Pick<CoHoSo, "noiBo">; urlAnh: (id: string) => string }) {
  const ds = anh.kind === "co" ? anhKhungLon(anh.ds, co) : [];
  const trong =
    anh.kind === "dang-tai"
      ? "Đang tải ảnh…"
      : anh.kind === "loi"
        ? anh.matMang
          ? "Ảnh cần mạng để tải"
          : "Không tải được ảnh"
        : anh.kind === "chua-ma"
          ? "Gắn mã căn rồi tải ảnh"
          : CHU_CHUA_ANH;
  return (
    <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto" aria-label="Ảnh căn, lướt ngang" data-khoi="anh">
      {ds.length ? (
        ds.map((p, i) => (
          <figure key={p.id} className="relative aspect-[4/3] w-full shrink-0 snap-center overflow-hidden rounded-lg bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- byte qua API ảnh (kiểm quyền rồi trả byte), không qua bộ tối ưu ảnh của Next */}
            <img src={urlAnh(p.id)} alt={nhanAnh(p)} className="size-full object-cover" />
            <figcaption className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
              {p.compartment === "internal" ? (
                <Badge variant="secondary">
                  <Lock aria-hidden="true" />
                  Nội bộ
                </Badge>
              ) : (
                <span />
              )}
              <Badge variant="secondary">
                {i + 1}/{ds.length}
              </Badge>
            </figcaption>
          </figure>
        ))
      ) : (
        <KhungTrong chu={trong} />
      )}
    </div>
  );
}

/** Danh sách ảnh của căn, đọc khi mở hồ sơ, đổi căn hay có ảnh chụp vừa tải lên — cùng đường API của mục Ảnh. */
export function useAnhCan(toa: string, ma: string | null, lanTai = 0): TrangThaiAnh {
  const [kq, setKq] = useState<{ khoa: string; anh: TrangThaiAnh } | null>(null);
  const khoa = `${toa}|${ma ?? ""}`;
  useEffect(() => {
    if (!ma) return;
    let huy = false;
    nguonApi(toa, ma)
      .danhSach()
      .then(
        (ds) => !huy && setKq({ khoa, anh: { kind: "co", ds } }),
        () => !huy && setKq({ khoa, anh: { kind: "loi", matMang: !navigator.onLine } }),
      );
    return () => {
      huy = true;
    };
    // lanTai: ảnh vừa chụp lên máy chủ (hàng 41) — đọc lại để khung lớn có ảnh mới, giữ bản cũ tới khi có bản mới.
  }, [toa, ma, khoa, lanTai]);
  if (!ma) return { kind: "chua-ma" };
  return kq?.khoa === khoa ? kq.anh : { kind: "dang-tai" };
}
