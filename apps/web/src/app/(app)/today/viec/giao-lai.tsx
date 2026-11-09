"use client";

// Nút «Giao lại» của dòng việc: máy tính mở danh sách đầu chủ tại chỗ, điện thoại mở ngăn đáy (Hỏi-6). Người nghỉ có nhãn,
// số lead đang mở cạnh tên; chưa đặt tên thì chữ thay, không hiện mã.
import { UserRoundIcon } from "lucide-react";
import { useState } from "react";

import { NganNoi } from "@/components/bo-cuc";
import { Badge } from "@/components/reui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { useDienThoai } from "../mobile/kho";
import type { DauChuCuaSan, DongLeadTruongNhom } from "../nguon";

type Props = { nhan: string; className?: string; dong: DongLeadTruongNhom; dauChu: readonly DauChuCuaSan[]; tat: boolean; onGiao: (nguoi: string) => void };

function DanhSach({ dong, dauChu, chon }: Pick<Props, "dong" | "dauChu"> & { chon: (nguoi: string) => void }) {
  return (
    <Command>
      <CommandInput placeholder="Tìm đầu chủ" />
      <CommandList>
        <CommandEmpty>Không có đầu chủ khớp</CommandEmpty>
        <CommandGroup heading="Giao cho">
          {dauChu.map((d) => (
            <CommandItem key={d.userId} value={`${d.displayName} ${d.userId}`} disabled={d.userId === dong.agentUserId} onSelect={() => chon(d.userId)}>
              <UserRoundIcon aria-hidden="true" />
              <span className="truncate">{d.displayName || "Chưa rõ tên"}</span>
              {d.onLeave && <Badge variant="warning-light">Đang nghỉ</Badge>}
              <span className="text-muted-foreground ms-auto text-xs tabular-nums">{d.openLeads} lead</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function GiaoLai({ nhan, className, dong, dauChu, tat, onGiao }: Props) {
  const [mo, setMo] = useState(false);
  const dienThoai = useDienThoai();
  const coNguoi = dauChu.length > 0;
  const nut = (
    <Button type="button" variant="outline" size="sm" className={className} disabled={tat || !coNguoi} title={coNguoi ? undefined : "Sàn chưa có đầu chủ nào"} onClick={dienThoai ? () => setMo(true) : undefined}>
      {nhan}
    </Button>
  );
  const chon = (nguoi: string) => {
    setMo(false);
    onGiao(nguoi);
  };
  if (dienThoai)
    return (
      <>
        {nut}
        <NganNoi mo={mo} onMo={setMo} tieuDe={`${dong.buildingName} · ${dong.unitNumber ?? "chỉ biết toà"}`} moTa="Giao cho đầu chủ">
          <DanhSach dong={dong} dauChu={dauChu} chon={chon} />
        </NganNoi>
      </>
    );
  return (
    <Popover open={mo} onOpenChange={setMo}>
      <PopoverTrigger render={nut} />
      <PopoverContent align="end" className="w-72 p-0">
        <DanhSach dong={dong} dauChu={dauChu} chon={chon} />
      </PopoverContent>
    </Popover>
  );
}
