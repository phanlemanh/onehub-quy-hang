"use client";

// Thân điện thoại của hồ sơ căn (dưới 768 px; hồ sơ ho-so-dien-thoai-product-detail-5) — lối ReUI `product-detail-5`, dùng
// lại bản của trang khách (`app/s/[code]/chi-tiet.tsx`, Cổng Phạm vi Hỏi-1b): ảnh lớn lướt ngang → mã căn · toà, trạng thái,
// Diện tích · Phòng ngủ · Hướng → hộp giá → các mục còn lại của thân cột → một nút chính dính đáy theo cờ của lõi. Dựng
// thuần từ cùng mô hình với thân cột (`mo-hinh.ts`): không mất mục nào, không tự lọc trường.
import Link from "next/link";
import { PhoneCall } from "lucide-react";
import { useState } from "react";

import { ChoTai } from "@/components/bo-cuc/cho-tai";
import { Badge } from "@/components/reui/badge";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MucAnhCan } from "../../photos/muc-anh-can";
import { nguonApi } from "../../photos/nguon-api";
import { NEO_MUC_ANH } from "../../ready/nut-san-sang";
import { luc, NHAN_GHI_CUOC_GOI, nutChinh, type HoSoCo, type MoHinhHoSo } from "../mo-hinh";
import { NutBaoSai } from "../nut-bao-sai";
import { NutHoiDauChu } from "../nut-hoi-dau-chu";
import { KhongNhieu, LoiTaiDau, NutDong, NutToanMan, PhanLichSu, type HanhDongHoSo, type KheHoSo } from "../than-cot";
import { CapGiaTri, doiUrl, Muc, ngay } from "../than-chung";
import { AnhLon, useAnhCan, type TrangThaiAnh } from "./anh-lon";
import { ChupAnh } from "./chup-anh";

/** Nút «Chụp ảnh» (hàng 41, AC-1): chỉ khi API ảnh đã trả và cho sửa (`suaDuoc`), và căn có mã — không rẽ theo tên vai. */
export const coNutChup = (anh: TrangThaiAnh, chuaMa: boolean): boolean => !chuaMa && anh.kind === "co" && anh.ds.suaDuoc;

/** Số việc lịch sử thân điện thoại trình trước «Xem cả». */
export const LICH_SU_GON = 3;

