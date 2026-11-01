"use client";

// Bảng soạn «Báo sai thông tin căn» (hàng 17, Hỏi-1): chọn thuộc tính, gõ giá trị đúng, rồi chép và mở bảng chia sẻ của
// thiết bị — người là người bấm gửi (bất biến 3). Không lời gọi mạng nào.
import { Flag } from "lucide-react";
import { useState } from "react";

import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { chiaSe, coGui, noiDungBaoSai, TRAN_DUNG, TRAN_GHI_CHU } from "./bao-sai";

const KET_QUA: Record<"chia-se" | "da-chep" | "huy" | "loi", string | null> = {
  "chia-se": "Đã mở bảng chia sẻ",
  "da-chep": "Đã chép",
  huy: null,
  loi: "Máy này không chép hay chia sẻ được — chọn và chép tay nội dung dưới đây",
};

export function NutBaoSai({ ma, toa, khu, truong }: { ma: string; toa: string; khu: string; truong: [string, string][] }) {
  const [mo, setMo] = useState(false);
  const [chon, setChon] = useState(truong[0]?.[0] ?? "");
  const [dung, setDung] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [bao, setBao] = useState<string | null>(null);
  const dangHien = truong.find(([k]) => k === chon)?.[1] ?? "—";
  const noiDung = noiDungBaoSai({ ma, toa, khu, truong: chon, dangHien, dung, ghiChu });

  const doi = (v: boolean) => {
    setMo(v);
    if (!v) {
      setDung("");
      setGhiChu("");
      setBao(null);
    }
  };

  // Gọi chia sẻ ngay trong lượt bấm — không chờ gì trước đó, kẻo thiết bị từ chối vì mất cử chỉ của người.
  const gui = () => {
    void chiaSe(noiDung, navigator).then((kq) => setBao(KET_QUA[kq]));
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => doi(true)}>
        <Flag />
        Báo sai thông tin căn
      </Button>
      <Dialog open={mo} onOpenChange={doi}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Báo sai thông tin căn {ma}</DialogTitle>
            <DialogDescription>Thuộc tính căn lấy từ danh mục dùng chung — sàn không tự sửa. Báo để đội vận hành sửa.</DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel>Thuộc tính sai</FieldLabel>
            <Select value={chon} onValueChange={(v) => setChon(String(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {truong.map(([k]) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="bao-sai-dung">Giá trị đúng</FieldLabel>
            <Input id="bao-sai-dung" value={dung} maxLength={TRAN_DUNG} placeholder={`Đang hiện: ${dangHien}`} onChange={(e) => setDung(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="bao-sai-ghi-chu">Ghi chú</FieldLabel>
            <Textarea id="bao-sai-ghi-chu" value={ghiChu} maxLength={TRAN_GHI_CHU} placeholder="Căn cứ: sổ hồng, bản vẽ…" onChange={(e) => setGhiChu(e.target.value)} />
          </Field>
          {bao ? <TrangThai kind="notice" title={bao} /> : null}
          {bao === KET_QUA.loi ? <Textarea readOnly aria-label="Nội dung báo sai" value={noiDung} rows={7} onFocus={(e) => e.currentTarget.select()} /> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => doi(false)}>
              Huỷ
            </Button>
            <Button disabled={!coGui({ dung, ghiChu })} onClick={gui}>
              Chép và mở bảng chia sẻ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
