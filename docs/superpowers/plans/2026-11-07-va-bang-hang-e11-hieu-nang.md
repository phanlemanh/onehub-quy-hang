# Kế hoạch: va-bang-hang-e11-hieu-nang

Hợp đồng: `_acceptance/va-bang-hang-e11-hieu-nang/contract.md` · thiết kế: `_acceptance/va-bang-hang-e11-hieu-nang/design.md`

## Task 1 — Ô tích memo (phục vụ E1, E3, E3b) · independent: false

- Files: `apps/web/src/app/(app)/inventory/bulk/thanh.tsx`, `apps/web/src/app/(app)/inventory/bulk/thanh-memo.test.ts`
- Bọc `OTich` bằng `memo`; bài `thanh-memo.test.ts` khẳng định `OTich.$$typeof === Symbol.for("react.memo")`, thông
  điệp ghim «OTich không phải memo — mỗi khung cuộn vẽ lại Checkbox của mọi dòng».
- Verify: `npm test -w @quy-hang/web`; phá thử: bỏ memo trong bản sao → ca đỏ đúng thông điệp; trả lại → xanh.

## Task 2 — Đo cặp (phục vụ E1, E2, E2b) · independent: false

- Files: không đổi mã; chạy `bash _acceptance/va-bang-hang-e11-hieu-nang/thu/kiem-e11.sh` trên HEAD.
- Đỏ → lối kế của thiết kế: tách trạng thái chọn thành kho đăng ký theo mã căn.

## Task 3 — Kiểm kho (phục vụ E4–E7)

- `npm run typecheck && npm run lint`.
