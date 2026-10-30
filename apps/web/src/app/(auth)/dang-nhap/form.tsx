"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { nut, o } from "../khung";

type Buoc = "email" | "ma";
type Loi = "" | "ma-sai" | "ma-het" | "qua-nhieu" | "khac";

const CHU_LOI: Record<Exclude<Loi, "">, string> = {
  "ma-sai": "Mã không đúng. Thử lại.",
  "ma-het": "Mã đã hết hạn hoặc sai quá số lần. Gửi lại mã.",
  "qua-nhieu": "Bạn đã xin mã quá nhiều lần. Thử lại sau 15 phút.",
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
      if (res.status === 429) return setLoi("qua-nhieu");
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
      setLoi(code === "INVALID_OTP" ? "ma-sai" : code === "OTP_EXPIRED" || code === "TOO_MANY_ATTEMPTS" ? "ma-het" : "khac");
    } finally {
      setDangGui(false);
    }
  }

  if (buoc === "email") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void guiMa();
        }}
      >
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} style={o} />
        {loi && <p role="alert">{CHU_LOI[loi]}</p>}
        <button type="submit" disabled={dangGui} style={nut}>
          {dangGui ? "Đang gửi…" : "Gửi mã"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={vao}>
      <p>Đã gửi mã tới {email.trim()}</p>
      <label htmlFor="ma">Mã 6 số</label>
      <input
        id="ma"
        autoFocus
        required
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        value={ma}
        onChange={(e) => setMa(e.target.value.replace(/\D/g, ""))}
        style={o}
      />
      {loi && <p role="alert">{CHU_LOI[loi]}</p>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {loi === "ma-het" ? (
          <button type="button" disabled={dangGui} style={nut} onClick={() => void guiMa()}>
            Gửi lại mã
          </button>
        ) : (
          <button type="submit" disabled={dangGui} style={nut}>
            {dangGui ? "Đang vào…" : "Vào"}
          </button>
        )}
        <button
          type="button"
          style={nut}
          onClick={() => {
            setBuoc("email");
            setLoi("");
          }}
        >
          Đổi email
        </button>
      </div>
    </form>
  );
}
