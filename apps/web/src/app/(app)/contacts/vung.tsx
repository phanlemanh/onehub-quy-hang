"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { KhungHoSo } from "@/components/khoi/solution-crm-4/ho-so";

import { DanhSachLienHe, type TrangThaiDs } from "./danh-sach";
import { KhungLienHe } from "./khung";
import { escDong, HoSoNguoi, type SoDaMo, type TrangThaiHoSo } from "./ho-so";
import { canDocLan, CHU, docDanhSach, docHoSo, henDoc, luaTim, moSo, timSo, type DongLienHe } from "./lien-he";
import { conTroXemThem, duocNoi, khoaLoc, type TrangCuoi } from "./xem-them";

/** Trang đầu máy chủ đã đọc (hàng khung-ho-so-lien-he): khoá bộ lọc của nó và kết quả. */
export type TrangDau = { khoa: string; items: DongLienHe[]; nextCursor: string | null };

/** Màn Liên hệ (hàng 103): tìm theo tên hay số, lọc loại, chạm dòng mở hồ sơ người cạnh bảng; Hiện số → Gọi. */
export default function VungLienHe({ dau = null }: { dau?: TrangDau | null }) {
  const [q, setQ] = useState("");
  // Loại và dấu Lead nằm trên URL (`?type=`, `?status=`) để cột thứ hai của nhà Liên hệ mở đúng bộ lọc.
  const thamSo = useSearchParams();
  const router = useRouter();
  const loai = thamSo.get("type") ?? "";
  const dauLoc = thamSo.get("status") ?? "";
  const setLoai = (l: string) => {
    const m = new URLSearchParams(thamSo.toString());
    if (l) m.set("type", l);
    else m.delete("type");
    router.replace(m.size ? `/contacts?${m}` : "/contacts");
  };
  const [ds, setDs] = useState<TrangThaiDs>(dau ? { kieu: "xong", ds: dau.items, con: dau.nextCursor !== null } : { kieu: "dang-tai" });
  const [lan, setLan] = useState(0);
  // Trang cuối mang khoá bộ lọc của nó: đổi bộ lọc thì con trỏ cũ hết hiệu lực ngay (AC-2, va-ho-so-lien-he).
  const [trang, setTrang] = useState<TrangCuoi | null>(null);
  const khoa = khoaLoc({ q, type: loai, status: dauLoc, lan });
  const [chon, setChon] = useState<string | null>(null);
  const [hs, setHs] = useState<TrangThaiHoSo>({ kieu: "dang-tai" });
  const [daMo, setDaMo] = useState<SoDaMo>({});
  const [lanHs, setLanHs] = useState(0);
  const hen = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Lượt đọc danh sách: «Xem thêm» về muộn sau khi bộ lọc đã đổi thì bỏ, không đè danh sách mới.
  const luotDs = useRef(0);
  // Bộ lọc mà danh sách đang theo (cập nhật cùng lượt đọc): kết quả «Xem thêm» về muộn so với nó, không với closure.
  const khoaHienTai = useRef("");
  // Con trỏ trang cuối đã nối (cập nhật cùng lúc nối): trang về lần hai cho cùng con trỏ thì không nối lại.
  const tiepHienTai = useRef<string | null>(null);
  // Bộ lọc của dữ liệu bảng đang hiện, trang máy chủ đã dùng, ô tìm lần trước (hàng khung-ho-so-lien-he): chỉ gõ ô tìm mới
  // chờ 250 ms; không đọc lại khi bảng đã đúng bộ lọc (kể cả khi hiệu ứng chạy hai lần) hay khi máy chủ vừa trao trang mới.
  const khoaDaCo = useRef<string | null>(dau?.khoa ?? null);
  const dauDaDung = useRef<TrangDau | null>(dau);
  const qTruoc = useRef(q);

  // Danh sách: gõ ô tìm thì chờ 250 ms, mở màn và đổi bộ lọc hỏi ngay; lượt đầu cùng bộ lọc với trang máy chủ đã trao thì
  // không hỏi lại. Chuỗi số từ chín chữ số đi lối tìm theo số (POST, số không vào URL).
  useEffect(() => {
    let huy = false;
    if (hen.current) clearTimeout(hen.current);
    luotDs.current++;
    const khoaLuot = khoaLoc({ q, type: loai, status: dauLoc, lan });
    khoaHienTai.current = khoaLuot;
    const lyDo = khoaDaCo.current === null ? "mo-man" : q !== qTruoc.current ? "go-tim" : "doi-loc";
    qTruoc.current = q;
    const dauMoi = dau && dau !== dauDaDung.current ? dau : null;
    if (!canDocLan(dauMoi?.khoa ?? null, khoaLuot, khoaDaCo.current)) {
      const trangDung = dauMoi && dauMoi.khoa === khoaLuot ? dauMoi : khoaLuot === dau?.khoa ? dau : null;
      if (dauMoi && dauMoi.khoa === khoaLuot) {
        dauDaDung.current = dauMoi;
        setDs({ kieu: "xong", ds: dauMoi.items, con: dauMoi.nextCursor !== null });
      }
      khoaDaCo.current = khoaLuot;
      if (trangDung) {
        tiepHienTai.current = trangDung.nextCursor;
        setTrang({ khoa: khoaLuot, tiep: trangDung.nextCursor });
      }
      return;
    }
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
      const kq = await docDanhSach({ q: q.trim(), type: loai, status: dauLoc });
      if (huy) return;
      if (!kq) return setDs({ kieu: "loi" });
      setDs({ kieu: "xong", ds: kq.items, con: kq.nextCursor !== null });
      khoaDaCo.current = khoaLuot;
      tiepHienTai.current = kq.nextCursor;
      setTrang({ khoa: khoaLuot, tiep: kq.nextCursor });
    }, henDoc(lyDo));
    return () => {
      huy = true;
    };
  }, [q, loai, dauLoc, lan, dau]);

  // Esc đóng hồ sơ đang mở (máy tính), trừ khi phím đã có chỗ dùng (Hỏi-2).
  useEffect(() => {
    const nghe = (e: KeyboardEvent) => {
      if (escDong({ key: e.key, defaultPrevented: e.defaultPrevented, target: e.target as HTMLElement | null }, chon !== null)) chonNguoi(null);
    };
    window.addEventListener("keydown", nghe);
    return () => window.removeEventListener("keydown", nghe);
  }, [chon]);

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
    const guiLuc = { luot: luotDs.current, khoa, cursor };
    const kq = await docDanhSach({ q: q.trim(), type: loai, status: dauLoc, cursor });
    if (!kq || !duocNoi(guiLuc, { luot: luotDs.current, khoa: khoaHienTai.current, cursor: tiepHienTai.current })) return;
    tiepHienTai.current = kq.nextCursor;
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
        <KhungHoSo cotPhu nhan={CHU.hoSo}>
          <HoSoNguoi
            tt={hs}
            daMo={daMo}
            onHienSo={(p) => void hienSo(p)}
            onThuLai={() => {
              setHs({ kieu: "dang-tai" });
              setLanHs((n) => n + 1);
            }}
            onDong={() => chonNguoi(null)}
          />
        </KhungHoSo>
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
