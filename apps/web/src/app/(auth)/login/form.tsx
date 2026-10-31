"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void guiMa();
        }}
      >
        <Field data-invalid={loi ? true : undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" required autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          {loi && <FieldError role="alert">{CHU_LOI[loi]}</FieldError>}
        </Field>
        <Button type="submit" disabled={dangGui}>
          {dangGui ? "Đang gửi…" : "Gửi mã"}
        </Button>
      </form>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={vao}>
      <p className="text-sm text-muted-foreground">Đã gửi mã tới {email.trim()}</p>
      <Field data-invalid={loi ? true : undefined}>
        <FieldLabel htmlFor="ma">Mã 6 số</FieldLabel>
        <Input
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
        {loi && <FieldError role="alert">{CHU_LOI[loi]}</FieldError>}
      </Field>
      <div className="flex flex-wrap gap-2">
        {loi === "code-expired" ? (
          <Button type="button" disabled={dangGui} onClick={() => void guiMa()}>
            Gửi lại mã
          </Button>
        ) : (
          <Button type="submit" disabled={dangGui}>
            {dangGui ? "Đang vào…" : "Vào"}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
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
