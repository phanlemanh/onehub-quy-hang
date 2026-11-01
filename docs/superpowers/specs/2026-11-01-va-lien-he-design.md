# Vá hàng 85 «Liên hệ» — thiết kế

Ngày 01/11 · hàng `va-lien-he` (dãy L, đợt `dau-chu-dong-vao`) · hạng T3 (chạm `packages/db/**`) · nguồn: hai mục ngoài
hợp đồng mà chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng của `lien-he` (sổ `lien-he#d-20261101T133028Z-31` và mục
Ngoài-4 cùng lượt), giám sát xếp «sau 85, ưu tiên 0».

## Vấn đề

1. **Bảng nối lead với hàng chưa có ca cách ly** (`lead_listings`, migration 016). Luật kho (`.claude/rules/migrations.md`)
   đòi mỗi bảng của công ty có một ca trong `packages/db/tests/isolation.test.mjs`; hàng 85 chỉ dựng ca cho `contacts` và
   `contact_phones`. Bảng nối quyết định mốc «Lên bảng» và lời chặn «Trả lại» (ADR-0020, ADR-0021 quyết định 6), nên đọc
   hay ghi chéo sàn làm sai cả hai mà không gì báo. Chạm bất biến 1 — làm trước.
2. **Hàng tạo từ lead trả chủ nhà tên trống.** `createListingFromLead` chèn một dòng `listing_owners` chưa có tên (để gắn
   liên hệ của lead); `docChuNha` thấy dòng nên không báo «chưa có chủ nhà», trả `ownerName: null` — trái khuôn
   OpenAPI (`ownerName: z.string()`) và câu 404 đã hứa «hàng chưa có chủ nhà / số chủ» (`packages/api/src/owners/routes.ts`).

## Cách làm

- **Ca cách ly** (thêm khối mới, không sửa ca cũ): dùng dữ liệu dựng `withBonNac` (sàn A có một dòng nối `BN_LEN → BN_HANG`,
  sàn B có người đủ vai). Ba ca:
  - `lead_listings` bật và ép luật theo dòng;
  - sàn B không đọc dòng nối của sàn A, không chèn dòng mang mã sàn A, không chèn dòng trong sàn mình mà ghi tên người
    khác, không chèn dòng sàn B trỏ lead hay hàng của sàn A (khoá ngoại ghép theo sàn của 016 chặn); đối chứng dưới sàn A
    đọc được đúng dòng nối, và người sàn A chèn dòng ghi tên mình thì được;
  - vai API không sửa, không xoá dòng nối (không cấp quyền).
  Chiều đỏ (phá thử ở S3): nới điều kiện sàn trong luật đọc → ca «sàn B không đọc» đỏ nêu dòng; nới điều kiện người tạo
  trong luật chèn → ca chèn tên người khác đỏ.
- **Chủ nhà chưa có tên** báo `owner-not-set` ở lối đọc `docChuNha` (`packages/api/src/owners/store.ts`): dòng có
  `owner_name` rỗng coi như chưa có chủ nhà (Hỏi-1: khuyến nghị không tự điền tên từ liên hệ của lead — lead không mang
  tên, lối ấy chỉ sống khi số trùng chủ nhà đã có tên ở hàng khác). «Mở số» giữ như hàng 85 đã ghi (ADR-0021 Hệ quả). Giữ dòng `listing_owners` của hàng tạo từ lead — nó mang liên hệ của lead
  (ADR-0021 quyết định 6, AC-7 của `lien-he`). Ghi chủ nhà có tên (PUT) thì đọc ra như thường.
- Ca API ở tệp mới `packages/api/test-db/va-lien-he.test.ts`, không sửa tệp ca của hồ sơ đã ký.

## Ngoài phạm vi

- Sáu giới hạn đã biết của hàng 85 (luật tạo hàng từ lead ở cơ sở dữ liệu, nhãn Lead/Liên hệ theo người xem, ba chỗ bài
  kiểm mỏng) — chủ kho đã chọn ghi giới hạn.
- Dời tên, số chủ nhà sang liên hệ (RESO `ContactListings`) — việc sau, ADR-0021 «Hệ quả».

## Đặc tả UX

Không có màn — bỏ (sổ `descope` «bỏ đặc-tả-UX»).
