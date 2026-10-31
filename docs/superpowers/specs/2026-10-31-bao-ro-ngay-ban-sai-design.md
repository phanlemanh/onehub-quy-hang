# Báo rõ ngày bán sai — thiết kế

Hàng 57 của lộ trình (nền, dãy X, đợt nen-2), đứng trên hàng 8 (lõi hàng và sự kiện). Mở từ Cổng Bằng chứng hàng 8,
mục Ngoài-2, chủ kho chọn «mở hợp đồng mới» ngày 31/10.

## Vấn đề

Lệnh chốt bán (`status_changed` sang `Closed`) nhận `closeDate` dạng `YYYY-MM-DD`. Kiểm payload ở lõi
(`packages/core/src/listing/events.ts`, hàm `ngay`) chỉ đòi chuỗi đúng dạng và `Date.parse` không trả `NaN`. Nhưng
`Date.parse` của V8 tự cuộn ngày lố sang tháng sau: `2026-02-30`, `2026-02-31`, `2026-04-31`, `2025-02-29` đều ra một mốc
hợp lệ; `0000-01-01` cũng ra một mốc. Lệnh lọt qua kiểm, sự kiện được chèn, rồi câu cập nhật bảng hàng ghi `close_date`
kiểu `date` thì Postgres từ chối → giao dịch cuộn lại, API trả 500 «lỗi hệ thống». Không có ghi nửa chừng, nhưng người
chốt bán chỉ thấy lỗi chung chung, không biết ngày bán sai.

## Cách làm

Thay hàm `ngay` bằng phép kiểm ngày lịch thật: chuỗi khớp `^\d{4}-\d{2}-\d{2}$`, năm từ 0001 (lịch Gregorian không có
năm 0), tháng 01–12, ngày từ 01 tới số ngày của tháng ấy (tháng 2 có 29 ngày khi năm chia hết cho 4 mà không chia hết
cho 100, hoặc chia hết cho 400). Không dùng `Date.parse`. Ngày đúng dạng mà không có thật trả lỗi
`{ path: "closeDate", reason: "ngày không có thật" }`; sai dạng giữ lời «cần ngày YYYY-MM-DD».

API không đổi một dòng: `applyCommand` đã gọi `validatePayload` trước khi chèn sự kiện và trả 400 `invalid-payload` kèm
`details` khi có lỗi. Sửa ở lõi là đủ để lệnh bị từ chối trước khi chạm cơ sở dữ liệu.

Lối khác đã loại: bắt lỗi Postgres (mã 22008) ở API rồi đổi thành 400. Lối ấy để sự kiện được chèn rồi trông vào cuộn
lại, nằm ngoài vùng của hàng, và để mọi chỗ khác dùng `validatePayload` vẫn tin một ngày không có thật.

## Phép đo

- Lõi (`packages/core/src/listing/listing.test.ts`): hai ma trận viết tay — ngày không có thật và ngày có thật (gồm ngày
  nhuận và cuối tháng) — mỗi phần tử một lần so. Ngày không có thật ra đúng một lỗi ở `closeDate`; ngày có thật ra không
  lỗi nào.
- Đối chiếu với bên đọc thật (`packages/api/test-db/ngay-ban/ngay-ban.test.ts`, Postgres dãy): cùng hai ma trận đưa vào
  `$1::date` của Postgres — Postgres nhận đúng tập ngày lõi nhận. Hai ma trận được dựng ở MỘT chỗ (tệp ca dùng chung ở lõi)
  để lõi và Postgres đọc cùng danh sách.
- Qua API trên Postgres thật: hàng ở «Đang bán», chốt bán với từng ngày không có thật → 400 `invalid-payload`, `details`
  đúng một mục `closeDate`, số sự kiện và bản tính hàng không đổi. Đối chứng dương cùng hàng: chốt bán với `2024-02-29`
  → 200 và đọc lại `closeDate` bằng `2024-02-29`.

## Không làm

- Không chặn ngày bán ở tương lai hay quá xa trong quá khứ — đó là luật nghiệp vụ, không phải ngày không có thật.
- Không đổi giao diện: chưa có màn chốt bán; màn ấy về sau đọc `details` của lỗi 400.
- Không đổi cột `close_date` hay ràng buộc của cơ sở dữ liệu.

## Đặc tả UX

Bỏ — hàng chỉ đổi luật kiểm ở lõi, không chạm màn (sổ quyết định, dòng «bỏ đặc-tả-UX»).
