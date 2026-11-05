"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { DanhSachLienHe, type TrangThaiDs } from "./danh-sach";
import { KhungLienHe } from "./khung";
import { HoSoNguoi, type SoDaMo, type TrangThaiHoSo } from "./ho-so";
import { CHU, docDanhSach, docHoSo, luaTim, moSo, timSo } from "./lien-he";

/** Màn Liên hệ (hàng 103): tìm theo tên hay số, lọc loại, chạm dòng mở hồ sơ người cạnh bảng; Hiện số → Gọi. */
export default function VungLienHe() {
  const [q, setQ] = useState("");
  // Loại và dấu Lead nằm trên URL (`?type=`, `?status=`) để cột thứ hai của nhà Liên hệ mở đúng bộ lọc.
  const thamSo = useSearchParams();
  const router = useRouter();
  const loai = thamSo.get("type") ?? "";
  const dau = thamSo.get("status") ?? "";
  const setLoai = (l: string) => {
    const m = new URLSearchParams(thamSo.toString());
    if (l) m.set("type", l);
    else m.delete("type");
    router.replace(m.size ? `/contacts?${m}` : "/contacts");
  };
  const [ds, setDs] = useState<TrangThaiDs>({ kieu: "dang-tai" });
  const [cursor, setCursor] = useState<string | null>(null);
  const [lan, setLan] = useState(0);
  const [chon, setChon] = useState<string | null>(null);
  const [hs, setHs] = useState<TrangThaiHoSo>({ kieu: "dang-tai" });
  const [daMo, setDaMo] = useState<SoDaMo>({});
  const [lanHs, setLanHs] = useState(0);
  const hen = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Danh sách: gõ xong 250 ms mới đọc; chuỗi số từ chín chữ số đi lối tìm theo số (POST, số không vào URL).
  useEffect(() => {
    let huy = false;
    if (hen.current) clearTimeout(hen.current);
    hen.current = setTimeout(async () => {
      setDs({ kieu: "dang-tai" });
      if (q.trim() && luaTim(q) === "so") {
        const kq = await timSo(q);
        if (huy) return;
        if (!kq) return setDs({ kieu: "loi" });
        if ("held" in kq)
          return setDs({ kieu: "nguoi-khac-giu", holderName: kq.holderName });
        if ("found" in kq) return setDs({ kieu: "xong", ds: [], con: false });
        setDs({ kieu: "xong", ds: [], con: false });
        return chonNguoi(kq.contactId);
      }
      const kq = await docDanhSach({ q: q.trim(), type: loai, status: dau });
      if (huy) return;
      if (!kq) return setDs({ kieu: "loi" });
      setDs({ kieu: "xong", ds: kq.items, con: kq.nextCursor !== null });
      setCursor(kq.nextCursor);
    }, 250);
    return () => {
      huy = true;
    };
  }, [q, loai, dau, lan]);

  // Hồ sơ: đọc khi chọn người (hay thử lại); trạng thái chờ và che số đặt ở lúc chọn.
  useEffect(() => {
    if (!chon) return;
    let huy = false;
    void docHoSo(chon).then(
      (h) => !huy && setHs(h ? { kieu: "xong", hs: h } : { kieu: "loi" }),
    );
    return () => {
      huy = true;
    };
  }, [chon, lanHs]);

  // Đổi người thì che lại mọi số đã mở.
  function chonNguoi(id: string | null) {
    setChon(id);
    setHs({ kieu: "dang-tai" });
    setDaMo({});
  }

  async function them() {
    if (!cursor || ds.kieu !== "xong") return;
    const kq = await docDanhSach({ q: q.trim(), type: loai, status: dau, cursor });
    if (!kq) return;
    setDs({
      kieu: "xong",
      ds: [...ds.ds, ...kq.items],
      con: kq.nextCursor !== null,
    });
    setCursor(kq.nextCursor);
  }

  async function hienSo(phoneId: string) {
    if (!chon) return;
    const so = await moSo(chon, phoneId);
    setDaMo((m) => ({ ...m, [phoneId]: so ?? "loi" }));
  }

  return (
    <KhungLienHe
      cotPhu={
        <HoSoNguoi
          tt={hs}
          daMo={daMo}
          onHienSo={(p) => void hienSo(p)}
          onThuLai={() => {
            setHs({ kieu: "dang-tai" });
            setLanHs((n) => n + 1);
          }}
        />
      }
      chiTiet={{
        mo: chon !== null,
        onMo: (m) => !m && chonNguoi(null),
        tieuDe:
          hs.kieu === "xong" ? (hs.hs.contact.name ?? CHU.hoSo) : CHU.hoSo,
      }}
    >
      <DanhSachLienHe
        tt={ds}
        q={q}
        loai={loai}
        chon={chon}
        onQ={setQ}
        onLoai={setLoai}
        onChon={chonNguoi}
        onThem={() => void them()}
        onThuLai={() => setLan((n) => n + 1)}
      />
    </KhungLienHe>
  );
}
