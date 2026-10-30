"use client";

// Trang thử của hồ sơ bai-thu-luoi-5000-dong — chỉ sống trên nhánh thử, không gộp vào main (luật 5 của đợt).
// Lưới ReUI data-grid cuộn ảo, chọn ô, sửa trên ô, dán từ clipboard; ghi mốc đo vào window.__do cho máy đo.
// ?cham=1 — việc bận 60 ms mỗi khung hình và 1.200 ms mỗi lô ghi; ?cham=phim — việc bận 80 ms trong hàm nghe phím chạy
// trước lưới. Cả hai là đối chứng đỏ của máy đo.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTable, type ColumnDef } from "@tanstack/react-table";

import {
  DataGrid,
  DataGridContainer,
  dataGridFeatures,
  type DataGridCellsChangeDetails,
  type DataGridFeatures,
} from "@/components/reui/data-grid/data-grid";
import { DataGridCellSelection } from "@/components/reui/data-grid/data-grid-cell-selection";
import { DataGridTableVirtual } from "@/components/reui/data-grid/data-grid-table-virtual";

type Dong = Record<string, string> & { id: string };

const SO_DONG = 5000;
const COT = [
  "ma", "toa", "tang", "can", "loai", "dien_tich", "phong_ngu", "huong", "gia", "gia_m2",
  "trang_thai", "nguon", "dau_chu", "dau_khach", "ban_cong", "noi_that", "phap_ly", "ghi_chu", "cap_nhat", "nhan",
] as const;
const TRANG_THAI = ["Active", "Pending", "Hold", "Closed", "Withdrawn", "Incomplete"];
const HUONG = ["Đông", "Tây", "Nam", "Bắc", "Đông Nam", "Tây Bắc"];

// Hạt cố định để mọi lượt đo dùng cùng dữ liệu.
function sinhDuLieu(): Dong[] {
  let s = 20261030;
  const r = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  const out: Dong[] = [];
  for (let i = 0; i < SO_DONG; i++) {
    const ma = `MAU-${String(i + 1).padStart(5, "0")}`;
    const dt = (45 + r() * 90).toFixed(1);
    const gia = (1.8 + r() * 6).toFixed(2);
    out.push({
      id: ma, ma, toa: `T${1 + Math.floor(r() * 6)}`, tang: String(1 + Math.floor(r() * 35)),
      can: String(1 + Math.floor(r() * 20)).padStart(2, "0"), loai: r() > 0.5 ? "2PN" : "3PN", dien_tich: dt,
      phong_ngu: String(1 + Math.floor(r() * 3)), huong: HUONG[Math.floor(r() * HUONG.length)] ?? "Nam",
      gia: `${gia} tỷ`, gia_m2: `${Math.round((Number(gia) * 1000) / Number(dt))} tr`,
      trang_thai: TRANG_THAI[Math.floor(r() * TRANG_THAI.length)] ?? "Active", nguon: r() > 0.5 ? "Chủ nhà" : "Sàn",
      dau_chu: "[Tên]", dau_khach: "[Tên]", ban_cong: r() > 0.5 ? "Có" : "Không", noi_that: r() > 0.6 ? "Đủ" : "Cơ bản",
      phap_ly: r() > 0.3 ? "Sổ hồng" : "HĐMB", ghi_chu: "Dữ liệu mẫu", cap_nhat: `${1 + Math.floor(r() * 28)}/10`,
      nhan: "mẫu",
    });
  }
  return out;
}

type Do = { khung: number[]; khungCb: number[]; go: number[]; dan: { ms: number } | null; danT0: number | null; ghiKhung: boolean };

function ban(ms: number) {
  const den = performance.now() + ms;
  while (performance.now() < den) {
    /* việc bận có chủ ý — đối chứng đỏ */
  }
}

