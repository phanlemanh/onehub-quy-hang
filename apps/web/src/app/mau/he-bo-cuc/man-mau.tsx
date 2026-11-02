"use client";

import { InboxIcon, SearchXIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { BoCuc, DauMan, type KieuBoCuc, type TrangThaiTai } from "@/components/bo-cuc";
import { ChiaDoi } from "@/components/khoi/c-resizable-9";
import { MucCaiDatKhoi } from "@/components/khoi/settings-3/muc-cai-dat";
import { SettingField } from "@/components/khoi/settings-3/setting-field";
import { ActivityTimeline } from "@/components/khoi/solution-crm-5/activity-timeline";
import type { CardData } from "@/components/khoi/stats-7/data";
import { Stats } from "@/components/khoi/stats-7/stats";
import { Badge } from "@/components/reui/badge";
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { CAN_MAU, type CanMau } from "./du-lieu-mau";
import type { LoiDauMan, TrangThaiMau } from "./to-hop";

// Màn mẫu của trang mẫu sống — bóc tách theo ADR-0024 và khảo sát ReUI + Verve (02/11): bố cục giữ khung trang, mỗi vùng
// là một khối. Nhãn nguồn của từng ô ở `_acceptance/he-bo-cuc/discovery/boc-tach.md`; ô ghi «ghép, chờ …» là chỗ khối
// ReUI đúng đang chờ quyết (kiểu chặt cho `filters`, `use-file-upload`) — không phải chỗ tự vẽ.

const sangTai = (t: TrangThaiMau): TrangThaiTai => (t === "cho-tai" ? "cho-tai" : t === "loi" ? "loi" : t === "rong" ? "rong" : "san-sang");

const LOI = (
  <TrangThai
    kind="error"
    title="Không tải được danh sách"
    description="Kiểm tra mạng rồi thử lại."
    hanhDong={
      <Button size="sm" variant="outline">
        Thử lại
      </Button>
    }
  />
);

const RONG_LOC = (
  <TrangThai
    kind="empty"
    icon={SearchXIcon}
    title="Không căn nào khớp bộ lọc"
    description="Bỏ bớt điều kiện lọc để thấy thêm căn."
    hanhDong={
      <Button size="sm" variant="outline">
        Bỏ lọc
      </Button>
    }
  />
);

const rongLanDau = (tieuDe: string, moTa: string, viec: string) => (
  <TrangThai kind="empty" icon={InboxIcon} title={tieuDe} description={moTa} hanhDong={<Button size="sm">{viec}</Button>} />
);

// Nhãn trạng thái theo ReUI: trạng thái dùng `<tone>-light` (layout.md «State badge»).
const TONE: Record<string, "success-light" | "warning-light" | "info-light"> = { "Đang bán": "success-light", "Giữ chỗ": "warning-light", "Chờ duyệt": "info-light" };

// Ô số của Bảng điều khiển — dữ liệu chuyển thể vào stats-7.
const SO_DOI: CardData[] = [
  {
    title: "Căn đang bán",
    subtitle: "Toàn sàn",
    value: "128",
    valueColor: "text-success",
    badge: { color: "success-light", icon: <TrendingUpIcon aria-hidden="true" />, text: "+6" },
    subtext: (
      <span className="text-sm font-medium">
        +6 <span className="font-normal text-muted-foreground">so với tuần trước</span>
      </span>
    ),
  },
  {
    title: "Xác nhận trong 14 ngày",
    subtitle: "Độ tươi của bảng",
    value: "82%",
    valueColor: "text-info",
    badge: { color: "info-light", icon: <TrendingUpIcon aria-hidden="true" />, text: "+3%" },
    subtext: (
      <span className="text-sm font-medium">
        105 <span className="font-normal text-muted-foreground">trên 128 căn</span>
      </span>
    ),
  },
  {
    title: "Lead quá hạn",
    subtitle: "Chưa nhận sau 15 phút",
    value: "4",
    valueColor: "text-destructive",
    badge: { color: "destructive-light", icon: <TrendingDownIcon aria-hidden="true" />, text: "−2" },
    subtext: (
      <span className="text-sm font-medium">
        −2 <span className="font-normal text-muted-foreground">so với hôm qua</span>
      </span>
    ),
  },
];

/** Lưới căn trong Frame — ghép, chờ solution-crm-3 (khối Tràn của Verve; cần `filters` qua kiểu chặt). */
function KhungLuoiCan({ tieuDe, dem, nut, chon, onChon }: { tieuDe: string; dem: string; nut?: ReactNode; chon?: string; onChon?: (ma: string) => void }) {
  return (
    <Frame spacing="sm" className="w-full">
      <FrameHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <FrameTitle>{tieuDe}</FrameTitle>
          <FrameDescription>{dem}</FrameDescription>
        </div>
        {nut}
      </FrameHeader>
      <FramePanel className="p-0">
        <div className="max-md:hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã căn</TableHead>
                <TableHead>Toà</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Xác nhận</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CAN_MAU.map((c) => (
                <TableRow key={c.ma} data-state={chon === c.ma ? "selected" : undefined} onClick={() => onChon?.(c.ma)}>
                  <TableCell className="font-medium">{c.ma}</TableCell>
                  <TableCell>{c.toa}</TableCell>
                  <TableCell>{c.gia}</TableCell>
                  <TableCell>
                    <Badge variant={TONE[c.trangThai] ?? "info-light"}>{c.trangThai}</Badge>
                  </TableCell>
                  <TableCell>{c.tuoi}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Điện thoại: Tràn thành thẻ (ADR-0024 §5). */}
        <div className="flex flex-col gap-2 p-3 md:hidden">
          {CAN_MAU.map((c) => (
            <Item key={c.ma} variant="outline" onClick={() => onChon?.(c.ma)}>
              <ItemContent>
                <ItemTitle>
                  {c.ma} · {c.gia}
                </ItemTitle>
                <ItemDescription>
                  {c.toa} · {c.trangThai} · xác nhận {c.tuoi}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </div>
      </FramePanel>
      <FrameFooter className="flex flex-row justify-end text-sm text-muted-foreground">6 / 128 căn</FrameFooter>
    </Frame>
  );
}

/** Dữ kiện của một căn — ghép theo trang hồ sơ của Verve (Frame «Contact details»: nhãn trái, giá trị phải). */
function KhungDuKien({ can, tieuDe = "Thông tin căn" }: { can: CanMau; tieuDe?: string }) {
  return (
    <Frame spacing="sm" className="w-full">
      <FrameHeader>
        <FrameTitle>{tieuDe}</FrameTitle>
      </FrameHeader>
      <FramePanel>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Mã căn</dt>
          <dd className="text-right font-medium">{can.ma}</dd>
          <dt className="text-muted-foreground">Toà</dt>
          <dd className="text-right">{can.toa}</dd>
          <dt className="text-muted-foreground">Giá</dt>
          <dd className="text-right">{can.gia}</dd>
          <dt className="text-muted-foreground">Xác nhận</dt>
          <dd className="text-right">{can.tuoi} trước</dd>
        </dl>
      </FramePanel>
    </Frame>
  );
}

const DUONG: Record<KieuBoCuc, [{ nhan: string; href: string }, { nhan: string }]> = {
  tran: [{ nhan: "Bảng hàng", href: "#" }, { nhan: "Mọi căn" }],
  "danh-sach-chi-tiet": [{ nhan: "Hôm nay", href: "#" }, { nhan: "Lead đã nhập" }],
  doc: [{ nhan: "Cài đặt sàn", href: "#" }, { nhan: "Cách gọi" }],
  "ho-so-hai-cot": [{ nhan: "Bảng hàng", href: "#" }, { nhan: "Căn A-06.01" }],
  "bang-dieu-khien": [{ nhan: "Đội", href: "#" }, { nhan: "Tổng quan" }],
  "luong-nhieu-buoc": [{ nhan: "Bảng hàng", href: "#" }, { nhan: "Nhập Excel" }],
  "dong-tin": [{ nhan: "Đã gửi", href: "#" }, { nhan: "Link đã gửi" }],
};

export function ManMau({ kieu, trangThai, dauMan = "reui" }: { kieu: KieuBoCuc; trangThai: TrangThaiMau; dauMan?: LoiDauMan }) {
  const [chon, setChon] = useState<string | undefined>();
  const chung = { trangThai: sangTai(trangThai), ngoaiTuyen: trangThai === "ngoai-tuyen", loi: LOI };
  const duong = DUONG[kieu];

  switch (kieu) {
    case "tran":
      return (
        <BoCuc kieu="tran" {...chung} rong={RONG_LOC} dauMan={<DauMan duongDan={duong} />}>
          <KhungLuoiCan tieuDe="Bảng hàng" dem="128 căn · 3 toà" nut={<Button size="sm">Lưu góc nhìn</Button>} />
        </BoCuc>
      );
    case "danh-sach-chi-tiet": {
      const can = CAN_MAU.find((c) => c.ma === (chon ?? CAN_MAU[0]?.ma)) ?? CAN_MAU[0];
      return (
        <BoCuc
          kieu="danh-sach-chi-tiet"
          {...chung}
          rong={RONG_LOC}
          chiTietMo={chon !== undefined}
          chiaDoi={(trai, phai) => <ChiaDoi trai={trai} phai={phai} />}
          dauMan={<DauMan duongDan={duong} />}
          cotPhu={can && <KhungDuKien can={can} tieuDe={`Căn ${can.ma}`} />}
        >
          <KhungLuoiCan tieuDe="Lead đã nhập" dem="37 lead · 6 hôm nay" chon={chon} onChon={setChon} />
        </BoCuc>
      );
    }
    case "doc": {
      // Ba lối của đầu màn (Hỏi-3) dựng trên Cài đặt sàn: Trong kho — chỉ đầu khung của khối, không dải; ReUI — dải đường
      // dẫn, tiêu đề trong đầu khung (như danh sách của Verve); Vẽ mới — dải đủ đường dẫn, tiêu đề, nút (như hồ sơ của Verve).
      const dai =
        dauMan === "trong-kho" ? null : dauMan === "reui" ? (
          <DauMan duongDan={duong} />
        ) : (
          <DauMan duongDan={duong} tieuDe="Cách gọi" moTa="Sàn gọi tên trường và giá trị thế nào" nut={[{ nhan: "Lưu" }, { nhan: "Xem trước" }, { nhan: "Nhập từ sàn khác" }, { nhan: "Khôi phục mặc định" }]} />
        );
      return (
        <BoCuc kieu="doc" {...chung} rong={rongLanDau("Chưa có mục cài đặt nào", "Mục sẽ hiện khi quản trị sàn bật.", "Bật mục")} dauMan={dai}>
          <MucCaiDatKhoi
            tieuDe={dauMan === "ve-moi" ? "Tên gọi" : "Cách gọi"}
            moTa={dauMan === "ve-moi" ? "Chữ của căn trên mọi màn." : "Sàn gọi tên trường và giá trị thế nào."}
            chan={
              <>
                <Button variant="outline">Huỷ</Button>
                <Button>Lưu</Button>
              </>
            }
          >
            <SettingField title="Tên gọi của căn" description="Chữ hiện trên Bảng hàng và trang khách." labelFor="mau-ten-can">
              <Input id="mau-ten-can" defaultValue="Căn" />
            </SettingField>
            <SettingField title="Hiện giá bao phí" description="Trang khách ghi rõ giá đã gồm phí.">
              <Switch defaultChecked />
            </SettingField>
            <SettingField title="Đơn vị giá" description="Cách viết giá trên mọi màn." last>
              <ToggleGroup defaultValue={["ty"]}>
                <ToggleGroupItem value="ty">Tỷ</ToggleGroupItem>
                <ToggleGroupItem value="trieu">Triệu</ToggleGroupItem>
              </ToggleGroup>
            </SettingField>
          </MucCaiDatKhoi>
        </BoCuc>
      );
    }
    case "ho-so-hai-cot": {
      const can = CAN_MAU[0];
      return (
        <BoCuc
          kieu="ho-so-hai-cot"
          {...chung}
          rong={rongLanDau("Căn chưa có thông tin", "Đầu chủ điền khi nhận hàng.", "Điền thông tin")}
          dauMan={
            <DauMan
              duongDan={duong}
              tieuDe={`Căn ${can?.ma ?? ""}`}
              moTa="Toà A · 2 phòng ngủ · 68 m²"
              phu={<Badge variant="success-light">Đang bán</Badge>}
              nut={[{ nhan: "Gửi khách" }, { nhan: "Còn · giữ giá" }]}
            />
          }
          cotPhu={can && <KhungDuKien can={can} />}
        >
          <ActivityTimeline />
        </BoCuc>
      );
    }
    case "bang-dieu-khien":
      return (
        <BoCuc
          kieu="bang-dieu-khien"
          {...chung}
          rong={rongLanDau("Đội chưa có số kỳ này", "Số hiện khi đội có hàng và lead.", "Mời người vào đội")}
          dauMan={
            <DauMan
              duongDan={duong}
              tieuDe="Đội"
              moTa="Số của đội theo kỳ"
              phu={
                <ToggleGroup defaultValue={["tuan"]} size="sm">
                  <ToggleGroupItem value="tuan">Tuần</ToggleGroupItem>
                  <ToggleGroupItem value="thang">Tháng</ToggleGroupItem>
                </ToggleGroup>
              }
            />
          }
        >
          <Stats cards={SO_DOI} />
          {/* Ghép, chờ data-grid-grouping-2 (bảng nhóm theo người). */}
          <KhungLuoiCan tieuDe="Căn theo người giữ" dem="6 căn · 3 người" />
        </BoCuc>
      );
    case "luong-nhieu-buoc":
      return (
        <BoCuc
          kieu="luong-nhieu-buoc"
          {...chung}
          rong={rongLanDau("Tệp chưa có dòng nào", "Chọn tệp bảng tính có ít nhất một căn.", "Chọn tệp")}
          dauMan={<DauMan duongDan={duong} tieuDe="Nhập Excel" moTa="Đưa hàng vào từ bảng tính" phu={<Badge variant="outline">Bước 2 / 4 · Ghép cột</Badge>} />}
          cotPhu={
            <Frame spacing="sm" className="w-full">
              <FrameHeader>
                <FrameTitle>Xem trước</FrameTitle>
                <FrameDescription>6 căn vào Bảng hàng, 1 căn trùng.</FrameDescription>
              </FrameHeader>
            </Frame>
          }
        >
          {/* Ghép, chờ solution-crm-6 (stepper + ghép cột; cần `use-file-upload` qua kiểu chặt). */}
          <MucCaiDatKhoi
            tieuDe="Ghép cột"
            moTa="Cột trong tệp ứng với trường của căn."
            chan={
              <>
                <Button variant="outline">Lùi</Button>
                <Button>Tiếp</Button>
              </>
            }
          >
            <SettingField title="Cột «Mã căn»" description="Cột trong tệp ứng với mã căn.">
              <Input defaultValue="Cột A" />
            </SettingField>
            <SettingField title="Cột «Giá»" description="Cột trong tệp ứng với giá chào." last>
              <Input defaultValue="Cột D" />
            </SettingField>
          </MucCaiDatKhoi>
        </BoCuc>
      );
    case "dong-tin":
      return (
        <BoCuc
          kieu="dong-tin"
          {...chung}
          rong={rongLanDau("Chưa có tin nào", "Tin hiện khi khách mở link đã gửi.", "Gửi một căn")}
          dauMan={<DauMan duongDan={duong} tieuDe="Đã gửi" moTa="Khách đang phản ứng ra sao" />}
        >
          <ActivityTimeline />
        </BoCuc>
      );
  }
}
