"use client";

// Dữ liệu sống của tab Tôi (hàng 38): trạng thái cài và thông báo của trình duyệt, danh sách máy từ /api/v1/me/devices,
// «Báo mất máy» gửi kèm endpoint thông báo của máy này để máy chủ giữ đúng đăng ký ấy, đăng xuất đi đường chung.
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { dangXuatTrenMay } from "@/components/shell/dang-xuat-tren-may";
import { batThongBao, docTrangThai, thanDangXuat, type TrangThaiThietBi } from "@/lib/push/dang-ky";
import { useBoDongBo } from "@/lib/sync/react";
import { ManToi, type Loi, type MayDong } from "./man-toi";
import { phanLoaiCai, trangThaiDongMay, type TrangThaiCai } from "./toi";

type LoiMoiCai = Event & { prompt(): Promise<void> };

const laIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const daCai = () => (navigator as Navigator & { standalone?: boolean }).standalone === true || window.matchMedia("(display-mode: standalone)").matches;

async function endpointMayNay(): Promise<string | undefined> {
  try {
    const reg = await navigator.serviceWorker?.getRegistration("/");
    return (await reg?.pushManager.getSubscription())?.endpoint;
  } catch {
    return undefined;
  }
}

export function ToiThat({ loi, email, tenSan, soSan }: { loi: Loi; email: string; tenSan: string; soSan: number }) {
  const router = useRouter();
  const { dangXuat } = useBoDongBo();
  const loiMoi = useRef<LoiMoiCai | null>(null);
  const [cai, setCai] = useState<TrangThaiCai>("khac");
  const [thongBao, setThongBao] = useState<TrangThaiThietBi>("dang-kiem");
  const [dsMay, setDsMay] = useState<MayDong[]>([]);
  const [dang, setDang] = useState<"doc" | "san" | "bao" | "xong" | "loi">("doc");
  const [daThu, setDaThu] = useState(0);
  const [dangXuatLoi, setDangXuatLoi] = useState(false);

  const tinhCai = useCallback(() => setCai(phanLoaiCai({ daCai: daCai(), coLoiMoi: loiMoi.current !== null, ios: laIos() })), []);
  /** Đọc danh sách máy; trạng thái «đang đọc» do nơi gọi đặt (mặc định lúc mở màn). */
  const docMay = useCallback(async () => {
    try {
      const r = await fetch("/api/v1/me/devices", { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      setDsMay(((await r.json()) as { devices: MayDong[] }).devices);
      setDang("san");
    } catch {
      setDang("loi");
    }
  }, []);

  useEffect(() => {
    const nghe = (e: Event) => {
      e.preventDefault();
      loiMoi.current = e as LoiMoiCai;
      tinhCai();
    };
    window.addEventListener("beforeinstallprompt", nghe);
    // Trạng thái đọc từ trình duyệt và máy chủ đặt sau lời gọi, không đồng bộ trong effect.
    void Promise.resolve().then(tinhCai);
    void docTrangThai().then(setThongBao);
    void Promise.resolve().then(docMay);
    return () => window.removeEventListener("beforeinstallprompt", nghe);
  }, [tinhCai, docMay]);

  return (
    <ManToi
      loi={loi}
      du={{ email, tenSan, soSan, cai, thongBao, dsMay, may: trangThaiDongMay({ dang, soMay: dsMay.length, daThu }), dangXuatLoi }}
      hd={{
        cai: () => {
          void loiMoi.current?.prompt().finally(() => {
            loiMoi.current = null;
            tinhCai();
          });
        },
        batThongBao: () => {
          void batThongBao().then((kq) => setThongBao(kq === "loi" ? "loi-luu" : kq));
        },
        baoMat: () => {
          void (async () => {
            setDang("bao");
            try {
              const pushEndpoint = await endpointMayNay();
              const r = await fetch("/api/v1/me/devices/report-lost", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(pushEndpoint ? { pushEndpoint } : {}),
              });
              if (!r.ok) throw new Error(String(r.status));
              setDaThu(((await r.json()) as { revoked: number }).revoked);
              const ds = await fetch("/api/v1/me/devices", { cache: "no-store" });
              if (ds.ok) setDsMay(((await ds.json()) as { devices: MayDong[] }).devices);
              setDang("xong");
            } catch {
              setDang("loi");
            }
          })();
        },
        thuLaiMay: () => {
          setDang("doc");
          void docMay();
        },
        dangXuat: () => {
          // Máy chủ lỗi hay mất mạng thì ở lại và báo (luật 55); lần thử lại không hỏi xoá kho lần hai.
          void dangXuatTrenMay({
            dangXuat,
            daXoa: dangXuatLoi,
            than: thanDangXuat,
            goi: fetch,
            ve: () => {
              router.replace("/login");
              router.refresh();
            },
          }).then((kq) => setDangXuatLoi(kq === "loi"));
        },
      }}
    />
  );
}
