"use client";

// Bốn khối dùng chung của trang ba lối Chế độ cuộc gọi (hàng 28): thẻ lead, danh sách hỏi, tính giá, so giá toà. Dữ liệu
// mẫu, phím và nút chỉ đổi trạng thái cục bộ, không gọi mạng. Gỡ khi màn thật ra.
import { useState, type KeyboardEvent } from "react";

import { Badge } from "@/components/reui/badge";
import { FramePanel } from "@/components/reui/frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { CAN_SO, DA_CO, DAI, KHOAN, LEAD, NHOM } from "./mau";

const TIEU_MUC = "text-xs font-medium uppercase tracking-wide text-muted-foreground";

export function TheLead({ className }: { className?: string }) {
  const [daGoi, setDaGoi] = useState(false);
  return (
    <FramePanel className={cn("flex flex-col gap-3", className)} aria-label="Thẻ lead">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={daGoi ? "primary-light" : "info-light"}>{daGoi ? "Đã gọi" : LEAD.nac}</Badge>
        <span className="text-muted-foreground text-sm">Lead mới · đang khai thác</span>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">
          {LEAD.can} · {LEAD.toa}
        </h2>
        <p className="text-muted-foreground text-sm">{LEAD.thuocTinh}</p>
        <p className="text-muted-foreground text-sm">{LEAD.nhap}</p>
      </div>
      <div className="flex flex-col gap-1">
        <span className={TIEU_MUC}>Chủ nhà muốn</span>
        <span className="text-xl font-semibold">{LEAD.gia}</span>
        <span className="text-sm">{LEAD.nhuCau}</span>
      </div>
      {!daGoi && (
        <Button size="sm" className="self-start" onClick={() => setDaGoi(true)}>
          Đã gọi
        </Button>
      )}
    </FramePanel>
  );
}

export function DanhSachHoi({ className }: { className?: string }) {
  const [chon, setChon] = useState<Record<string, number>>(DA_CO);
  const [dung, setDung] = useState(1);
  const du = NHOM.filter((n) => chon[n.ma] !== undefined).length;
  const thieu = NHOM.filter((n) => chon[n.ma] === undefined).map((n) => n.ten.toLowerCase());

  function phim(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target instanceof HTMLInputElement) return;
    const n = NHOM[dung]!;
    if (e.key === "Tab") {
      e.preventDefault();
      setDung((d) => (d + (e.shiftKey ? NHOM.length - 1 : 1)) % NHOM.length);
    } else if (/^[1-9]$/.test(e.key) && Number(e.key) <= n.luaChon.length) {
      setChon((c) => ({ ...c, [n.ma]: Number(e.key) - 1 }));
    } else if (e.key === "Delete" || e.key === "Backspace") {
      setChon((c) => {
        const con = { ...c };
        delete con[n.ma];
        return con;
      });
    }
  }

  return (
    <FramePanel className={cn("flex flex-col gap-3", className)} aria-label="Danh sách hỏi">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">Danh sách hỏi</h2>
        <span className="text-sm font-medium">Mức đủ {du}/5</span>
      </div>
      <p className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs">
        <Kbd>1</Kbd>–<Kbd>3</Kbd> chọn · <Kbd>Tab</Kbd> nhóm kế · <Kbd>Delete</Kbd> xoá · <Kbd>Ctrl</Kbd>+<Kbd>Enter</Kbd> xong cuộc gọi
      </p>
      <div tabIndex={0} onKeyDown={phim} className="flex flex-col gap-2 outline-none" aria-label="Các nhóm hỏi">
        {NHOM.map((n, i) => (
          <div
            key={n.ma}
            onClick={() => setDung(i)}
            className={cn("flex flex-col gap-2 rounded-lg border p-3", i === dung ? "border-primary bg-primary/5" : "border-border")}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{n.ten}</span>
              <Badge variant={chon[n.ma] !== undefined ? "success-light" : "warning-light"}>{chon[n.ma] !== undefined ? "Đã hỏi" : "Chưa hỏi"}</Badge>
            </div>
            <ToggleGroup
              variant="outline"
              size="sm"
              className="flex-wrap"
              value={chon[n.ma] !== undefined ? [String(chon[n.ma])] : []}
              onValueChange={(v: string[]) => setChon((c) => ({ ...c, [n.ma]: Number(v[v.length - 1] ?? 0) }))}
            >
              {n.luaChon.map((l, k) => (
                <ToggleGroupItem key={l} value={String(k)}>
                  <Kbd>{k + 1}</Kbd> {l}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {n.ma === "price" && (
              <div className="flex flex-wrap items-center gap-2">
                <Input defaultValue="2,75 tỷ" aria-label="Giá chủ báo" className="w-40" />
                <span className="text-muted-foreground text-sm">Hiểu là 2,75 tỷ · bao phí</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-sm">{thieu.length ? `Còn thiếu: ${thieu.join(", ")}` : "Đã đủ năm mục"}</p>
    </FramePanel>
  );
}

export function TinhGia({ className }: { className?: string }) {
  return (
    <FramePanel className={cn("flex flex-col gap-3", className)} aria-label="Tính giá">
      <h2 className="text-base font-semibold">Tính giá</h2>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Giá chủ báo · bao phí
          <Input defaultValue="2,75 tỷ" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Môi giới %
          <Input defaultValue="1" inputMode="decimal" />
        </label>
      </div>
      <ul className="flex flex-col gap-1 text-sm">
        {KHOAN.map((k) => (
          <li key={k.ten} className="flex justify-between gap-2">
            <span className="text-muted-foreground">{k.ten}</span>
            <span>{k.so}</span>
          </li>
        ))}
      </ul>
      <label className="flex flex-col gap-1 text-sm">
        Chủ nhận về tay
        <Input defaultValue="2,65375 tỷ" />
      </label>
      <p className="text-muted-foreground text-xs">Tỉ lệ mặc định của sàn</p>
    </FramePanel>
  );
}

export function SoGia({ className }: { className?: string }) {
  return (
    <FramePanel className={cn("flex flex-col gap-3", className)} aria-label="Cùng loại trong toà">
      <h2 className="text-base font-semibold">Cùng loại trong toà · 1PN+1</h2>
      <div className="flex flex-col gap-1">
        <Progress value={DAI.viTri} aria-label="Vị trí căn này trên dải về tay của toà" />
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>{DAI.thap}</span>
          <span>giữa {DAI.giua}</span>
          <span>{DAI.cao} tỷ</span>
        </div>
        <p className="text-sm">
          Căn này về tay {DAI.canNay} tỷ · {DAI.lech}
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Phí</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Xác nhận</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {CAN_SO.map((c) => (
            <TableRow key={c.ma}>
              <TableCell>{c.ma}</TableCell>
              <TableCell>{c.gia}</TableCell>
              <TableCell>{c.phi}</TableCell>
              <TableCell>
                <Badge variant={c.trangThai === "Đang bán" ? "success-light" : "warning-light"}>{c.trangThai}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{c.xacNhan}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-muted-foreground text-xs">Dải tính trên giá về tay. BP = bao phí · N = không bao phí.</p>
    </FramePanel>
  );
}
