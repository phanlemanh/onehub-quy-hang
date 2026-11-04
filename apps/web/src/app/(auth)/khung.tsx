import { BoxesIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Item, ItemMedia } from "@/components/ui/item";

// Khung của màn đăng nhập, chọn sàn, chưa gắn sàn — không vỏ (Tham chiếu §9). Chuyển thể khối `@reui/auth-15` (hàng 93):
// giữ dấu hiệu trên đầu, một cột hẹp giữa trang với tiêu đề lớn, chân điều khoản ở đáy; bỏ nút Google/Apple/GitHub và
// dải «Or continue with» (kho chỉ đăng nhập bằng mã email, ADR-0005); dấu hiệu là ô hộp của vỏ (home-rail) cạnh chữ
// «Quỹ hàng»; chân trang chỉ còn câu điều khoản, không liên kết (kho chưa có trang điều khoản hay chính sách).
// Câu chân trang theo Hỏi-1 của Cổng Phạm vi (khuyến nghị câu trung tính, không lời «đồng ý»).
export const CHAN_DIEU_KHOAN = "Sàn của bạn dùng Quỹ hàng theo điều khoản trong hợp đồng đã ký.";

function DauHieu() {
  return (
    <div className="inline-flex items-center gap-2">
      <Item className="flex size-8 shrink-0 items-center justify-center bg-primary p-2 text-primary-foreground" aria-hidden="true">
        <ItemMedia variant="icon" className="size-auto">
          <BoxesIcon className="size-4" />
        </ItemMedia>
      </Item>
      <span className="text-sm font-medium">Quỹ hàng</span>
    </div>
  );
}

export function Khung({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <main className="flex min-h-svh w-full bg-background">
      <section className="flex min-h-svh w-full px-6 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
          <div className="flex justify-center">
            <DauHieu />
          </div>
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="flex w-full max-w-88 flex-col gap-6">
              <div className="mb-2 flex flex-col gap-1 text-center">
                <h1 className="text-3xl leading-tight font-semibold text-balance">{title}</h1>
                {description && <p className="text-base text-pretty text-muted-foreground">{description}</p>}
              </div>
              {children}
            </div>
          </div>
          <footer className="flex flex-col items-center gap-5 text-center text-xs text-muted-foreground">
            <p className="max-w-lg leading-5 text-pretty">{CHAN_DIEU_KHOAN}</p>
          </footer>
        </div>
      </section>
    </main>
  );
}
