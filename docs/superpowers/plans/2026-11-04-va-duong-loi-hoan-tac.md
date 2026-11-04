# Vá đường lỗi hoàn tác — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Hoàn tác (ô và lô) không mất dấu căn chưa về, bấm lại được, và không lần ghi nào im lặng khi lỗi bất ngờ.

**Architecture:** Hàm thuần ở `inventory/cell-edit` và `inventory/bulk` điều phối lần ghi (nhận hàm `sua` đã bọc), trả
thông báo dựng sẵn; `tren-o.tsx` và `thanh.tsx` chỉ hiện thông báo. Hàm bọc `ghiAnToan` biến lỗi ném ra thành lỗi có tên.

**Tech Stack:** TypeScript, React, sonner, `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-04-va-duong-loi-hoan-tac-design.md` · hợp đồng `_acceptance/va-duong-loi-hoan-tac/`
(làn V, cửa veto mở 04/11).

## Global Constraints

- Chữ: «Lỗi bất ngờ — chưa lưu được, thử lại»; lô một phần «Đã hoàn tác n căn · k căn chưa hoàn tác được»; tối đa năm mã
  rồi «và n căn khác»; «Đã hoàn tác rồi», «Không hoàn tác được: …» giữ nguyên.
- Chỉ lỗi `kho` và `bat-ngo` vào lượt bấm lại; lỗi lõi kể vào «không hoàn tác được».

## Review Focus

1. Lần sửa mới thành công xen giữa lần hoàn tác hỏng và lần bấm lại → Ctrl+Z trỏ lần sửa mới (traLai không đè).
2. Bấm lại lô khi một căn hỏng đã có lần sửa sau → bỏ qua, kể như luật cũ (E2).
3. Lô chỉ toàn căn hỏng → «Đã hoàn tác 0 căn · 5 căn chưa hoàn tác được» vẫn trung tính, có nút.
4. Lỗi bất ngờ ở ghi lô → mô tả kể mã căn, không chỉ số đếm.
5. `sua` trả lỗi kho rồi ném ở lần sau → mỗi lần một thông báo, không kẹt bản ghi.

---

### Task 1: Hàm bọc và chữ lỗi (`cell-edit/lenh.ts`) — phục vụ E4 · independent: false
- `LoiGhi = LoiTrenMay | { kind: "bat-ngo" }`; `moTaLoi(l: LoiGhi)`; `ghiAnToan(sua)`.
- [ ] Ca «ghi an toàn: lỗi bất ngờ thành lỗi có tên» (ma trận bốn chỗ) và «mọi chỗ gọi đi qua hàm bọc».

### Task 2: Hoàn tác ô (`cell-edit/hoan-tac.ts`) — phục vụ E3, E5 · independent: false
- `taoSoHoanTac().traLai(b)`; `chayHoanTac(so, kq, sua)`; `chayLuuO(sua, …)`.
- [ ] Ca «hoàn tác ô: lệnh bù hỏng giữ bản ghi», «hoàn tác ô: chạy lệnh bù».

### Task 3: Hoàn tác và ghi lô (`bulk/hoan-tac-lo.ts`, `bulk/lo.ts`) — phục vụ E1, E2, E4, E5 · independent: false
- `chayHoanTacLo(b, phienBan, sua, nhanCua)` → thông báo, bản ghi lô mới, id tích lại; `chayGhiLo`.
- [ ] Ca E1, E2 (gồm bảng năm loại lỗi), E5 «mọi căn về như cũ».

### Task 4: Nối màn (`tren-o.tsx`, `thanh.tsx`) — phục vụ E4, E6, E7 · independent: false
- [ ] `ghiAnToan(useSuaHang())`; thông báo theo kết quả hàm điều phối; tích lại căn chưa về.
- [ ] `/verify`, commit, `implemented`.
