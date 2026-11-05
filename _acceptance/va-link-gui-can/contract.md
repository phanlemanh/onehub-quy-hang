---
schema_version: 1
feature: "Vá nút «Gửi căn» (hàng 36 Đã gửi, hàng 37 Hôm nay Đầu khách): ở trạng thái trống, bấm «Gửi căn» mở Bảng hàng (dạng thẻ trên điện thoại) thay vì trang «Không thấy trang này»; có bài kiểm giữ mọi link nội bộ trỏ tới đường có trang"
slug: va-link-gui-can
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: machine-cleared
design_doc: docs/superpowers/specs/2026-11-05-va-link-gui-can-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-05T13:51:53Z
---

# Acceptance Contract: va-link-gui-can

## Context

Hàng `va-link-gui-can` của lộ trình, vá hàng 36 (`da-gui`) và 37 (`hom-nay-dau-khach`). Hai nút «Gửi căn» ở trạng thái
trống trỏ `/inventory/cards` — thư mục mã của bảng thẻ, không có trang — nên ra «Không thấy trang này» (HTTP 404); đã
thấy trên bản chạy, vai Đầu khách mẫu, khổ 375×812. Bảng thẻ sống ở chính `/inventory` dưới khổ `md` (Tham chiếu §12,
03/11). Thấy ở lần rà soát `docs/plan/ra-soat-crud-phan-quyen.md` mục 5.

Dữ liệu mẫu: người mẫu `…@mau.quy-hang.test`, không dữ liệu thật.

## Criteria

- AC-1: Given Đầu khách mẫu chưa gửi link nào, khổ 375×812, When mở «Đã gửi» (`/shares`) và bấm «Gửi căn», Then trang
  mới là `/inventory` (không HTTP 404, không chữ «Không thấy trang này») và hiện bảng thẻ (dưới `md`, ở đây là trạng thái
  trống của bảng thẻ «Chưa có căn nào trên bảng hàng chung», kèm nút «Về Hôm nay»); ở khổ 1280 cùng nút mở `/inventory` là
  bảng hàng («Sàn chưa có hàng nào»); nút ấy trong mã dựng trỏ đúng `href="/inventory"`.
- AC-2: Given Đầu khách mẫu không có tin nào trong 7 ngày, khổ 375×812, When mở Hôm nay (`/today`) và bấm «Gửi căn» ở
  vùng Đầu khách, Then trang mới là `/inventory`, không 404, hiện bảng thẻ như AC-1; nút ấy trong mã dựng trỏ đúng
  `href="/inventory"`.
- AC-3: Given mã nguồn giao diện `apps/web/src` (trừ tệp kiểm), When quét mọi đường tĩnh của link và đối chiếu với tập
  đường dựng từ `page.tsx`/`route.ts` của `src/app`, Then không đường nào thiếu trang, và bộ quét đúng trên ba bảng viết
  trước:
  - Cây thật (19 dòng): có trang — `/inventory`, `/inventory?hang=1`, `/inventory/views/abc`, `/units/<động>`,
    `/units/A-04.06`, `/units/call/dial`, `/shares`, `/shares/new`, `/today`, `/s/<động>`, `/settings/users`, `/settings`,
    `/exports/new`, `/login`, `/`; không trang — `/inventory/cards`, `/units/call/dial/x`, `/khong-co`, `/inventory/<động>`.
  - Cây mẫu `page.tsx`, `(g)/a/page.tsx`, `docs/[...slug]/page.tsx`, `help/[[...p]]/page.tsx`, `x/[id]/y/page.tsx`,
    `api/v1/[[...route]]/route.ts` (18 dòng): có trang — `/`, `/a`, `/docs/1`, `/docs/1/2/3`, `/help`, `/help/1/2`,
    `/x/9/y`, `/x/<động>/y`, `/api/v1/health`, `/api/v1`, `/a?q=1`, `/a#neo`, `/a/`; không trang — `/(g)/a`, `/b`, `/docs`,
    `/x/9`, `/a/<động>`.
  - Dạng link (11 dòng, mỗi dạng một dòng trỏ `/khong-co/<n>`): `href="…"`, `href={"…"}`, `` href={`…`} ``, `href: "…"`,
    `` href: `…` ``, `redirect("…")`, `` redirect(`…`) ``, `router.push("…")`, `router.replace("…")`, `` router.push(`…`) ``,
    `` router.replace(`…`) `` — mỗi dạng trích đúng đường và bị gọi tên `mau.tsx:<dòng>`; `//…`, `/api/…`, `https://…`,
    `fetch(…)` không được tính là link trang.
