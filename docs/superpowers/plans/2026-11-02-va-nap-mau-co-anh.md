# Kế hoạch thi công — va-nap-mau-co-anh

Hồ sơ `_acceptance/va-nap-mau-co-anh/` (T3, Cổng Phạm vi duyệt 2026-11-02, Manh Phan). Thiết kế:
`docs/superpowers/specs/2026-11-02-va-nap-mau-co-anh-design.md`. Một task — mọi thay đổi nằm trong một ca của một tệp.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Không gì — bài kiểm của nút «Nạp dữ liệu mẫu» thôi xanh sẵn ở chỗ ảnh lên kho Storage | `packages/db/seed/nap-ban-that.test.ts` (ca «kho-storage») | AC-1…AC-4 (E1–E4) |
| Không gì — lệnh kiểm ranh giới tệp đã có trong hồ sơ | `_acceptance/va-nap-mau-co-anh/thu/ranh-gioi.mjs` (đã viết ở S1) | AC-4 (E5) |

## T1 — Viết lại ca «kho-storage»

- Files: `packages/db/seed/nap-ban-that.test.ts`.
- Làm:
  1. Helper trong tệp: `fetchGhi()` — `fetch` giả ghi `{method, url, body}` mọi lời gọi, trả `new Response(null, {status:
     200})`; `demSanMau(san)` — số dòng `unit_photos`, `unit_photo_files` của một mã sàn; `vangSanMau()` — assert
     `timSanMau` rỗng; `soAnhMong` — số ảnh mong đếm từ `GOI` theo đúng luật mà ca «anh-dang-ban» dùng (không đọc DB).
  2. `lechKhoStorage(kq)` với `kq = {ten, san, goi: LoiGoi[], dongByte, anh: string[]}` chụp ngay sau lần nạp; trả danh
     sách lệch, mỗi vế một câu ghim số đo: tên kho; `anh.length` so `soAnhMong`; số PUT so `2 × soAnhMong`; tập đường so
     tập `<endpoint>/<bucket>/` + `duongDoiTuong(san, id, b)`; lời gọi khác PUT; `dongByte` so 0 («bảng byte có N dòng
     của sàn mẫu»). Câu khi kho là `postgres` và không PUT nào: «kho postgres», «Storage nhận 0 lệnh ghi».
  3. Ca: (a) vắng → `chonKhoAnh(ENV_DU, f1)` → nạp → chụp → `lechKhoStorage = []` + assert giá trị cụ thể 29 ảnh, 58
     PUT → gỡ; (b) vắng → `chonKhoAnh({NODE_ENV: undefined}, f2)` → nạp → chụp: `ten = postgres`, `dongByte = 58`,
     `f2` 0 lời gọi; so tập bội (biến thể, sha256) thân PUT của (a) với byte `unit_photo_files` của (b); chiều đỏ: đổi một
     byte một thân thumb → lệch nêu «thumb» và «1»; `lechKhoStorage` trên kết quả (b) chứa ba câu ghim → gỡ; (c) vắng →
     kho Storage thật bọc (`ghi` gọi kho thật rồi insert `unit_photo_files`, tự đếm) → nạp → chụp: bộ bọc đếm 58,
     `lechKhoStorage` chứa «bảng byte có 58 dòng của sàn mẫu» → gỡ. Gỡ trong `try/finally`; cuối ca `timSanMau` rỗng và
     0 dòng ảnh, byte của mọi mã sàn ca đã dựng.
- Verify: `npm run typecheck`; `node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.ts"`
  (Postgres dãy H 5562); lượt phá thử: tạm cho ca dùng kho Postgres ở bước (a) → ca đỏ với thông điệp «kho postgres»;
  hoàn lại. `node _acceptance/va-nap-mau-co-anh/thu/ranh-gioi.mjs`.
- Phục vụ: E1, E2, E3, E4, E5. `independent: false`.

## Thứ tự

T1, rồi `npm run typecheck && npm run lint`, rồi hồ sơ sang `implemented` và vào chấm.
