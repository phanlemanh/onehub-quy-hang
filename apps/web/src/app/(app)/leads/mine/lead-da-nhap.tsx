"use client";

import { CornerDownRightIcon, InboxIcon } from "lucide-react";
import { Fragment, useCallback, useEffect, useState, type ReactNode } from "react";

import {
  AWAITING_ROUTING_LABEL,
  LEAD_STAGE_LABELS,
  NEED_LABELS,
  understoodPrice,
  type LeadState,
  type MyLeadView,
} from "@quy-hang/core/dedupe";

import { ChoTai } from "@/components/bo-cuc";
import { Badge } from "@/components/reui/badge";
import { FramePanel } from "@/components/reui/frame";
import { BaoLoiVung, TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useKhiCoMangLai } from "../../today/viec/mang";

// Vùng «Lead đã nhập» (hàng 27) — khối đích `@reui/list-11` (Top Movers) của vo-va-ia §2, chuyển thể tại chỗ dùng từ
// lối ReUI của trang ba lối: bảng ba cột Lead · Nấc · Giờ và đầu chủ với Badge -light; khung hẹp (điện thoại) ẩn cột ba,
// giờ và đầu chủ xuống dưới tên; dòng phụ dưới lead bị trả lại cho ô sửa số. Nấc, nhãn và bản dữ liệu là của lõi
// (`myLeadView`): màn không thấy số chủ, mã hàng hay trường nào của hàng.

export type NguonLeadDaNhap = {
  /** Lead mình đã nhập, mới nhất trước; `null` khi không tải được. */
  lay: () => Promise<MyLeadView[] | null>;
  guiLai: (id: string, ownerPhone: string) => Promise<{ ok: true } | { ok: false; loi: string }>;
};

type BadgeNac = "warning-light" | "info-light" | "primary-light" | "success-light" | "destructive-light" | "invert-light";
const BADGE: Record<LeadState, BadgeNac> = {
  sent: "info-light",
  accepted: "info-light",
  called: "primary-light",
  on_board: "success-light",
  returned: "destructive-light",
  resubmitted: "invert-light",
  supplement: "invert-light",
  discarded: "invert-light",
};

const gio = new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit" });
const ngayGio = new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const ngay = new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short" });
/** Giờ hôm nay thì «hh:mm», ngày khác thì «dd/MM hh:mm». */
function docMoc(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return ngay.format(d) === ngay.format(new Date()) ? gio.format(d) : ngayGio.format(d);
}

/** Mốc của nấc hay trạng thái hiện tại. */
function mocNac(l: MyLeadView): string | null {
  const theoNac: Record<LeadState, string | null> = {
    sent: l.routedAt ?? l.createdAt,
    accepted: l.acceptedAt,
    called: l.firstCalledAt,
    on_board: l.boardAt,
    returned: l.returnedAt,
    resubmitted: l.resubmittedAt,
    supplement: l.createdAt,
    discarded: l.createdAt,
  };
  return theoNac[l.stage];
}

const tenCan = (l: MyLeadView) => `${l.buildingName} · ${l.unitNumber ?? "chỉ biết toà"}`;
const cauPhu = (l: MyLeadView) => `${NEED_LABELS[l.need]} · ${understoodPrice(l.listPrice, l.feeInclusion)}`;
function tenDauChu(l: MyLeadView) {
  if (l.stage === "supplement") return `Gửi tới ${l.agentName ?? "đầu chủ của hàng"}`;
  return l.agentName ?? "Chưa có người nhận";
}

/** Kiểm số mới telesales gõ: mười chữ số, bắt đầu bằng 0 (cho gõ cách hay +84). Trả câu lỗi hay null. */
function kiemSoMoi(raw: string): string | null {
  const so = raw.replace(/[\s.-]/g, "").replace(/^\+84/, "0");
  if (!so) return "Nhập số mới của chủ nhà.";
  if (!/^0\d{9}$/.test(so)) return "Số cần mười chữ số, bắt đầu bằng 0.";
  return null;
}

/** Ô sửa số của lead bị trả lại: telesales gõ số mới rồi gửi lại. Không hiện số cũ. */
export function OGuiLai({ id, guiLai }: { id: string; guiLai: (id: string, so: string) => Promise<string | null> }) {
  const [so, setSo] = useState("");
  const [loi, setLoi] = useState<string | null>(null);
  const [dangGui, setDangGui] = useState(false);
  const oId = `so-moi-${id}`;
  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-start"
      onSubmit={async (e) => {
        e.preventDefault();
        const l = kiemSoMoi(so);
        setLoi(l);
        if (l) return;
        setDangGui(true);
        const kq = await guiLai(id, so);
        setDangGui(false);
        if (kq) setLoi(kq);
      }}
    >
      <Field data-invalid={!!loi || undefined} className="sm:w-60">
        <FieldLabel htmlFor={oId} className="sr-only">
          Số mới của chủ nhà
        </FieldLabel>
        <Input
          id={oId}
          type="tel"
          inputMode="tel"
          autoComplete="off"
          placeholder="Số mới, 0900 000 0xx"
          value={so}
          aria-invalid={!!loi || undefined}
          onChange={(e) => (setSo(e.target.value), setLoi(null))}
        />
        {loi && <FieldError>{loi}</FieldError>}
      </Field>
      <Button type="submit" disabled={dangGui}>
        Sửa số và gửi lại
      </Button>
    </form>
  );
}

