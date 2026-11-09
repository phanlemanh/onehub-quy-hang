# Vá bốn lỗi làm mất việc ở Cài đặt — kế hoạch

**Spec:** `docs/superpowers/specs/2026-11-09-va-cai-dat-mat-viec-design.md` · T2, một người làm tuần tự.

| Việc | Tệp | Phục vụ | `independent` | Kiểm |
|---|---|---|---|---|
| Lệnh đo trên màn thật, đo mã trước sửa | `_acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs`, `evidence/truoc-sua.log` | E1–E4, E5b, E6–E9 | false | lệnh đo đỏ đúng bốn lỗi |
| Bỏ cờ của hộp gỡ nhãn | `settings/statuses/trang-thai.tsx` | E1–E3 | true | ca giu-nhan, huy-nhieu-lan, chuyen-hai |
| Hộp xoá theo kết quả | `settings/templates/mau-nhap.ts`, `mau-nhap.test.ts`, `vung-mau-nhap.tsx` | E4, E5, E5b, E6 | true | `npm test -w @quy-hang/web`, ca xoa-hong |
| Bảng hai cột dưới `lg`, ngắt chữ dài | `settings/templates/vung-mau-nhap.tsx` | E7, E8, E10 | false | ca kho-375, kho-rong |
| Nhãn ô tỉ lệ | `settings/fees/bang-thue-phi.tsx` | E9 | true | ca nhan-ti-le |

Không đổi Tham chiếu: bốn chỗ sửa đưa màn về đúng điều đã chốt, không đổi điều đang đúng.
