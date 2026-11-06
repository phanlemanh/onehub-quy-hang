# Kế hoạch — doc-xa-thieu-mot-phan-dau

Hợp đồng: `_acceptance/doc-xa-thieu-mot-phan-dau/contract.md` (T2, trạng thái V). Thiết kế:
`docs/superpowers/specs/2026-11-06-doc-xa-thieu-mot-phan-dau-design.md`.

## Task 1 — Luật so tương thích dấu trong bộ đọc

- Files: `packages/core/src/address/doc-dia-chi-loi.ts`
- Việc: `LuatDoc.soDau?: "giu" | "tuong-thich" | "lui-bo-dau" | "tuong-thich-tron"` (vắng = `tuong-thich`); hàm
  `tuongThich(go, dm)` trên dạng giữ chữ; `timTen` tra ứng viên theo khoá bỏ dấu rồi lọc tương thích; `docXa` lọc tỉnh
  (và huyện cũ) rồi giữ ứng viên trùng nguyên văn khi có (trừ `tuong-thich-tron`).
- Verify: `npm run typecheck -w @quy-hang/core && npm test -w @quy-hang/core` (bộ kiểm cũ xanh).
- Phục vụ: E1–E7. independent: false.

## Task 2 — Bộ kiểm của vòng

- Files: `packages/core/src/address/doc-xa-thieu-dau.test.ts`
- Việc: mỗi AC một ca tên «AC-n …»; hàm kiểm thuần trả danh sách lỗi; ma trận rút từ danh mục theo luật của hợp đồng, số
  dòng in ra; đối chứng dương trên bộ đọc mới, phá thử cùng hàm kiểm với công tắc khác hoặc bộ đọc cấy lệch, ghim thông
  điệp.
- Verify: `npm test -w @quy-hang/core`; lượt phá thử nằm trong chính ca (assert thông điệp đỏ).
- Phục vụ: E1–E7. independent: false (cần Task 1).
