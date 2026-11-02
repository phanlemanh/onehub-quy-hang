import { Skeleton } from "@/components/ui/skeleton";

import type { KieuBoCuc } from "./ma-tran";

// Chờ tải theo hình của bố cục (ADR-0024 §4) — chỗ duy nhất trong mã màn dựng Skeleton (luật quy-hang-ui/no-raw-skeleton).
// Lưới của Tràn và Danh sách – chi tiết theo c-data-grid-21: một dòng đầu cột rồi các dòng ô, mỗi ô một thanh.

function Luoi({ dong = 8, cot = 5 }: { dong?: number; cot?: number }) {
  return (
    <div data-cho-tai="luoi" className="flex flex-col gap-3">
      {Array.from({ length: dong + 1 }, (_, d) => (
        <div key={d} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cot}, minmax(0, 1fr))` }}>
          {Array.from({ length: cot }, (_, c) => (
            <Skeleton key={c} className={d === 0 ? "h-3 w-2/3" : "h-4 w-full"} />
          ))}
        </div>
      ))}
    </div>
  );
}

function DongNhanO({ dong = 5 }: { dong?: number }) {
  return (
    <div data-cho-tai="nhan-o" className="flex flex-col gap-6">
      {Array.from({ length: dong }, (_, i) => (
        <div key={i} className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1.5 md:w-1/2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-full md:w-1/3" />
        </div>
      ))}
    </div>
  );
}

function Doan({ dong = 4 }: { dong?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: dong }, (_, i) => (
        <Skeleton key={i} className={i === dong - 1 ? "h-4 w-1/2" : "h-4 w-full"} />
      ))}
    </div>
  );
}

function DongTin({ dong = 6 }: { dong?: number }) {
  return (
    <div data-cho-tai="dong-tin" className="flex flex-col gap-4">
      {Array.from({ length: dong }, (_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChoTai({ kieu }: { kieu: KieuBoCuc }) {
  const noiDung = (() => {
    switch (kieu) {
      case "tran":
        return <Luoi />;
      case "danh-sach-chi-tiet":
        return (
          <div data-cho-tai="luoi-chi-tiet" className="grid gap-khung lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Luoi cot={4} />
            </div>
            <div className="hidden lg:block">
              <Doan dong={6} />
            </div>
          </div>
        );
      case "doc":
        return <DongNhanO />;
      case "ho-so":
        return (
          <div data-cho-tai="ho-so" className="flex flex-col gap-3 p-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-32" />
            <Doan dong={6} />
          </div>
        );
      case "bang-dieu-khien":
        return (
          <div data-cho-tai="bang" className="flex flex-col gap-khung">
            <div className="grid gap-khung md:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
            <Luoi dong={5} cot={4} />
          </div>
        );
      case "luong-nhieu-buoc":
        return (
          <div data-cho-tai="luong" className="flex flex-col gap-khung">
            <div className="flex gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-2 flex-1" />
              ))}
            </div>
            <DongNhanO dong={3} />
          </div>
        );
      case "dong-tin":
        return <DongTin />;
    }
  })();
  return (
    <div role="status" aria-busy="true" aria-label="Đang tải" data-cho-tai-kieu={kieu}>
      {noiDung}
    </div>
  );
}
