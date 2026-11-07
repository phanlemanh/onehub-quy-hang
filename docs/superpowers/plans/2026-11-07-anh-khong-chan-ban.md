# Kế hoạch thi công — anh-khong-chan-ban

Hợp đồng `_acceptance/anh-khong-chan-ban/contract.md` (Cổng Phạm vi duyệt 07/11, sáu Hỏi theo khuyến nghị). Thiết kế
`docs/superpowers/specs/2026-11-07-anh-khong-chan-ban-design.md`. Postgres dãy G cổng 5573.

Chú ý khi dựng nhóm Hôm nay: `nhomCuaCan` trả nhóm ĐẦU TIÊN khớp, và điều kiện ngầm `canVaoDuoc` đã loại Đã bán, Ngừng hẳn
(`packages/core/src/today/hang-doi.ts`). Nhóm «Bổ sung ảnh» đứng sau «Thiếu thông tin», trước «Mới đổi»: căn thiếu ảnh mà
đã thuộc nhóm đứng trước (điều chỉnh giá, gọi lại, thiếu thông tin) hiện ở nhóm ấy — một căn một nhóm như hôm nay. Bốn
trạng thái mở của Hỏi-4 là đúng tập `canVaoDuoc` để lại, nên điều kiện nhóm chỉ cần `missing_photo`.

## T1 — Lõi: số ảnh tối thiểu mặc định 0, khoảng 0–20

- Files: `packages/core/src/config/so.ts` (dòng 33: min 0, macDinh 0), `packages/core/src/config/hang-so.ts`,
  `packages/core/src/listing/san-sang.ts` (khoảng), test `listing/status.test.ts` (ca mới «số ảnh thật tối thiểu mặc định 0»,
  ma trận tối thiểu {0,1,2,20} × số ảnh {0,k−1,k}; sửa ca cũ đọc mặc định 1), `listing/gan-ma-can.test.ts`, test cấu hình
  (ca «điểm 33: 0–20, mặc định 0», bộ đọc với −1, 21, 1.5).
- Verify: `npm test -w @quy-hang/core`; phá thử: đặt lại macDinh 1 → ca 0 ảnh đỏ nêu `realPhoto`.
- Phục vụ: E1. independent: true.

## T2 — Lõi: mục ảnh của mức đủ

- Files: `packages/core/src/listing/completeness.ts` (`completeness(s, anh?: { photosCount: number })`, mục `photos` đủ khi
  ≥ 1, tổng 6 khi có `anh`; `COMPLETENESS_ITEMS` giữ năm mục), `completeness.test.ts` (ca «mục ảnh»); `metrics/hang.ts` không
  đổi (vẫn gọi không truyền ảnh) — ca giữ số «mức đủ cao nhất» ở `metrics/so-do.test.ts`; `listing/danh-sach-hoi.test.ts` giữ.
- Verify: `npm test -w @quy-hang/core`; phá thử: tính `photos` khi không truyền `anh` → ca total 5 đỏ.
- Phục vụ: E4 (phần lõi), E5b. independent: true.

## T3 — Lõi: điều kiện `missing_photo` và nhóm «Bổ sung ảnh»

- Files: `packages/core/src/today/kieu.ts` (Condition thêm `{ kind: "missing_photo" }`, `DuKienCan.photosCount?: number`),
  `today/kiem.ts` (chấp nhận kind, khoá lạ bị từ chối), `today/hang-doi.ts` (`missing_photo` đúng khi `photosCount === 0`;
  vắng là không), `today/mac-dinh.ts` (nhóm `add_photos` «Bổ sung ảnh», `open_record`, đứng sau `missing_info`),
  `hang-doi.test.ts` (ca «Bổ sung ảnh»: ma trận 6 trạng thái × {0,1} ảnh trên căn không khớp nhóm đứng trước; căn chỉ thiếu
  ảnh không vào `missing_info`; kiem; bộ sàn đã lưu giữ nguyên). Kiểm `today` web (`mo-nhom.test.ts`) nếu đếm số nhóm mặc định.
- Verify: `npm test -w @quy-hang/core`; phá thử: coi `undefined` là 0 → căn máy cũ vào nhóm, ca đỏ.
- Phục vụ: E6. independent: true.

## T4 — API: số ảnh trong bản xem, ba cửa, cấu hình, lý do nhập

- Files: `packages/api/src/listings/store.ts` (tách hàm đếm ảnh thật dùng chung: một căn cho `nguCanhAnh`, lô theo danh sách
  căn cho bản xem — cùng điều kiện ngăn Gửi được, không mẫu, chưa gỡ, khớp `app.unit_key`), `listings/routes.ts` (view thêm
  `photosCount`, `completeness(s, { photosCount })`), `packages/api/src/imports/store.ts` (lý do «thiếu …» dùng nhãn
  `NHAN_DIEU_KIEN`, không mã thô).
