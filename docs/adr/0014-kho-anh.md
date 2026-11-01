# ADR-0014 — Kho ảnh căn: Supabase Storage riêng tư, ngăn nội bộ chặn ở cơ sở dữ liệu

- Trạng thái: chấp nhận (01/11, Cổng Phạm vi hàng 18 — Hỏi-1, Hỏi-6)
- Hồ sơ: `_acceptance/anh-can-ba-ngan/`; thiết kế `docs/superpowers/specs/2026-11-01-anh-can-ba-ngan-design.md`

## Bối cảnh

Hồ sơ căn cần chỗ giữ ảnh, chia ba ngăn (Tham chiếu §5, luật 27–28): Gửi được, Tự có từ mã, Nội bộ. Ngăn nội bộ là sổ,
hợp đồng, giấy tờ của chủ nhà — lớp `source`, không bao giờ ra ngoài sàn (bất biến 2), không lưu trên máy (Tham chiếu §5),
chặn ở lõi và kho dữ liệu, không ở giao diện (bất biến 4). Kho chưa dùng nơi giữ tệp nào; Kiến trúc §3 dòng «Ảnh» chọn
Supabase Storage hai vùng.

## Quyết định

1. **Ảnh thuộc căn của sàn** (toà + mã), bảng `unit_photos` (migration 012); lần rao chọn ảnh hiện là hàng sau. Lệch RESO
   (Media gắn Property) có chủ ý — Hỏi-2; ánh xạ ra `Media` khi có cửa ra RESO.
2. **Ai thấy ngăn nội bộ** do cơ sở dữ liệu quyết: `app.can_see_unit_internal(toà, mã)` — trưởng nhóm của sàn, hoặc đầu
   chủ giữ lần rao mới nhất của căn còn vai Đầu chủ; căn chưa có lần rao thì chỉ trưởng nhóm. Luật theo dòng của
   `unit_photos`, `unit_photo_files`, `unit_photo_events` dựa vào hàm này; lõi có `canSeeUnitInternal` cùng bảng ca
   (`packages/core/src/photos/bang-xem-noi-bo.json`). Thêm, sửa ảnh ở mọi ngăn chỉ hai vai ấy (Hỏi-4).
3. **Byte ở Supabase Storage**, bucket riêng tư `unit-photos`, đường `<company_id>/<photo_id>/<original|thumb>`, sau giao
   diện `KhoAnh` (`packages/api/src/photos/kho.ts`). API đọc dòng ảnh bằng vai `quy_hang_app` rồi mới ký link GET sống
   60 giây (302); tải lên và xoá đi qua API. Ngăn nội bộ trả `Cache-Control: private, no-store`. Ảnh không qua bộ đồng
   bộ, không vào kho trên máy.
4. **Khoá hẹp nhất**: khoá S3 của Storage (chỉ chạm Storage, không chạm cơ sở dữ liệu; phủ mọi bucket, bỏ qua luật của
   Storage) — không dùng `service_role`. Token theo người dùng của Storage đòi Supabase Auth (kho dùng better-auth,
   ADR-0005); tự ký JWT cần secret JWT của dự án, mạnh ngang `service_role`. Chỉ `packages/api/src/photos/kho-s3.ts` đọc
   khoá; bài quét `kho-s3.test.ts` đỏ khi tệp khác đọc khoá hay nhập mô-đun. Ký SigV4 bằng `node:crypto`, không thêm gói.
5. **Xoá khỏi căn = xoá hẳn byte** (bản gốc và bản nhẹ), giữ dòng ảnh đánh dấu đã xoá và sự kiện `removed` (Hỏi-6).
6. **Máy dev, CI, lượt chấm** không có khoá: `KhoAnh` dùng bảng `unit_photo_files` (cùng luật theo dòng). Bản thật
   (`NODE_ENV=production`) thiếu khoá thì mục ảnh trả 503 `photo-storage-missing` và in lời báo nêu tên biến thiếu —
   không dựng sập cả API.

## Vận hành

Ba biến, giá trị chủ kho đặt ở Vercel (Production và Preview); máy không đọc, không ghi `.env*` — chủ kho thêm ba dòng
tên vào `.env.example` bằng tay:

| Biến | Nghĩa |
|---|---|
| `STORAGE_S3_ACCESS_KEY` | Access key S3 của Supabase Storage (Project Settings › Storage › S3 Access Keys) |
| `STORAGE_S3_SECRET_KEY` | Secret của access key ấy |
| `STORAGE_S3_ENDPOINT` | Endpoint S3 của dự án, dạng `https://<ref>.supabase.co/storage/v1/s3` |
| `STORAGE_S3_REGION` *(tuỳ chọn)* | Vùng của dự án; vắng là `ap-southeast-1` |

Tạo bucket `unit-photos` ở chế độ riêng tư (không public) trước khi đặt khoá. Thiếu một phần trong ba biến bắt buộc thì
API báo lỗi nêu tên biến thiếu.

**Chi phí**: tổ chức Supabase của dự án ở gói Pro — 100 GB Storage kèm gói (ước 300 KB ảnh gốc + 40 KB bản nhẹ ≈ 300 000
ảnh), vượt thì tính theo dung lượng của gói. Byte không nằm trong Postgres (8 GB đĩa của gói) nên không phình sao lưu.

## Lối đã cân

- **Byte trong Postgres** (bảng có luật theo dòng): không khoá mới, nhưng phình đĩa và sao lưu, chậm migrate và kiểm cách ly
  trên bản thật — giữ làm bản dev/CI.
- **Token Storage theo người dùng**: cần Supabase Auth hoặc secret JWT — rộng hơn khoá S3.
