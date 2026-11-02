import type { ReactNode, RefObject } from "react";

import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Item, ItemGroup } from "@/components/ui/item";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UsersIcon } from "lucide-react";

import { COL } from "./columns";
import type { ThanhVien } from "./data";
import { UI_ICONS } from "./icons";
import { CAP_BOX, Label, PersonFace } from "./value-faces";

// Phần của chuyển thể solution-users-8: tab «People» của khối thành tab Thành viên. Giữ ô tìm, Section (Frame có đầu và
// FramePanel không lề), danh sách Item có vạch ngăn, nút biểu tượng có gợi ý. Chọn vai một-giá-trị → nút «Sửa» mở hộp
// vai + vùng (một người nhiều vai). Bỏ Section Khách và Lời mời, thanh ghế, nút Xuất CSV. Trống, tìm không ra đi qua
// TrangThai thay Empty trần.

export interface PeopleActions {
  onEdit: (member: ThanhVien) => void;
  onRemove: (member: ThanhVien) => void;
}

export function IconAction({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  // A disabled button fires no pointer events, so it carries no hint.
  if (disabled)
    return (
      <Button type="button" variant="ghost" size="icon-sm" aria-label={label} disabled>
        {icon}
      </Button>
    );
  return (
    <Tooltip>
      <TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label={label} onClick={onClick} />}>
        {icon}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  return (
    <span className="text-muted-foreground flex h-5 items-center text-xs tabular-nums">
      <span className={CAP_BOX}>{children}</span>
    </span>
  );
}

export function Section({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Frame spacing="default">
      <FrameHeader className="flex-row flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-px">
          <FrameTitle>{title}</FrameTitle>
          <FrameDescription>{description}</FrameDescription>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </FrameHeader>
      <FramePanel className="p-0">{children}</FramePanel>
    </Frame>
  );
}

export function Rows({ label, children }: { label: string; children: ReactNode }) {
  return (
    <ItemGroup aria-label={label} className="gap-0">
      {children}
    </ItemGroup>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <Item
      role="listitem"
      size="sm"
      className="not-first:before:bg-border relative gap-x-3 gap-y-3 px-(--frame-panel-px) not-first:before:absolute not-first:before:inset-x-0 not-first:before:top-0 not-first:before:h-px @2xl:gap-x-4"
    >
      {children}
    </Item>
  );
}

export function PeopleTab({
  query,
  onQueryChange,
  members,
  total,
  me,
  lastAdmin,
  roleLabel,
  actions,
  searchRef,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  /** Đã lọc theo ô tìm. */
  members: ThanhVien[];
  /** Số thành viên cả sàn, dù ô tìm đang lọc gì. */
  total: number;
  /** userId của người đang xem — nút bỏ thành «Rời sàn». */
  me: string;
  /** Người mang vai quản trị duy nhất: không bỏ được (sàn cần ít nhất một quản trị). */
  lastAdmin: (member: ThanhVien) => boolean;
  roleLabel: (role: string) => string;
  actions: PeopleActions;
  searchRef: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <InputGroup className="w-full @2xl:w-72">
        <InputGroupAddon align="inline-start">{UI_ICONS.search}</InputGroupAddon>
        <InputGroupInput
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Tìm theo email"
          aria-label="Tìm thành viên"
        />
      </InputGroup>

      <Section title="Thành viên" description={`${total} người trong sàn`}>
        {members.length === 0 ? (
          total === 0 ? (
            <TrangThai kind="empty" icon={UsersIcon} title="Chưa có thành viên" description="Mời người vào sàn để bắt đầu." className="min-h-48" />
          ) : (
            <TrangThai
              kind="empty"
              timKhongRa
              title="Không có thành viên khớp"
              description={`Không email nào khớp «${query.trim()}».`}
              className="min-h-48"
              hanhDong={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onQueryChange("");
                    searchRef.current?.focus();
                  }}
                >
                  <span className={CAP_BOX}>Xoá tìm</span>
                </Button>
              }
            />
          )
        ) : (
          <Rows label="Thành viên">
            {members.map((member) => {
              const locked = lastAdmin(member);
              const self = member.userId === me;
              return (
                <Row key={member.userId}>
                  <div className={COL.person}>
                    <PersonFace
                      email={member.email}
                      detail={member.roles.map((role) => (
                        <Label key={role} variant="secondary">
                          {roleLabel(role)}
                        </Label>
                      ))}
                      addon={
                        <>
                          {self ? <Label variant="info-light">Bạn</Label> : null}
                          {locked ? <Label variant="outline">Quản trị cuối</Label> : null}
                        </>
                      }
                    />
                  </div>
                  <div className={COL.status}>
                    {member.zones.length === 0 ? (
                      <Muted>Chưa giao vùng</Muted>
                    ) : (
                      member.zones.map((zone) => (
                        <Label key={zone.id} variant="outline">
                          {zone.name}
                        </Label>
                      ))
                    )}
                  </div>
                  <div className={COL.control}>
                    <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => actions.onEdit(member)}>
                      {UI_ICONS.edit}
                      <span className={CAP_BOX}>Sửa</span>
                    </Button>
                  </div>
                  <div className={COL.actions}>
                    <IconAction
                      label={self ? "Rời sàn" : `Bỏ ${member.email}`}
                      icon={self ? UI_ICONS.leave : UI_ICONS.remove}
                      disabled={locked}
                      onClick={() => actions.onRemove(member)}
                    />
                  </div>
                </Row>
              );
            })}
          </Rows>
        )}
      </Section>
    </div>
  );
}
