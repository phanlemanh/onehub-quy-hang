# Kế hoạch thi công — hom-nay-dau-chu-dien-thoai (hàng 39, T2)

Hồ sơ: `contract.md` (duyệt 05/11), `design.md`, `evals.yaml`. Mọi tệp mới ở `apps/web/src/app/(app)/today/mobile/`.

| # | Việc | Tệp | Kiểm từng việc | Phục vụ | independent |
|---|---|---|---|---|---|
| 1 | Hàm thuần: rẽ khổ, bảng nút điện thoại, bộ kết quả của ngăn, chạy gọi một chạm (mở số → tel → mở ngăn, dùng lại số), nhớ ngăn trên máy | `mobile/goi.ts`, `mobile/mo-so-chu.ts`, `mobile/goi.test.ts` | `npm test -w @quy-hang/web` | E1, E3, E4, E5 | false |
| 2 | Thẻ hai tầng, ngăn ⋯, ngăn «Kết quả cuộc gọi», danh sách thẻ theo nhóm, ba trạng thái | `mobile/the-viec.tsx`, `mobile/ngan-ket-qua.tsx`, `mobile/danh-sach.tsx`, `mobile/the-viec.test.ts` | `npm test -w @quy-hang/web` + typecheck | E1, E2, E5, E6, E7 | false |
| 3 | Nối vào Hôm nay: dưới 768 px dựng danh sách thẻ thay lưới; xuất các hàm chữ dùng chung | `today/hom-nay-dau-chu.tsx` | typecheck + lint | E1, E8 | false |
| 4 | Khuôn: luật bản điện thoại trong `design/patterns/hom-nay-dau-chu.md` | `design/patterns/hom-nay-dau-chu.md` | `npm run lint` (bài quét khuôn) | E9 | true |
| 5 | Chỗ thử màn thật dãy H: dựng ≥10 việc mẫu, kịch bản chụp 375 và 1440 | `_acceptance/hom-nay-dau-chu-dien-thoai/thu/` | chạy thử một lần | E8 | false |

Thứ tự 1 → 2 → 3 → 4 → 5, làm tuần tự trong phiên chính.
