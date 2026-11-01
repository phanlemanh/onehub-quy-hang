# Kế hoạch thi công — sua-hang-loat (S2)

T2, không Gate 1.5. Thứ tự theo phụ thuộc; mỗi bước có bài kiểm viết trước kèm đối chứng đỏ.

1. **Xét lô** — `inventory/bulk/lo.ts`: `xetDoiTrangThai`, `nacMenu`, `xetDaGoi`, `demLocAn`, `hangCuaLo`, `gomKetQua`,
   lệnh dựng sẵn. Test `bulk/lo.test.ts` (E1, E2, E4, E9b). Phục vụ AC-2, AC-3, AC-5, AC-6. independent: true.
2. **Hoàn tác lô** — `inventory/bulk/hoan-tac-lo.ts`: `xetHoanTacLo`, `dungLo` (dùng `xetHoanTac`, `lenhHoanTac` của
   cell-edit). Test `bulk/hoan-tac-lo.test.ts` (E3). Phục vụ AC-7. independent: true.
3. **Ô gõ** — `inventory/bulk/phim.ts`: `laOGo`. Test `bulk/phim.test.ts` (E5); `cell-edit/tren-o.tsx` bỏ qua Ctrl/Cmd+Z
   khi `laOGo(e.target)`. Phục vụ AC-8. independent: true.
4. **Giao diện** — `inventory/bulk/thanh.tsx`: ngữ cảnh tích, ô tích dòng / chọn hết, thanh hành động, hộp hỏi lại, ghi
   từng căn qua `useSuaHang`, thông báo và hoàn tác lô. Móc vào `bang-hang.tsx`: cột «Dòng» mang ô tích, thanh trong
   thanh công cụ, bọc ngữ cảnh. Phục vụ AC-1..AC-7 (E6–E11). Phụ thuộc 1–3.
5. **Rào** — kiểm kiểu, lint, test, sàn thiết kế, `thu/ranh-gioi.mjs`. AC-9.

Verify mỗi bước: `npx tsx --test` tệp test của bước + `npm run typecheck`; bước 4 thêm `npm run lint`.
