---
schema_version: 1
feature: Mở sàn cho công ty mới trùng tên với sàn đang chạy thì được một sàn riêng; người của sàn mới không thấy dữ liệu sàn cũ
slug: mo-san-trung-ten
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [cli]
status: implemented
design_doc: docs/superpowers/specs/2026-10-31-mo-san-trung-ten-design.md
approved_by: Manh Phan
approved_at: 2026-10-31
---

# Acceptance Contract: mo-san-trung-ten

## Context

Hàng 56 của lộ trình (nền, dãy X, đợt nen-2), đứng trên hàng 6. Mở từ Cổng Bằng chứng hàng 6, mục Ngoài-7 và Ngoài-15 —
chủ kho chọn «mở hợp đồng mới» ngày 30/10: công cụ mở sàn tìm sàn theo tên nên gộp lặng người của công ty mới vào sàn cũ
cùng tên, mang vai quản trị. Chạm bất biến 1 (cách ly giữa công ty).

Hạng: **T3** (máy suy theo `t3_paths` — `packages/db/**`; hàng lộ trình ghi T3).

Source input: `docs/plan/lo-trinh.json` hàng 56 · `_acceptance/mo-san-trung-ten/opportunity.md` ·
`_acceptance/dang-nhap-theo-san/decisions.jsonl` (Ngoài-7, Ngoài-15) · thiết kế
`docs/superpowers/specs/2026-10-31-mo-san-trung-ten-design.md`

## Criteria

- AC-1: Given một sàn đang chạy tên «[Tên sàn]» có quản trị email X, When đội vận hành mở sàn cùng tên cho email quản
  trị Y khác X, Then ra một sàn mới khác mã; Y là quản trị sàn mới và KHÔNG là thành viên sàn cũ; sàn cũ giữ nguyên danh
  sách thành viên; hàm báo đã có 1 sàn khác cùng tên.
- AC-2: Given một lần mở sàn đã chạy (tên «[Tên sàn]», email X) — kể cả khi đã có từ hai sàn cùng tên và sàn của X
  không phải sàn đầu tiên — When chạy lại đúng lệnh, kể cả email viết hoa hay có khoảng trắng hai đầu, Then trả đúng sàn
  của X, báo là chạy lại, không tạo sàn, tài khoản hay thành viên nào thêm, vai không lặp; email chỉ là thành viên thường
  của sàn cùng tên thì KHÔNG tính là chạy lại — ra sàn mới.
- AC-3: Given ba lần mở cùng tên cho ba email khác nhau, When đếm, Then ra ba sàn khác mã, mỗi sàn đúng một thành viên là
  quản trị; lần thứ ba báo đã có 2 sàn khác cùng tên.
- AC-4: Given hai sàn cùng tên mở bằng công cụ thật, mỗi sàn có dữ liệu trên mọi bảng của công ty mà bộ kiểm cách ly dựng
  được, When đọc dưới vai của API với người và sàn MỚI, Then không bảng nào có cột `company_id` trả dòng nào của sàn cũ;
  đối chứng: dưới người và sàn cũ thấy dòng của sàn cũ. (cross-layer)
- AC-5: Given công cụ dòng lệnh mở sàn trùng tên, When chạy, Then in mã sàn mới và một dòng «đã có N sàn khác cùng tên —
  đây là sàn mới»; mở tên chưa có thì không in dòng ấy; chạy lại đúng lệnh thì in «chạy lại — sàn có sẵn» kèm mã sàn.

## Coverage

Quét theo khuôn morphological-scan, preset risk-premortem, cho «một lần mở sàn». Chân sản phẩm: bất biến 1 của AGENTS.md
[SUY-TỪ-REPO: AGENTS.md], mục Ngoài-7/Ngoài-15 của hàng 6 [SUY-TỪ-REPO: _acceptance/dang-nhap-theo-san/decisions.jsonl],
Kiến trúc §0 «mở công ty mới là việc của đội vận hành» [SUY-TỪ-REPO: packages/db/scripts/mo-san.mjs]. Chân ngành: tên
công ty không phải khoá định danh — đăng ký doanh nghiệp cho phép trùng tên khác địa bàn [NGÀNH: thực hành định danh
tenant theo mã, không theo tên].

- Trục tên × email: tên mới | tên trùng + email mới (AC-1, AC-3) | tên trùng + email là quản trị = chạy lại, cả khi có nhiều sàn cùng tên (AC-2) | tên trùng + email chỉ là thành viên thường = sàn mới (AC-2) | tên khác +
  email cũ (ca cũ của mo-san.test.mjs, giữ) [thước CE: bảng companies, company_members]
- Trục cách ly: người mới đặt sàn mới (AC-4) | người mới không là thành viên sàn cũ (AC-4) | quản trị cũ đặt sàn cũ — đối chứng (AC-4) [thước CE: luật theo dòng
  `app.current_company_id()` trên mọi bảng có `company_id`]
- Trục người vận hành thấy gì: dòng báo trùng tên | dòng báo chạy lại (AC-5)
- Later: gộp/dọn sàn đã lỡ gộp người; ràng buộc duy nhất cho tên; cơ sở dữ liệu tự kiểm thành viên khi đặt sàn (hàng mới, chủ kho 31/10).
- Never: tìm sàn theo tên (lối gây lỗi).

## Out of scope

- Không thêm ràng buộc duy nhất cho tên sàn.
- Không đổi màn hay API; mở sàn vẫn là công cụ của đội vận hành.
- Không gộp hay dọn sàn đã lỡ gộp người.

## Notes

- Vùng của hàng: `packages/db/scripts/mo-san.mjs`, `packages/db/scripts/mo-san.d.mts` (vùng gốc) cộng
  `packages/db/tests/mo-san.test.mjs`, `packages/db/tests/isolation.test.mjs` (chỉ thêm ca, luật 20 của đợt) và hai tệp
  thiết kế, kế hoạch — khai thêm ở Cổng Phạm vi.
- AC-4 sửa ở S3 theo lời chủ kho 31/10 (sổ `d-…` mang `supersedes` d-4): vế «người mới đặt sàn cũ» không phải điều cơ sở dữ
  liệu hứa — chỗ chặn là API; kiểm thành viên ở cơ sở dữ liệu là hàng mới.