- AC-4: Given cây sau hàng này, When chạy kiểm kiểu, lint (luật `quy-hang-ui`, mức nợ 0, kiểm chuẩn, bài quét khuôn) và
  sàn thiết kế, Then đều xanh.

## Đường đo

Bỏ — vòng mở bằng câu mô tả, không ô cơ hội và không ngưỡng (xem dòng descope «bỏ đường-đo» trong sổ).

## Coverage

Quét bằng morphological-scan (preset entity-feature), ba trục:

- Trục A — nơi có nút: Đã gửi trống · Hôm nay Đầu khách trống [thước CE: `grep -rn "inventory/cards" apps/web/src` trên
  cây trước vá — đúng hai chỗ, cộng hai bài kiểm ghim đích sai]
- Trục B — khổ: điện thoại (bảng thẻ) · máy tính (bảng hàng) [thước CE: `inventory/page.tsx` — `KhungBangHang` chọn
  `dienThoai` dưới `md`]
- Trục C — dạng link trong mã: `href` chuỗi · `href` template · `href:` trong đối tượng · `redirect` · `router.push/replace`
  [thước CE: quét `apps/web/src` — đó là các dạng đang dùng]
- Core: A cả hai ở AC-1, AC-2; B điện thoại ở AC-1, AC-2, máy tính ở AC-1 (đối chứng khổ); C toàn bộ ở AC-3.
- Later: link dựng động hoàn toàn (`href={bien}`) — bộ quét chỉ đọc đường tĩnh.

## Out of scope

- Đổi chữ, kiểu hay vị trí hai nút; mở sẵn chế độ chọn căn khi tới Bảng hàng.
- Cảnh báo Base UI `nativeButton` ở nút «Về Hôm nay» trong trạng thái trống của bảng thẻ (`inventory/cards/bang-the.tsx`,
  hàng 32) — thấy trên console khi kiểm, không thuộc hai nút này.
- Link dựng từ biến (`href={x}`) và đường gọi API (`fetch`).

## Notes

- Chạm tệp: `shares/danh-sach.tsx`, `today/buyer/dong-tin.tsx` (đổi đích), `shares/da-gui.test.ts`,
  `today/buyer/dau-khach.test.ts` (đích mới), tệp mới `apps/web/src/app/link-noi-bo.test.ts`; chỗ thử
  `_acceptance/va-link-gui-can/thu/dung.mjs` (Postgres riêng 5581, máy dev 3460 — không tranh dãy của đợt).
- Ngoài-1 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Khi người chấm dựng chỗ thử mà trên máy đã có một bản chạy thử khác, công cụ vẫn báo sẵn sàng nhưng thực ra nhìn vào bản kia. Kết quả kiểm có thể xanh hoặc đỏ oan, còn người dùng sản phẩm không bị ảnh hưởng. — `_acceptance/va-link-gui-can/thu/dung.mjs`
- Ngoài-2 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Chỗ thử có thể vô tình đo nhầm bản phần mềm khác đang chạy trên máy, nên bằng chứng bấm «Gửi căn» có thể không phải của bản đang kiểm. Người dùng sản phẩm không bị ảnh hưởng. — `_acceptance/va-link-gui-can/thu/dung.mjs`
- Ngoài-3 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Bài kiểm ở màn Đã gửi chỉ xác nhận đường dẫn tới Bảng hàng có xuất hiện đâu đó, chưa chắc là ở đúng nút «Gửi căn». Nếu sau này nút bị đổi đích, một bài kiểm khác vẫn bắt được. — `apps/web/src/app/(app)/shares/da-gui.test.ts`
