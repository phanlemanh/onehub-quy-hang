---
schema_version: 1
feature: "Hồ sơ liên hệ nằm trong cùng khung cột của hồ sơ căn (một khung có viền, cuộn riêng, có nút Đóng và Esc), bảng liên hệ giữ đủ cột và tên cột đứng yên khi hồ sơ mở, dòng đang mở được tô — và lưới khuôn bắt được khi cột phụ thiếu khung; mở màn liên hệ thì bảng hiện cùng lúc với màn — trang đầu lấy sẵn ở máy chủ, không chờ thêm trước khi hỏi danh sách"
slug: khung-ho-so-lien-he
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: docs/superpowers/specs/2026-11-08-khung-ho-so-lien-he-design.md
approved_by:
approved_at:
---

# Acceptance Contract: khung-ho-so-lien-he

## Context

Bản kiểm `docs/plan/kiem-chi-tiet-lien-he.md` (06/11): hồ sơ liên hệ thiếu khung cột của hồ sơ căn, máy tính không đóng
được, bảng mất hai cột khi hồ sơ mở, tên cột trôi khi cuộn, dòng đang mở không tô, lint không bắt; bảng hiện chậm vì màn
chờ dựng xong rồi chờ thêm 0,25 s mới hỏi danh sách. Hàng vá giao diện và tốc độ, chỉ web và bộ kiểm khuôn — T2. Thiết
kế: `docs/superpowers/specs/2026-11-08-khung-ho-so-lien-he-design.md`. Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`.

## Criteria

### AC-1: Hồ sơ liên hệ trong khung cột chung
- **Given** Đầu chủ hay Trưởng nhóm ở màn Liên hệ, khổ máy tính
- **When** chạm một dòng (cả lúc hồ sơ đang tải và lúc lỗi)
- **Then** hồ sơ nằm trong một khung có viền cao hết cột, thân cuộn riêng — cùng thành phần khung (`KhungHoSo` kiểu cột
  phụ) mà hồ sơ căn cạnh Bảng hàng dùng

### AC-2: Đóng bằng nút và Esc
- **Given** hồ sơ liên hệ đang mở ở khổ máy tính
- **When** bấm nút «Đóng hồ sơ» ở đầu hồ sơ, hay nhấn Esc khi không có hộp, menu hay ô nhập nào đang dùng phím
- **Then** hồ sơ đóng, bảng chiếm lại cả vùng; Esc trong ô tìm hay trong menu, hộp đang mở không đóng hồ sơ (Hỏi-2)

### AC-3: Bảng giữ đủ cột khi hồ sơ mở
- **Given** hồ sơ đang mở ở 1440 (cột hồ sơ 38%)
- **When** nhìn bảng
- **Then** bảng có đủ các cột Người · Người giữ · Cơ hội mở · Căn, không thanh cuộn ngang; cột Loại trùng thông tin dưới
  tên đã bỏ

### AC-4: Tên cột đứng yên, dòng đang mở được tô
- **Given** danh sách dài hơn khung nhìn, một hồ sơ đang mở
- **When** cuộn bảng
- **Then** tiêu đề khung, ô tìm và hàng tên cột đứng yên, chỉ thân bảng cuộn; dòng của người đang mở mang dấu chọn

### AC-5: Hồ sơ căn không đổi
- **Given** hồ sơ căn mở cạnh Bảng hàng
- **When** so trước và sau vòng
- **Then** khung hồ sơ căn dựng ra cùng lớp, cùng thuộc tính như trước (so HTML), ảnh 1440 không đổi bố cục

### AC-6: Lưới khuôn bắt cột phụ thiếu khung
- **Given** bản đồ khuôn nhóm `lien-he` khai `khe_boc: { cotPhu: KhungHoSo }`
- **When** `vung.tsx` truyền cột phụ không bọc `KhungHoSo`
- **Then** lưới khuôn lệch, nêu tệp, khe và thành phần phải bọc; cây hiện tại 0 lệch

### AC-7: Bảng hiện cùng màn
- **Given** người mở `/contacts` (có hay không `?type=`, `?status=`)
- **When** máy chủ trả trang
- **Then** HTML máy chủ trả đã chứa dòng đầu của danh sách đúng bộ lọc URL; màn không gọi lại danh sách lần đầu; đổi bộ
  lọc hỏi ngay, chỉ gõ ô tìm mới chờ 250 ms

### AC-8: Nhìn thấy trên màn thật
- **Given** sàn mẫu, Trưởng nhóm đăng nhập
- **When** mở Liên hệ, chạm một người ở 1440 rồi ở 375, sáng
- **Then** ảnh cho thấy khung có viền, nút Đóng, đủ cột, dòng tô, tên cột dính khi cuộn; Esc đóng; 375 không vỡ

## Coverage

Quét tay theo khuôn morphological-scan (preset entity-feature) trên các trục của bản kiểm:

- Trục **lỗi của bản kiểm**: 1 khung · 2 đóng · 3 mất cột · 4 trôi tên cột · 5 dòng không tô · 6 loại hai lần [thước CE:
  bảng lỗi `docs/plan/kiem-chi-tiet-lien-he.md`] — AC-1..AC-4; lỗi 7, 8, 9 ngoài vòng
- Trục **trạng thái hồ sơ**: đang tải | lỗi | xong [thước CE: `TrangThaiHoSo`] — AC-1
- Trục **khổ**: 1440 | 375 [thước CE: bản kiểm] — AC-3, AC-8
- Trục **tốc độ**: mở màn | đổi bộ lọc | gõ ô tìm [thước CE: mục «Tốc độ tải»] — AC-7
- Trục **khuôn chung**: hồ sơ liên hệ | hồ sơ căn | lưới khuôn [thước CE: `KhungHoSo`, `KhungHoSoCan`, `ban-do.mjs`] — AC-1,
  AC-5, AC-6

## Đường đo

Ngưỡng SỐNG ở `opportunity.md` (chép từ `bat_khi` của hàng). Mỗi vế trỏ tiêu chí và bài đo:
- khung có viền, cuộn riêng, Đóng và Esc — AC-1, AC-2 · E1, E2, E8;
- bảng đủ cột, tên cột dính, dòng tô — AC-3, AC-4 · E3, E4, E8;
- ảnh hồ sơ căn không đổi — AC-5 · E5, E8;
- lưới khuôn đỏ khi gỡ khung — AC-6 · E6;
- dòng đầu có trong trang máy chủ, không chờ sau khi dựng — AC-7 · E7, E7b.

## Out of scope

- Lỗi 7 (tên hai lần trong ngăn điện thoại), lỗi 8 (dòng thời gian khối ReUI, tên căn trong sự kiện), lỗi 9 (căn bấm được).
- Lối vào Liên hệ ở thanh đáy điện thoại.
- Gói mã của màn và kho kết nối máy chủ (chờ số đo lúc đông người).

## Notes

- Hỏi-1 (duyệt giao diện bằng chữ, nhìn ảnh ở Cổng Bằng chứng — khuyến nghị) và Hỏi-2 (Esc khi đang gõ ô tìm hay khi
  menu, hộp đang mở không đóng hồ sơ — khuyến nghị) chờ chủ kho ở Cổng Phạm vi; hợp đồng soạn theo khuyến nghị.
