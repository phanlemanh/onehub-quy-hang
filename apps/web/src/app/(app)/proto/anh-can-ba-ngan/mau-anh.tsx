"use client";

// Nguồn ảnh trong bộ nhớ cho trang bấm được của mục Ảnh — không gọi API, tải lại trang là mất. Ảnh mẫu vẽ bằng SVG, không
// ảnh thật.
import type { UnitPhoto } from "@quy-hang/core/photos";
import { useMemo } from "react";

import { MucAnh, type NguonAnh } from "../../units/photos/muc-anh";

const mau = (chu: string, mau: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="${mau}"/><text x="320" y="250" font-size="40" text-anchor="middle" fill="#fff" font-family="sans-serif">${chu}</text></svg>`)}`;

function nguonBoNho(giuCan: boolean): NguonAnh {
  const url = new Map<string, string>();
  let n = 0;
  const anh = (compartment: UnitPhoto["compartment"], chu: string, mauNen: string, takenAt: string | null, isSample = false): UnitPhoto => {
    const id = `m${++n}`;
    url.set(id, mau(chu, mauNen));
    return { id, buildingName: "[Toà mẫu]", unitNumber: "A-06.01", compartment, displayOrder: n, isCover: false, isSample, takenAt, addedAt: "2026-11-01T08:00:00Z", contentType: "image/jpeg", width: 640, height: 480 };
  };
  let ds: UnitPhoto[] = [
    anh("shareable", "Phòng khách", "#6b7a8f", "2026-10-20"),
    anh("shareable", "Bếp", "#8f7a6b", null),
    anh("shareable", "Phối cảnh dự án", "#5f8f7a", null, true),
    anh("internal", "[Sổ mẫu]", "#8f5f6b", "2026-09-02"),
  ];
  const doi = (id: string, f: (p: UnitPhoto) => UnitPhoto) => (ds = ds.map((p) => (p.id === id ? f(p) : p)));
  return {
    danhSach: async () => ({ anh: giuCan ? ds : ds.filter((p) => p.compartment === "shareable"), noiBo: giuCan ? "thay" : "an", suaDuoc: giuCan }),
    them: async (tep, ngan) => {
      const id = `m${++n}`;
      url.set(id, URL.createObjectURL(tep.file));
      ds = [...ds, { id, buildingName: "[Toà mẫu]", unitNumber: "A-06.01", compartment: ngan, displayOrder: n, isCover: false, isSample: false, takenAt: tep.takenAt, addedAt: new Date().toISOString(), contentType: tep.type, width: tep.width, height: tep.height }];
    },
    sua: async (id, s) => {
      if (s.order) s.order.forEach((x, i) => doi(x, (p) => ({ ...p, displayOrder: i })));
      if (s.isCover) ds = ds.map((p) => ({ ...p, isCover: p.id === id }));
      if (s.isSample !== undefined) doi(id, (p) => ({ ...p, isSample: s.isSample! }));
      if (s.compartment) doi(id, (p) => ({ ...p, compartment: s.compartment!, isCover: false, isSample: s.compartment === "internal" ? false : p.isSample, displayOrder: ++n }));
    },
    xoa: async (id) => {
      ds = ds.filter((p) => p.id !== id);
    },
    urlAnh: (id) => url.get(id) ?? "",
  };
}

export function MauAnh({ giuCan }: { giuCan: boolean }) {
  const nguon = useMemo(() => nguonBoNho(giuCan), [giuCan]);
  return (
    <div className="flex flex-col gap-3 p-4">
      <h2 className="text-lg font-semibold">A-06.01 · [Toà mẫu]</h2>
      <p className="text-muted-foreground text-xs">Trang bấm được của mục Ảnh (hàng 18) — ảnh chỉ nằm trong trang này.</p>
      <MucAnh nguon={nguon} toaMa="[Toà mẫu] A-06.01" />
    </div>
  );
}
