import type { ReactNode } from "react";

import { ShellLayout } from "@/components/shell/shell-layout";

export const dynamic = "force-dynamic";

// Cài đặt sàn dựng cùng vỏ với nhóm (app); để riêng ở đây vì màn Người dùng (hàng 7) đã có ở settings/users.
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <ShellLayout>{children}</ShellLayout>;
}
