"use client";

// Hôm nay của trưởng nhóm (hàng 42) — lối ReUI được duyệt ở Cổng Phạm vi (ADR-0019, gate1): khối dashboard-6 chuyển thể ở
// `components/khoi/dashboard-6` — dải ba ô số, bảng theo đầu chủ cạnh hàng đợi lead quá hạn và ngoại lệ; bỏ biểu đồ.
// Hàng đợi và đầu chủ đọc qua API (`/api/v1/team/*`); hàng cũ theo người đếm trên căn của kho trên máy (như Hôm nay của
// đầu chủ), chỉ căn toàn sàn. «Giao lại» gọi `POST /api/v1/leads/{id}/assign` rồi đọc lại hàng đợi.
import { AlertTriangleIcon, ClockAlertIcon, HistoryIcon, PhoneOffIcon, RotateCwIcon, UserRoundIcon, UserRoundXIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

import { ChoTai } from "@/components/bo-cuc";
import { CoverageDashboard } from "@/components/khoi/dashboard-6/coverage-dashboard";
import type { CrewMember, CrewStatus, MetricCard, QueueAction } from "@/components/khoi/dashboard-6/data";
import { Badge } from "@/components/reui/badge";
import { Frame, FramePanel } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDanhSachHang } from "@/lib/sync/react";

import { KhungTruongNhom } from "./khung";
import { giaoLaiLead, layDauChuCuaSan, layHangDoiTruongNhom, type DauChuCuaSan, type DongLeadTruongNhom } from "./nguon";
import {
  baO,
  CHU_CHUA_CO_CAN,
  CHU_PHAM_VI,
  CHU_TRANG_THAI,
  chuQuaHan,
  dongTheoNguoi,
  hangCuTrenMay,
  maNgan,
  ngayVN,
  trangThaiTruongNhom,
} from "./truong-nhom-trang-thai";

type Kind = DongLeadTruongNhom["kind"];
const NHAN_LOAI: Record<Kind, string> = { unrouted: "Chưa chia được", accept_overdue: "Quá hạn nhận", first_call_overdue: "Quá hạn gọi" };
const BADGE_LOAI = { unrouted: "warning-light", accept_overdue: "destructive-light", first_call_overdue: "info-light" } as const satisfies Record<Kind, string>;
const ICON_LOAI: Record<Kind, ReactNode> = {
  unrouted: <UserRoundXIcon aria-hidden="true" />,
  accept_overdue: <ClockAlertIcon aria-hidden="true" />,
  first_call_overdue: <PhoneOffIcon aria-hidden="true" />,
};

const trangThaiTuoi = (phanTram: number): CrewStatus => (phanTram >= 80 ? "tuoi" : phanTram >= 60 ? "chu-y" : "cu");
const chuDau = (ten: string) => ten.replace(/[[\]]/g, "").trim().split(/\s+/).pop()?.slice(0, 2).toUpperCase() || "—";

function useNgoaiTuyen() {
  return useSyncExternalStore(
    (f) => {
      window.addEventListener("online", f);
      window.addEventListener("offline", f);
      return () => {
        window.removeEventListener("online", f);
        window.removeEventListener("offline", f);
      };
    },
    () => !navigator.onLine,
    () => false,
  );
}

