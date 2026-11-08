# Kế hoạch — link lần rao trong hồ sơ hàng không toà

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Bấm lần rao trong hồ sơ căn lô, căn ngoài khu vẫn đúng hồ sơ | `units/ho-so/mo-hinh.ts` | AC-1 (link theo hàng), AC-3 (trên màn) |

Một việc: `moHinhHoSo` dựng link theo hàng cho hàng không toà; bài kiểm `lan-rao-khong-toa.test.ts`; chỗ thử `thu/`. Verify: `npm test -w @quy-hang/web`. Phục vụ E1–E4. independent: false.
