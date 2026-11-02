import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/reui/alert";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

// Khuôn của nhóm `trang-thai` (design/patterns/trang-thai.md): mọi chỗ trình trống · lỗi · báo trong màn đi qua đây.
// Ghép `Empty` (shadcn) và `Alert` (ReUI) đã cài; khối đích `empty-state-*` của vo-va-ia là khối Pro — khi kho có khoá
// ReUI thì chuyển thể vào chính tệp này, mọi màn đổi theo. Lỗi gắn một ô nhập dùng `FieldError`, không qua đây.
type Props = {
  /** `empty` — vùng chưa có gì · `error` — thao tác hay lần tải thất bại · `notice` — điều người cần biết, không phải lỗi ·
   * `loading` — một chỗ nhỏ đang tải (vùng lớn dùng ChoTai theo hình của bố cục). */
  kind: "empty" | "error" | "notice" | "loading";
  title: ReactNode;
  description?: ReactNode;
  /** Chỉ cho `empty`: biểu tượng lucide nhỏ trên tiêu đề. */
  icon?: LucideIcon;
  className?: string;
};

export function TrangThai({ kind, title, description, icon: Icon, className }: Props) {
  if (kind === "loading") {
    return (
      <Empty role="status" aria-busy="true" className={className}>
        <EmptyHeader>
          <EmptyMedia>
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>
      </Empty>
    );
  }
  if (kind === "empty") {
    return (
      <Empty className={className}>
        <EmptyHeader>
          {Icon && (
            <EmptyMedia variant="icon">
              <Icon />
            </EmptyMedia>
          )}
          <EmptyTitle>{title}</EmptyTitle>
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>
      </Empty>
    );
  }
  return (
    <Alert variant={kind === "error" ? "destructive" : "default"} role={kind === "error" ? "alert" : "status"} className={className}>
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
}
