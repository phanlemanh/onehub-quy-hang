"use client";

// Chụp ảnh khi đi xem nhà (hàng 41 chup-anh-dien-thoai, bản bấm được của bước thiết kế): nút «Chụp ảnh» trên ảnh lớn đầu
// hồ sơ điện thoại mở ngăn nổi từ đáy — chọn ngăn (Gửi được · Nội bộ), mở máy ảnh của máy, ảnh vừa chụp vào hàng chờ và tải
// ở nền. Danh sách ảnh chờ ghép theo ví dụ ReUI `c-progress-5` (Item + trạng thái). Nút chỉ có khi API ảnh cho sửa
// (`suaDuoc`, KH-hs-anh-noi-bo); ngăn Nội bộ chỉ có khi API trả `noiBo: "thay"` — màn không tự quyết quyền.
import { CHU_NOI_BO_KHOA, NHAN_NGAN, type Compartment } from "@quy-hang/core/photos";
import { Camera, CloudOff, Lock } from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";

import { NganNoi } from "@/components/bo-cuc/ngan-noi";
import { Badge } from "@/components/reui/badge";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { dongHoThat, taoNhip } from "@/lib/sync/mang";
import { NHAN_TRANG_THAI_CHO, taoHangCho, type AnhCho, type HangCho } from "../../photos/hang-cho-anh";
import { nguonApi } from "../../photos/nguon-api";
import { chuanBiTep } from "../../photos/tai-len";

let hang: HangCho | null = null;
/** Một hàng chờ cho cả trang: rời hồ sơ vẫn tải tiếp. */
function hangCho(): HangCho {
  if (hang) return hang;
  const h = taoHangCho({
    gui: ({ toa, ma, ngan, tep }) => nguonApi(toa, ma).them(tep, ngan),
    onLine: () => navigator.onLine,
    xem: (b) => URL.createObjectURL(b),
  });
  const nhip = taoNhip({ dongHo: dongHoThat, thu: h.day, coCho: () => h.anh().some((a) => a.trangThai === "cho-mang") });
  window.addEventListener("online", () => nhip.quayLaiTrang());
  hang = h;
  return h;
}

const KHONG: AnhCho[] = [];
function useHangCho(): AnhCho[] {
  return useSyncExternalStore(
    (f) => hangCho().subscribe(f),
    () => hangCho().anh(),
    () => KHONG,
  );
}

/** Số ảnh của căn vừa lên máy chủ từ hàng chờ — ảnh lớn đọc lại danh sách khi số này đổi. */
export function useSoDaTai(toa: string, ma: string | null): number {
  return useSyncExternalStore(
    (f) => hangCho().subscribe(f),
    () => (ma ? hangCho().soDaTai(toa, ma) : 0),
    () => 0,
  );
}

function useMatMang() {
  return useSyncExternalStore(
    (f) => {
      window.addEventListener("online", f);
      window.addEventListener("offline", f);
      return () => {
        window.removeEventListener("online", f);
        window.removeEventListener("offline", f);
      };
    },
    () => !navigator.onLine,
    () => false,
  );
}

const MAU_TRANG_THAI = { "cho-mang": "warning-light", "dang-tai": "info-light", "da-tai": "success-light", loi: "destructive-light" } as const;

export function ChupAnh({ toa, ma, thayNoiBo }: { toa: string; ma: string; thayNoiBo: boolean }) {
  const [mo, setMo] = useState(false);
  const [ngan, setNgan] = useState<Compartment>("shareable");
  const may = useRef<HTMLInputElement>(null);
  const matMang = useMatMang();
  const ds = useHangCho().filter((a) => a.toa === toa && a.ma === ma);
  const cho = ds.filter((a) => a.trangThai !== "da-tai").length;

  const nhan = async (files: File[]) => {
    for (const f of files) {
      const tep = await chuanBiTep(f);
      // Chụp ngay trong app: lúc chụp là lúc thêm trên máy — ảnh chờ mạng vẫn mang đúng ngày chụp.
      if (tep.ok) hangCho().them(toa, ma, ngan, { ...tep, takenAt: tep.takenAt ?? new Date().toISOString().slice(0, 10) });
    }
  };

  return (
    <>
      <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={() => setMo(true)} data-nut="chup-anh">
        <Camera />
        Chụp ảnh
        {cho ? <Badge size="sm" variant="warning">{cho}</Badge> : null}
      </Button>
      <NganNoi
        mo={mo}
        onMo={setMo}
        tieuDe={`Chụp ảnh · ${ma}`}
        moTa={toa}
        chan={
          <Button className="h-11 w-full" size="lg" onClick={() => may.current?.click()}>
            <Camera />
            Mở máy ảnh
          </Button>
        }
      >
        <div className="flex flex-col gap-4 px-4 pb-4" data-slot="khay-chup">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">Ảnh vào ngăn</span>
            <ToggleGroup value={[ngan]} onValueChange={(v) => v[0] && setNgan(v[0] as Compartment)} variant="outline" data-o="chon-ngan">
              <ToggleGroupItem value="shareable">{NHAN_NGAN.shareable}</ToggleGroupItem>
              {thayNoiBo ? (
                <ToggleGroupItem value="internal">
                  <Lock />
                  {NHAN_NGAN.internal}
                </ToggleGroupItem>
              ) : null}
            </ToggleGroup>
            <p className="text-xs text-muted-foreground">
              {ngan === "internal" ? `Sổ, hợp đồng, giấy tờ — ${CHU_NOI_BO_KHOA.toLowerCase()}.` : "Ảnh căn để gửi khách."}
            </p>
          </div>
          {matMang ? (
            <div className="contents" data-trang-thai="mat-mang">
              <TrangThai kind="notice" icon={CloudOff} title="Mất mạng" description="Ảnh chờ trên máy và tự tải lên khi có mạng." />
            </div>
          ) : null}
          {ds.length ? (
            <ItemGroup aria-label="Ảnh vừa chụp">
              {ds.map((a) => (
                <Item key={a.key} variant="outline" size="sm" data-cho={a.trangThai}>
                  <ItemMedia variant="image">
                    {/* eslint-disable-next-line @next/next/no-img-element -- bản nhẹ trên máy (blob), chưa có trên máy chủ */}
                    <img src={a.xem} alt={`Ảnh ${NHAN_NGAN[a.ngan]}`} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      {a.ngan === "internal" ? <Lock aria-hidden="true" className="size-3.5" /> : null}
                      {NHAN_NGAN[a.ngan]}
                    </ItemTitle>
                    <ItemDescription>
                      <Badge size="sm" variant={MAU_TRANG_THAI[a.trangThai]}>
                        {NHAN_TRANG_THAI_CHO[a.trangThai]}
                      </Badge>
                    </ItemDescription>
                  </ItemContent>
                  {a.trangThai === "loi" ? (
                    <ItemActions>
                      <Button size="sm" variant="outline" onClick={() => hangCho().thuLai(a.key)}>
                        Thử lại
                      </Button>
                    </ItemActions>
                  ) : null}
                </Item>
              ))}
            </ItemGroup>
          ) : (
            <p className="text-sm text-muted-foreground">Chưa chụp ảnh nào cho căn này.</p>
          )}
          <Input
            ref={may}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            hidden
            data-o="may-anh"
            onChange={(e) => {
              void nhan(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
        </div>
      </NganNoi>
    </>
  );
}
