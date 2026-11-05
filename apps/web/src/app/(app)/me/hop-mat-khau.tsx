"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { canMatKhauHienTai, loiHopMatKhau, nutMatKhau, type TrangThaiMatKhau } from "./toi";

// Hộp đặt hay đổi mật khẩu ở Cá nhân (dang-nhap-mat-khau, ST-toi-mat-khau-hop): «Đã đặt» thì hỏi mật khẩu hiện tại và
// mật khẩu mới; chưa đặt hay đã khoá thì chỉ mật khẩu mới — người đã vào bằng mã. Lỗi gắn dưới ô.
function OMatKhau({
  id,
  nhan,
  giaTri,
  doi,
  goiY,
  loi,
  tuDien,
}: {
  id: string;
  nhan: string;
  giaTri: string;
  doi: (v: string) => void;
  goiY?: string;
  loi?: string;
  tuDien: "current-password" | "new-password";
}) {
  const [hien, setHien] = useState(false);
  return (
    <Field className="gap-2" data-invalid={loi ? true : undefined}>
      <FieldLabel htmlFor={id}>{nhan}</FieldLabel>
      <InputGroup className="bg-background">
        <InputGroupInput
          id={id}
          type={hien ? "text" : "password"}
          required
          autoComplete={tuDien}
          value={giaTri}
          onChange={(e) => doi(e.target.value)}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={hien ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            onClick={() => setHien(!hien)}
          >
            {hien ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {goiY ? <FieldDescription>{goiY}</FieldDescription> : null}
      {loi ? <FieldError role="alert">{loi}</FieldError> : null}
    </Field>
  );
}

export function HopMatKhau({
  mo,
  trangThai,
  onClose,
  onXong,
}: {
  mo: boolean;
  trangThai: TrangThaiMatKhau;
  onClose: () => void;
  onXong: () => void;
}) {
  const [hienTai, setHienTai] = useState("");
  const [moi, setMoi] = useState("");
  const [loiHienTai, setLoiHienTai] = useState("");
  const [loiMoi, setLoiMoi] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const canHienTai = canMatKhauHienTai(trangThai);

  const dong = () => {
    setHienTai("");
    setMoi("");
    setLoiHienTai("");
    setLoiMoi("");
    onClose();
  };

  async function luu(e: FormEvent) {
    e.preventDefault();
    setDangGui(true);
    setLoiHienTai("");
    setLoiMoi("");
    try {
      const res = await fetch("/api/v1/me/password", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          canHienTai
            ? { currentPassword: hienTai, newPassword: moi }
            : { newPassword: moi },
        ),
      });
      if (res.ok) {
        dong();
        onXong();
        return;
      }
      const code =
        ((await res.json().catch(() => ({}))) as { error?: string }).error ??
        "";
      const loi = loiHopMatKhau(code);
      if (loi.o === "hien-tai") setLoiHienTai(loi.cau);
      else setLoiMoi(loi.cau);
    } catch {
      setLoiMoi("Có lỗi, thử lại sau ít phút.");
    } finally {
      setDangGui(false);
    }
  }

  return (
    <Dialog open={mo} onOpenChange={(o) => !o && dong()}>
      <DialogContent>
        <form className="flex flex-col gap-4" onSubmit={luu}>
          <DialogHeader>
            <DialogTitle>{nutMatKhau(trangThai)}</DialogTitle>
            <DialogDescription>
              Đổi xong, các máy khác của bạn bị đăng xuất; máy này giữ nguyên.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            {canHienTai ? (
              <OMatKhau
                id="mat-khau-hien-tai"
                nhan="Mật khẩu hiện tại"
                giaTri={hienTai}
                doi={setHienTai}
                loi={loiHienTai}
                tuDien="current-password"
              />
            ) : null}
            <OMatKhau
              id="mat-khau-moi"
              nhan="Mật khẩu mới"
              giaTri={moi}
              doi={setMoi}
              goiY="Ít nhất 8 ký tự — một câu ngắn có dấu là dễ nhớ"
              loi={loiMoi}
              tuDien="new-password"
            />
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={dong}>
              Huỷ
            </Button>
            <Button type="submit" disabled={dangGui}>
              {dangGui ? "Đang lưu…" : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
