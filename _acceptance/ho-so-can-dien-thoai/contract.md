---
schema_version: 1
feature: "Đầu khách mở hồ sơ căn trên điện thoại và thấy giá, ảnh gửi được, lần xác nhận gần nhất; phần chủ nhà thay bằng «Liên hệ đầu chủ»"
slug: ho-so-can-dien-thoai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api, docs]
status: implemented
approved_by: Manh Phan
approved_at: 2026-11-04
design_doc: docs/superpowers/specs/2026-11-03-ho-so-can-dien-thoai-design.md
---

# Acceptance Contract: ho-so-can-dien-thoai

## Context

Hàng 33 của lộ trình (màn P0 M3, phủ K3), dựng trên hàng 17 (hồ sơ căn) và 32 (bảng thẻ mở hồ sơ toàn màn). Quyền là lớp
phủ trên cùng một màn (Tham chiếu §4): Đầu khách mở đúng hồ sơ căn đang có, phần chỉ người giữ căn thấy vắng, thay bằng
nút hỏi đầu chủ. Nhãn nút theo Hỏi-2 (khuyến nghị «Hỏi đầu chủ»; tiêu chí dưới viết «nút hỏi đầu chủ»). Bản dựng lại theo
`product-detail-5` và «Xin dẫn xem» là hàng khác.

Source input: hàng 33 của `docs/plan/lo-trinh.json` · ô cơ hội `_acceptance/ho-so-can-dien-thoai/opportunity.md` (ký
`build` 02/11) · yêu cầu B-4, B-5, B-6 (Hỏi-1…4) gửi giám sát.

## Criteria

- AC-1: Given Đầu khách mẫu ở khổ 375×812, When chạm một thẻ Đang bán trên Bảng hàng thẻ (và khi mở thẳng `/units/<mã>`),
  Then hồ sơ toàn màn hiện mã căn, giá dạng «4,65 tỷ» kèm điều kiện phí, dòng lần xác nhận («Xác nhận N ngày trước» hay
  «Chưa xác nhận với chủ nhà»), thuộc tính căn và lần rao; trang không cuộn ngang.
- AC-2: Given hồ sơ ở AC-1, When nhìn mục Ảnh, Then có ngăn «Gửi được» (ảnh bìa đứng đầu) và «Tự có từ mã»; ngăn «Nội bộ»
  theo Hỏi-4 (khuyến nghị: không có — không thẻ ngăn, không ổ khoá, không lời «chỉ người giữ căn…»); không nút thêm, xoá, kéo
  ảnh; không thân trả về nào chở ảnh ngăn nội bộ.
- AC-3: Given hồ sơ ở AC-1 của một căn mà Đầu khách không giữ, When nhìn toàn hồ sơ, Then không có nút «Sẵn sàng bán», không
  ô sửa lần rao hay ảnh; «Báo sai thông tin căn» vẫn có; không chữ nào là tên chủ nhà, số chủ nhà, giá đáy hay ảnh sổ — cả
  trong trang lẫn mọi thân trả về mạng của lượt mở. (cross-layer)
- AC-4: Given hồ sơ ở AC-1 của căn có đầu chủ giữ, When nhìn đáy màn rồi chạm nút hỏi đầu chủ, Then nút dính đáy mang tên đầu
  chủ giữ căn; chạm nút mở bảng chia sẻ của máy (không gửi gì tự động) với tin «Hỏi về căn <mã> · <toà>» và đường tới hồ sơ
  trong sàn; máy không có bảng chia sẻ thì tin được chép và hiện «Đã chép tin hỏi»; căn chưa ai giữ thì nút mờ với chữ «Căn
  chưa có đầu chủ giữ»; mất mạng thì hồ sơ hiện từ kho trên máy, nút không tên vẫn mở bảng chia sẻ với cùng tin.
- AC-5: Given API của sàn, When người không thấy nguồn (Đầu khách; Đầu chủ không giữ căn) gọi `GET /api/v1/listings/{id}/owner`,
  Then trả `visible: false`, `listingAgentUserId` và `listingAgentName` (tên người dùng của đầu chủ giữ căn, `null` khi chưa
  ai giữ) và không khoá nào của lớp `source` hay email, số của đầu chủ; người thấy nguồn nhận như trước; người sàn khác nhận
  từ chối như trước. (cross-layer)
