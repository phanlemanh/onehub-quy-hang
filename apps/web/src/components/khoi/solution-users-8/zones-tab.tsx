import type { FormEvent } from "react";
import { MapPinIcon } from "lucide-react";

import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import type { ThanhVien, Vung } from "./data";
import { UI_ICONS } from "./icons";
import { Muted, Row, Rows, Section } from "./people-tab";
import { CAP_BOX, CAP_TRUNCATE } from "./value-faces";

// Phần của chuyển thể solution-users-8: tab «Alerts» (ma trận kênh × cảnh báo) của khối nhường chỗ cho tab Vùng — Quỹ
// hàng giao vùng phụ trách cho thành viên, không có cảnh báo truy cập. Giữ Section và dòng của tab Thành viên; ô thêm
// vùng ngồi ở hàng hành động của đầu khung. Trống đi qua TrangThai.
export function ZonesTab({
  zones,
  members,
  name,
  onNameChange,
  error,
  onSubmit,
}: {
  zones: Vung[];
  members: ThanhVien[];
  name: string;
  onNameChange: (name: string) => void;
  /** Lỗi gắn ô tên vùng (tên trùng…). */
  error: string;
  onSubmit: (event: FormEvent) => void;
}) {
  const soNguoi = (zone: Vung) => members.filter((member) => member.zones.some((z) => z.id === zone.id)).length;
  return (
    <Section
      title="Vùng"
      description={`${zones.length} vùng phụ trách`}
      actions={
        <form className="flex items-start gap-2" onSubmit={onSubmit}>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="ten-khu" className="sr-only">
              Tên vùng
            </FieldLabel>
            <Input id="ten-khu" required placeholder="Tên vùng" value={name} onChange={(e) => onNameChange(e.target.value)} />
            {error && <FieldError role="alert">{error}</FieldError>}
          </Field>
          <Button type="submit" variant="outline">
            {UI_ICONS.add}
            <span className={CAP_BOX}>Thêm vùng</span>
          </Button>
        </form>
      }
    >
      {zones.length === 0 ? (
        <TrangThai
          kind="empty"
          icon={MapPinIcon}
          title="Chưa có vùng"
          description="Thêm vùng để giao phụ trách cho thành viên."
          className="min-h-48"
        />
      ) : (
        <Rows label="Vùng">
          {zones.map((zone) => (
            <Row key={zone.id}>
              <div className="flex min-w-0 flex-1 items-center gap-3 text-sm font-medium">
                <span className="text-muted-foreground [&_svg]:size-4">{UI_ICONS.zones}</span>
                <span className={CAP_TRUNCATE}>{zone.name}</span>
              </div>
              <Muted>{`${soNguoi(zone)} người phụ trách`}</Muted>
            </Row>
          ))}
        </Rows>
      )}
    </Section>
  );
}
