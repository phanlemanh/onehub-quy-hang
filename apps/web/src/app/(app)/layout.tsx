import type { ReactNode } from "react";

import { ShellLayout } from "@/components/shell/shell-layout";

export const dynamic = "force-dynamic";

// Mọi nhà sau đăng nhập nằm trong vỏ. Màn đăng nhập, chọn sàn và trang khách nằm ngoài nhóm này — không vỏ.
export default function AppLayout({ children }: { children: ReactNode }) {
  return <ShellLayout>{children}</ShellLayout>;
}
