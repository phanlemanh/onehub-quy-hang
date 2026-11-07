"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/reui/badge";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { CHU, chuGiaTri, nhomTheoTruong, sucKhoeMan, TEN_TRANG_THAI, TEN_TRUONG, type DongTuDien, type TrangThaiTuDien } from "./tu-dien-thuan";

/** Vùng của màn trong vỏ: làm mới bằng router của app. */
export function VungTuDien({ tt }: { tt: TrangThaiTuDien }) {
  const router = useRouter();
  return <BangTuDien tt={tt} lamMoi={() => router.refresh()} />;
}

/** Màn Từ điển (hàng 70): hàng sức khoẻ, rồi mỗi trường một bảng cách gõ; Duyệt / Bỏ gọi máy chủ rồi làm mới. */
export function BangTuDien({ tt, lamMoi }: { tt: TrangThaiTuDien; lamMoi: () => void }) {
  const [dang, setDang] = useState<string | null>(null);
  const [loi, setLoi] = useState(false);

  if (tt.kieu === "dang-tai") return <TrangThai kind="loading" title={CHU.dangTai} />;
  if (tt.kieu === "loi")
    return <TrangThai kind="error" title={CHU.loi} hanhDong={<Button variant="outline" onClick={() => lamMoi()}>{CHU.thuLai}</Button>} />;

  const { tong, theoTruong } = sucKhoeMan(tt.rows);
  const quyet = async (r: DongTuDien, decision: "approve" | "reject") => {
    setDang(r.id);
    setLoi(false);
    const res = await fetch(`/api/v1/company/value-aliases/${r.id}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ decision }) }).catch(() => null);
    setDang(null);
    if (res && res.ok) lamMoi();
    else setLoi(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <Table aria-label={CHU.sucKhoe}>
        <TableHeader>
          <TableRow>
            <TableHead>{CHU.sucKhoe}</TableHead>
            <TableHead className="text-end">Đã gặp</TableHead>
            <TableHead className="text-end">Đã neo</TableHead>
            <TableHead className="text-end">Chờ duyệt</TableHead>
            <TableHead className="text-end">Đã bỏ</TableHead>
            <TableHead className="text-end">Lần chọn</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...theoTruong.map(({ field, s }) => ({ ten: TEN_TRUONG[field], s })), { ten: "Cả sàn", s: tong }].map(({ ten, s }) => (
            <TableRow key={ten}>
              <TableCell className="font-medium">{ten}</TableCell>
              <TableCell className="text-end tabular-nums">{s.gap}</TableCell>
              <TableCell className="text-end tabular-nums">{s.daNeo}</TableCell>
              <TableCell className="text-end tabular-nums">{s.cho}</TableCell>
              <TableCell className="text-end tabular-nums">{s.daBo}</TableCell>
              <TableCell className="text-end tabular-nums">{s.lanChon}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {loi ? <TrangThai kind="error" title={CHU.loiLuu} /> : null}
      {tt.rows.length === 0 ? (
        <TrangThai kind="empty" title={CHU.trong} />
      ) : (
        nhomTheoTruong(tt.rows)
          .filter((n) => n.rows.length > 0)
          .map(({ field, rows }) => (
            <Table key={field} aria-label={TEN_TRUONG[field]}>
              <TableHeader>
                <TableRow>
                  <TableHead>{TEN_TRUONG[field]} · cách gõ</TableHead>
                  <TableHead>Giá trị chuẩn</TableHead>
                  <TableHead className="text-end">Lần chọn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-end" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.raw}</TableCell>
                    <TableCell>{chuGiaTri(field, r.value)}</TableCell>
                    <TableCell className="text-end tabular-nums">{r.pickCount}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "approved" ? "success-light" : r.status === "rejected" ? "secondary" : "warning-light"}>{TEN_TRANG_THAI[r.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      {r.status !== "approved" ? (
                        <Button variant="ghost" size="sm" disabled={dang === r.id} onClick={() => void quyet(r, "approve")} aria-label={`${CHU.duyet} «${r.raw}»`}>
                          {CHU.duyet}
                        </Button>
                      ) : null}
                      {r.status !== "rejected" ? (
                        <Button variant="ghost" size="sm" disabled={dang === r.id} onClick={() => void quyet(r, "reject")} aria-label={`${CHU.bo} «${r.raw}»`}>
                          {CHU.bo}
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ))
      )}
    </div>
  );
}
