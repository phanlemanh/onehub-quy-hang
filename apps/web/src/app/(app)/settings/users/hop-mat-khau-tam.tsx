"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Hộp kết quả cấp mật khẩu tạm (dang-nhap-mat-khau, ST-cap-mat-khau-ket-qua): mật khẩu hiện đúng một lần, chữ đơn cách
// chia bốn nhóm, «Chép» đổi thành «Đã chép» hai giây. Đóng hộp là mất — máy chủ không lưu bản rõ.
export type KetQuaCap = { email: string; tempPassword: string };

export const nhomBon = (s: string) => s.match(/.{1,4}/g)?.join("-") ?? s;

export function HopMatKhauTam({ ketQua, onClose }: { ketQua: KetQuaCap | null; onClose: () => void }) {
  const [daChep, setDaChep] = useState(false);
  useEffect(() => {
    if (!daChep) return;
    const t = setTimeout(() => setDaChep(false), 2000);
    return () => clearTimeout(t);
  }, [daChep]);

  return (
    <Dialog open={ketQua !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mật khẩu tạm của {ketQua?.email}</DialogTitle>
          <DialogDescription>
            Trao tận tay cho {ketQua?.email}. Mật khẩu hết hạn sau 72 giờ, đóng hộp này là không xem lại được.
          </DialogDescription>
        </DialogHeader>
        <p className="font-mono text-lg font-semibold tracking-wide tabular-nums select-all">{ketQua ? nhomBon(ketQua.tempPassword) : ""}</p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              if (!ketQua) return;
              void navigator.clipboard?.writeText(nhomBon(ketQua.tempPassword)).then(() => setDaChep(true));
            }}
          >
            {daChep ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
            {daChep ? "Đã chép" : "Chép"}
          </Button>
          <Button onClick={onClose}>Xong</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
