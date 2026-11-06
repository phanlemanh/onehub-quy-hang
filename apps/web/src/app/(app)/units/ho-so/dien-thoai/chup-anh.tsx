"use client";

// Chụp ảnh khi đi xem nhà (hàng 41 chup-anh-dien-thoai): nút «Chụp ảnh» trên ảnh lớn đầu hồ sơ điện thoại mở ngăn nổi từ
// đáy — chọn ngăn (Gửi được · Nội bộ), mở máy ảnh của máy, ảnh vừa chụp vào hàng chờ của cả app và tải ở nền. Ngăn KHÔNG
// đặt mặc định (Cổng Phạm vi 06/11, Hỏi-2 b): «Mở máy ảnh» chỉ bật sau khi người chạm chọn ngăn, để ảnh sổ không tự tải vào
// Gửi được vì quên chọn. Danh sách ảnh chờ ghép theo ví dụ ReUI `c-progress-5` (Item + trạng thái). Nút chỉ có khi API ảnh
// cho sửa (`suaDuoc`, KH-hs-anh-noi-bo); ngăn Nội bộ chỉ có khi API trả `noiBo: "thay"` — màn không tự quyết quyền.
import { CHU_NOI_BO_KHOA, NHAN_NGAN, type Compartment } from "@quy-hang/core/photos";
import { Camera, CloudOff, Lock } from "lucide-react";
import { useReducer, useRef, useState, useSyncExternalStore } from "react";

import { NganNoi } from "@/components/bo-cuc/ngan-noi";
import { Badge } from "@/components/reui/badge";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { doiNgan, nhanAnhChup, NHAN_TRANG_THAI_CHO, type AnhCho, type KetQuaChup } from "../../photos/hang-cho-anh";
import { hangChoHienTai, useHangCho, useTinhHangCho } from "../../photos/hang-cho-may";
import { chuanBiTep } from "../../photos/tai-len";

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

export const CHU_CHON_NGAN = "Chọn ngăn trước khi chụp.";
/** Không có hàng chờ (vừa thử đăng xuất mà chưa xong): ảnh không được nhận, nói rõ thay vì bỏ im lặng (AC-3). */
export const CHU_KHONG_HANG_CHO = "Chưa nhận ảnh — tải lại trang rồi chụp lại";

/** Kết quả nhận một lượt tệp máy ảnh trả khi không có hàng chờ: mọi tệp báo lý do, không tệp nào bị bỏ im lặng. */
export const khongNhanTep = (files: readonly File[]): KetQuaChup[] => files.map((f) => ({ ten: f.name, loi: CHU_KHONG_HANG_CHO }));

/** Nút «Chụp ảnh» trên ảnh lớn — mang số ảnh của căn chưa lên máy chủ. */
export function NutChup({ cho, onMo }: { cho: number; onMo: () => void }) {
  return (
    <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={onMo} data-nut="chup-anh">
      <Camera />
      Chụp ảnh
      {cho ? <Badge size="sm" variant="warning">{cho}</Badge> : null}
    </Button>
  );
}

