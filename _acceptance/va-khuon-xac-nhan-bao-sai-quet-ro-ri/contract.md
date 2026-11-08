---
schema_version: 1
feature: Sự kiện báo sai của Xác nhận danh mục chỉ dựng được khi mã căn đúng dạng UPI như khuôn; phép quét rò rỉ của sự kiện đỏ được khi hàm dựng làm rò (đối chứng dương trên chính đường dựng); và phép quét cả lớp chuỗi đo được khuôn có chặn chữ tự do và dãy số dáng điện thoại, không chỉ «có khuôn».
slug: va-khuon-xac-nhan-bao-sai-quet-ro-ri
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: approved
design_doc: docs/superpowers/specs/2026-11-08-va-khuon-xac-nhan-bao-sai-quet-ro-ri-design.md
approved_by: Manh Phan
approved_at: 2026-11-08T21:46:51Z
---

# Acceptance Contract: va-khuon-xac-nhan-bao-sai-quet-ro-ri

## Context

Ngoài-5, Ngoài-7, Ngoài-8 của hàng 95 `khuon-xac-nhan-danh-muc` (chủ kho chọn «mở hợp đồng mới» khi ký Cổng Bằng chứng
08/11). Hạng **T3** (chạm `packages/connect/**`). Bất biến chạm: (2) chủ nhà không rời công ty và (4) phần nội bộ không ra
ngoài — hàng này làm chắc lưới của hai bất biến ấy. Chưa có đường chảy thật.

Source input: `docs/plan/lo-trinh.json` hàng cùng tên · `_acceptance/va-khuon-xac-nhan-bao-sai-quet-ro-ri/opportunity.md` ·
`_acceptance/khuon-xac-nhan-danh-muc/review-findings.md` · ADR-0027.

## Criteria

- AC-1: Given danh mục có căn mang UPI ngoài dạng khuôn (chứa `/`, khoảng trắng, `#`), When dựng báo sai cho căn ấy, Then
  hàm dựng từ chối nêu trường `upi`; căn có UPI đúng dạng vẫn báo sai được.
- AC-2: Given ma trận danh mục lạ (UPI, khoá toà ngoài dạng), When chạy cả ba hàm dựng, Then mọi kết quả `ok: true` đều
  qua được khuôn — không có sự kiện nào sàn thấy được nhận mà bên nhận từ chối.
- AC-3: Given danh mục đưa vào mang thêm mọi mồi ngoài lớp danh mục trên căn và toà, When dựng ba loại sự kiện, Then hàm
  dựng vẫn dựng được và bộ kiểm rò rỉ trên sự kiện ra không thấy mồi nào; đầu vào mang các mồi ấy thì hàm dựng từ chối nêu
  khoá lạ; cùng một hàm quét đo cả hai đường, danh sách mồi ghim trước và đếm khớp.
- AC-4: Given bản sao của hàm dựng bị cấy lỗi rò theo ma trận viết trước, When chạy đúng phép quét của AC-3, Then phép
  quét đỏ và gọi tên trường rò; neo của phép cấy không còn trong mã nguồn thì ca đỏ; cây kho không bị ghi.
- AC-5: Given mọi nút chuỗi của khuôn, When đưa từng mồi trong ma trận (câu tự do, số liền, số nối bằng `.`, `-`, `_`, `/`,
  số cách khoảng trắng, `+84`) qua chính nút ấy, Then nút từ chối hết, và một giá trị đúng dạng của nút ấy qua được; số nút bằng số viết
  trước; một khuôn thử có chuỗi regex quá rộng bị phép quét gọi tên.
- AC-6: Given mọi chuỗi đầu vào của hàm dựng (`unitNumber`, `directionFaces`, `stack`, `stacks`, `correctValue`,
  `buildingKey`, `upi`), When đưa cùng ma trận mồi (mồi khoá toà, UPI được cấy vào chính danh mục để qua bước tra), Then hàm dựng từ chối nêu đúng trường với thông điệp lỗi dạng; mã căn 8 chữ số có dấu nối vẫn qua, 9 chữ số có dấu nối bị chặn.
- AC-7: Given khoá dạng thật của Invest (`bld_<ULID>` nhiều chữ số, `urn:onehub:upi:1:VN:VN-HN:bld_<ULID>`) và mọi căn của
  bộ dữ liệu mẫu, When đọc bằng khuôn hay dựng thuộc tính căn, Then không bị từ chối oan.

## Coverage

Quét bằng morphological-scan, dựng trục riêng:

- Trục A — tầng đo: hàm dựng | khuôn | quan hệ giữa hai tầng [thước CE: SUY-TỪ-REPO `_acceptance/khuon-xac-nhan-danh-muc/review-findings.md`]
- Trục B — dạng mồi: câu tự do | số liền | số có dấu chấm | số có gạch | `+84` [thước CE: SUY-TỪ-REPO `packages/core/src/redaction/kiem-ro-ri.ts`, `DANG_MA_HOA`]
- Trục C — nguồn của chuỗi: người gõ | máy cấp | tập đóng [thước CE: NGÀNH phía Invest, dạng `bld_<ULID>` ở `docs/superpowers/specs/2026-11-03-danh-ba-xac-nhan-toan-quoc-design.md`]
- Trục D — đường mồi vào hàm dựng: danh mục | đầu vào [thước CE: SUY-TỪ-REPO `packages/core/src/confirmation/dung.ts`]

Core: A(hàm dựng)×UPI → AC-1 · quan hệ → AC-2 · D → AC-3, AC-4 · A(khuôn)×B×C → AC-5 · A(hàm dựng)×B×C → AC-6 · C(máy cấp) không oan → AC-7.
Later: siết khuôn chiều vào. Never: gỡ luật chặn chữ tự do để khoá thật qua.

## Đường đo

Ngưỡng của ô là câu «bật khi» của hàng: căn mã lạ bị từ chối ngay ở sàn (AC-1, AC-2); cấy trường rò thì phép quét đỏ
(AC-3, AC-4); chữ tự do hay dãy số dáng điện thoại bị phép quét cả lớp bắt (AC-5, AC-6). Số đo là kết quả eval máy.

## Out of scope

- Siết khuôn chiều vào `catalog-feed.ts` — khuôn v1 đã ghim, ngoài vùng.
- Ngoài-1 (thoả thuận đúng sàn) — hàng 97. Ngoài-2 (chép hằng), Ngoài-6 (ngày không có thật) — đã ghi hạn chế ở hàng 95.

## Notes

- Không đổi hình khuôn v1: chỉ thêm giá trị bị từ chối; tệp ví dụ giữ nguyên.
- Căn UPI lạ: sàn thấy báo sai bị từ chối với lý do «UPI ngoài dạng»; chỉ Invest sửa được nguồn (Hỏi-2).
- Phần dư của luật khoá máy cấp: số nhúng liền chữ trong một đoạn (`x0900000071`) vẫn qua khuôn (Hỏi-1).
- Câu hỏi Cổng Phạm vi: Hỏi-1 luật khoá máy cấp · Hỏi-2 căn UPI lạ (thiết kế §5).
