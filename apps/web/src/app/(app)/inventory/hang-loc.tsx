"use client";

/**
 * Hàng lọc theo cột — chuyển thể `filter-row.tsx` của khối data-grid-editing-6: cùng cấu trúc và lớp, đổi chữ sang tiếng
 * Việt và đọc cột của Bảng hàng. Mỗi cột một ô đúng kiểu: chữ chứa · chọn một giá trị · luật số.
 */
import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { cn } from "cn";
import { FunnelXIcon, SearchIcon, TriangleAlertIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Cot, CotId } from "./cot";
import type { BoLocCot } from "./loc";

type HangLocCtx = {
  open: boolean;
  values: BoLocCot;
  invalid: ReadonlySet<CotId>;
  options: (id: CotId) => { value: string; label: string }[];
  setValue: (id: CotId, value: string) => void;
  clearAll: () => void;
};

export const HangLocContext = createContext<HangLocCtx | null>(null);

function useHangLoc() {
  const c = useContext(HangLocContext);
  if (!c) throw new Error("Hàng lọc cần HangLocContext");
  return c;
}

const FIELD_CHROME =
  "-mx-2 h-7 flex-1 border-transparent bg-transparent shadow-none hover:border-input dark:bg-transparent has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[aria-invalid=true]]:border-destructive";
const TRIGGER_CHROME =
  "-mx-2 h-7 w-full min-w-0 flex-1 border-transparent bg-transparent px-2 shadow-none hover:border-input focus-visible:border-ring dark:bg-transparent";
const BAT_KY = "__bat-ky";

/** Hai dòng của tiêu đề: tên cột giữ chiều cao, hàng lọc mở dưới một đường mảnh. */
export function HeaderStack({ title, filter }: { title: ReactNode; filter?: ReactNode }) {
  const { open } = useHangLoc();
  if (!open) return title;
  return (
    <div className="flex flex-col">
      <div className="flex h-8 items-center">{title}</div>
      <div className="before:bg-border before:absolute before:inset-x-0 before:h-px">
        <div className="flex h-9 items-center">{filter}</div>
      </div>
    </div>
  );
}

function XoaO({ cot }: { cot: Cot }) {
  const { setValue } = useHangLoc();
  return (
    <InputGroupAddon align="inline-end">
      <InputGroupButton size="icon-xs" aria-label={`Bỏ lọc ${cot.label}`} onClick={() => setValue(cot.id, "")}>
        <XIcon aria-hidden="true" />
      </InputGroupButton>
    </InputGroupAddon>
  );
}

function LocChu({ cot }: { cot: Cot }) {
  const { values, setValue } = useHangLoc();
  const value = values[cot.id] ?? "";
  return (
    <InputGroup className={FIELD_CHROME}>
      <InputGroupAddon>
        <SearchIcon aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput value={value} placeholder={cot.filterHint} aria-label={`Lọc ${cot.label} theo chữ`} onChange={(e) => setValue(cot.id, e.target.value)} />
      {value ? <XoaO cot={cot} /> : null}
    </InputGroup>
  );
}

function LocSo({ cot }: { cot: Cot }) {
  const { values, invalid, setValue } = useHangLoc();
  const hintId = useId();
  const value = values[cot.id] ?? "";
  // Luật chỉ bị chấm khi người chốt (rời ô hay Enter): gõ dở «>» không nháy đỏ.
  const [chot, setChot] = useState(false);
  const sai = chot && invalid.has(cot.id);
  return (
    <InputGroup className={FIELD_CHROME}>
      <InputGroupInput
        value={value}
        placeholder={cot.filterHint}
        inputMode="text"
        className="text-end"
        aria-label={`Lọc ${cot.label} theo luật số`}
        aria-invalid={sai || undefined}
        aria-describedby={sai ? hintId : undefined}
        onChange={(e) => {
          setChot(false);
          setValue(cot.id, e.target.value);
        }}
        onBlur={() => setChot(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") setChot(true);
        }}
      />
      {sai ? (
        <>
          <Tooltip>
            <TooltipTrigger render={<InputGroupAddon align="inline-end" className="text-destructive" />}>
              <TriangleAlertIcon aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>Gõ luật như &gt;40 hay khoảng như 5-20</TooltipContent>
          </Tooltip>
          <span id={hintId} className="sr-only">
            Không đọc được luật số. Gõ như lớn hơn 40, hay khoảng 5 đến 20.
          </span>
        </>
      ) : null}
      {value ? <XoaO cot={cot} /> : null}
    </InputGroup>
  );
}

function LocChon({ cot }: { cot: Cot }) {
  const { values, options, setValue } = useHangLoc();
  const opts = options(cot.id);
  const value = values[cot.id] || BAT_KY;
  const items = [{ value: BAT_KY, label: cot.filterHint }, ...opts];
  return (
    <Select items={items} value={value} onValueChange={(next) => setValue(cot.id, !next || next === BAT_KY ? "" : String(next))}>
      <SelectTrigger size="sm" className={TRIGGER_CHROME} aria-label={`Lọc ${cot.label}`}>
        <SelectValue>
          {value === BAT_KY ? <span className="text-muted-foreground truncate">{cot.filterHint}</span> : (opts.find((o) => o.value === value)?.label ?? value)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false} className="min-w-(--anchor-width)!">
        <SelectItem value={BAT_KY}>
          <span className="text-muted-foreground">{cot.filterHint}</span>
        </SelectItem>
        <SelectSeparator />
        {opts.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Ô của một cột trong hàng lọc, chọn theo kiểu cột. */
export function OLoc({ cot }: { cot: Cot }) {
  if (cot.kind === "chon") return <LocChon cot={cot} />;
  if (cot.kind === "so") return <LocSo cot={cot} />;
  return <LocChu cot={cot} />;
}

/** Nằm ở cột số dòng — ô duy nhất của hàng lọc không thuộc cột nào. */
export function NutXoaLoc() {
  const { values, clearAll } = useHangLoc();
  const co = Object.values(values).some(Boolean);
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button type="button" variant="ghost" size="icon-xs" className={cn("mx-auto")} disabled={!co} aria-label="Xoá mọi ô lọc" onClick={clearAll} />}
      >
        <FunnelXIcon aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent>Xoá lọc</TooltipContent>
    </Tooltip>
  );
}
