"use client";

import type { ComponentProps } from "react";

import { BangCanXem } from "@/components/sync/bang-can-xem";
import { ChiBaoDongBo } from "@/components/sync/chi-bao-dong-bo";
import { HoiDangXuat } from "@/components/sync/hoi-dang-xuat";
import { BoDongBoProvider, useBoDongBo } from "@/lib/sync/react";

import { AccountMenuKhung } from "./account-menu";
import { AppShell } from "./app-shell";

// Vỏ thật của mọi màn sau đăng nhập: AppShell cộng bộ đồng bộ (chỉ báo, đăng xuất có hỏi, bảng căn cần xem). Tách khỏi
// AppShell để trang mẫu sống (hàng 91) dựng vỏ mà không nhập lớp đồng bộ — đồ thị nhập của nó không chạm lớp gọi API.

function TaiKhoan({ email, companyName, roles }: { email: string; companyName: string; roles: readonly string[] }) {
  const { dangXuat } = useBoDongBo();
  return <AccountMenuKhung email={email} companyName={companyName} roles={roles} dangXuat={dangXuat} />;
}

type Props = Omit<ComponentProps<typeof AppShell>, "chiBao" | "chiBaoGon" | "taiKhoan" | "phuVo" | "mau" | "diaChiMau" | "menuTao">;

export function AppShellDongBo({ user, ...p }: Props) {
  return (
    <BoDongBoProvider
      userId={user.userId}
      companyId={user.activeCompany.id}
      companyIds={user.companies.map((c) => c.id)}
      roles={user.activeCompany.roles ?? []}
    >
      <AppShell
        {...p}
        user={user}
        chiBao={<ChiBaoDongBo />}
        chiBaoGon={<ChiBaoDongBo gon />}
        taiKhoan={<TaiKhoan email={user.email} companyName={user.activeCompany.name} roles={user.activeCompany.roles ?? []} />}
        phuVo={
          <>
            <BangCanXem />
            <HoiDangXuat />
          </>
        }
      />
    </BoDongBoProvider>
  );
}
