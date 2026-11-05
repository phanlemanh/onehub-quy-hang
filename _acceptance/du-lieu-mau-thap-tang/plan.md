# Kế hoạch thi công — du-lieu-mau-thap-tang (hàng 73)

Hợp đồng đã duyệt 05/11 (Manh Phan). Mọi tệp trong vùng `packages/db/seed/**` và
`packages/db/tests/du-lieu-mau-thap-tang.test.mjs`. Thi công tuần tự (các bước dựng trên nhau).

| # | Việc | Tệp | Kiểm từng bước | Phục vụ | independent |
| --- | --- | --- | --- | --- | --- |
| 1 | Bảng trích đơn vị hành chính: một tỉnh, bốn phường mới, mười phường cũ Quận 1 cũ, phường cũ → phường mới nhận, nguồn và ngày | `seed/don-vi-hanh-chinh-mau.mjs` | `node -e` nạp bảng, đếm 1/4/10, ba phường cũ tách | E2 | false |
| 2 | Bộ sinh tất định: khu → dãy → lô (năm dãy, ba loại hình), căn ngoài khu có địa chỉ chuẩn, bộ địa chỉ thử tám kiểu kèm đáp án, chủ nhà, hàng (sáu trạng thái, bốn loại hình — căn hộ trên danh mục hàng 5), bảy ca lead, hai đầu chủ và hai vùng; hàm kiểm thuần trả lỗi có tên | `seed/du-lieu-mau-thap-tang.mjs` (+ `.d.mts`) | sinh hai lần trong một tiến trình bằng nhau; mọi hàm kiểm trả rỗng trên vật lành | E3, E4, E5, E7, E8 | false |
| 3 | File bẩn + đáp án: dòng tiêu đề sàn, cột kiểu sàn, lỗi cấy theo danh sách viết trước, đáp án dòng tiêu đề · đích từng cột · giá trị đúng từng ô · lỗi cấy; ghi bằng bộ ghi xlsx sẵn có | `seed/file-thap-tang.mjs` (+ `.d.mts`) | đọc lại bằng `doc-xlsx.py` khớp dòng sinh | E6 | false |
| 4 | Lệnh sinh `--ra`, `--hat`, `--kiem`; ghi ba tệp vào `seed/mau-thap-tang/` | `seed/sinh-thap-tang.mjs`, `seed/mau-thap-tang/*` | `--kiem` thoát 0 | E1 | false |
| 5 | Bộ nạp vào «[Mẫu] Sàn thử» (hai đầu chủ, hai vùng, phân vùng), chạy lại không đổi; xoá bằng lệnh xoá của hàng 5 | `seed/nap-thap-tang.mjs` | nạp hai lần trên Postgres dãy X (5576) rồi `nap.mjs --xoa` | E9 | false |
| 6 | Bài kiểm chín ca «AC-1 … AC-9», mỗi ca đối chứng dương + phá thử trên bản sao với thông điệp ghim; file Excel đọc bằng `doc-xlsx.py` | `packages/db/tests/du-lieu-mau-thap-tang.test.mjs` | `npm run test:isolation -w @quy-hang/db` với DATABASE_URL tới 5576; từng phá thử đỏ đúng thông điệp | E1–E9 | false |
| 7 | README của thư mục mẫu: bảng tệp, lệnh sinh, nạp, xoá | `seed/README.md` | `npm run typecheck && npm run lint` | — | false |

Lựa chọn chịu lực: căn hộ của bộ này đọc thẳng `mau/du-lieu-mau.json` của hàng 5 lúc sinh (không chép), nên hàng 5 sinh
lại thì `--kiem` của bộ này đỏ và phải sinh lại — có chủ đích.