- Test-db: `packages/api/test-db/san-sang-ban.test.ts` (ca «ba cửa nhận căn 0 ảnh», «tối thiểu 2 thì luật cũ», «sàn đã lưu
  dòng từ trước»; sửa ca cũ giả định mặc định 1), `listings.test.ts` (ca «photosCount và mục ảnh của mức đủ», tập khoá bản
  xem), tệp settings (ca «số ảnh tối thiểu qua lối chung»), tệp gửi (ca «gửi căn 0 ảnh» đọc dữ liệu trang khách),
  `imports/lan-nhap.test.ts` (lý do nhãn). Bộ rò rỉ: ca mồi ảnh Nội bộ (`packages/api/src/public/*.ro-ri.test.ts`).
- Verify: `DATABASE_URL=…5573 npm run db:migrate && npm run db:test`, `npm run test:ro-ri`; phá thử: đếm cả ảnh Nội bộ →
  ca photosCount đỏ; mặc định về 1 → ca ba cửa đỏ.
- Phục vụ: E2, E4, E8, E9b, E9c. independent: false (sau T1, T2).

## T5 — Web: mức đủ có ảnh, Hôm nay, «Sẵn sàng bán», Cài đặt, trang khách

- Files: `apps/web/src/lib/sync/types.ts` (`photosCount?`), `units/ho-so/ho-so.ts`, `inventory/cot.ts` (cột Mức đủ dùng mức
  đủ có ảnh khi hàng có `photosCount`), `units/call/muc-du.ts`, `today/ly-do.ts` (`canHomNay` mang `photosCount`, `missing`
  năm mục), `units/ready/san-sang.ts` + `nut-san-sang.tsx` (đọc tối thiểu của sàn, vắng là 0; tối thiểu 0 thì không đòi mạng
  để đếm ảnh), `settings/statuses/**` (ô «Số ảnh thật tối thiểu để căn vào Đang bán» 0–20 qua `PATCH /api/v1/company/settings`,
  chỉ quản trị), `s/[code]/trang.test.ts` (ca căn không ảnh), sửa `inventory/cell-edit/lenh.test.ts`, `units/ready/san-sang.test.ts`.
- Web db: `apps/web/src/lib/sync/test-db/san-sang-ban.db-test.mts` (ô Trạng thái, hàng loạt, tối thiểu 1 → Cần xem), tệp mới
  cho «số ảnh tới máy qua đồng bộ».
- Verify: `npm test -w @quy-hang/web`, `DATABASE_URL=…5573 npm run test:db -w @quy-hang/web`, `npm run lint`; phá thử: bỏ
  `photosCount` khỏi hồ sơ → mức đủ 5/5, ca đỏ.
- Phục vụ: E3, E5, E6b, E6c, E7, E9, E10. independent: false (sau T2, T3, T4).

## T6 — Tài liệu

- Files: `docs/product/tham-chieu.md` (luật 17 bỏ «chưa dựng», dòng §12 mới 07/11 — chỉ thêm), `docs/adr/0008-loi-hang-va-su-kien.md`
  (ghi chú hàng anh-khong-chan-ban), `docs/architecture/so-diem-bien-thien.md` (dòng 33: 0–20, mặc định 0; K7), `CONTEXT.md`
  (mức đủ: năm mục mô tả + ảnh thật khi biết số ảnh).
- Verify: `npm run lint` (kiểm chuẩn), product map `--check`.
- Phục vụ: tài liệu theo AGENTS.md. independent: true.

## T7 — Chỗ thử và chụp màn (E8b)

- Files: `_acceptance/anh-khong-chan-ban/thu/dung.mjs` (dựng máy dev 3493 trên Postgres 5573, như `nhap-o-la/thu/dung-o-la.mjs`),
  `thu/chup.mjs` (sàn mới, căn 0 ảnh đủ điều kiện, đăng nhập quản trị và đầu chủ, chụp Cài đặt › Trạng thái, Hôm nay, hồ sơ
  căn, Bảng hàng ở `--kho 1440|375`, in JSON mỗi khung).
- Verify: chạy hai khổ, đọc ảnh.
- Phục vụ: E8b. independent: false (sau T5).

Thứ tự: T1, T2, T3 (lõi) → T4 → T5 → T6 → T7; S3 chạy tuần tự trong phiên chính (các task chạm chung bộ test và nối tiếp
nhau), rồi cuối S3 chạy sàn thiết kế S3 và đặt `implemented`.
