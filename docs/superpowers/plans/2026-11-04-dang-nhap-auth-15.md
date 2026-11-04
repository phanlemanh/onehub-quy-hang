# Đăng nhập theo khối auth-15 — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ba màn xác thực dựng trên khuôn `Khung` chuyển thể auth-15, không OAuth, luồng hàng 6 giữ nguyên.

**Architecture:** Chuyển thể khối vào `apps/web/src/app/(auth)/khung.tsx` (dấu hiệu, cột giữa trang, chân điều khoản);
ô và nút của `login/form.tsx` theo khối; ba `page.tsx` không đổi bố cục. Sổ thiết kế cập nhật cùng PR.

**Tech Stack:** Next.js, React, Base UI (base-nova), lucide, `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-04-dang-nhap-auth-15-design.md` · hợp đồng `_acceptance/dang-nhap-auth-15/`
(Cổng Phạm vi Manh Phan 04/11; Hỏi-1, Hỏi-2 theo khuyến nghị).

## Global Constraints

- Chân trang: «Sàn của bạn dùng Quỹ hàng theo điều khoản trong hợp đồng đã ký.»; dấu hiệu `BoxesIcon` trong ô màu chính.
- Không tệp nào dưới `packages/api/src/auth` đổi; không chữ Google, Apple, GitHub dưới `(auth)` ngoài chú thích.

## Review Focus

1. Gửi lại mã ở bước hai → focus về ô mã (giữ `requestAnimationFrame`).
2. Lỗi gắn ô vẫn đứng dưới lời dặn, không thay nó.
3. Khổ 375 với email dài ở lời dặn bước mã → không cuộn ngang.
4. Khối máy bị báo vẫn đứng trước form trong cột.
5. Nền tối: ô `InputGroup` `bg-background` phân biệt với nền trang.

---

### Task 1: Khung theo auth-15 (`khung.tsx`) — phục vụ E1, E3, E4, E11 · independent: false
- [x] Dấu hiệu, cột, chân trang; hằng `CHAN_DIEU_KHOAN`; ca `khung.test.ts`.

### Task 2: Ô và nút của form (`login/form.tsx`) — phục vụ E2, E4 · independent: false
- [x] `InputGroup` có biểu tượng, `FieldDescription`, nút rộng trọn cột; ca «trạng thái của hàng 6 còn đủ».

### Task 3: Sổ thiết kế — phục vụ E9, E10, E13 · independent: false
- [x] Dòng Chỗ hở rời §3, dòng catalog `@reui/auth-15`, `xac-thuc.md`, `kiem-chuan.test.mjs` (12 dòng, 2 cảnh báo).
- [x] `/verify`, commit, `implemented`.
