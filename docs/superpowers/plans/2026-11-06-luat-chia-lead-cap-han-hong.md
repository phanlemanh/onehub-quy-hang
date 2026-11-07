# Kế hoạch — luat-chia-lead-cap-han-hong

Thiết kế: `docs/superpowers/specs/2026-11-06-luat-chia-lead-cap-han-hong-design.md` · hợp đồng `_acceptance/luat-chia-lead-cap-han-hong/`.

| # | Việc | Tệp | Kiểm từng việc | Phục vụ | independent |
|---|---|---|---|---|---|
| 1 | Lối ghi chung ghi thêm nửa kia của cặp hỏng bằng giá trị đang áp | `packages/api/src/settings/store.ts` | bộ kiểm 2 | E1, E2, E3, E3b, E4 | false |
| 2 | Bộ kiểm máy chủ năm ca + lượt phá thử (tắt bước ghi thêm → E1, E2, E3b đỏ đúng thông điệp) | `packages/api/test-db/luat-chia-lead-cap-han-hong.test.ts` | `npm run test:db -w @quy-hang/api` | E1–E4, E3b | false |
| 3 | Hàm `ketQuaLuu` và nối vào đường lưu của màn | `apps/web/src/app/(app)/settings/lead-routing/luat.ts`, `luat-chia-lead.tsx` | `npm test -w @quy-hang/web` | E5, E6 | false |
| 4 | Bài nhìn ba khung trên chỗ thử dãy D | `_acceptance/luat-chia-lead-cap-han-hong/thu/chay-ui.mjs` | chạy một lượt, tắt máy dev | E7 | false |
| 5 | Dòng Tham chiếu §12 | `docs/product/tham-chieu.md` | — | — | true |
