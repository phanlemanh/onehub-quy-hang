import { navigationFor, ROLES } from "@quy-hang/core";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/reui/badge";
import { MobileShell } from "@/components/shell/mobile-shell";
import { Placeholder, placeholderFor } from "@/components/shell/placeholder";
import { nhanVai } from "@/lib/vai";

// Bản bấm được của vỏ điện thoại cho design-pass (Hỏi-4, Cổng Phạm vi vo-ung-dung). Chỉ chạy ở máy dev, không đăng
// nhập, vai chọn bằng ?vai=. Gỡ khi vỏ thật vào nhóm (app) ở S3.
const BASE = "/proto/vo-ung-dung";

const MAU: { ten: string; vai: string[] }[] = [
  { ten: "Telesales", vai: ["telesales"] },
  { ten: "Đầu chủ", vai: ["listing_agent"] },
  { ten: "Đầu khách", vai: ["buyer_agent"] },
  { ten: "Trưởng nhóm", vai: ["team_lead"] },
  { ten: "Chỉ Quản trị sàn", vai: ["company_admin"] },
];

export default async function ProtoShell({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<{ vai?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { path = [] } = await params;
  const { vai = "listing_agent" } = await searchParams;
  const roles = vai.split(",").filter((r) => (ROLES as readonly string[]).includes(r));
  const nav = navigationFor(roles.length > 0 ? roles : ["listing_agent"]);
  const query = `?vai=${roles.join(",")}`;

  const current = `/${path.join("/")}`;
  if (current === "/") redirect(`${BASE}${nav.landing}${query}`);

  return (
    <MobileShell nav={nav} title={placeholderFor(current).title} basePath={BASE} query={query}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <span>Bản mẫu · xem như:</span>
          {MAU.map((m) => {
            const on = m.vai.join(",") === roles.join(",");
            return (
              <Link key={m.ten} href={`${BASE}${navigationFor(m.vai).landing}?vai=${m.vai.join(",")}`}>
                <Badge variant={on ? "default" : "outline"}>{m.ten}</Badge>
              </Link>
            );
          })}
        </div>
        <Placeholder path={current} />
        <p className="text-xs text-muted-foreground">Vai: {roles.map(nhanVai).join(", ")}</p>
      </div>
    </MobileShell>
  );
}