/** Giờ hiện tại, đi lại mỗi phút — «quá hạn bao lâu» và ngày đếm hàng cũ tính lại theo. */
function useBayGio() {
  const [bayGio, setBayGio] = useState(() => new Date().toISOString());
  useEffect(() => {
    const t = window.setInterval(() => setBayGio(new Date().toISOString()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  return bayGio;
}

type Tai = { dang: boolean; loi: boolean; mang: boolean; hangDoi: DongLeadTruongNhom[] | null };

/** Nút «Giao lại» — danh sách đầu chủ của sàn; người nghỉ có nhãn, số lead đang mở cạnh tên. Enter giao, Esc đóng. */
function GiaoLai({ dong, dauChu, tat, onGiao }: { dong: DongLeadTruongNhom; dauChu: DauChuCuaSan[]; tat: boolean; onGiao: (nguoi: string) => void }) {
  const [mo, setMo] = useState(false);
  const coNguoi = dauChu.length > 0;
  return (
    <Popover open={mo} onOpenChange={setMo}>
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" size="xs" disabled={tat || !coNguoi} title={coNguoi ? undefined : "Sàn chưa có đầu chủ nào"}>
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
              {dauChu.map((d) => (
                <CommandItem
                  key={d.userId}
                  value={`${d.displayName} ${d.userId}`}
                  disabled={d.userId === dong.agentUserId}
                  onSelect={() => {
                    setMo(false);
                    onGiao(d.userId);
                  }}
                >
                  <UserRoundIcon aria-hidden="true" />
                  <span className="truncate">{d.displayName || maNgan(d.userId)}</span>
                  {d.onLeave && <Badge variant="warning-light">Đang nghỉ</Badge>}
                  <span className="text-muted-foreground ms-auto text-xs tabular-nums">{d.openLeads} lead</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function HomNayTruongNhom() {
  const dsHang = useDanhSachHang();
  const ngoaiTuyen = useNgoaiTuyen();
  const bayGio = useBayGio();

  // ——— Hàng đợi và đầu chủ qua API ———
  const [tai, setTai] = useState<Tai>({ dang: true, loi: false, mang: false, hangDoi: null });
  const [dauChu, setDauChu] = useState<DauChuCuaSan[]>([]);
  const doc = useCallback(async () => {
    const [hd, dc] = await Promise.all([layHangDoiTruongNhom(), layDauChuCuaSan()]);
    if (dc.ok) setDauChu(dc.items);
    // Lỗi đọc giữ lần đọc cuối: mất mạng thì số cũ còn hiện kèm dải.
    setTai((t) => (hd.ok ? { dang: false, loi: false, mang: false, hangDoi: hd.items } : { dang: false, loi: !hd.mang, mang: hd.mang, hangDoi: t.hangDoi }));
  }, []);
  useEffect(() => {
    let huy = false;
    void Promise.all([layHangDoiTruongNhom(), layDauChuCuaSan()]).then(([hd, dc]) => {
      if (huy) return;
      if (dc.ok) setDauChu(dc.items);
      setTai(hd.ok ? { dang: false, loi: false, mang: false, hangDoi: hd.items } : { dang: false, loi: !hd.mang, mang: hd.mang, hangDoi: null });
    });
    return () => {
      huy = true;
    };
  }, []);
  const thuLai = () => {
    setTai((t) => ({ ...t, dang: true }));
    void doc();
  };

  // ——— Giao lại ———
  const [loiGiao, setLoiGiao] = useState<Record<string, string>>({});
  const [dangGiao, setDangGiao] = useState<ReadonlySet<string>>(new Set());
  const giao = (dong: DongLeadTruongNhom, nguoi: string) => {
    setDangGiao((s) => new Set(s).add(dong.leadId));
    setLoiGiao((m) => {
      const con = { ...m };
      delete con[dong.leadId];
      return con;
    });
    void giaoLaiLead(dong.leadId, nguoi)
      .then(async (kq) => {
        if (!kq.ok) return setLoiGiao((m) => ({ ...m, [dong.leadId]: kq.loi }));
        // Dòng rời hàng đợi ngay, rồi đọc lại để số và hạn đúng máy chủ.
        setTai((t) => ({ ...t, hangDoi: t.hangDoi?.filter((d) => d.leadId !== dong.leadId) ?? null }));
        await doc();
      })
      .finally(() =>
        setDangGiao((s) => {
          const moi = new Set(s);
          moi.delete(dong.leadId);
          return moi;
        }),
      );
  };

  const tt = trangThaiTruongNhom({ dangTai: tai.dang, loiTai: tai.loi, matMang: ngoaiTuyen || tai.mang, hangDoi: tai.hangDoi, loiGiao });

  // ——— Hàng cũ theo người, trên máy ———
  const homNay = ngayVN(bayGio);
  const hangCu = useMemo(() => hangCuTrenMay(dsHang, homNay), [dsHang, homNay]);
  const theoNguoi = dongTheoNguoi(hangCu.dong, dauChu);

  if (tt.trangThai === "dang-tai")
    return (
      <KhungTruongNhom>
        <ChoTai kieu="bang-dieu-khien" />
      </KhungTruongNhom>
    );

  const hangDoi = [...(tai.hangDoi ?? [])].sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
  const so = tai.hangDoi ? baO(tai.hangDoi) : null;
  const tenNguoi = (id: string | null) => (id ? (dauChu.find((d) => d.userId === id)?.displayName ?? maNgan(id)) : "—");

  const metrics: MetricCard[] = [
    {
      id: "qua-han",
      label: "Lead quá hạn",
      value: so ? String(so.leadQuaHan) : "—",
      detail: "quá hạn nhận hay gọi",
      change: "Giao lại",
      variant: "destructive-light",
      icon: <ClockAlertIcon aria-hidden="true" />,
    },
    {
      id: "ngoai-le",
      label: "Ngoại lệ",
      value: so ? String(so.ngoaiLe) : "—",
      detail: "lead chưa chia được",
      change: "Chưa có người",
      variant: "warning-light",
      icon: <AlertTriangleIcon aria-hidden="true" />,
    },
    {
      id: "hang-cu",
      label: "Hàng cũ",
      value: String(hangCu.hangCu),
      detail: "căn cần gọi lại",
      change: "Toàn sàn",
      variant: "info-light",
      icon: <HistoryIcon aria-hidden="true" />,
    },
  ];
  const members: CrewMember[] = theoNguoi.map((d) => {
    const phanTram = Math.round(d.tiLeTuoi * 100);
    return {
      id: d.userId ?? "chua-co",
      name: d.ten,
      role: d.userId === null ? "Cần chia" : d.nghi ? "Đang nghỉ" : "Đầu chủ",
      initials: d.userId === null ? "—" : chuDau(d.ten),
      location: String(d.mo),
      coverage: phanTram,
      reliefHours: d.canGoiLai,
      notes: `${d.mo - d.canGoiLai}/${d.mo} căn`,
      status: trangThaiTuoi(phanTram),
    };
  });
  const items: QueueAction[] = hangDoi.map((d) => {
    const loi = loiGiao[d.leadId];
    return {
      id: d.leadId,
      title: `${d.buildingName} · ${d.unitNumber ?? "chỉ biết toà"}`,
      detail: (
        <span className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5">
            <Badge variant={BADGE_LOAI[d.kind]}>{NHAN_LOAI[d.kind]}</Badge>
            <span className="truncate">
              {tenNguoi(d.agentUserId)} · quá hạn {chuQuaHan(d.dueAt, bayGio)}
            </span>
          </span>
          {loi && <span className="text-destructive whitespace-normal">{loi}</span>}
        </span>
      ),
      variant: BADGE_LOAI[d.kind],
      icon: ICON_LOAI[d.kind],
    };
  });

  const loiTai = tt.trangThai === "loi";
  return (
    <KhungTruongNhom>
      {tt.trangThai === "mat-mang" ? (
        <Frame stacked className="w-full min-w-0">
          <FramePanel className="p-0!">
            <TrangThai kind="notice" title={tt.chu} description="Số là lần đọc cuối — giao lại khi có mạng." />
          </FramePanel>
        </Frame>
      ) : null}
      {loiTai ? (
        <Frame stacked className="w-full min-w-0">
          <FramePanel className="p-0!">
            <TrangThai
              kind="error"
              title={tt.chu}
              description={
                <span className="flex flex-col items-start gap-2">
                  <span>Bảng theo đầu chủ vẫn đọc từ máy.</span>
                  <Button size="sm" variant="outline" onClick={thuLai}>
                    <RotateCwIcon data-icon="inline-start" />
                    Thử lại
                  </Button>
                </span>
              }
            />
          </FramePanel>
        </Frame>
      ) : null}
      <CoverageDashboard
        heading="Hôm nay của trưởng nhóm"
        crumbs={[{ label: "Hôm nay", href: "/today" }, { label: "Trưởng nhóm" }]}
        metrics={metrics}
        members={members}
        coverage={{
          title: "Theo đầu chủ",
          description: "Căn đang mở, cần gọi lại và độ tươi",
          badge: `${dauChu.length} đầu chủ`,
          member: "Đầu chủ",
          location: "Căn đang mở",
          coverage: "Tỉ lệ tươi",
          relief: "Cần gọi lại",
          status: "Trạng thái",
          empty: CHU_CHUA_CO_CAN,
          footnote: CHU_PHAM_VI,
        }}
        queue={{
          title: CHU_TRANG_THAI["mac-dinh"],
          description: items.length > 0 ? `${items.length} lead, quá hạn lâu nhất trước` : loiTai ? CHU_TRANG_THAI.loi : CHU_TRANG_THAI.trong,
          emptyTitle: loiTai ? CHU_TRANG_THAI.loi : CHU_TRANG_THAI.trong,
          emptyDescription: loiTai ? "Bấm «Thử lại» để đọc lại." : "Lead quá hạn hay chưa chia được sẽ hiện ở đây.",
        }}
        queueItems={items}
        renderQueueCta={(item) => {
          const dong = hangDoi.find((d) => d.leadId === item.id);
          return dong ? <GiaoLai dong={dong} dauChu={dauChu} tat={!tt.choGiao || dangGiao.has(dong.leadId)} onGiao={(nguoi) => giao(dong, nguoi)} /> : null;
        }}
      />
    </KhungTruongNhom>
  );
}
