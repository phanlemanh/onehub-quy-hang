// Phần dựng của Đã gửi theo trạng thái (hàng 36: AC-6) — tách khỏi phần chạy để bài kiểm dựng được bằng renderToStaticMarkup.
import { LinkIcon } from "lucide-react";

import { ChoTai } from "@/components/bo-cuc";
import { TrangThai } from "@/components/trang-thai";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DongCan } from "./chi-tiet";
import type { LanGuiChiTiet, LanGuiTom, TrangThaiTat } from "./da-gui";
import { TheLanGui } from "./the-lan-gui";

export type TrangThaiMan =
  | { kieu: "dang-tai" }
  | { kieu: "loi" }
  | { kieu: "khong-vai" }
  | { kieu: "xong"; ds: LanGuiTom[] };

export const CHU = {
  trong: "Chưa gửi link nào",
  loi: "Chưa tải được — thử lại",
  khongVai: "Đầu khách và trưởng nhóm xem được Đã gửi",
} as const;

export function DanhSachDaGui({
  tt,
  onMo,
  onThuLai,
}: {
  tt: TrangThaiMan;
  onMo?: (id: string) => void;
  onThuLai?: () => void;
}) {
  if (tt.kieu === "dang-tai") return <ChoTai kieu="danh-sach-chi-tiet" />;
  if (tt.kieu === "khong-vai")
    return <TrangThai kind="notice" title={CHU.khongVai} />;
  if (tt.kieu === "loi")
    return (
      <TrangThai
        kind="error"
        title={CHU.loi}
        hanhDong={
          <Button type="button" variant="outline" onClick={onThuLai}>
            Thử lại
          </Button>
        }
      />
    );
  if (!tt.ds.length)
    return (
      <TrangThai
        kind="empty"
        title={CHU.trong}
        hanhDong={
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href="/inventory/cards" />}
          >
            Gửi căn
          </Button>
        }
      />
    );
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3">
      {tt.ds.map((l) => (
        <TheLanGui key={l.id} l={l} onMo={onMo} />
      ))}
    </div>
  );
}

export function ChiTietLanGui({
  l,
  tat,
  onTat,
}: {
  l: LanGuiChiTiet;
  tat: TrangThaiTat;
  onTat?: () => void;
}) {
  const daTat = Boolean(l.disabledAt) || tat === "da-tat";
  return (
    <div className="flex flex-col gap-3">
      {l.listings.map((c) => (
        <DongCan key={c.id} c={c} />
      ))}
      {daTat ? (
        <p className="text-muted-foreground text-sm">
          Đã tắt — khách mở link sẽ thấy «Link không còn mở được»
        </p>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                variant="outline"
                disabled={tat === "dang"}
                data-nut="tat-link"
              />
            }
          >
            <LinkIcon data-icon="inline-start" aria-hidden="true" />
            Tắt link
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tắt link này?</AlertDialogTitle>
              <AlertDialogDescription>
                Khách mở link sẽ không còn thấy bộ căn. Bản đầu không bật lại
                được — muốn gửi lại thì gửi link mới.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Giữ link</AlertDialogCancel>
              <AlertDialogAction onClick={onTat}>Tắt link</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {tat === "loi" ? (
        <TrangThai kind="error" title="Chưa tắt được — thử lại" />
      ) : null}
    </div>
  );
}
