"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { API_ERRORS, type ApiErrorCode } from "@quy-hang/api/errors";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TrangThai } from "@/components/trang-thai";
import { nhanVai, VAI } from "@/lib/vai";

export type Khu = { id: string; name: string };
export type ThanhVien = { userId: string; email: string; roles: string[]; zones: Khu[] };

// Mã lỗi của API chỉ là khoá tra câu báo — không bao giờ hiện ra chữ.
const CHU: Partial<Record<ApiErrorCode, string>> = {
  [API_ERRORS.alreadyMember.code]: "Email này đã là thành viên của sàn.",
  [API_ERRORS.lastAdmin.code]: "Sàn cần ít nhất một quản trị.",
  [API_ERRORS.roleRequired.code]: "Chọn ít nhất một vai.",
  [API_ERRORS.zoneNameTaken.code]: "Tên khu này đã có.",
};
const goi = (method: string, path: string, body?: unknown) =>
  fetch(`/api/v1/company${path}`, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
const loiCua = async (res: Response) => {
  const ma = ((await res.json().catch(() => ({}))) as { error?: ApiErrorCode }).error;
  return (ma && CHU[ma]) || "Có lỗi, thử lại.";
};

/** Chọn nhiều bằng Checkbox — dùng cho vai và khu. */
function ChonNhieu({ ten, cac, chon, doi }: { ten: string; cac: { ma: string; nhan: string }[]; chon: string[]; doi: (x: string[]) => void }) {
  return (
    <fieldset className="flex flex-wrap gap-x-4 gap-y-2">
      <legend className="mb-1 text-sm font-medium">{ten}</legend>
      {cac.map((c) => (
        <label key={c.ma} className="flex items-center gap-2 text-sm">
          <Checkbox
            aria-label={c.nhan}
            checked={chon.includes(c.ma)}
            onCheckedChange={(v) => doi(v ? [...chon, c.ma] : chon.filter((x) => x !== c.ma))}
          />
          {c.nhan}
        </label>
      ))}
    </fieldset>
  );
}

export function QuanNguoi({ thanhVien, khu, toi }: { thanhVien: ThanhVien[]; khu: Khu[]; toi: string }) {
  const router = useRouter();
  const lamMoi = () => router.refresh();
  const cacKhu = khu.map((k) => ({ ma: k.id, nhan: k.name }));

  const [moiMo, setMoiMo] = useState(false);
  const [email, setEmail] = useState("");
  const [vai, setVai] = useState<string[]>([]);
  const [khuChon, setKhuChon] = useState<string[]>([]);
  const [loiMoi, setLoiMoi] = useState("");

  const [sua, setSua] = useState<ThanhVien | null>(null);
  const [suaVai, setSuaVai] = useState<string[]>([]);
  const [suaKhu, setSuaKhu] = useState<string[]>([]);
  const [loiSua, setLoiSua] = useState("");

  const [bo, setBo] = useState<ThanhVien | null>(null);
  const [loiBo, setLoiBo] = useState("");

  const [tenKhu, setTenKhu] = useState("");
  const [loiKhu, setLoiKhu] = useState("");

  async function moi(e: FormEvent) {
    e.preventDefault();
    setLoiMoi("");
    const res = await goi("POST", "/members", { email: email.trim(), roles: vai, zoneIds: khuChon });
    if (!res.ok) return setLoiMoi(await loiCua(res));
    setEmail("");
    setVai([]);
    setKhuChon([]);
    setMoiMo(false);
    lamMoi();
  }
  async function luu(e: FormEvent) {
    e.preventDefault();
    if (!sua) return;
    setLoiSua("");
    const res = await goi("PATCH", `/members/${sua.userId}`, { roles: suaVai, zoneIds: suaKhu });
    if (!res.ok) return setLoiSua(await loiCua(res));
    setSua(null);
    lamMoi();
  }
  async function xacNhanBo() {
    if (!bo) return;
    const res = await goi("DELETE", `/members/${bo.userId}`);
    if (!res.ok) return setLoiBo(await loiCua(res));
    setBo(null);
    lamMoi();
  }
  async function themKhu(e: FormEvent) {
    e.preventDefault();
    setLoiKhu("");
    const res = await goi("POST", "/zones", { name: tenKhu.trim() });
    if (!res.ok) return setLoiKhu(await loiCua(res));
    setTenKhu("");
    lamMoi();
  }

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium">Thành viên</h2>
          <Button onClick={() => setMoiMo(true)}>Mời người</Button>
        </div>
        {moiMo && (
          <form className="flex flex-col gap-3 rounded-lg border p-3" onSubmit={moi}>
            <Field data-invalid={loiMoi ? true : undefined}>
              <FieldLabel htmlFor="moi-email">Email</FieldLabel>
              <Input id="moi-email" type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
              {loiMoi && <FieldError role="alert">{loiMoi}</FieldError>}
            </Field>
            <ChonNhieu ten="Vai" cac={VAI} chon={vai} doi={setVai} />
            {cacKhu.length > 0 ? (
              <ChonNhieu ten="Vùng phụ trách" cac={cacKhu} chon={khuChon} doi={setKhuChon} />
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có khu — thêm khu ở dưới.</p>
            )}
            <div className="flex gap-2">
              <Button type="submit">Mời</Button>
              <Button type="button" variant="outline" onClick={() => setMoiMo(false)}>
                Huỷ
              </Button>
            </div>
          </form>
        )}
        <ItemGroup className="gap-2">
          {thanhVien.map((m) => (
            <Item key={m.userId} variant="outline">
              <ItemContent>
                <ItemTitle>{m.email}</ItemTitle>
                <ItemDescription className="flex flex-wrap gap-1">
                  {m.roles.map((r) => (
                    <Badge key={r} variant="secondary">
                      {nhanVai(r)}
                    </Badge>
                  ))}
                  {m.zones.map((z) => (
                    <Badge key={z.id} variant="outline">
                      {z.name}
                    </Badge>
                  ))}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSua(m);
                    setSuaVai(m.roles);
                    setSuaKhu(m.zones.map((z) => z.id));
                    setLoiSua("");
                  }}
                >
                  Sửa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBo(m);
                    setLoiBo("");
                  }}
                >
                  {m.userId === toi ? "Rời sàn" : "Bỏ"}
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
        {sua && (
          <form className="flex flex-col gap-3 rounded-lg border p-3" onSubmit={luu}>
            <p className="text-sm font-medium">Sửa {sua.email}</p>
            <ChonNhieu ten="Vai" cac={VAI} chon={suaVai} doi={setSuaVai} />
            {cacKhu.length > 0 && <ChonNhieu ten="Vùng phụ trách" cac={cacKhu} chon={suaKhu} doi={setSuaKhu} />}
            {loiSua && (
              <TrangThai kind="error" title={loiSua} />
            )}
            <div className="flex gap-2">
              <Button type="submit">Lưu</Button>
              <Button type="button" variant="outline" onClick={() => setSua(null)}>
                Huỷ
              </Button>
            </div>
          </form>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Khu</h2>
        <div className="flex flex-wrap gap-1">
          {khu.map((k) => (
            <Badge key={k.id} variant="outline">
              {k.name}
            </Badge>
          ))}
        </div>
        <form className="flex items-end gap-2" onSubmit={themKhu}>
          <Field data-invalid={loiKhu ? true : undefined}>
            <FieldLabel htmlFor="ten-khu">Tên khu</FieldLabel>
            <Input id="ten-khu" required value={tenKhu} onChange={(e) => setTenKhu(e.target.value)} />
            {loiKhu && <FieldError role="alert">{loiKhu}</FieldError>}
          </Field>
          <Button type="submit" variant="outline">
            Thêm khu
          </Button>
        </form>
      </section>

      <AlertDialog open={bo !== null} onOpenChange={(o) => !o && setBo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bỏ {bo?.email} khỏi sàn?</AlertDialogTitle>
            <AlertDialogDescription>Người này không vào được sàn nữa; vùng phụ trách của họ ở sàn mất theo.</AlertDialogDescription>
          </AlertDialogHeader>
          {loiBo && (
            <TrangThai kind="error" title={loiBo} />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void xacNhanBo()}>
              Bỏ khỏi sàn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
