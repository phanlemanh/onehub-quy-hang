# Kế hoạch — va-san-sang-ban

Hợp đồng: `_acceptance/va-san-sang-ban/contract.md` (duyệt 02/11). Một luồng tuần tự, ba tệp mã và một tệp kiểm.

## T1 — Phần thuần (`units/ready/san-sang.ts`) · phục vụ E3, E4, E5 · independent: false

- `bamSanSang`: trạng thái `thieu` mang `soAnh` đã đếm; `gui` trả `{ ok: true } | { ok: false; loi: LoiTrenMay }`;
  `ok: false` → `{ kind: "loi", chu: moTaLoi(loi) }`; `gui` ném → `{ kind: "loi", chu: moTaLoi({ kind: "kho" }) }`.
- `thieuHienTai(tt, hang)`: `thieu` → `kiemSanSang(hang, tt.soAnh).thieu`, khác → `[]`.
- `dauCuaCan(ketQua, canId)`: `{ id, dich }` → `dich` khi `id === canId`, khác → `[]`.
- `CHU_ANH_CAP_NHAT = "Ảnh thật cập nhật khi bấm lại"`.
- Verify: `npm test -w @quy-hang/web`.

## T2 — Nút (`units/ready/nut-san-sang.tsx`) · phục vụ E2, E3, E4 · independent: false

- Danh sách vẽ từ `thieuHienTai(tt, hang)`; `useEffect` báo `onThieu(dich)` khi chuỗi dich đổi, hàm dọn báo `onThieu([])`.
- `loi` → `TrangThai kind="error"` ở chỗ danh sách; nút chỉ mờ theo mạng và lúc đang bấm.
- Dòng «Ảnh thật cập nhật khi bấm lại» dưới danh sách khi danh sách có «Ảnh thật».

## T3 — Cột hồ sơ (`units/ho-so/cot-ho-so.tsx`) · phục vụ E1, E2 · independent: false

- State `{ id, dich } | null`; `NutSanSang key={can.id}` báo `(d) => setThieu({ id: can.id, dich: d })`; dấu đọc qua
  `dauCuaCan(thieu, can.id)`.

## T4 — Bài kiểm (`units/ready/san-sang.test.ts`) · E1–E5

- Sửa E6/E10 cũ cho `gui` trả `{ ok: true }`; thêm ca E1–E5 theo `evals.yaml`, mỗi ca có chiều đỏ đã phá thử.
- Verify: `npm run typecheck && npm run lint && npm test -w @quy-hang/web`.
