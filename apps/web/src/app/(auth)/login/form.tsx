"use client";

import { ArrowRightIcon, KeyRoundIcon, MailIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

// Ô email và ô mã theo `@reui/auth-15` (hàng 93): InputGroup có biểu tượng đầu ô, lời dặn dưới ô, nút rộng trọn cột.
// Luồng, chữ lỗi và đường API giữ nguyên hàng 6.

type Buoc = "email" | "ma";
type Loi = "" | "invalid-code" | "code-expired" | "too-many-requests" | "khac";

const CHU_LOI: Record<Exclude<Loi, "">, string> = {
  "invalid-code": "Mã không đúng. Thử lại.",
  "code-expired": "Mã đã hết hạn hoặc sai quá số lần. Gửi lại mã.",
  "too-many-requests": "Bạn đã xin mã quá nhiều lần. Thử lại sau 15 phút.",
  khac: "Có lỗi, thử lại sau ít phút.",
};

const post = (path: string, body: unknown) =>
  fetch(`/api/v1/auth${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

export function FormDangNhap() {
  const router = useRouter();
  const [buoc, setBuoc] = useState<Buoc>("email");
  const [email, setEmail] = useState("");
  const [ma, setMa] = useState("");
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
        <Button type="submit" className="w-full" disabled={dangGui}>
          {dangGui ? "Đang gửi…" : "Gửi mã"}
          <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
        </Button>
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
