# Kế hoạch — nhap-loi-tat-dinh (hàng 64)

Thiết kế: `docs/superpowers/specs/2026-11-03-nhap-loi-tat-dinh-design.md` · Hợp đồng: `_acceptance/nhap-loi-tat-dinh/contract.md`.
Verify mỗi việc: `npm test -w @quy-hang/core` + `npm run typecheck -w @quy-hang/core`; cuối: `npm run lint`. Mọi việc
`independent: false` — cùng một gói, nối tiếp nhau, chạy tuần tự ở vòng chính.

| # | Việc | Tệp | Phục vụ |
| --- | --- | --- | --- |
| 1 | Trường chuẩn, từ điển giá trị, thực đơn phép biến đổi, bộ chuẩn hoá một cửa + ma trận test từng phép | `src/import/{fields,dictionaries,transforms,normalize}.ts`, `transforms.test.ts`, `normalize.test.ts` | E5, E7 |
| 2 | Bộ dò dữ liệu cá nhân, giải mã byte, đọc csv, đọc bảng (tiêu đề, hai tầng, dòng trống, dòng tổng) | `src/import/{detect,grid}.ts`, `grid.test.ts` | E1 |
| 3 | Từ điển tiêu đề, phân loại cột, hồ sơ cột | `src/import/{headers,classify,profile}.ts`, `classify.test.ts`, `profile.test.ts` | E2, E3 |
| 4 | Kế hoạch (khuôn chặt), ghép tất định, áp kế hoạch (bốn dấu, danh mục, trùng mã) | `src/import/{plan,apply,index}.ts`, `plan.test.ts`, `apply.test.ts` | E4, E6, E7 |
| 5 | Bộ thử: bộ đọc xlsx chỉ-để-thử, bộ sinh sáu file bẩn có đáp án, bộ đo bốn số, lệnh ghi `so-nen.json` | `test/import/*.ts`, `src/import/bo-thu.test.ts` | E4, E8, E9 |
| 6 | Bộ quét «không I/O» + ca hai chiều | `test/import/quet-thuan.ts`, `src/import/thuan.test.ts` | E10 |
| 7 | Ghi số nền, mục Đối chiếu ngành cho nhập file | `_acceptance/nhap-loi-tat-dinh/so-nen.json`, `docs/product/doi-chieu-nganh.md` | E9 |

Mỗi phép đo mới đi kèm cặp hai chiều trên cùng dữ liệu (đối chứng dương + lượt phá có thông điệp ghim); lượt phá chạy
một lần trên bản sao rồi hoàn lại, ghi vào báo cáo của việc.