export function LuoiThu() {
  const [data, setData] = useState<Dong[]>(() => sinhDuLieu());
  const che = useRef<"" | "1" | "phim">("");
  const daDan = useRef(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("cham");
    che.current = q === "1" ? "1" : q === "phim" ? "phim" : "";
    const d: Do = { khung: [], khungCb: [], go: [], dan: null, danT0: null, ghiKhung: false };
    (window as unknown as { __do: Do }).__do = d;
    let raf = 0;
    // Nhịp khung đo bằng dấu thời gian khung của trình duyệt (khung bị bỏ hiện thành khoảng ~33 ms). Độ trễ gõ và dán
    // đo bằng performance.now() lúc callback chạy: dấu thời gian khung là giờ khung bắt đầu, có thể sớm hơn cả phím (đối
    // chứng đỏ ?cham=phim đã bắt được: dán ra số âm). khungCb là số phụ — nhịp lúc callback chạy — để ADR ghi cả hai.
    const vong = (t: number) => {
      if (d.ghiKhung) {
        d.khung.push(t);
        d.khungCb.push(performance.now());
      }
      if (che.current === "1") ban(60);
      raf = requestAnimationFrame(vong);
    };
    raf = requestAnimationFrame(vong);
    // Pha bắt: chạy trước lưới. Mốc đầu là event.timeStamp — lúc phím xảy ra, không phải lúc hàm chạy.
    const nghePhim = (e: KeyboardEvent) => {
      if (che.current === "phim") ban(80);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
        d.danT0 = e.timeStamp;
        return;
      }
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
        const t0 = e.timeStamp;
        requestAnimationFrame(() => d.go.push(performance.now() - t0));
      }
    };
    document.addEventListener("keydown", nghePhim, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", nghePhim, true);
    };
  }, []);

  // Khung hình đầu tiên sau khi lô dán đã vào DOM: đo từ phím dán tới đó.
  useLayoutEffect(() => {
    if (!daDan.current) return;
    daDan.current = false;
    const d = (window as unknown as { __do: Do }).__do;
    requestAnimationFrame(() => {
      if (d.danT0 !== null) d.dan = { ms: performance.now() - d.danT0 };
    });
  }, [data]);

  const viTri = useMemo(() => new Map(data.map((r, i) => [r.id, i])), [data]);

  const onCellsChange = (details: DataGridCellsChangeDetails<Dong>) => {
    if (che.current === "1") ban(1200);
    if (details.source === "paste") daDan.current = true;
    setData((truoc) => {
      const sau = truoc.slice();
      for (const c of details.changes) {
        const i = viTri.get(c.rowId);
        if (i === undefined) continue;
        sau[i] = { ...(sau[i] as Dong), [c.columnId]: String(c.value ?? "") };
      }
      return sau;
    });
  };

  const columns = useMemo<ColumnDef<DataGridFeatures, Dong>[]>(
    () =>
      COT.map((k) => ({
        accessorKey: k,
        header: k,
        size: k === "ma" ? 110 : 96,
        meta: { cellEdit: { control: "text" as const } },
      })),
    [],
  );

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data,
    getRowId: (r: Dong) => r.id,
    manualPagination: true,
  });

  useEffect(() => {
    (window as unknown as { __luoi: unknown }).__luoi = {
      dong: data.length,
      cot: COT.length,
      mau: data[0]?.ma,
      o: (r: number, c: number) => data[r]?.[COT[c] ?? ""],
    };
  }, [data]);

  return (
    <main className="flex h-svh flex-col gap-2 p-4">
      <h1 className="text-sm font-medium">Bài thử lưới — 5.000 dòng × 20 cột (dữ liệu mẫu)</h1>
      <DataGrid
        table={table}
        recordCount={data.length}
        onCellsChange={onCellsChange}
        tableLayout={{ dense: true, cellSelection: true, cellBorder: true }}
      >
        <DataGridContainer>
          <DataGridTableVirtual height={600} estimateSize={32} overscan={8} />
          <DataGridCellSelection />
        </DataGridContainer>
      </DataGrid>
    </main>
  );
}
