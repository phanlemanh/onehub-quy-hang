"use client";

import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockKeyholeIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { layMaDoi, xoaMaDoi } from "@/lib/ma-doi";

// Ô mật khẩu theo ô của màn đăng nhập (`@reui/auth-15`, hàng 93): InputGroup có biểu tượng đầu ô, nút hiện/ẩn cuối ô, lời
// dặn dưới ô, lỗi gắn dưới ô (KH-xt-loi-gan-o). Độ dài và danh sách kiểm ở máy chủ; câu lý do theo mã trả về.
// Tiêu đề của TrangThai một dòng (bị cắt khi dài): câu ST-dat-mat-khau-het-phien tách tiêu đề và mô tả.
export const HET_PHIEN = { title: "Phiên đặt mật khẩu đã hết", description: "Đăng nhập lại bằng mật khẩu tạm." };
const CHU_LOI: Record<string, string> = {
  "password-too-short": "Cần ít nhất 8 ký tự",
  "password-too-long": "Mật khẩu dài quá 128 ký tự",
  "password-common": "Mật khẩu quá dễ đoán",
  "password-guessable": "Mật khẩu quá dễ đoán",
};

export function FormDatMatKhau() {
  const router = useRouter();
  const [ma, setMa] = useState<string | null>(() => layMaDoi());
  const [matKhau, setMatKhau] = useState("");
  const [hien, setHien] = useState(false);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");

  if (!ma) {
    return (
      <TrangThai
        kind="notice"
        title={HET_PHIEN.title}
        description={HET_PHIEN.description}
        hanhDong={
          <Button size="sm" nativeButton={false} render={<Link href="/login" />}>
            Về đăng nhập
          </Button>
        }
      />
    );
  }

  async function luu(e: FormEvent) {
    e.preventDefault();
    setDangGui(true);
    setLoi("");
    try {
      const res = await fetch("/api/v1/auth/password/first", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ changeToken: ma, newPassword: matKhau }),
      });
      if (res.ok) {
        xoaMaDoi();
        router.replace("/");
        router.refresh();
        return;
      }
      const code = ((await res.json().catch(() => ({}))) as { error?: string }).error ?? "";
      if (res.status === 403) {
        xoaMaDoi();
        setMa(null);
        return;
      }
      setLoi(CHU_LOI[code] ?? "Có lỗi, thử lại sau ít phút.");
    } catch {
      setLoi("Có lỗi, thử lại sau ít phút.");
    } finally {
      setDangGui(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={luu}>
      <FieldGroup className="gap-4">
        <Field className="gap-2" data-invalid={loi ? true : undefined}>
          <FieldLabel htmlFor="mat-khau-moi">Mật khẩu mới</FieldLabel>
          <InputGroup className="bg-background">
            <InputGroupAddon>
              <LockKeyholeIcon aria-hidden="true" className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              id="mat-khau-moi"
              type={hien ? "text" : "password"}
              required
              autoFocus
              autoComplete="new-password"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label={hien ? "Ẩn mật khẩu" : "Hiện mật khẩu"} onClick={() => setHien(!hien)}>
                {hien ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>Ít nhất 8 ký tự — một câu ngắn có dấu là dễ nhớ</FieldDescription>
          {loi && <FieldError role="alert">{loi}</FieldError>}
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={dangGui}>
        {dangGui ? "Đang lưu…" : "Lưu và vào Quỹ hàng"}
        <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
      </Button>
    </form>
  );
}
