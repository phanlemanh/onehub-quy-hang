"use client";

import { InboxIcon } from "lucide-react";
import Link from "next/link";

import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";

/** Trống của Hôm nay (máy tính và điện thoại): một hành động theo vai — telesales thuần nhập lead, vai khác mở Bảng hàng. */
export function HetViec({ vai }: { vai: readonly string[] }) {
  const coBang = vai.some((r) => r !== "telesales");
  return (
    <TrangThai
      kind="empty"
      icon={InboxIcon}
      title="Hôm nay không còn việc"
      description={
        <Button variant="outline" size="sm" className="mt-2" nativeButton={false} render={<Link href={coBang ? "/inventory" : "/leads/new"} />}>
          {coBang ? "Mở Bảng hàng" : "Nhập lead"}
        </Button>
      }
    />
  );
}
