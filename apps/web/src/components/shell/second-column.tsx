"use client";

import { type Home, HOME_LABEL } from "@quy-hang/core";
import { BO_NHOM_MAC_DINH } from "@quy-hang/core/today";
import { cn } from "cn";
import {
  CalendarClockIcon,
  ContactIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileSpreadsheetIcon,
  LinkIcon,
  BookmarkIcon,
  ListChecksIcon,
  PercentIcon,
  PlusIcon,
  SplitIcon,
  TagIcon,
  TextCursorInputIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { SU_KIEN_MO_LUU, useGocNhinCuaToi } from "@/app/(app)/inventory/goc-nhin-react";
import { cotCaiDat, MUC_SAN } from "@/app/(app)/settings/cai-dat";
import { mucDangChon, mucHomNay } from "@/app/(app)/today/mo-nhom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Cột thứ hai theo nhà (§9) — chuyển thể InnerSidebar + InnerSidebarNav của app-shell-8. Mọi nhà có cột, mặc định mở
// (hàng 91, chủ kho 02/11).
type Item = { label: string; href: string; icon: LucideIcon };

const SHARES: Item[] = [
  { label: "Link đã gửi", href: "/shares", icon: LinkIcon },
  { label: "Lịch xem", href: "/viewings", icon: CalendarClockIcon },
];

// Hôm nay: các hàng đợi của bộ nhóm mặc định (hàng 22). Bộ nhóm của sàn và số đếm theo nhóm vào cột ở hàng 42.
// Mỗi mục mở đúng nhóm trên Hôm nay qua `/today?nhom=<mã>` (va-he-bo-cuc).
export const TODAY_ITEMS: Item[] = mucHomNay(BO_NHOM_MAC_DINH).map((m) => ({ ...m, icon: ListChecksIcon }));

const TEAM: Item[] = [{ label: "Tổng quan", href: "/team", icon: UsersIcon }];

// Liên hệ (hàng 103): lọc theo loại liên hệ và dấu Lead — mỗi mục là đường `/contacts?…` màn Liên hệ đọc lại.
export const CONTACTS_ITEMS: Item[] = [
  { label: "Tất cả liên hệ", href: "/contacts", icon: ContactIcon },
  { label: "Chủ bán", href: "/contacts?type=Seller", icon: ContactIcon },
  { label: "Chủ cho thuê", href: "/contacts?type=Landlord", icon: ContactIcon },
  { label: "Người mua", href: "/contacts?type=Buyer", icon: ContactIcon },
  { label: "Người thuê", href: "/contacts?type=Tenant", icon: ContactIcon },
  { label: "Lead", href: "/contacts?status=lead", icon: ContactIcon },
];

/** Mục đang chọn của cột Liên hệ: khớp đúng cặp `type`, `status` của URL (mục không tham số khi cả hai vắng). */
export function mucLienHeDangChon(qs: URLSearchParams): string {
  const loai = qs.get("type");
  const dau = qs.get("status");
  const khop = CONTACTS_ITEMS.find(({ href }) => {
    const t = new URLSearchParams(href.split("?")[1] ?? "");
    return t.get("type") === loai && t.get("status") === dau;
  });
  return khop?.href ?? CONTACTS_ITEMS[0]!.href;
}

function ContactsColumn() {
  const dangChon = mucLienHeDangChon(useSearchParams());
  return (
    <ScrollArea className="h-full">
      <nav className="flex flex-col gap-0.5 px-2 py-1" aria-label={HOME_LABEL.contacts}>
        <SectionTitle>{HOME_LABEL.contacts}</SectionTitle>
        {CONTACTS_ITEMS.map(({ label, href, icon: Icon }) => (
          <Button
            key={href}
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href={href} />}
            aria-current={href === dangChon ? "page" : undefined}
            className={cn(
              "w-full justify-start gap-2.5 font-normal",
              href === dangChon ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0 opacity-70" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </Button>
        ))}
      </nav>
    </ScrollArea>
  );
}

// Biểu tượng của từng mục Cài đặt; nhóm và mục do `cotCaiDat` quyết (hàng cai-dat-hop-nhat).
const ICON_CAI_DAT: Record<string, LucideIcon> = {
  "/settings/personal": UserIcon,
  "/settings/users": UsersIcon,
  "/settings/labels": TagIcon,
  "/settings/fields": TextCursorInputIcon,
  "/settings/statuses": ListChecksIcon,
  "/settings/lead-routing": SplitIcon,
  "/settings/fees": PercentIcon,
  "/settings/templates": FileSpreadsheetIcon,
};

const coIcon = (m: { label: string; href: string }): Item => ({ ...m, icon: ICON_CAI_DAT[m.href] ?? ListChecksIcon });

/** Bảy mục sàn kèm biểu tượng — trang mẫu sống và bài kiểm đọc danh sách này. */
export const SETTINGS_ITEMS: Item[] = MUC_SAN.map(coIcon);

/** Người xem cột Cài đặt: vai ở sàn đang làm và tên sàn (nhóm «Sàn [Tên]»). */
export type CaiDatCua = { roles: readonly string[]; tenSan: string };

function SectionTitle({ children }: { children: string }) {
  return <p className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground uppercase">{children}</p>;
}

function NavList({ items }: { items: Item[] }) {
  const pathname = usePathname();
  const dangChon = mucDangChon(items, pathname, useSearchParams());
  return (
    <div className="flex flex-col gap-0.5 px-2">
      {items.map(({ label, href, icon: Icon }) => {
        const isActive = href === dangChon;
        return (
          <Button
            key={href}
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href={href} />}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "w-full justify-start gap-2.5 font-normal",
              isActive ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0 opacity-70" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </Button>
        );
      })}
    </div>
  );
}

function InventoryColumn() {
  // Góc nhìn của tôi lưu trên máy theo người và sàn (hàng 14); góc nhìn của đội cần bảng ở máy chủ — hàng sau.
  const { ds } = useGocNhinCuaToi();
  const items: Item[] = ds.map((g) => ({ label: g.ten, href: `/inventory/views/${encodeURIComponent(g.id)}`, icon: BookmarkIcon }));
  return (
    <>
      <div className="min-h-0 grow">
        <ScrollArea className="h-full">
          <nav className="flex flex-col py-1" aria-label="Góc nhìn">
            <SectionTitle>Góc nhìn của đội</SectionTitle>
            <p className="px-3 py-1 text-sm text-muted-foreground">Chưa có góc nhìn</p>
            <Separator className="my-2" />
            <SectionTitle>Góc nhìn của tôi</SectionTitle>
            {items.length ? <NavList items={items} /> : <p className="px-3 py-1 text-sm text-muted-foreground">Chưa có góc nhìn</p>}
            <div className="px-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2.5 font-normal"
                onClick={() => window.dispatchEvent(new Event(SU_KIEN_MO_LUU))}
              >
                <PlusIcon aria-hidden="true" />
                Lưu góc nhìn
              </Button>
            </div>
          </nav>
        </ScrollArea>
      </div>
      <div className="shrink-0 border-t px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground">Độ tươi</p>
        <p className="text-sm text-muted-foreground">Chưa có số</p>
      </div>
    </>
  );
}

function SettingsColumn({ caiDat }: { caiDat: CaiDatCua }) {
  const nhom = cotCaiDat(caiDat.roles, caiDat.tenSan);
  return (
    <ScrollArea className="h-full">
      <nav className="flex flex-col py-1" aria-label={HOME_LABEL.settings}>
        {nhom.map((n, i) => (
          <div key={n.tieuDe}>
            {i > 0 && <Separator className="my-2" />}
            <SectionTitle>{n.tieuDe}</SectionTitle>
            <NavList items={n.muc.map(coIcon)} />
          </div>
        ))}
      </nav>
    </ScrollArea>
  );
}

/** Số mục cố định của cột thứ hai theo nhà — rẽ đủ mọi nhà (luật đợt 68); bài kiểm đòi mỗi nhà ít nhất một mục. */
export function soMucCot(home: Home, caiDat: CaiDatCua): number {
  switch (home) {
    case "today":
      return TODAY_ITEMS.length;
    case "inventory":
      return 1; // «+ Lưu góc nhìn» luôn có; góc nhìn đã lưu thêm vào
    case "shares":
      return SHARES.length;
    case "contacts":
      return CONTACTS_ITEMS.length;
    case "team":
      return TEAM.length;
    case "settings":
      return cotCaiDat(caiDat.roles, caiDat.tenSan).reduce((n, g) => n + g.muc.length, 0);
    default: {
      const thieu: never = home;
      return thieu;
    }
  }
}

function DanhSachMuc({ home, items }: { home: Home; items: Item[] }) {
  return (
    <ScrollArea className="h-full">
      <nav className="flex flex-col py-1" aria-label={HOME_LABEL[home]}>
        <SectionTitle>{HOME_LABEL[home]}</SectionTitle>
        <NavList items={items} />
      </nav>
    </ScrollArea>
  );
}

// Rẽ đủ mọi nhà, nhánh `never` (luật đợt 68): nhà mới mà quên cột là lỗi biên dịch, không rơi về mục của Đội.
function ColumnContent({ home, caiDat }: { home: Home; caiDat: CaiDatCua }) {
  switch (home) {
    case "inventory":
      return <InventoryColumn />;
    case "settings":
      return <SettingsColumn caiDat={caiDat} />;
    case "contacts":
      return <ContactsColumn />;
    case "shares":
      return <DanhSachMuc home={home} items={SHARES} />;
    case "today":
      return <DanhSachMuc home={home} items={TODAY_ITEMS} />;
    case "team":
      return <DanhSachMuc home={home} items={TEAM} />;
    default: {
      const thieu: never = home;
      return thieu;
    }
  }
}

export function SecondColumn({ home, open, caiDat }: { home: Home; open: boolean; caiDat: CaiDatCua }) {
  return (
    <aside
      data-slot="second-column"
      data-state={open ? "open" : "closed"}
      aria-label={`Cột ${HOME_LABEL[home]}`}
      className={cn(
        "hidden shrink-0 overflow-hidden border-r md:flex",
        "transition-[width] duration-200 ease-linear motion-reduce:transition-none",
        open ? "w-(--sidebar-width-inner)" : "w-0 border-r-0",
      )}
    >
      <div className="flex w-(--sidebar-width-inner) shrink-0 flex-col overflow-hidden" inert={!open}>
        <ColumnContent home={home} caiDat={caiDat} />
      </div>
    </aside>
  );
}

/** Tay nắm gập/mở cột thứ hai — chuyển thể InnerSidebarRailToggle (nút của kho thay thẻ button trần). */
export function SecondColumnToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const Icon = open ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <Button
      variant="outline"
      size="icon-xs"
      onClick={onToggle}
      aria-label={open ? "Gập cột" : "Mở cột"}
      aria-expanded={open}
      className="absolute top-1/2 z-30 hidden -translate-y-1/2 rounded-full md:inline-flex"
      style={{ left: open ? "calc(var(--sidebar-width-inner) - 0.75rem)" : "-0.25rem" }}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
