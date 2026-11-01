"use client";

// Mục Ảnh của hồ sơ căn (hàng 18, ADR-0014): ba thẻ Gửi được · Tự có từ mã · Nội bộ; kéo thả hay dán ảnh vào ngăn của thẻ
// đang mở. Ghép theo ví dụ ReUI `c-sortable-7` (Sortable dạng lưới) trong FramePanel của hồ sơ — khối upload có Card trái
// luật một họ khung. Ảnh không đi qua bộ đồng bộ, không vào kho trên máy (luật khuôn KH-hs-anh-noi-bo); quyền và ẩn nội
// bộ do API và luật theo dòng quyết, mục này chỉ trình điều API trả.
import { CHU_CAN_MANG, CHU_DANH_MUC_TRONG, CHU_NOI_BO_KHOA, NHAN_NGAN, nhanAnh, sapXep, type Compartment, type UnitPhoto } from "@quy-hang/core/photos";
import { ImagePlus, Lock, MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type DragEvent } from "react";

import { Badge } from "@/components/reui/badge";
import { Sortable, SortableItem } from "@/components/reui/sortable";
import { TrangThai } from "@/components/trang-thai";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { guiLuot, tepTuLuotDan, type TepSanSang } from "./tai-len";

export type DanhSachAnh = { anh: UnitPhoto[]; noiBo: "thay" | "an"; suaDuoc: boolean };
export type SuaAnh = { compartment?: Compartment; order?: string[]; isCover?: true; isSample?: boolean };

/** Đường tới API ảnh — bản thật gọi `/api/v1/units/photos`; trang bấm được truyền bản trong bộ nhớ. */
export type NguonAnh = {
  danhSach(): Promise<DanhSachAnh>;
  them(tep: TepSanSang, ngan: Compartment): Promise<void>;
  sua(id: string, sua: SuaAnh): Promise<void>;
  xoa(id: string): Promise<void>;
  urlAnh(id: string, bien: "thumb" | "original"): string;
};

type The = Compartment | "catalog";
type OCho = { key: string; ten: string; ngan: Compartment; loi?: string };

function useNgoaiTuyen() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("online", cb);
      window.addEventListener("offline", cb);
      return () => {
        window.removeEventListener("online", cb);
        window.removeEventListener("offline", cb);
      };
    },
    () => !navigator.onLine,
    () => false,
  );
}

