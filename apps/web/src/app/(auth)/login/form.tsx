"use client";

import { ArrowRightIcon, EyeIcon, EyeOffIcon, KeyRoundIcon, LockKeyholeIcon, MailIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { datMaDoi } from "@/lib/ma-doi";

// Ô email và ô mã theo `@reui/auth-15` (hàng 93): InputGroup có biểu tượng đầu ô, lời dặn dưới ô, nút rộng trọn cột.
// Luồng, chữ lỗi và đường API giữ nguyên hàng 6. Bước «mật khẩu» (dang-nhap-mat-khau, Hỏi-2): email trước, nút phụ
// «Dùng mật khẩu» mở ô mật khẩu trên cùng màn; mật khẩu tạm đưa sang «Đặt mật khẩu mới» với mã đổi trong bộ nhớ trang.

type Buoc = "email" | "ma" | "mat-khau";
type Loi = "" | "invalid-code" | "code-expired" | "too-many-requests" | "khac" | LoiMatKhau;
type LoiMatKhau = "invalid-email-or-password" | "password-rate-limited" | "password-disabled" | "temp-password-expired";

const CHU_LOI: Record<Exclude<Loi, "">, string> = {
  "invalid-code": "Mã không đúng. Thử lại.",
  "code-expired": "Mã đã hết hạn hoặc sai quá số lần. Gửi lại mã.",
  "too-many-requests": "Bạn đã xin mã quá nhiều lần. Thử lại sau 15 phút.",
  khac: "Có lỗi, thử lại sau ít phút.",
  "invalid-email-or-password": "Email hoặc mật khẩu không đúng",
  "password-rate-limited": "Thử lại sau ít phút",
  "password-disabled": "Mật khẩu đã bị khoá — đăng nhập bằng mã rồi đặt mật khẩu mới trong Cá nhân, hay nhờ quản trị sàn cấp lại",
  "temp-password-expired": "Mật khẩu tạm đã hết hạn — nhờ quản trị sàn cấp lại",
};
const LOI_MAT_KHAU: readonly string[] = ["invalid-email-or-password", "password-rate-limited", "password-disabled", "temp-password-expired"];

const post = (path: string, body: unknown) =>
  fetch(`/api/v1/auth${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

export function FormDangNhap() {
  const router = useRouter();
  const [buoc, setBuoc] = useState<Buoc>("email");
  const [email, setEmail] = useState("");
  const [ma, setMa] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [hien, setHien] = useState(false);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<Loi>("");

  async function guiMa() {
    setDangGui(true);
    setLoi("");
    try {
      const res = await post("/email-otp/send-verification-otp", { email: email.trim(), type: "sign-in" });
      if (res.status === 429) return setLoi("too-many-requests");
      if (!res.ok) return setLoi("khac");
      setMa("");
      setBuoc("ma");
      // Gửi lại mã khi đang ở bước hai: ô mã đã có sẵn nên autoFocus không chạy lại.
      requestAnimationFrame(() => document.getElementById("ma")?.focus());
    } finally {
      setDangGui(false);
    }
  }

  async function vao(e: FormEvent) {
    e.preventDefault();
    setDangGui(true);
    setLoi("");
    try {
      const res = await post("/sign-in/email-otp", { email: email.trim(), otp: ma });
      if (res.ok) {
        router.replace("/");
        router.refresh();
        return;
      }
      const code = ((await res.json().catch(() => ({}))) as { code?: string }).code;
      setLoi(code === "INVALID_OTP" ? "invalid-code" : code === "OTP_EXPIRED" || code === "TOO_MANY_ATTEMPTS" ? "code-expired" : "khac");
    } finally {
      setDangGui(false);
    }
  }

  async function vaoMatKhau(e: FormEvent) {
    e.preventDefault();
    setDangGui(true);
    setLoi("");
    try {
      const res = await post("/sign-in/email", { email: email.trim(), password: matKhau });
      const than = (await res.json().catch(() => ({}))) as { mustChange?: boolean; changeToken?: string; error?: string };
      if (res.ok && than.mustChange && than.changeToken) {
        datMaDoi(than.changeToken);
        setMatKhau("");
        router.replace("/dat-mat-khau");
        return;
      }
      if (res.ok) {
        router.replace("/");
        router.refresh();
        return;
      }
      setLoi(than.error && LOI_MAT_KHAU.includes(than.error) ? (than.error as LoiMatKhau) : "khac");
    } finally {
      setDangGui(false);
    }
  }

  if (buoc === "mat-khau") {
    return (
      <form className="flex flex-col gap-5" onSubmit={vaoMatKhau}>
        <FieldGroup className="gap-4">
          <Field className="gap-2">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <InputGroup className="bg-background">
              <InputGroupAddon>
                <MailIcon aria-hidden="true" className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                required
                autoComplete="username"
                placeholder="ban@san.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </InputGroup>
          </Field>
          <Field className="gap-2" data-invalid={loi ? true : undefined}>
            <FieldLabel htmlFor="mat-khau">Mật khẩu</FieldLabel>
            <InputGroup className="bg-background">
              <InputGroupAddon>
                <LockKeyholeIcon aria-hidden="true" className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="mat-khau"
                type={hien ? "text" : "password"}
                required
                autoFocus
                autoComplete="current-password"
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" aria-label={hien ? "Ẩn mật khẩu" : "Hiện mật khẩu"} onClick={() => setHien(!hien)}>
                  {hien ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {loi && <FieldError role="alert">{CHU_LOI[loi]}</FieldError>}
          </Field>
        </FieldGroup>
        <div className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={dangGui}>
            {dangGui ? "Đang vào…" : "Đăng nhập"}
            <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setBuoc("email");
              setMatKhau("");
              setLoi("");
            }}
          >
            Dùng mã qua email
          </Button>
        </div>
      </form>
    );
  }

  if (buoc === "email") {
    return (
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          void guiMa();
        }}
      >
        <FieldGroup className="gap-4">
          <Field className="gap-2" data-invalid={loi ? true : undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <InputGroup className="bg-background">
              <InputGroupAddon>
                <MailIcon aria-hidden="true" className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                placeholder="ban@san.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </InputGroup>
            <FieldDescription>Quỹ hàng gửi mã 6 số tới email này.</FieldDescription>
            {loi && <FieldError role="alert">{CHU_LOI[loi]}</FieldError>}
          </Field>
        </FieldGroup>
        <div className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={dangGui}>
            {dangGui ? "Đang gửi…" : "Gửi mã"}
            <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setBuoc("mat-khau");
              setLoi("");
            }}
          >
            Dùng mật khẩu
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={vao}>
      <FieldGroup className="gap-4">
        <Field className="gap-2" data-invalid={loi ? true : undefined}>
          <FieldLabel htmlFor="ma">Mã 6 số</FieldLabel>
          <InputGroup className="bg-background">
            <InputGroupAddon>
              <KeyRoundIcon aria-hidden="true" className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              id="ma"
              autoFocus
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              value={ma}
              onChange={(e) => setMa(e.target.value.replace(/\D/g, ""))}
            />
          </InputGroup>
          <FieldDescription>Đã gửi mã tới {email.trim()}</FieldDescription>
          {loi && <FieldError role="alert">{CHU_LOI[loi]}</FieldError>}
        </Field>
      </FieldGroup>
      <div className="flex flex-col gap-3">
        {loi === "code-expired" ? (
          <Button type="button" className="w-full" disabled={dangGui} onClick={() => void guiMa()}>
            Gửi lại mã
          </Button>
        ) : (
          <Button type="submit" className="w-full" disabled={dangGui}>
            {dangGui ? "Đang vào…" : "Vào"}
            <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setBuoc("email");
            setLoi("");
          }}
        >
          Đổi email
        </Button>
      </div>
    </form>
  );
}
