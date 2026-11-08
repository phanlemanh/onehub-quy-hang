# Kế hoạch thi công — bang-hang-theo-loai-hinh (hàng 79)

Spec: `docs/superpowers/specs/2026-11-08-bang-hang-theo-loai-hinh-design.md` · hợp đồng `_acceptance/bang-hang-theo-loai-hinh/contract.md`
(Cổng Phạm vi duyệt 08/11, Hỏi-1..4 theo khuyến nghị) · bộ chấm `_acceptance/bang-hang-theo-loai-hinh/evals.yaml`.
Tuần tự trong một phiên (các việc chạm chung `inventory/cot.ts` và `ghep-danh-muc.ts`).

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Mỗi dòng mang đúng loại hình và trường của loại ấy, cả hàng lô và hàng ngoài khu | `inventory/loai-hinh.ts` (mới), `ghep-danh-muc.ts` | AC-1 (loại hình của dòng) |
| Bảng chỉ hiện cột của loại hình đang có; cột đầu đọc Toà hay Vị trí | `inventory/cot.ts`, `bang-hang.tsx` | AC-2 (bộ cột theo loại hình) |
| Ô không dùng để trống, ô chưa có số vẫn «—» | `inventory/cot.ts` | AC-3 (ô không dùng) |
| Lọc theo cột Loại hình | `inventory/cot.ts`, `loc.ts` | AC-4 (lọc loại hình) |
| Nhóm theo Loại hình, Loại hình → Toà | `inventory/nhom.ts`, `goc-nhin.ts` | AC-5 (nhóm loại hình) |
| Hồ sơ hàng lô, hàng ngoài khu mở được, đúng trường | `units/ho-so/**` | AC-6 (hồ sơ theo loại hình) |
| Máy chủ trao dãy và căn ngoài khu cho Bảng hàng, trong sàn | `packages/api/src/catalog/doc-ca-danh-muc.ts`, `packages/api/src/off-compound-units/**` | AC-7 (máy chủ trao loại hình) |
| Bảng hàng tải và giữ trên máy căn ngoài khu | `inventory/danh-muc.ts` | AC-1, AC-8 |
| Lint không đỏ khi hàng gộp | `design/patterns/bang-hang.md`, `packages/ui-lint/tests/rang-bo-cuc.test.mjs`, `ban-do-khuon.test.mjs` | AC-9 (trang thử) |
| Tham chiếu ghi điều mới | `docs/product/tham-chieu.md` | AC-10 (Tham chiếu) |
| Chỗ thử màn đang chạy | `_acceptance/bang-hang-theo-loai-hinh/thu/` | AC-8 (màn đang chạy) |

## Việc

1. **Lớp loại hình thuần** — `inventory/loai-hinh.ts`: nhãn loại hình, cột ↔ trường của `PROPERTY_SUBTYPE_FIELDS`, «không
   dùng», bộ cột theo tập loại hình, tiêu đề cột vị trí. Verify: `npm test -w @quy-hang/web`. Phục vụ E1–E4. independent: false.
2. **Ghép ba dạng** — `ghep-danh-muc.ts`: chỉ mục lô bằng `buildLotIndex`/`lookupLot` của lõi, chỉ mục căn ngoài khu; dòng
   mang `propertySubType`, trường thấp tầng, vị trí. Verify cùng lệnh. Phục vụ E1. independent: false.
3. **Cột, lọc, nhóm, góc nhìn** — `cot.ts`, `loc.ts`, `nhom.ts`, `goc-nhin.ts`, `bang-hang.tsx`. Phục vụ E2–E5. independent: false.
4. **Hồ sơ** — `units/ho-so/ho-so.ts` và màn cột/toàn màn. Phục vụ E6. independent: false.
5. **API** — `/api/v1/catalog` mang dãy; `GET /api/v1/off-compound-units`; bài kiểm thuần + `test-db/bang-hang-theo-loai-hinh`.
   Verify: `npm test -w @quy-hang/api`, `executors.test.doi_nhan_db`. Phục vụ E7a, E7b, E8b. independent: true.
6. **Máy khách tải căn ngoài khu** — `danh-muc.ts` giữ bản cuối trên máy. Phục vụ E1, E8. independent: false.
7. **Trang thử + Tham chiếu** — bỏ ngoại lệ có hạn, sửa hai bài ui-lint; thêm dòng §12. Verify: `npm run lint`,
   `npm test -w @quy-hang/ui-lint`. Phục vụ E9, E9b, E10. independent: true.
8. **Chỗ thử màn** — `thu/dung-x.mjs` (Postgres 5576, máy dev 3496, căn ngoài khu mỗi loại hình qua API), `thu/chay-ui.mjs`.
   Phục vụ E8. independent: false.

Mỗi phép đo mới kèm cặp hai chiều trên cùng dữ liệu (MEASURE-BIRTH-CLAUSE).
