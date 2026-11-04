---
schema_version: 1
feature: Mọi người dùng có một khu Cài đặt — nhóm Cá nhân ai cũng thấy, nhóm Sàn chỉ quản trị; hai đường vào; nội dung bề rộng đọc cạnh cột mục lục
slug: cai-dat-hop-nhat
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
design_doc: _acceptance/cai-dat-hop-nhat/design.md
approved_by: Manh Phan
approved_at: 2026-11-04
---

# Acceptance Contract: cai-dat-hop-nhat

## Context

Hàng `cai-dat-hop-nhat` của lộ trình (dãy H, đợt `dau-khach-nhap`). Đứng sau hàng 38 (tab Tôi) và hàng `vo-ung-dung` (cột
nhà, Cài đặt sàn). Ô cơ hội: `opportunity.md` (chủ kho chọn làm 04/11). Đổi ba quyết định đã niêm, mỗi quyết định sửa
bằng mục sửa đổi: vỏ 31/10, Tham chiếu §9, ADR-0024 (`design.md` §5).

## Criteria

- AC-1: Given một người mang bất kỳ tổ hợp vai nào, When vỏ dựng cột nhà trên máy tính, Then người có cột nhà (mọi vai trừ
  người chỉ là telesales) có nhà «Cài đặt» đứng ở đáy cột, nhãn «Cài đặt»; người chỉ là telesales không có cột nhà như cũ.
- AC-2: Given nhà Cài đặt đang mở trên máy tính, When cột thứ hai dựng, Then cột có nhóm «Cá nhân» với mục «Cá nhân» cho
  mọi vai; nhóm «Sàn [tên sàn đang làm]» với bảy mục sàn (Người dùng · Cách gọi · Trường riêng · Trạng thái · Luật chia
  lead · Thuế phí · Mẫu nhập) chỉ có khi người mang vai Quản trị sàn ở sàn đang làm. Người không mang vai ấy (kể cả người
  là quản trị ở một sàn khác) KHÔNG thấy nhóm «Sàn» nào trong cột.
- AC-3: Given người đã đăng nhập, When vào Cài đặt bằng từng đường vào, Then:
  - biểu tượng Cài đặt mở `/settings/users` với quản trị sàn, `/settings/personal` với vai khác;
  - menu tài khoản có mục «Cá nhân» mở `/settings/personal` cho mọi vai; người mang vai Quản trị sàn có thêm mục «Cài
    đặt sàn» mở `/settings/users`;
  - tab «Tôi» trên điện thoại mở `/settings/personal`, nhãn vẫn «Tôi» và đang chọn khi ở đó;
  - địa chỉ `/me` chuyển về `/settings/personal`.
- AC-4: Given mục «Cá nhân» mở, When màn dựng, Then đầu màn có đường dẫn «Cài đặt › Cá nhân». Thân là đúng sáu nhóm dòng
  của màn Tôi, theo thứ tự hồ sơ · sàn · cài · thông báo · máy · đăng xuất, cùng hành vi «Báo mất máy» và «Đăng xuất» của
  hàng 38. Không có bản nội dung thứ hai.
- AC-5: Given người không mang vai Quản trị sàn ở sàn đang làm, When mở thẳng địa chỉ một mục sàn (`/settings/users`
  hay một mục sàn khác), Then máy chủ chuyển về `/settings/personal` và đầu màn hiện câu báo «Mục này chỉ quản trị sàn mở
  được» (Hỏi-1, viết theo khuyến nghị). Không màn mục sàn nào dựng cho người ấy. Mở `/settings` thì vào thẳng Cá nhân,
  không câu báo.
- AC-6: Given một mục Cài đặt mở, When đọc đầu màn, Then:
  - mục «Cá nhân» ghi «Áp cho tài khoản của bạn ở mọi sàn»;
  - mỗi mục sàn ghi «Chỉ áp cho sàn [tên sàn đang làm]», đường dẫn «Cài đặt › Sàn [Tên] › mục»;
  - dòng «Cài lên màn hình chính» và «Thông báo lead» ghi thêm «trên máy này».
- AC-7: Given một màn bố cục Đọc (mục Cài đặt, Cá nhân, Ô nhận lead, trang tạm) trên máy tính rộng 1440, When màn dựng, Then thân rộng không quá 48rem (768px), mép trái
  của thân sát mép trái vùng nội dung (cạnh cột mục lục, không căn giữa). Nhãn và nút của một dòng Cá nhân cách nhau không
  quá 768px. Trên điện thoại 390 thân giữ một cột đủ bề rộng như cũ.
- AC-8: Given người dùng điện thoại, When thanh tab dưới dựng, Then người chỉ mang vai Quản trị sàn có tab «Cài đặt sàn»
  (mở `/settings/users`) và «Tôi» (mở `/settings/personal`). Tab đang chọn theo đường: Cá nhân → «Tôi», mục sàn → «Cài đặt
  sàn», không bao giờ cả hai. Vai khác không có tab hay mục sàn nào trên điện thoại. Tab «Tôi» có cho mọi vai.
- AC-9: Given ba quyết định đã niêm bị đổi, When đọc tài liệu trong cùng PR, Then mỗi quyết định có một mục sửa đổi ghi
  ngày 04/11 và trỏ hồ sơ `cai-dat-hop-nhat`, không viết đè chữ cũ:
  - `docs/design/vo-va-ia.md`;
  - `docs/adr/0024-he-bo-cuc.md`;
  - Tham chiếu §9 (bảng vai và nhà) cùng một dòng §12.

  `CONTEXT.md` có nhãn «Cài đặt» và «Cá nhân».

## Out of scope

