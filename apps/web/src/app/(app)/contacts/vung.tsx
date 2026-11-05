"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { DanhSachLienHe, type TrangThaiDs } from "./danh-sach";
import { KhungLienHe } from "./khung";
import { HoSoNguoi, type SoDaMo, type TrangThaiHoSo } from "./ho-so";
import { CHU, docDanhSach, docHoSo, luaTim, moSo, timSo } from "./lien-he";
import { conTroXemThem, duocNoi, khoaLoc, type TrangCuoi } from "./xem-them";

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
  const [lan, setLan] = useState(0);
  // Trang cuối mang khoá bộ lọc của nó: đổi bộ lọc thì con trỏ cũ hết hiệu lực ngay (AC-2, va-ho-so-lien-he).
  const [trang, setTrang] = useState<TrangCuoi | null>(null);
  const khoa = khoaLoc({ q, type: loai, status: dau, lan });
  const [chon, setChon] = useState<string | null>(null);
  const [hs, setHs] = useState<TrangThaiHoSo>({ kieu: "dang-tai" });
  const [daMo, setDaMo] = useState<SoDaMo>({});
  const [lanHs, setLanHs] = useState(0);
  const hen = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Lượt đọc danh sách: «Xem thêm» về muộn sau khi bộ lọc đã đổi thì bỏ, không đè danh sách mới.
  const luotDs = useRef(0);
  // Bộ lọc mà danh sách đang theo (cập nhật cùng lượt đọc): kết quả «Xem thêm» về muộn so với nó, không với closure.
  const khoaHienTai = useRef("");

  // Danh sách: gõ xong 250 ms mới đọc; chuỗi số từ chín chữ số đi lối tìm theo số (POST, số không vào URL).
  useEffect(() => {
    let huy = false;
    if (hen.current) clearTimeout(hen.current);
    luotDs.current++;
    const khoaLuot = khoaLoc({ q, type: loai, status: dau, lan });
    khoaHienTai.current = khoaLuot;
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
      setTrang({ khoa: khoaLuot, tiep: kq.nextCursor });
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
    const cursor = conTroXemThem(trang, khoa, ds.kieu === "xong");
    if (!cursor) return;
    const guiLuc = { luot: luotDs.current, khoa };
    const kq = await docDanhSach({ q: q.trim(), type: loai, status: dau, cursor });
    if (!kq || !duocNoi(guiLuc, { luot: luotDs.current, khoa: khoaHienTai.current })) return;
    setDs((cu) =>
      cu.kieu === "xong"
        ? { kieu: "xong", ds: [...cu.ds, ...kq.items], con: kq.nextCursor !== null }
        : cu,
    );
    setTrang({ khoa: guiLuc.khoa, tiep: kq.nextCursor });
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
