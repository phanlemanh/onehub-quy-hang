"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { API_ERRORS, type ApiErrorCode } from "@quy-hang/api/errors";

import { khop, VAI_QUAN_TRI, type ThanhVien, type Vung } from "@/components/khoi/solution-users-8/data";
import { MemberDialog } from "@/components/khoi/solution-users-8/member-dialog";
import { PeopleTab } from "@/components/khoi/solution-users-8/people-tab";
import { ConfirmDialog, TeamAccess, type Tab } from "@/components/khoi/solution-users-8/team-access";
import { ZonesTab } from "@/components/khoi/solution-users-8/zones-tab";
import { TrangThai } from "@/components/trang-thai";
import { HopMatKhauTam, type KetQuaCap } from "./hop-mat-khau-tam";
import { nhanVai, VAI } from "@/lib/vai";

export type Khu = Vung;
export type { ThanhVien };

// Dữ liệu và lệnh gọi API của Người dùng; giao diện là khối đã chuyển thể ở `components/khoi/solution-users-8/`.
// Mã lỗi của API chỉ là khoá tra câu báo — không bao giờ hiện ra chữ.
const CHU: Partial<Record<ApiErrorCode, string>> = {
  [API_ERRORS.alreadyMember.code]: "Email này đã là thành viên của sàn.",
  [API_ERRORS.lastAdmin.code]: "Sàn cần ít nhất một quản trị.",
  [API_ERRORS.roleRequired.code]: "Chọn ít nhất một vai.",
  [API_ERRORS.zoneNameTaken.code]: "Tên vùng này đã có.",
};
const goi = (method: string, path: string, body?: unknown) =>
  fetch(`/api/v1/company${path}`, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
const loiCua = async (res: Response) => {
  const ma = ((await res.json().catch(() => ({}))) as { error?: ApiErrorCode }).error;
  return (ma && CHU[ma]) || "Có lỗi, thử lại.";
};

export function QuanNguoi({ thanhVien, khu, toi }: { thanhVien: ThanhVien[]; khu: Khu[]; toi: string }) {
  const router = useRouter();
  const lamMoi = () => router.refresh();
  const cacKhu = khu.map((k) => ({ ma: k.id, nhan: k.name }));
  const soQuanTri = thanhVien.filter((m) => m.roles.includes(VAI_QUAN_TRI)).length;

  const [tab, setTab] = useState<Tab>("members");
  const [tim, setTim] = useState("");
  const timRef = useRef<HTMLInputElement | null>(null);
  // Hộp mở bằng trạng thái không có nút kích, nên trả tiêu điểm về chỗ vừa bấm.
  const moTu = useRef<HTMLElement | null>(null);
  const nho = () => {
    const a = document.activeElement;
    moTu.current = a instanceof HTMLElement ? a : null;
  };

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

  const [cap, setCap] = useState<ThanhVien | null>(null);
  const [loiCap, setLoiCap] = useState<{ kind: "error" | "notice"; title: string } | null>(null);
  const [ketQuaCap, setKetQuaCap] = useState<KetQuaCap | null>(null);

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
  // Cấp mật khẩu tạm (dang-nhap-mat-khau): hỏi trước, rồi hiện mật khẩu một lần. Người còn ở sàn khác tự đặt trong Cá nhân.
  async function xacNhanCap() {
    if (!cap) return;
    const res = await goi("POST", `/members/${cap.userId}/temp-password`);
    if (res.status === 409) return setLoiCap({ kind: "notice", title: `${cap.email} còn ở sàn khác nên tự đặt mật khẩu trong Cá nhân.` });
    if (!res.ok) return setLoiCap({ kind: "error", title: await loiCua(res) });
    const { tempPassword } = (await res.json()) as { tempPassword: string };
    setKetQuaCap({ email: cap.email, tempPassword });
    setCap(null);
  }
  async function themKhu(e: FormEvent) {
    e.preventDefault();
    setLoiKhu("");
    const res = await goi("POST", "/zones", { name: tenKhu.trim() });
    if (!res.ok) return setLoiKhu(await loiCua(res));
    setTenKhu("");
    lamMoi();
  }

  const q = tim.trim().toLowerCase();
  const tuToi = bo?.userId === toi;

  return (
    <TeamAccess
      tab={tab}
      onTabChange={setTab}
      memberCount={thanhVien.length}
      zoneCount={khu.length}
      onInvite={() => {
        nho();
        setLoiMoi("");
        setMoiMo(true);
      }}
      members={
        <PeopleTab
          searchRef={timRef}
          query={tim}
          onQueryChange={setTim}
          members={thanhVien.filter((m) => khop(q, m.email))}
          total={thanhVien.length}
          me={toi}
          lastAdmin={(m) => soQuanTri === 1 && m.roles.includes(VAI_QUAN_TRI)}
          roleLabel={nhanVai}
          actions={{
            onEdit: (m) => {
              nho();
              setSua(m);
              setSuaVai(m.roles);
              setSuaKhu(m.zones.map((z) => z.id));
              setLoiSua("");
            },
            onRemove: (m) => {
              setBo(m);
              setLoiBo("");
            },
            onIssuePassword: (m) => {
              setCap(m);
              setLoiCap(null);
            },
          }}
        />
      }
      zones={<ZonesTab zones={khu} members={thanhVien} name={tenKhu} onNameChange={setTenKhu} error={loiKhu} onSubmit={themKhu} />}
      dialogs={
        <>
          <MemberDialog
            open={moiMo}
            onOpenChange={setMoiMo}
            returnFocus={moTu}
            title="Mời người"
            description="Người được mời vào sàn với vai và vùng chọn dưới đây."
            submitLabel="Mời"
            email={{ value: email, onChange: setEmail, error: loiMoi }}
            roles={{ choices: VAI, value: vai, onChange: setVai }}
            zones={{ choices: cacKhu, value: khuChon, onChange: setKhuChon }}
            onSubmit={moi}
          />
          <MemberDialog
            open={sua !== null}
            onOpenChange={(o) => !o && setSua(null)}
            returnFocus={moTu}
            title={`Sửa ${sua?.email ?? ""}`}
            description="Đổi vai và vùng phụ trách của người này ở sàn."
            submitLabel="Lưu"
            roles={{ choices: VAI, value: suaVai, onChange: setSuaVai }}
            zones={{ choices: cacKhu, value: suaKhu, onChange: setSuaKhu }}
            error={loiSua && <TrangThai kind="error" title={loiSua} />}
            onSubmit={luu}
          />
          <ConfirmDialog
            confirm={
              bo && {
                title: tuToi ? "Rời sàn?" : `Bỏ ${bo.email} khỏi sàn?`,
                description: tuToi
                  ? "Bạn không vào được sàn nữa; vùng phụ trách của bạn ở sàn mất theo."
                  : "Người này không vào được sàn nữa; vùng phụ trách của họ ở sàn mất theo.",
                action: tuToi ? "Rời sàn" : "Bỏ khỏi sàn",
              }
            }
            onOpenChange={(o) => !o && setBo(null)}
            onConfirm={() => void xacNhanBo()}
            error={loiBo && <TrangThai kind="error" title={loiBo} />}
          />
          <ConfirmDialog
            confirm={
              cap && {
                title: `Cấp mật khẩu tạm cho ${cap.email}?`,
                description: `Mật khẩu cũ thôi dùng và ${cap.email} bị đăng xuất ở mọi máy.`,
                action: "Cấp mật khẩu",
              }
            }
            onOpenChange={(o) => !o && setCap(null)}
            onConfirm={() => void xacNhanCap()}
            error={loiCap && <TrangThai kind={loiCap.kind} title={loiCap.title} />}
          />
          <HopMatKhauTam ketQua={ketQuaCap} onClose={() => setKetQuaCap(null)} />
        </>
      }
    />
  );
}
