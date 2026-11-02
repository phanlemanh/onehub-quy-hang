# Kế hoạch thi công — che-vung-anh (S2)

T2, không Gate 1.5. Mỗi bước có bài kiểm viết trước kèm đối chứng đỏ.

1. **Hằng mặc định của sàn** — `packages/core/src/photos/index.ts`: `BAN_CHE_CANH_DAI = 1600`, `BAN_CHE_CHAT_LUONG = 0.82`
   cạnh `THUMB_EDGE` (chỉ thêm). Phục vụ AC-4 (E3).
2. **Hàm thuần** — `units/photos/redact/vung.ts`: `khungTuMan` (toạ độ màn → điểm ảnh của ảnh đã xoay, kẹp mép, bỏ khung
   rỗng), `toKin` (tô kín trên mảng RGBA), `coBanChe`, `coExif` (JPEG APP1, WebP chunk EXIF). Test `vung.test.ts` (E1–E4).
3. **Lưu** — `redact/luu.ts`: `luuBanChe` (từ chối nguồn Nội bộ; tải ảnh mới ở Gửi được rồi mới chuyển bản gốc sang Nội
   bộ). Test `luu.test.ts` (E5). Phục vụ AC-1, AC-5, AC-7.
4. **Trình che** — `redact/ve.ts` (dựng bản che bằng OffscreenCanvas: ảnh đã xoay → `toKin` → thu nhỏ → webp), `redact/
   trinh-che.tsx` (Dialog, canvas vẽ khung bằng con trỏ, danh sách khung, lưu). Móc «Che vùng…» vào menu ảnh ngăn Gửi được ở
   `photos/muc-anh.tsx`. Phục vụ AC-1..AC-7 (E6–E9).
5. **Rào** — kiểm kiểu, lint, test, sàn thiết kế, `thu/ranh-gioi.mjs`, dòng đối chiếu ngành (AC-8).
