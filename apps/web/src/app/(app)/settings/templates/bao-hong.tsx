import { TrangThai } from "@/components/trang-thai";

import { CHU_MAU } from "./mau-san";

/** Khối báo mẫu hỏng ở đầu tab (hàng man-mau-bao-mau-hong): rỗng thì không dựng gì. */
export function BaoHong({ cau }: { cau: readonly string[] | undefined }) {
  if (!cau || cau.length === 0) return null;
  return (
    <TrangThai
      kind="notice"
      title={CHU_MAU.hongTieuDe(cau.length)}
      description={
        <div className="flex flex-col gap-2">
          <ul className="list-disc ps-5">
            {cau.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <p>{CHU_MAU.hongLuuKe}</p>
        </div>
      }
    />
  );
}
