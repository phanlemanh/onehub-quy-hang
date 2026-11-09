---
schema_version: 1
feature: "Khi đọc danh sách căn ngoài khu bị lỗi mà máy chưa có bản giữ, Bảng hàng báo lỗi và có nút Thử lại, không âm thầm hiện các căn ngoài khu là «Chưa rõ»."
slug: va-loi-doc-can-ngoai-khu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
design_doc: docs/superpowers/specs/2026-11-09-va-loi-doc-can-ngoai-khu-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-09T10:03:59Z
---

# Acceptance Contract: va-loi-doc-can-ngoai-khu

## Context

Ngoài-7 của hàng 79 (`_acceptance/bang-hang-theo-loai-hinh/`), chủ kho chọn «mở hợp đồng mới» 08/11. Mọi lỗi đọc danh sách căn ngoài khu bị gộp thành không có dữ liệu, nên máy chưa có bản giữ thì căn ngoài khu hiện «Chưa rõ» mà không ai biết lần đọc đã hỏng. Không chạm bất biến nào; không đổi dữ liệu, API.

## Criteria

- **AC-1** — Đọc lỗi thì báo.
  Given Bảng hàng có hàng ngoài khu, máy không có bản giữ hoặc bản giữ hỏng,
  When lần đọc danh sách căn ngoài khu mất mạng, máy chủ trả 4xx hay 5xx, hoặc trả thân không đúng khuôn,
  Then Bảng hàng hiện đúng câu «Chưa đọc được danh sách căn ngoài khu — loại hình và địa chỉ của các căn này có thể thiếu» kèm nút Thử lại, và các hàng vẫn hiện trên bảng.

- **AC-2** — Thử lại.
  Given bảng đang báo lỗi đọc căn ngoài khu,
  When bấm Thử lại,
  Then mỗi lần bấm đọc đúng một lần, đang đọc thì khối báo còn; đọc được: báo mất, hàng ngoài khu hiện đúng loại hình và địa chỉ đã gõ, bản giữ trên máy được ghi; vẫn lỗi: báo còn, nút vẫn bấm được.

- **AC-3** — Có bản giữ thì không báo.
  Given lần đọc lỗi và máy có bản giữ đọc được, kể cả bản giữ rỗng hay thiếu căn,
  When Bảng hàng dựng,
  Then không có khối báo về căn ngoài khu; hàng có trong bản giữ hiện đúng theo bản giữ.

- **AC-4** — Không có hàng ngoài khu thì không báo.
  Given bảng không có hàng ngoài khu nào,
  When lần đọc lỗi,
  Then không có khối báo nào về căn ngoài khu.

- **AC-5** — Một vùng một báo.
  Given danh bạ thành viên và danh sách căn ngoài khu cùng đọc lỗi, hoặc chỉ danh bạ lỗi,
  When Bảng hàng dựng khối báo,
  Then cùng lỗi: đúng một khối với câu «Chưa đọc được danh bạ thành viên và danh sách căn ngoài khu — cột Đầu chủ và các căn ngoài khu có thể thiếu thông tin», một nút, bấm thì đọc lại cả hai; chỉ danh bạ lỗi: chữ báo bằng đúng chữ hôm nay.

- **AC-6** — Trên màn đang chạy.
  Given sàn mẫu có căn ngoài khu dựng bằng đường ghi thật, máy chưa có bản giữ, máy tính 1440 × 900,
  When lần đọc bị ngắt mạng, mở Bảng hàng, chờ, bấm Thử lại khi vẫn ngắt, rồi bỏ ngắt và bấm Thử lại; tải lại trang khi lại ngắt mạng; một ca máy chủ trả 500; và một ca ngắt cả danh bạ,
  Then khối báo và nút hiện trong khung nhìn, lúc chờ không có lần đọc thêm, bấm khi vẫn ngắt thì báo còn; bỏ ngắt và bấm thì báo mất, hàng ngoài khu hiện đúng loại hình, địa chỉ; tải lại khi ngắt thì không báo và hàng vẫn đúng theo bản giữ; ca 500 có khối báo; ca ngắt cả danh bạ có đúng một khối báo.

## Coverage

- Trục A — kết quả lần đọc: xong (AC-2) | mất mạng, 4xx, 5xx, thân sai khuôn (AC-1). [thước CE: bốn nhánh lỗi của `docDanhBa`, khuôn trả về đã khai của `GET /api/v1/off-compound-units`]
- Trục B — bản giữ trên máy: vắng, hỏng (AC-1) | đủ, rỗng, thiếu căn (AC-3). [thước CE: các nhánh của `docBanGiuNgoaiKhu`]
- Trục C — bảng có hàng ngoài khu: có (AC-1) | không (AC-4). [thước CE: khoá `offCompoundUnitId` của dòng hàng]
- Trục D — lỗi đọc khác cùng vùng: không (AC-1) | danh bạ cùng lỗi, chỉ danh bạ lỗi (AC-5). [thước CE: khối báo lỗi đang có ở `bang-hang.tsx`]

## Đường đo

- Thước: giả lỗi mạng hay 5xx ở lần đầu trên máy mới thì hiện câu báo và nút Thử lại, bấm khi mạng về thì căn ngoài khu hiện đúng · số từ: bộ kiểm web và màn đang chạy · bảo đảm bởi: AC-1, AC-2, AC-6

## Out of scope

- Tự đọc lại khi mạng về: thuộc khối báo lỗi vùng của Mẫu hành vi (ADR-0024 sửa đổi 09/11); hàng này chỉ có nút Thử lại.
- Báo lỗi ở cột hồ sơ căn và bảng thẻ điện thoại: câu giao chỉ nói Bảng hàng.
- Bản giữ rỗng hay cũ thiếu căn mà đọc lỗi: căn thiếu vẫn hiện «Chưa rõ» không báo, câu giao chỉ nói máy chưa có bản giữ.
- Đọc danh mục (`useDanhMuc`) lỗi: cùng dạng nhưng chạm nhiều màn, không thuộc Ngoài-7.
- Đầu cột hồ sơ hàng lô và hàng ngoài khu không mã (Ngoài khác của hàng 79).

## Notes
