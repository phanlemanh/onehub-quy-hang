import { type LucideIcon, RotateCwIcon, SearchXIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/reui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

// Khuôn của nhóm `trang-thai` (design/patterns/trang-thai.md): mọi chỗ trình trống · lỗi · báo trong màn đi qua đây.
// Nơi chuyển thể empty-state-1 và empty-state-2 (ReUI Pro, hàng 91): giữ Empty không viền, đầu, mô tả và hàng hành động của
// khối; bỏ hình minh hoạ nặng, dùng biểu tượng lucide nhỏ (vo-va-ia.md §2 dòng «Trống · lỗi · báo»). Lỗi gắn một ô nhập dùng `FieldError`, không qua đây.
type Props = {
  /** `empty` — vùng chưa có gì · `error` — thao tác hay lần tải thất bại · `notice` — điều người cần biết, không phải lỗi ·
   * `loading` — một chỗ nhỏ đang tải (vùng lớn dùng ChoTai theo hình của bố cục). */
  kind: "empty" | "error" | "notice" | "loading";
  title: ReactNode;
  description?: ReactNode;
  /** Chỉ cho `empty`: biểu tượng lucide nhỏ trên tiêu đề. */
  icon?: LucideIcon;
  /** Một hành động: rỗng thì việc chính để có dữ liệu, lỗi thì «Thử lại» (ReUI layout «States»). */
  hanhDong?: ReactNode;
  /** Chỉ cho `empty`: lọc hay tìm không ra gì (empty-state-2) — khác vùng chưa có gì (empty-state-1). */
  timKhongRa?: boolean;
  className?: string;
};

/** Lần đọc của một vùng thất bại (mẫu «Lỗi», ADR-0024): một câu, đúng một «Thử lại» cạnh câu. Vùng nào cũng báo bằng khối này, không tự ghép nút. */
export function BaoLoiVung({ title, description, onThuLai, className }: { title: ReactNode; description?: ReactNode; onThuLai: () => void; className?: string }) {
  return (
    <TrangThai
      kind="error"
      title={title}
      description={description}
      className={className}
      hanhDong={
        <Button size="sm" variant="outline" onClick={onThuLai}>
          <RotateCwIcon data-icon="inline-start" />
          Thử lại
        </Button>
      }
    />
  );
}

export function TrangThai({ kind, title, description, icon, hanhDong, timKhongRa = false, className }: Props) {
  const Icon = icon ?? (timKhongRa ? SearchXIcon : undefined);
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
      <Empty data-kieu={timKhongRa ? "tim-khong-ra" : "chua-co"} className={className}>
        <EmptyHeader>
          {Icon && (
            <EmptyMedia variant="icon">
              <Icon />
            </EmptyMedia>
          )}
          <EmptyTitle>{title}</EmptyTitle>
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>
        {hanhDong && <EmptyContent>{hanhDong}</EmptyContent>}
      </Empty>
    );
  }
  return (
    <Alert variant={kind === "error" ? "destructive" : "default"} role={kind === "error" ? "alert" : "status"} className={className}>
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
      {hanhDong && <AlertAction>{hanhDong}</AlertAction>}
    </Alert>
  );
}
