"use client";

import { ArrowLeftIcon, FilterIcon, InboxIcon, SearchXIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { BoCuc, DauMan, type KieuBoCuc, NganNoi, type TrangThaiTai } from "@/components/bo-cuc";
import { Badge } from "@/components/reui/badge";
import { FrameDescription, FrameHeader, FrameTitle } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { CAN_MAU, type CanMau, SO_MAU, TIN_MAU } from "./du-lieu-mau";
import type { LoiDauMan, TrangThaiMau } from "./to-hop";

// Màn mẫu của trang mẫu sống: mỗi bố cục điền vùng bằng dữ liệu mẫu, đúng như màn thật sẽ làm — qua BoCuc, không tự chia.

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

// Nhãn trạng thái theo ReUI: trạng thái dùng `<tone>-light`, không dùng `secondary` (layout.md «State badge»).
const TONE: Record<string, "success-light" | "warning-light" | "info-light"> = { "Đang bán": "success-light", "Giữ chỗ": "warning-light", "Chờ duyệt": "info-light" };

function Chip({ children }: { children: ReactNode }) {
  return (
    <Button variant="outline" size="sm">
      {children}
    </Button>
  );
}

function BangCan({ chon, onChon }: { chon?: string; onChon?: (ma: string) => void }) {
  return (
    <>
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
      <div className="flex flex-col gap-2 md:hidden">
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
    </>
  );
}

function HoSo({ can, onVe }: { can: CanMau; onVe?: () => void }) {
  return (
    <div className="flex flex-col gap-khung">
      {onVe && (
        <Button variant="ghost" size="sm" className="self-start md:hidden" onClick={onVe}>
          <ArrowLeftIcon aria-hidden="true" />
          Danh sách
        </Button>
      )}
      <div className="flex items-center gap-2">
        <span className="font-medium">{can.ma}</span>
        <Badge variant={TONE[can.trangThai] ?? "info-light"}>{can.trangThai}</Badge>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-muted-foreground">Toà</dt>
        <dd>{can.toa}</dd>
        <dt className="text-muted-foreground">Giá</dt>
        <dd>{can.gia}</dd>
        <dt className="text-muted-foreground">Xác nhận</dt>
        <dd>{can.tuoi} trước</dd>
      </dl>
    </div>
  );
}

function DongCaiDat({ nhan, moTa, children }: { nhan: string; moTa: string; children: ReactNode }) {
  return (
    <Field orientation="responsive">
      <FieldContent>
        <FieldLabel>{nhan}</FieldLabel>
        <FieldDescription>{moTa}</FieldDescription>
      </FieldContent>
      {children}
    </Field>
  );
}

function DongTin() {
  return (
    <div className="flex flex-col gap-2">
      {TIN_MAU.map((t, i) => (
        <Item key={i} variant="outline">
          <ItemContent>
            <ItemTitle>
              {t.ai} {t.viec}
            </ItemTitle>
            <ItemDescription>{t.luc}</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  );
}

export function ManMau({ kieu, trangThai, dauMan = "reui" }: { kieu: KieuBoCuc; trangThai: TrangThaiMau; dauMan?: LoiDauMan }) {
  const tai = sangTai(trangThai);
  const ngoaiTuyen = trangThai === "ngoai-tuyen";
  const [chon, setChon] = useState<string | undefined>();
  const [nganMo, setNganMo] = useState(false);
  const rongDanhSach = (
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
  const chung = { trangThai: tai, ngoaiTuyen, loi: LOI };

  switch (kieu) {
    case "tran":
      return (
        <BoCuc
          kieu="tran"
          {...chung}
          rong={rongDanhSach}
          dauMan={<DauMan tieuDe="Bảng hàng" moTa="Căn đang chào bán của sàn" duongDan={[{ nhan: "Bảng hàng", href: "#" }, { nhan: "Mọi căn" }]} nut={[{ nhan: "Lưu góc nhìn" }]} />}
          thanhCongCu={
            <>
              <Chip>Toà A</Chip>
              <Chip>Đang bán</Chip>
              <Chip>Giá ≤ 5 tỷ</Chip>
            </>
          }
          chan={<span className="text-sm text-muted-foreground">6 / 128 căn</span>}
        >
          <BangCan />
        </BoCuc>
      );
    case "danh-sach-chi-tiet": {
      const can = CAN_MAU.find((c) => c.ma === (chon ?? CAN_MAU[0]?.ma)) ?? CAN_MAU[0];
      return (
        <>
          <BoCuc
            kieu="danh-sach-chi-tiet"
            {...chung}
            rong={rongDanhSach}
            chiTietMo={chon !== undefined}
            dauMan={<DauMan tieuDe="Lead đã nhập" moTa="Lead của tôi, mới nhất trước" duongDan={[{ nhan: "Hôm nay", href: "#" }, { nhan: "Lead đã nhập" }]} nut={[{ nhan: "Lọc thêm", onClick: () => setNganMo(true), icon: <FilterIcon aria-hidden="true" /> }]} />}
            thanhCongCu={
              <>
                <Chip>Hôm nay</Chip>
                <Chip>Chưa gọi</Chip>
              </>
            }
            cotPhu={can && <HoSo can={can} onVe={() => setChon(undefined)} />}
            chan={<span className="text-sm text-muted-foreground">6 / 37 lead</span>}
          >
            <BangCan chon={chon} onChon={setChon} />
          </BoCuc>
          <NganNoi mo={nganMo} onMo={setNganMo} tieuDe="Lọc thêm" moTa="Ngăn nổi: bên phải ở máy tính, từ đáy ở điện thoại.">
            <DongCaiDat nhan="Chỉ lead chưa gọi" moTa="Ẩn lead đã gọi lần đầu.">
              <Switch defaultChecked />
            </DongCaiDat>
          </NganNoi>
        </>
      );
    }
    case "doc": {
      // Ba lối của đầu màn (Hỏi-3): ReUI ghép trong FrameHeader · Trong kho như các màn hôm nay (tiêu đề và nút rời,
      // không đường dẫn) · Vẽ mới là dải tách khỏi Frame, nằm trên nền.
      const NUT = [{ nhan: "Lưu" }, { nhan: "Xem trước" }, { nhan: "Nhập từ sàn khác" }, { nhan: "Khôi phục mặc định" }];
      const dauReui = (
        <DauMan tieuDe="Cách gọi" moTa="Sàn gọi tên trường và giá trị thế nào" duongDan={[{ nhan: "Cài đặt sàn", href: "#" }, { nhan: "Cách gọi" }]} nut={NUT} />
      );
      const dauTrongKho = (
        <FrameHeader className="flex flex-row items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <FrameTitle>Cách gọi</FrameTitle>
            <FrameDescription>Sàn gọi tên trường và giá trị thế nào</FrameDescription>
          </div>
          <div className="flex gap-2">
            {NUT.map((n, i) => (
              <Button key={n.nhan} size="sm" variant={i === 0 ? "default" : "outline"}>
                {n.nhan}
              </Button>
            ))}
          </div>
        </FrameHeader>
      );
      const thanDoc = (
        <BoCuc
          kieu="doc"
          {...chung}
          rong={<TrangThai kind="empty" icon={InboxIcon} title="Chưa có mục cài đặt nào" description="Mục sẽ hiện khi quản trị sàn bật." />}
          dauMan={dauMan === "trong-kho" ? dauTrongKho : dauMan === "reui" ? dauReui : null}
          chan={
            <>
              <Button variant="outline" size="sm">
                Huỷ
              </Button>
              <Button size="sm">Lưu</Button>
            </>
          }
        >
          <FieldGroup>
          <DongCaiDat nhan="Tên gọi của căn" moTa="Chữ hiện trên Bảng hàng và trang khách.">
            <Input defaultValue="Căn" />
          </DongCaiDat>
          <DongCaiDat nhan="Hiện giá bao phí" moTa="Trang khách ghi rõ giá đã gồm phí.">
            <Switch defaultChecked />
          </DongCaiDat>
          <DongCaiDat nhan="Đơn vị giá" moTa="Cách viết giá trên mọi màn.">
            <ToggleGroup defaultValue={["ty"]}>
              <ToggleGroupItem value="ty">Tỷ</ToggleGroupItem>
              <ToggleGroupItem value="trieu">Triệu</ToggleGroupItem>
            </ToggleGroup>
          </DongCaiDat>
          </FieldGroup>
        </BoCuc>
      );
      if (dauMan !== "ve-moi") return thanDoc;
      return (
        <div className="flex flex-1 flex-col">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b bg-background px-trang py-trang">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Cài đặt sàn / Cách gọi</span>
              <h1 className="text-xl font-semibold">Cách gọi</h1>
              <p className="text-sm text-muted-foreground">Sàn gọi tên trường và giá trị thế nào</p>
            </div>
            <Button size="sm">Lưu</Button>
          </div>
          {thanDoc}
        </div>
      );
    }
    case "ho-so-hai-cot": {
      const can = CAN_MAU[0];
      return (
        <BoCuc
          kieu="ho-so-hai-cot"
          {...chung}
          rong={<TrangThai kind="empty" icon={InboxIcon} title="Căn chưa có thông tin" description="Đầu chủ điền khi nhận hàng." />}
          dauMan={
            <DauMan
              tieuDe={`Căn ${can?.ma ?? ""}`}
              moTa="Toà A · 2 phòng ngủ · 68 m²"
              duongDan={[{ nhan: "Bảng hàng", href: "#" }, { nhan: `Căn ${can?.ma ?? ""}` }]}
              phu={<Badge variant="success-light">Đang bán</Badge>}
              nut={[{ nhan: "Gửi khách" }, { nhan: "Còn · giữ giá" }]}
            />
          }
          cotPhu={<DongTin />}
        >
          {can && <HoSo can={can} />}
          <p className="text-sm text-muted-foreground">Ghi chú nội bộ, ảnh, pháp lý — mục của hồ sơ đi vào thân.</p>
        </BoCuc>
      );
    }
    case "bang-dieu-khien":
      return (
        <BoCuc
          kieu="bang-dieu-khien"
          {...chung}
          rong={<TrangThai kind="empty" icon={InboxIcon} title="Đội chưa có số kỳ này" description="Số hiện khi đội có hàng và lead." />}
          dauMan={
            <DauMan
              tieuDe="Đội"
              moTa="Số của đội theo kỳ"
              duongDan={[{ nhan: "Đội", href: "#" }, { nhan: "Tổng quan" }]}
              phu={
                <ToggleGroup defaultValue={["tuan"]} size="sm">
                  <ToggleGroupItem value="tuan">Tuần</ToggleGroupItem>
                  <ToggleGroupItem value="thang">Tháng</ToggleGroupItem>
                </ToggleGroup>
              }
            />
          }
        >
          <div className="grid gap-khung md:grid-cols-4">
            {SO_MAU.map((s) => (
              <Item key={s.nhan} variant="outline">
                <ItemContent>
                  <ItemDescription>{s.nhan}</ItemDescription>
                  <ItemTitle className="text-2xl">{s.so}</ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </div>
          <BangCan />
        </BoCuc>
      );
    case "luong-nhieu-buoc":
      return (
        <BoCuc
          kieu="luong-nhieu-buoc"
          {...chung}
          rong={<TrangThai kind="empty" icon={InboxIcon} title="Tệp chưa có dòng nào" description="Chọn tệp bảng tính có ít nhất một căn." />}
          dauMan={<DauMan tieuDe="Nhập Excel" moTa="Đưa hàng vào từ bảng tính" duongDan={[{ nhan: "Bảng hàng", href: "#" }, { nhan: "Nhập Excel" }]} phu={<Badge variant="outline">Bước 2 / 4 · Ghép cột</Badge>} />}
          cotPhu={
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Xem trước</span>
              <span className="text-muted-foreground">6 căn sẽ vào Bảng hàng, 1 căn trùng.</span>
            </div>
          }
          chan={
            <>
              <Button variant="outline" size="sm">
                Lùi
              </Button>
              <Button size="sm">Tiếp</Button>
            </>
          }
        >
          <FieldGroup>
          <DongCaiDat nhan="Cột «Mã căn»" moTa="Cột trong tệp ứng với mã căn.">
            <Input defaultValue="Cột A" />
          </DongCaiDat>
          <DongCaiDat nhan="Cột «Giá»" moTa="Cột trong tệp ứng với giá chào.">
            <Input defaultValue="Cột D" />
          </DongCaiDat>
          </FieldGroup>
        </BoCuc>
      );
    case "dong-tin":
      return (
        <BoCuc
          kieu="dong-tin"
          {...chung}
          rong={<TrangThai kind="empty" icon={InboxIcon} title="Chưa có tin nào" description="Tin hiện khi khách mở link đã gửi." />}
          dauMan={<DauMan tieuDe="Đã gửi" moTa="Khách đang phản ứng ra sao" duongDan={[{ nhan: "Đã gửi", href: "#" }, { nhan: "Link đã gửi" }]} />}
          thanhCongCu={
            <>
              <Chip>Mở link</Chip>
              <Chip>Hẹn xem</Chip>
            </>
          }
        >
          <DongTin />
        </BoCuc>
      );
  }
}