- AC-6: Given Đầu chủ giữ căn và Trưởng nhóm mở cùng hồ sơ ở khổ 375 và 1440, When nhìn hồ sơ, Then thấy như trước hàng này:
  ngăn Nội bộ, nút Sẵn sàng bán khi căn đủ điều kiện, sửa ảnh; không có nút hỏi đầu chủ; Đầu chủ không giữ căn thấy nút hỏi và
  ngăn Nội bộ theo Hỏi-4.
- AC-7: Given cây sau hàng này, When chạy bài quét khuôn, Then `/units/<mã>` và hai trang mẫu của nhóm Hồ sơ căn dựng qua bố
  cục Hồ sơ, ba dòng `ngoai_le_han` của nhóm đã rời bản đồ khuôn, và quét khuôn không lệch.
- AC-8: Given cây sau hàng này, When chạy kiểm kiểu, lint (luật `quy-hang-ui`, mức nợ 0, kiểm chuẩn) và sàn thiết kế M1,
  Then đều xanh; và khi người duyệt đọc `docs/product/tham-chieu.md`, `CONTEXT.md`, `design/patterns/ho-so-can.md`, thấy §12
  có dòng của hàng này, nhãn nút khớp lời chủ kho ở Hỏi-2 ở mọi chỗ, và bản đồ khuôn nói hồ sơ Đầu khách là lớp phủ trên
  cùng khuôn. (judgment)

## Đường đo

Ngưỡng của ô cơ hội (đề xuất, chưa số): «Thời gian khách hỏi → gửi được căn» (Tham chiếu §11) — đo ở hai tuần thử khi có
Gửi (34). Hàng này giao bước «xem đủ một căn / hỏi đầu chủ».

- Thước: Đầu khách xem đủ căn mà không thấy nguồn · số từ: E1, E4, E6, E7, E8 · bảo đảm bởi: AC-1, AC-2, AC-3
- Thước: hỏi được đầu chủ · số từ: E2, E3, E5, E9 · bảo đảm bởi: AC-4, AC-5

## Coverage

Quét bằng morphological-scan (preset entity-feature), ba trục:

- Trục A — người xem: Đầu khách · Đầu chủ giữ căn · Đầu chủ không giữ · Trưởng nhóm · người sàn khác [thước CE: Tham chiếu
  §4 bảng quyền; `canSeeSource`]
- Trục B — phần hồ sơ: đầu (mã, giá, phí, lần xác nhận) · ảnh ba ngăn · thuộc tính · lần rao + Sẵn sàng bán · lịch sử ·
  phần chủ nhà / nút hỏi [thước CE: `cot-ho-so-can.tsx` các mục; Tham chiếu §4 «phần chủ nhà thay bằng…»]
- Trục C — tình huống căn và máy: có đầu chủ giữ · chưa ai giữ · chưa xác nhận · mất mạng · máy không có bảng chia sẻ [thước
  CE: ngành RESO `ListAgentKey`; hàng 13 kho trên máy]
- Core: A × B ở AC-1, AC-2, AC-3, AC-6; nút hỏi × C ở AC-4, AC-5; bố cục ở AC-7.
- Later: dựng lại theo `product-detail-5` (hàng riêng cho 33, 40–41) · «Xin dẫn xem» (P1, chờ phỏng vấn) · số điện thoại
  nhân viên · thông báo trong ứng dụng tới đầu chủ.
- Never: Đầu khách thấy chủ nhà, số chủ, giá đáy, ảnh sổ (bất biến 2).

## Out of scope

- Dựng lại hồ sơ điện thoại theo khối `product-detail-5`.
- «Xin dẫn xem» và lịch xem.
- Thanh «n căn · Xem trước · Gửi» — hàng 34.
- Lưu số điện thoại nhân viên; gửi tin thay người.

## Notes

- Chạm ngoài vùng khai của hàng (`apps/web/src/app/units/mobile/**` không có trên cây): vùng thật khai lại ở Cổng Phạm vi —
  `apps/web/src/app/(app)/units/ho-so`, `units/photos`, `units/[code]`, `proto/cot-ho-so-can`, `proto/anh-can-ba-ngan`,
  `packages/core/src/access`, `packages/api/src/owners`, `design/patterns/ho-so-can.md`.