function LichSuGon({ m }: { m: HoSoCo }) {
  const [ca, setCa] = useState(false);
  const ds = ca ? m.lichSu : m.lichSu.slice(0, LICH_SU_GON);
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-3 text-sm">
        {ds.map((d, i) => (
          <li key={i} className="flex items-baseline justify-between gap-3">
            <span className="min-w-0">
              {d.viec}
              {d.chiTiet ? <span className="text-muted-foreground"> · {d.chiTiet}</span> : null}
              <span className="block text-xs text-muted-foreground">{d.nguoi}</span>
            </span>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{luc(d.luc)}</span>
          </li>
        ))}
      </ul>
      {m.lichSu.length > LICH_SU_GON ? (
        <div>
          <Button variant="ghost" size="sm" onClick={() => setCa((v) => !v)}>
            {ca ? "Thu gọn" : `Xem cả ${m.lichSu.length} việc`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** Nút chính dính đáy khung nhìn, kín bề ngang, vùng chạm 44 px — chọn bằng `nutChinh` của mô hình. */
export function NutChinhDinhDay({ m }: { m: HoSoCo }) {
  const nut = nutChinh({ co: m.co, chuaMa: m.chuaMa !== null, canId: m.can.id });
  if (!nut) return null;
  if (nut.kind === "hoi-dau-chu") return <NutHoiDauChu key={m.can.id} listingId={m.can.id} dauChu={m.dauChu} ma={m.ma} toa={m.toa} lon />;
  return (
    <div className="sticky bottom-0 z-10 flex flex-col border-t bg-background p-4" data-slot="ghi-cuoc-goi">
      <Button className="h-11 w-full" size="lg" nativeButton={false} render={<Link href={nut.href} />}>
        <PhoneCall />
        {NHAN_GHI_CUOC_GOI}
      </Button>
    </div>
  );
}

export function ThanDienThoai({ m, khe, hd, anh, urlAnh }: { m: MoHinhHoSo; khe: KheHoSo; hd: HanhDongHoSo; anh: TrangThaiAnh; urlAnh: (id: string) => string }) {
  if (m.kind === "loi") return <LoiTaiDau moTa={m.moTa} thuNgay={hd.thuNgay} />;
  if (m.kind === "cho-tai") return <ChoTai kieu="ho-so" dienThoai />;
  if (m.kind === "nhieu") return <KhongNhieu m={m} />;
  if (m.kind === "khong") {
    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="flex justify-end">
          <NutDong href={m.dongHref} />
        </div>
        <TrangThai
          kind="notice"
          title={m.theoHang ? "Không thấy hàng này" : "Không thấy căn"}
          description={m.theoHang ? "Hàng này không có trong hàng bạn thấy trên máy này." : `Mã «${m.ma}» không có trong hàng bạn thấy trên máy này.`}
          hanhDong={
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/inventory" />}>
              Về Bảng hàng
            </Button>
          }
        />
      </div>
    );
  }

  const { can, chuaMa, tt } = m;
  return (
    <div className="flex flex-col" data-slot="ho-so-can" data-than="dien-thoai">
      <div className="flex flex-col gap-4 p-4">
        <div className="relative">
          <AnhLon anh={anh} co={m.co} urlAnh={urlAnh} />
          {/* Chụp ảnh khi đi xem nhà (hàng 41): chỉ khi API ảnh cho sửa — người giữ căn và trưởng nhóm. */}
          {coNutChup(anh, !!chuaMa) ? <ChupAnh toa={m.toa} ma={m.ma} thayNoiBo={anh.kind === "co" && anh.ds.noiBo === "thay"} /> : null}
        </div>
        <div className="flex flex-col gap-1" data-khoi="ten">
          <div className="flex min-h-7 items-center justify-between gap-2">
            <Badge variant={m.dangXem.dangMo ? "success-light" : "outline"}>{m.dangXem.trangThai}</Badge>
            <div className="flex gap-1">
              <NutToanMan href={m.moToanMan} />
              <NutDong href={m.dongHref} />
            </div>
          </div>
          {chuaMa ? (
            <h2 className="text-xl font-semibold tracking-tight text-muted-foreground">Chưa có mã căn · {m.toa}</h2>
          ) : (
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {m.ma} · {m.toa}
            </h2>
          )}
          {m.dauCot ? <p className="text-sm text-muted-foreground">{m.dauCot}</p> : null}
          {m.thongSo ? (
            <dl className="grid grid-cols-3 gap-2 pt-1" aria-label="Thông số chính" data-muc="thong-so">
              {m.thongSo.map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
        <Separator />
        <div className="flex flex-col gap-2" aria-label="Giá và mức đủ" data-khoi="gia">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums">{m.gia}</span>
            {m.phi ? <Badge variant="outline">{m.phi}</Badge> : null}
          </div>
          <p className="text-xs text-muted-foreground">{m.xacNhan}</p>
          {m.banTrenMay ? (
            <p className="text-xs text-muted-foreground" data-trang-thai="tren-may">
              {m.banTrenMay}
            </p>
          ) : null}
          <div className="flex flex-col gap-2 pt-1" data-muc="muc-du">
            <Progress value={(m.mucDu.co / m.mucDu.tren) * 100} aria-label="Mức đủ thông tin" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{m.mucDu.chu}</span>
              <span className="tabular-nums">
                {m.mucDu.co}/{m.mucDu.tren}
              </span>
            </div>
          </div>
        </div>
      </div>
      <Separator />
      <Muc
        tieuDe="Thuộc tính căn"
        muc="thuoc-tinh"
        khoi="muc"
        phai={
          m.coBaoSai && tt?.kind === "co" ? (
            <div className="contents" data-muc="bao-sai">
              <NutBaoSai ma={m.ma} toa={m.toa} khu={tt.khu} truong={tt.truong} />
            </div>
          ) : null
        }
      >
        {chuaMa ? (
          <>
            <div className="contents" data-muc="o-ma">
              {khe.oMa}
            </div>
            <CapGiaTri ds={[["Toà", m.toa]]} />
          </>
        ) : tt?.kind === "co" ? (
          <CapGiaTri ds={tt.truong} muc="chu-khoa" />
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có trong danh mục</p>
        )}
      </Muc>
      <Separator />
      <Muc tieuDe={m.dangXem.dangMo ? "Lần rao đang mở" : "Lần rao đang xem"} muc="lan-rao" khoi="muc">
        {m.hienSanSang ? khe.sanSang : null}
        <CapGiaTri ds={m.truongLanRao} />
      </Muc>
      <Separator />
      <Muc tieuDe="Các lần rao" muc="cac-lan-rao" khoi="muc">
        <ul className="flex flex-col gap-1 text-sm">
          {m.lan.map((r) => (
            <li key={r.id}>
              <a
                href={r.href}
                onClick={doiUrl(r.href)}
                aria-current={r.id === can.id ? "true" : undefined}
                className="flex min-h-11 items-center justify-between gap-2 rounded-md px-2 py-1 transition-colors hover:bg-accent aria-[current=true]:bg-accent"
              >
                <span className="flex items-center gap-2">
                  Lần {r.thu}
                  <Badge variant={r.dangMo ? "success-light" : "outline"}>{r.trangThai}</Badge>
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {r.gia} · {r.tu ? ngay(r.tu) : "…"}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Muc>
      <Separator />
      <Muc tieuDe="Ảnh" id={NEO_MUC_ANH} muc="anh" khoi="muc">
        {chuaMa ? <p className="text-sm text-muted-foreground">Ảnh gắn theo toà và mã căn — gắn mã căn rồi tải ảnh.</p> : <MucAnhCan toa={m.toa} ma={m.ma} />}
      </Muc>
      <Separator />
      <Muc tieuDe="Lịch sử" muc="lich-su" khoi="muc" phai={m.ttls.kind === "tren-may" ? <span className="text-xs text-muted-foreground">{m.ttls.chu}</span> : null}>
        <PhanLichSu m={m} hd={hd}>
          <LichSuGon m={m} />
        </PhanLichSu>
      </Muc>
      <NutChinhDinhDay m={m} />
    </div>
  );
}

/** Thân điện thoại nối API ảnh: danh sách ảnh của căn đọc đúng đường của mục Ảnh. */
export function ThanDienThoaiCan({ m, khe, hd }: { m: MoHinhHoSo; khe: KheHoSo; hd: HanhDongHoSo }) {
  const toa = m.kind === "co" ? m.toa : "";
  const ma = m.kind === "co" && !m.chuaMa ? m.ma : null;
  const anh = useAnhCan(toa, ma);
  const urlAnh = (id: string) => nguonApi(toa, ma ?? "").urlAnh(id, "original");
  return <ThanDienThoai m={m} khe={khe} hd={hd} anh={anh} urlAnh={urlAnh} />;
}
