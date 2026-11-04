"use client";

import type { ReactNode } from "react";
import { CheckIcon, FlagIcon } from "lucide-react";

import { Badge } from "@/components/reui/badge";
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";
import { Spinner } from "@/components/ui/spinner";

// Chuyển thể từ khối ReUI solution-crm-6 (ImportWizard): giữ khung gốc — Frame xếp tầng, đầu khung có tên tệp và số
// dòng, dải Stepper đánh số, thân là bước đang làm, chân có câu của bước và nút Lùi/Tiếp. Đổi: bước, chữ, nút thành prop;
// bỏ form giả nộp, toast và dữ liệu demo; người gọi giữ trạng thái và luật (lib/nhap).

export type Buoc = { so: number; ten: string; moTa: string };

export function KhungBuoc({
  tieuDe,
  moTa,
  nhan,
  buoc,
  hienTai,
  dangChay = false,
  onChonBuoc,
  chan,
  children,
}: {
  tieuDe: ReactNode;
  moTa: ReactNode;
  nhan?: ReactNode;
  buoc: readonly Buoc[];
  hienTai: number;
  dangChay?: boolean;
  /** Chỉ cho lùi về bước đã qua; bước sau mở bằng nút Tiếp để luật của bước được kiểm. */
  onChonBuoc?: (so: number) => void;
  chan: ReactNode;
  children: ReactNode;
}) {
  const cauBuoc = buoc.find((b) => b.so === hienTai)?.moTa ?? "";
  return (
    <Stepper
      value={hienTai}
      onValueChange={(so) => so < hienTai && onChonBuoc?.(so)}
      indicators={{ completed: <CheckIcon className="size-3.5" aria-hidden="true" />, loading: <Spinner className="size-3.5" /> }}
      className="w-full"
    >
      <Frame stacked className="w-full">
        <FrameHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-px">
              <FrameTitle>{tieuDe}</FrameTitle>
              <FrameDescription className="truncate text-sm">{moTa}</FrameDescription>
            </div>
            {nhan ? <Badge variant="info-light">{nhan}</Badge> : null}
          </div>
        </FrameHeader>

        <FramePanel className="flex items-center overflow-x-auto">
          <StepperNav aria-label="Các bước nhập" className="min-w-full items-center">
            {buoc.map((b, i) => (
              <StepperItem key={b.so} step={b.so} loading={dangChay && b.so === hienTai} className="relative min-w-0">
                <StepperTrigger type="button" className="min-w-0 justify-start gap-2 disabled:opacity-100">
                  <StepperIndicator className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=completed]:bg-primary data-[state=inactive]:border-border data-[state=inactive]:text-foreground relative size-6 rounded-full border data-[state=active]:border-primary">
                    {i + 1}
                  </StepperIndicator>
                  <StepperTitle className="text-foreground hidden truncate text-sm sm:block">{b.ten}</StepperTitle>
                </StepperTrigger>
                {i + 1 < buoc.length ? <StepperSeparator className="bg-border group-data-[state=completed]/step:bg-primary mx-2" /> : null}
              </StepperItem>
            ))}
          </StepperNav>
        </FramePanel>

        <FramePanel>
          <StepperPanel className="text-sm">
            <StepperContent value={hienTai}>{children}</StepperContent>
          </StepperPanel>
        </FramePanel>

        <FrameFooter className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FrameDescription className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex">
            <FlagIcon className="size-4 shrink-0" aria-hidden="true" />
            {cauBuoc}
          </FrameDescription>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">{chan}</div>
        </FrameFooter>
      </Frame>
    </Stepper>
  );
}