/** Thân ngăn chụp: chọn ngăn, báo mất mạng, ảnh vừa chụp của căn kèm trạng thái, tệp không nhận. */
export function KhayChup(o: {
  ngan: Compartment | null;
  thayNoiBo: boolean;
  matMang: boolean;
  /** Kho trên máy không giữ được ảnh (AC-4): ảnh chờ chỉ còn trong bộ nhớ. */
  khoLoi?: boolean;
  ds: readonly AnhCho[];
  hong: readonly KetQuaChup[];
  onChon: (n: Compartment) => void;
  onThuLai: (key: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4" data-slot="khay-chup">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Ảnh vào ngăn</span>
        <ToggleGroup value={o.ngan ? [o.ngan] : []} onValueChange={(v) => v[0] && o.onChon(v[0] as Compartment)} variant="outline" data-o="chon-ngan" data-ngan={o.ngan ?? "chua-chon"}>
          <ToggleGroupItem value="shareable">{NHAN_NGAN.shareable}</ToggleGroupItem>
          {o.thayNoiBo ? (
            <ToggleGroupItem value="internal">
              <Lock />
              {NHAN_NGAN.internal}
            </ToggleGroupItem>
          ) : null}
        </ToggleGroup>
        <p className="text-xs text-muted-foreground">
          {o.ngan === "internal" ? `Sổ, hợp đồng, giấy tờ — ${CHU_NOI_BO_KHOA.toLowerCase()}.` : o.ngan === "shareable" ? "Ảnh căn để gửi khách." : CHU_CHON_NGAN}
        </p>
      </div>
      {o.matMang ? (
        <div className="contents" data-trang-thai="mat-mang">
          <TrangThai kind="notice" icon={CloudOff} title="Mất mạng" description="Ảnh chờ trên máy và tự tải lên khi có mạng." />
        </div>
      ) : null}
      {o.khoLoi ? (
        <div className="contents" data-trang-thai="kho-loi">
          <TrangThai kind="error" title="Máy không giữ được ảnh chờ" description="Giữ app mở tới khi ảnh tải xong — đóng app lúc này là mất ảnh chưa tải." />
        </div>
      ) : null}
      {o.hong.length ? (
        <ul className="flex flex-col gap-1 text-xs text-destructive" aria-label="Tệp không nhận" data-o="tep-hong">
          {o.hong.map((h, i) => (
            <li key={`${h.ten}-${i}`}>
              {h.ten} — {h.loi}
            </li>
          ))}
        </ul>
      ) : null}
      {o.ds.length ? (
        <ItemGroup aria-label="Ảnh vừa chụp">
          {o.ds.map((a) => (
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
                  <Button size="sm" variant="outline" onClick={() => o.onThuLai(a.key)}>
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
    </div>
  );
}

/** Nút chân ngăn: tắt tới khi người chọn ngăn (Hỏi-2 b). */
export function NutMoMay({ ngan, onMo }: { ngan: Compartment | null; onMo: () => void }) {
  return (
    <Button className="h-11 w-full" size="lg" disabled={!ngan} onClick={onMo} data-nut="mo-may-anh">
      <Camera />
      Mở máy ảnh
    </Button>
  );
}

export function ChupAnh({ toa, ma, thayNoiBo }: { toa: string; ma: string; thayNoiBo: boolean }) {
  const [s, gui] = useReducer(doiNgan, { mo: false, ngan: null });
  const [hong, setHong] = useState<KetQuaChup[]>([]);
  const may = useRef<HTMLInputElement>(null);
  const matMang = useMatMang();
  const tinh = useTinhHangCho();
  const ds = useHangCho().filter((a) => a.toa === toa && a.ma === ma);
  const cho = ds.filter((a) => a.trangThai !== "da-tai").length;
  // Ngăn gắn vào ảnh lúc chụp: đọc ngăn ngay khi máy ảnh trả tệp, đổi ngăn sau không đổi ảnh đã chụp.
  const nhan = async (files: File[], ngan: Compartment) => {
    const h = hangChoHienTai();
    if (!h) {
      setHong(khongNhanTep(files));
      return;
    }
    const kq = await nhanAnhChup(files, { chuanBi: (f) => chuanBiTep(f), them: (tep) => h.them(toa, ma, ngan, tep) });
    setHong(kq.filter((k) => k.loi));
  };

  return (
    <>
      <NutChup cho={cho} onMo={() => gui({ kind: "mo" })} />
      <NganNoi
        mo={s.mo}
        onMo={(v) => {
          gui({ kind: v ? "mo" : "dong" });
          if (!v) setHong([]);
        }}
        tieuDe={`Chụp ảnh · ${ma}`}
        moTa={toa}
        chan={<NutMoMay ngan={s.ngan} onMo={() => may.current?.click()} />}
      >
        <KhayChup ngan={s.ngan} thayNoiBo={thayNoiBo} matMang={matMang} khoLoi={tinh === "kho-loi"} ds={ds} hong={hong} onChon={(n) => gui({ kind: "chon", ngan: n })} onThuLai={(k) => hangChoHienTai()?.thuLai(k)} />
        <Input
          ref={may}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          hidden
          data-o="may-anh"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (s.ngan) void nhan(files, s.ngan);
          }}
        />
      </NganNoi>
    </>
  );
}
