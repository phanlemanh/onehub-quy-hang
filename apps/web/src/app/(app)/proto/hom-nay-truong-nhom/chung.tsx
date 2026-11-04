"use client";

// Phần chung của ba lối Hôm nay của Trưởng nhóm (hàng 42, ADR-0019): trạng thái cục bộ (hàng đợi, đầu chủ, ba ô số) và
// nút «Giao lại» mở chọn đầu chủ (Popover + Command của shadcn đã cài). Không gọi mạng. Gỡ khi màn thật ra.
import { UserRoundIcon } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/reui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CHUA_CO_NGUOI, DAU_CHU, HANG_DOI, type DauChu, type DongHangDoi } from "./mau";

export type TruongNhom = {
  hangDoi: DongHangDoi[];
  dauChu: DauChu[];
  so: { leadQuaHan: number; ngoaiLe: number; hangCu: number };
  giao: (dong: string, dauChu: string) => void;
};

export function useTruongNhom(): TruongNhom {
  const [hangDoi, setHangDoi] = useState(HANG_DOI);
  const [dauChu, setDauChu] = useState(DAU_CHU);
  const giao = (dongId: string, nguoi: string) => {
    const dong = hangDoi.find((d) => d.id === dongId);
    if (!dong) return;
    setHangDoi((ds) => ds.filter((d) => d.id !== dongId));
    setDauChu((ds) =>
      ds.map((d) => (d.id === nguoi ? { ...d, leadMo: d.leadMo + 1 } : d.id === dong.dauChu ? { ...d, leadMo: Math.max(0, d.leadMo - 1) } : d)),
    );
  };
  const xep = [...hangDoi].sort((a, b) => b.phut - a.phut);
  return {
    hangDoi: xep,
    dauChu,
    so: {
      leadQuaHan: hangDoi.filter((d) => d.loai !== "chua-chia").length,
      ngoaiLe: hangDoi.filter((d) => d.loai === "chua-chia").length,
      hangCu: dauChu.reduce((s, d) => s + d.canGoiLai, CHUA_CO_NGUOI.canGoiLai),
    },
    giao,
  };
}

/** Nút «Giao lại» — mở danh sách đầu chủ của sàn; người đang nghỉ có nhãn, số lead đang mở cạnh tên. */
export function GiaoLai({ dong, tn, size = "sm" }: { dong: DongHangDoi; tn: TruongNhom; size?: "sm" | "xs" }) {
  const [mo, setMo] = useState(false);
  const coNguoi = tn.dauChu.length > 0;
  return (
    <Popover open={mo} onOpenChange={setMo}>
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" size={size} disabled={!coNguoi} title={coNguoi ? undefined : "Sàn chưa có đầu chủ nào"}>
            Giao lại
          </Button>
        }
      />
      <PopoverContent align="end" className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Tìm đầu chủ" />
          <CommandList>
            <CommandEmpty>Không có đầu chủ khớp</CommandEmpty>
            <CommandGroup heading="Giao cho">
              {tn.dauChu.map((d) => (
                <CommandItem
                  key={d.id}
                  value={d.ten}
                  disabled={d.id === dong.dauChu}
                  onSelect={() => {
                    setMo(false);
                    tn.giao(dong.id, d.id);
                  }}
                >
                  <UserRoundIcon aria-hidden="true" />
                  <span className="truncate">{d.ten}</span>
                  {d.nghi && <Badge variant="warning-light">Đang nghỉ</Badge>}
                  <span className="text-muted-foreground ms-auto text-xs tabular-nums">{d.leadMo} lead</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
