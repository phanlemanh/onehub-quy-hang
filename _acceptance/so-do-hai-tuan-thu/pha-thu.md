# Phá thử — cặp hai chiều của các phép đo mới (S3)

Mỗi lượt sửa một chỗ của mã thật (bản sao hoàn lại sau lượt), chạy `node --import tsx --test src/metrics/so-do.test.ts` ở
`packages/core`. Mã lành: 17/17 ok.

| Lượt | Phá gì | Ca đỏ |
| --- | --- | --- |
| M1 | `ageDays < n` → `<= n` (hang.ts) | xác nhận trong N ngày: ranh 14 ngày · bộ mẫu hàng 5: số ghim |
| M2 | đủ = `filled >= 4` (hang.ts) | mức đủ cao nhất: chỉ hàng đủ năm mục |
| M3 | «nhiều căn» tính là tự điền (hang.ts) | mã tự điền: tra bằng lookupUnit của lõi |
| M4 | bỏ lọc căn trùng khỏi lead cần gọi (lead.ts) | lead → cuộc gọi đầu: thời lượng và trung vị · bộ mẫu hàng 5: số ghim |
| M5 | bỏ lọc kỳ ở lead trùng (lead.ts) | lead trùng bị chặn: tách căn và chủ |
| M6 | xét nhóm trên trạng thái sau sự kiện (hang.ts) | đợt hai: căn ở nhóm điều chỉnh giá lúc gọi |
| M7 | `sheet_publishes` trả số 0 (so-do.ts) | chưa có sự kiện: sáu mã nói rõ thiếu gì |
| M8 | bộ chuyển bỏ lệnh giá (mau.fixture.ts) | mức đủ cao nhất: chỉ hàng đủ năm mục · bộ mẫu hàng 5: số ghim · bộ mẫu: bộ chuyển theo bộ nạp |
| M9 | kỳ đóng `<= den` (hang.ts) | lead trùng bị chặn: tách căn và chủ · kỳ đo: nửa mở và gấp tới den |

M6 lần đầu không đỏ vì lượt phá đặt sai chỗ (gấp sự kiện sau khi đã xét nhóm — không đổi hành vi); phá lại đúng chỗ thì đỏ.
Ca E1 và E9 «bộ chuyển theo bộ nạp» mang chiều đỏ ngay trong ca (bản sao danh sách sai, bản sao nguồn bộ nạp thêm lệnh).
