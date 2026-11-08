# Khung hồ sơ liên hệ — kế hoạch thi công

> Thực thi: tại phiên (native), tuần tự. Spec: `docs/superpowers/specs/2026-11-08-khung-ho-so-lien-he-design.md`.

1. Khung chung `KhungCotPhu`/`KhungHoSo cotPhu` (solution-crm-4); `KhungHoSoCan cotPhu` gọi lại; ghim HTML cũ (E1, E5).
2. Hồ sơ liên hệ: bọc khung trong `vung.tsx`, nút «Đóng hồ sơ», `escDong` + nghe phím (E1, E2).
3. Bảng: bỏ cột Loại, `width: auto`, dòng chọn qua `rowSelection`, lưới cao hết khung (E3, E4).
4. Tốc độ: `trangDauLienHe` ở `page.tsx`, `henDoc`, `canDocLan` trong vùng (E7, E7b).
5. Lưới khuôn: khoá `khe_boc` ở `packages/ui-lint/lib/ban-do.mjs`, `lien-he.md` KH-lh-mot-khung, bài `tests/khe-boc.test.mjs` (E6).
6. Tham chiếu §12; `/verify`.
