# Kế hoạch: va-bang-hang-cuon-so-lon — Bảng hàng sàn 5.000 căn không sập

Hợp đồng: `_acceptance/va-bang-hang-cuon-so-lon/contract.md` (T2, làn V). Mã đã viết trong lúc dò nguyên nhân (commit
61d32c87), kế hoạch ghi lại để đối chiếu.

| Task | Files | Verify | Phục vụ | independent |
|---|---|---|---|---|
| 1. Hàm đo dòng `doCaoThe` + ước lượng `uocLuongDong` | `inventory/cards/do-the.ts` | bài kiểm `do-the.test.ts` | E3 | false |
| 2. Bảng thẻ dùng hàm đo; khe ẩn thì không gắn bảng thẻ | `inventory/cards/bang-the.tsx` | `kiem-cuon.mjs` năm khổ | E1, E4, E6 | false |
| 3. Bài kiểm đơn vị khoá vòng | `inventory/cards/do-the.test.ts` | chạy + phá thử | E3 | false |
| 4. Chạy trọn bộ đo, kiểm kiểu, lint | — | E1–E6, `npm run typecheck && npm run lint` | E1–E6 | false |
