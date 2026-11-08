"use client";

import { useId, type FormEvent, type ReactNode, type RefObject } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { UI_ICONS } from "./icons";
import { CAP_BOX } from "./value-faces";

// Phần của chuyển thể solution-users-8: hộp «Invite People» của khối, dùng cho cả mời người và sửa một thành viên. Giữ
// Dialog sm:max-w-lg, đầu hộp, form `contents`, FieldGroup và chân Huỷ · Gửi. Ô nhiều email → một email (API mời từng
// người); chọn loại Member/Guest bỏ (không có khách); chọn một vai → các ô tích nhiều vai và nhiều vùng; bỏ đếm ghế, hạn
// lời mời. Lỗi của cả thao tác vào khe `error` (TrangThai do màn dựng); lỗi gắn ô email dùng FieldError.

export type Choice = { ma: string; nhan: string };

/** Chọn nhiều bằng Checkbox — vai và vùng. */
export function ChoiceChecks({
  legend,
  choices,
  value,
  onChange,
  empty,
  description,
}: {
  legend: string;
  choices: Choice[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Câu hiện khi chưa có lựa chọn nào (sàn chưa có vùng). */
  empty?: string;
  /** Câu giải thích dưới nhóm ô. */
  description?: string;
}) {
  const id = useId();
  return (
    <FieldSet>
      <FieldLegend variant="label">{legend}</FieldLegend>
      {choices.length === 0 && empty ? (
        <FieldDescription>{empty}</FieldDescription>
      ) : (
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {choices.map((choice) => (
            <Field key={choice.ma} orientation="horizontal" className="w-auto">
              <Checkbox
                id={`${id}-${choice.ma}`}
                aria-label={choice.nhan}
                checked={value.includes(choice.ma)}
                onCheckedChange={(on) => onChange(on ? [...value, choice.ma] : value.filter((x) => x !== choice.ma))}
              />
              <FieldLabel htmlFor={`${id}-${choice.ma}`} className="font-normal">
                {choice.nhan}
              </FieldLabel>
            </Field>
          ))}
        </div>
      )}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </FieldSet>
  );
}

export function MemberDialog({
  open,
  onOpenChange,
  returnFocus,
  title,
  description,
  submitLabel,
  email,
  roles,
  zones,
  error,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where focus lands when the dialog closes. */
  returnFocus?: RefObject<HTMLElement | null>;
  title: string;
  description: string;
  submitLabel: string;
  /** Có khi mời: ô email và lỗi gắn ô. */
  email?: { value: string; onChange: (value: string) => void; error: string };
  roles: { choices: Choice[]; value: string[]; onChange: (value: string[]) => void; description?: string };
  zones: { choices: Choice[]; value: string[]; onChange: (value: string[]) => void };
  error?: ReactNode;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" finalFocus={returnFocus}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form className="contents" onSubmit={onSubmit}>
          <FieldGroup>
            {email ? (
              <Field data-invalid={email.error ? true : undefined}>
                <FieldLabel htmlFor="moi-email">Email</FieldLabel>
                <Input
                  id="moi-email"
                  type="email"
                  required
                  autoFocus
                  value={email.value}
                  onChange={(event) => email.onChange(event.target.value)}
                  aria-invalid={email.error ? true : undefined}
                />
                {email.error ? (
                  <FieldError role="alert">{email.error}</FieldError>
                ) : (
                  <FieldDescription>Người được mời vào sàn ngay, không chờ nhận lời.</FieldDescription>
                )}
              </Field>
            ) : null}
            <ChoiceChecks
              legend="Vai"
              choices={roles.choices}
              value={roles.value}
              onChange={roles.onChange}
              description={roles.description}
            />
            <ChoiceChecks
              legend="Vùng phụ trách"
              choices={zones.choices}
              value={zones.value}
              onChange={zones.onChange}
              empty="Chưa có vùng — thêm ở tab Vùng."
            />
            {error}
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <span className={CAP_BOX}>Huỷ</span>
            </Button>
            <Button type="submit">
              {email ? UI_ICONS.send : null}
              <span className={CAP_BOX}>{submitLabel}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
