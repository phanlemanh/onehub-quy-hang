"use client";

/**
 * Màn Gửi (hàng 34), lối ReUI của trang ba lối (wishlist-1 — chủ kho duyệt ở Cổng Phạm vi 04/11): Gửi cho ai · Căn sẽ gửi ·
 * Tin soạn sẵn trên một lần cuộn, thanh dính đáy «n căn · Xem trước · Gửi». Bản ra của mọi căn dựng bằng `banRaNgoai` của
 * lõi (bất biến 4); nút Gửi tạo một Lần gửi rồi mở bảng chia sẻ của máy — người tự bấm gửi trong Zalo (bất biến 3).
 */
import type { CatalogUnitData } from "@quy-hang/core";
import type { ProspectNeed, ProspectView } from "@quy-hang/core/contacts";
import type { UnitPhoto } from "@quy-hang/core/photos";
import { banRaNgoai, type NguoiNhan } from "@quy-hang/core/redaction";
import { soanTin, tenCanRa, thongSoRa } from "@quy-hang/core/sharing";
import { EyeIcon, ImageIcon, PhoneCallIcon, PlusIcon, Share2Icon, UserIcon, UsersIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { NganNoi } from "@/components/bo-cuc";
import { Badge } from "@/components/reui/badge";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { goiFetch } from "@/lib/sync/goi-fetch";
import { useBoDongBo } from "@/lib/sync/react";
import type { ListingView } from "@/lib/sync/types";
import { dinhDangGia, FEE_LABEL } from "../../inventory/cot";
import { useDanhMuc } from "../../inventory/danh-muc";
import { chiMuc } from "../../inventory/ghep-danh-muc";
import { canNoiBoTu, docCanChon, khoaTin, LOI_MUC_CHIA, mucChiaGui, mucChiaMacDinh, NHAC_XAC_NHAN, nutGui, phanLoaiCan, taoBoGui, tinDangDung, type KetGui, type NguoiGui } from "./gui";
import { TrangKhach } from "./trang-khach";

const ANH = "/api/v1/units/photos";
const duongAnh = (id: string) => `${ANH}/${encodeURIComponent(id)}/thumb`;
// Khoá ghép danh mục như `ghep-danh-muc.ts`: toà + mã căn, bỏ hoa thường và khoảng trắng hai đầu.
const chuan = (s: string) => s.trim().toLowerCase();
const khoaDanhMuc = (toa: string, ma: string) => `${chuan(toa)}\u0000${chuan(ma)}`;
const NHU_CAU: { v: ProspectNeed; nhan: string }[] = [
  { v: "purchase", nhan: "Mua" },
  { v: "lease", nhan: "Thuê" },
  { v: "purchase_or_lease", nhan: "Mua hoặc thuê" },
];
const NHAN_NHU_CAU: Record<string, string> = Object.fromEntries(NHU_CAU.map((x) => [x.v, x.nhan]));

function useCoMang() {
  return useSyncExternalStore(
    (f) => {
      window.addEventListener("online", f);
      window.addEventListener("offline", f);
      return () => {
        window.removeEventListener("online", f);
        window.removeEventListener("offline", f);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}

function useHangTrenMay() {
  const { bd } = useBoDongBo();
  const dangKy = useCallback((f: () => void) => bd.dangKy(f), [bd]);
  const phienBan = useSyncExternalStore(dangKy, bd.phienBan, () => 0);
  return useMemo(() => {
    void phienBan;
    return { hang: new Map(bd.danhSach().map((l) => [l.id, l] as const)), daKeo: bd.ngan().listings !== null };
  }, [bd, phienBan]);
}

/** Ảnh của các căn đang gửi — hỏi API một lần mỗi căn; lỗi hay mất mạng là không ảnh. */
function useAnhCan(ds: readonly ListingView[]) {
  const [anh, setAnh] = useState<Record<string, UnitPhoto[]>>({});
  useEffect(() => {
    let huy = false;
    for (const l of ds) {
      if (!l.unitNumber || anh[l.id]) continue;
      fetch(`${ANH}?${new URLSearchParams({ toa: l.buildingName, ma: l.unitNumber })}`, { cache: "no-store" })
        .then(async (r) => (r.ok ? (((await r.json()) as { anh?: UnitPhoto[] }).anh ?? []) : []))
        .catch(() => [])
        .then((x) => {
          if (!huy) setAnh((cu) => ({ ...cu, [l.id]: x }));
        });
    }
    return () => {
      huy = true;
    };
  }, [ds, anh]);
  return anh;
}

function ChamNgan({ cac }: { cac: string[] }) {
  return (
    <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
      {cac.filter(Boolean).map((s, i) => (
        <span key={s} className="inline-flex items-center gap-2">
          {i > 0 ? <span aria-hidden="true" className="bg-muted-foreground/40 size-1 shrink-0 rounded-full" /> : null}
          <span>{s}</span>
        </span>
      ))}
    </p>
  );
}

function NhacXacNhan() {
  return (
    <Badge variant="warning-light" radius="full" className="gap-1 self-start">
      <PhoneCallIcon aria-hidden="true" />
      {NHAC_XAC_NHAN}
    </Badge>
  );
}

function KhachMoi({ onTao }: { onTao: (o: { ten: string; so: string; need: ProspectNeed }) => Promise<Partial<Record<string, string>> | null> }) {
  const [mo, setMo] = useState(false);
  const [ten, setTen] = useState("");
  const [so, setSo] = useState("");
  const [need, setNeed] = useState<ProspectNeed>("purchase");
  const [loi, setLoi] = useState<Partial<Record<string, string>>>({});
  const [dang, setDang] = useState(false);
  if (!mo)
    return (
      <Button variant="ghost" size="sm" className="self-start" onClick={() => setMo(true)}>
        <PlusIcon aria-hidden="true" />
        Khách mới
      </Button>
    );
  return (
    <form
      className="flex flex-col gap-3 rounded-lg border p-3"
      aria-label="Khách mới"
      onSubmit={async (e) => {
        e.preventDefault();
        setDang(true);
        const l = await onTao({ ten, so, need });
        setDang(false);
        if (l) setLoi(l);
        else setMo(false);
      }}
    >
      <Field data-invalid={Boolean(loi.ten) || undefined}>
        <FieldLabel htmlFor="khach-ten">Tên khách</FieldLabel>
        <Input id="khach-ten" value={ten} onChange={(e) => setTen(e.target.value)} autoComplete="off" />
        {loi.ten ? <FieldError>{loi.ten}</FieldError> : null}
      </Field>
      <Field data-invalid={Boolean(loi.so) || undefined}>
        <FieldLabel htmlFor="khach-so">Số điện thoại</FieldLabel>
        <Input id="khach-so" inputMode="tel" value={so} onChange={(e) => setSo(e.target.value)} autoComplete="off" />
        {loi.so ? <FieldError>{loi.so}</FieldError> : null}
      </Field>
      <ToggleGroup variant="outline" value={[need]} onValueChange={(v) => v[0] && setNeed(v[0] as ProspectNeed)} aria-label="Loại giao dịch">
        {NHU_CAU.map((x) => (
          <ToggleGroupItem key={x.v} value={x.v}>
            {x.nhan}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {loi.chung ? <FieldError>{loi.chung}</FieldError> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={dang}>
          Lưu và chọn
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setMo(false)}>
          Huỷ
        </Button>
      </div>
    </form>
  );
}

export function ManGui({ san, nguoi }: { san: string; nguoi: NguoiGui }) {
  const q = useSearchParams();
  const chon = useMemo(() => docCanChon(q.get("can")), [q]);
  const [xem, setXem] = useState(q.get("xem") === "1");
  const coMang = useCoMang();
  const { hang, daKeo } = useHangTrenMay();
  const danhMuc = useDanhMuc(san);
  const idx = useMemo(() => chiMuc(danhMuc), [danhMuc]);
  const [hom] = useState(() => new Date().toISOString().slice(0, 10));
  const [bo, setBo] = useState<ReadonlySet<string>>(new Set());

  const { gui: canGui, loai } = useMemo(
    () => phanLoaiCan(chon.filter((id) => !bo.has(id)), (id) => hang.get(id), hom),
    [chon, bo, hang, hom],
  );
  const dsHang = useMemo(() => canGui.map((c) => c.l), [canGui]);
  const anh = useAnhCan(dsHang);

  const [nguoiNhan, setNguoiNhan] = useState<NguoiNhan | null>(null);
  const [khachId, setKhachId] = useState<string | null>(null);
  const [khach, setKhach] = useState<ProspectView[] | null>(null);
  const [tinSua, setTinSua] = useState<{ khoa: string; tin: string } | null>(null);
  const [ket, setKet] = useState<KetGui | null>(null);
  const [dangTao, setDangTao] = useState(false);
  // Hàng 44: mức chia của bộ khi gửi nhóm môi giới — điền sẵn mặc định của sàn, người gửi sửa hay để trống.
  const [mucMacDinh, setMucMacDinh] = useState<number | null | undefined>(undefined);
  const [mucNhap, setMucNhap] = useState<string | null>(null);
  useEffect(() => {
    if (nguoiNhan !== "nhom_moi_gioi" || mucMacDinh !== undefined) return;
    goiFetch("GET", "/api/v1/company/settings")
      .then((r) => setMucMacDinh(r.status === 200 ? mucChiaMacDinh(r.body) : null))
      .catch(() => setMucMacDinh(null));
  }, [nguoiNhan, mucMacDinh]);
  const mucChia = nguoiNhan === "nhom_moi_gioi" ? mucChiaGui(mucNhap, mucMacDinh ?? null) : null;

  useEffect(() => {
    if (nguoiNhan !== "khach_rieng" || khach) return;
    goiFetch("GET", "/api/v1/prospects")
      .then((r) => setKhach(r.status === 200 ? (r.body as ProspectView[]) : []))
      .catch(() => setKhach([]));
  }, [nguoiNhan, khach]);

  // Chưa chọn người nhận thì xem trước dựng bản khách riêng — bản kín nhất.
  const nhanXem: NguoiNhan = nguoiNhan ?? "khach_rieng";
  const ban = useMemo(() => {
    return canGui.map((c) => {
      const u: CatalogUnitData | undefined = c.l.unitNumber ? idx.get(khoaDanhMuc(c.l.buildingName, c.l.unitNumber)) : undefined;
      return banRaNgoai(canNoiBoTu(c.l, u, nguoi, anh[c.id] ?? []), { cua: "gui_link", nguoiNhan: nhanXem, today: hom });
    });
  }, [canGui, idx, nguoi, anh, nhanXem, hom]);

  const tenKhach = khach?.find((k) => k.id === khachId)?.displayName ?? null;
  const tinTuDong = nguoiNhan ? soanTin({ ban, nguoiNhan, tenKhach }) : "";
  const khoa = khoaTin(nguoiNhan, khachId, canGui.map((c) => c.id));
  const tin = tinDangDung(tinSua, khoa, tinTuDong);

  const boGui = useMemo(
    () =>
      taoBoGui({
        goi: goiFetch,
        goc: typeof window === "undefined" ? "" : window.location.origin,
        bang:
          typeof navigator !== "undefined" && typeof navigator.share === "function"
            ? { share: (d) => navigator.share(d), canShare: (d) => navigator.canShare?.(d) ?? false }
            : null,
        chep: typeof navigator !== "undefined" && navigator.clipboard ? (t) => navigator.clipboard.writeText(t) : null,
        layAnh: async (a, ten) => {
          const r = await fetch(duongAnh(a.id));
          if (!r.ok) return null;
          const b = await r.blob();
          return new File([b], ten, { type: b.type || "image/jpeg" });
        },
      }),
    [],
  );

  const nut = nutGui({ mang: coMang, nguoiNhan, khachId, soCan: canGui.length, dangTao });
  // Máy không có bảng chia sẻ (máy tính): nút đọc «Chép tin» — bộ điều phối chép tin có link.
  const coBang = useCoBangChiaSe();
  const chuNut = nut.mo && !coBang ? "Chép tin" : nut.chu;
  async function bamGui() {
    if (!nut.mo || !nguoiNhan) return;
    setDangTao(true);
    setKet(null);
    if (mucChia === "sai") return;
    const kq = await boGui.gui({ nguoiNhan, prospectId: khachId, listingIds: canGui.map((c) => c.id), tin, ban, mucChia });
    setDangTao(false);
    if (kq.kieu !== "bo-qua") setKet(kq);
  }

  if (!daKeo) return <TrangThai kind="loading" title="Đang mở Bảng hàng trên máy" />;
  if (chon.length === 0)
    return (
      <TrangThai
        kind="empty"
        title="Chưa chọn căn nào"
        description="Giữ lâu một căn trên Bảng hàng để chọn rồi bấm Gửi."
        hanhDong={<Button nativeButton={false} render={<Link href="/inventory" />}>Về Bảng hàng</Button>}
      />
    );

  const nhanNguoiNhan =
    nguoiNhan === "khach_rieng" ? (tenKhach ? `Khách riêng · ${tenKhach}` : "Khách riêng — chưa chọn khách") : nguoiNhan === "nhom_moi_gioi" ? "Nhóm môi giới" : "Chưa chọn người nhận";

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3" aria-label="Gửi cho ai">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-foreground text-base font-semibold tracking-tight">Gửi cho ai</h2>
          <ToggleGroup
            variant="outline"
            value={nguoiNhan ? [nguoiNhan] : []}
            onValueChange={(v) => setNguoiNhan((v[0] as NguoiNhan | undefined) ?? null)}
            aria-label="Gửi cho ai"
          >
            <ToggleGroupItem value="khach_rieng">
              <UserIcon aria-hidden="true" />
              Khách riêng
            </ToggleGroupItem>
            <ToggleGroupItem value="nhom_moi_gioi">
              <UsersIcon aria-hidden="true" />
              Nhóm môi giới
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        {nguoiNhan === "nhom_moi_gioi" ? (
          <Field data-invalid={mucChia === "sai" || undefined}>
            <FieldLabel htmlFor="muc-chia">Mức chia (%)</FieldLabel>
            <Input
              id="muc-chia"
              inputMode="decimal"
              placeholder="Để trống nếu không chia"
              value={mucNhap ?? (mucMacDinh == null ? "" : String(mucMacDinh))}
              onChange={(e) => setMucNhap(e.target.value)}
              aria-invalid={mucChia === "sai" || undefined}
            />
            {mucChia === "sai" ? <FieldError>{LOI_MUC_CHIA}</FieldError> : null}
          </Field>
        ) : null}
        {nguoiNhan === "khach_rieng" ? (
          <div className="flex flex-col gap-2">
            {khach === null ? (
              <p className="text-muted-foreground text-sm">Đang tải khách…</p>
            ) : khach.length === 0 ? (
              <p className="text-muted-foreground text-sm">Chưa có khách đang mở — lưu khách mới bên dưới.</p>
            ) : (
              <RadioGroup value={khachId ?? ""} onValueChange={(v) => setKhachId(String(v))} aria-label="Khách riêng">
                {khach.map((k) => (
                  <Item key={k.id} variant="outline" size="sm" render={<label htmlFor={`khach-${k.id}`} />} className="cursor-pointer">
                    <RadioGroupItem id={`khach-${k.id}`} value={k.id} />
                    <ItemContent>
                      <ItemTitle>{k.displayName}</ItemTitle>
                      <ItemDescription>{NHAN_NHU_CAU[k.need] ?? k.need}</ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </RadioGroup>
            )}
            <KhachMoi
              onTao={async (o) => {
                const kq = await boGui.khachMoi(o);
                if (!kq.ok) return kq.loi;
                setKhach((cu) => [{ id: kq.id, displayName: kq.ten, need: o.need } as ProspectView, ...(cu ?? [])]);
                setKhachId(kq.id);
                return null;
              }}
            />
          </div>
        ) : null}
      </section>

      <section className="flex flex-col" aria-label="Căn sẽ gửi">
        <div className="flex flex-col gap-1 pb-3">
          <h2 className="text-foreground text-base font-semibold tracking-tight">Căn sẽ gửi</h2>
          <ChamNgan cac={[`${canGui.length} căn đang bán`, "theo thứ tự đã chọn", canGui.some((c) => c.nhac) ? `${canGui.filter((c) => c.nhac).length} căn cần gọi xác nhận` : ""]} />
        </div>
        {canGui.length === 0 ? (
          <TrangThai kind="notice" title="Không còn căn gửi được" hanhDong={<Button variant="outline" nativeButton={false} render={<Link href="/inventory" />}>Về Bảng hàng</Button>} />
        ) : (
          <ul role="list" className="divide-border divide-y border-y">
            {canGui.map((c, i) => {
              const b = ban[i];
              return (
                <li key={c.id} className="py-4 sm:py-5">
                  <div className="-mx-3 grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 rounded-lg px-3 sm:-mx-4 sm:gap-5 sm:px-4">
                    <Item variant="muted" className="relative size-16 overflow-hidden p-0 sm:size-20">
                      {b?.photos?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element -- byte qua API có kiểm quyền, không qua bộ tối ưu ảnh của Next
                        <img src={duongAnh(b.photos[0].id)} alt={b.photos[0].label} loading="lazy" className="absolute inset-0 size-full object-cover" />
                      ) : (
                        <ImageIcon aria-hidden="true" className="text-muted-foreground absolute inset-0 m-auto size-5" />
                      )}
                    </Item>
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-muted-foreground w-fit text-xs font-medium">{c.l.buildingName}</span>
                      <h3 className="text-foreground min-w-0 truncate text-sm leading-tight font-semibold tracking-tight sm:text-base">{c.l.unitNumber ?? "Chưa có mã căn"}</h3>
                      <ChamNgan cac={[b ? thongSoRa(b) : "", !b ? "" : b.unitNumber == null ? `Khách thấy: ${tenCanRa(b)}` : "Khách thấy mã căn"]} />
                      {c.nhac ? <NhacXacNhan /> : null}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-foreground text-sm font-semibold tabular-nums">{dinhDangGia(c.l.listPrice)}</span>
                      <span className="text-muted-foreground text-xs">{c.l.feeInclusion ? FEE_LABEL[c.l.feeInclusion] : ""}</span>
                      <Button variant="ghost" size="icon-sm" aria-label={`Bỏ ${c.l.unitNumber ?? "căn"}`} onClick={() => setBo((cu) => new Set([...cu, c.id]))}>
                        <XIcon aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {loai.length ? (
          <ul role="list" className="flex flex-col gap-1 pt-3" aria-label="Căn không gửi được">
            {loai.map((x) => (
              <li key={x.id} className="text-muted-foreground text-xs">
                {hang.get(x.id)?.unitNumber ?? "Một căn"} — {x.lyDo}, đã bỏ khỏi lần gửi
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {nguoiNhan ? (
        <section className="flex flex-col gap-2" aria-label="Tin soạn sẵn">
          <h2 className="text-foreground text-base font-semibold tracking-tight">Tin soạn sẵn</h2>
          <Textarea rows={8} value={tin} onChange={(e) => setTinSua({ khoa, tin: e.target.value })} aria-label="Tin soạn sẵn" />
          <p className="text-muted-foreground text-xs">Link vào chỗ [link] khi bấm Gửi. Sửa được trước khi gửi.</p>
        </section>
      ) : null}

      {ket?.kieu === "loi" ? (
        <TrangThai kind="error" title={ket.chu} />
      ) : ket?.kieu === "da-chep" ? (
        <TrangThai kind="notice" title="Đã chép" description="Tin có link đã ở bộ nhớ tạm — dán vào Zalo rồi tự bấm gửi." />
      ) : ket?.kieu === "hien-tin" ? (
        <section className="flex flex-col gap-2" aria-label="Tin để chép">
          <h2 className="text-foreground text-base font-semibold tracking-tight">Chưa chép được — chọn tin và chép tay</h2>
          <Textarea rows={8} readOnly value={ket.text} onFocus={(e) => e.currentTarget.select()} aria-label="Tin để chép" />
        </section>
      ) : ket?.kieu === "da-mo-bang" || ket?.kieu === "huy" ? (
        <TrangThai kind="notice" title="Đã tạo link" description={ket.kieu === "huy" ? "Bảng chia sẻ đã đóng — bấm Gửi để tạo link mới." : "Chọn Zalo và tự bấm gửi."} />
      ) : null}

      <div className="bg-background sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t py-3">
        <div className="flex min-w-0 flex-col">
          <span className="text-foreground text-sm font-medium tabular-nums">{canGui.length} căn</span>
          <span className="text-muted-foreground truncate text-xs">{nhanNguoiNhan}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={canGui.length === 0} onClick={() => setXem(true)}>
            <EyeIcon aria-hidden="true" />
            Xem trước
          </Button>
          <Button size="sm" disabled={!nut.mo} onClick={() => void bamGui()}>
            <Share2Icon aria-hidden="true" />
            {chuNut}
          </Button>
        </div>
      </div>

      <NganNoi
        toanMan
        mo={xem && canGui.length > 0}
        onMo={setXem}
        tieuDe={nhanXem === "khach_rieng" ? `Xem trước — ${tenKhach ?? "khách riêng"} thấy` : "Xem trước — nhóm môi giới thấy"}
        moTa={nhanXem === "khach_rieng" ? "Khách riêng không thấy mã căn." : "Nhóm môi giới thấy mã căn."}
        chan={
          <Button className="w-full" disabled={!nut.mo} onClick={() => void bamGui()}>
            <Share2Icon aria-hidden="true" />
            {chuNut}
          </Button>
        }
      >
        <div className="p-trang">
          <TrangKhach ban={ban} nguoiNhan={nhanXem} duongAnh={duongAnh} />
        </div>
      </NganNoi>
    </div>
  );
}

/** Máy có bảng chia sẻ không — đọc sau khi vào trình duyệt (máy chủ coi là có, để lúc hydrate không lệch). */
function useCoBangChiaSe() {
  return useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === "function",
    () => true,
  );
}
