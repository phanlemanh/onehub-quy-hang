"use client";

import { isCotThuocTinhMo } from "@quy-hang/core";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { createContext, type ReactNode, useContext, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "cn";

// Cột thuộc tính của bố cục Hồ sơ (chủ kho 02/11, hàng 91): cột bên trái 320px kiểu Verve cạnh thân hồ sơ, người dùng mở
// hay gập. Máy tính mặc định mở, nút gập ở đầu cột, gập còn dải mảnh có nút mở lại; điện thoại cột xếp trên thân. Vỏ cấp
// trạng thái nhớ theo người và sàn (cùng kho nhớ với cột thứ hai); ngoài vỏ (trang mẫu sống) cột tự giữ trạng thái.

type Nho = { mo: boolean; doi: (mo: boolean) => void };

const NhoCotThuocTinh = createContext<Nho | null>(null);

/** Vỏ đặt quanh nội dung màn: cột thuộc tính của mọi màn Hồ sơ đọc và ghi trạng thái nhớ ở đây. */
export function NhoCotThuocTinhProvider({ mo, onDoi, children }: { mo: boolean; onDoi: (mo: boolean) => void; children: ReactNode }) {
  return <NhoCotThuocTinh.Provider value={{ mo, doi: onDoi }}>{children}</NhoCotThuocTinh.Provider>;
}

export function CotThuocTinh({ children }: { children: ReactNode }) {
  const nho = useContext(NhoCotThuocTinh);
  const [moRieng, setMoRieng] = useState(isCotThuocTinhMo(undefined));
  const mo = nho ? nho.mo : moRieng;
  const doi = nho ? nho.doi : setMoRieng;
  const id = useId();

  return (
    <aside
      data-vung="cot-phu"
      data-cot-thuoc-tinh={mo ? "mo" : "gap"}
      aria-label="Cột thuộc tính"
      className={cn("flex min-w-0 shrink-0 flex-col gap-2", mo ? "w-full md:w-cot-thuoc-tinh" : "md:w-auto")}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("text-xs font-medium text-muted-foreground", !mo && "md:sr-only")}>Thuộc tính</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-expanded={mo}
          aria-controls={id}
          aria-label={mo ? "Gập cột thuộc tính" : "Mở cột thuộc tính"}
          onClick={() => doi(!mo)}
        >
          {mo ? <PanelLeftCloseIcon aria-hidden="true" /> : <PanelLeftOpenIcon aria-hidden="true" />}
        </Button>
      </div>
      {mo && (
        <div id={id} className="flex min-w-0 flex-col gap-khung">
          {children}
        </div>
      )}
    </aside>
  );
}
