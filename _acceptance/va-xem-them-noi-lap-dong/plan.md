# Kế hoạch: va-xem-them-noi-lap-dong

Đặt trong hồ sơ vì `docs/**` nằm ngoài vùng của hàng. T2: không có Gate 1.5.

| Việc | Tệp | Kiểm từng việc | Phục vụ | Độc lập |
|---|---|---|---|---|
| T1 · Luật thuần `trangTuMayChu`, `trangKhiKhongDoc` | `apps/web/src/app/(app)/contacts/xem-them.ts` | `npm test -w @quy-hang/web` + phá thử nhánh «không trang mới» (đỏ đúng câu ghim) | E1, E2 | không (T2, T3 dùng) |
| T2 · Bài kiểm: bảng ca luật mới + bộ phát lại bốn ca, luật cũ làm đối chứng | `apps/web/src/app/(app)/contacts/xem-them.test.ts` | như T1; năm ca cũ vẫn xanh | E1, E2 | không |
| T3 · Màn: trang cuối khởi đầu từ trang máy chủ, nhánh không đọc lại qua luật mới, một hàm đặt trang cuối | `apps/web/src/app/(app)/contacts/vung.tsx` | `npm run typecheck -w @quy-hang/web`, eslint tệp | E3, E4, E5, E6 | không |

Thứ tự T1 → T2 → T3, tuần tự trong vòng chính (ba việc chạm cùng một luật).
