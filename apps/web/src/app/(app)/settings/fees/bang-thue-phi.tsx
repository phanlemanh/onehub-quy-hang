"use client";

// Thân mục Thuế phí (hàng 49): chuyển thể settings-3 (MucCaiDatKhoi + SettingField, khối đã chuyển thể của nhóm
// cai-dat-san) như mục chia lead — một Frame, ba dòng khoản, chân Hoàn lại · Lưu. Mỗi dòng: công tắc «Tính vào giá bao phí»
// và tỉ lệ; môi giới sửa được, thuế và lệ phí ghi «theo luật» (Hỏi-1). Phần thuần ở `./thue-phi`. Lưu một lần qua lối
// chung, chỉ khoá đã đổi.
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

import { MucCaiDatKhoi } from "@/components/khoi/settings-3/muc-cai-dat";
import { SettingField } from "@/components/khoi/settings-3/setting-field";
import { NumberField, NumberFieldDecrement, NumberFieldGroup, NumberFieldIncrement, NumberFieldInput } from "@/components/reui/number-field";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";

import type { BanCauHinh } from "../lead-routing/luat";
import { CAU_PHAM_VI, doiCongTac, dongThuePhi, giaTriPhi, lenhLuu, THEO_LUAT, THONG_BAO_LUU, viDu, type GiaTriPhi } from "./thue-phi";

const KHUNG_BAO = "thue-phi";
const BAO_403 = "Chỉ quản trị sàn đổi được thuế phí";

type LoiDong = { o: "moi_gioi" | "cong-tac"; chu: string } | null;

export function BangThuePhi({ tieuDe, cauHinh: dau, tenNguoi }: { tieuDe: string; cauHinh: BanCauHinh | null; tenNguoi: Record<string, string> | null }) {
  const router = useRouter();
  const [cauHinh, setCauHinh] = useState<BanCauHinh | null>(dau);
  const dangAp = useMemo(() => (cauHinh ? giaTriPhi(cauHinh) : null), [cauHinh]);
  const [nhap, setNhap] = useState<GiaTriPhi | null>(dangAp);
  const [loiMay, setLoiMay] = useState<LoiDong>(null);
  const [loiChung, setLoiChung] = useState<{ cau: string; thuLai: boolean } | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const ten = useMemo(() => (tenNguoi ? new Map(Object.entries(tenNguoi)) : null), [tenNguoi]);

  if (!cauHinh || !dangAp || !nhap) {
    return (
      <TrangThai
        kind="error"
        title="Chưa tải được thuế phí của sàn"
        hanhDong={
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>
            Thử lại
          </Button>
        }
      />
    );
  }

  const lenh = lenhLuu(dangAp, nhap);
  const loi: LoiDong = loiMay ?? ("loi" in lenh ? lenh.loi : null);
  const coDoi = !("khongDoi" in lenh);
  const doi = (moi: GiaTriPhi) => {
    setNhap(moi);
    setLoiMay(null);
    setLoiChung(null);
  };

  async function luu() {
    if (!("than" in lenh)) return;
    setDangLuu(true);
    setLoiChung(null);
    try {
      const r = await fetch("/api/v1/company/settings", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(lenh.than),
      });
      if (r.ok) {
        const moi = (await r.json()) as BanCauHinh;
        setCauHinh(moi);
        setNhap(giaTriPhi(moi));
        toast.success(THONG_BAO_LUU, { toasterId: KHUNG_BAO });
        router.refresh();
      } else if (r.status === 403) {
        setLoiChung({ cau: BAO_403, thuLai: false });
      } else {
        const lyDo = ((await r.json().catch(() => null)) as { reason?: string } | null)?.reason ?? "";
        if (lyDo.startsWith("fee.brokerage_pct")) setLoiMay({ o: "moi_gioi", chu: "Môi giới từ 0 tới 5%, bước 0,1" });
        else if (lyDo.startsWith("fee.inclusion")) setLoiMay({ o: "cong-tac", chu: "Bao phí cần ít nhất một khoản" });
        else setLoiChung({ cau: lyDo ? `Máy chủ không nhận: ${lyDo}` : "Máy chủ không nhận lần lưu này", thuLai: false });
      }
    } catch {
      setLoiChung({ cau: "Chưa lưu được — mất kết nối tới máy chủ", thuLai: true });
    } finally {
      setDangLuu(false);
    }
  }

  const ds = dongThuePhi(cauHinh, nhap, ten);
  const vd = viDu(nhap);
  const chan = (
    <>
      <Button variant="outline" onClick={() => doi(dangAp)} disabled={dangLuu || !coDoi}>
        Hoàn lại
      </Button>
      <Button onClick={luu} disabled={dangLuu || !("than" in lenh)}>
        {dangLuu ? <Spinner data-icon="inline-start" /> : null}
        Lưu
      </Button>
    </>
  );

  return (
    <>
      <MucCaiDatKhoi tieuDe={tieuDe} chan={chan}>
        <div className="flex flex-col gap-3 px-4 pt-4">
          <p className="text-xs text-muted-foreground">{CAU_PHAM_VI}</p>
          {loiChung ? (
            <TrangThai
              kind="error"
              title={loiChung.cau}
              hanhDong={
                loiChung.thuLai ? (
                  <Button variant="outline" size="sm" onClick={luu}>
                    Thử lại
                  </Button>
                ) : undefined
              }
            />
          ) : null}
        </div>
        {ds.map((d, j) => (
          <SettingField key={d.ma} title={d.ten} description={d.suaDuoc ? "Sàn đặt" : `${d.tiLeChu} · ${THEO_LUAT}`} labelFor={`bat-${d.ma}`} last={j === ds.length - 1}>
            <div className="flex flex-col gap-1.5" data-khoan={d.ma}>
              <label className="flex items-center gap-2 text-sm">
                <Switch id={`bat-${d.ma}`} checked={d.bat} onCheckedChange={(v) => doi(doiCongTac(nhap, d.ma, v))} disabled={dangLuu} />
                Tính vào giá bao phí
              </label>
              {d.suaDuoc ? (
                <NumberField
                  id={`ti-le-${d.ma}`}
                  value={nhap.moiGioi}
                  onValueChange={(n) => doi({ ...nhap, moiGioi: n })}
                  step={0.1}
                  locale="vi-VN"
                  disabled={dangLuu}
                  aria-label={`${d.ten} (%)`}
                >
                  <NumberFieldGroup>
                    <NumberFieldDecrement />
                    <NumberFieldInput aria-invalid={loi?.o === "moi_gioi" ? true : undefined} />
                    <NumberFieldIncrement />
                  </NumberFieldGroup>
                </NumberField>
              ) : (
                <p className="text-sm" data-ti-le>
                  {d.tiLeChu} · {THEO_LUAT}
                </p>
              )}
              {/* Ô không kẹp min/max: số ngoài khoảng ở lại để câu lỗi hiện và Lưu khoá (E2a ca sai). */}
              {loi?.o === "moi_gioi" && d.suaDuoc ? <FieldError id="loi-moi-gioi">{loi.chu}</FieldError> : null}
              {loi?.o === "cong-tac" && j === ds.length - 1 ? <FieldError id="loi-cong-tac">{loi.chu}</FieldError> : null}
              <p id={`nguon-${d.ma}`} className="text-xs text-muted-foreground">
                {d.nguon}
              </p>
            </div>
          </SettingField>
        ))}
        {vd ? <p className="px-4 pb-4 text-xs text-muted-foreground">{vd}</p> : null}
      </MucCaiDatKhoi>
      <Toaster id={KHUNG_BAO} position="bottom-center" />
    </>
  );
}
