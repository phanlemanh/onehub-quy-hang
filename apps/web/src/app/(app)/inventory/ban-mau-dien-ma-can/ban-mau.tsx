"use client";

// Bản bấm được của hàng dien-ma-can-cho-hang (Hỏi-4): hồ sơ của hàng chưa có mã căn theo giải phẫu của cột hồ sơ căn
// (hàng 17, solution-crm-4) — ô «Mã căn» trong mục «Thuộc tính căn», nút lưu GIẢ. Mã «A-12.05» giả làm căn đã có hàng
// đang mở để thấy lỗi trùng căn. Dữ liệu mẫu, không người thật. Gỡ khi màn thật ra.
import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { Badge } from "@/components/reui/badge";
import { FramePanel } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { KhungHoSoCan } from "../../units/ho-so/khung";

export type TrangThaiMau =
  "chua-co" | "ma-rong" | "trung-can" | "dang-luu" | "da-gan";

const TIEU_MUC =
  "text-xs font-medium uppercase tracking-wide text-muted-foreground";
const TOA = "[Tòa A]";
const KHU = "[Khu mẫu]";
const MA_TRUNG = "A-12.05";
const HANG_TRUNG = "H-0142";
const GOI_Y = ["A-12.01", "A-12.02", "A-12.05", "A-12.07", "A-12.08"];

/** So mã như `app.unit_key`: bỏ ký tự không phải chữ, số; viết hoa. */
const khoa = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, "").toUpperCase();

type Dong = {
  id: string;
  ma: string | null;
  toa: string;
  trangThai: string;
  gia: string;
};
const DONG: Dong[] = [
  { id: "H-0187", ma: null, toa: TOA, trangThai: "Sắp bán", gia: "3,20 tỷ" },
  {
    id: "H-0142",
    ma: "A-12.05",
    toa: TOA,
    trangThai: "Đang bán",
    gia: "3,40 tỷ",
  },
  {
    id: "H-0139",
    ma: "A-12.01",
    toa: TOA,
    trangThai: "Đang bán",
    gia: "3,10 tỷ",
  },
  {
    id: "H-0190",
    ma: null,
    toa: "[Tòa B]",
    trangThai: "Sắp bán",
    gia: "2,85 tỷ",
  },
  {
    id: "H-0121",
    ma: "B-09.04",
    toa: "[Tòa B]",
    trangThai: "Đang bán",
    gia: "2,95 tỷ",
  },
  {
    id: "H-0118",
    ma: "B-09.07",
    toa: "[Tòa B]",
    trangThai: "Đã cọc",
    gia: "4,10 tỷ",
  },
];
const DANG_MO = "H-0187";