- Nhóm «Cá nhân» có thêm mục mới (giao diện sáng/tối, ngôn ngữ, tên hiển thị): hàng sau. Bản này dựng lại đúng sáu nhóm
  dòng của hàng 38.
- Nội dung thật của sáu mục sàn còn là trang tạm (Cách gọi, Trường riêng, …): thuộc hàng 45–50. Hàng này chỉ đổi đường dẫn và
  phạm vi ghi ở đầu màn.
- Cột nhà cho telesales: không đổi, telesales vào qua menu tài khoản.
- Mục sàn trên điện thoại cho người có thêm vai khác ngoài Quản trị sàn: giữ quyết định Hỏi-2 của vỏ.
- API Cài đặt sàn (hàng 82, dãy D): hàng này chỉ giao diện, không đổi API.

## Đường đo

- Ngưỡng SỐNG «tới đúng mục trong tối đa hai lần bấm từ cả hai đường vào» (ô cơ hội): số lần bấm đo ở phiên nghiệm thu;
  trước đó E11 đếm số lần bấm theo ma trận vai × đường vào × mục đích (một mục Cá nhân, một mục sàn) trên máy tính — AC-3.
  Trên điện thoại mục sàn chỉ có ở người chỉ quản trị (AC-8), nên việc sàn giao cho người dự làm trên máy tính.
- Ngưỡng «khối nội dung không rộng quá 48rem» — E7 (bố cục), E11 (bề rộng đo trên màn thật) — AC-7.
- Ngưỡng CHẾT «vai không phải quản trị nhìn thấy mục cài đặt sàn» — E2, E5, E11 — AC-2, AC-5.

## Coverage

- Trục vai: telesales · đầu chủ · đầu khách · trưởng nhóm · quản trị sàn · quản trị kèm vai khác — AC-1, AC-2, AC-3, AC-5,
  AC-8.
- Trục đường vào: cột nhà · menu tài khoản · tab Tôi · địa chỉ cũ `/me` · gõ thẳng địa chỉ mục sàn — AC-3, AC-5.
- Trục khổ: máy tính 1440 · điện thoại 390 — AC-7, AC-8.
- Trục phạm vi: tài khoản xuyên sàn · sàn đang làm · máy này — AC-6.
- Trục bố cục Đọc: Cá nhân · mục sàn · Ô nhận lead · trang tạm — AC-7.
- Trục tài liệu: ba quyết định đã niêm + từ vựng — AC-9.

## Notes

- Lựa chọn máy đã quyết: `design.md` §6; sổ quyết định dòng S1.
- Ngoài-1 (đăng xuất lỗi máy chủ, chủ kho chọn mở hợp đồng mới) → dang-nhap-mat-khau, luật 55 (giám sát trả H-19).
- Known limits — chọn ở Cổng Bằng chứng 2026-11-04:
  - Ngoài-2: Báo mất máy xong mà tải lại danh sách máy lỗi thì màn vẫn hiện danh sách cũ, không báo; tải lại trang thì đúng.
  - Ngoài-3: Bài kiểm chặn mục sàn chưa thử riêng từng đường vào và thiếu tổ hợp telesales kèm đầu chủ.
  - Ngoài-4: Bài kiểm câu báo «Mục này chỉ quản trị sàn mở được» chỉ đọc mã, chưa dựng trang có và không có tham số.
  - Ngoài-5: Bài quét chống chép lại nhãn sáu nhóm ngoài màn Tôi chưa có đối chứng chứng minh nó bắt được vi phạm.
  - Ngoài-6: Bài kiểm «trên máy này» đọc mã nguồn, chưa dựng dòng thật; dòng hồ sơ hay máy ghi nhầm có thể lọt.
- Ngoài-1 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Nếu máy chủ gặp lỗi lúc đăng xuất, người dùng vẫn thấy mình đã ra màn đăng nhập nhưng tài khoản có thể vẫn còn mở. Trên máy dùng chung, người kế tiếp có thể vào thẳng tài khoản cũ. — `apps/web/src/components/shell/dang-xuat-tren-may.ts`
- Ngoài-2 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Sau khi báo mất máy, nếu việc tải lại danh sách máy bị lỗi thì màn vẫn hiện danh sách cũ. Người dùng có thể tưởng các máy kia chưa bị đăng xuất. — `apps/web/src/app/(app)/me/toi-that.tsx`
- Ngoài-3 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Bài kiểm phân quyền mục sàn chưa thật sự thử từng đường vào và thiếu một tổ hợp vai. Nếu sau này có lỗi riêng ở một đường, bài kiểm có thể không bắt được. — `apps/web/src/app/(app)/settings/cai-dat.test.ts`
- Ngoài-4 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Bài kiểm chưa chứng minh được câu báo «Mục này chỉ quản trị sàn mở được» hiện đúng lúc và ẩn đúng lúc. Nếu có lỗi đọc nhầm điều kiện, người dùng có thể thấy câu báo sai chỗ mà bài kiểm vẫn xanh. — `apps/web/src/app/(app)/settings/cai-dat.test.ts`
- Ngoài-5 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Bài kiểm chống việc chép lại nhãn sáu nhóm ở nhiều nơi có thể không bắt được vi phạm thật. Về sau nhãn có thể lệch nhau giữa các màn mà không ai hay. — `apps/web/src/app/(app)/settings/cai-dat.test.ts`
- Ngoài-6 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Bài kiểm chưa chắc bắt được trường hợp dòng hồ sơ hay dòng máy bị ghi nhầm «trên máy này». Nếu có, người dùng sẽ đọc nhầm phạm vi của cài đặt đó. — `apps/web/src/app/(app)/settings/cai-dat.test.ts`
