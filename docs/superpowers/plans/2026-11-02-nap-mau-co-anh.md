# Kế hoạch thi công — nap-mau-co-anh

Hồ sơ `_acceptance/nap-mau-co-anh/` (T3, Cổng Phạm vi duyệt 2026-11-02, Manh Phan). Thiết kế:
`docs/superpowers/specs/2026-11-02-nap-mau-co-anh-design.md`. Mọi task chạy tuần tự trong vòng chính — năm task nhỏ,
ba task sau phụ thuộc task trước nên không tách song song.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Có sẵn một ảnh vẽ (khối màu) cho mỗi căn mẫu, cố định theo căn | `packages/db/seed/anh-mau.mjs` (mới) | AC-2 (ảnh đúng khuôn, tất định) |
| Nút nạp mẫu thêm ảnh cho căn trước khi lên Đang bán, cất đúng kho bản thật đang đọc | `packages/db/seed/nap-ban-that.ts` | AC-1 (đủ ảnh), AC-3 (nạp lại không đổi), AC-4 (chọn kho) |
| Gỡ sàn mẫu và lần nạp hỏng không để ảnh thừa trên kho | `packages/db/seed/nap-ban-that.ts` | AC-5 (gỡ xoá ảnh), AC-6 (hỏng thì dọn) |
| Nút trên GitHub đọc được ba khoá kho ảnh ở bước nạp | `.github/workflows/nap-mau.yml` | AC-7 (nút nhận khoá) |
| Hướng dẫn bộ nạp nói về ảnh mẫu và ba khoá | `packages/db/seed/README.md` | AC-8 (hướng dẫn đủ) |

## T1 — Ảnh vẽ bằng mã

- Files: `packages/db/seed/anh-mau.mjs` (mới), `packages/db/seed/anh-mau.d.mts` (mới, khai kiểu cho phần TypeScript),
  `packages/db/seed/anh-mau.test.mjs` (mới).
- Làm: `anhMau(i)` → `{ goc, nhe, width: 640, height: 480 }`; PNG RGB tự mã hoá (chữ ký, IHDR, IDAT nén `zlib.deflateSync`,
  IEND, CRC bằng `zlib.crc32`); khối màu suy từ `i` (sắc độ theo `i`, một dải dọc vị trí theo `i`), bản nhẹ 160×120 cùng
  khuôn. Không chữ, không dữ liệu thật.
- Verify: `node --env-file-if-exists=.env.local --import tsx --test packages/db/seed/anh-mau.test.mjs` — gồm lượt phá-thử:
  sửa byte đầu một tệp thì `kiemTepAnh` trả «Không phải ảnh».
- Phục vụ: E2. `independent: true`.

## T2 — Bộ nạp thêm ảnh, chọn kho, dọn byte

- Files: `packages/db/seed/nap-ban-that.ts`.
- Làm:
  - `napBanThat(client, goi, { khoa, email, kho })`: `kho` là `KhoAnh` của API. Bọc kho bằng lớp ghi sổ: mỗi `ghi` thêm
    `(companyId, photoId)` vào sổ của lần chạy TRƯỚC khi chuyển xuống kho thật.
  - Hàng MỚI tạo có trạng thái khác `Incomplete`/`Withdrawn`: sau `details_changed`, `addPhoto` dưới `trongVai(đầu chủ)`
    với ngăn `shareable`, `width/height` từ `anhMau(thứ tự hàng trong gói)`, `takenAt: null`; từ chối thì ném như các lệnh
    khác; rồi `status_changed → Active`.
  - Bọc thân hàm trong `try/catch`: ném lỗi thì xoá từng mã trong sổ qua `kho.xoa` (mỗi lỗi xoá nuốt riêng), rồi ném lại
    lỗi gốc.
  - `goBanThat(client, kho)`: sau khi xác định đúng một sàn mẫu, đọc `select id from unit_photos where company_id = $1`
    và gọi `kho.xoa(client, <sàn mẫu>, id)` cho từng mã TRƯỚC câu xoá sàn.
  - Dòng lệnh: chọn kho bằng `chonKhoAnh(process.env)` TRƯỚC khi mở kết nối, cho cả `--nap` lẫn `--go`; kết quả «vắng»
    → ném với `lyDo` của API (nêu đúng biến thiếu), thoát 1, không câu nào chạm cơ sở dữ liệu.
- Verify: `npm run typecheck` + chạy bài kiểm của T3.
- Phục vụ: E1, E3, E4, E5, E6, E7. `independent: false` (cần T1).

## T3 — Bài kiểm bộ nạp trên Postgres dãy

- Files: `packages/db/seed/nap-ban-that.test.ts`.
- Làm:
  - Trợ giúp `nap`/`go` nhận `kho` (mặc định `khoPostgres`); kho giả `khoGia({ ten, nemOLanGhi? , nemKhiXoa? })` ghi nhật ký
    `ghi`/`xoa` với `companyId`, `photoId`, biến thể, không mạng.
  - Ca mới: `nap-co-anh` (bảng viết tay 40 dòng mã hàng → số ảnh mong; sự kiện `added` đúng đầu chủ; chiều đỏ bằng gói
    đổi một hàng), `anh-doc-lai`, `kho-storage`, `chon-kho` (ma trận 6 ô viết trước, so tập biến trong lời báo, ảnh chụp
    bảng trước = sau), `khong-khoa-ngoai-ban-that`, `go-xoa-byte` (mọi lệnh xoá mang mã sàn mẫu; chiều đỏ), `hong-o-lan-ghi-10`.
  - Ca cũ: `chay-lai` thêm kho giả đếm 0 lệnh ghi ở lần hai; `hong-giua-chung` thêm so tập xoá với nhật ký ghi + biến thể
    xoá ném lỗi; các ca gọi dòng lệnh (`khoa-sai`, `email-chu-kho`, `email-ky-tu-dieu-khien`) chạy với `NODE_ENV` vắng để
    dùng kho Postgres (đường bản thật thiếu khoá đã có ca riêng).
- Verify: `npm run typecheck` và `node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.ts"`
  (Postgres dãy H 5562) — mỗi ca mới có lượt phá-thử ghim thông điệp.
- Phục vụ: E1, E3, E4, E5, E6, E7. `independent: false` (cần T2).

## T4 — Nút GitHub đọc ba khoá kho ảnh

- Files: `.github/workflows/nap-mau.yml` (giám sát cho chạm, yêu cầu H-11), `packages/db/seed/nap-mau-yml.test.mjs`.
- Làm: thêm `STORAGE_S3_ACCESS_KEY`, `STORAGE_S3_SECRET_KEY`, `STORAGE_S3_ENDPOINT: ${{ secrets.<TÊN> }}` vào env của bước
  «Chạy bộ nạp», cạnh `NODE_ENV: production`; ca kiểm `ba-khoa-kho-anh` dùng bộ đọc bước có sẵn (`cacBuoc`, `envJob`),
  chiều đỏ trên bản sao tệp (dời một biến lên job; bỏ `NODE_ENV`).
- Verify: `node --test packages/db/seed/nap-mau-yml.test.mjs`.
- Phục vụ: E8. `independent: true`.

## T5 — Hướng dẫn bộ nạp

- Files: `packages/db/seed/README.md`.
- Làm: mục «Bản thật» thêm bốn ý của AC-8; bước một lần ở danh sách nút thêm ba secret.
- Verify: đọc lại đối chiếu AC-8.
- Phục vụ: E9. `independent: true`.

## Thứ tự

T1 → T2 → T3 → T4 → T5, rồi `npm run typecheck && npm run lint`, rồi hồ sơ sang `implemented` và vào chấm.