export function MucAnh({ nguon, toaMa }: { nguon: NguonAnh; toaMa: string }) {
  const [ds, setDs] = useState<DanhSachAnh | null>(null);
  const [loiTai, setLoiTai] = useState(false);
  const [the, setThe] = useState<The>("shareable");
  const [cho, setCho] = useState<OCho[]>([]);
  const [xem, setXem] = useState<UnitPhoto | null>(null);
  const [xoa, setXoa] = useState<UnitPhoto | null>(null);
  const [keoVao, setKeoVao] = useState(false);
  const ngoaiTuyen = useNgoaiTuyen();
  const chonTep = useRef<HTMLInputElement>(null);
  const goc = useRef<HTMLElement>(null);

  const tai = useCallback(() => {
    nguon.danhSach().then(
      (d) => {
        setDs(d);
        setLoiTai(false);
      },
      () => setLoiTai(true),
    );
  }, [nguon]);
  useEffect(tai, [tai]);

  const nhan = useCallback(
    async (files: File[], ngan: Compartment) => {
      if (!files.length || !ds?.suaDuoc) return;
      const goc = Date.now();
      const o = files.map((f, i) => ({ key: `${goc}-${i}`, ten: f.name, ngan }));
      setCho((c) => [...c, ...o]);
      const kq = await guiLuot(files, (tep) => nguon.them(tep, ngan), { onLine: navigator.onLine });
      setCho((c) => c.flatMap((x) => {
        const i = o.findIndex((y) => y.key === x.key);
        if (i < 0) return [x];
        return kq[i]!.loi ? [{ ...x, loi: kq[i]!.loi! }] : [];
      }));
      tai();
    },
    [ds?.suaDuoc, nguon, tai],
  );

  // Dán ảnh: ⌘/Ctrl+V khi tiêu điểm không ở ô nhập chữ.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData || the === "catalog") return;
      const files = tepTuLuotDan(e.clipboardData.items, document.activeElement);
      if (!files.length) return;
      e.preventDefault();
      void nhan(files, the);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [nhan, the]);

  const tha = (e: DragEvent, ngan: Compartment) => {
    e.preventDefault();
    e.stopPropagation();
    setKeoVao(false);
    void nhan(Array.from(e.dataTransfer.files), ngan);
  };
  const choThaVao = (e: DragEvent) => {
    if (!ds?.suaDuoc || ngoaiTuyen || !e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    setKeoVao(true);
  };

  if (loiTai) return <TrangThai kind="error" title="Không tải được ảnh" description="Kiểm tra mạng rồi mở lại hồ sơ." />;
  if (!ds) return <p className="text-muted-foreground text-sm">Đang tải ảnh…</p>;

  const theoNgan = (n: Compartment) => sapXep(ds.anh, n);
  const soLuong = (n: Compartment) => ds.anh.filter((p) => p.compartment === n).length;
  const nganDangMo: Compartment | null = the === "catalog" ? null : the;

  const luoi = (ngan: Compartment) => {
    const anh = theoNgan(ngan);
    const sapLai = (moi: UnitPhoto[]) => {
      setDs({ ...ds, anh: [...ds.anh.filter((p) => p.compartment !== ngan), ...moi.map((p, i) => ({ ...p, displayOrder: i }))] });
      void nguon.sua(moi[0]!.id, { order: moi.map((p) => p.id) }).then(tai, tai);
    };
    return (
      <div className="flex flex-col gap-3">
        {ds.suaDuoc ? (
          <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
            <span>{ngoaiTuyen ? CHU_CAN_MANG : "Kéo ảnh từ Zalo vào đây, hoặc dán bằng ⌘V"}</span>
            <Button size="sm" variant="outline" disabled={ngoaiTuyen} onClick={() => chonTep.current?.click()}>
              <ImagePlus /> Chọn ảnh
            </Button>
          </div>
        ) : null}
        {anh.length === 0 && !cho.some((c) => c.ngan === ngan) ? (
          <TrangThai kind="empty" title={ngan === "shareable" ? "Chưa có ảnh gửi được" : "Chưa có giấy tờ nội bộ"} description={ds.suaDuoc ? "Thả ảnh vào khung này." : "Người giữ căn chưa thêm ảnh."} />
        ) : (
          <Sortable value={anh} onValueChange={sapLai} getItemValue={(p) => p.id} strategy="grid" className="grid grid-cols-2 gap-2 @md:grid-cols-3 @3xl:grid-cols-5">
            {anh.map((p, i) => (
              <SortableItem key={p.id} value={p.id} disabled={!ds.suaDuoc || ngan !== "shareable"} className="group relative overflow-hidden rounded-md border">
                <Button variant="ghost" className="block h-auto w-full rounded-none p-0" onClick={() => setXem(p)} aria-label={`Xem ảnh ${i + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- byte qua API có kiểm quyền, không qua bộ tối ưu ảnh của Next */}
                  <img src={nguon.urlAnh(p.id, "thumb")} alt={nhanAnh(p)} className="aspect-square w-full object-cover" draggable={false} />
                </Button>
                <div className="flex items-center justify-between gap-1 px-1.5 py-1">
                  <span className="text-muted-foreground truncate text-xs">{nhanAnh(p)}</span>
                  {ds.suaDuoc ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button size="icon-xs" variant="ghost" aria-label="Thao tác ảnh" />}>
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {ngan === "shareable" ? (
                          <>
                            <DropdownMenuItem onClick={() => void nguon.sua(p.id, { isCover: true }).then(tai, tai)}>Đặt làm ảnh bìa</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void nguon.sua(p.id, { isSample: !p.isSample }).then(tai, tai)}>
                              {p.isSample ? "Bỏ «Ảnh mẫu»" : "Đánh dấu «Ảnh mẫu»"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void nguon.sua(p.id, { compartment: "internal" }).then(tai, tai)}>Chuyển sang Nội bộ</DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem onClick={() => void nguon.sua(p.id, { compartment: "shareable" }).then(tai, tai)}>Chuyển sang Gửi được</DropdownMenuItem>
                        )}
                        <DropdownMenuItem variant="destructive" onClick={() => setXoa(p)}>Xoá khỏi căn</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
                {ngan === "shareable" && i === 0 ? <Badge className="absolute top-1.5 left-1.5" size="sm">Bìa</Badge> : null}
              </SortableItem>
            ))}
          </Sortable>
        )}
        {cho.some((c) => c.ngan === ngan) ? (
          <ul className="flex flex-col gap-1 text-xs" aria-label="Ảnh đang thêm">
            {cho.filter((c) => c.ngan === ngan).map((c) => (
              <li key={c.key} className={`flex items-center justify-between gap-2 rounded-md border px-2 py-1 ${c.loi ? "border-destructive text-destructive" : ""}`}>
                <span className="truncate">{c.ten}</span>
                <span>{c.loi ?? "Đang tải…"}</span>
                {c.loi ? (
                  <Button size="xs" variant="ghost" onClick={() => setCho((x) => x.filter((y) => y.key !== c.key))}>
                    Bỏ
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  };

  return (
    <section
      ref={goc}
      aria-label="Ảnh"
      className={`@container flex flex-col gap-3 rounded-md ${keoVao ? "ring-primary ring-2" : ""}`}
      onDragOver={(e) => nganDangMo && choThaVao(e)}
      onDragLeave={() => setKeoVao(false)}
      onDrop={(e) => nganDangMo && tha(e, nganDangMo)}
    >
      <Input
        ref={chonTep}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => {
          if (nganDangMo) void nhan(Array.from(e.target.files ?? []), nganDangMo);
          e.target.value = "";
        }}
      />
      <Tabs value={the} onValueChange={(v) => setThe(v as The)}>
        <TabsList>
          <TabsTrigger value="shareable" onDragOver={choThaVao} onDrop={(e) => tha(e, "shareable")}>
            {NHAN_NGAN.shareable} ({soLuong("shareable")})
          </TabsTrigger>
          <TabsTrigger value="catalog">{NHAN_NGAN.catalog}</TabsTrigger>
          <TabsTrigger value="internal" onDragOver={ds.noiBo === "thay" ? choThaVao : undefined} onDrop={ds.noiBo === "thay" ? (e) => tha(e, "internal") : undefined}>
            {ds.noiBo === "an" ? <Lock /> : null}
            {NHAN_NGAN.internal}
            {ds.noiBo === "thay" ? ` (${soLuong("internal")})` : null}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="shareable">{luoi("shareable")}</TabsContent>
        <TabsContent value="catalog">
          <TrangThai kind="notice" title={NHAN_NGAN.catalog} description={CHU_DANH_MUC_TRONG} />
        </TabsContent>
        <TabsContent value="internal">
          {ds.noiBo === "an" ? <TrangThai kind="notice" title="Ngăn nội bộ" description={CHU_NOI_BO_KHOA} /> : luoi("internal")}
        </TabsContent>
      </Tabs>

      <Dialog open={xem !== null} onOpenChange={(o) => !o && setXem(null)}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>{xem ? `${toaMa} · ${nhanAnh(xem)}` : ""}</DialogTitle>
          {/* eslint-disable-next-line @next/next/no-img-element -- byte gốc qua API có kiểm quyền */}
          {xem ? <img src={nguon.urlAnh(xem.id, "original")} alt={nhanAnh(xem)} className="max-h-[75svh] w-full object-contain" /> : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={xoa !== null} onOpenChange={(o) => !o && setXoa(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá ảnh khỏi căn?</AlertDialogTitle>
            <AlertDialogDescription>Ảnh bị xoá hẳn, không lấy lại được.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Giữ ảnh</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (xoa) void nguon.xoa(xoa.id).then(tai, tai);
                setXoa(null);
              }}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