function DongLead({ l, tuGuiLai, guiLai }: { l: MyLeadView; tuGuiLai: boolean; guiLai: (id: string, so: string) => Promise<string | null> }) {
  const choChia = l.awaitingRouting;
  const nhan = choChia ? AWAITING_ROUTING_LABEL : LEAD_STAGE_LABELS[l.stage];
  const moc = docMoc(mocNac(l));
  const ghiChu =
    l.stage === "supplement"
      ? "Tin bổ sung cho hàng đang mở"
      : l.stage === "resubmitted"
        ? `Trả lại vì «${l.returnReason}» · đã gửi lại thành lead mới`
        : tuGuiLai
          ? "Gửi lại từ lead bị trả lại"
          : null;
  return (
    <>
      <TableRow className={l.stage === "returned" ? "border-b-0" : undefined}>
        <TableCell className="px-3.5 py-3 whitespace-normal @lg:pe-16">
          <div className="min-w-0">
            <div className="text-foreground text-base font-medium">{tenCan(l)}</div>
            <div className="text-muted-foreground text-sm">{cauPhu(l)}</div>
            <div className="text-muted-foreground text-sm @md:hidden">
              {moc} · {tenDauChu(l)}
            </div>
            {ghiChu && (
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                {tuGuiLai && <CornerDownRightIcon className="size-3.5" aria-hidden />}
                {ghiChu}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="px-3.5 py-3">
          <Badge variant={choChia ? "warning-light" : BADGE[l.stage]} size="lg">
            {nhan}
          </Badge>
        </TableCell>
        <TableCell className="hidden px-3.5 py-3 @md:table-cell">
          <div className="text-foreground text-sm font-medium tabular-nums">{moc}</div>
          <div className="text-muted-foreground text-sm">{tenDauChu(l)}</div>
        </TableCell>
      </TableRow>
      {l.stage === "returned" && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={3} className="px-3.5 pt-0 pb-3 whitespace-normal">
            <div className="flex flex-col gap-2">
              <div className="text-destructive text-sm">
                {l.agentName ?? "Đầu chủ"} trả lại: «{l.returnReason}»
              </div>
              <OGuiLai id={l.id} guiLai={guiLai} />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function Bang({ children }: { children: ReactNode }) {
  return (
    <Table>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead className="text-muted-foreground ps-3.5 text-sm">Lead</TableHead>
          <TableHead className="text-muted-foreground text-sm">Nấc</TableHead>
          <TableHead className="text-muted-foreground hidden text-sm @md:table-cell">Giờ · đầu chủ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  );
}

export function LeadDaNhap({ nguon }: { nguon: NguonLeadDaNhap }) {
  const [leads, setLeads] = useState<MyLeadView[] | null | "dang-tai">("dang-tai");
  const tai = useCallback(async () => {
    setLeads("dang-tai");
    setLeads(await nguon.lay());
  }, [nguon]);
  useEffect(() => {
    let con = true;
    void nguon.lay().then((ds) => con && setLeads(ds));
    return () => {
      con = false;
    };
  }, [nguon]);
  useKhiCoMangLai(() => {
    if (leads === null) void tai();
  });
  const guiLai = useCallback(
    async (id: string, so: string) => {
      const kq = await nguon.guiLai(id, so);
      if (!kq.ok) return kq.loi;
      const ds = await nguon.lay();
      if (ds) setLeads(ds);
      return null;
    },
    [nguon],
  );

  if (leads === "dang-tai") {
    // Chờ tải theo hình bảng của bố cục Danh sách – chi tiết (ADR-0024 §4), trong vùng của khuôn.
    return (
      <FramePanel aria-busy>
        <ChoTai kieu="danh-sach-chi-tiet" />
      </FramePanel>
    );
  }
  if (leads === null) {
    return (
      <FramePanel className="p-0!">
        <BaoLoiVung title="Không tải được lead đã nhập" description="Mạng hay máy chủ không trả lời. Lead đã gửi vẫn còn nguyên." onThuLai={() => void tai()} />
      </FramePanel>
    );
  }
  if (leads.length === 0) {
    return (
      <FramePanel>
        <TrangThai kind="empty" icon={InboxIcon} title="Chưa có lead nào" description="Bấm «+ Lead» để nhập lead đầu tiên. Lead bạn nhập hiện ở đây, mới nhất trước, kèm nấc đầu chủ đã tới." />
      </FramePanel>
    );
  }
  const tuGuiLai = new Set(leads.map((l) => l.resubmittedLeadId).filter((x): x is string => !!x));
  return (
    <FramePanel className="p-0!">
      <Bang>
        {leads.map((l) => (
          <Fragment key={l.id}>
            <DongLead l={l} tuGuiLai={tuGuiLai.has(l.id)} guiLai={guiLai} />
          </Fragment>
        ))}
      </Bang>
    </FramePanel>
  );
}