function CapGiaTri({ ds }: { ds: [string, string][] }) {
  return (
    <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm">
      {ds.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Muc({
  tieuDe,
  phai,
  children,
}: {
  tieuDe: string;
  phai?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 p-4" aria-label={tieuDe}>
      <div className="flex min-h-8 items-center justify-between gap-2">
        <h3 className={TIEU_MUC}>{tieuDe}</h3>
        {phai}
      </div>
      {children}
    </section>
  );
}

function BangGia({ dangMo }: { dangMo: Dong }) {
  const cot = "grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-2 px-3 py-2";
  return (
    <FramePanel
      className="h-full p-0 text-sm"
      role="list"
      aria-label="Dòng mẫu của Bảng hàng"
    >
      <div
        className={`${cot} border-b text-xs font-medium text-muted-foreground`}
      >
        {["Mã căn", "Toà", "Trạng thái", "Giá"].map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      {DONG.map((dong) => {
        const d = dong.id === dangMo.id ? dangMo : dong;
        return (
          <div
            key={d.id}
            role="listitem"
            aria-current={d.id === dangMo.id ? "true" : undefined}
            className={`${cot} cursor-pointer border-b transition-colors hover:bg-accent aria-[current=true]:bg-accent`}
          >
            <span className={d.ma ? undefined : "text-muted-foreground"}>
              {d.ma ?? "Chưa có mã căn"}
            </span>
            <span>{d.toa}</span>
            <span>{d.trangThai}</span>
            <span>{d.gia}</span>
          </div>
        );
      })}
    </FramePanel>
  );
}

function HoSo({
  dau,
  cot,
  onGan,
}: {
  dau: TrangThaiMau;
  cot: boolean;
  onGan: (ma: string) => void;
}) {
  const [tt, setTt] = useState<TrangThaiMau>(dau);
  const [chu, setChu] = useState(
    dau === "trung-can"
      ? MA_TRUNG
      : dau === "dang-luu" || dau === "da-gan"
        ? "A-12.07"
        : "",
  );
  const [ma, setMa] = useState<string | null>(
    dau === "da-gan" ? "A-12.07" : null,
  );
  const o = useRef<HTMLInputElement>(null);
  // Bản máy tính và bản điện thoại cùng dựng trên trang — id riêng mỗi bản.
  const ID_O = useId();
  const ID_GOI_Y = useId();
  const hen = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(hen.current), []);

  const luu = () => {
    const gon = chu.trim();
    if (!gon) return setTt("ma-rong");
    if (khoa(gon) === khoa(MA_TRUNG)) return setTt("trung-can");
    // Lưu GIẢ: chờ như máy chủ rồi nhận — màn thật đi qua hàng đợi lệnh trên máy.
    setTt("dang-luu");
    hen.current = setTimeout(() => {
      setMa(gon);
      setTt("da-gan");
      onGan(gon);
    }, 900);
  };
  const phim = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") luu();
    if (e.key === "Escape") {
      setChu("");
      setTt("chua-co");
    }
  };
  const denO = () => o.current?.focus();

  const dangLuu = tt === "dang-luu";
  const loi =
    tt === "ma-rong"
      ? "Gõ mã căn"
      : tt === "trung-can"
        ? `Căn này đã có hàng đang mở: ${HANG_TRUNG}`
        : null;
  const thieu = ma ? ["Ảnh thật"] : ["Mã căn", "Ảnh thật"];
  const trongDanhMuc = ma ? GOI_Y.some((g) => khoa(g) === khoa(ma)) : false;

  return (
    <div className="flex flex-col" data-slot="ho-so-can" data-tt={tt}>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              {KHU} · {TOA}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className={
                  ma
                    ? "text-lg font-semibold"
                    : "text-lg font-semibold text-muted-foreground"
                }
              >
                {ma ?? "Chưa có mã căn"}
              </h2>
              <Badge variant="outline">Sắp bán</Badge>
            </div>
          </div>
          {/* Toàn màn trên điện thoại không có nút đóng — như /units/<mã>. */}
          {cot ? (
            <Button variant="ghost" size="icon-sm" aria-label="Đóng hồ sơ">
              <X />
            </Button>
          ) : null}
        </div>
        <span className="text-xs text-muted-foreground">
          Hàng {DANG_MO} · tạo từ lead · Xác nhận hôm nay
        </span>
      </div>
      {tt === "da-gan" ? (
        <div className="px-4 pb-4">
          <TrangThai
            kind="notice"
            title={`Đã gắn mã căn ${ma}.`}
            description="Hồ sơ giờ mở theo căn này; ảnh tải lên được."
          />
        </div>
      ) : null}
      <Separator />
      <div className="flex flex-col gap-2 p-4" aria-label="Giá và mức đủ">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">3,20 tỷ</span>
          <Badge variant="outline">Bao phí</Badge>
        </div>
        <Progress value={80} aria-label="Mức đủ thông tin" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Mức đủ thông tin · thiếu Tài chính</span>
          <span>4/5</span>
        </div>
      </div>
      <Separator />
      <Muc tieuDe="Ảnh">
        <p className="text-sm text-muted-foreground">
          {ma
            ? "Chưa có ảnh nào — thêm ảnh thật của căn."
            : "Ảnh gắn theo toà và mã căn — gắn mã căn rồi tải ảnh."}
        </p>
      </Muc>
      <Separator />
      <Muc tieuDe="Thuộc tính căn">
        {ma ? (
          <>
            <CapGiaTri
              ds={[
                ["Mã căn", ma],
                ["Toà", TOA],
                ...(trongDanhMuc
                  ? ([
                      ["Loại căn", "2PN"],
                      ["Diện tích", "68,5 m²"],
                      ["Tầng", "12"],
                      ["Hướng", "Đông Nam"],
                    ] as [string, string][])
                  : []),
              ]}
            />
            {trongDanhMuc ? null : (
              <p className="text-sm text-muted-foreground">
                Chưa có trong danh mục
              </p>
            )}
          </>
        ) : (
          <>
            <Field data-invalid={loi ? true : undefined}>
              <FieldLabel htmlFor={ID_O} className="flex items-center gap-2">
                Mã căn <Badge variant="warning-light">Chưa có</Badge>
              </FieldLabel>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id={ID_O}
                  ref={o}
                  list={ID_GOI_Y}
                  value={chu}
                  placeholder="VD A-12.07"
                  autoComplete="off"
                  disabled={dangLuu}
                  aria-invalid={loi ? true : undefined}
                  onChange={(e) => {
                    setChu(e.target.value);
                    if (tt !== "chua-co") setTt("chua-co");
                  }}
                  onKeyDown={phim}
                />
                <Button disabled={dangLuu} onClick={luu}>
                  {dangLuu ? "Đang lưu…" : "Lưu mã căn"}
                </Button>
              </div>
              <datalist id={ID_GOI_Y}>
                {GOI_Y.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
              {loi ? (
                <FieldError>
                  {loi}
                  {tt === "trung-can" ? (
                    <>
                      {" · "}
                      <a href="#" className="underline underline-offset-2">
                        Mở hàng kia
                      </a>
                    </>
                  ) : null}
                </FieldError>
              ) : (
                <FieldDescription>
                  Gợi ý theo danh mục {TOA}. Mã ngoài danh mục vẫn lưu được. Gắn
                  rồi thì khoá.
                </FieldDescription>
              )}
            </Field>
            <CapGiaTri ds={[["Toà", TOA]]} />
          </>
        )}
      </Muc>
      <Separator />
      <Muc tieuDe="Lần rao đang mở">
        <div className="flex flex-col gap-2" data-slot="san-sang-ban">
          <div>
            <Button size="sm">Sẵn sàng bán</Button>
          </div>
          <TrangThai
            kind="notice"
            title="Còn thiếu:"
            description={
              <ul className="flex flex-col gap-1">
                {thieu.map((t) => (
                  <li key={t}>
                    {t === "Mã căn" ? (
                      <a
                        href={`#${ID_O}`}
                        onClick={(e) => {
                          e.preventDefault();
                          denO();
                        }}
                        className="underline underline-offset-2"
                      >
                        Mã căn
                      </a>
                    ) : (
                      <span>{t}</span>
                    )}
                  </li>
                ))}
              </ul>
            }
          />
        </div>
        <CapGiaTri
          ds={[
            ["Giá", "3,20 tỷ · Bao phí"],
            ["Nội thất", "Cơ bản"],
            ["Pháp lý", "Sổ hồng"],
            ["Tài chính", "—"],
            ["Tình trạng", "Đang trống"],
          ]}
        />
      </Muc>
    </div>
  );
}

export function BanMau({
  dau,
  cot = false,
}: {
  dau: TrangThaiMau;
  cot?: boolean;
}) {
  const [dangMo, setDangMo] = useState<Dong>({
    ...DONG[0]!,
    ma: dau === "da-gan" ? "A-12.07" : null,
  });
  const hoSo = (
    <HoSo
      dau={dau}
      cot={cot}
      onGan={(ma) => setDangMo((d) => ({ ...d, ma }))}
    />
  );
  if (!cot) {
    return hoSo;
  }
  return (
    <ResizablePanelGroup orientation="horizontal" id="ban-mau-dien-ma">
      <ResizablePanel id="bang" minSize="35%">
        <BangGia dangMo={dangMo} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel id="ho-so" defaultSize="38%" minSize="28%">
        <KhungHoSoCan cot>{hoSo}</KhungHoSoCan>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
