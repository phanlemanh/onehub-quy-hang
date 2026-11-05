"use client";

/**
 * Hôm nay của đầu chủ trên điện thoại (hàng 39) — Tràn thành thẻ, khối đích `solution-agents-2` dạng dòng hai tầng
 * (`docs/design/vo-va-ia.md` §2 dòng M1 · 39): cùng nhóm và cùng bộ việc với lưới máy tính; dòng trên tên căn, dòng dưới lý
 * do · giá, hạn tô màu như máy tính; một nút cố định ở mép phải; ⋯ và «Kết quả cuộc gọi» là ngăn đáy qua `NganNoi`.
 * Ghép từ `OHaiTang` (khối đã chuyển thể), `Button`, `Item` (dòng chạm cao của ngăn) — không tự vẽ thành phần.
 */
import { MoreHorizontalIcon, PhoneIcon, RotateCwIcon } from "lucide-react";
import { useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "cn";

import { Badge } from "@/components/reui/badge";
import { ChoTai, NganNoi } from "@/components/bo-cuc";
import { OHaiTang } from "@/components/khoi/solution-agents-2";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { LOI_MO_SO, type KetQuaMoSo } from "../mo-so";
import { NHAN_VIEC, type MucHan, type ViecDong } from "../viec-dong";
import {
  docNganMo,
  ghiNganMo,
  ketQuaCua,
  NHAN_GOI,
  NHAN_KET_QUA,
  goiCoKhoa,
  nutDienThoai,
  taoKhoaGoi,
  xoaNganMo,
  type MaViecDT,
  type MucKetQua,
} from "./goi";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];
export const LOI_CAN_MANG = "Cần mạng để mở số";
const MAU_HAN: Record<MucHan, string> = {
  qua: "text-destructive",
  sap: "text-warning",
  thuong: "",
  khong: "",
};
const MO_TA_KET_QUA: Readonly<Record<MucKetQua, string>> = {
  "da-goi": "Ghi lần gọi đầu, lead rời nhóm",
  "tra-lai": "Lead về telesales để sửa số",
  "con-giu-gia": "Chủ xác nhận còn bán, giữ giá",
  "doi-gia-trang-thai": "Hạ giá hay đổi trạng thái trong hồ sơ căn",
  "khong-nghe": "Đóng, không ghi gì",
};

/** Một việc đã dựng sẵn chữ và lời gọi — màn Hôm nay dựng từ dòng của lưới, thẻ chỉ trình bày. */
export type TheDong = {
  id: string;
  tren: string;
  duoi: string;
  han: { chu: string; muc: MucHan } | null;
  dong: ViecDong;
  /** Dòng có số gọi được: lead của mình; căn mình giữ. */
  coSo: boolean;
  ban: boolean;
  loi?: string;
  /** Việc của máy tính (trừ «Gọi»): bấm hay liên kết. */
  lam: (m: Exclude<MaViecDT, "goi">) => { onClick?: () => void; href?: string };
  /** Chọn một kết quả trong ngăn (trừ «Không nghe máy», không ghi gì). */
  ghiKetQua: (m: Exclude<MucKetQua, "khong-nghe">) => void;
  soCu: string | null;
  moSo: () => Promise<KetQuaMoSo>;
  daMo: (so: string) => void;
};

export type NhomThe = {
  ma: string;
  nhan: string;
  badge: BadgeVariant;
  the: TheDong[];
};

/**
 * Dòng chạm cao của ngăn đáy: `Item` viền (cao từ 48 px nhờ hai tầng chữ của nó) dựng thành vai nút — Enter hay Space bấm
 * như nút; tắt thì không nhận chạm.
 */
function DongCham({
  tat,
  onCham,
  children,
  ...du
}: { tat?: boolean; onCham: () => void; children: ReactNode } & Record<
  `data-${string}`,
  string
>) {
  const cham = () => !tat && onCham();
  return (
    <Item
      variant="outline"
      {...du}
      render={
        <div
          role="button"
          tabIndex={tat ? -1 : 0}
          aria-disabled={tat || undefined}
        />
      }
      className={cn("cursor-pointer", tat && "opacity-50")}
      onClick={cham}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          cham();
        }
      }}
    >
      {children}
    </Item>
  );
}

const nhanCua = (m: MaViecDT) => (m === "goi" ? NHAN_GOI : NHAN_VIEC[m]);

