---
schema_version: 1
feature: "Người trong sàn mở Quỹ hàng và thấy đúng vỏ theo thiết bị và vai: trên máy tính thanh trên, cột nhà và cột góc nhìn; trên điện thoại bốn tab dưới; telesales chỉ Hôm nay và «+ Lead»"
slug: vo-ung-dung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, docs]
status: draft
design_doc: _acceptance/vo-ung-dung/design.md
---

# Acceptance Contract: vo-ung-dung

## Context

Hàng 53 của lộ trình: dựng vỏ chung mọi màn trước màn đầu tiên, đúng ADR-0002, `docs/design/vo-va-ia.md` mục 1 và
Tham chiếu §9. Vỏ máy tính là khối Pro `app-shell-8` đã chuyển thể; vỏ điện thoại ghép; nhà và nút theo vai đọc từ một
bảng thuần ở `packages/core`. Nội dung các nhà là của các hàng màn sau — ở đây mỗi nhà có trang giữ chỗ.

Source input: hàng 53 của `docs/plan/lo-trinh.json` · ô cơ hội `_acceptance/vo-ung-dung/opportunity.md` (ký `build`).

## Criteria

- AC-1: Given danh sách vai của một người ở sàn đang làm, When gọi bảng điều hướng của `packages/core`, Then nhà của cột
  (máy tính), tab dưới (điện thoại), nút thanh trên, nhà mở đầu và việc có ô gõ mã căn khớp đúng bảng Tham chiếu §9 cho
  từng vai trong năm vai; người nhiều vai nhận hợp các nhà và nút; người chỉ quản trị mở vào Cài đặt sàn, mọi người khác
  mở vào Hôm nay.
- AC-2: Given khổ máy tính (1440×900) và người đăng nhập mang vai Đầu chủ, Đầu khách, Trưởng nhóm, Quản trị sàn, When mở
  `/`, Then vỏ có thanh trên (ô «Gõ mã căn» giữa, đúng các nút + Lead · Nhập Excel · Phát hàng của vai, chuông, menu tài
  khoản có tên sàn, sáng/tối, đăng xuất) và cột biểu tượng có đúng các nhà của vai; bộ chọn sàn chỉ hiện với người thuộc
  hơn một sàn và đổi được sàn đang làm — sau khi đổi, tải lại trang và màn Người dùng vẫn ở sàn mới. (cross-layer)
- AC-3: Given khổ máy tính, When mở từng nhà, Then cột thứ hai đúng theo nhà — Bảng hàng: góc nhìn của đội, của tôi,
  «+ Lưu góc nhìn», chân cột độ tươi · Đã gửi: Link đã gửi, Lịch xem · Cài đặt sàn: các mục cài đặt, mục Người dùng mở
  được màn đã có · Hôm nay: không có cột; mặc định gập ở Bảng hàng, Hôm nay, hồ sơ căn và mở ở Đã gửi, Cài đặt sàn;
  người mở hay gập một nhà thì tải lại trang vẫn giữ đúng như vậy cho nhà đó.
- AC-4: Given người chỉ mang vai Telesales, When mở app ở khổ máy tính và khổ 375×812, Then máy tính: không cột nhà,
  không ô gõ mã căn, thanh trên chỉ có Hôm nay và «+ Lead»; điện thoại: đúng ba tab Hôm nay · Lead · Tôi; phím ⌘K và `/`
  không mở gì.
- AC-5: Given khổ 375×812 và người mang vai Đầu chủ, Đầu khách, Trưởng nhóm, When mở `/`, Then không có cột nhà; thanh
  trên mảnh có tên nhà, nút gõ mã căn (theo AC-1) và chuông; thanh tab dưới cố định có Hôm nay · Bảng hàng · Gửi · Tôi theo vai, tab
  đang mở mang `aria-current="page"`; không có Đội, Cài đặt sàn, Nhập Excel, Phát hàng; cùng địa chỉ mở ở hai khổ cho
  cùng màn; người chỉ Quản trị sàn thấy tab theo Hỏi-2 đã chốt ở Cổng Phạm vi, mỗi tab mở một trang trong vỏ.
- AC-6: Given người có ô gõ mã căn, When nhấn ⌘K (hoặc `/` khi không ở ô nhập, hoặc bấm nút trên thanh) rồi gõ một mã căn
  và Enter, Then địa chỉ thành `/units/<mã>` và màn hồ sơ căn hiện đúng mã đó trong vỏ; gõ tên một nhà rồi Enter thì nhảy
  tới nhà đó; Esc đóng.
- AC-7: Given chưa đăng nhập hay đang ở màn đăng nhập, chọn sàn, chưa gắn sàn, trang khách `/s/<mã>`, When mở các địa chỉ
  đó, Then không có thanh trên, cột nhà hay tab dưới của vỏ; khi đã đăng nhập và có sàn, `/` chuyển tới nhà mở đầu của
  vai theo AC-1.
