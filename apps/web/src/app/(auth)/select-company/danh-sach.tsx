"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function DanhSachSan({ companies }: { companies: { id: string; name: string }[] }) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-2">
      {companies.map((c) => (
        <Button
          key={c.id}
          variant="outline"
          size="lg"
          className="justify-start"
          onClick={async () => {
            const res = await fetch("/api/v1/me/company", {
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
        </Button>
      ))}
    </div>
  );
}