/** Thẻ hai tầng của một việc: một nút ở mép phải, ⋯ mở ngăn đáy kể việc còn lại. */
export function TheViec({
  t,
  coMang,
  onGoi,
}: {
  t: TheDong;
  coMang: boolean;
  onGoi: () => void;
}) {
  const [moKhac, setMoKhac] = useState(false);
  const { chinh, phu } = nutDienThoai(t.dong, t.coSo);
  const lamCua = (m: MaViecDT) => (m === "goi" ? { onClick: onGoi } : t.lam(m));
  const tatCua = (m: MaViecDT) => t.ban || (m === "goi" && !coMang);
  const loiGoi =
    !coMang && (chinh === "goi" || phu.includes("goi")) ? LOI_CAN_MANG : null;
  const nut = chinh
    ? (() => {
        const h = lamCua(chinh);
        return h.href ? (
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<a href={h.href} />}
          >
            {nhanCua(chinh)}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={tatCua(chinh)}
            title={chinh === "goi" && loiGoi ? loiGoi : undefined}
            onClick={h.onClick}
          >
            {chinh === "goi" && (
              <PhoneIcon data-icon="inline-start" aria-hidden="true" />
            )}
            {nhanCua(chinh)}
          </Button>
        );
      })()
    : null;
  return (
    <li
      className="flex items-center gap-2 border-b px-3.5 py-2.5 last:border-b-0"
      data-the-viec={t.id}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <OHaiTang tren={t.tren} duoi={t.duoi} />
        {t.han ? (
          <span className={cn("text-xs", MAU_HAN[t.han.muc])}>{t.han.chu}</span>
        ) : null}
        {t.loi ? (
          <span className="text-destructive text-xs whitespace-normal">
            {t.loi}
          </span>
        ) : loiGoi ? (
          <span className="text-muted-foreground text-xs">{loiGoi}</span>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {nut}
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={`Việc khác của ${t.tren}`}
          disabled={phu.length === 0}
          onClick={() => setMoKhac(true)}
        >
          <MoreHorizontalIcon aria-hidden="true" />
        </Button>
      </div>
      <NganNoi mo={moKhac} onMo={setMoKhac} tieuDe={t.tren} moTa="Việc khác">
        <ViecKhac
          t={t}
          coMang={coMang}
          onGoi={onGoi}
          xong={() => setMoKhac(false)}
        />
      </NganNoi>
    </li>
  );
}

/** Thân ngăn ⋯: việc còn lại của dòng, cùng bộ việc với máy tính. */
export function ViecKhac({
  t,
  coMang,
  onGoi,
  xong,
}: {
  t: TheDong;
  coMang: boolean;
  onGoi: () => void;
  xong: () => void;
}) {
  const { phu } = nutDienThoai(t.dong, t.coSo);
  const lamCua = (m: MaViecDT) => (m === "goi" ? { onClick: onGoi } : t.lam(m));
  const tatCua = (m: MaViecDT) => t.ban || (m === "goi" && !coMang);
  return (
    <ItemGroup className="gap-2 p-3.5" aria-label="Việc khác">
      {phu.map((m) => {
        const h = lamCua(m);
        return (
          <DongCham
            key={m}
            data-viec={m}
            tat={tatCua(m)}
            onCham={() => {
              xong();
              if (h.onClick) h.onClick();
              else if (h.href) window.location.assign(h.href);
            }}
          >
            <ItemContent>
              <ItemTitle>{nhanCua(m)}</ItemTitle>
              {m === "goi" && !coMang ? (
                <ItemDescription>{LOI_CAN_MANG}</ItemDescription>
              ) : null}
            </ItemContent>
          </DongCham>
        );
      })}
    </ItemGroup>
  );
}

/** Ngăn «Kết quả cuộc gọi»: nửa dưới màn, dòng chạm kín bề ngang — ghi kết quả bằng một tay. */
export function NganKetQua({
  t,
  mo,
  onMo,
}: {
  t: TheDong;
  mo: boolean;
  onMo: (mo: boolean) => void;
}) {
  return (
    <NganNoi mo={mo} onMo={onMo} tieuDe="Kết quả cuộc gọi" moTa={t.tren}>
      <KetQuaCuocGoi t={t} xong={() => onMo(false)} />
    </NganNoi>
  );
}

/** Thân ngăn «Kết quả cuộc gọi» — tách ra để bài kiểm dựng thật được (ngăn dùng cổng của trình duyệt). */
export function KetQuaCuocGoi({ t, xong }: { t: TheDong; xong: () => void }) {
  return (
    <ItemGroup className="gap-2 p-3.5" aria-label="Kết quả cuộc gọi">
      {ketQuaCua(t.dong).map((m) => (
        <DongCham
          key={m}
          data-ket-qua={m}
          tat={t.ban}
          onCham={() => {
            xong();
            if (m !== "khong-nghe") t.ghiKetQua(m);
          }}
        >
          <ItemContent>
            <ItemTitle>{NHAN_KET_QUA[m]}</ItemTitle>
            <ItemDescription>{MO_TA_KET_QUA[m]}</ItemDescription>
          </ItemContent>
        </DongCham>
      ))}
    </ItemGroup>
  );
}

type Kho = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const khoPhien = (): Kho | null => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

/** Danh sách thẻ theo nhóm, cùng ba trạng thái của máy tính; giữ ngăn kết quả qua lần trang tải lại. */
export function DanhSachDienThoai({
  trangThai,
  nhom,
  coMang,
  onThuLai,
  trong,
  kho = khoPhien(),
  moTel = (href) => window.location.assign(href),
}: {
  trangThai: "dang" | "loi" | "co";
  nhom: readonly NhomThe[];
  coMang: boolean;
  onThuLai: () => void;
  trong: ReactNode;
  kho?: Kho | null;
  moTel?: (href: string) => void;
}) {
  // Quay lại app sau cuộc gọi — kể cả trang đã tải lại: ngăn của đúng dòng còn ghi trên máy thì mở lại.
  const [nganMo, setNganMo] = useState<string | null>(() => docNganMo(kho));
  const [loiGoi, setLoiGoi] = useState<Record<string, string>>({});
  const [khoa] = useState(taoKhoaGoi);
  const [dangGoi, setDangGoi] = useState<ReadonlySet<string>>(new Set());

  if (trangThai === "dang") return <ChoTai kieu="tran" />;
  if (trangThai === "loi")
    return (
      <TrangThai
        kind="error"
        title={
          coMang ? "Chưa tải được Hôm nay" : "Mất mạng — chưa tải được Hôm nay"
        }
        hanhDong={
          <Button size="sm" variant="outline" onClick={onThuLai}>
            <RotateCwIcon data-icon="inline-start" />
            Thử lại
          </Button>
        }
      />
    );
  const tatCa = nhom.flatMap((g) => g.the);
  if (tatCa.length === 0) return <>{trong}</>;

  const goi = (t: TheDong) => {
    // Đang mở số ở dòng này thì chạm lần nữa bị bỏ qua: mỗi dòng mở số một lần (AC-4).
    if (khoa.dang(t.id)) return;
    setDangGoi((s) => new Set(s).add(t.id));
    setLoiGoi((m) => ({ ...m, [t.id]: "" }));
    void goiCoKhoa(khoa, t.id, {
      soCu: t.soCu,
      moSo: t.moSo,
      daMo: t.daMo,
      moTel,
      moNgan: () => {
        ghiNganMo(kho, t.id);
        setNganMo(t.id);
      },
    })
      .then((kq) => {
        if (kq && !kq.ok) setLoiGoi((m) => ({ ...m, [t.id]: kq.loi || LOI_MO_SO.khac }));
      })
      .finally(() => {
        setDangGoi((s) => {
          const con = new Set(s);
          con.delete(t.id);
          return con;
        });
      });
  };
  const dongNgan = (mo: boolean) => {
    if (mo) return;
    xoaNganMo(kho);
    setNganMo(null);
  };
  const theNgan = nganMo ? tatCa.find((t) => t.id === nganMo) : undefined;

  return (
    <div className="flex flex-col" aria-label="Việc hôm nay">
      {nhom.map((g) => (
        <section key={g.ma} aria-label={g.nhan} data-nhom-the={g.ma}>
          <header className="bg-muted/40 flex items-center gap-1.5 border-b px-3.5 py-2">
            <h3 className="text-sm font-medium">{g.nhan}</h3>
            <Badge variant={g.badge}>{g.the.length}</Badge>
          </header>
          <ul className="flex flex-col">
            {g.the.map((t) => (
              <TheViec
                key={t.id}
                t={{ ...t, ban: t.ban || dangGoi.has(t.id), loi: loiGoi[t.id] || t.loi }}
                coMang={coMang}
                onGoi={() => goi(t)}
              />
            ))}
          </ul>
        </section>
      ))}
      {theNgan ? <NganKetQua t={theNgan} mo onMo={dongNgan} /> : null}
    </div>
  );
}
