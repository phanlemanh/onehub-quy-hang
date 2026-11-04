import { headers } from "next/headers";
import type { ReactNode } from "react";

import { BoCuc, DauMan } from "@/components/bo-cuc";
import { MucCaiDatKhoi } from "@/components/khoi/settings-3/muc-cai-dat";
import { readMe } from "@/lib/api";

import { COMPANY_SETTINGS_PATH } from "@quy-hang/core";

import { PHAM_VI, tenNhomSan } from "./cai-dat";

// Khuôn của nhóm `cai-dat-san` (design/patterns/cai-dat-san.md): mỗi mục Cài đặt sàn đi bố cục Đọc (hàng 91) — đầu màn
// có đường dẫn «Cài đặt › Sàn [Tên] › mục» và câu phạm vi «Chỉ áp cho sàn [Tên]» (hàng cai-dat-hop-nhat), thân là khung
// của settings-3. Mục cần khối riêng (Người dùng) đặt khối vào thân với
// `khoi` thay cho khung settings-3; bề rộng và lề thuộc bố cục, mục không tự đặt.
export async function MucCaiDat({
  title,
  description,
  khoi = false,
  children,
}: {
  title: string;
  description?: ReactNode;
  /** Khối ReUI mang Frame riêng (solution-users-8 ở Người dùng) — dựng thẳng trong thân, không bọc khung settings-3. */
  khoi?: boolean;
  children: ReactNode;
}) {
  // Tên sàn đang làm cho đường dẫn và câu phạm vi — khuôn tự đọc, mục không phải chuyền.
  const tenSan = (await readMe((await headers()).get("cookie") ?? ""))?.activeCompany?.name ?? "";
  return (
    <BoCuc
      kieu="doc"
      dauMan={
        <DauMan
          duongDan={[{ nhan: "Cài đặt", href: "/settings" }, { nhan: tenNhomSan(tenSan), href: COMPANY_SETTINGS_PATH }, { nhan: title }]}
          tieuDe={title}
          moTa={
            <>
              {PHAM_VI.san(tenSan)}
              {description ? <> · {description}</> : null}
            </>
          }
        />
      }
    >
      {khoi ? children : <MucCaiDatKhoi tieuDe={title}>{children}</MucCaiDatKhoi>}
    </BoCuc>
  );
}