- AC-8: Given mỗi nhà và mỗi tab mà vỏ hiện cho bất kỳ vai nào, When bấm, Then địa chỉ mở một trang trong vỏ (không 404):
  nhà chưa có màn hiện Frame với `Empty` nói nhà này dựng ở hàng nào; màn Người dùng đã có vẫn chạy như trước trong vỏ.
- AC-9: Given cây sau hàng này, When chạy kiểm kiểu, lint (gồm mười luật `quy-hang-ui`, mức nợ 0, kiểm chuẩn danh mục)
  và sàn thiết kế M1, Then đều xanh; và vỏ ở cả sáng lẫn tối, hai khổ, đọc được (chữ không chìm, viền thấy được).
- AC-10: Given PR của hàng này, When người duyệt đọc `docs/design/vo-va-ia.md`, `.agents/skills/quy-hang-ui/catalog.md`
  và `docs/product/tham-chieu.md`, Then thấy `app-shell-8` ghi là khối đã chuyển thể kèm đổi gì, thanh tab dưới ở «Chỗ
  hở», và mọi đường dẫn mới mà vỏ dùng (vd tab Tôi, Lead) có dòng trong bảng đường dẫn §9. (judgment)

## Đường đo

Ngưỡng của ô cơ hội: «Năm vai mẫu × hai bề rộng đúng bảng nhà và nút của Tham chiếu §9; gõ mã căn mở hồ sơ; trang
khách và đăng nhập không có vỏ; sáng và tối đều đọc được».

- Thước: năm vai × máy tính · số từ: ảnh và observed của E3 (bốn vai), E5 (Telesales) · bảo đảm bởi: AC-2, AC-4
- Thước: năm vai × điện thoại · số từ: E6 (Đầu chủ, Đầu khách, Trưởng nhóm, chỉ Quản trị), E5 (Telesales) · bảo
  đảm bởi: AC-4, AC-5
- Thước: đúng bảng §9 · số từ: E1 (ma trận 5 vai × 5 trường) · bảo đảm bởi: AC-1
- Thước: gõ mã căn mở hồ sơ · số từ: E2, E7 · bảo đảm bởi: AC-6
- Thước: không vỏ ở trang khách và đăng nhập · số từ: E8 · bảo đảm bởi: AC-7
- Thước: sáng và tối đọc được · số từ: E13 (tỉ lệ tương phản) · bảo đảm bởi: AC-9

## Coverage

Quét bằng morphological-scan (preset test-matrix, rút gọn), ba trục:

- Trục A — vai: Telesales · Đầu chủ · Đầu khách · Trưởng nhóm · Quản trị sàn · nhiều vai · nhiều sàn [thước CE: bảng
  vai của Tham chiếu §9 và Thành viên sàn của CONTEXT.md]
- Trục B — khổ: máy tính 1440 · điện thoại 375 [thước CE: ADR-0002 «một mã, hai vỏ theo bề rộng»]
- Trục C — vùng vỏ: thanh trên · cột nhà · cột thứ hai · tab dưới · gõ mã căn · không vỏ · trang giữ chỗ · sáng/tối
  [thước CE: `vo-va-ia.md` mục 1 bảng vùng ↔ thành]
- Core: bảng thuần cho mọi vai (AC-1); A×B ở máy tính (AC-2, AC-4) và điện thoại (AC-4, AC-5); cột thứ hai (AC-3); gõ mã
  căn (AC-6); không vỏ (AC-7); giữ chỗ (AC-8); sáng/tối và lint (AC-9); tài liệu (AC-10).
- Later: bộ chọn dự án (chờ danh mục dự án) · dữ liệu thật cho góc nhìn, độ tươi, thông báo · khổ tablet riêng.
- Never: route riêng cho điện thoại (ADR-0002 mục 4).

## Out of scope

- Nội dung các nhà (Hôm nay, Bảng hàng, Đã gửi, Đội, Cài đặt sàn ngoài Người dùng, Lead, Tôi, hồ sơ căn) — các hàng màn.
- Chặn quyền vào trang theo vai: vỏ chỉ không hiện lối; trang tự chặn ở hàng của nó.
- Bộ chọn dự án — chưa có danh mục dự án trong kho; hiện khi kết nối danh mục về.
- Lưu, sửa góc nhìn; tính độ tươi; nguồn thông báo.
- Đổi tên đường màn đăng nhập (việc của dãy Q, hàng doi-ten-api-tieng-anh).

## Notes

- Dữ liệu mẫu cho bài nhìn: năm người mẫu một vai, một người nhiều vai, một người hai sàn — tên `[Tên]`, email
  `*@example.test`, dựng bằng `_acceptance/vo-ung-dung/thu/vai-mau.mjs` trên Postgres của dãy G (5546).
- Danh sách cài thêm của hàng (S3 cập nhật nếu cài thêm): khối `app-shell-8` và các phụ thuộc nó kéo theo chưa có trên
  đĩa — `@reui/rating`, shadcn `card`.
- Chốt ở Cổng Phạm vi (điền khi duyệt): Hỏi-2 — tab điện thoại của người chỉ Quản trị sàn; Hỏi-3 — ai có ô gõ mã căn.
  §9 ghi lại đúng hai điều này trong cùng PR.
