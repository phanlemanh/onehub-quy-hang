"use client";

import { InboxIcon } from "lucide-react";
import Link from "next/link";

import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";

/** Trống của Hôm nay đầu chủ (máy tính và điện thoại): một hành động — mở Bảng hàng. */
export function HetViec() {
  return (
    <TrangThai
      kind="empty"
      icon={InboxIcon}
      title="Hôm nay không còn việc"
      description={
        <Button variant="outline" size="sm" className="mt-2" nativeButton={false} render={<Link href="/inventory" />}>
          Mở Bảng hàng
        </Button>
      }
    />
  );
}
