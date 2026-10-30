"use client";

import { useRouter } from "next/navigation";
import { nut } from "../khung";

export function DanhSachSan({ companies }: { companies: { id: string; name: string }[] }) {
  const router = useRouter();
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "grid", gap: 8 }}>
      {companies.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            style={{ ...nut, width: "100%", textAlign: "left" }}
            onClick={async () => {
              const res = await fetch("/api/v1/me/san", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ companyId: c.id }),
              });
              if (res.ok) {
                router.replace("/");
                router.refresh();
              }
            }}
          >
            {c.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
