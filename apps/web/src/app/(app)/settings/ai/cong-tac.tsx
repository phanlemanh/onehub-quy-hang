"use client";

import { useEffect, useState } from "react";

import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import type { TrangThaiAi } from "@/lib/nhap/de-xuat";
import { batTatAi, docTrangThaiAi, laLoi } from "@/lib/nhap/goi-api";

/** Công tắc «Xử lý bằng AI» của Quản trị sàn (hàng 68): đọc trạng thái ở trình duyệt để lỗi đọc có «Thử lại». */
export function CongTacAi() {
  const [tt, setTt] = useState<TrangThaiAi | null>(null);
  const [loi, setLoi] = useState(false);
  const [dangDoi, setDangDoi] = useState(false);
  const [loiDoi, setLoiDoi] = useState<string | null>(null);

  const nhan = (r: Awaited<ReturnType<typeof docTrangThaiAi>>) => {
    if (laLoi(r)) return setLoi(true);
    setLoi(false);
    setTt(r);
  };
  const doc = async () => {
    setLoi(false);
    setTt(null);
    nhan(await docTrangThaiAi(fetch));
  };
  useEffect(() => {
    void docTrangThaiAi(fetch).then(nhan);
  }, []);

  if (loi)
    return (
      <TrangThai
        kind="error"
        title="Chưa đọc được trạng thái AI"
        hanhDong={
          <Button type="button" variant="outline" onClick={() => void doc()}>
            Thử lại
          </Button>
        }
      />
    );
  if (!tt) return <TrangThai kind="loading" title="Đang đọc trạng thái AI…" />;

  const doi = async (bat: boolean) => {
    setDangDoi(true);
    setLoiDoi(null);
    const r = await batTatAi(fetch, bat);
    setDangDoi(false);
    if (r !== true) return setLoiDoi("Chưa đổi được — thử lại.");
    await doc();
  };

  return (
    <div className="flex flex-col gap-4">
      <Field orientation="horizontal" className="items-start justify-between gap-4">
        <span className="flex flex-col gap-1">
          <FieldLabel htmlFor="xu-ly-bang-ai">Xử lý bằng AI</FieldLabel>
          <FieldDescription>
            Khi nhập bảng hàng, máy gửi tiêu đề, dạng cột và giá trị mã căn, giá, phí, trạng thái để AI đề xuất cách ghép. Không
            gửi chủ nhà, số điện thoại, giá đáy, ghi chú hay tên người.
          </FieldDescription>
        </span>
        <Switch id="xu-ly-bang-ai" checked={tt.bat} disabled={dangDoi} onCheckedChange={(v) => void doi(Boolean(v))} />
      </Field>
      {tt.bat && tt.daDungUsd !== null ? (
        <p className="text-muted-foreground text-sm">
          Tháng này đã dùng {tt.daDungUsd.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} / {tt.tranThangUsd.toLocaleString("vi-VN")} USD
        </p>
      ) : null}
      {tt.bat && !tt.conTran ? <TrangThai kind="notice" title="Đã hết trần tháng này — nhập đang chạy không AI" /> : null}
      {tt.bat && !tt.sanSang ? <TrangThai kind="notice" title="AI chưa sẵn sàng trên máy chủ" description="Nhập vẫn chạy, cột chưa ghép để người ghép tay." /> : null}
      {loiDoi ? <TrangThai kind="error" title={loiDoi} /> : null}
    </div>
  );
}
