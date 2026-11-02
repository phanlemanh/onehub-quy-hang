import { type Home, navigationFor, secondColumnKey } from "@quy-hang/core";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { readMe } from "@/lib/api";
import { AppShellDongBo } from "./app-shell-dong-bo";
import { SECOND_COLUMN_COOKIE } from "./cookie";

const HOMES: Home[] = ["today", "inventory", "shares", "team", "settings"];

/** Đọc cột thứ hai người đã mở/gập — chỉ của đúng người và sàn đang làm (Hỏi-1). */
function rememberedFor(raw: string | undefined, userId: string, companyId: string): Partial<Record<Home, boolean>> {
  let all: Record<string, unknown> = {};
  try {
    all = raw ? (JSON.parse(raw.startsWith("%") ? decodeURIComponent(raw) : raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
  const out: Partial<Record<Home, boolean>> = {};
  for (const home of HOMES) {
    const v = all[secondColumnKey(userId, companyId, home)];
    if (typeof v === "boolean") out[home] = v;
  }
  return out;
}

/** Dựng vỏ ở máy chủ cho mọi màn sau đăng nhập; chưa đăng nhập hay chưa có sàn thì đưa về màn tương ứng. */
export async function ShellLayout({ children }: { children: ReactNode }) {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  if (!me.activeCompany) redirect("/select-company");

  const { activeCompany } = me;
  const raw = (await cookies()).get(SECOND_COLUMN_COOKIE)?.value;
  return (
    <AppShellDongBo
      user={{ userId: me.user.id, email: me.user.email, companies: me.companies, activeCompany }}
      nav={navigationFor(activeCompany.roles)}
      remembered={rememberedFor(raw, me.user.id, activeCompany.id)}
    >
      {children}
    </AppShellDongBo>
  );
}
