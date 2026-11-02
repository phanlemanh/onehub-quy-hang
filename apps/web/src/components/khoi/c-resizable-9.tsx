"use client"

// chuyển thể c-resizable-9 (ReUI, hàng 91): tay nắm viên thuốc và tỉ lệ khung của ví dụ; hai ô thay ba (thân · cột phụ);
// gỡ max-w-lg và viền bo ở gốc — khung thuộc khối trong từng ô. Chuyển động nêu rõ thuộc tính theo luật kho.

import type * as React from "react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

const pillClasses =
  "before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:z-10 before:h-6 before:w-1 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-muted-foreground/25 before:transition-[height,width,background-color] before:duration-300 before:ease-[cubic-bezier(0.32,0.72,0,1)] hover:before:h-10 hover:before:bg-muted-foreground/40 active:before:h-12 active:before:w-1.5 active:before:bg-primary"

/** Danh sách – chi tiết: thân và cột phụ kéo chia được, tay nắm viên thuốc của khối. */
export function ChiaDoi({ trai, phai }: { trai: React.ReactNode; phai: React.ReactNode }) {
  return (
    <ResizablePanelGroup orientation="horizontal" className="min-h-0 w-full gap-1">
      <ResizablePanel defaultSize={66} minSize={40}>
        {trai}
      </ResizablePanel>
      <ResizableHandle className={pillClasses} />
      <ResizablePanel defaultSize={34} minSize={20}>
        {phai}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
