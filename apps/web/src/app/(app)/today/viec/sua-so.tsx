"use client";

// Nút «Sửa số» của lead bị trả lại: mở ngăn với đúng ô sửa số của Lead đã nhập.
import { useState } from "react";

import { NganNoi } from "@/components/bo-cuc";
import { Button } from "@/components/ui/button";

import { OGuiLai } from "../../leads/mine/lead-da-nhap";

export function SuaSo({ nhan, className, leadId, tieuDe, guiLai }: { nhan: string; className?: string; leadId: string; tieuDe: string; guiLai: (id: string, so: string) => Promise<string | null> }) {
  const [mo, setMo] = useState(false);
  const gui = async (id: string, so: string) => {
    const loi = await guiLai(id, so);
    if (!loi) setMo(false);
    return loi;
  };
  return (
    <>
      <Button type="button" variant="outline" size="sm" className={className} onClick={() => setMo(true)}>
        {nhan}
      </Button>
      <NganNoi mo={mo} onMo={setMo} tieuDe={tieuDe} moTa="Sửa số và gửi lại">
        <OGuiLai id={leadId} guiLai={gui} />
      </NganNoi>
    </>
  );
}
